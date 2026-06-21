import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { execSync, spawn } from "child_process"

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

// Helper to read the targetDir from sdd_state.json or .sdd_bootstrap.json
const getTargetDir = (root: string): string => {
  try {
    const bootstrapPath = path.resolve(root, ".openspec/.sdd_bootstrap.json")
    if (fs.existsSync(bootstrapPath)) {
      const data = JSON.parse(fs.readFileSync(bootstrapPath, "utf8"))
      if (data && data.targetDir) return data.targetDir
    }
  } catch (e) {}

  try {
    const statePath = path.resolve(root, ".openspec/sdd_state.json")
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, "utf8"))
      if (state && state.targetDir) return state.targetDir
    }
  } catch (e) {}

  return "."
}

// ============================================================================
// Unix-style PID/PGID storage in /tmp (bugfix sesion 1176: servidor caia al
// cerrar subagente; ademas chocaba entre proyectos zugzbot simultaneos).
//
// Esquema:
//   /tmp/zugzbot-dev-server-<hash8>        -> PID (referencia principal)
//   /tmp/zugzbot-dev-server-<hash8>.pgid   -> PGID (para kill -SIGTERM -PGID)
//
// hash8 = primeros 8 chars de md5(root) para evitar colisiones entre
// distintos proyectos zugzbot abiertos en paralelo.
// ============================================================================

const projectHash = (root: string): string => {
  return crypto.createHash("md5").update(root).digest("hex").slice(0, 8)
}

const getPidFilePath = (root: string) => {
  return `/tmp/zugzbot-dev-server-${projectHash(root)}`
}
const getPgidFilePath = (root: string) => {
  return `/tmp/zugzbot-dev-server-${projectHash(root)}.pgid`
}

const readPidFiles = (root: string): { pid: number | null; pgid: number | null } => {
  let pid: number | null = null
  let pgid: number | null = null
  try {
    if (fs.existsSync(getPidFilePath(root))) {
      pid = parseInt(fs.readFileSync(getPidFilePath(root), "utf8").trim(), 10)
      if (!Number.isFinite(pid)) pid = null
    }
  } catch (e) {}
  try {
    if (fs.existsSync(getPgidFilePath(root))) {
      pgid = parseInt(fs.readFileSync(getPgidFilePath(root), "utf8").trim(), 10)
      if (!Number.isFinite(pgid)) pgid = null
    }
  } catch (e) {}
  return { pid, pgid }
}

const clearPidFiles = (root: string) => {
  try { fs.unlinkSync(getPidFilePath(root)) } catch (e) {}
  try { fs.unlinkSync(getPgidFilePath(root)) } catch (e) {}
}

const killProcessGroup = (pgid: number, signal: NodeJS.Signals = "SIGTERM"): boolean => {
  try {
    process.kill(-pgid, signal)
    return true
  } catch (e) {
    return false
  }
}

const isPidAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return false
  }
}

// Tool: sdd_free_port
export const free_port = tool({
  description: "Libera un puerto específico de forma forzada.",
  args: {
    port: tool.schema.number().describe("El puerto a liberar (ej. 3000 o 8000)")
  },
  async execute(args, context) {
    const port = args.port
    try {
      const pid = execSync(`lsof -t -i :${port}`).toString().trim()
      if (pid) {
        execSync(`kill -9 ${pid.split('\n').join(' ')}`)
        return JSON.stringify({
          status: "SUCCESS",
          message: `Puerto ${port} liberado. Procesos terminados: ${pid.split('\n').join(', ')}`
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: `Puerto ${port} ya estaba libre (no se encontraron procesos)`
      }, null, 2)
    } catch (e) {
      return JSON.stringify({
        status: "SUCCESS",
        message: `Puerto ${port} está libre`
      }, null, 2)
    }
  }
})

// Tool: sdd_start_server
//
// Bugfix sesion 1176: el dev server caia al cerrar el subagente coder porque
// el proceso hijo hereda el process group del opencode padre y moría con él.
// Solucion: envolver el spawn con `setsid` (disponible en macOS/Linux) para
// crear un nuevo session leader completamente independiente, y guardar tanto
// el PID como el PGID en /tmp para poder matar todo el grupo limpiamente.
export const start_server = tool({
  description:
    "Inicia un servidor en segundo plano y registra su PID/PGID en /tmp. " +
    "El proceso se desacopla del opencode padre con `setsid`, de modo que " +
    "sobrevive al cierre del subagente que lo lanzó (bugfix sesion 1176).",
  args: {
    command: tool.schema.string().describe("Comando para iniciar el servidor (ej. 'yarn dev' o 'npm run dev')"),
    port: tool.schema.number().optional().default(3000).describe("Puerto esperado del servidor (default: 3000)"),
    cwd: tool.schema.string().optional().describe("Directorio de trabajo para ejecutar el comando")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const targetDir = getTargetDir(root)
    const targetCwd = args.cwd ? path.resolve(root, args.cwd) : (targetDir === "." ? root : path.resolve(root, targetDir))
    const pidFile = getPidFilePath(root)
    const pgidFile = getPgidFilePath(root)

    // Liberar puerto si esta ocupado (limpieza previa)
    try {
      const existingPid = execSync(`lsof -t -i :${args.port}`).toString().trim()
      if (existingPid) {
        execSync(`kill -9 ${existingPid.split('\n').join(' ')}`)
      }
    } catch (e) {
      // ignore: puerto libre
    }

    // Si hay un PID previo registrado, intentar matarlo limpiamente primero
    const prev = readPidFiles(root)
    if (prev.pgid && isPidAlive(prev.pgid)) {
      killProcessGroup(prev.pgid, "SIGTERM")
      await new Promise(r => setTimeout(r, 500))
      if (isPidAlive(prev.pgid)) {
        killProcessGroup(prev.pgid, "SIGKILL")
      }
    } else if (prev.pid && isPidAlive(prev.pid)) {
      try { process.kill(prev.pid, "SIGKILL") } catch (e) {}
    }
    clearPidFiles(root)

    const parts = args.command.split(" ")
    const cmd = parts[0]
    const cmdArgs = parts.slice(1)

    // Usar setsid para crear un nuevo session leader. Asi, cuando el subagente
    // coder termine, el dev server no es killed por SIGTERM en cascada.
    // setsid existe en macOS (coreutils) y Linux por defecto.
    const useSetsid = process.platform !== "win32"

    const spawnArgs = useSetsid
      ? { cmd: "setsid", cmdArgs: [cmd, ...cmdArgs] }
      : { cmd, cmdArgs }

    const child = spawn(spawnArgs.cmd, spawnArgs.cmdArgs, {
      cwd: targetCwd,
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        PORT: String(args.port)
      }
    })

    // CRITICO: NO usar child.unref() — necesitamos mantener la referencia
    // para que el proceso no sea reaped inmediatamente y para tener el PGID
    // disponible. Sin embargo, el spawn fue `detached: true` con setsid, asi
    // que el proceso ya esta en su propio session group.
    //
    // El handler exit solo borra los PID files si el proceso muere solo.
    child.on('exit', () => {
      clearPidFiles(root)
    })
    child.on('error', () => {
      clearPidFiles(root)
    })

    const pid = child.pid
    if (pid) {
      // En setsid, el PID del proceso spawned es el PGID del nuevo grupo
      const pgid = pid
      fs.writeFileSync(pidFile, String(pid), "utf8")
      fs.writeFileSync(pgidFile, String(pgid), "utf8")

      // Esperar a que arranque
      await new Promise(resolve => setTimeout(resolve, 3000))

      return JSON.stringify({
        status: "SUCCESS",
        message: `Servidor iniciado con PID ${pid} (PGID ${pgid}) ejecutando '${args.command}' en puerto ${args.port}. PID file: ${pidFile}`,
        pid,
        pgid,
        pid_file: pidFile,
        pgid_file: pgidFile,
        detached_via: useSetsid ? "setsid" : "none"
      }, null, 2)
    }

    return JSON.stringify({
      status: "ERROR",
      message: `No se pudo obtener el PID del proceso para el comando '${args.command}'`
    }, null, 2)
  }
})

// Tool: sdd_stop_server
//
// Mata el grupo de procesos completo (SIGTERM graceful, luego SIGKILL si
// no responde en 2s). Esto libera el puerto automaticamente.
export const stop_server = tool({
  description:
    "Detiene el servidor en segundo plano registrado. Mata el process group " +
    "completo (SIGTERM, fallback SIGKILL tras 2s) usando el PGID guardado en /tmp.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const { pid, pgid } = readPidFiles(root)

    if (!pid && !pgid) {
      return JSON.stringify({
        status: "SUCCESS",
        message: "No hay ningún servidor registrado activo"
      }, null, 2)
    }

    let killed = false
    let signal_used: string | null = null

    if (pgid && isPidAlive(pgid)) {
      // SIGTERM graceful primero
      if (killProcessGroup(pgid, "SIGTERM")) {
        signal_used = "SIGTERM"
        killed = true
      }
      // Esperar hasta 2s
      await new Promise(r => setTimeout(r, 2000))
      // Si sigue vivo, SIGKILL
      if (isPidAlive(pgid)) {
        if (killProcessGroup(pgid, "SIGKILL")) {
          signal_used = signal_used ? `${signal_used}+SIGKILL` : "SIGKILL"
        }
      }
    } else if (pid && isPidAlive(pid)) {
      // Fallback: matar solo el PID
      try { process.kill(pid, "SIGTERM"); signal_used = "SIGTERM"; killed = true } catch (e) {}
      await new Promise(r => setTimeout(r, 2000))
      if (isPidAlive(pid)) {
        try { process.kill(pid, "SIGKILL"); signal_used = "SIGKILL" } catch (e) {}
      }
    }

    clearPidFiles(root)

    return JSON.stringify({
      status: killed ? "SUCCESS" : "WARNING",
      message: killed
        ? `Servidor (PID ${pid}, PGID ${pgid}) terminado via ${signal_used}`
        : `PID/PGID ${pid}/${pgid} no estaba vivo (limpieza de archivos)`,
      pid,
      pgid,
      signal_used
    }, null, 2)
  }
})

// Tool: sdd_server_status (utilidad: NUEVO)
//
// Inspecciona si el dev server sigue vivo leyendo /tmp.
export const server_status = tool({
  description:
    "Verifica si el dev server registrado sigue vivo. Lee los archivos PID/PGID " +
    "de /tmp y consulta el puerto objetivo.",
  args: {
    port: tool.schema.number().optional().default(3000).describe("Puerto esperado del servidor (default: 3000)")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const { pid, pgid } = readPidFiles(root)
    const pidAlive = pid ? isPidAlive(pid) : false
    const pgidAlive = pgid ? isPidAlive(pgid) : false

    let portListening = false
    try {
      const out = execSync(`lsof -i :${args.port} -sTCP:LISTEN -t 2>/dev/null`).toString().trim()
      portListening = !!out
    } catch (e) {
      portListening = false
    }

    return JSON.stringify({
      status: portListening ? "RUNNING" : "STOPPED",
      message: portListening
        ? `Dev server respondiendo en puerto ${args.port}`
        : `No hay dev server activo en puerto ${args.port}`,
      pid_file: getPidFilePath(root),
      pgid_file: getPgidFilePath(root),
      pid,
      pgid,
      pid_alive: pidAlive,
      pgid_alive: pgidAlive,
      port_listening: portListening
    }, null, 2)
  }
})