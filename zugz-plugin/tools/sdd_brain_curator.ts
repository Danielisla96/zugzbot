import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const MAX_ENTRIES = 40
const BRAIN_FILE = ".openspec/brain.md"

interface BrainEntry {
  id: string
  category: string
  tag: string
  problem: string
  solution: string
  date: string
}

function readEntries(brainPath: string): BrainEntry[] {
  if (!fs.existsSync(brainPath)) return []
  const content = fs.readFileSync(brainPath, "utf-8")
  const leccionesIdx = content.indexOf("## Lecciones")
  const leccionesContent = leccionesIdx >= 0 ? content.substring(leccionesIdx) : content
  return parseEntries(leccionesContent)
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

    let category = "", problem = "", solution = "", date = ""
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
      entries.push({ id, category, tag, problem, solution, date })
    }
  }
  return entries
}

function isLowValue(entry: BrainEntry): boolean {
  const trivial = /\b(typo|test|move file|rename|fix simple|bump|trivial)\b/i
  if (trivial.test(entry.tag) || trivial.test(entry.problem)) return true
  if (entry.problem.length < 20) return true
  if (entry.solution.length < 30) return true
  return false
}

function findDuplicates(entries: BrainEntry[]): Array<{ keep: string; dup: string; reason: string }> {
  const dups: Array<{ keep: string; dup: string; reason: string }> = []
  const seen = new Map<string, BrainEntry>()
  for (const e of entries) {
    const key = `${e.category}::${e.problem.toLowerCase().slice(0, 40)}`
    if (seen.has(key)) {
      const prev = seen.get(key)!
      dups.push({
        keep: prev.id,
        dup: e.id,
        reason: `Mismo problema en ${prev.tag} y ${e.tag}`
      })
    } else {
      seen.set(key, e)
    }
  }
  return dups
}

export default tool({
  description: `Curador del cerebro del proyecto. Identifica entradas duplicadas, de bajo valor, o caducas, y opcionalmente las archiva.
  
  Acciones:
  - "analyze": Analiza brain.md y emite reporte de calidad (sin modificar).
  - "deduplicate": Sugiere merges de duplicados (dry-run por defecto).
  - "prune": Mueve entradas de bajo valor a un archivo .archive.md (soft delete).
  - "stats": Estadísticas del cerebro (categorías, distribución, tendencias).

  Esta herramienta es SRP y NO compite con sdd_brain_sync (que añade entradas). Su rol es la calidad.`,
  args: {
    action: tool.schema.enum(["analyze", "deduplicate", "prune", "stats"])
      .describe("Acción a ejecutar"),
    confirm: tool.schema.boolean().optional().default(false)
      .describe("Confirmación explícita para acciones mutables (prune)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const brainPath = path.join(projectRoot, BRAIN_FILE)

    if (!fs.existsSync(brainPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No existe ${BRAIN_FILE}. Ejecuta sdd_brain_sync action=init primero.`
      }, null, 2)
    }

    const entries = readEntries(brainPath)

    if (args.action === "stats") {
      const byCategory: Record<string, number> = {}
      for (const e of entries) {
        const c = e.category || "general"
        byCategory[c] = (byCategory[c] || 0) + 1
      }
      return JSON.stringify({
        status: "SUCCESS",
        total_entries: entries.length,
        by_category: byCategory,
        max_recommended: MAX_ENTRIES,
        overflow: entries.length > MAX_ENTRIES
      }, null, 2)
    }

    if (args.action === "analyze") {
      const dups = findDuplicates(entries)
      const lowValue = entries.filter(isLowValue)
      return JSON.stringify({
        status: "SUCCESS",
        total: entries.length,
        duplicates: dups.length,
        low_value: lowValue.length,
        duplicate_pairs: dups,
        low_value_entries: lowValue.map(e => ({ id: e.id, tag: e.tag, problem: e.problem.slice(0, 60) })),
        recommendations: dups.length > 0 || lowValue.length > 0
          ? ["Ejecuta 'prune' para limpiar entradas de bajo valor", "Ejecuta 'deduplicate' para fusionar duplicados"]
          : ["Cerebro limpio. No se requiere acción."]
      }, null, 2)
    }

    if (args.action === "deduplicate") {
      const dups = findDuplicates(entries)
      return JSON.stringify({
        status: "SUCCESS",
        duplicates_found: dups.length,
        pairs: dups,
        action_required: dups.length > 0
          ? "Para fusionar duplicados, ejecuta sdd_brain_sync con action=remove sobre los IDs listados en 'dup'."
          : "No hay duplicados para fusionar."
      }, null, 2)
    }

    if (args.action === "prune") {
      if (!args.confirm) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Se requiere confirm=true para podar el cerebro."
        }, null, 2)
      }
      const lowValue = entries.filter(isLowValue)
      const archivePath = path.join(projectRoot, BRAIN_FILE.replace(".md", ".archive.md"))
      const archiveLines: string[] = [`# 🧠 Brain Archive\n\n> Entradas podadas por baja calidad o trivialidad.\n`]
      for (const e of lowValue) {
        archiveLines.push(`### ${e.id}: ${e.tag}\n- **Categoría**: ${e.category}\n- **Problema**: ${e.problem}\n- **Solución**: ${e.solution}\n- **Fecha archivado**: ${new Date().toISOString().split("T")[0]}\n`)
      }
      fs.writeFileSync(archivePath, archiveLines.join("\n"), "utf-8")
      return JSON.stringify({
        status: "SUCCESS",
        pruned_count: lowValue.length,
        archive_file: path.relative(projectRoot, archivePath)
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
