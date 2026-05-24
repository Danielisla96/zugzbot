import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Analiza el espacio de trabajo completo usando compilación estática o verificadores de tipos (ej: tsc --noEmit) para detectar errores introducidos fuera de los archivos directamente modificados.",
  args: {
    runCheck: tool.schema.boolean().optional().default(true).describe("Si es true, ejecuta la validación global de regresiones.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    
    if (!args.runCheck) {
      return JSON.stringify({
        status: "SKIPPED",
        message: "Escaner de regresiones omitido."
      });
    }

    // 1. Identificar archivos modificados en Git para contrastar
    const modifiedFiles = new Set<string>();
    if (fs.existsSync(path.join(projectRoot, ".git"))) {
      try {
        const gitOutput = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" });
        gitOutput.split("\n").forEach(line => {
          const trimmed = line.trim();
          if (trimmed) {
            const filePathRel = trimmed.substring(3).replace(/^"|"$/g, "");
            modifiedFiles.add(filePathRel);
          }
        });
      } catch (e) {}
    }

    // 2. Determinar stack y ejecutar comando de compilación estática / análisis estricto
    let command = "";
    let languageLabel = "";

    if (fs.existsSync(path.join(projectRoot, "tsconfig.json"))) {
      command = "npx tsc --noEmit --pretty false";
      languageLabel = "TypeScript (tsc)";
    } else if (fs.existsSync(path.join(projectRoot, "package.json"))) {
      // Intentar correr el script de lint o compile si existe en package.json
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"));
        if (pkg.scripts?.build) {
          command = "npm run build";
          languageLabel = "JS/TS (npm run build)";
        } else if (pkg.scripts?.lint) {
          command = "npm run lint";
          languageLabel = "JS/TS (npm run lint)";
        }
      } catch (e) {}
    } else if (fs.existsSync(path.join(projectRoot, "requirements.txt")) || fs.existsSync(path.join(projectRoot, "pyproject.toml"))) {
      command = "python3 -m py_compile $(find . -name '*.py' -not -path '*/.*' -not -path '*/node_modules/*')";
      languageLabel = "Python (py_compile)";
    }

    if (!command) {
      return JSON.stringify({
        status: "APPROVED",
        reason: "No se encontró un verificador estático compatible (tsconfig.json, scripts de linter, o python). Se asume conforme."
      }, null, 2);
    }

    // 3. Ejecutar comando y capturar salida
    try {
      execSync(command, { cwd: projectRoot, stdio: "pipe" });
      
      return JSON.stringify({
        status: "APPROVED",
        checker: languageLabel,
        message: `✅ DETECTOR DE REGRESIONES: La validación estática de tipo '${languageLabel}' pasó de manera impecable. No se encontraron discrepancias de compilación en el espacio de trabajo.`
      }, null, 2);
    } catch (e: any) {
      const errorOutput = e.stdout?.toString() || e.stderr?.toString() || e.message || "";
      const lines = errorOutput.split("\n").filter((l: string) => l.trim());

      // Analizar si los errores pertenecen a archivos no modificados por nosotros (regresión)
      const regressions: string[] = [];
      lines.forEach((line: string) => {
        // Intentar detectar si la línea menciona un archivo que NO está en modifiedFiles
        const fileMatch = line.match(/^([a-zA-Z0-9_\-\.\/]+)\(/) || line.match(/^([a-zA-Z0-9_\-\.\/]+):\d+/) || line.match(/in\s+([a-zA-Z0-9_\-\.\/]+\.py)/);
        if (fileMatch) {
          const filePath = fileMatch[1];
          if (!modifiedFiles.has(filePath) && !filePath.includes("node_modules") && !filePath.includes(".openspec") && !filePath.includes(".opencode")) {
            regressions.push(line);
          }
        }
      });

      if (regressions.length > 0) {
        return JSON.stringify({
          status: "FAILED",
          checker: languageLabel,
          regressionCount: regressions.length,
          regressions: regressions.slice(0, 10), // Mostrar primeras 10
          message: `❌ DETECTOR DE REGRESIONES FALLIDO: Se han introducido errores de tipado o compilación en módulos externos que no modificaste directamente:\n\n${regressions.slice(0, 5).map(r => `  - ⚠️ ${r}`).join("\n")}${regressions.length > 5 ? `\n  ... y ${regressions.length - 5} regresiones más.` : ""}\n\nPor favor, revisa tus modificaciones en las firmas de funciones, clases o exportaciones para no romper otras partes del proyecto.`
        }, null, 2);
      }

      // Si falló pero los errores son puramente en los archivos modificados
      return JSON.stringify({
        status: "FAILED_LOCAL",
        checker: languageLabel,
        message: `⚠️ VERIFICACIÓN DE CÓDIGO FALLIDA: Se detectaron errores de tipado/compilación locales en tus archivos modificados. Corrígelos antes de avanzar.\n\nSalida del compilador:\n${lines.slice(0, 10).join("\n")}`
      }, null, 2);
    }
  }
})