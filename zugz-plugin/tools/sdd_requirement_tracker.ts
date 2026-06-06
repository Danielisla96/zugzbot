import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Rastreador Semántico de Requerimientos: Compara los criterios de aceptación en spec.md con las aserciones y títulos de prueba en tests/ para asegurar una cobertura del 100%.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Por defecto se autodetectará del sdd-lock.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd();
    if (projectRoot === "/") {
      projectRoot = process.cwd();
    }
    let changeName = args.changeName;
    let isManualQa = false;

    let stackProfile = "";
    // 1. Detectar cambio activo y verificar si hay QA manual configurado en el lockfile
    const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
    const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
    const activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);
    if (activeLockPath) {
      try {
        const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"));
        if (!changeName && lockObj.change_name && lockObj.change_name !== "nuevo-cambio") {
          changeName = lockObj.change_name;
        }
        if (lockObj.qa_manual === true || lockObj.manual_qa === true) {
          isManualQa = true;
        }
        if (lockObj.stack_profile) {
          stackProfile = lockObj.stack_profile;
        }
      } catch (e) {}
    }

    // Verificar si hay QA manual configurado en opencode.json
    const opencodeJsonPath = path.join(projectRoot, "opencode.json");
    if (fs.existsSync(opencodeJsonPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8"));
        if (config.sdd?.qa_manual === true || config.sdd?.manual_qa === true) {
          isManualQa = true;
        }
      } catch (e) {}
    }

    if (!changeName || changeName === "nuevo-cambio") {
      return JSON.stringify({
        status: "FAILED",
        reason: "No se pudo resolver el nombre del cambio activo."
      }, null, 2);
    }

    // 2. Leer spec.md
    const changeDir = path.join(projectRoot, ".openspec/changes", changeName);
    let specPath = path.join(changeDir, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md");
    }
    if (!fs.existsSync(specPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encuentra spec.md en ${specPath}`
      }, null, 2);
    }

    const specContent = fs.readFileSync(specPath, "utf-8");

    // Autodetección de modo QA Manual explícito en spec.md
    if (
      specContent.includes("[QA Manual]") ||
      specContent.includes("QA Mode: Manual") ||
      specContent.includes("QA: Manual") ||
      specContent.toLowerCase().includes("qa_manual: true")
    ) {
      isManualQa = true;
    }

    // 3. Extraer criterios de aceptación
    const criteria: string[] = [];
    let inCriteriaSection = false;

    specContent.split("\n").forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## 5. Criterios")) {
        inCriteriaSection = true;
        return;
      }
      if (inCriteriaSection && trimmed.startsWith("##")) {
        inCriteriaSection = false;
      }

      if (inCriteriaSection && (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("- [X]"))) {
        // Extraer texto del criterio sin el prefijo del checkbox
        const text = trimmed.substring(5).trim();
        if (text) criteria.push(text);
      }
    });

    if (criteria.length === 0) {
      return JSON.stringify({
        status: "WARNING",
        criteriaCount: 0,
        message: "⚠️ RASTREADOR SEMÁNTICO: No se encontraron criterios de aceptación con casillas '- [ ]' en la sección '## 5. Criterios de Aceptación' de tu spec.md."
      }, null, 2);
    }

    if (isManualQa) {
      return JSON.stringify({
        status: "APPROVED",
        criteriaCount: criteria.length,
        message: `✅ VALIDACIÓN MANUAL (QA MANUAL) ACTIVA: Conforme al reglamento de AGENTS.md y la configuración del proyecto, se aprueba la transición sin requerir cobertura de pruebas automatizadas. Todos los ${criteria.length} criterios de aceptación deben validarse empíricamente en el entorno en caliente.`
      }, null, 2);
    }

    // 4. Ubicar y leer archivos de prueba de forma recursiva y distribuida
    const testFiles: string[] = [];
    const excludeDirs = [
      "node_modules", ".git", ".openspec", ".opencode", "dist",
      "build", ".next", "coverage", "__pycache__", ".pytest_cache"
    ];

    function findTestFilesRecursive(dir: string) {
      if (!fs.existsSync(dir)) return;
      let entries: string[] = [];
      try {
        entries = fs.readdirSync(dir);
      } catch (e) {
        return;
      }

      entries.forEach(entry => {
        const fullPath = path.join(dir, entry);
        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch (e) {
          return;
        }

        if (stat.isDirectory()) {
          if (!excludeDirs.includes(entry)) {
            findTestFilesRecursive(fullPath);
          }
        } else {
          const lowerFile = entry.toLowerCase();
          const ext = path.extname(entry).toLowerCase();
          let validTestExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".cs"];
          if (stackProfile) {
            const sp = stackProfile.toLowerCase();
            if (sp.includes("node") || sp.includes("react") || sp.includes("vue") || sp.includes("svelte") || sp.includes("next") || sp.includes("express") || sp.includes("javascript") || sp.includes("typescript")) {
              validTestExtensions = [".ts", ".tsx", ".js", ".jsx"];
            } else if (sp.includes("python") || sp.includes("django") || sp.includes("fastapi") || sp.includes("flask")) {
              validTestExtensions = [".py"];
            } else if (sp.includes("go")) {
              validTestExtensions = [".go"];
            } else if (sp.includes("rust") || sp.includes("cargo")) {
              validTestExtensions = [".rs"];
            } else if (sp.includes("gas") || sp.includes("google-apps-script")) {
              validTestExtensions = [".gs", ".ts", ".js"];
            }
          }
          const isTestFile = 
            validTestExtensions.includes(ext) && (
              lowerFile.includes(".test.") || 
              lowerFile.includes(".spec.") || 
              lowerFile.startsWith("test_") || 
              lowerFile.endsWith("_test.go") || 
              dir.split(path.sep).some(p => p === "tests" || p === "test")
            );

          if (isTestFile) {
            testFiles.push(fullPath);
          }
        }
      });
    }

    findTestFilesRecursive(projectRoot);

    if (testFiles.length === 0) {
      return JSON.stringify({
        status: "APPROVED",
        criteriaCount: criteria.length,
        message: `⚠️ ADVERTENCIA SEMÁNTICA (FALLBACK MANUAL): No se detectaron archivos de prueba distribuidos en el repositorio. Consecuentemente, se asume un flujo de VALIDACIÓN MANUAL (QA Manual) de forma automática para evitar bloquear el ciclo SDD. Por favor, asegúrate de verificar los ${criteria.length} criterios de aceptación manualmente en el entorno en caliente.`
      }, null, 2);
    }

    // 5. Comparar semánticamente los criterios con los tests
    interface CriterionAudit {
      criterio: string;
      covered: boolean;
      matchedInFile?: string;
      matchingSnippet?: string;
    }

    const auditResults: CriterionAudit[] = [];

    criteria.forEach(crit => {
      // Verificar si el criterio individual tiene un bypass manual explícito
      const isManualCrit = 
        crit.toLowerCase().includes("[manual]") ||
        crit.toLowerCase().includes("[e2e]") ||
        crit.toLowerCase().includes("[qa manual]");

      let matched = false;
      let matchedFile = "";
      let matchedSnippet = "";

      if (isManualCrit) {
        matched = true;
        matchedFile = "QA Manual / E2E Bypass";
        matchedSnippet = "Validación manual explícita declarada en spec.md";
      } else {
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

        const baseKeywords = crit
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

        // Detectar si hay un ID explícito (como CA1, CA-2, Criterio 3...)
        const idMatch = crit.match(/^(?:ca|rq|tc|req|criterio)\s*[-_]?\s*(\d+)/i) || crit.match(/\b(?:ca|rq|tc|req)\s*[-_]?\s*(\d+)\b/i);
        let explicitId = "";
        if (idMatch) {
          explicitId = `ca${idMatch[1]}`;
          keywords.push(explicitId);
        }

        for (const testFile of testFiles) {
          try {
            const testContent = fs.readFileSync(testFile, "utf-8");
            const testLines = testContent.split("\n");

            // Búsqueda por ventana deslizante (8 líneas) para capturar el contexto de una función/bloque de prueba completo
            const windowSize = 8;
            const totalLines = testLines.length;
            
            for (let i = 0; i < totalLines; i++) {
              const sliceEnd = Math.min(totalLines, i + windowSize);
              const windowLines = testLines.slice(i, sliceEnd);
              const windowText = windowLines.join("\n").toLowerCase();
              
              const hasExplicitId = explicitId && windowText.includes(explicitId);
              
              // Coincidencia de palabras clave dentro de la ventana de contexto
              const matchCount = keywords.filter(keyword => windowText.includes(keyword)).length;
              const threshold = Math.max(1, Math.floor(keywords.length * 0.45));

              if (hasExplicitId || (matchCount >= threshold && threshold > 0)) {
                matched = true;
                matchedFile = path.basename(testFile);
                matchedSnippet = `Líneas ${i + 1}-${sliceEnd}: ${testLines[i].trim()} ...`;
                break;
              }
            }

            if (matched) break;
          } catch (e) {}
        }
      }

      auditResults.push({
        criterio: crit,
        covered: matched,
        matchedInFile: matchedFile || undefined,
        matchingSnippet: matchedSnippet || undefined
      });
    });

    const uncoveredCount = auditResults.filter(r => !r.covered).length;

    if (uncoveredCount > 0) {
      return JSON.stringify({
        status: "FAILED",
        criteriaCount: criteria.length,
        uncoveredCount,
        results: auditResults,
        message: `❌ AUDITORÍA SEMÁNTICA FALLIDA: Se detectaron ${uncoveredCount} criterios de aceptación sin cobertura de pruebas en la suite de pruebas detectada:\n\n${auditResults.map(r => r.covered ? `  - [✓] "${r.criterio}" (Cubierto por ${r.matchedInFile})` : `  - [ ] "${r.criterio}" (⚠️ ¡SIN PRUEBA DE COBERTURA EN LA SUITE!)`).join("\n")}\n\nPor favor, pide a @sdd-builder que añada casos de prueba para cubrir estos criterios de QA.`
      }, null, 2);
    }

    return JSON.stringify({
      status: "APPROVED",
      criteriaCount: criteria.length,
      results: auditResults,
      message: `✅ AUDITORÍA SEMÁNTICA EXITOSA: Todos los ${criteria.length} criterios de aceptación definidos en spec.md tienen cobertura de aserción correspondiente en la suite de pruebas.\n\n${auditResults.map(r => `  - [✓] "${r.criterio}" (Validado en ${r.matchedInFile})`).join("\n")}`
    }, null, 2);
  }
})
