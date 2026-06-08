import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { readLockfile } from "./sdd_lock_manager.js"

const DESTRUCTIVE_PATTERNS: Array<{ pattern: RegExp; label: string; severity: "high" | "medium" }> = [
  { pattern: /\brm\s+(-[a-zA-Z]*[rfRF][a-zA-Z]*\s+)?\//, label: "rm -rf o rm -f en ruta absoluta", severity: "high" },
  { pattern: /\brm\s+(-[a-zA-Z]*[rfRF][a-zA-Z]*\s+)+/, label: "rm -rf o rm -f con flags compuestos", severity: "high" },
  { pattern: /\brm\s+(-[a-zA-Z]*[rfRF][a-zA-Z]*\s+)?~|\$HOME|%USERPROFILE%/i, label: "rm sobre home directory", severity: "high" },
  { pattern: /\bkill\s+-?9?\s+\d+/, label: "kill -9 sobre PID numérico", severity: "high" },
  { pattern: /\bpkill\s+/, label: "pkill (afecta procesos por nombre)", severity: "high" },
  { pattern: /\bkillall\s+/, label: "killall", severity: "high" },
  { pattern: /\bdd\s+if=/, label: "dd (disk destroyer)", severity: "high" },
  { pattern: /\bmkfs(\.\w+)?\s+/, label: "mkfs (formateo de filesystem)", severity: "high" },
  { pattern: new RegExp(":\\(\\)\\s*\\{[^}]*:\\s*&[^}]*\\}\\s*;"), label: "fork bomb", severity: "high" },
  { pattern: /\bchmod\s+-R\s+777\s+\//, label: "chmod -R 777 en root", severity: "medium" },
  { pattern: /\bchown\s+-R\s+/, label: "chown -R recursivo", severity: "medium" },
  { pattern: /\bgit\s+push\s+.*--force(-with-lease)?\s+origin\s+(main|master|develop)/, label: "git push --force a rama protegida", severity: "high" },
  { pattern: /\bgit\s+reset\s+--hard\s+HEAD~?\d+/, label: "git reset --hard con commits perdidos", severity: "medium" },
  { pattern: /\bcurl\s+.*\|\s*(bash|sh)\b/, label: "curl | bash (ejecución remota sin verificación)", severity: "high" },
  { pattern: /\b(wget|nc|netcat)\s+.*\|\s*(bash|sh)\b/, label: "wget/nc pipe a shell", severity: "high" }
]

interface ActiveChangeScope {
  change_name: string
  allowed_paths: string[]
  branch: string
}

function listChangeFiles(projectRoot: string, changeName: string): string[] {
  if (!changeName) return []
  const changeDir = path.join(projectRoot, ".openspec", "changes", changeName)
  if (!fs.existsSync(changeDir)) return []
  const out: string[] = []
  const walk = (dir: string, relBase: string) => {
    let entries: string[] = []
    try { entries = fs.readdirSync(dir) } catch { return }
    for (const e of entries) {
      const full = path.join(dir, e)
      const rel = path.join(relBase, e)
      let stat: fs.Stats
      try { stat = fs.statSync(full) } catch { continue }
      if (stat.isDirectory()) walk(full, rel)
      else out.push(rel)
    }
  }
  walk(changeDir, ".openspec/changes/" + changeName)
  return out
}

function isWithinChangeScope(cmd: string, changeFiles: string[]): boolean {
  if (changeFiles.length === 0) return false
  for (const cf of changeFiles) {
    if (cmd.includes(cf)) return true
  }
  return false
}

function classifyDestructive(cmd: string): Array<{ pattern: string; severity: string; match: string }> {
  const hits: Array<{ pattern: string; severity: string; match: string }> = []
  for (const p of DESTRUCTIVE_PATTERNS) {
    const m = cmd.match(p.pattern)
    if (m) {
      hits.push({ pattern: p.label, severity: p.severity, match: m[0] })
    }
  }
  return hits
}

function buildContext(projectRoot: string): ActiveChangeScope {
  const lock = readLockfile(projectRoot)
  const allowed = listChangeFiles(projectRoot, lock.change_name)
  return {
    change_name: lock.change_name,
    allowed_paths: allowed,
    branch: lock.git?.branch || ""
  }
}

export default tool({
  description: `Guard de comandos destructivos. Filtra comandos que podrian destruir data fuera del scope del cambio activo.

  Acciones:
  - "check": Evalúa un comando y retorna verdict (SAFE | NEEDS_CONFIRM | BLOCKED).
  - "list_patterns": Lista los patrones destructivos conocidos.

  El guard es agnóstico al cambio activo: lee .openspec/sdd-lock.json para conocer change_name y archivos esperados. Si el comando toca un path dentro de allowed_paths → SAFE. Si toca un patrón destructivo reconocido pero los paths están fuera del scope → NEEDS_CONFIRM (requiere confirm=true del orquestador). Si hay fork bomb, rm -rf /, etc. → BLOCKED sin posibilidad de override.

  Los agentes de despliegue (sdd-deployer) y handyman (aux-handyman) DEBEN invocar este guard antes de ejecutar comandos bash no triviales.`,
  args: {
    action: tool.schema.enum(["check", "list_patterns"])
      .describe("Acción a ejecutar"),
    cmd: tool.schema.string().optional()
      .describe("Comando bash a evaluar (para action=check)"),
    overrideJustification: tool.schema.string().optional()
      .describe("Justificación del agente si considera que el comando es seguro (informativo)")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    if (args.action === "list_patterns") {
      return JSON.stringify({
        status: "SUCCESS",
        count: DESTRUCTIVE_PATTERNS.length,
        patterns: DESTRUCTIVE_PATTERNS.map(p => ({
          pattern: p.pattern.toString(),
          label: p.label,
          severity: p.severity
        }))
      }, null, 2)
    }

    if (args.action === "check") {
      if (!args.cmd) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'cmd'."
        }, null, 2)
      }
      const hits = classifyDestructive(args.cmd)
      const ctx = buildContext(projectRoot)
      const withinScope = isWithinChangeScope(args.cmd, ctx.allowed_paths)

      let verdict: "SAFE" | "NEEDS_CONFIRM" | "BLOCKED" = "SAFE"
      let reason = "Comando no matchea patrones destructivos conocidos."

      if (hits.length > 0) {
        const hasHigh = hits.some(h => h.severity === "high")
        if (hasHigh) {
          verdict = "BLOCKED"
          reason = `Comando matchea patrón(es) severidad HIGH: ${hits.filter(h => h.severity === "high").map(h => h.pattern).join("; ")}. No ejecutable por guard.`
        } else {
          verdict = "NEEDS_CONFIRM"
          reason = `Comando matchea patrón(es) severidad MEDIUM: ${hits.map(h => h.pattern).join("; ")}. Requiere confirmación explícita del orquestador.`
        }
      } else if (withinScope) {
        verdict = "SAFE"
        reason = "Comando afecta paths dentro del scope del cambio activo."
      }

      return JSON.stringify({
        status: "SUCCESS",
        verdict,
        reason,
        command: args.cmd,
        hits,
        change_context: {
          change_name: ctx.change_name,
          branch: ctx.branch,
          files_in_change: ctx.allowed_paths.length
        },
        override_justification: args.overrideJustification || null,
        instructions: verdict === "BLOCKED"
          ? "ABORT: este comando no debe ejecutarse bajo ninguna circunstancia. Reescribe la lógica."
          : verdict === "NEEDS_CONFIRM"
          ? "Detente y pide al usuario confirmación explícita (sdd_lock_manager update con --confirm-destructivo + razón)."
          : "Procede."
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
