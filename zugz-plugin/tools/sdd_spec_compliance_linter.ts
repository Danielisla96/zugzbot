import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Compara semánticamente el archivo spec.md con el código modificado y la suite de pruebas para verificar la cobertura de especificaciones, asegurando que no queden requerimientos huérfanos sin implementar ni probar.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo en .openspec/changes/")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
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
      const match = line.trim().match(/^[-*+]\s+\[[\s*xX]?\]\s+(.+)$/)
      if (match && match[1]) {
        const cleaned = match[1].replace(/^["']|["']$/g, "").trim()
        requirements.push(cleaned)
      }
    })

    if (requirements.length === 0) {
      report.push("✓ No se encontraron requerimientos formales en el `spec.md` (o todos están completados).")
      return report.join("\n")
    }

    // Leer código y pruebas para cruzar
    const filesToScan: string[] = []
    const excludeDirs = [
      "node_modules", ".git", ".openspec", ".opencode", "dist",
      "build", ".next", "coverage", "__pycache__", ".pytest_cache"
    ]
    function recurse(dir: string) {
      if (fs.existsSync(dir)) {
        let entries: string[] = []
        try {
          entries = fs.readdirSync(dir)
        } catch (e) {
          return
        }
        entries.forEach(f => {
          const full = path.join(dir, f)
          let stat
          try {
            stat = fs.statSync(full)
          } catch (e) {
            return
          }
          if (stat.isDirectory()) {
            if (!excludeDirs.includes(f)) {
              recurse(full)
            }
          } else if (/\.(js|ts|gs|html|tsx|py|go|rs|java|cs)$/i.test(f)) {
            filesToScan.push(full)
          }
        })
      }
    }
    recurse(projectRoot)

    const TRANSLATION_MAP: Record<string, string[]> = {
      "suma": ["sum", "add"],
      "sumar": ["sum", "add"],
      "entero": ["int", "integer"],
      "enteros": ["int", "integer", "integers"],
      "positivo": ["positive"],
      "positivos": ["positive", "positives"],
      "negativo": ["negative"],
      "negativos": ["negative", "negatives"],
      "grande": ["large", "big"],
      "grandes": ["large", "big"],
      "error": ["error", "fail", "exception"],
      "errores": ["error", "errors", "fail"],
      "validador": ["validator", "validation"],
      "validar": ["validate", "validation", "validating"],
      "valido": ["valid", "ok", "success", "200"],
      "invalido": ["invalid", "error", "422", "400"],
      "archivo": ["file", "path"],
      "archivos": ["file", "files", "path"],
      "estructura": ["structure", "layout", "dir"],
      "servidor": ["server", "app", "host"],
      "arranca": ["start", "run", "launch", "up"],
      "linter": ["linter", "ruff", "eslint"],
      "limpio": ["clean", "passed"],
      "faltante": ["missing", "none", "null"],
      "falta": ["missing", "none", "null"],
      "formulario": ["form"],
      "boton": ["button", "btn"],
      "envio": ["submit", "send"],
      "enviar": ["submit", "send"],
      "campo": ["input", "field"],
      "campos": ["inputs", "fields"],
      "resultado": ["result", "output"],
      "conexion": ["connection", "connect", "fetch"],
      "conectado": ["connected", "online"],
      "desconectado": ["disconnected", "offline"],
      "carga": ["loading", "spinner", "load", "loading state"],
      "cargando": ["loading", "spinner", "load"],
      "mensaje": ["message", "text"],
      "interfaz": ["ui", "interface", "layout"],
      "pantalla": ["screen", "view"],
      "diseno": ["design", "style", "css"],
      "estilo": ["style", "design", "css"],
      "retorna": ["return", "returns", "response", "respond", "returning"],
      "permite": ["allow", "allows", "permit"],
      "endpoint": ["route", "path", "endpoint", "url", "post", "get"],
      "backend": ["backend", "server", "api", "fastapi", "main.py"],
      "frontend": ["frontend", "client", "app", "ui"],
      "actualizado": ["updated", "added", "git"],
      "entradas": ["entries", "ignore"],
      "monocromatico": ["monochrome", "monochromatic", "solid", "black", "white", "shadcn"],
      "numeros": ["number", "numbers", "float", "int"],
      "decimales": ["decimal", "decimals", "float", "double"],
      "cobertura": ["coverage", "tests", "passed"]
    };

    const normalizeWord = (w: string) => w.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let coveredCount = 0
    report.push(`🔍 Auditando cobertura para ${requirements.length} requerimientos...`)

    requirements.forEach((req, idx) => {
      let isImplemented = false
      let isTested = false
      
      const baseKeywords = req
        .toLowerCase()
        .replace(/[^a-záéíóúñü0-9\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 2 && !["debe", "para", "como", "esta", "este", "consecuente", "cuando", "donde", "tiene", "responde"].includes(word));

      const keywords: string[] = [];
      baseKeywords.forEach(word => {
        const norm = normalizeWord(word);
        keywords.push(word);
        if (norm !== word) {
          keywords.push(norm);
        }
        if (TRANSLATION_MAP[norm]) {
          keywords.push(...TRANSLATION_MAP[norm]);
        }
      });
      
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

          const isMatch = directMatch || (keywords.length > 0 && keywordHits / keywords.length >= 0.45)

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
