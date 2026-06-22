import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// ============================================================================
// SDD Changelog Tool
// ============================================================================
//
// Escribe un changelog markdown estructurado por cada comando significativo
// (/fast, /loop, sprint de F2, fin de contrato). Cada entrada incluye:
//   - Prompt literal del usuario
//   - Diff stats (archivos tocados, lineas +/-)
//   - Costo y duracion de la sesion actual
//   - Output resumido (provisto por el agente o el bridge)
//   - Timestamp ISO + comando que lo origino
//
// Adicionalmente mantiene un INDEX.md con una linea por entrada para poder
// escanear toda la historia de un vistazo (alimenta el comando /cost).
// ============================================================================

const getRoot = (context: any): string => {
  if (context?.directory && context.directory !== "/") return context.directory
  if (context?.worktree && context.worktree !== "/") return context.worktree
  return process.cwd()
}

const getMetricsPath = (root: string) => path.resolve(root, ".openspec/.sdd_session_metrics.json")
const getStatePath = (root: string) => path.resolve(root, ".openspec/sdd_state.json")
const getChangelogDir = (root: string) => path.resolve(root, ".openspec/changelog")
const getIndexPath = (root: string) => path.resolve(root, ".openspec/changelog/INDEX.md")

const safeExec = (cmd: string, cwd: string): string | null => {
  try {
    return execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8" }).toString()
  } catch {
    return null
  }
}

const formatCost = (cost: number): string => {
  if (typeof cost !== "number" || !Number.isFinite(cost)) return "$0.00"
  if (cost < 0.001) return `$${cost.toFixed(5)}`
  if (cost < 1) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(3)}`
}

const formatDuration = (ms: number): string => {
  if (!ms || ms < 0) return "0s"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  if (seconds === 0) return `${minutes}m`
  return `${minutes}m ${seconds}s`
}

const formatInt = (n: number): string => {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0"
  return Math.round(n).toLocaleString("en-US")
}

const slugify = (s: string): string => {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    || "unnamed"
}

const readMetrics = (root: string): any => {
  const p = getMetricsPath(root)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"))
  } catch {
    return null
  }
}

const readState = (root: string): any => {
  const p = getStatePath(root)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"))
  } catch {
    return null
  }
}

const captureDiffStats = (root: string): any => {
  // Inline minimal version (no recursion into sdd_diff_capture to avoid tool-of-tool deps).
  const numstatOut = safeExec("git diff --numstat HEAD", root) || ""
  const nameStatusOut = safeExec("git diff --name-status HEAD", root) || ""
  const untrackedOut = safeExec("git ls-files --others --exclude-standard", root) || ""

  const statusMap = new Map<string, string>()
  for (const line of nameStatusOut.split("\n")) {
    const t = line.trim()
    if (!t) continue
    const parts = t.split("\t")
    if (parts.length < 2) continue
    statusMap.set(parts[parts.length - 1], parts[0].charAt(0))
  }

  const files: Array<{ path: string; status: string; added: number; removed: number; binary: boolean }> = []
  let totalAdded = 0
  let totalRemoved = 0

  for (const line of numstatOut.split("\n")) {
    const t = line.trim()
    if (!t) continue
    const parts = t.split("\t")
    if (parts.length < 3) continue
    const isBinary = parts[0] === "-" && parts[1] === "-"
    const added = isBinary ? 0 : parseInt(parts[0], 10) || 0
    const removed = isBinary ? 0 : parseInt(parts[1], 10) || 0
    const filePath = parts.slice(2).join("\t")
    files.push({ path: filePath, status: statusMap.get(filePath) || "M", added, removed, binary: isBinary })
    totalAdded += added
    totalRemoved += removed
  }

  for (const line of untrackedOut.split("\n")) {
    const p = line.trim()
    if (!p) continue
    let added = 0
    try {
      const content = fs.readFileSync(`${root}/${p}`, "utf8")
      added = content.split("\n").length
    } catch {
      added = 0
    }
    files.push({ path: p, status: "?", added, removed: 0, binary: false })
    totalAdded += added
  }

  return { files, totalAdded, totalRemoved, fileCount: files.length }
}

const buildMarkdown = (params: {
  command: string
  prompt: string
  outputSummary?: string
  metrics: any
  state: any
  diff: any
  timestamp: string
  closedAt?: string
}): string => {
  const { command, prompt, outputSummary, metrics, state, diff, timestamp, closedAt } = params

  const durationMs = metrics?.startedAt && closedAt
    ? Math.max(0, Date.parse(closedAt) - Date.parse(metrics.startedAt))
    : 0

  const totals = metrics?.totals || { cost: 0, tokensIn: 0, tokensOutput: 0, messages: 0 }
  const phase = state?.phase || "F0_DETECT"
  const contract = state?.activeContract || metrics?.contractName || "fast-track"

  let md = `# ${command} · ${timestamp}\n\n`

  md += `## Contexto\n`
  md += `- **Comando**: \`${command}\`\n`
  md += `- **Contrato**: \`${contract}\`\n`
  md += `- **Fase final**: \`${phase}\`\n`
  md += `- **Sesion**: \`${metrics?.sessionId || "n/a"}\`\n`
  md += `- **Duracion**: ${formatDuration(durationMs)}\n\n`

  md += `## Prompt\n`
  md += `> ${prompt.replace(/\n/g, "\n> ")}\n\n`

  md += `## Costo y tokens\n`
  md += `| Metrica | Valor |\n|---|---|\n`
  md += `| Costo total | ${formatCost(totals.cost)} |\n`
  md += `| Tokens entrada | ${formatInt(totals.tokensIn)} |\n`
  md += `| Tokens salida | ${formatInt(totals.tokensOutput)} |\n`
  md += `| Mensajes | ${formatInt(totals.messages)} |\n\n`

  if (metrics?.byAgent && Object.keys(metrics.byAgent).length > 0) {
    md += `### Desglose por agente\n`
    md += `| Agente | Costo | Tokens in | Tokens out | Mensajes |\n|---|---|---|---|---|\n`
    const sorted = Object.entries(metrics.byAgent).sort(
      (a: any, b: any) => (b[1].cost || 0) - (a[1].cost || 0)
    )
    for (const [agent, m] of sorted as any) {
      md += `| \`${agent}\` | ${formatCost(m.cost)} | ${formatInt(m.tokensIn)} | ${formatInt(m.tokensOutput)} | ${formatInt(m.messages)} |\n`
    }
    md += `\n`
  }

  md += `## Diff capturado\n`
  if (!diff || diff.fileCount === 0) {
    md += `_No se detectaron cambios en el working tree._\n\n`
  } else {
    md += `- **Archivos tocados**: ${diff.fileCount}\n`
    md += `- **Lineas agregadas**: +${formatInt(diff.totalAdded)}\n`
    md += `- **Lineas removidas**: -${formatInt(diff.totalRemoved)}\n\n`
    md += `| Archivo | Status | +/- |\n|---|---|---|\n`
    for (const f of diff.files.slice(0, 50)) {
      const diffStr = f.binary ? "(binario)" : `+${f.added} / -${f.removed}`
      const statusBadge = {
        A: "añadido",
        M: "modificado",
        D: "eliminado",
        R: "renombrado",
        C: "copiado",
        "?": "untracked",
      }[f.status as string] || f.status
      md += `| \`${f.path}\` | ${statusBadge} | ${diffStr} |\n`
    }
    if (diff.files.length > 50) {
      md += `| _... y ${diff.files.length - 50} archivos mas_ | | |\n`
    }
    md += `\n`
  }

  if (outputSummary && outputSummary.trim().length > 0) {
    md += `## Output del agente\n`
    md += `${outputSummary.trim()}\n\n`
  }

  md += `---\n`
  md += `_Changelog autogenerado por sdd_changelog el ${timestamp}._\n`

  return md
}

const appendToIndex = (indexPath: string, entry: { file: string; command: string; timestamp: string; cost: number; files: number; linesAdded: number; linesRemoved: number }) => {
  let content = "# SDD Changelog Index\n\n"
  content += "Lista cronologica (mas reciente primero) de todos los comandos que dejaron rastro.\n\n"
  content += "| Timestamp | Comando | Costo | Archivos | +/- |\n|---|---|---|---|---|\n"

  const newLine = `| ${entry.timestamp} | [${entry.command}](./${path.basename(entry.file)}) | ${formatCost(entry.cost)} | ${entry.files} | +${formatInt(entry.linesAdded)} / -${formatInt(entry.linesRemoved)} |`

  let existingLines: string[] = []
  if (fs.existsSync(indexPath)) {
    const current = fs.readFileSync(indexPath, "utf8")
    const lines = current.split("\n")
    // Strip header (keep header + table header)
    const headerEnd = lines.findIndex((l) => l.startsWith("|---"))
    if (headerEnd > 0 && lines[headerEnd + 1]) {
      existingLines = lines.slice(headerEnd + 1).filter((l) => l.trim().startsWith("|"))
    }
  }

  const updated = [newLine, ...existingLines].slice(0, 200) // cap at 200 entries
  fs.writeFileSync(indexPath, content + updated.join("\n") + "\n", "utf8")
}

export const write_changelog = tool({
  description:
    "Escribe un changelog markdown estructurado en .openspec/changelog/<command>-<timestamp>.md " +
    "con prompt, diff stats, costo y duracion de la sesion actual. Tambien actualiza " +
    ".openspec/changelog/INDEX.md con una linea resumen. Usado por el hook del sdd-bridge " +
    "en transiciones de fase y por comandos /fast, /loop al finalizar.",
  args: {
    command: tool.schema
      .string()
      .describe("Nombre del comando que origina el changelog (ej: 'fast', 'loop', 'sprint-1', 'fast-track')."),
    prompt: tool.schema
      .string()
      .describe("Prompt literal que el usuario escribio para este comando."),
    outputSummary: tool.schema
      .string()
      .optional()
      .describe("Resumen corto (3-5 lineas) del output del subagente. Opcional pero recomendado."),
    closedAt: tool.schema
      .string()
      .optional()
      .describe("ISO timestamp de cierre del comando. Default: ahora."),
  },
  async execute(args, context) {
    const root = getRoot(context)
    const command = slugify(args.command || "unnamed")
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
    const closedAt = args.closedAt || timestamp

    const metrics = readMetrics(root)
    const state = readState(root)
    const diff = captureDiffStats(root)

    const filename = `${command}-${timestamp.replace(/[:.]/g, "-")}.md`
    const changelogDir = getChangelogDir(root)
    if (!fs.existsSync(changelogDir)) fs.mkdirSync(changelogDir, { recursive: true })

    const filepath = path.join(changelogDir, filename)
    const markdown = buildMarkdown({
      command: args.command,
      prompt: args.prompt || "(sin prompt registrado)",
      outputSummary: args.outputSummary,
      metrics,
      state,
      diff,
      timestamp,
      closedAt,
    })

    try {
      fs.writeFileSync(filepath, markdown, "utf8")
    } catch (e: any) {
      return JSON.stringify(
        {
          status: "ERROR",
          message: `No se pudo escribir el changelog: ${e?.message || "unknown"}`,
          path: filepath,
        },
        null,
        2
      )
    }

    try {
      appendToIndex(getIndexPath(root), {
        file: filename,
        command: args.command,
        timestamp,
        cost: metrics?.totals?.cost || 0,
        files: diff.fileCount,
        linesAdded: diff.totalAdded,
        linesRemoved: diff.totalRemoved,
      })
    } catch {
      // index failure is non-blocking
    }

    return JSON.stringify(
      {
        status: "SUCCESS",
        path: filepath,
        filename,
        command: args.command,
        timestamp,
        summary: {
          cost: metrics?.totals?.cost || 0,
          filesChanged: diff.fileCount,
          linesAdded: diff.totalAdded,
          linesRemoved: diff.totalRemoved,
          messages: metrics?.totals?.messages || 0,
        },
        relativePath: `.openspec/changelog/${filename}`,
      },
      null,
      2
    )
  }
})