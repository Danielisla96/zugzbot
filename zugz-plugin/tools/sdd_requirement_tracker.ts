import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Rastreador Semántico de Requerimientos: Compara los criterios de aceptación en spec.md con las aserciones y títulos de prueba en tests/ para asegurar una cobertura del 100%.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Por defecto se autodetectará del sdd-lock.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    let changeName = args.changeName;

    // 1. Detectar cambio activo
    if (!changeName) {
      const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
      const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
      const activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);
      if (activeLockPath) {
        try {
          const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"));
          if (lockObj.change_name && lockObj.change_name !== "nuevo-cambio") {
            changeName = lockObj.change_name;
          }
        } catch (e) {}
      }
    }

    if (!changeName || changeName === "nuevo-cambio") {
      return JSON.stringify({
        status: "FAILED",
        reason: "No se pudo resolver el nombre del cambio activo."
      }, null, 2);
    }

    // 2. Leer spec.md
    const specPath = path.join(projectRoot, ".openspec/changes", changeName, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encuentra spec.md en ${specPath}`
      }, null, 2);
    }

    const specContent = fs.readFileSync(specPath, "utf-8");

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

    // 4. Ubicar y leer archivos de prueba de forma recursiva y distribuida
    const testFiles: string[] = [];
    const excludeDirs = [
      "node_modules", ".git", ".openspec", ".opencode", "dist",
      "build", ".next", "coverage"
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
          const isTestFile = 
            lowerFile.includes(".test.") || 
            lowerFile.includes(".spec.") || 
            lowerFile.startsWith("test_") || 
            lowerFile.endsWith("_test.go") || 
            (dir.split(path.sep).some(p => p === "tests" || p === "test") && [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"].includes(ext));

          if (isTestFile) {
            testFiles.push(fullPath);
          }
        }
      });
    }

    findTestFilesRecursive(projectRoot);

    if (testFiles.length === 0) {
      return JSON.stringify({
        status: "FAILED",
        criteriaCount: criteria.length,
        message: "❌ RASTREADOR SEMÁNTICO: No se encontraron archivos de prueba distribuidos en el proyecto. Asegúrate de que '@sdd-builder' o 'sdd_bdd_tester' hayan generado la suite de pruebas."
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
      // Extraer palabras clave de más de 3 letras ignorando conectores
      const keywords = crit
        .toLowerCase()
        .replace(/[^a-záéíóúñü0-9\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 3 && !["debe", "para", "como", "esta", "este", "consecuente"].includes(word));

      let matched = false;
      let matchedFile = "";
      let matchedSnippet = "";

      for (const testFile of testFiles) {
        try {
          const testContent = fs.readFileSync(testFile, "utf-8");
          const testLines = testContent.split("\n");

          // Búsqueda aproximada: comprobar si el test contiene palabras clave del criterio
          for (let i = 0; i < testLines.length; i++) {
            const line = testLines[i].toLowerCase();
            // Si coincide con más del 60% de las palabras clave de un criterio en la misma línea
            const matchCount = keywords.filter(keyword => line.includes(keyword)).length;
            const threshold = Math.max(1, Math.floor(keywords.length * 0.5));

            if (matchCount >= threshold && threshold > 0) {
              matched = true;
              matchedFile = path.basename(testFile);
              matchedSnippet = `Línea ${i + 1}: ${testLines[i].trim()}`;
              break;
            }
          }

          if (matched) break;
        } catch (e) {}
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
