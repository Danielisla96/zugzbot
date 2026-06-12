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
    
    // Intentar leer el grafo de Graphify si existe
    const graphPath = path.join(projectRoot, "graphify-out/graph.json")
    let graphData: any = null
    if (fs.existsSync(graphPath)) {
      try {
        graphData = JSON.parse(fs.readFileSync(graphPath, "utf-8"))
        report.push("📊 Grafo de dependencias de Graphify cargado para análisis dinámico de Blast Radius.")
      } catch {}
    }

    for (const file of modifiedFiles) {
      const ext = path.extname(file)
      const base = path.basename(file)
      let severity = "Bajo"
      let dependencies: string[] = []
      const collateralFiles = new Set<string>([base])

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

      // Integrar dependencias estructurales reales del grafo
      if (graphData && Array.isArray(graphData.nodes) && Array.isArray(graphData.edges)) {
        // Encontrar nodos del archivo modificado
        const fileNodes = graphData.nodes.filter((n: any) => {
          return n.source_file === file || (n.id && n.id.includes(file))
        })
        const fileNodeIds = new Set(fileNodes.map((n: any) => n.id))

        if (fileNodeIds.size > 0) {
          // Filtrar aristas que conectan a estos nodos
          const relatedEdges = graphData.edges.filter((e: any) => {
            return fileNodeIds.has(e.source) || fileNodeIds.has(e.target)
          })

          const connectedIds = new Set<string>()
          relatedEdges.forEach((e: any) => {
            if (!fileNodeIds.has(e.source)) connectedIds.add(e.source)
            if (!fileNodeIds.has(e.target)) connectedIds.add(e.target)
          })

          const connectedNodes = graphData.nodes.filter((n: any) => connectedIds.has(n.id))
          connectedNodes.forEach((n: any) => {
            dependencies.push(`[Graphify] Relación: ${n.label || n.id} (en ${n.source_file || 'externo'})`)
            if (n.source_file) {
              collateralFiles.add(path.basename(n.source_file))
            }
          })

          if (connectedNodes.length > 0) {
            severity = connectedNodes.length > 5 ? "🔴 ALTO" : "🟡 MEDIO"
          }
        }
      }

      impactList.push(`
  📂 Archivo: \`${file}\`
  - Severidad de Impacto: ${severity}
  - Componentes Afectados / Blast Radius:
    ${dependencies.map(d => `* ${d}`).join("\n    ")}
  - Archivos colaterales recomendados para re-verificar:
    ${Array.from(collateralFiles).map(f => `* ${f}`).join("\n    ")}
`)
    }

    report.push(impactList.join("\n"))
    report.push("✓ Análisis de Radio de Impacto finalizado con éxito.")
    return report.join("\n")
  }
})
