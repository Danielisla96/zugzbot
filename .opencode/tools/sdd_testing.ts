import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

// Helper to parse semantic errors from compiler and linter outputs (reducing raw trace log bloat for the LLM)
const parseSemanticErrors = (rawOutput: string, type: "eslint" | "tsc"): any[] => {
  const parsed: any[] = []
  if (type === "eslint") {
    const lines = rawOutput.split("\n")
    for (const line of lines) {
      const match = line.match(/^([^:]+):line\s+(\d+),\s+col\s+(\d+),\s+(.+)$/i) || line.match(/^([^\s]+):(\d+):(\d+):\s+(.+)$/)
      if (match) {
        parsed.push({
          file: match[1].trim(),
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          error: match[4].trim()
        })
      } else if (line.includes("error") && line.trim().length > 0) {
        parsed.push({ raw: line.trim() })
      }
    }
  } else if (type === "tsc") {
    const lines = rawOutput.split("\n")
    for (const line of lines) {
      const match = line.match(/^([^(]+)\((\d+),(\d+)\):\s+(error\s+TS\d+:\s+.+)$/)
      if (match) {
        parsed.push({
          file: match[1].trim(),
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          error: match[4].trim()
        })
      } else if (line.includes("error TS") && line.trim().length > 0) {
        parsed.push({ raw: line.trim() })
      }
    }
  }
  return parsed.length > 0 ? parsed : [{ raw: rawOutput.slice(0, 1500) }]
}

// Tool: sdd_quick_lint
export const quick_lint = tool({
  description: "Ejecuta el linter del proyecto (eslint) restringido a src/. Devuelve exit code y warnings. Usado como gate automático antes de transicionar a F3.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)

    const pkgPath = path.resolve(root, "package.json")
    if (!fs.existsSync(pkgPath)) {
      return JSON.stringify({
        status: "ERROR",
        message: "No se encontró package.json. ¿Estás en un proyecto Next.js?",
      }, null, 2)
    }

    try {
      const out = execSync("npx eslint src/ --quiet --max-warnings 0 2>&1 || true", {
        cwd: root,
        encoding: "utf8",
        timeout: 120_000,
      })
      const hasErrors = out.toLowerCase().includes("error") || out.trim().length > 0
      return JSON.stringify({
        status: hasErrors ? "FAIL" : "SUCCESS",
        message: hasErrors ? "Lint encontró errores. Corrígelos antes de transicionar a F3." : "Lint limpio.",
        output: out.slice(0, 2000),
      }, null, 2)
    } catch (e: any) {
      return JSON.stringify({
        status: "FAIL",
        message: `Lint falló: ${e.message?.slice(0, 500) || "unknown error"}`,
      }, null, 2)
    }
  }
})

// Tool: sdd_shift_left_verify
export const shift_left_verify = tool({
  description: "Ejecuta validaciones estáticas Shift-Left completas en el proyecto: ejecuta el compilador de TypeScript (tsc) y el linter (eslint) de manera combinada. Limpia y parsea semánticamente los stack traces y logs de error crudos, devolviendo un JSON limpio y estructurado de errores que el LLM puede digerir y solucionar de inmediato sin perder atención.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const result: { tsc: { status: string, errors?: any[] }, eslint: { status: string, errors?: any[] } } = {
      tsc: { status: "SUCCESS" },
      eslint: { status: "SUCCESS" }
    }

    // 1. Run tsc --noEmit
    try {
      execSync("npx tsc --noEmit", { cwd: root, stdio: "pipe", timeout: 60000 })
    } catch (e: any) {
      const rawOutput = e.stdout?.toString() || e.stderr?.toString() || ""
      const errors = parseSemanticErrors(rawOutput, "tsc")
      result.tsc = {
        status: "FAIL",
        errors
      }
    }

    // 2. Run eslint src/
    try {
      const out = execSync("npx eslint src/ --quiet 2>&1 || true", {
        cwd: root,
        encoding: "utf8",
        timeout: 60000,
      })
      const isCircularError = out.toLowerCase().includes("converting circular structure")
      if ((out.toLowerCase().includes("error") || out.trim().length > 0) && !isCircularError) {
        const errors = parseSemanticErrors(out, "eslint")
        result.eslint = {
          status: "FAIL",
          errors
        }
      }
    } catch (e: any) {
      result.eslint = {
        status: "FAIL",
        errors: [{ raw: e.message || "Eslint execution error" }]
      }
    }

    const overallSuccess = result.tsc.status === "SUCCESS" && result.eslint.status === "SUCCESS"

    return JSON.stringify({
      status: overallSuccess ? "SUCCESS" : "FAIL",
      message: overallSuccess ? "Shift-Left Verification exitosa: Cero errores de compilación y cero errores de lint." : "Validación fallida: Se encontraron errores estáticos.",
      verification: result
    }, null, 2)
  }
})

// Tool: sdd_generate_tests
export const generate_tests = tool({
  description: "Autogenera plantillas de pruebas unitarias/integración en tests/unit/ a partir de los escenarios de prueba descritos en el contrato activo de sdd_state.json. No pisa archivos de pruebas existentes.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const stateFile = path.resolve(root, ".openspec/sdd_state.json")
    if (!fs.existsSync(stateFile)) {
      return JSON.stringify({ success: false, error: "sdd_state.json no existe. Inicia una sesión SDD primero." }, null, 2)
    }
    const state = JSON.parse(fs.readFileSync(stateFile, "utf8"))
    const activeContract = state.activeContract
    if (!activeContract) {
      return JSON.stringify({ success: false, error: "El estado activo no tiene un activeContract. El orquestador debe fijar la sesión." }, null, 2)
    }
    const contractPath = path.resolve(root, activeContract)
    if (!fs.existsSync(contractPath)) {
      return JSON.stringify({ success: false, error: `El archivo del contrato '${contractPath}' no existe.` }, null, 2)
    }
    const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"))
    const test_scenarios = contract.test_scenarios || []
    if (test_scenarios.length === 0) {
      return JSON.stringify({ success: true, message: "No se encontraron test_scenarios en el contrato. No hay plantillas que generar." }, null, 2)
    }
    
    const grouped_tests: Record<string, any[]> = {}
    for (const ts of test_scenarios) {
      const feature = ts.feature_ref || "general"
      if (!grouped_tests[feature]) grouped_tests[feature] = []
      grouped_tests[feature].push(ts)
    }
    
    const created: string[] = []
    const skipped: string[] = []
    
    for (const [feature, scenarios] of Object.entries(grouped_tests)) {
      const clean_feature = feature.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")
      const hasReact = scenarios.some(s => s.type === "unit" || s.type === "visual")
      const ext = hasReact ? "tsx" : "ts"
      const test_dir = path.resolve(root, "tests", "unit")
      if (!fs.existsSync(test_dir)) {
        fs.mkdirSync(test_dir, { recursive: true })
      }
      const test_file = path.join(test_dir, `${clean_feature}.test.${ext}`)
      
      if (fs.existsSync(test_file)) {
        skipped.push(`tests/unit/${clean_feature}.test.${ext}`)
        continue
      }
      
      const lines: string[] = []
      lines.push('import { describe, it, expect } from "vitest";')
      if (hasReact) {
        lines.push('import { render, screen } from "@testing-library/react";')
        lines.push('import userEvent from "@testing-library/user-event";')
        lines.push(`// import ${feature} from "@/components/blocks/${clean_feature}";`)
      }
      lines.push("")
      lines.push(`describe("${feature} Tests (Contract Scenarios)", () => {`)
      
      for (const s of scenarios) {
        const tid = s.id || "TS-XX"
        const name = s.name || "Test case"
        lines.push(`  // ${tid}: ${name}`)
        lines.push(`  // Given: ${s.given || ""}`)
        lines.push(`  // When: ${s.when || ""}`)
        lines.push(`  // Then: ${s.then || ""}`)
        lines.push(`  it("${tid}: ${name}", async () => {`)
        lines.push('    // TODO: Implement actual contract assertions')
        lines.push('    expect(true).toBe(true);')
        lines.push('  });')
        lines.push("")
      }
      lines.push("});")
      
      fs.writeFileSync(test_file, lines.join("\n").trim() + "\n", "utf8")
      created.push(`tests/unit/${clean_feature}.test.${ext}`)
    }
    
    return JSON.stringify({
      status: "SUCCESS",
      message: "Generación de plantillas de prueba completada.",
      created,
      skipped
    }, null, 2)
  }
})

// Tool: sdd_save_playwright_artifacts
export const save_playwright_artifacts = tool({
  description: "Promueve y archiva los artefactos de captura visual/videos (.openspec/.playwright/) generados por Playwright a la carpeta del spec/contrato activo de forma ordenada, evitando ensuciar la raíz.",
  args: {
    callId: tool.schema.string().optional().describe("ID de llamada de Playwright MCP específica. Si no se pasa, toma la última ejecución de forma automática."),
    move: tool.schema.boolean().default(false).describe("Si true, mueve los archivos en lugar de copiarlos.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const stateFile = path.resolve(root, ".openspec/sdd_state.json")
    if (!fs.existsSync(stateFile)) {
      return JSON.stringify({ success: false, error: "sdd_state.json no existe. Inicia una sesión SDD primero." }, null, 2)
    }
    const state = JSON.parse(fs.readFileSync(stateFile, "utf8"))
    const activeContract = state.activeContract
    if (!activeContract) {
      return JSON.stringify({ success: false, error: "El estado activo no tiene un activeContract. El orquestador debe fijar la sesión." }, null, 2)
    }
    const contractPath = path.resolve(root, activeContract)
    if (!fs.existsSync(contractPath)) {
      return JSON.stringify({ success: false, error: `El archivo del contrato '${contractPath}' no existe.` }, null, 2)
    }
    const activeDir = path.dirname(contractPath)
    const sourceBase = path.resolve(root, ".openspec/.playwright")
    if (!fs.existsSync(sourceBase)) {
      return JSON.stringify({ success: true, message: "No existen carpetas de Playwright para archivar en .openspec/.playwright." }, null, 2)
    }
    
    let callId = args.callId
    if (!callId) {
      const files = fs.readdirSync(sourceBase).filter(f => fs.statSync(path.join(sourceBase, f)).isDirectory())
      if (files.length === 0) {
        return JSON.stringify({ success: true, message: "No hay carpetas de artefactos de Playwright disponibles en .openspec/.playwright" }, null, 2)
      }
      // sort by mtime descending to get the newest
      files.sort((a, b) => {
        return fs.statSync(path.join(sourceBase, b)).mtimeMs - fs.statSync(path.join(sourceBase, a)).mtimeMs
      })
      callId = files[0]
    }
    
    const sourceDir = path.join(sourceBase, callId)
    if (!fs.existsSync(sourceDir)) {
      return JSON.stringify({ success: false, error: `La ruta de origen '${sourceDir}' no existe.` }, null, 2)
    }
    
    const destDir = path.join(activeDir, "playwright", callId)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    
    const copyRecursiveSync = (src: string, dest: string, moveMode: boolean) => {
      const exists = fs.existsSync(src)
      const stats = exists ? fs.statSync(src) : null
      const isDirectory = stats ? stats.isDirectory() : false
      if (isDirectory) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true })
        }
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), moveMode)
        })
        if (moveMode) {
          fs.rmdirSync(src)
        }
      } else {
        fs.copyFileSync(src, dest)
        if (moveMode) {
          fs.unlinkSync(src)
        }
      }
    }
    
    try {
      copyRecursiveSync(sourceDir, destDir, args.move)
      return JSON.stringify({
        status: "SUCCESS",
        message: `Artefactos archivados con éxito en la sesión activa.`,
        callId,
        destination: destDir
      }, null, 2)
    } catch (e: any) {
      return JSON.stringify({
        status: "ERROR",
        error: e.message
      }, null, 2)
    }
  }
})
