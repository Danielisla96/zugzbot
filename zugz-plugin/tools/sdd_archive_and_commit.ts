import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import sddInstallAutoskills from "./sdd_install_autoskills"
import { BrainEntry, parseEntries, today, nextId, buildFullBrain, buildIndex, buildEntryBlock, readBrainFile } from "./brain-utils.js"

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
    const projectRoot = context.worktree || context.directory
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
      } catch (e: any) {}
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
      const skillsOutputObj: any = await sddInstallAutoskills.execute({ dryRun: false }, context)
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

    // 4. Escribir commit_message.txt en location TEMPORAL antes de archivar
    const tempCommitMsgPath = path.join(projectRoot, ".openspec", `commit_msg_${args.changeName}.txt`)
    try {
      fs.writeFileSync(tempCommitMsgPath, args.commitMessage + "\n", "utf-8")
      report.push(`✓ Archivo commit_message.txt generado en location temporal`)
    } catch (e: any) {
      report.push(`⚠️ Error escribiendo commit_message.txt: ${e.message}`)
    }

    // 5. Resetear el lockfile a idle (ANTES del commit para incluirlo en el cierre)
    if (fs.existsSync(lockfilePath)) {
      try {
        const lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"))
        lockfile.active_phase = 0
        lockfile.active_subagent = "sdd-planner"
        lockfile.status = "idle"
        lockfile.last_updated = dateStr
        fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8")
        report.push(`✓ Lockfile .openspec/sdd-lock.json restablecido a 'idle'`)
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
      } catch (e) {}
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
        execSync("git add .", { cwd: projectRoot, stdio: "ignore" })
        execSync(`git commit -F "${tempCommitMsgPath}"`, { cwd: projectRoot, stdio: "ignore" })
        report.push(`✓ Commit de Git ejecutado usando el mensaje semántico (incluye archivos archivados)`)
      } catch (e: any) {
        report.push(`⚠️ Git Commit falló o no había cambios pendientes de código: ${e.message}`)
      }
    }

    // 8. Limpiar archivo temporal de commit message
    try {
      if (fs.existsSync(tempCommitMsgPath)) {
        fs.unlinkSync(tempCommitMsgPath)
      }
    } catch (e: any) {}

    report.push("━━━ finalizado con éxito absoluto ━━━")
    return report.join("\n")
  }
})
