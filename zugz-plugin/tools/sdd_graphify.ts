import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

function isGraphifyInstalled(): boolean {
  try {
    execSync("which graphify", { stdio: "ignore" })
    return true
  } catch {
    try {
      execSync("graphify --help", { stdio: "ignore" })
      return true
    } catch {
      return false
    }
  }
}

export default tool({
  description: "Administra, genera y consulta el Grafo de Conocimiento del proyecto usando Graphify. Permite obtener dependencias de componentes, imports y llamadas estructurales de forma local.",
  args: {
    action: tool.schema.enum(["run", "status", "query"])
      .describe("Acción a realizar: 'run' para generar/actualizar el grafo, 'status' para verificar si existe, 'query' para buscar dependencias"),
    query: tool.schema.string().optional()
      .describe("Término de búsqueda, nombre de archivo o entidad (requerido para action='query')")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    const outputDir = path.join(projectRoot, "graphify-out")
    const graphPath = path.join(outputDir, "graph.json")
    const reportPath = path.join(outputDir, "GRAPH_REPORT.md")

    if (args.action === "status") {
      const installed = isGraphifyInstalled()
      const exists = fs.existsSync(graphPath)
      let info = {}
      if (exists) {
        try {
          const stats = fs.statSync(graphPath)
          const data = JSON.parse(fs.readFileSync(graphPath, "utf-8"))
          info = {
            last_updated: stats.mtime.toISOString(),
            size_bytes: stats.size,
            nodes_count: Array.isArray(data.nodes) ? data.nodes.length : 0,
            edges_count: Array.isArray(data.edges) ? data.edges.length : 0
          }
        } catch {}
      }
      return JSON.stringify({
        status: "SUCCESS",
        graphify_installed: installed,
        graph_exists: exists,
        details: info,
        install_instruction: installed ? undefined : "Puedes instalarlo con: pip install graphifyy o uv tool install graphifyy"
      }, null, 2)
    }

    if (args.action === "run") {
      if (!isGraphifyInstalled()) {
        return JSON.stringify({
          status: "FAILED",
          reason: "La CLI 'graphify' no está instalada en el sistema. Para usar esta funcionalidad, instálala primero usando: pip install graphifyy o uv tool install graphifyy"
        }, null, 2)
      }

      // Crear un .graphifyignore por defecto para evitar indexar carpetas basura
      const ignorePath = path.join(projectRoot, ".graphifyignore")
      if (!fs.existsSync(ignorePath)) {
        const defaultIgnore = [
          "node_modules/",
          "dist/",
          "build/",
          "out/",
          "coverage/",
          ".git/",
          ".opencode/",
          ".openspec/",
          "graphify-out/"
        ].join("\n")
        fs.writeFileSync(ignorePath, defaultIgnore, "utf-8")
      }

      try {
        // Ejecutar graphify. Graphify maneja de forma inteligente cache interna.
        execSync("graphify", { cwd: projectRoot, encoding: "utf-8" })
        
        const exists = fs.existsSync(graphPath)
        if (!exists) {
          return JSON.stringify({
            status: "FAILED",
            reason: "Se ejecutó graphify pero no se generó el archivo graph.json esperado."
          }, null, 2)
        }

        return JSON.stringify({
          status: "SUCCESS",
          message: "Grafo de Conocimiento actualizado correctamente.",
          output_directory: "graphify-out/",
          report_generated: fs.existsSync(reportPath)
        }, null, 2)
      } catch (e: any) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Error al ejecutar graphify: ${e.message || e}`
        }, null, 2)
      }
    }

    if (args.action === "query") {
      if (!fs.existsSync(graphPath)) {
        return JSON.stringify({
          status: "FAILED",
          reason: "El archivo graph.json no existe. Ejecuta primero la acción 'run' para generarlo."
        }, null, 2)
      }

      if (!args.query) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Se requiere especificar un término de búsqueda en 'query'."
        }, null, 2)
      }

      try {
        const data = JSON.parse(fs.readFileSync(graphPath, "utf-8"))
        const nodes: any[] = data.nodes || []
        const edges: any[] = data.edges || []

        const searchTerm = args.query.toLowerCase()
        
        // Buscar nodos coincidentes
        const matchedNodes = nodes.filter((node: any) => {
          return (
            node.id?.toLowerCase().includes(searchTerm) ||
            node.label?.toLowerCase().includes(searchTerm) ||
            node.source_file?.toLowerCase().includes(searchTerm)
          )
        })

        if (matchedNodes.length === 0) {
          return JSON.stringify({
            status: "SUCCESS",
            message: `No se encontraron nodos que coincidan con '${args.query}'`,
            results: []
          }, null, 2)
        }

        const matchedNodeIds = new Set(matchedNodes.map((n: any) => n.id))

        // Encontrar relaciones directas (entrantes y salientes)
        const matchedEdges = edges.filter((edge: any) => {
          return matchedNodeIds.has(edge.source) || matchedNodeIds.has(edge.target)
        })

        // Encontrar nodos conectados
        const connectedNodeIds = new Set<string>()
        matchedEdges.forEach((edge: any) => {
          connectedNodeIds.add(edge.source)
          connectedNodeIds.add(edge.target)
        })

        const relatedNodes = nodes.filter((node: any) => {
          return connectedNodeIds.has(node.id) && !matchedNodeIds.has(node.id)
        })

        return JSON.stringify({
          status: "SUCCESS",
          query: args.query,
          matched_nodes: matchedNodes.map((n: any) => ({
            id: n.id,
            label: n.label,
            file_type: n.file_type,
            source_file: n.source_file
          })),
          relations: matchedEdges.map((e: any) => ({
            source: e.source,
            target: e.target,
            relation: e.relation
          })),
          connected_components: relatedNodes.map((n: any) => ({
            id: n.id,
            label: n.label,
            file_type: n.file_type,
            source_file: n.source_file
          }))
        }, null, 2)
      } catch (e: any) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Error al consultar el grafo: ${e.message || e}`
        }, null, 2)
      }
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
