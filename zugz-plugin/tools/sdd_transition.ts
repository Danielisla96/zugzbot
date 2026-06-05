import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { readLockfile, writeLockfile, isValidChangeName, SddLockfile, SCHEMA_VERSION } from "./sdd_lock_manager.js"
import specValidator from "./sdd_spec_validator.js"
import regressionDetector from "./sdd_regression_detector.js"
import secretScanner from "./sdd_secret_scanner.js"
import requirementTracker from "./sdd_requirement_tracker.js"
import checkDependencyCooldown from "./check_dependency_cooldown.js"

export const VALID_PHASES = [
  "F0",
  "F1",
  "F1.5",
  "F2-RED",
  "F2-GREEN",
  "F2-REFACTOR",
  "F3",
  "F4",
  "F5",
  "DONE"
] as const

export const SUBAGENT_FOR_PHASE: Record<string, string> = {
  "F0": "f0-explorer",
  "F1": "f1-planner",
  "F1.5": "f1.5-spec-reviewer",
  "F2-RED": "f2-red-test-writer",
  "F2-GREEN": "f2-green-implementer",
  "F2-REFACTOR": "f2-refactor-improver",
  "F3": "f3-validator",
  "F4": "f4-deployer",
  "F5": "f5-archiver",
  "DONE": ""
}

export const PHASE_ORDER: Record<string, number> = {
  "F0": 0,
  "F1": 1,
  "F1.5": 2,
  "F2-RED": 3,
  "F2-GREEN": 4,
  "F2-REFACTOR": 5,
  "F3": 6,
  "F4": 7,
  "F5": 8,
  "DONE": 9
}

function isValidPhase(p: string): boolean {
  return VALID_PHASES.includes(p as any)
}

function checkTddGate(fromPhase: string, toPhase: string, lock: SddLockfile): string | null {
  if (toPhase === "F2-GREEN" && !lock.tdd.red.completed) {
    return `[SDD Transition Blocked] No puedes entrar a F2-GREEN sin completar F2-RED. tdd.red.completed = false. Escribe tests que fallen primero.`
  }
  if (toPhase === "F2-REFACTOR" && !lock.tdd.green.completed) {
    return `[SDD Transition Blocked] No puedes entrar a F2-REFACTOR sin completar F2-GREEN. tdd.green.completed = false. Implementa el mínimo código que pase los tests primero.`
  }
  if (toPhase === "F3" && !lock.tdd.refactor.completed) {
    return `[SDD Transition Blocked] No puedes entrar a F3 sin completar F2-REFACTOR. tdd.refactor.completed = false. Aplica linter y limpia el código primero.`
  }
  if (fromPhase === "F2-REFACTOR" && toPhase === "F3" && !lock.tdd.refactor.linter_clean) {
    return `[SDD Transition Blocked] El linter no está limpio (tdd.refactor.linter_clean = false). Ejecuta sdd_linter y corrige errores antes de transicionar.`
  }
  return null
}

export default tool({
  description: `Transiciona de fase en el ciclo SDD v2 (Spec-Driven Development agnóstico al stack).
  Maneja la máquina de estados de fases: F0 → F1 → F1.5 → F2-RED → F2-GREEN → F2-REFACTOR → F3 → F4 → F5 → DONE.
  Enforces TDD: no se puede avanzar a F2-GREEN sin F2-RED completo, ni a F2-REFACTOR sin F2-GREEN, etc.
  Valida que change_name sea kebab-case descriptivo.
  Integra control automático de Git (rama sdd/change-<name>, commits de artefactos .openspec/).`,
  args: {
    nextPhase: tool.schema.string()
      .describe("Siguiente fase del ciclo SDD (F0 | F1 | F1.5 | F2-RED | F2-GREEN | F2-REFACTOR | F3 | F4 | F5 | DONE)"),
    status: tool.schema.string()
      .describe("Nuevo estado del ciclo (idle | in_progress | blocked | awaiting_hil | corrective_loop | spec_approved | qa_validated | archived)"),
    reason: tool.schema.string()
      .describe("Justificación breve de la transición"),
    activeSubagent: tool.schema.string().optional()
      .describe("Subagente activo opcional (ej: 'f2-red-test-writer')"),
    iteration: tool.schema.number().optional()
      .describe("Número de iteración correctiva opcional"),
    changeName: tool.schema.string().optional()
      .describe("Nombre del cambio (kebab-case, obligatorio desde F1 en adelante)"),
    workflow: tool.schema.enum(["full-sdd-tdd", "quick-fix", "audit", "refactor", "explain", "oracle"]).optional()
      .describe("Workflow activo (opcional)"),
    direction: tool.schema.enum(["forward", "backward", "repeat"]).optional().default("forward")
      .describe("Dirección: forward (normal), backward (corregir), repeat (reintentar)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory

    if (!isValidPhase(args.nextPhase)) {
      return `[SDD Transition Blocked] Fase '${args.nextPhase}' inválida. Válidas: ${VALID_PHASES.join(", ")}`
    }

    const lock = readLockfile(projectRoot)

    if (args.changeName) {
      if (!isValidChangeName(args.changeName)) {
        return `[SDD Transition Blocked] change_name inválido: '${args.changeName}'. Debe ser kebab-case descriptivo (ej: 'agregar-auth-jwt'). Genéricos como 'nuevo-cambio' están prohibidos.`
      }
      lock.change_name = args.changeName
    }

    if (PHASE_ORDER[args.nextPhase] >= PHASE_ORDER["F1"] && !isValidChangeName(lock.change_name)) {
      return `[SDD Transition Blocked] No se puede entrar a ${args.nextPhase} sin un change_name válido. Actualo vía el argumento 'changeName' antes de transicionar.`
    }

    const direction = args.direction || lock.direction || "forward"

    if (direction === "backward") {
      const currentOrder = PHASE_ORDER[lock.active_phase] ?? 0
      const targetOrder = Math.max(0, currentOrder - 1)
      const previousPhase = Object.entries(PHASE_ORDER).find(([_, o]) => o === targetOrder)?.[0] || "F0"
      lock.last_successful_phase = previousPhase
      lock.corrective_loop_active = true
      lock.fresh_task = true
      lock.retry_count = 0
    }

    if (direction === "repeat") {
      lock.retry_count = (lock.retry_count || 0) + 1
      lock.corrective_loop_active = true
      lock.fresh_task = true
      if (lock.retry_count > 3) {
        return `[SDD Transition Blocked] Se excedió el límite de 3 reintentos para esta fase. Escalando a revisión humana.`
      }
    }

    if (direction === "forward") {
      lock.fresh_task = false
    }

    const tddGate = checkTddGate(lock.active_phase, args.nextPhase, lock)
    if (tddGate) {
      return tddGate
    }

    if (args.nextPhase === "F2-RED" && lock.workflow === "full-sdd-tdd" && args.status !== "spec_approved" && lock.status !== "spec_approved") {
      return `[SDD Transition Blocked] F2-RED solo se activa tras HIL-A (aprobación del spec). Estado actual: '${lock.status}'. El Orquestador debe transicionar primero a 'spec_approved'.`
    }

    if (args.nextPhase === "F1.5" && !fs.existsSync(path.join(projectRoot, ".openspec/changes", lock.change_name, "specs/spec.md"))) {
      return `[SDD Transition Blocked] No existe spec.md para el change '${lock.change_name}'. F1 debe crearlo antes de F1.5.`
    }

    if (args.nextPhase === "F3" && args.status !== "corrective_loop" && direction === "forward") {
      const specValidationResultObj: any = await specValidator.execute({ changeName: lock.change_name }, context)
      const specValidationResultStr = typeof specValidationResultObj === "string"
        ? specValidationResultObj
        : (specValidationResultObj?.output || "")
      try {
        const result = JSON.parse(specValidationResultStr)
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Transición rechazada por falla de calidad del Plano Técnico:\n\n${result.message}`
        }
      } catch {}

      const changeDir = path.join(projectRoot, ".openspec/changes", lock.change_name)
      const specPath = path.join(changeDir, "specs/spec.md")
      if (fs.existsSync(specPath)) {
        try {
          const specContent = fs.readFileSync(specPath, "utf-8")
          const qaSectionIndex = specContent.search(/##\s*5\s*[.\s-]?\s*Criterios/i)
          if (qaSectionIndex !== -1) {
            const qaContent = specContent.substring(qaSectionIndex)
            const lines = qaContent.split("\n")
            const parsedTasks: Array<{ id: number; desc: string; status: "pending" | "completed" | "blocked" }> = []
            let taskId = 1
            for (const line of lines) {
              if (line.startsWith("##") && !line.includes("## 5.")) break
              const match = line.match(/^\s*-\s*\[\s*\]\s*(.+)$/i)
              if (match) {
                parsedTasks.push({
                  id: taskId++,
                  desc: match[1].trim(),
                  status: "pending"
                })
              }
            }
            if (parsedTasks.length > 0) {
              lock.tasks = parsedTasks
            }
          }
        } catch {}
      }
    }

    if (args.nextPhase === "F5" && args.status !== "corrective_loop") {
      if (lock.tasks) {
        const reportPath = path.join(projectRoot, ".openspec/changes", lock.change_name, "validation_report.md")
        if (fs.existsSync(reportPath)) {
          try {
            const reportContent = fs.readFileSync(reportPath, "utf-8")
            let qaSectionIndex = reportContent.search(/##\s*QA/i)
            if (qaSectionIndex === -1) {
              qaSectionIndex = reportContent.search(/##\s*3\s*[.\s-]?\s*Correspondencia/i)
            }
            if (qaSectionIndex !== -1) {
              const qaContent = reportContent.substring(qaSectionIndex)
              const lines = qaContent.split("\n")
              for (const line of lines) {
                if (line.startsWith("##") && line !== "## QA" && !line.includes("## 3.")) break
                const match = line.match(/^\s*-\s*\[(x|\s)\]\s*(.+)$/i)
                if (match) {
                  const isCompleted = match[1].toLowerCase() === "x"
                  const descClean = match[2].replace(/\*/g, "").trim().toLowerCase()
                  for (const t of lock.tasks) {
                    const taskClean = t.desc.toLowerCase()
                    if (descClean.includes(taskClean) || taskClean.includes(descClean)) {
                      t.status = isCompleted ? "completed" : "pending"
                    }
                  }
                }
              }
            }
          } catch {}
        }
      }

      const regressionResultObj: any = await regressionDetector.execute({ runCheck: true }, context)
      const regressionResultStr = typeof regressionResultObj === "string"
        ? regressionResultObj
        : (regressionResultObj?.output || "")
      try {
        const result = JSON.parse(regressionResultStr)
        if (result.status && result.status.startsWith("FAILED")) {
          return `[SDD Transition Blocked] Regresión detectada:\n\n${result.message}`
        }
      } catch {}

      const requirementResultObj: any = await requirementTracker.execute({ changeName: lock.change_name }, context)
      const requirementResultStr = typeof requirementResultObj === "string"
        ? requirementResultObj
        : (requirementResultObj?.output || "")
      try {
        const result = JSON.parse(requirementResultStr)
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Cobertura insuficiente:\n\n${result.message}`
        }
      } catch {}

      if (fs.existsSync(path.join(projectRoot, "package.json")) && fs.existsSync(path.join(projectRoot, ".git"))) {
        try {
          const diffOutput = execSync("git diff HEAD package.json", { cwd: projectRoot, encoding: "utf-8" })
          const addedLines = diffOutput.split("\n").filter(l => l.startsWith("+") && !l.startsWith("+++"))
          const depRegex = /"([^"]+)"\s*:\s*"([^"]+)"/
          for (const line of addedLines) {
            const match = line.match(depRegex)
            if (match) {
              const pkg = match[1]
              const version = match[2].replace(/[\^~>=]/g, "")
              if (pkg === "zugzbot-sdd" || pkg.startsWith("@opencode-ai/")) continue

              const cooldownResultObj: any = await checkDependencyCooldown.execute({ package: pkg, version }, context)
              const cooldownResultStr = typeof cooldownResultObj === "string"
                ? cooldownResultObj
                : (cooldownResultObj?.output || "")
              try {
                const cooldownResult = JSON.parse(cooldownResultStr)
                if (cooldownResult.status === "BLOCKED") {
                  return `[SDD Transition Blocked] Violación de cooldown de dependencias:\n\n${cooldownResult.message}`
                }
              } catch {}
            }
          }
        } catch {}
      }
    }

    if (args.nextPhase === "DONE") {
      const secretScanResultObj: any = await secretScanner.execute({ scanAll: false }, context)
      const secretScanResultStr = typeof secretScanResultObj === "string"
        ? secretScanResultObj
        : (secretScanResultObj?.output || "")
      try {
        const result = JSON.parse(secretScanResultStr)
        if (result.status === "FAILED") {
          return `[SDD Transition Blocked] Secretos detectados en código:\n\n${result.message}`
        }
      } catch {}
    }

    lock.active_phase = args.nextPhase
    lock.status = args.status as SddLockfile["status"]
    lock.direction = direction
    lock.last_updated = new Date().toISOString()
    if (args.activeSubagent) {
      lock.active_subagent = args.activeSubagent
    } else {
      lock.active_subagent = SUBAGENT_FOR_PHASE[args.nextPhase] || lock.active_subagent
    }
    if (args.iteration !== undefined) lock.iteration = args.iteration
    if (args.workflow) lock.workflow = args.workflow

    writeLockfile(projectRoot, lock)

    if (lock.change_name && lock.change_name !== "nuevo-cambio") {
      const changeDir = path.join(projectRoot, ".openspec/changes", lock.change_name)
      if (fs.existsSync(changeDir)) {
        const historyPath = path.join(changeDir, "phase_history.jsonl")
        const logEntry = {
          timestamp: new Date().toISOString(),
          phase: args.nextPhase,
          subagent: lock.active_subagent,
          status: args.status,
          reason: args.reason,
          iteration: lock.iteration || 0,
          schema_version: SCHEMA_VERSION
        }
        try {
          fs.appendFileSync(historyPath, JSON.stringify(logEntry) + "\n", "utf-8")
        } catch {}
      }
    }

    let gitStatus = ""
    if (fs.existsSync(path.join(projectRoot, ".git")) && lock.change_name && isValidChangeName(lock.change_name)) {
      try {
        const branchName = `sdd/change-${lock.change_name}`
        const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim()
        if (currentBranch !== branchName) {
          let branchExists = false
          try {
            execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: projectRoot })
            branchExists = true
          } catch {}

          if (branchExists) {
            execSync(`git checkout ${branchName}`, { cwd: projectRoot, stdio: "ignore" })
          } else {
            execSync(`git checkout -b ${branchName}`, { cwd: projectRoot, stdio: "ignore" })
          }
        }
        execSync("git add .openspec/", { cwd: projectRoot, stdio: "ignore" })
        const hasStagedChanges = execSync("git diff --cached --name-only", { cwd: projectRoot, encoding: "utf-8" }).trim().length > 0
        if (hasStagedChanges) {
          const commitMsg = `docs(sdd): transición a ${args.nextPhase} - ${args.reason.replace(/"/g, '\\"').slice(0, 60)}`
          execSync(`git commit -m "${commitMsg}"`, { cwd: projectRoot, stdio: "ignore" })
          gitStatus = ` [Git: Rama '${branchName}' actualizada]`
        } else {
          gitStatus = ` [Git: Sin cambios nuevos en .openspec/]`
        }
      } catch (e: any) {
        gitStatus = ` [Git Warning: ${e.message || e}]`
      }
    }

    return `[SDD Tool] Transición a ${args.nextPhase} (${lock.active_subagent}). Estado: ${args.status}. Motivo: ${args.reason}.${gitStatus}`
  }
})
