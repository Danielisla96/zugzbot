import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import sddInstallAutoskills from "./sdd_install_autoskills"

// Estructuras de brain.md idénticas a sdd_brain_sync
interface BrainEntry {
  id: string
  category: string
  tag: string
  problem: string
  solution: string
  date: string
}

function today(): string {
  return new Date().toISOString().split("T")[0]
}

function nextId(entries: BrainEntry[]): string {
  let max = 0
  for (const e of entries) {
    const num = parseInt(e.id.substring(1), 10)
    if (!isNaN(num) && num > max) max = num
  }
  return `L${String(max + 1).padStart(3, "0")}`
}

function parseEntries(content: string): BrainEntry[] {
  const entries: BrainEntry[] = []
  const blocks = content.split("\n### ")
  for (const block of blocks) {
    if (!block.trim()) continue
    const lines = block.split("\n")
    const header = lines[0].trim()
    const colonIdx = header.indexOf(": ")
    if (colonIdx === -1) continue
    const id = header.substring(0, colonIdx).trim()
    if (!id || !/^L\d{3}$/.test(id)) continue
    const tag = header.substring(colonIdx + 2).trim()
    if (!tag) continue

    let category = ""
    let problem = ""
    let solution = ""
    let date = ""

    for (const line of lines) {
      const t = line.trim()
      if (t.startsWith("- **Tags**:")) {
        const m = t.match(/#(\w+)/)
        if (m) category = m[1]
      } else if (t.startsWith("- **Problema**:")) {
        problem = t.substring("- **Problema**: ".length).trim()
      } else if (t.startsWith("- **Solución**:")) {
        solution = t.substring("- **Solución**: ".length).trim()
      } else if (t.startsWith("- **Fecha**:")) {
        date = t.substring("- **Fecha**: ".length).trim()
      }
    }

    if (id && problem) {
      entries.push({ id, category, tag, problem, solution, date: date || today() })
    }
  }
  return entries
}

function buildIndex(entries: BrainEntry[]): string {
  if (entries.length === 0) return "_No hay lecciones registradas todavía._"
  const header = "| ID | Categoría | Tag | Problema |\n| :--- | :--- | :--- | :--- |\n"
  const rows = entries.map(e => {
    const problemTrunc = e.problem.length > 55 ? e.problem.slice(0, 52) + "..." : e.problem
    return `| ${e.id} | ${e.category || "-"} | ${e.tag} | ${problemTrunc} |`
  }).join("\n")
  return header + rows
}

function buildEntryBlock(e: BrainEntry): string {
  const tags = `#${e.category || "general"} #${e.tag.replace(/[-\s]/g, "_")}`
  return [
    `### ${e.id}: ${e.tag}`,
    `- **Tags**: ${tags}`,
    `- **Problema**: ${e.problem}`,
    `- **Solución**: ${e.solution}`,
    `- **Fecha**: ${e.date}`,
  ].join("\n") + "\n"
}

function buildFullBrain(entries: BrainEntry[]): string {
  return [
    "# 🧠 Cerebro del Proyecto",
    "",
    "> Base de conocimiento técnico a largo plazo. Solo registra aprendizajes de alto valor y no triviales.",
    "",
    "## Índice",
    "",
    buildIndex(entries),
    "",
    "## Lecciones",
    "",
    ...entries.map(buildEntryBlock)
  ].join("\n")
}

function bumpVersion(version: string, type: "major" | "minor" | "patch"): string {
  const parts = version.split(".").map(x => parseInt(x, 10))
  if (parts.length !== 3 || parts.some(isNaN)) return version
  if (type === "major") {
    parts[0]++
    parts[1] = 0
    parts[2] = 0
  } else if (type === "minor") {
    parts[1]++
    parts[2] = 0
  } else if (type === "patch") {
    parts[2]++
  }
  return parts.join(".")
}

function moveRecursive(src: string, dest: string) {
  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach(child => {
      moveRecursive(path.join(src, child), path.join(dest, child))
    })
    fs.rmdirSync(src)
  } else {
    fs.renameSync(src, dest)
  }
}

export default tool({
  description: "Cierra el ciclo SDD de forma atómica: realiza el bump SemVer, inyecta lecciones en el cerebro, documenta en CHANGELOG, archiva el directorio de cambios y realiza el commit de cierre de Git.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio activo (carpeta dentro de .openspec/changes/)"),
    commitMessage: tool.schema.string().describe("Mensaje de commit detallado y semántico (Conventional Commit)"),
    bumpType: tool.schema.enum(["patch", "minor", "major", "none"]).describe("Tipo de incremento de versión semántica"),
    category: tool.schema.string().optional().describe("Categoría del aprendizaje para el cerebro"),
    tag: tool.schema.string().optional().describe("Tag corto del aprendizaje para el cerebro"),
    problem: tool.schema.string().optional().describe("Problema resuelto (máx 120 caracteres)"),
    solution: tool.schema.string().optional().describe("Solución aplicada (máx 300 caracteres)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const changeDir = path.join(projectRoot, ".openspec/changes", args.changeName)

    if (!fs.existsSync(changeDir)) {
      return `[SDD Archive Error] No se encontró la carpeta del cambio activo en: ${changeDir}`
    }

    const report: string[] = ["━━━ sdd_archive_and_commit ━━━"]

    // 1. SemVer Bump en package.json
    let versionStr = "1.0.0"
    const pkgPath = path.join(projectRoot, "package.json")
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
        const oldVer = pkg.version || "1.0.0"
        if (args.bumpType && args.bumpType !== "none") {
          versionStr = bumpVersion(oldVer, args.bumpType)
          pkg.version = versionStr
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
          report.push(`✓ Versión incrementada en package.json: ${oldVer} → ${versionStr}`)
        } else {
          versionStr = oldVer
          report.push(`- Sin cambios en package.json (versión: ${versionStr})`)
        }
      } catch (e: any) {
        report.push(`⚠️ Error leyendo/escribiendo package.json: ${e.message}`)
      }
    }

    // 2. Escribir entrada en CHANGELOG.md
    const changelogPath = path.join(projectRoot, ".openspec/CHANGELOG.md")
    const dateStr = today()
    const changelogEntry = `### [${versionStr}] - ${dateStr}\n- ${args.commitMessage.split("\n")[0]}\n`
    if (fs.existsSync(changelogPath)) {
      try {
        let content = fs.readFileSync(changelogPath, "utf-8")
        const idx = content.indexOf("## ")
        if (idx !== -1) {
          content = content.slice(0, idx) + `## Historial de Versiones\n\n${changelogEntry}\n` + content.slice(idx + "## Historial de Versiones\n".length)
        } else {
          content = content + `\n${changelogEntry}`
        }
        fs.writeFileSync(changelogPath, content, "utf-8")
        report.push(`✓ Registrada versión en .openspec/CHANGELOG.md`)
      } catch (e: any) {
        report.push(`⚠️ Error escribiendo CHANGELOG.md: ${e.message}`)
      }
    } else {
      try {
        const content = `# 📝 CHANGELOG\n\n## Historial de Versiones\n\n${changelogEntry}`
        fs.writeFileSync(changelogPath, content, "utf-8")
        report.push(`✓ Inicializado e indexado .openspec/CHANGELOG.md`)
      } catch (e: any) {
        report.push(`⚠️ Error inicializando CHANGELOG.md: ${e.message}`)
      }
    }

    // 3. Sincronizar lección técnica con brain.md si se proveen datos
    if (args.category && args.tag && args.problem && args.solution) {
      const brainPath = path.join(projectRoot, ".openspec/brain.md")
      try {
        let entries: BrainEntry[] = []
        if (fs.existsSync(brainPath)) {
          const content = fs.readFileSync(brainPath, "utf-8")
          const leccionesIdx = content.indexOf("## Lecciones")
          const leccionesContent = leccionesIdx >= 0 ? content.substring(leccionesIdx) : content
          entries = parseEntries(leccionesContent)
        }

        const newEntry: BrainEntry = {
          id: nextId(entries),
          category: args.category,
          tag: args.tag,
          problem: args.problem,
          solution: args.solution,
          date: dateStr
        }
        entries.push(newEntry)
        fs.writeFileSync(brainPath, buildFullBrain(entries), "utf-8")
        report.push(`✓ Lección ${newEntry.id} inyectada con éxito en .openspec/brain.md`)
      } catch (e: any) {
        report.push(`⚠️ Error sincronizando cerebro: ${e.message}`)
      }
    }

    // 3.5. Sincronizar habilidades de IA (Autoskills) de forma automática
    try {
      report.push("▶ Buscando y sincronizando habilidades de IA nuevas en base a tus cambios...")
      const skillsOutputObj: any = await sddInstallAutoskills.execute({ dryRun: false }, context)
      const skillsOutputStr = typeof skillsOutputObj === "string" ? skillsOutputObj : (skillsOutputObj?.output || "")
      const shortSkillsOutput = skillsOutputStr
        .split("\n")
        .filter((l: string) => l.trim() && !l.startsWith("▶") && !l.startsWith("━━━"))
        .map((l: string) => `  ${l}`)
        .join("\n")
      report.push(`✓ Sincronización de Habilidades Finalizada:\n${shortSkillsOutput || "  No se encontraron nuevas habilidades que instalar."}`)
    } catch (e: any) {
      report.push(`⚠️ Sincronización automática de habilidades fallida o no disponible: ${e.message || e}`)
    }

    // 4. Escribir commit_message.txt
    const commitMsgPath = path.join(changeDir, "commit_message.txt")
    try {
      fs.writeFileSync(commitMsgPath, args.commitMessage + "\n", "utf-8")
      report.push(`✓ Archivo commit_message.txt generado`)
    } catch (e: any) {
      report.push(`⚠️ Error escribiendo commit_message.txt: ${e.message}`)
    }

    // 5. Archivar la carpeta físicamente
    const archiveDir = path.join(projectRoot, ".openspec/changes/archive", `${dateStr}-${args.changeName}`)
    try {
      if (fs.existsSync(archiveDir)) {
        fs.rmSync(archiveDir, { recursive: true, force: true })
      }
      fs.mkdirSync(path.dirname(archiveDir), { recursive: true })
      moveRecursive(changeDir, archiveDir)
      report.push(`✓ Carpeta archivada en: .openspec/changes/archive/${dateStr}-${args.changeName}/`)
    } catch (e: any) {
      return `[SDD Archive Error] Error crítico archivando carpetas: ${e.message}`
    }

    // 6. Resetear el lockfile a idle (Se hace ANTES del commit para incluirlo en el cierre)
    const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json")
    if (fs.existsSync(lockfilePath)) {
      try {
        const lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"))
        lockfile.active_phase = 0
        lockfile.active_subagent = "sdd-planner"
        lockfile.status = "idle"
        lockfile.last_updated = dateStr
        fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8")
        report.push(`✓ Lockfile .openspec/sdd-lock.json restablecido a 'idle'`)
      } catch (e: any) {
        report.push(`⚠️ No se pudo restablecer el lockfile: ${e.message}`)
      }
    }

    // 7. Confirmación Git Atómica (Incluye el lockfile reseteado)
    if (fs.existsSync(path.join(projectRoot, ".git"))) {
      try {
        execSync("git add .", { cwd: projectRoot, stdio: "ignore" })
        const archiveCommitMsgPath = path.join(archiveDir, "commit_message.txt")
        execSync(`git commit -F "${archiveCommitMsgPath}"`, { cwd: projectRoot, stdio: "ignore" })
        report.push(`✓ Commit de Git ejecutado usando el mensaje semántico de la carpeta archivada`)
      } catch (e: any) {
        report.push(`⚠️ Git Commit falló o no había cambios pendientes de código: ${e.message}`)
      }
    }

    report.push("━━━ finalizado con éxito absoluto ━━━")
    return report.join("\n")
  }
})
