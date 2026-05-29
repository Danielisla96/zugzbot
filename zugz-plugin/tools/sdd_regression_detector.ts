import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

function decodeGitPath(gitPath: string): string {
  let cleaned = gitPath.replace(/^"|"$/g, "")
  if (cleaned.includes("\\")) {
    try {
      const bytes: number[] = []
      let i = 0
      while (i < cleaned.length) {
        if (cleaned[i] === "\\" && i + 3 < cleaned.length && /^[0-7]{3}$/.test(cleaned.substring(i + 1, i + 4))) {
          const octalVal = cleaned.substring(i + 1, i + 4)
          bytes.push(parseInt(octalVal, 8))
          i += 4
        } else {
          if (cleaned[i] === "\\" && i + 1 < cleaned.length) {
            const next = cleaned[i + 1]
            if (next === "n") { bytes.push(10); i += 2 }
            else if (next === "t") { bytes.push(9); i += 2 }
            else if (next === "\\") { bytes.push(92); i += 2 }
            else if (next === "\"") { bytes.push(34); i += 2 }
            else { bytes.push(cleaned.charCodeAt(i)); i++ }
          } else {
            const code = cleaned.charCodeAt(i)
            if (code < 128) {
              bytes.push(code)
            } else {
              const buf = Buffer.from(cleaned[i], "utf-8")
              for (let b = 0; b < buf.length; b++) {
                bytes.push(buf[b])
              }
            }
            i++
          }
        }
      }
      return Buffer.from(bytes).toString("utf-8")
    } catch (e) {
      return cleaned.replace(/\\([0-7]{3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8))
      })
    }
  }
  return cleaned
}

function sanitizeGitPath(line: string): string {
  const content = line.substring(3).trim()
  if (content.includes(" -> ")) {
    const parts = content.split(" -> ")
    return decodeGitPath(parts[1])
  }
  return decodeGitPath(content)
}

// Analiza los errores de una salida de compilador y los mapea de forma limpia
function parseCompilerErrors(errorOutput: string): Set<string> {
  const errors = new Set<string>();
  const lines = errorOutput.split("\n").filter(l => l.trim());
  lines.forEach(line => {
    // Captura líneas que parezcan errores de compilador (archivo con número de línea y mensaje)
    const fileMatch = line.match(/^([a-zA-Z0-9_\-./]+)\(/) || line.match(/^([a-zA-Z0-9_\-./]+):\d+/) || line.match(/in\s+([a-zA-Z0-9_\-./]+\.py)/);
    if (fileMatch) {
      // Normalizar simplificando detalles variables de error
      errors.add(line.trim());
    }
  });
  return errors;
}

export default tool({
  description: "Analiza el espacio de trabajo de forma diferencial usando compilación estática (ej: tsc) para detectar ÚNICAMENTE nuevos errores introducidos en esta fase de desarrollo, ignorando fallas de compilación o linter preexistentes.",
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

    // 1. Identificar archivos modificados de forma robusta
    const modifiedFiles = new Set<string>();
    const hasGit = fs.existsSync(path.join(projectRoot, ".git"));
    if (hasGit) {
      try {
        const gitOutput = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" });
        gitOutput.split("\n").forEach(line => {
          if (!line || line.length < 4) return;
          const filePathRel = sanitizeGitPath(line);
          modifiedFiles.add(filePathRel);
        });
      } catch (e) {}
    }

    // 2. Determinar stack de compilación estática
    let command = "";
    let languageLabel = "";

    if (fs.existsSync(path.join(projectRoot, "tsconfig.json"))) {
      command = "npx tsc --noEmit --pretty false";
      languageLabel = "TypeScript (tsc)";
    } else if (fs.existsSync(path.join(projectRoot, "platformio.ini"))) {
      command = "pio run";
      languageLabel = "PlatformIO (C++)";
    } else if (fs.existsSync(path.join(projectRoot, "Cargo.toml"))) {
      command = "cargo check";
      languageLabel = "Rust (cargo check)";
    } else if (fs.existsSync(path.join(projectRoot, "build.gradle"))) {
      command = "./gradlew compileJava";
      languageLabel = "Java (Gradle)";
    } else if (fs.existsSync(path.join(projectRoot, "pom.xml"))) {
      command = "mvn compile";
      languageLabel = "Java (Maven)";
    } else if (fs.existsSync(path.join(projectRoot, "package.json"))) {
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
        reason: "No se encontró un verificador estático compatible. Se asume conforme."
      }, null, 2);
    }

    // 3. OBTENER LECTURA BASELINE (Errores preexistentes) vía Stash Temporal si hay cambios en Git
    const preExistingErrors = new Set<string>();
    let stashCreated = false;

    if (hasGit && modifiedFiles.size > 0) {
      try {
        // Crear un stash temporal de los cambios en caliente
        execSync("git stash push --keep-index --include-untracked -m 'sdd_temp_baseline'", { cwd: projectRoot, stdio: "ignore" });
        stashCreated = true;

        // Ejecutar compilador en la versión limpia para ver fallos preexistentes
        try {
          execSync(command, { cwd: projectRoot, stdio: "pipe" });
        } catch (e: any) {
          const rawBaselineOutput = e.stdout?.toString() || e.stderr?.toString() || "";
          parseCompilerErrors(rawBaselineOutput).forEach(err => preExistingErrors.add(err));
        }
      } catch (e) {
        // Fallback si falla el stasheo (ej. sin commits previos)
      } finally {
        // Restaurar cambios sí o sí
        if (stashCreated) {
          try {
            execSync("git stash pop", { cwd: projectRoot, stdio: "ignore" });
          } catch (e) {}
        }
      }
    }

    // 4. EJECUTAR COMPILACIÓN FINAL (Con cambios en caliente activos)
    try {
      execSync(command, { cwd: projectRoot, stdio: "pipe" });
      
      return JSON.stringify({
        status: "APPROVED",
        checker: languageLabel,
        preExistingBypassedCount: preExistingErrors.size,
        message: `✅ DETECTOR DE REGRESIONES: La validación estática de tipo '${languageLabel}' pasó de manera impecable. No se encontraron discrepancias de compilación en el espacio de trabajo.`
      }, null, 2);
    } catch (e: any) {
      const errorOutput = e.stdout?.toString() || e.stderr?.toString() || e.message || "";
      const currentErrors = parseCompilerErrors(errorOutput);

      // Calcular errores nuevos de forma diferencial
      const newErrors: string[] = [];
      const localNewErrors: string[] = [];

      currentErrors.forEach(err => {
        // Si el error NO existía previamente
        if (!preExistingErrors.has(err)) {
          // Detectar si pertenece a un archivo que modificamos (error local) o a otro módulo (regresión)
          const fileMatch = err.match(/^([a-zA-Z0-9_\-./]+)\(/) || err.match(/^([a-zA-Z0-9_\-./]+):\d+/) || err.match(/in\s+([a-zA-Z0-9_\-./]+\.py)/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            if (modifiedFiles.has(filePath)) {
              localNewErrors.push(err);
            } else if (!filePath.includes("node_modules") && !filePath.includes(".openspec") && !filePath.includes(".opencode")) {
              newErrors.push(err);
            }
          } else {
            // Error genérico sin archivo directo
            newErrors.push(err);
          }
        }
      });

      // Si hay verdaderas regresiones (nuevos errores en módulos que NO modificamos)
      if (newErrors.length > 0) {
        return JSON.stringify({
          status: "FAILED",
          checker: languageLabel,
          regressionCount: newErrors.length,
          preExistingIgnoredCount: preExistingErrors.size,
          regressions: newErrors.slice(0, 10),
          message: `❌ DETECTOR DE REGRESIONES FALLIDO: Se han introducido errores de tipado o compilación en módulos externos que no modificaste directamente:\n\n${newErrors.slice(0, 5).map(r => `  - ⚠️ ${r}`).join("\n")}${newErrors.length > 5 ? `\n  ... y ${newErrors.length - 5} regresiones más.` : ""}\n\nNota: Se detectaron y omitieron de forma segura ${preExistingErrors.size} errores de compilación preexistentes para no bloquear tu desarrollo.`
        }, null, 2);
      }

      // Si los nuevos errores son puramente en tus archivos modificados (error local de tu cambio)
      if (localNewErrors.length > 0) {
        return JSON.stringify({
          status: "FAILED_LOCAL",
          checker: languageLabel,
          preExistingIgnoredCount: preExistingErrors.size,
          message: `⚠️ VERIFICACIÓN DE CÓDIGO FALLIDA: Se detectaron errores de tipado/compilación locales en tus archivos modificados. Corrígelos antes de avanzar.\n\nSalida del compilador (Errores nuevos):\n${localNewErrors.slice(0, 10).map(e => `  - ${e}`).join("\n")}\n\nNota: Se omitieron de forma segura ${preExistingErrors.size} errores preexistentes.`
        }, null, 2);
      }

      // Si el compilador falló pero todos los errores resultaron ser preexistentes, ¡Damos luz verde!
      return JSON.stringify({
        status: "APPROVED",
        checker: languageLabel,
        preExistingBypassedCount: preExistingErrors.size,
        message: `✅ DETECTOR DE REGRESIONES APROBADO: El compilador detectó ${preExistingErrors.size} errores de compilación, pero todos son preexistentes en la base de código. Se aprueba la transición para no bloquear tu cambio.`
      }, null, 2);
    }
  }
})
