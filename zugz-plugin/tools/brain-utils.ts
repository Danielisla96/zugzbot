export interface BrainEntry {
  id: string
  category: string
  tag: string
  problem: string
  solution: string
  date: string
}

import fs from "fs"
import path from "path"

export function today(): string {
  return new Date().toISOString().split("T")[0]
}

export function nextId(entries: BrainEntry[]): string {
  let max = 0
  for (const e of entries) {
    const num = parseInt(e.id.substring(1), 10)
    if (!isNaN(num) && num > max) max = num
  }
  return `L${String(max + 1).padStart(3, "0")}`
}

export function parseEntries(content: string): BrainEntry[] {
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

export function buildIndex(entries: BrainEntry[]): string {
  if (entries.length === 0) return "_No hay lecciones registradas todavía._"
  const header = "| ID | Categoría | Tag | Problema |\n| :--- | :--- | :--- | :--- |\n"
  const rows = entries.map(e => {
    const problemTrunc = e.problem.length > 55 ? e.problem.slice(0, 52) + "..." : e.problem
    return `| ${e.id} | ${e.category || "-"} | ${e.tag} | ${problemTrunc} |`
  }).join("\n")
  return header + rows
}

export function buildEntryBlock(e: BrainEntry): string {
  const tags = `#${e.category || "general"} #${e.tag.replace(/[-\s]/g, "_")}`
  return [
    `### ${e.id}: ${e.tag}`,
    `- **Tags**: ${tags}`,
    `- **Problema**: ${e.problem}`,
    `- **Solución**: ${e.solution}`,
    `- **Fecha**: ${e.date}`,
  ].join("\n") + "\n"
}

export function buildFullBrain(entries: BrainEntry[]): string {
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

export function readBrainFile(brainPath: string): { entries: BrainEntry[] } {
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

export function writeBrainFile(brainPath: string, entries: BrainEntry[]) {
  fs.mkdirSync(path.dirname(brainPath), { recursive: true })
  fs.writeFileSync(brainPath, buildFullBrain(entries), "utf-8")
}