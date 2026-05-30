import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import specValidator from "./sdd_spec_validator"
import regressionDetector from "./sdd_regression_detector"
import secretScanner from "./sdd_secret_scanner"
import requirementTracker from "./sdd_requirement_tracker"
import checkDependencyCooldown from "./check_dependency_cooldown"

const SUBAGENT_MAPPING: { [key: number]: string } = {
  0: "sdd-explorer",
  1: "sdd-planner",
  2: "sdd-builder",
  3: "sdd-tester",
  4: "sdd-deployer",
  5: "sdd-archiver"
}

const DEFAULT_LOCKFILE = {
  change_name: "nuevo-cambio",
  active_phase: 0,
  active_subagent: "sdd-explorer",
  status: "idle",
  auto_pilot: false,
  iteration: 0,
  last_updated: "",
  orchestrator_mode: "delegation_only",
  direction: "forward" as "forward" | "backward" | "repeat",
  last_successful_phase: 0,
  retry_count: 0,
  corrective_loop_active: false,
  fresh_task: false,
  checkpoints: []
}

export default tool({
  description: "Tránsiciona de fase en el ciclo Spec-Driven Development (SDD), actualizando el archivo de bloqueo lockfile .openspec/sdd-lock.json de forma segura, e integra control de cambios en Git de forma automática.",
  args: {
    nextPhase: tool.schema.number().describe("El número de la siguiente fase del ciclo SDD (0-5)"),
    status: tool.schema.string().describe("El nuevo estado del ciclo (ej: 'idle', 'in_progress', 'corrective_loop', 'restored')"),
    reason: tool.schema.string().describe("La justificación o explicación resumida de los cambios logrados en esta fase"),
    activeSubagent: tool.schema.string().optional().describe("El subagente activo opcional (ej: 'sdd-planner', 'sdd-builder')"),
    iteration: tool.schema.number().optional().describe("El número de iteración correctiva opcional"),
    changeName: tool.schema.string().optional().describe("El nombre del cambio de desarrollo activo opcional"),
    complexity: tool.schema.enum(["low", "high"]).optional().default("high").describe("La complejidad del cambio de desarrollo activo (low o high)"),
    direction: tool.schema.enum(["forward", "backward", "repeat"]).optional().default("forward").describe("Dirección de la transición: forward (normal), backward (retroceder a fase anterior), repeat (repetir fase actual)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    let lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");

    // Validar si existe .openspec/sdd-lock.json o si es openspec/sdd-lock.json
    if (!fs.existsSync(lockfilePath)) {
      const altPath = path.join(projectRoot, "openspec/sdd-lock.json");
      if (fs.existsSync(altPath)) {
        lockfilePath = altPath;
      } else {
        // Si no existe ninguno, creamos el directorio y el archivo por defecto
        const dirPath = path.join(projectRoot, ".openspec");
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    }

    let lockfile: any = {
      change_name: "nuevo-cambio",
      active_phase: 0,
      active_subagent: "sdd-explorer",
      status: "idle",
      auto_pilot: false,
      iteration: 0,
      last_updated: ""
    };

    if (fs.existsSync(lockfilePath)) {
      try {
        lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"));
        lockfile.orchestrator_mode = lockfile.orchestrator_mode || "delegation_only";
        lockfile.direction = lockfile.direction || "forward";
        lockfile.last_successful_phase = lockfile.last_successful_phase || 0;
        lockfile.retry_count = lockfile.retry_count || 0;
        lockfile.corrective_loop_active = lockfile.corrective_loop_active || false;
        lockfile.fresh_task = lockfile.fresh_task || false;
        lockfile.checkpoints = lockfile.checkpoints || [];
      } catch (e) {
        lockfile = { ...DEFAULT_LOCKFILE };
      }
    } else {
      lockfile = { ...DEFAULT_LOCKFILE };
    }

    const direction = args.direction || lockfile.direction || "forward";

    if (direction === "backward") {
      const previousPhase = Math.max(0, (args.nextPhase || lockfile.active_phase) - 1);
      lockfile.last_successful_phase = previousPhase;
      lockfile.corrective_loop_active = true;
      lockfile.fresh_task = true;
      lockfile.retry_count = 0;
    }

    if (direction === "repeat") {
      lockfile.retry_count = (lockfile.retry_count || 0) + 1;
      lockfile.corrective_loop_active = true;
      lockfile.fresh_task = true;
      if (lockfile.retry_count > 3) {
        return `[SDD Transition Blocked] Se excedió el límite de 3 reintentos para esta fase. Escalando a revisión humana.`;
      }
    }

    if (direction === "forward") {
      lockfile.fresh_task = false;
    }

    const activeChangeName = args.changeName || lockfile.change_name;

    // ── SALVAGUARDAS AUTOMÁTICAS DE METODOLOGÍA SDD ──
    // 1. Transición a Fase 2 (Construcción): Validar spec.md y parsear la checklist de tareas
    if (args.nextPhase === 2 && args.status !== "corrective_loop" && direction === "forward") {
      const specValidationResultObj: any = await specValidator.execute({ changeName: activeChangeName }, context);
      const specValidationResultStr = typeof specValidationResultObj === "string" ? specValidationResultObj : (specValidationResultObj?.output || "");
      try {
        const result = JSON.parse(specValidationResultStr);
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Transición rechazada por falla de calidad del Plano Técnico:\n\n${result.message}`;
        }
      } catch (e) {}

      // Extracción de checklist de tareas desde spec.md para el monitor de estados
      const changeDir = path.join(projectRoot, ".openspec/changes", activeChangeName);
      let specPath = path.join(changeDir, "specs/spec.md");
      if (!fs.existsSync(specPath)) {
        specPath = path.join(changeDir, "spec.md");
      }
      if (fs.existsSync(specPath)) {
        try {
          const specContent = fs.readFileSync(specPath, "utf-8");
          const qaSectionIndex = specContent.search(/##\s*5\s*[\.\s-]?\s*Criterios/i);
          if (qaSectionIndex !== -1) {
            const qaContent = specContent.substring(qaSectionIndex);
            const lines = qaContent.split("\n");
            const parsedTasks: any[] = [];
            let taskId = 1;
            for (const line of lines) {
              if (line.startsWith("##") && !line.includes("## 5.")) {
                break;
              }
              const match = line.match(/^\s*-\s*\[\s*\]\s*(.+)$/i);
              if (match) {
                parsedTasks.push({
                  id: taskId++,
                  desc: match[1].trim(),
                  status: "pending"
                });
              }
            }
            if (parsedTasks.length > 0) {
              lockfile.tasks = parsedTasks;
            }
          }
        } catch (e) {}
      }
    }

    // 2. Transición a Fase 5 (Cierre/Archiver): Validar regresiones de compilación, cobertura de requerimientos, cooldown y actualizar estado de tareas
    if (args.nextPhase === 5 && args.status !== "corrective_loop") {
      // Sincronizar checklist de tareas completadas desde el validation_report.md
      if (lockfile.tasks) {
        const reportPath = path.join(projectRoot, ".openspec/changes", activeChangeName, "validation_report.md");
        if (fs.existsSync(reportPath)) {
          try {
            const reportContent = fs.readFileSync(reportPath, "utf-8");
            // Buscar sección QA con fallback: probar ## QA (template tester) primero,
            // luego ## 3. Correspondencia de Criterios (template anterior), luego buscar - [x] en cualquier parte
            let qaSectionIndex = reportContent.search(/##\s*QA/i);
            if (qaSectionIndex === -1) {
              qaSectionIndex = reportContent.search(/##\s*3\s*[\.\s-]?\s*Correspondencia/i);
            }
            if (qaSectionIndex !== -1) {
              const qaContent = reportContent.substring(qaSectionIndex);
              const lines = qaContent.split("\n");
              let matchedCount = 0;
              for (const line of lines) {
                if (line.startsWith("##") && line !== "## QA" && line.includes("## QA") === false && !line.includes("## 3.")) {
                  break;
                }
                const match = line.match(/^\s*-\s*\[(x|\s)\]\s*(.+)$/i);
                if (match) {
                  const isCompleted = match[1].toLowerCase() === "x";
                  const descClean = match[2].replace(/\*/g, "").trim().toLowerCase();
                  for (const t of lockfile.tasks) {
                    const taskClean = t.desc.toLowerCase();
                    if (descClean.includes(taskClean) || taskClean.includes(descClean)) {
                      t.status = isCompleted ? "completed" : "pending";
                      matchedCount++;
                    }
                  }
                }
              }
            } else {
              // Fallback: buscar - [x] checkboxes en todo el documento
              const lines = reportContent.split("\n");
              for (const line of lines) {
                const match = line.match(/^\s*-\s*\[(x|\s)\]\s*(.+)$/i);
                if (match) {
                  const isCompleted = match[1].toLowerCase() === "x";
                  const descClean = match[2].replace(/\*/g, "").trim().toLowerCase();
                  for (const t of lockfile.tasks) {
                    const taskClean = t.desc.toLowerCase();
                    if (descClean.includes(taskClean) || taskClean.includes(descClean)) {
                      t.status = isCompleted ? "completed" : "pending";
                    }
                  }
                }
              }
            }
          } catch (e) {}
        }
      }

      // A. Validar regresiones de compilación
      const regressionResultObj: any = await regressionDetector.execute({ runCheck: true }, context);
      const regressionResultStr = typeof regressionResultObj === "string" ? regressionResultObj : (regressionResultObj?.output || "");
      try {
        const result = JSON.parse(regressionResultStr);
        if (result.status && result.status.startsWith("FAILED")) {
          return `[SDD Transition Blocked] Transición rechazada por detección de errores o regresiones de compilación:\n\n${result.message}`;
        }
      } catch (e) {}

      // B. Validar cobertura semántica de criterios de aceptación (Requerimientos)
      const requirementResultObj: any = await requirementTracker.execute({ changeName: activeChangeName }, context);
      const requirementResultStr = typeof requirementResultObj === "string" ? requirementResultObj : (requirementResultObj?.output || "");
      try {
        const result = JSON.parse(requirementResultStr);
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Transición rechazada por falta de cobertura de pruebas para los criterios de aceptación:\n\n${result.message}`;
        }
      } catch (e) {}

      // C. Validar Cooldown de dependencias agregadas en package.json en caliente
      if (fs.existsSync(path.join(projectRoot, "package.json")) && fs.existsSync(path.join(projectRoot, ".git"))) {
        try {
          const diffOutput = execSync("git diff HEAD package.json", { cwd: projectRoot, encoding: "utf-8" });
          const addedLines = diffOutput.split("\n").filter(l => l.startsWith("+") && !l.startsWith("+++"));
          const depRegex = /"([^"]+)"\s*:\s*"([^"]+)"/;
          for (const line of addedLines) {
            const match = line.match(depRegex);
            if (match) {
              const pkg = match[1];
              const version = match[2].replace(/[\^~>=]/g, ""); // Limpiar rangos
              if (pkg === "zugzbot-sdd" || pkg.startsWith("@opencode-ai/")) continue;

              const cooldownResultObj: any = await checkDependencyCooldown.execute({ package: pkg, version }, context);
              const cooldownResultStr = typeof cooldownResultObj === "string" ? cooldownResultObj : (cooldownResultObj?.output || "");
              try {
                const cooldownResult = JSON.parse(cooldownResultStr);
                if (cooldownResult.status === "BLOCKED") {
                  return `[SDD Transition Blocked] Transición rechazada por violación de la regla de Cooldown de Dependencias de Terceros:\n\n${cooldownResult.message}`;
                }
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
    }

    // 3. Transición a Fase 0 / Cierre (Commit final): Escanear secretos
    if (args.nextPhase === 0) {
      const secretScanResultObj: any = await secretScanner.execute({ scanAll: false }, context);
      const secretScanResultStr = typeof secretScanResultObj === "string" ? secretScanResultObj : (secretScanResultObj?.output || "");
      try {
        const result = JSON.parse(secretScanResultStr);
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Transición y Git Commit cancelados por advertencia de seguridad (Se encontraron secretos expuestos):\n\n${result.message}`;
        }
      } catch (e) {}
    }

    // Actualizar campos
    lockfile.direction = direction;
    lockfile.active_phase = args.nextPhase;
    lockfile.status = args.status;
    lockfile.last_updated = new Date().toISOString().split('T')[0];

    if (args.activeSubagent) {
      lockfile.active_subagent = args.activeSubagent;
    } else {
      lockfile.active_subagent = SUBAGENT_MAPPING[args.nextPhase] || "sdd-planner";
    }

    if (args.iteration !== undefined) {
      lockfile.iteration = args.iteration;
    }

    if (args.changeName) {
      lockfile.change_name = args.changeName;
    }

    if (args.complexity !== undefined) {
      lockfile.complexity = args.complexity;
    }

    // Escribir los cambios
    fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8");

    // Escribir en el log o auditoría interna del cambio activo si existe el directorio
    if (lockfile.change_name && lockfile.change_name !== "nuevo-cambio") {
      const changeDir = path.join(projectRoot, ".openspec/changes", lockfile.change_name);
      if (fs.existsSync(changeDir)) {
        const historyPath = path.join(changeDir, "phase_history.jsonl");

        // Obtener analíticas de tokens y costos de la sesión desde el servidor OpenCode
        const port = process.env.OPENCODE_PORT || "4096";
        let tokenStats = { cost: 0, input: 0, output: 0 };
        const modelsUsed = new Set<string>();
        try {
          const url = `http://127.0.0.1:${port}/session/${context.sessionID}/message`;
          const response = await fetch(url);
          if (response.ok) {
            const messages: any = await response.json();
            const list = Array.isArray(messages) ? messages : (messages?.data || []);
            list.forEach((msg: any) => {
              const info = msg.info || msg;
              if (info && info.role === "assistant") {
                const cost = typeof info.cost === "number" && Number.isFinite(info.cost) ? info.cost : 0;
                const input = info.tokens?.input ?? 0;
                const output = info.tokens?.output ?? 0;
                tokenStats.cost += cost;
                tokenStats.input += input;
                tokenStats.output += output;

                // Extraer identificador de modelo de IA usado
                const modelVal = info.modelID || (info.model && typeof info.model === "object" ? info.model.modelID : info.model);
                if (modelVal) {
                  modelsUsed.add(String(modelVal));
                }
              }
            });
          }
        } catch (e) {}

        const logEntry = {
          timestamp: new Date().toISOString(),
          phase: args.nextPhase,
          subagent: lockfile.active_subagent,
          status: args.status,
          reason: args.reason,
          iteration: lockfile.iteration || 0,
          analytics: {
            session_id: context.sessionID,
            models_used: Array.from(modelsUsed),
            cumulative_cost_usd: tokenStats.cost,
            cumulative_tokens_input: tokenStats.input,
            cumulative_tokens_output: tokenStats.output
          }
        };
        fs.appendFileSync(historyPath, JSON.stringify(logEntry) + "\n", "utf-8");

        // GENERACIÓN AUTOMÁTICA DEL DASHBOARD DE ANALÍTICAS
        try {
          const lines = fs.readFileSync(historyPath, "utf-8").split("\n").filter(Boolean);
          const historyEntries = lines.map(l => JSON.parse(l));
          
          let totalCost = 0;
          let totalInputTokens = 0;
          let totalOutputTokens = 0;
          const allModels = new Set<string>();
          const phaseCounts: { [key: number]: number } = {};
          
          historyEntries.forEach(entry => {
            if (entry.analytics) {
              totalCost = Math.max(totalCost, entry.analytics.cumulative_cost_usd || 0);
              totalInputTokens = Math.max(totalInputTokens, entry.analytics.cumulative_tokens_input || 0);
              totalOutputTokens = Math.max(totalOutputTokens, entry.analytics.cumulative_tokens_output || 0);
              if (Array.isArray(entry.analytics.models_used)) {
                entry.analytics.models_used.forEach((m: string) => allModels.add(m));
              }
            }
            phaseCounts[entry.phase] = (phaseCounts[entry.phase] || 0) + 1;
          });

          // Crear barras visuales estéticas en consola Markdown
          const budgetLimit = 2.00; // Presupuesto sugerido de $2.00 USD
          const costPercentage = Math.min(100, Math.round((totalCost / budgetLimit) * 100));
          const barLength = 20;
          const filledLength = Math.round((costPercentage / 100) * barLength);
          const emptyLength = barLength - filledLength;
          const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength);

          const analyticsMarkdown = `# 📊 Tablero de Analíticas del Swarm: ${lockfile.change_name}

Este reporte es generado de forma autónoma por la herramienta **sdd_transition** al cierre de cada fase para auditar la economía de tokens, presupuestos y eficiencia del enjambre multi-agente.

> [!NOTE]
> **Resumen Financiero de la Sesión:**
> - **Presupuesto Consumido:** $${totalCost.toFixed(4)} USD
> - **Límite de Presupuesto:** $${budgetLimit.toFixed(2)} USD
> - **Eficiencia de Tokens:** Entrada: ${totalInputTokens.toLocaleString()} | Salida: ${totalOutputTokens.toLocaleString()}
> - **Modelos Utilizados:** ${Array.from(allModels).join(", ") || "Ninguno registrado"}

### 💳 Control de Presupuesto Consumido ($${totalCost.toFixed(4)} / $${budgetLimit.toFixed(2)})
\`\`\`text
[${progressBar}] ${costPercentage}% de límite
\`\`\`

## 🔄 Historial Completo del Swarm (Fases e Iteraciones)

| Marca de Tiempo | Fase | Subagente | Estado | Iteración | Motivo |
| :--- | :--- | :--- | :--- | :--- | :--- |
${historyEntries.map(e => `| ${e.timestamp.split("T")[1].substring(0, 8)} | F${e.phase} | \`@${e.subagent}\` | \`${e.status}\` | ${e.iteration} | ${e.reason} |`).join("\n")}

---

## 📈 Estadísticas de Frecuencia de Fases
- **Fase 0 (Explorer):** ${phaseCounts[0] || 0} visitas.
- **Fase 1 (Planner):** ${phaseCounts[1] || 0} visitas.
- **Fase 2 (Builder):** ${phaseCounts[2] || 0} visitas.
- **Fase 3 (Tester):** ${phaseCounts[3] || 0} visitas.
- **Fase 4 (Deployer):** ${phaseCounts[4] || 0} visitas.
- **Fase 5 (Archiver):** ${phaseCounts[5] || 0} visitas.

*Nota: Múltiples visitas a una misma fase indican reintentos o ciclos correctivos activos.*
`;
          fs.writeFileSync(path.join(projectRoot, ".openspec/analytics.md"), analyticsMarkdown, "utf-8");
        } catch (err) {}
      }
    }

    // INTEGRACIÓN AUTOMÁTICA CON GIT
    let gitStatus = "";
    if (fs.existsSync(path.join(projectRoot, ".git")) && lockfile.change_name && lockfile.change_name !== "nuevo-cambio") {
      try {
        const branchName = `sdd/change-${lockfile.change_name}`;
        
        // 1. Chequear rama actual
        const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
        
        if (currentBranch !== branchName) {
          // Chequear si la rama existe localmente
          let branchExists = false;
          try {
            execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: projectRoot });
            branchExists = true;
          } catch (e) {}

          if (branchExists) {
            execSync(`git checkout ${branchName}`, { cwd: projectRoot, stdio: "ignore" });
          } else {
            execSync(`git checkout -b ${branchName}`, { cwd: projectRoot, stdio: "ignore" });
          }
        }

        // 2. Hacer commit automático de los artefactos .openspec/
        execSync("git add .openspec/", { cwd: projectRoot, stdio: "ignore" });
        
        // Verificar si hay cambios reales preparados en el stage (staged changes)
        const hasStagedChanges = execSync("git diff --cached --name-only", { cwd: projectRoot, encoding: "utf-8" }).trim().length > 0;
        
        if (hasStagedChanges) {
          const commitMsg = `docs(sdd): transición a fase ${args.nextPhase} - ${args.reason.replace(/"/g, '\\"')}`;
          execSync(`git commit -m "${commitMsg}"`, { cwd: projectRoot, stdio: "ignore" });
          gitStatus = ` [Git: Rama '${branchName}' actualizada con commit semántico]`;
        } else {
          gitStatus = ` [Git: Sin cambios nuevos en especificaciones para archivar]`;
        }
      } catch (e: any) {
        gitStatus = ` [Git Warning: No se pudo realizar commit automático: ${e.message || e}]`;
      }
    }

    return `[SDD Tool] Fase transicionada con éxito a Fase ${args.nextPhase} (${lockfile.active_subagent}). Estado: ${args.status}. Motivo: ${args.reason}.${gitStatus}`;
  }
})
