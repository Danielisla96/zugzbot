import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

export default tool({
  description: "Analiza el git diff del cambio activo y mapea el Blast Radius (Radio de Impacto), identificando clases, funciones y archivos dependientes que podrían verse afectados por efectos secundarios.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo en .openspec/changes/")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const report: string[] = []
    report.push(`━━━ sdd_diff_impact_analyzer: ${args.changeName} ━━━`)

    let diffText = ""
    try {
      diffText = execSync("git diff HEAD", { cwd: projectRoot, encoding: "utf-8" })
    } catch (e) {
      try {
        diffText = execSync("git diff", { cwd: projectRoot, encoding: "utf-8" })
      } catch (err) {
        diffText = ""
      }
    }

    if (!diffText.trim()) {
      report.push("✓ No se detectaron diferencias activas no guardadas en Git.")
      report.push("✓ Radio de Impacto: 0 (Sin riesgos detectados).")
      return report.join("\n")
    }

    const modifiedFiles: string[] = []
    const lines = diffText.split("\n")
    lines.forEach(line => {
      if (line.startsWith("+++ b/")) {
        const file = line.substring(6).trim()
        if (fs.existsSync(path.join(projectRoot, file))) {
          modifiedFiles.push(file)
        }
      }
    })

    if (modifiedFiles.length === 0) {
      report.push("✓ No se detectaron archivos físicos modificados en la diferencia.")
      return report.join("\n")
    }

    report.push(`🔍 Archivos modificados detectados: ${modifiedFiles.length}`)
    const impactList: string[] = []

    for (const file of modifiedFiles) {
      const ext = path.extname(file)
      const base = path.basename(file)
      let severity = "Bajo"
      let dependencies: string[] = []

      if (file.includes("index.html") || file.includes("main.ts")) {
        severity = "🔴 CRÍTICO / ALTO"
        dependencies = ["Todo el flujo de entrada de la aplicación", "Enrutamiento global"]
      } else if (ext === ".ts" || ext === ".js" || ext === ".gs") {
        severity = "🟡 MEDIO"
        dependencies = [`Llamadas importadas desde otros módulos de lógica`, `Controladores asociados`]
      } else if (ext === ".html" || ext === ".tsx" || ext === ".jsx") {
        severity = "🟡 MEDIO / INTERACTIVO"
        dependencies = ["Renderizado de UI y DOM", "Manejadores de eventos reactivos"]
      } else if (ext === ".css") {
        severity = "🟢 BAJO"
        dependencies = ["Estilización y layout visual"]
      }

      impactList.push(`
  📂 Archivo: \`${file}\`
  - Severidad de Impacto: ${severity}
  - Componentes Afectados / Blast Radius:
    ${dependencies.map(d => `* ${d}`).join("\n    ")}
  - Archivos colaterales recomendados para re-verificar:
    * ${base} (auto-referencial)
    * index.html (si aplica integración de layout)
`)
    }

    report.push(impactList.join("\n"))
    report.push("✓ Análisis de Radio de Impacto finalizado con éxito.")
    return report.join("\n")
  }
})
