import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

function buildTreeString(dir: string, prefix = "", depth = 0, maxDepth = 2): string {
  if (depth > maxDepth) return ""
  let result = ""
  let entries: string[] = []
  try {
    entries = fs.readdirSync(dir)
  } catch (e) {
    return result
  }

  const exclude = [
    "node_modules",
    ".git",
    ".openspec",
    ".opencode",
    "dist",
    ".next",
    "build",
    "coverage",
    ".DS_Store"
  ]

  const filtered = entries.filter(e => !exclude.includes(e))

  filtered.forEach((entry, idx) => {
    const fullPath = path.join(dir, entry)
    let isDir = false
    try {
      isDir = fs.statSync(fullPath).isDirectory()
    } catch (e) {
      return
    }
    const isLast = idx === filtered.length - 1
    const connector = isLast ? "└── " : "├── "
    result += prefix + connector + entry + (isDir ? "/" : "") + "\n"

    if (isDir && depth < maxDepth) {
      const newPrefix = prefix + (isLast ? "    " : "│   ")
      result += buildTreeString(fullPath, newPrefix, depth + 1, maxDepth)
    }
  })

  return result
}

export default tool({
  description: "Escanea la estructura de directorios del proyecto de forma nativa e instantánea de hasta 3 niveles, filtrando carpetas pesadas como node_modules o .git, para retornar el árbol visual del proyecto sin costo de tokens.",
  args: {
    maxDepth: tool.schema.number().optional().default(2).describe("Nivel máximo de profundidad para el escaneo recursivo de directorios (por defecto 2, máx 3)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const depth = Math.min(Math.max(args.maxDepth, 1), 3)

    const tree = buildTreeString(projectRoot, "", 0, depth)
    const projectName = path.basename(projectRoot)

    return `Estructura de Carpetas del Proyecto: ${projectName}\n\n/\n${tree || "  (Vacío o error en lectura)"}`
  }
})
