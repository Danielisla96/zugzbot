import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Compara semánticamente el archivo spec.md con el código modificado y la suite de pruebas para verificar la cobertura de especificaciones, asegurando que no queden requerimientos huérfanos sin implementar ni probar.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo en .openspec/changes/")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const report: string[] = []
    report.push(`━━━ sdd_spec_compliance_linter: ${args.changeName} ━━━`)

    const openspecDir = path.join(projectRoot, ".openspec")
    const changeDir = path.join(openspecDir, "changes", args.changeName)
    let specFile = path.join(changeDir, "specs/spec.md")
    
    if (!fs.existsSync(specFile)) {
      specFile = path.join(changeDir, "spec.md")
    }
    
    let specContent = ""
    if (fs.existsSync(specFile)) {
      specContent = fs.readFileSync(specFile, "utf-8")
    } else {
      const alternativeSpec = path.join(projectRoot, "spec.md")
      if (fs.existsSync(alternativeSpec)) {
        specContent = fs.readFileSync(alternativeSpec, "utf-8")
      }
    }

    if (!specContent) {
      report.push("⚠ No se encontró ningún archivo `spec.md` activo para el cambio. Imposible realizar cruce de especificaciones.")
      return JSON.stringify({
        status: "FAILED",
        complianceRate: 0,
        message: "No se encontró el archivo spec.md.",
        report: report.join("\n")
      }, null, 2)
    }

    // Extraer requerimientos
    const requirements: string[] = []
    const lines = specContent.split("\n")
    lines.forEach(line => {
      const match = line.match(/^[-*+]\s+\[\s*\]\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/)
      if (match && match[1]) {
        requirements.push(match[1].trim())
      }
    })

    if (requirements.length === 0) {
      report.push("✓ No se encontraron requerimientos formales en el `spec.md` (o todos están completados).")
      return report.join("\n")
    }

    // Leer código y pruebas para cruzar
    const filesToScan: string[] = []
    function recurse(dir: string) {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(f => {
          const full = path.join(dir, f)
          if (fs.statSync(full).isDirectory()) {
            if (f !== "node_modules" && f !== ".git" && f !== ".openspec" && f !== ".opencode") {
              recurse(full)
            }
          } else if (f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".gs") || f.endsWith(".html") || f.endsWith(".tsx")) {
            filesToScan.push(full)
          }
        })
      }
    }
    recurse(path.join(projectRoot, "src"))
    recurse(path.join(projectRoot, "tests"))

    let coveredCount = 0
    report.push(`🔍 Auditando cobertura para ${requirements.length} requerimientos...`)

    requirements.forEach((req, idx) => {
      let isImplemented = false
      let isTested = false
      
      const keywords = req.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      
      filesToScan.forEach(filePath => {
        try {
          const content = fs.readFileSync(filePath, "utf-8").toLowerCase()
          
          // Buscar indicio directo por índice
          const directMatch = content.includes(`requerimiento #${idx + 1}`) || content.includes(`req #${idx + 1}`)
          
          // Buscar palabras clave
          let keywordHits = 0
          keywords.forEach(kw => {
            if (content.includes(kw)) keywordHits++
          })

          const isMatch = directMatch || (keywords.length > 0 && keywordHits / keywords.length >= 0.5)

          if (isMatch) {
            if (filePath.includes("test")) {
              isTested = true
            } else {
              isImplemented = true
            }
          }
        } catch (e) {}
      })

      if (isImplemented && isTested) {
        coveredCount++
        report.push(`  [x] Req #${idx + 1}: "${req.substring(0, 50)}..." -> Totalmente Cubierto.`)
      } else {
        const statuses = []
        if (!isImplemented) statuses.push("Falta Implementación en /src")
        if (!isTested) statuses.push("Falta Prueba Asociada en /tests")
        report.push(`  [ ] Req #${idx + 1}: "${req.substring(0, 50)}..." -> ⚠ Huérfano (${statuses.join(", ")})`)
      }
    })

    const complianceRate = Math.round((coveredCount / requirements.length) * 100)
    report.push(`\n📊 TASA DE CUMPLIMIENTO SEMÁNTICO: ${complianceRate}%`)
    
    if (complianceRate === 100) {
      report.push("✓ ¡Excelente! Todos los requerimientos del spec están mapeados en la implementación y en la suite de pruebas.")
    } else {
      report.push("⚠ Atención: Completa los requerimientos huérfanos indicados arriba para evitar regresiones lógicas.")
    }

    return JSON.stringify({
      status: complianceRate === 100 ? "APPROVED" : "FAILED",
      complianceRate,
      report: report.join("\n")
    }, null, 2)
  }
})
