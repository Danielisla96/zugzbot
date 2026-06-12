import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { sanitizeGitPath } from "../_lib/git_utils.js"
import { readLockfile } from "../_core/sdd_lock_manager.js"

export default tool({
  description: "Escanea archivos modificados o listados en Git en busca de posibles fugas de secretos (tokens, llaves privadas, contraseñas en caliente) antes del commit de cierre de la Fase 3.",
  args: {
    scanAll: tool.schema.boolean().optional().default(false).describe("Si es true, escanea todos los archivos de código del proyecto; por defecto solo escanea archivos modificados en Git.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    if (projectRoot === "/" || projectRoot.startsWith("/usr") || projectRoot.startsWith("/System") || projectRoot.startsWith("/private")) {
      return JSON.stringify({
        status: "WARNING",
        reason: "No se permite escanear directorios raíz del sistema para evitar fuga de tokens en el escaneo de secretos."
      }, null, 2);
    }
    const lock = readLockfile(projectRoot);
    const targetRoot = lock.subproject_cwd ? path.join(projectRoot, lock.subproject_cwd) : projectRoot;
    const findings: Array<{ file: string; line: number; type: string; snippet: string }> = [];

    // 1. Obtener la lista de archivos a escanear
    let filesToScan: string[] = [];

    if (args.scanAll) {
      // Escaneo recursivo simple excluyendo carpetas prohibidas
      function scanDirRecursive(dir: string) {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const fullPath = path.join(dir, file);
          let stat;
          try {
            stat = fs.statSync(fullPath);
          } catch (e) {
            return;
          }
          if (stat.isDirectory()) {
            const excludeDirs = [
              "node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage",
              "bin", "boot", "dev", "etc", "home", "lib", "lib64", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"
            ];
            if (!excludeDirs.includes(file)) {
              scanDirRecursive(fullPath);
            }
          } else {
            const ext = path.extname(file).toLowerCase();
            if ([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".json", ".env"].includes(ext)) {
              filesToScan.push(fullPath);
            }
          }
        });
      }
      scanDirRecursive(targetRoot);
    } else {
      // Buscar solo archivos modificados o sin trackear usando Git de forma robusta
      if (fs.existsSync(path.join(projectRoot, ".git"))) {
        try {
          const gitOutput = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" });
          gitOutput.split("\n").forEach(line => {
            if (!line || line.length < 4) return;
            const filePathRel = sanitizeGitPath(line);
            if (lock.subproject_cwd && !filePathRel.startsWith(lock.subproject_cwd)) {
              return;
            }
            const fullPath = path.join(projectRoot, filePathRel);
            if (fs.existsSync(fullPath)) {
              let stat;
              try { stat = fs.statSync(fullPath) } catch (e) { return }
              if (stat.isFile()) {
                const ext = path.extname(fullPath).toLowerCase();
                if ([".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".json", ".env"].includes(ext)) {
                  filesToScan.push(fullPath);
                }
              }
            }
          });
        } catch (e) {
          return JSON.stringify({
            status: "WARNING",
            reason: "Git no disponible o error al consultar git status. Usa scanAll: true."
          }, null, 2);
        }
      } else {
        return JSON.stringify({
          status: "WARNING",
          reason: "No se detectó un repositorio de Git en la raíz del proyecto. Usa scanAll: true para escanear todo el proyecto."
        }, null, 2);
      }
    }

    if (filesToScan.length === 0) {
      return JSON.stringify({
        status: "APPROVED",
        scannedCount: 0,
        message: "✅ ESCANEO DE SEGURIDAD: No se encontraron archivos modificados para escanear."
      }, null, 2);
    }

    // 2. Patrones de secretos de alta confianza
    const secretRegexes = [
      { type: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/ },
      { type: "AWS Secret Access Key", regex: /[^A-Za-z0-9/+=][A-Za-z0-9/+=]{40}[^A-Za-z0-9/+=]/ },
      { type: "Private Key", regex: /-----BEGIN (RSA|EC|PGP|OPENSSH)? PRIVATE KEY-----/i },
      { type: "Slack Token", regex: /xox[bapr]-[0-9]{12}-[a-zA-Z0-9]{24}/ },
      { type: "Stripe API Key", regex: /sk_live_[0-9a-zA-Z]{24}/ },
      { type: "OpenAI API Key", regex: /sk-[a-zA-Z0-9]{48}/ },
      { type: "Google API Key", regex: /AIzaSy[A-Za-z0-9_-]{35}/ },
      { type: "Github Personal Access Token", regex: /ghp_[a-zA-Z0-9]{36}/ },
      { type: "Generic High-Entropy Credential Assignment", regex: /(api_key|secret_key|client_secret|password|access_token|db_pass|auth_token)\s*[:=]\s*["'][a-zA-Z0-9_./-]{16,}["']/i }
    ];

    const ignoreFilter = (line: string): boolean => {
      if (/process\.env/i.test(line)) return true;
      if (/\{env:/i.test(line)) return true;
      if (/\$env:/i.test(line)) return true;
      if (/"Authorization"\s*:\s*["']Bearer /i.test(line) && line.includes("env")) return true;
      return false;
    };

    // 3. Escaneo de archivos
    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (ignoreFilter(line)) return;

          secretRegexes.forEach(pattern => {
            const match = line.match(pattern.regex);
            if (match) {
              const relPath = path.relative(projectRoot, file);
              const matchedStr = match[0];
              const redacted = matchedStr.length > 8 
                ? matchedStr.substring(0, 4) + "..." + matchedStr.substring(matchedStr.length - 4)
                : "****";
              
              findings.push({
                file: relPath,
                line: index + 1,
                type: pattern.type,
                snippet: line.trim().replace(matchedStr, redacted)
              });
            }
          });
        });
      } catch (e) {}
    });

    if (findings.length > 0) {
      return JSON.stringify({
        status: "FAILED",
        scannedCount: filesToScan.length,
        findingsCount: findings.length,
        findings,
        message: `❌ ESCANEO DE SEGURIDAD FALLIDO: Se detectaron ${findings.length} posibles fugas de secretos en archivos modificados:\n\n${findings.map(f => `  - 📁 [${f.file} : Línea ${f.line}] - Tipo: ${f.type}\n    Línea: "${f.snippet}"`).join("\n\n")}\n\nPor favor, remueve estos secretos en caliente antes de archivar y realizar commits.`
      }, null, 2);
    }

    return JSON.stringify({
      status: "APPROVED",
      scannedCount: filesToScan.length,
      message: `✅ ESCANEO DE SEGURIDAD EXITOSO: Se escanearon ${filesToScan.length} archivos y no se detectaron credenciales ni secretos en caliente. ¡Estabilidad y cumplimiento impecables!`
    }, null, 2);
  }
})
