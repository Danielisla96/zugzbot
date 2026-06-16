import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const getBrainFilePath = (context: any) => {
  const root = context?.worktree || context?.directory || process.cwd()
  const openspecDir = path.resolve(root, ".openspec")
  if (!fs.existsSync(openspecDir)) {
    fs.mkdirSync(openspecDir, { recursive: true })
  }
  return path.resolve(openspecDir, "brain.md")
}

// Helper to parse brain.md into sections
const parseBrainFile = (filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { title: "Zugzbot Brain - Memory and Learnings", sections: {} as Record<string, string> }
    }
    const content = fs.readFileSync(filePath, "utf8") || ""
    const sections: Record<string, string> = {}
    let title = "Zugzbot Brain - Memory and Learnings"
    let currentHeader = ""
    let currentLines: string[] = []

    const lines = typeof content.split === "function" ? content.split(/\r?\n/) : []
    
    // Check if first line is a title
    let startIndex = 0
    if (lines.length > 0 && lines[0] && lines[0].startsWith("# ")) {
      title = lines[0].substring(2).trim()
      startIndex = 1
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined || line === null) continue;
      if (line.startsWith("# ")) {
        if (currentHeader) {
          sections[currentHeader] = currentLines.join("\n").trim()
        }
        currentHeader = line.substring(2).trim().toLowerCase()
        currentLines = []
      } else {
        if (currentHeader) {
          currentLines.push(line)
        }
      }
    }
    if (currentHeader) {
      sections[currentHeader] = currentLines.join("\n").trim()
    }
    return { title, sections }
  } catch (e) {
    return { title: "Zugzbot Brain - Memory and Learnings", sections: {} as Record<string, string> }
  }
}

// Helper to write sections back to brain.md
const writeBrainFile = (filePath: string, title: string, sections: Record<string, string>) => {
  let content = `# ${title}\n\n`
  for (const [header, body] of Object.entries(sections)) {
    if (body === undefined || body === null) continue
    const formattedHeader = header.charAt(0).toUpperCase() + header.slice(1)
    content += `# ${formattedHeader}\n${body}\n\n`
  }
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8")
}

export const save_memory = tool({
  description: "Guarda un aprendizaje, decisión de diseño, ruta concreta, resolución de error o memoria del proyecto en el archivo .openspec/brain.md. Es acumulativo y añade una marca de tiempo.",
  args: {
    category: tool.schema.string().describe("Categoría o sección donde clasificar la memoria (ej: 'design', 'learnings', 'routing', 'errors')"),
    content: tool.schema.string().describe("El contenido o aprendizaje exacto que se desea guardar. Se recomienda ser conciso y claro.")
  },
  async execute(args, context) {
    try {
      const filePath = getBrainFilePath(context)
      const { category, content } = args
      const categoryStr = typeof category === "string" ? category : String(category || "learnings")
      const contentStr = typeof content === "string" ? content : String(content || "")
      const normalizedCategory = categoryStr.trim().toLowerCase()
      
      const { title, sections } = parseBrainFile(filePath)
      
      const timestamp = new Date().toISOString().split("T")[0]
      const cleanContent = contentStr.trim()
      const newEntry = `- [${timestamp}]: ${cleanContent}`
      
      const existingBody = sections[normalizedCategory] || ""
      const updatedBody = existingBody ? `${existingBody}\n${newEntry}` : newEntry
      sections[normalizedCategory] = updatedBody
      
      writeBrainFile(filePath, title, sections)
      
      return {
        success: true,
        message: `Memoria guardada exitosamente bajo la categoría '${normalizedCategory}' en .openspec/brain.md`,
        filePath
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Error al guardar memoria: ${e?.message || "error desconocido"}`
      }
    }
  }
})

export const read_memory = tool({
  description: "Recupera la memoria y los aprendizajes del proyecto del archivo .openspec/brain.md. Si se especifica una categoría, solo lee esa sección para optimizar tokens y contexto. Si no se especifica, lista las categorías disponibles.",
  args: {
    category: tool.schema.string().optional().describe("La categoría específica a leer (ej: 'design', 'learnings', 'routing', 'errors'). Si no se provee, se listarán las categorías disponibles.")
  },
  async execute(args, context) {
    try {
      const filePath = getBrainFilePath(context)
      
      if (!fs.existsSync(filePath)) {
        return {
          exists: false,
          message: "No se ha inicializado el archivo .openspec/brain.md de memoria del proyecto. Usa 'brain_save_memory' para registrar tu primera entrada."
        }
      }
      
      const { title, sections } = parseBrainFile(filePath)
      const { category } = args
      
      if (category) {
        const categoryStr = typeof category === "string" ? category : String(category || "")
        const normalizedCategory = categoryStr.trim().toLowerCase()
        const content = sections[normalizedCategory]
        
        if (content !== undefined && content !== null) {
          return {
            category: normalizedCategory,
            found: true,
            content: content
          }
        } else {
          const available = Object.keys(sections)
          return {
            category: normalizedCategory,
            found: false,
            message: `No se encontró la categoría '${normalizedCategory}' en el cerebro.`,
            availableCategories: available
          }
        }
      } else {
        const available: Record<string, { preview: string, entriesCount: number }> = {}
        for (const [key, val] of Object.entries(sections)) {
          if (val === undefined || val === null) continue
          const valStr = typeof val === "string" ? val : String(val)
          const lines = valStr.split("\n").filter(l => l.trim().length > 0)
          const entriesCount = lines.length
          const preview = lines.slice(-2).join("\n") // Muestra las últimas 2 entradas como preview
          available[key] = {
            entriesCount,
            preview: preview || "(Sección vacía)"
          }
        }
        
        return {
          title,
          message: "Se listan las categorías de memoria disponibles. Puedes leer una en particular pasando el argumento 'category'.",
          availableCategories: available
        }
      }
    } catch (e: any) {
      return {
        exists: false,
        message: `Error al leer memoria: ${e?.message || "error desconocido"}`
      }
    }
  }
})
