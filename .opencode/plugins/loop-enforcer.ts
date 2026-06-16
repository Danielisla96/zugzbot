import { type Plugin } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

const PHASE_ORDER: Record<string, number> = {
  "F0_DETECT": 0,
  "F1_CONTRACT": 1,
  "F2_IMPLEMENTATION": 2,
  "F3_VERIFICATION": 3,
  "F4_DEPLOYMENT": 4
}

// Strict Compilation Barrier (Shift-Left)
const checkCompilation = (projectRoot: string): { success: boolean; error?: string } => {
  if (fs.existsSync(path.resolve(projectRoot, "tsconfig.json"))) {
    try {
      execSync("npx tsc --noEmit", { cwd: projectRoot, stdio: "pipe" })
      return { success: true }
    } catch (e: any) {
      const output = e.stdout?.toString() || e.stderr?.toString() || e.message || ""
      // Block only on genuine TypeScript compiler errors
      if (output.includes("error TS") || output.toLowerCase().includes("typescript error")) {
        return {
          success: false,
          error: `Errores de compilación de TypeScript detectados:\n${output.slice(0, 1500)}`
        }
      }
      // If tsc isn't available or there's a config issue, do not block (best-effort)
      return { success: true }
    }
  }
  return { success: true }
}

// Discard last failed buggy fix attempt if rollback occurs consecutively
const discardLastFailedAttempt = (projectRoot: string): { success: boolean; message?: string } => {
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd: projectRoot, stdio: "ignore" })
    const lastCommitMsg = execSync("git log -1 --pretty=%B", { cwd: projectRoot }).toString().trim()
    if (lastCommitMsg.includes("chore: SDD checkpoint phase")) {
      execSync("git reset --hard HEAD~1", { cwd: projectRoot })
      return {
        success: true,
        message: `[SDD Revert] Se ha descartado el último intento fallido de corrección (revertido al checkpoint: "${lastCommitMsg}").`
      }
    }
  } catch (e: any) {
    return { success: false, message: e.message }
  }
  return { success: false }
}

export const LoopEnforcerPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  let projectRoot = process.cwd();
  if (directory && directory !== "/") projectRoot = directory;
  else if (worktree && worktree !== "/") projectRoot = worktree;

  const stateFilePath = path.resolve(projectRoot, ".openspec/sdd_state.json")

  const getStateFilePath = () => stateFilePath

  const readState = () => {
    const defaultState = {
      phase: "F0_DETECT",
      activeContract: "",
      stack: {
        core: [],
        databases: []
      },
      loopMode: false,
      loopTargetIterations: 1,
      loopCurrentIteration: 1,
      rollbackCount: 0,
      updatedAt: new Date().toISOString()
    }
    try {
      const filePath = getStateFilePath()
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"))
      }
    } catch (e) {
      // ignore
    }
    return defaultState
  }

  const writeState = (state: any) => {
    try {
      const filePath = getStateFilePath()
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      state.updatedAt = new Date().toISOString()
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf8")
    } catch (e) {
      // ignore
    }
  }

  const isLoopModeActive = () => {
    try {
      const state = readState()
      return state.loopMode === true
    } catch (e) {
      return false
    }
  }

  const getAgentName = (sessionId: string): string => {
    try {
      const messages = (client as any).state?.session?.messages?.(sessionId) || []
      // 1. Find agent in latest messages or backward
      for (let j = messages.length - 1; j >= 0; j--) {
        if (messages[j]?.agent) {
          return messages[j].agent
        }
      }
      // 2. Check first user message agent
      const userMsg = messages.find((m: any) => m.role === "user")
      if (userMsg && userMsg.agent) {
        return userMsg.agent
      }
      // 3. Fallback to session info title
      const sessionInfo = (client as any).state?.session?.get?.(sessionId)
      if (sessionInfo?.title) {
        return sessionInfo.title
      }
    } catch (e) {
      // ignore
    }
    return "unknown"
  }

  return {
    "tool.execute.before": async (input, output) => {
      const agentName = getAgentName(input.sessionID)
      const state = readState()

      // 1. Block 'question' tool when in loopMode
      if (input.tool === "question") {
        if (isLoopModeActive()) {
          throw new Error(
            "MECANISMO DE BARRERA ACTIVO: Tienes estrictamente prohibido usar la herramienta 'question' cuando loopMode=true (Modo Autopiloto). Debes tomar las decisiones recomendadas por defecto y transicionar de fase llamando a sdd_set_phase de forma 100% autónoma."
          )
        }
      }

      // 2. Only 'sdd-orchestrator' can trigger sdd_set_phase
      if (input.tool === "sdd_set_phase") {
        if (agentName !== "sdd-orchestrator" && agentName !== "unknown") {
          throw new Error(
            `[SDD Role Violation] El subagente '${agentName}' tiene estrictamente prohibido cambiar la fase del contrato. Solamente '@sdd-orchestrator' puede utilizar la herramienta 'sdd_set_phase'.`
          )
        }

        const targetPhase = output.args?.phase
        if (targetPhase) {
          const currentPhase = state.phase || "F0_DETECT"
          const currentIndex = PHASE_ORDER[currentPhase] ?? 0
          const targetIndex = PHASE_ORDER[targetPhase] ?? 0

          // Rollback: moving backward/staying same, and not completing back to F0_DETECT
          const isRollback = targetIndex <= currentIndex && targetPhase !== "F0_DETECT"
          const loopActive = state.loopMode === true || output.args?.loopMode === true

          // Hard Revert of Git on consecutive failures (rollbackCount >= 1)
          if (loopActive && isRollback && targetPhase === "F2_IMPLEMENTATION") {
            if ((state.rollbackCount || 0) >= 1) {
              const revertResult = discardLastFailedAttempt(projectRoot)
              if (revertResult.success) {
                if (client?.tui?.showToast) {
                  await client.tui.showToast({
                    body: {
                      message: `🔄 SDD: Descartado intento fallido. Revertido a base funcional.`,
                      variant: "warning"
                    }
                  }).catch(() => {})
                }
              }
            }
          }

          // Strict Compilation Barrier (Shift-Left)
          if (targetPhase === "F3_VERIFICATION") {
            const comp = checkCompilation(projectRoot)
            if (!comp.success) {
              throw new Error(
                `[SDD Compilation Barrier] No se puede transicionar a 'F3_VERIFICATION' porque hay errores de compilación de TypeScript en el código fuente de la aplicación. Por favor, corrígelos en la fase F2 antes de continuar:\n\n${comp.error}`
              )
            }
          }

          if (loopActive && isRollback) {
            const newCount = (state.rollbackCount || 0) + 1
            if (newCount > 3) {
              // Circuit Breaker triggered! Deactivate loop mode and throw.
              state.loopMode = false
              state.rollbackCount = 0
              writeState(state)

              throw new Error(
                `[SDD Circuit Breaker] SE HA DETECTADO UN BUCLE INFINITO DE REINTENTOS (${newCount} rollbacks consecutivos en la fase '${targetPhase}'). El Autopiloto se ha DESACTIVADO automáticamente para evitar consumo innecesario de tokens. Por favor, revisa manualmente los errores de test/lint con el usuario.`
              )
            } else {
              state.rollbackCount = newCount
              writeState(state)
            }
          } else if (!isRollback) {
            // Reset rollback count on forward progress
            state.rollbackCount = 0
            writeState(state)
          }
        }
      }

      // 3. Enforce strictly file edits per subagent and phase
      const writeTools = ["write", "edit", "write_to_file", "replace_file_content", "multi_replace_file_content"]
      if (writeTools.includes(input.tool)) {
        const targetFilePath = output.args?.filePath || output.args?.targetFile || ""
        if (!targetFilePath) return

        // Enforcement for sdd-spec-writer
        if (agentName === "sdd-spec-writer") {
          if (state.phase !== "F1_CONTRACT") {
            throw new Error(
              `[SDD Phase Violation] El agente '@sdd-spec-writer' solo tiene permitido modificar archivos en la fase 'F1_CONTRACT'. Fase actual: '${state.phase}'.`
            )
          }
          const isAllowedSpecWriterFile =
            targetFilePath.includes(".openspec/specs/") ||
            targetFilePath.includes(".openspec/DESIGN.md") ||
            targetFilePath.includes(".openspec/design-assets/") ||
            targetFilePath.endsWith("contract-schema.json")

          if (!isAllowedSpecWriterFile) {
            throw new Error(
              `[SDD Role Violation] El agente '@sdd-spec-writer' solo tiene permitido modificar el contrato ('contract.json') o el diseño del spec. Intento de modificar: '${targetFilePath}'`
            )
          }
        }

        // Enforcement for sdd-coder
        if (agentName === "sdd-coder") {
          if (state.phase !== "F2_IMPLEMENTATION") {
            throw new Error(
              `[SDD Phase Violation] El agente '@sdd-coder' solo tiene permitido modificar código en la fase 'F2_IMPLEMENTATION'. Fase actual: '${state.phase}'.`
            )
          }
          if (targetFilePath.includes("contract.json")) {
            throw new Error(
              `[SDD Role Violation] El agente '@sdd-coder' tiene estrictamente prohibido modificar el contrato 'contract.json'.`
            )
          }
        }

        // Enforcement for sdd-tester
        if (agentName === "sdd-tester") {
          if (state.phase !== "F3_VERIFICATION") {
            throw new Error(
              `[SDD Phase Violation] El agente '@sdd-tester' solo tiene permitido modificar pruebas en la fase 'F3_VERIFICATION'. Fase actual: '${state.phase}'.`
            )
          }
          const isTestFile =
            targetFilePath.includes("test") ||
            targetFilePath.includes("spec") ||
            targetFilePath.includes("tests/") ||
            targetFilePath.includes(".openspec/") ||
            targetFilePath.endsWith(".config.ts") ||
            targetFilePath.endsWith(".config.js") ||
            targetFilePath.includes("setup")

          if (!isTestFile) {
            throw new Error(
              `[SDD Role Violation] El agente '@sdd-tester' tiene estrictamente prohibido modificar archivos de código fuente de la aplicación ('${targetFilePath}'). Solo puede modificar archivos de prueba (*.test.ts, *.spec.tsx, etc.) o archivos de configuración de pruebas.`
            )
          }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // 4. Automated git checkpoint on successful phase transitions
      if (input.tool === "sdd_set_phase") {
        try {
          const state = readState()
          if (state.phase === input.args?.phase) {
            try {
              execSync("git rev-parse --is-inside-work-tree", { cwd: projectRoot, stdio: "ignore" })
              execSync("git add .", { cwd: projectRoot })
              execSync(`git commit -m "chore: SDD checkpoint phase ${state.phase}"`, { cwd: projectRoot })
            } catch (gitErr) {
              // ignore if not in a git repo or no changes
            }
          }
        } catch (e) {
          // ignore
        }
      }
    },

    // 5. Intercept first loop message to extract target iterations mechanically
    "chat.message": async (input, output) => {
      try {
        let text = ""
        let textPart: any = null

        // Check parts first (standard OpenCode message text structure)
        if (output.parts && Array.isArray(output.parts)) {
          textPart = output.parts.find((p: any) => p && p.type === "text")
          if (textPart) {
            text = textPart.text || ""
          }
        }

        // Fallback to output.message.content if parts are empty or not populated
        if (!text && output.message && typeof (output.message as any).content === "string") {
          text = (output.message as any).content
        }

        if (text && typeof text === "string" && text.includes("MODO AUTOPILOTO (/loop) ACTIVADO")) {
          const match = text.match(/>\s*(\d+)\s+([\s\S]+)$/m)
          if (match) {
            const targetNum = parseInt(match[1], 10)
            if (!isNaN(targetNum) && targetNum > 0 && targetNum <= 5) {
              // Write target iterations directly to state on disk first
              const state = readState()
              state.loopMode = true
              state.loopTargetIterations = targetNum
              state.loopCurrentIteration = 1
              state.rollbackCount = 0
              writeState(state)

              // Rewrite the message text with the parsed confirmed value
              const rewrittenText = text.replace(
                />\s*(\d+)\s+([\s\S]+)$/m,
                `> [SDD AUTOPILOT CONFIRMED: loopTargetIterations=${targetNum}] Petición del usuario: $2`
              )

              // Update the text in the correct location
              if (textPart) {
                textPart.text = rewrittenText
              } else if (output.message) {
                (output.message as any).content = rewrittenText
              }

              if (client?.tui?.showToast) {
                await client.tui.showToast({
                  body: {
                    message: `⚡ SDD Loop Inicializado: ${targetNum} iteraciones fijadas mecánicamente.`,
                    variant: "success"
                  }
                }).catch(() => {})
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

export default LoopEnforcerPlugin
