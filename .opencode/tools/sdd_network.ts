import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
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

// Helper to get PID file path
const getPidFilePath = (root: string) => {
  return path.resolve(root, ".openspec/dev_server.pid")
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
export const start_server = tool({
  description: "Inicia un servidor en segundo plano y registra su PID.",
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

    try {
      const existingPid = execSync(`lsof -t -i :${args.port}`).toString().trim()
      if (existingPid) {
        execSync(`kill -9 ${existingPid.split('\n').join(' ')}`)
      }
    } catch (e) {
      // ignore
    }

    const parts = args.command.split(" ")
    const cmd = parts[0]
    const cmdArgs = parts.slice(1)

    const child = spawn(cmd, cmdArgs, {
      cwd: targetCwd,
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        PORT: String(args.port)
      }
    })

    child.unref()

    const pid = child.pid
    if (pid) {
      const dir = path.dirname(pidFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(pidFile, String(pid), "utf8")

      await new Promise(resolve => setTimeout(resolve, 3000))

      return JSON.stringify({
        status: "SUCCESS",
        message: `Servidor iniciado con PID ${pid} ejecutando '${args.command}' en puerto ${args.port}`,
        pid
      }, null, 2)
    }

    return JSON.stringify({
      status: "ERROR",
      message: `No se pudo obtener el PID del proceso para el comando '${args.command}'`
    }, null, 2)
  }
})

// Tool: sdd_stop_server
export const stop_server = tool({
  description: "Detiene el servidor en segundo plano registrado.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const pidFile = getPidFilePath(root)

    if (fs.existsSync(pidFile)) {
      try {
        const pidStr = fs.readFileSync(pidFile, "utf8").trim()
        const pid = parseInt(pidStr, 10)
        if (!isNaN(pid)) {
          try {
            process.kill(-pid, "SIGKILL")
          } catch (err) {
            try {
              process.kill(pid, "SIGKILL")
            } catch (err2) {
              // ignore
            }
          }
          fs.unlinkSync(pidFile)
          return JSON.stringify({
            status: "SUCCESS",
            message: `Servidor con PID ${pid} terminado exitosamente`
          }, null, 2)
        }
      } catch (e) {
        return JSON.stringify({
          status: "ERROR",
          message: `Error al intentar detener el servidor: ${(e as Error).message}`
        }, null, 2)
      }
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: "No hay ningún servidor registrado activo"
    }, null, 2)
  }
})
