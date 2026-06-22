import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"

// ============================================================================
// SDD Diff Capture Tool
// ============================================================================
//
// Captura estadisticas de `git diff` (numstat + name-status) para alimentar el
// changelog granular de cada comando /fast, /loop, o sprint de F2. Se mantiene
// como tool independiente (no embebida en sdd-bridge.ts) para que sea
// reutilizable desde agentes, desde el hook del bridge y desde /cost.
//
// Comportamiento:
//   - Si no hay repo git, devuelve { available: false } sin crashear.
//   - Si hay cambios sin commitear, los captura contra HEAD (default).
//   - Si se pasa `since`, compara ese ref contra HEAD.
//   - Maneja archivos binarios y renames de forma best-effort.
// ============================================================================

const getRoot = (context: any): string => {
  if (context?.directory && context.directory !== "/") return context.directory
  if (context?.worktree && context.worktree !== "/") return context.worktree
  return process.cwd()
}

const safeExec = (cmd: string, cwd: string): string | null => {
  try {
    return execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8" }).toString()
  } catch {
    return null
  }
}

const isGitRepo = (cwd: string): boolean => {
  const out = safeExec("git rev-parse --is-inside-work-tree", cwd)
  return out?.trim() === "true"
}

export const capture_diff = tool({
  description:
    "Captura estadisticas de git diff (archivos tocados, lineas agregadas/removidas, " +
    "renames). Usado por /fast, /loop y el hook del sdd-bridge para alimentar el " +
    "changelog granular. Si no hay repo git, devuelve { available: false } sin error.",
  args: {
    since: tool.schema
      .string()
      .optional()
      .describe("Ref base para comparar (ej: 'HEAD~1', commit hash, branch). Default: HEAD (cambios sin commitear)."),
    until: tool.schema
      .string()
      .optional()
      .describe("Ref final para comparar. Default: working tree (incluye uncommitted)."),
    pathspec: tool.schema
      .string()
      .optional()
      .describe("Filtro opcional tipo git pathspec (ej: 'src/' para limitar a src/)."),
  },
  async execute(args, context) {
    const root = getRoot(context)

    if (!isGitRepo(root)) {
      return JSON.stringify(
        {
          status: "NO_GIT",
          available: false,
          message: "No se detecto un repositorio git en la raiz del proyecto.",
          files: [],
          totalAdded: 0,
          totalRemoved: 0,
        },
        null,
        2
      )
    }

    const since = args.since?.trim() || "HEAD"
    const until = args.until?.trim() || ""
    const pathspec = args.pathspec?.trim() || ""

    // Build range. Format: <since>..<until> (if until) or <since> (diff vs working tree)
    const range = until ? `${since}..${until}` : since
    const pathArg = pathspec ? `-- '${pathspec.replace(/'/g, "'\\''")}'` : ""

    // 1. numstat: lines added/removed per file (binary shows as -\t-)
    const numstatCmd = `git diff --numstat ${range}${pathArg}`
    const numstatOut = safeExec(numstatCmd, root) || ""

    // 2. name-status: A=added, M=modified, D=deleted, R=renamed, C=copied
    const nameStatusCmd = `git diff --name-status ${range}${pathArg}`
    const nameStatusOut = safeExec(nameStatusCmd, root) || ""

    const files: Array<{
      path: string
      status: string
      added: number
      removed: number
      binary: boolean
    }> = []

    let totalAdded = 0
    let totalRemoved = 0
    let binaryCount = 0

    // Parse name-status first (gives status including R/C codes)
    const statusMap = new Map<string, string>()
    for (const line of nameStatusOut.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const parts = trimmed.split("\t")
      if (parts.length < 2) continue
      const status = parts[0]
      const path = parts[parts.length - 1] // for renames, last col is the new path
      statusMap.set(path, status.charAt(0)) // R100 -> R, C075 -> C
    }

    // Parse numstat
    for (const line of numstatOut.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const parts = trimmed.split("\t")
      if (parts.length < 3) continue
      const addedStr = parts[0]
      const removedStr = parts[1]
      const path = parts.slice(2).join("\t") // paths with spaces may have been joined

      const isBinary = addedStr === "-" && removedStr === "-"
      const added = isBinary ? 0 : parseInt(addedStr, 10) || 0
      const removed = isBinary ? 0 : parseInt(removedStr, 10) || 0

      const status = statusMap.get(path) || (isBinary ? "M" : "M")

      files.push({
        path,
        status,
        added,
        removed,
        binary: isBinary,
      })

      totalAdded += added
      totalRemoved += removed
      if (isBinary) binaryCount++
    }

    // 3. Detect untracked files (only when diffing vs HEAD with no until)
    let untrackedCount = 0
    if (!args.until) {
      const untrackedOut = safeExec("git ls-files --others --exclude-standard", root) || ""
      for (const line of untrackedOut.split("\n")) {
        const p = line.trim()
        if (!p) continue
        if (pathspec && !p.startsWith(pathspec.replace(/\/$/, ""))) continue
        // Count lines for untracked files (best-effort)
        let added = 0
        try {
          const absPath = `${root}/${p}`
          const content = require("fs").readFileSync(absPath, "utf8")
          added = content.split("\n").length
        } catch {
          added = 0
        }
        files.push({
          path: p,
          status: "?",
          added,
          removed: 0,
          binary: false,
        })
        totalAdded += added
        untrackedCount++
      }
    }

    // 4. Staged changes if comparing against HEAD (working tree may have staged)
    let stagedOnly = false
    if (!args.until) {
      const stagedOut = safeExec("git diff --cached --numstat", root) || ""
      if (stagedOut.trim()) stagedOnly = true
    }

    return JSON.stringify(
      {
        status: "SUCCESS",
        available: true,
        range: { since, until: until || "working-tree" },
        pathspec: pathspec || null,
        files,
        totalAdded,
        totalRemoved,
        fileCount: files.length,
        binaryCount,
        untrackedCount,
        stagedOnly,
        capturedAt: new Date().toISOString(),
      },
      null,
      2
    )
  }
})