import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: `Crea un skill personalizado (.opencode/skills/<name>) en el proyecto.
  Esto permite codificar mejores prácticas, guías o scripts específicos descubiertos durante la ejecución del proyecto,
  haciendo que estén disponibles para futuros agentes.`,
  args: {
    skillName: tool.schema.string().describe("Nombre del skill en kebab-case (ej: fastapi-cors-config)"),
    description: tool.schema.string().describe("Una descripción corta del propósito del skill"),
    instructions: tool.schema.string().describe("Instrucciones detalladas en Markdown que guiarán al agente"),
    exampleCode: tool.schema.string().optional().describe("Código de ejemplo que se guardará en examples/example.txt o dentro del markdown"),
    scriptContent: tool.schema.string().optional().describe("Contenido de un script de ayuda opcional que se guardará en scripts/helper.sh o scripts/helper.js"),
    scriptFilename: tool.schema.string().optional().default("helper.sh").describe("Nombre del archivo de script (ej: helper.sh, run.js)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory || process.cwd()
    const skillsBase = path.join(projectRoot, ".opencode/skills")
    const skillDir = path.join(skillsBase, args.skillName)

    if (fs.existsSync(skillDir)) {
      return `[Custom Skill] El skill '${args.skillName}' ya existe en ${path.relative(projectRoot, skillDir)}.`
    }

    try {
      fs.mkdirSync(skillDir, { recursive: true })

      // Generar SKILL.md
      const skillMdContent = `---
name: ${args.skillName}
description: "${args.description.replace(/"/g, '\\"')}"
---

# ${args.skillName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}

## Propósito
${args.description}

## Instrucciones y Directrices
${args.instructions}
`

      fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMdContent, "utf-8")

      // Guardar ejemplo si existe
      if (args.exampleCode) {
        const examplesDir = path.join(skillDir, "examples")
        fs.mkdirSync(examplesDir, { recursive: true })
        fs.writeFileSync(path.join(examplesDir, "example.txt"), args.exampleCode, "utf-8")
      }

      // Guardar script si existe
      if (args.scriptContent) {
        const scriptsDir = path.join(skillDir, "scripts")
        fs.mkdirSync(scriptsDir, { recursive: true })
        const scriptPath = path.join(scriptsDir, args.scriptFilename)
        fs.writeFileSync(scriptPath, args.scriptContent, "utf-8")
        if (args.scriptFilename.endsWith(".sh")) {
          try {
            fs.chmodSync(scriptPath, 0o755)
          } catch {}
        }
      }

      return `[Custom Skill] ✅ Skill '${args.skillName}' creado exitosamente en ${path.relative(projectRoot, skillDir)}/`
    } catch (e: any) {
      return `[Custom Skill] ❌ Error al crear el skill: ${e.message || e}`
    }
  }
})
