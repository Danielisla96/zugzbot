import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Traductor de Living Specs BDD: Parsea escenarios 'Given-When-Then' en spec.md y genera automáticamente esqueletos de pruebas reales en la suite del proyecto destino.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Por defecto se autodetectará del sdd-lock."),
    runTests: tool.schema.boolean().optional().describe("Si es true, ejecuta la suite de pruebas local tras la generación.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;

    // 1. Detectar cambio activo
    let changeName = args.changeName;
    if (!changeName) {
      const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
      const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
      let activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);
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
      return `[BDD Tester Blocked] Error: No hay un cambio de desarrollo activo especificado o registrado en el sdd-lock.`;
    }

    // 2. Localizar spec.md
    const changeDir = path.join(projectRoot, ".openspec/changes", changeName);
    let specPath = path.join(changeDir, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md");
    }
    if (!fs.existsSync(specPath)) {
      return `[BDD Tester Blocked] Error: No se pudo localizar el archivo de especificación en '${path.relative(projectRoot, specPath)}'.`;
    }

    // 3. Parsear escenarios Given-When-Then
    const specContent = fs.readFileSync(specPath, "utf-8");
    const scenarios: Array<{ title: string; steps: string[] }> = [];
    
    let currentScenarioTitle = "";
    let currentSteps: string[] = [];

    const lines = specContent.split("\n");
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("Scenario:") || trimmed.startsWith("Escenario:")) {
        if (currentScenarioTitle) {
          scenarios.push({ title: currentScenarioTitle, steps: currentSteps });
        }
        currentScenarioTitle = trimmed.substring(trimmed.indexOf(":") + 1).trim();
        currentSteps = [];
      } else if (currentScenarioTitle && (trimmed.startsWith("Given") || trimmed.startsWith("When") || trimmed.startsWith("Then") || trimmed.startsWith("And") || trimmed.startsWith("Dado") || trimmed.startsWith("Cuando") || trimmed.startsWith("Entonces") || trimmed.startsWith("Y "))) {
        currentSteps.push(trimmed);
      }
    });

    if (currentScenarioTitle) {
      scenarios.push({ title: currentScenarioTitle, steps: currentSteps });
    }

    if (scenarios.length === 0) {
      return `[BDD Tester Complete] Escaneo terminado: No se encontraron bloques estructurados 'Scenario:' o 'Given-When-Then' en spec.md.`;
    }

    // 4. Identificar Entorno y Autogenerar Pruebas
    let testLanguage = "js"; // Default
    let testFilePath = "";
    let generatedCode = "";

    if (fs.existsSync(path.join(projectRoot, "package.json"))) {
      // Node/JS/TS Stack
      const tsconfig = fs.existsSync(path.join(projectRoot, "tsconfig.json"));
      testLanguage = tsconfig ? "ts" : "js";
      
      const testsDir = path.join(projectRoot, "tests");
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
      }

      testFilePath = path.join(testsDir, `sdd_${changeName.replace(/-/g, "_")}.test.${testLanguage}`);

      // Detectar framework de pruebas en package.json de forma inteligente
      let testFrameworkImport = "";
      try {
        const pkgContent = fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8");
        if (pkgContent.includes('"vitest"')) {
          testFrameworkImport = "import { describe, it } from 'vitest';\n";
        }
      } catch (e) {}

      generatedCode = `// ==============================================================================
//  BDD LIVING SPECIFICATION AUTO-GENERATED TEST SUITE
//  Generated for change: ${changeName}
// ==============================================================================
${testFrameworkImport}
describe('SDD Living Spec: ${changeName}', () => {
${scenarios.map(s => `  it('Escenario: ${s.title.replace(/'/g, "\\'")}', () => {
    // BDD Scenario Specification Steps:
${s.steps.map(step => `    // - ${step}`).join("\n")}
    
    // TODO: Implementar validación funcional de código real aquí
  });`).join("\n\n")}
});
`;
    } else if (fs.existsSync(path.join(projectRoot, "requirements.txt")) || fs.existsSync(path.join(projectRoot, "pyproject.toml"))) {
      // Python Stack
      testLanguage = "py";
      const testsDir = path.join(projectRoot, "tests");
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
      }
      testFilePath = path.join(testsDir, `test_sdd_${changeName.replace(/-/g, "_")}.py`);

      generatedCode = `"""
BDD LIVING SPECIFICATION AUTO-GENERATED TEST SUITE
Generated for change: ${changeName}
"""
import unittest

class TestSdd${changeName.replace(/-/g, "").toUpperCase()}(unittest.TestCase):
${scenarios.map((s, idx) => `    def test_scenario_${idx + 1}(self):
        """Escenario: ${s.title}"""
        # BDD Steps:
${s.steps.map(step => `        # - ${step}`).join("\n")}
        
        # TODO: Implementar validación funcional de código real aquí
        pass`).join("\n\n")}

if __name__ == '__main__':
    unittest.main()
`;
    } else {
      return `[BDD Tester Blocked] Error: No se pudo determinar el stack del proyecto (falta package.json o requirements.txt).`;
    }

    fs.writeFileSync(testFilePath, generatedCode, "utf-8");

    let testExecutionOutput = "No ejecutada (runTests = false)";
    if (args.runTests) {
      try {
        if (testLanguage === "ts" || testLanguage === "js") {
          const pkgContent = fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8");
          if (pkgContent.includes('"vitest"')) {
            testExecutionOutput = execSync(`npx vitest run ${testFilePath}`, { encoding: "utf-8" });
          } else {
            testExecutionOutput = execSync(`npx jest ${testFilePath}`, { encoding: "utf-8" });
          }
        } else if (testLanguage === "py") {
          testExecutionOutput = execSync(`python3 -m unittest ${testFilePath}`, { encoding: "utf-8" });
        }
      } catch (e: any) {
        testExecutionOutput = `Fallo en ejecución de pruebas: ${e.stdout || e.message || e}`;
      }
    }

    return `[BDD Tester Complete] Esqueleto de pruebas BDD autogenerado en: ${path.relative(projectRoot, testFilePath)}. Escenarios detectados: ${scenarios.length}.\n\nSalida de Pruebas:\n${testExecutionOutput}`;
  }
})
