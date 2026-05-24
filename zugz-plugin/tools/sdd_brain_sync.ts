import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const BRAIN_FILE = ".openspec/brain.md"
const BRAIN_SUBDIR = ".openspec/brain"
const MAX_ENTRIES = 40

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
  const lines: string[] = [
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
  ]
  for (const e of entries) {
    lines.push(buildEntryBlock(e))
  }
  return lines.join("\n")
}

function readBrainFile(brainPath: string): { entries: BrainEntry[] } {
  if (!fs.existsSync(brainPath)) {
    return { entries: [] }
  }
  const content = fs.readFileSync(brainPath, "utf-8")
  const leccionesIdx = content.indexOf("## Lecciones")
  const leccionesContent = leccionesIdx >= 0
    ? content.substring(leccionesIdx)
    : content
  const entries = parseEntries(leccionesContent)
  return { entries }
}

function writeBrainFile(brainPath: string, entries: BrainEntry[]) {
  fs.mkdirSync(path.dirname(brainPath), { recursive: true })
  fs.writeFileSync(brainPath, buildFullBrain(entries), "utf-8")
}

export default tool({
  description: `Gestiona el cerebro del proyecto (brain.md) con índice indexado, IDs auto-secuenciales y sharding automático.
  Cualquier agente (incluyendo al Orquestador Zugzbot y todos los subagentes) puede activar esta herramienta en cualquier fase para guardar aprendizajes técnicos valiosos.

  Acciones:
  - "init": Crea el archivo brain.md si no existe.
  - "add": Agrega una nueva lección técnica con formato estandarizado.
  - "list": Lista todas las entradas del cerebro.
  - "remove": Elimina una entrada por su ID (ej: L001).
  - "rebuild-index": Reconstruye el índice desde las entradas existentes.
  - "shard": Fragmenta en archivos por dominio (.openspec/brain/{category}.md).

  USO OBLIGATORIO: Se prohibe la edición directa de brain.md con write/edit. Usar siempre esta herramienta para interactuar con el cerebro.`,
  args: {
    action: tool.schema.enum(["init", "add", "list", "remove", "rebuild-index", "shard"])
      .describe("Acción a ejecutar"),
    category: tool.schema.string().optional()
      .describe("Categoría/dominio: frontend, backend, devops, architecture, css, tooling, testing"),
    tag: tool.schema.string().optional()
      .describe("Tag corto sin espacios (ej: tailwind-grid-fix, prisma-timezone-workaround)"),
    problem: tool.schema.string().optional()
      .describe("Descripción concisa del problema o bug (máx 120 caracteres)"),
    solution: tool.schema.string().optional()
      .describe("Descripción concisa de la solución (máx 300 caracteres)"),
    entryId: tool.schema.string().optional()
      .describe("ID de entrada a eliminar (ej: L001)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const brainPath = path.join(projectRoot, BRAIN_FILE)

    switch (args.action) {
      case "init": {
        if (fs.existsSync(brainPath)) {
          const { entries } = readBrainFile(brainPath)
          return `[Brain Sync] ✅ brain.md ya existe (${entries.length} entradas).`
        }
        writeBrainFile(brainPath, [])
        return `[Brain Sync] ✅ brain.md creado en .openspec/brain.md`
      }

      case "add": {
        if (!args.category || !args.tag || !args.problem || !args.solution) {
          return `[Brain Sync] ❌ Error: add requiere category, tag, problem, solution`
        }
        if (args.problem.length > 120) {
          return `[Brain Sync] ❌ Error: problem excede 120 caracteres (tiene ${args.problem.length})`
        }
        if (args.solution.length > 300) {
          return `[Brain Sync] ❌ Error: solution excede 300 caracteres (tiene ${args.solution.length})`
        }

        const { entries } = readBrainFile(brainPath)

        const dup = entries.find(e => e.tag === args.tag && e.problem === args.problem)
        if (dup) {
          return `[Brain Sync] ⚠️ Entrada duplicada: ${dup.id}:${dup.tag}. Se omite inserción.`
        }

        const newEntry: BrainEntry = {
          id: nextId(entries),
          category: args.category,
          tag: args.tag,
          problem: args.problem,
          solution: args.solution,
          date: today(),
        }
        entries.push(newEntry)
        writeBrainFile(brainPath, entries)

        if (entries.length > MAX_ENTRIES) {
          return `[Brain Sync] ✅ ${newEntry.id} añadida. ⚠️ Cerebro tiene ${entries.length} entradas. Ejecuta 'shard' para fragmentar.`
        }

        return `[Brain Sync] ✅ ${newEntry.id} añadida [${args.category}/${args.tag}]. Total: ${entries.length} entradas.`
      }

      case "list": {
        const { entries } = readBrainFile(brainPath)
        if (entries.length === 0) {
          return `[Brain Sync] 📭 No hay entradas en el cerebro.`
        }
        return `[Brain Sync] 📋 ${entries.length} entradas:\n` +
          entries.map(e =>
            `  ${e.id} | ${(e.category || "-").padEnd(10)} | ${e.tag.padEnd(22)} | ${e.problem.slice(0, 50)}`
          ).join("\n")
      }

      case "remove": {
        if (!args.entryId) {
          return `[Brain Sync] ❌ Error: remove requiere entryId`
        }
        const { entries } = readBrainFile(brainPath)
        const idx = entries.findIndex(e => e.id === args.entryId)
        if (idx === -1) {
          return `[Brain Sync] ❌ No se encontró entrada ${args.entryId}`
        }
        const removed = entries.splice(idx, 1)[0]
        writeBrainFile(brainPath, entries)
        return `[Brain Sync] ✅ ${removed.id}:${removed.tag} eliminada. Quedan ${entries.length}.`
      }

      case "rebuild-index": {
        const { entries } = readBrainFile(brainPath)
        writeBrainFile(brainPath, entries)
        return `[Brain Sync] ✅ Índice reconstruido. ${entries.length} entradas indexadas.`
      }

      case "shard": {
        const { entries } = readBrainFile(brainPath)
        if (entries.length === 0) {
          return `[Brain Sync] ⚠️ No hay entradas para fragmentar.`
        }

        const byCat = new Map<string, BrainEntry[]>()
        for (const e of entries) {
          const cat = e.category || "general"
          if (!byCat.has(cat)) byCat.set(cat, [])
          byCat.get(cat)!.push(e)
        }

        const brainSubdir = path.join(projectRoot, BRAIN_SUBDIR)
        fs.mkdirSync(brainSubdir, { recursive: true })
        for (const [cat, catEntries] of byCat) {
          writeBrainFile(path.join(brainSubdir, `${cat}.md`), catEntries)
        }

        const masterLines = [
          "# 🧠 Cerebro del Proyecto (Fragmentado)",
          "",
          "> Fragmentado por dominio para optimizar tokens de contexto.",
          "",
          "## Índice de Dominios",
          "",
          "| Dominio | Entradas | Archivo |",
          "| :--- | :--- | :--- |",
        ]
        for (const [cat, catEntries] of byCat) {
          masterLines.push(`| ${cat} | ${catEntries.length} | \`brain/${cat}.md\` |`)
        }
        masterLines.push("", "---", "", "Usa `sdd_brain_sync add` con `category` para dirigir al shard correcto.")
        fs.writeFileSync(brainPath, masterLines.join("\n"), "utf-8")

        return `[Brain Sync] ✅ Fragmentado en ${byCat.size} shards (${entries.length} entradas).`
      }

      default:
        return `[Brain Sync] ❌ Acción '${args.action}' no válida.`
    }
  }
})
