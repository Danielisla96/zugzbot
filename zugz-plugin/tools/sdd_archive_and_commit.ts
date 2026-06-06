import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import sddInstallAutoskills from "./sdd_install_autoskills"
import { BrainEntry, today, nextId, buildFullBrain, readBrainFile } from "./brain-utils.js"

function bumpVersion(version: string, type: "major" | "minor" | "patch"): string {
  const parts = version.split(".").map(x => parseInt(x, 10))
  if (parts.length !== 3 || parts.some(isNaN)) return version
  if (type === "major") {
    parts[0]++
    parts[1] = 0
    parts[2] = 0
  } else if (type === "minor") {
    parts[1]++
    parts[2] = 0
  } else if (type === "patch") {
    parts[2]++
  }
  return parts.join(".")
}

function moveRecursive(src: string, dest: string) {
  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach(child => {
      moveRecursive(path.join(src, child), path.join(dest, child))
    })
    fs.rmdirSync(src)
  } else {
    fs.renameSync(src, dest)
  }
}

function autoUpdateGitignore(projectRoot: string, report: string[]) {
  const gitignorePath = path.join(projectRoot, ".gitignore")
  let currentRules: string[] = []
  
  if (fs.existsSync(gitignorePath)) {
    try {
      currentRules = fs.readFileSync(gitignorePath, "utf-8")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"))
    } catch {}
  }

  let untrackedLines: string[] = []
  try {
    const stdout = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" })
    untrackedLines = stdout.split("\n")
      .filter(line => line.startsWith("?? "))
      .map(line => line.substring(3).trim())
  } catch (err) {
    return
  }

  if (untrackedLines.length === 0) return

  const rules = [
    { test: /(^|\/)\.DS_Store$/, pattern: ".DS_Store" },
    { test: /(^|\/)node_modules\/?$/, pattern: "node_modules/" },
    { test: /(^|\/)dist\/?$/, pattern: "dist/" },
    { test: /(^|\/)build\/?$/, pattern: "build/" },
    { test: /(^|\/)out\/?$/, pattern: "out/" },
    { test: /(^|\/)target\/?$/, pattern: "target/" },
    { test: /(^|\/)coverage\/?$/, pattern: "coverage/" },
    { test: /(^|\/)\.nyc_output\/?$/, pattern: ".nyc_output/" },
    { test: /\.log$/, pattern: "*.log" },
    { test: /\.tmp$/, pattern: "*.tmp" },
    { test: /\.temp$/, pattern: "*.temp" },
    { test: /(^|\/)\.env(\..+)?$/, pattern: ".env\n.env.*\n.env.local" },
    { test: /(^|\/)__pycache__\/?$/, pattern: "__pycache__/" },
    { test: /\.py[cod]$/, pattern: "*.py[cod]" },
    { test: /(^|\/)\.venv\/?$/, pattern: ".venv/" },
    { test: /(^|\/)venv\/?$/, pattern: "venv/" },
    { test: /(^|\/)env\/?$/, pattern: "env/" },
    { test: /(^|\/)\.pytest_cache\/?$/, pattern: ".pytest_cache/" },
    { test: /\.pem$/, pattern: "*.pem" },
    { test: /\.key$/, pattern: "*.key" }
  ]

  const addedPatterns = new Set<string>()

  for (const item of untrackedLines) {
    let matched = false
    for (const rule of rules) {
      if (rule.test.test(item)) {
        matched = true
        const gitignorePatterns = rule.pattern.split("\n")
        for (const gp of gitignorePatterns) {
          if (!currentRules.includes(gp) && !addedPatterns.has(gp)) {
            addedPatterns.add(gp)
          }
        }
        break
      }
    }

    if (!matched) {
      report.push(`⚠️ Archivo no trackeado detectado: ${item}. Si es un archivo generado, considera agregarlo a tu .gitignore.`)
    }
  }

  if (addedPatterns.size > 0) {
    try {
      let content = ""
      if (fs.existsSync(gitignorePath)) {
        content = fs.readFileSync(gitignorePath, "utf-8")
        if (content && !content.endsWith("\n")) {
          content += "\n"
        }
      }
      content += `\n# Agregado automáticamente por Zugzbot (Detección Inteligente)\n`
      for (const pattern of addedPatterns) {
        content += `${pattern}\n`
        report.push(`✓ Auto-ignorado en .gitignore: ${pattern}`)
      }
      fs.writeFileSync(gitignorePath, content, "utf-8")
    } catch (e: any) {
      report.push(`⚠️ Error actualizando .gitignore: ${e.message}`)
    }
  }
}


export default tool({
  description: "Cierra el ciclo SDD de forma atómica: realiza el bump SemVer, inyecta lecciones en el cerebro, documenta en CHANGELOG, archiva el directorio de cambios y realiza el commit de cierre de Git.",
  args: {
    changeName: tool.schema.string().describe("Nombre del cambio activo (carpeta dentro de .openspec/changes/)"),
    commitMessage: tool.schema.string().describe("Mensaje de commit detallado y semántico (Conventional Commit)"),
    bumpType: tool.schema.enum(["patch", "minor", "major", "none"]).describe("Tipo de incremento de versión semántica"),
    category: tool.schema.string().optional().describe("Categoría del aprendizaje para el cerebro"),
    tag: tool.schema.string().optional().describe("Tag corto del aprendizaje para el cerebro"),
    problem: tool.schema.string().optional().describe("Problema resuelto (máx 120 caracteres)"),
    solution: tool.schema.string().optional().describe("Solución aplicada (máx 300 caracteres)"),
    bypassPendingTasks: tool.schema.boolean().optional().default(false).describe("Ignorar/Bypassear la verificación de tareas pendientes en el lockfile si el usuario aprobó manualmente o es un flujo QA Manual")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    const changeDir = path.join(projectRoot, ".openspec/changes", args.changeName)

    if (!fs.existsSync(changeDir)) {
      return `[SDD Archive Error] No se encontró la carpeta del cambio activo en: ${changeDir}`
    }

    // ── VERIFICACIÓN CRÍTICA DE TAREAS PENDIENTES ──
    const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json")
    if (fs.existsSync(lockfilePath)) {
      try {
        const lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"))
        const isManualQa = lockfile.qa_manual === true || lockfile.manual_qa === true
        const shouldBypass = args.bypassPendingTasks === true || isManualQa

        if (lockfile.tasks && Array.isArray(lockfile.tasks) && lockfile.tasks.length > 0) {
          const pendingTasks = lockfile.tasks.filter((t: any) => t.status === "pending")
          if (pendingTasks.length > 0) {
            if (shouldBypass) {
              // Auto-completar tareas en caliente para dejar el lockfile limpio
              lockfile.tasks.forEach((t: any) => {
                if (t.status === "pending") t.status = "completed"
              })
              fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8")
            } else {
              const pendingList = pendingTasks.map((t: any) => `  ⚠️ [${t.id}] ${t.desc}`).join("\n")
              return `[SDD Archive Blocked] No se puede cerrar el ciclo. Hay ${pendingTasks.length} tarea(s) pendiente(s):\n${pendingList}\n\nPor favor, completa todas las tareas o fuerza el cierre con aprobación explícita del usuario.`
            }
          }
        }
      } catch {}
    }

    const report: string[] = ["━━━ sdd_archive_and_commit ━━━"]

    // 1. SemVer Bump en package.json
    let versionStr = "1.0.0"
    const pkgPath = path.join(projectRoot, "package.json")
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
        const oldVer = pkg.version || "1.0.0"
        if (args.bumpType && args.bumpType !== "none") {
          versionStr = bumpVersion(oldVer, args.bumpType)
          pkg.version = versionStr
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8")
          report.push(`✓ Versión incrementada en package.json: ${oldVer} → ${versionStr}`)
        } else {
          versionStr = oldVer
          report.push(`- Sin cambios en package.json (versión: ${versionStr})`)
        }
      } catch (e: any) {
        report.push(`⚠️ Error leyendo/escribiendo package.json: ${e.message}`)
      }
    }

    // 2. Escribir entrada en CHANGELOG.md
    const changelogPath = path.join(projectRoot, ".openspec/CHANGELOG.md")
    const dateStr = today()
    const changelogEntry = `### [${versionStr}] - ${dateStr}\n- ${args.commitMessage.split("\n")[0]}\n`
    if (fs.existsSync(changelogPath)) {
      try {
        let content = fs.readFileSync(changelogPath, "utf-8")
        const idx = content.indexOf("## ")
        if (idx !== -1) {
          content = content.slice(0, idx) + `## Historial de Versiones\n\n${changelogEntry}\n` + content.slice(idx + "## Historial de Versiones\n".length)
        } else {
          content = content + `\n${changelogEntry}`
        }
        fs.writeFileSync(changelogPath, content, "utf-8")
        report.push(`✓ Registrada versión en .openspec/CHANGELOG.md`)
      } catch (e: any) {
        report.push(`⚠️ Error escribiendo CHANGELOG.md: ${e.message}`)
      }
    } else {
      try {
        const content = `# 📝 CHANGELOG\n\n## Historial de Versiones\n\n${changelogEntry}`
        fs.writeFileSync(changelogPath, content, "utf-8")
        report.push(`✓ Inicializado e indexado .openspec/CHANGELOG.md`)
      } catch (e: any) {
        report.push(`⚠️ Error inicializando CHANGELOG.md: ${e.message}`)
      }
    }

    // 3. Sincronizar lección técnica con brain.md si se proveen datos
    if (args.category && args.tag && args.problem && args.solution) {
      const brainPath = path.join(projectRoot, ".openspec/brain.md")
      try {
        let entries: BrainEntry[] = []
        if (fs.existsSync(brainPath)) {
          const brainData = readBrainFile(brainPath)
          entries = brainData.entries
        }

        const newEntry: BrainEntry = {
          id: nextId(entries),
          category: args.category,
          tag: args.tag,
          problem: args.problem,
          solution: args.solution,
          date: dateStr
        }
        entries.push(newEntry)
        fs.writeFileSync(brainPath, buildFullBrain(entries), "utf-8")
        report.push(`✓ Lección ${newEntry.id} inyectada con éxito en .openspec/brain.md`)
      } catch (e: any) {
        report.push(`⚠️ Error sincronizando cerebro: ${e.message}`)
      }
    }

    // 3.5. Sincronizar habilidades de IA (Autoskills) de forma automática
    try {
      report.push("▶ Buscando y sincronizando habilidades de IA nuevas en base a tus cambios...")
      const skillsOutputObj: any = await sddInstallAutoskills.execute({ action: "install", dryRun: false }, context)
      const skillsOutputStr = typeof skillsOutputObj === "string" ? skillsOutputObj : (skillsOutputObj?.output || "")
      const shortSkillsOutput = skillsOutputStr
        .split("\n")
        .filter((l: string) => l.trim() && !l.startsWith("▶") && !l.startsWith("━━━"))
        .map((l: string) => `  ${l}`)
        .join("\n")
      report.push(`✓ Sincronización de Habilidades Finalizada:\n${shortSkillsOutput || "  No se encontraron nuevas habilidades que instalar."}`)
    } catch (e: any) {
      report.push(`⚠️ Sincronización automática de habilidades fallida o no disponible: ${e.message || e}`)
    }

    // 4. No temporary file is needed on disk, we feed it directly to git commit stdin in step 7.

    // 5. Resetear el lockfile a idle con un estado completamente limpio y fresco (ANTES del commit para incluirlo en el cierre)
    if (fs.existsSync(lockfilePath)) {
      try {
        const lockfile = {
          change_name: "nuevo-cambio",
          active_phase: 0,
          active_subagent: "sdd-explorer",
          status: "idle",
          auto_pilot: false,
          iteration: 0,
          last_updated: dateStr,
          orchestrator_mode: "delegation_only",
          direction: "forward",
          last_successful_phase: 0,
          retry_count: 0,
          corrective_loop_active: false,
          fresh_task: false,
          checkpoints: [],
          tasks: [],
          complexity: "low"
        }
        fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8")
        report.push(`✓ Lockfile .openspec/sdd-lock.json restablecido a 'idle' con valores limpios`)
      } catch (e: any) {
        report.push(`⚠️ No se pudo restablecer el lockfile: ${e.message}`)
      }
    }

    // 5.5. Generar reporte dedicado de tokens y costes para este cambio
    const historyPath = path.join(projectRoot, ".openspec/changes", args.changeName, "phase_history.jsonl");
    if (fs.existsSync(historyPath)) {
      try {
        const lines = fs.readFileSync(historyPath, "utf-8").split("\n").filter(Boolean);
        const entries = lines.map(l => JSON.parse(l));
        let totalCost = 0;
        let totalInput = 0;
        let totalOutput = 0;
        const models = new Set<string>();
        
        entries.forEach((e: any) => {
          if (e.analytics) {
            totalCost = Math.max(totalCost, e.analytics.cumulative_cost_usd || 0);
            totalInput = Math.max(totalInput, e.analytics.cumulative_tokens_input || 0);
            totalOutput = Math.max(totalOutput, e.analytics.cumulative_tokens_output || 0);
            if (Array.isArray(e.analytics.models_used)) {
              e.analytics.models_used.forEach((m: string) => models.add(m));
            }
          }
        });

        const tokenUsageMarkdown = `# 💳 Reporte de Consumo del Cambio: ${args.changeName}

Este reporte detalla la telemetría de tokens y coste financiero en USD acumulado por el enjambre de agentes durante el desarrollo de esta tarea.

## 📊 Métricas de Consumo
- **Coste Total de la Sesión:** $${totalCost.toFixed(4)} USD
- **Tokens de Entrada (Prompt):** ${totalInput.toLocaleString()} tokens
- **Tokens de Salida (Completion):** ${totalOutput.toLocaleString()} tokens
- **Modelos de IA Participantes:** ${Array.from(models).join(", ") || "Ninguno registrado"}

---
*Reporte autogenerado de forma atómica al cierre de la tarea por sdd_archive_and_commit.*
`;
        fs.writeFileSync(path.join(projectRoot, ".openspec/changes", args.changeName, "token_usage.md"), tokenUsageMarkdown, "utf-8");
        report.push(`✓ Reporte de telemetría de tokens generado con éxito en token_usage.md`);
      } catch (e: any) {
        report.push(`⚠️ No se pudo generar el reporte de telemetría de tokens: ${e.message}`);
      }
    }

    // 6. Archivar la carpeta físicamente (ANTES del commit para que quede registrado de forma atómica)
    // Calcular el siguiente prefijo de secuencia cronológica (ej: 0001_2026-05-30_143015)
    let seqPrefix = "0001";
    const archiveRoot = path.join(projectRoot, ".openspec/changes/archive");
    if (fs.existsSync(archiveRoot)) {
      try {
        const dirs = fs.readdirSync(archiveRoot).filter(f => fs.statSync(path.join(archiveRoot, f)).isDirectory());
        let maxSeq = 0;
        dirs.forEach(d => {
          const match = d.match(/^(\d{4})_/);
          if (match) {
            const seq = parseInt(match[1], 10);
            if (seq > maxSeq) maxSeq = seq;
          }
        });
        seqPrefix = String(maxSeq + 1).padStart(4, "0");
      } catch {}
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, ""); // e.g. "143015"
    const archiveFolderName = `${seqPrefix}_${dateStr}_${timeStr}-${args.changeName}`;
    const archiveDir = path.join(archiveRoot, archiveFolderName);

    try {
      if (fs.existsSync(archiveDir)) {
        fs.rmSync(archiveDir, { recursive: true, force: true })
      }
      fs.mkdirSync(path.dirname(archiveDir), { recursive: true })
      moveRecursive(changeDir, archiveDir)
      report.push(`✓ Carpeta archivada en: .openspec/changes/archive/${archiveFolderName}/`)
    } catch (e: any) {
      return `[SDD Archive Error] Error crítico archivando carpetas: ${e.message}`
    }

    // 7. Confirmación Git Atómica (incluye la carpeta archivada y la eliminación de la activa)
    if (fs.existsSync(path.join(projectRoot, ".git"))) {
      try {
        // Detección Inteligente de Gitignore para archivos generados/temporales antes del add/commit
        autoUpdateGitignore(projectRoot, report)

        execSync("git add .", { cwd: projectRoot, stdio: "ignore" })
        execSync("git commit -F -", { cwd: projectRoot, input: args.commitMessage + "\n", stdio: ["pipe", "ignore", "ignore"] })
        report.push(`✓ Commit de Git ejecutado usando el mensaje semántico (incluye archivos archivados)`)
      } catch (e: any) {
        report.push(`⚠️ Git Commit falló o no había cambios pendientes de código: ${e.message}`)
      }
    }

    report.push("━━━ finalizado con éxito absoluto ━━━")
    return report.join("\n")
  }
})
