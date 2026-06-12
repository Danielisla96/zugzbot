import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const DOCS_DIR_CANDIDATES = [
  "skills/sdd-heroui/docs",
  ".opencode/skills/sdd-heroui/docs",
  "node_modules/zugzbot-sdd/skills/sdd-heroui/docs"
]

export default tool({
  description: "Busca y retorna la documentación técnica y ejemplos de sintaxis para componentes específicos de HeroUI (ej: data-grid, button, select).",
  args: {
    componentName: tool.schema.string()
      .describe("Nombre del componente en kebab-case (ej. 'data-grid', 'chat-message', 'button')")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    let docsDir: string | null = null
    for (const candidate of DOCS_DIR_CANDIDATES) {
      const p = path.join(projectRoot, candidate)
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        docsDir = p
        break
      }
    }

    if (!docsDir) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No se encontró el directorio de documentación de HeroUI (sdd-heroui/docs) en el proyecto ni en node_modules."
      }, null, 2)
    }

    const cleanName = args.componentName.toLowerCase().trim()
    const docFile = path.join(docsDir, `${cleanName}.md`)

    if (!fs.existsSync(docFile)) {
      // Intentar listar los componentes disponibles para ayudar al agente
      const files = fs.readdirSync(docsDir)
        .filter(f => f.endsWith(".md"))
        .map(f => f.replace(".md", ""))
      return JSON.stringify({
        status: "FAILED",
        reason: `El componente '${args.componentName}' no se encuentra documentado.`,
        available_components: files
      }, null, 2)
    }

    try {
      const content = fs.readFileSync(docFile, "utf-8")
      return JSON.stringify({
        status: "SUCCESS",
        component: cleanName,
        documentation: content
      }, null, 2)
    } catch (err: any) {
      return JSON.stringify({
        status: "FAILED",
        reason: `Error leyendo el archivo de documentación: ${err.message || err}`
      }, null, 2)
    }
  }
})
