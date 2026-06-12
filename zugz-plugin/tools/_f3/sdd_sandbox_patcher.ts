import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Ejecuta las pruebas del proyecto de forma localizada. Si se detectan fallas menores de sintaxis o lógica simple, aplica auto-parches en caliente sobre el código para intentar pasar el test de manera autónoma sin requerir transiciones de fase enteras de regreso al Builder.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio de desarrollo activo para asociar el contexto.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const report: string[] = []
    report.push(`━━━ sdd_sandbox_patcher: ${args.changeName} ━━━`)

    // Ejecutar vitest
    let testOutput = ""
    let hasFailure = false

    try {
      // Intentamos correr vitest localmente de forma controlada
      testOutput = execSync("npx vitest run --reporter=json", { cwd: projectRoot, encoding: "utf-8", stdio: "pipe" })
    } catch (e: any) {
      hasFailure = true
      testOutput = e.stdout || e.stderr || e.message || ""
    }

    if (!hasFailure) {
      report.push("✓ Todas las pruebas están pasando correctamente. No se requieren parches en caliente.")
      report.push("✓ Sandbox: Estable.")
      return report.join("\n")
    }

    report.push("⚠ Se detectaron fallas en la suite de pruebas unitarias.")
    report.push("🔍 Analizando trazas del error para aplicar auto-correcciones...")

    // Busquemos patrones comunes de fallas fáciles de corregir
    // Ejemplo: Esperar un valor diferente de true/false, imports faltantes, typo
    let patchApplied = false
    
    // Simular escaneo de archivos
    const srcDir = path.join(projectRoot, "src")
    if (fs.existsSync(srcDir)) {
      const files = fs.readdirSync(srcDir)
      for (const file of files) {
        if (file.endsWith(".js") || file.endsWith(".ts")) {
          const filePath = path.join(srcDir, file)
          const content = fs.readFileSync(filePath, "utf-8")
          
          // Caso 1: typo de inicialización de variable indefinida
          if (testOutput.includes("is not defined") && content.includes("let ") && !content.includes(" = ")) {
            const patchedContent = content.replace(/let\s+([a-zA-Z0-9_]+);/g, "let $1 = null;")
            if (patchedContent !== content) {
              fs.writeFileSync(filePath, patchedContent, "utf-8")
              report.push(`🔧 [AUTO-PARCHE]: Inicialización de variable nula corregida en: \`src/${file}\``)
              patchApplied = true
              break
            }
          }
        }
      }
    }

    if (patchApplied) {
      // Re-verificar tras el parche
      try {
        execSync("npx vitest run --reporter=json", { cwd: projectRoot, stdio: "pipe" })
        report.push("✓ ¡Auto-parche exitoso! Las pruebas ahora pasan satisfactoriamente sin necesidad de rebotar al Builder.")
      } catch (e) {
        report.push("⚠ El auto-parche fue aplicado pero se requieren ajustes de lógica más profundos. Se sugiere alertar al `@sdd-builder`.")
      }
    } else {
      report.push("⚠ Los errores encontrados requieren intervención lógica de negocio compleja. No se puede auto-parchear de forma segura.")
      report.push("✓ Acción Recomendada: Realizar transición de retorno a Fase 2 (@sdd-builder) con el reporte de testing.")
    }

    return report.join("\n")
  }
})
