import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

interface DryrunIssue {
  severity: "error" | "warning" | "info"
  code: string
  message: string
  file: string
  line?: number
  fix_suggestion?: string
}

interface DockerfileParse {
  fromLines: Array<{ stage: string; image: string; line: number }>
  hasUser: boolean
  hasWorkdir: boolean
  hasExpose: boolean
  hasHealthcheck: boolean
  hasCmd: boolean
  copyPaths: Array<{ src: string; dest: string; line: number; chown: string | null }>
  runCommands: Array<{ cmd: string; line: number }>
  envVars: Array<{ key: string; value: string; line: number }>
  installPatterns: Array<{ pattern: string; line: number; location: string }>
  totalLines: number
}

function parseDockerfile(content: string, _filePath: string): DockerfileParse {
  const result: DockerfileParse = {
    fromLines: [],
    hasUser: false,
    hasWorkdir: false,
    hasExpose: false,
    hasHealthcheck: false,
    hasCmd: false,
    copyPaths: [],
    runCommands: [],
    envVars: [],
    installPatterns: [],
    totalLines: content.split(/\r?\n/).length
  }
  const lines = content.split(/\r?\n/)
  let inRun = false
  let runLine = 0
  let runAcc = ""
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const lineNum = i + 1
    const upper = line.toUpperCase()

    if (upper.startsWith("FROM ")) {
      const m = line.match(/^FROM\s+(\S+)(?:\s+AS\s+(\S+))?/i)
      if (m) {
        result.fromLines.push({
          image: m[1],
          stage: m[2] || m[1],
          line: lineNum
        })
      }
    } else if (upper.startsWith("USER ")) {
      result.hasUser = true
    } else if (upper.startsWith("WORKDIR ")) {
      result.hasWorkdir = true
    } else if (upper.startsWith("EXPOSE ")) {
      result.hasExpose = true
    } else if (upper.startsWith("HEALTHCHECK ")) {
      result.hasHealthcheck = true
    } else if (upper.startsWith("CMD ") || upper.startsWith("ENTRYPOINT ")) {
      result.hasCmd = true
    } else if (upper.startsWith("COPY ") || upper.startsWith("ADD ")) {
      const m = line.match(/^(COPY|ADD)(?:\s+--chown=(\S+))?\s+(\S+)\s+(\S+)/i)
      if (m) {
        result.copyPaths.push({
          src: m[3],
          dest: m[4],
          chown: m[2] || null,
          line: lineNum
        })
      }
    } else if (upper.startsWith("ENV ")) {
      const m = line.match(/^ENV\s+(\S+)\s+(.*)/i)
      if (m) {
        result.envVars.push({ key: m[1], value: m[2], line: lineNum })
      }
    }

    if (upper.startsWith("RUN ")) {
      inRun = true
      runLine = lineNum
      runAcc = line.substring(4)
    } else if (inRun) {
      if (line.endsWith("\\")) {
        runAcc += " " + line.replace(/\\\s*$/, "")
      } else {
        runAcc += " " + line
        result.runCommands.push({ cmd: runAcc.trim(), line: runLine })
        inRun = false
        runAcc = ""
      }
    }
  }
  if (inRun && runAcc) {
    result.runCommands.push({ cmd: runAcc.trim(), line: runLine })
  }

  for (const run of result.runCommands) {
    const cmd = run.cmd
    if (/\bpip\s+install\s+.*--user\b/.test(cmd)) {
      result.installPatterns.push({ pattern: "pip install --user", line: run.line, location: cmd.substring(0, 100) })
    }
    if (/\bnpm\s+install\s+-g\b/.test(cmd)) {
      result.installPatterns.push({ pattern: "npm install -g", line: run.line, location: cmd.substring(0, 100) })
    }
    if (/\bapt(-get)?\s+install\b/.test(cmd)) {
      result.installPatterns.push({ pattern: "apt install (sin sudo)", line: run.line, location: cmd.substring(0, 100) })
    }
  }

  return result
}

function checkUserVsInstallPaths(parse: DockerfileParse): DryrunIssue[] {
  const issues: DryrunIssue[] = []
  if (!parse.hasUser) return issues

  const userMatch = parse.runCommands.find(r => r.cmd.match(/^\s*USER\s+(\S+)/im))
  const userLine = userMatch?.line ?? 0
  const userAfter = parse.runCommands.filter(r => r.line > userLine)
  if (userAfter.length === 0) {
    return [{
      severity: "info",
      code: "USER_NO_FOLLOWING_RUNS",
      message: "USER definido pero no hay RUN después. Asegúrate que el entrypoint corre como no-root.",
      file: "Dockerfile",
      line: userLine
    }]
  }

  for (const run of userAfter) {
    for (const pat of parse.installPatterns) {
      if (run.line === pat.line) {
        issues.push({
          severity: "error",
          code: "USER_INSTALL_PATH_INCOMPATIBLE",
          message: `RUN posterior a USER usa '${pat.pattern}'. Esto instala en /root/.local o /usr/local que puede no ser accesible al usuario no-root.`,
          file: "Dockerfile",
          line: pat.line,
          fix_suggestion: pat.pattern === "pip install --user"
            ? "Cambiar a `pip install --no-cache-dir --prefix=/install` y `COPY --from=builder /install /usr/local` en la stage final."
            : pat.pattern === "npm install -g"
            ? "Cambiar a `npm install --prefix=/install` y copiar /install/node_modules al stage final."
            : "Usar multi-stage build: instalar en builder con --prefix, copiar al stage final, luego USER."
        })
      }
    }
  }

  for (const copy of parse.copyPaths) {
    if (copy.src.startsWith("/root") || copy.dest.startsWith("/root")) {
      issues.push({
        severity: "error",
        code: "COPY_ROOT_INACCESSIBLE",
        message: `COPY desde/hacia /root/... Si USER no es root, este path tiene permisos 700 y será inaccesible.`,
        file: "Dockerfile",
        line: copy.line,
        fix_suggestion: "Copiar a /usr/local o /opt/ y exponer vía ENV PATH."
      })
    }
  }

  return issues
}

function checkExposedPortVsBaseImage(parse: DockerfileParse): DryrunIssue[] {
  const issues: DryrunIssue[] = []
  for (const from of parse.fromLines) {
    if (/alpine/i.test(from.image) && /slim|bookworm|bullseye/i.test(from.image)) {
      issues.push({
        severity: "warning",
        code: "MIXED_BASE_HINTS",
        message: `FROM ${from.image} tiene hints contradictorios (alpine + slim). Verifica que la imagen existe.`,
        file: "Dockerfile",
        line: from.line
      })
    }
  }
  return issues
}

function checkNoCmdOrEntrypoint(parse: DockerfileParse): DryrunIssue[] {
  if (!parse.hasCmd) {
    return [{
      severity: "warning",
      code: "NO_CMD_OR_ENTRYPOINT",
      message: "Dockerfile no define CMD ni ENTRYPOINT. El container se levantará con el comando default de la imagen base, no con tu app.",
      file: "Dockerfile",
      fix_suggestion: "Añadir `CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]` (o equivalente)."
    }]
  }
  return []
}

function checkNoExpose(parse: DockerfileParse): DryrunIssue[] {
  if (!parse.hasExpose) {
    return [{
      severity: "info",
      code: "NO_EXPOSE",
      message: "No hay directiva EXPOSE. Es solo documentación pero ayuda a la legibilidad.",
      file: "Dockerfile"
    }]
  }
  return []
}

function checkMultiStageCopyPath(parse: DockerfileParse): DryrunIssue[] {
  const issues: DryrunIssue[] = []
  const stageNames = new Set(parse.fromLines.map(f => f.stage))
  for (const copy of parse.copyPaths) {
    const m = copy.src.match(/^--from=(\S+)/)
    if (!m) continue
    const fromName = m[1]
    if (stageNames.has(fromName)) continue
    if (parse.fromLines.length === 1) {
      issues.push({
        severity: "warning",
        code: "COPY_FROM_MISSING_MULTISTAGE",
        message: `COPY --from=${fromName} referencia un stage no declarado, pero solo hay 1 stage en el Dockerfile. Probablemente falta una directiva 'FROM <base> AS ${fromName}' previa.`,
        file: "Dockerfile",
        line: copy.line,
        fix_suggestion: `Añadir una stage previa: \`FROM <base-image> AS ${fromName}\` que produzca el artefacto a copiar.`
      })
    } else {
      issues.push({
        severity: "error",
        code: "COPY_FROM_UNKNOWN_STAGE",
        message: `COPY --from=${fromName} referencia un stage no declarado. Stages disponibles: ${Array.from(stageNames).join(", ")}.`,
        file: "Dockerfile",
        line: copy.line,
        fix_suggestion: "Verificar que el stage existe en una directiva FROM AS <name> previa."
      })
    }
  }
  return issues
}

function checkMissingHealthcheck(parse: DockerfileParse): DryrunIssue[] {
  if (parse.hasUser && !parse.hasHealthcheck) {
    return [{
      severity: "info",
      code: "NO_HEALTHCHECK",
      message: "No hay HEALTHCHECK definido. El container no reportará salud a Docker Compose / Kubernetes.",
      file: "Dockerfile",
      fix_suggestion: "Añadir `HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1`."
    }]
  }
  return []
}

function parseDockerCompose(content: string): { services: Array<{ name: string; build: string | null; ports: string[]; user: string | null; volumes: string[] }>; issues: DryrunIssue[] } {
  const issues: DryrunIssue[] = []
  const services: Array<{ name: string; build: string | null; ports: string[]; user: string | null; volumes: string[] }> = []

  const lines = content.split(/\r?\n/)
  type ServiceAccum = { name: string; build: string | null; ports: string[]; user: string | null; volumes: string[]; startIndent: number }
  let stack: Array<{ kind: "root" | "services" | "service" | "key"; name: string; startIndent: number; accum?: ServiceAccum }> = [
    { kind: "root", name: "root", startIndent: -1 }
  ]

  const getIndent = (line: string) => {
    let n = 0
    for (const ch of line) {
      if (ch === " ") n++
      else if (ch === "\t") n += 2
      else break
    }
    return n
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    if (!raw.trim() || raw.trim().startsWith("#")) continue
    const indent = getIndent(raw)
    const trimmed = raw.trim()

    while (stack.length > 1 && stack[stack.length - 1].startIndent >= indent) {
      const popped = stack.pop()!
      if (popped.kind === "service" && popped.accum) {
        services.push(popped.accum)
      }
    }

    if (stack[stack.length - 1].kind === "root" && /^services:\s*$/.test(trimmed)) {
      stack.push({ kind: "services", name: "services", startIndent: indent })
      continue
    }

    if (stack[stack.length - 1].kind === "services") {
      const serviceName = trimmed.match(/^([a-zA-Z0-9_-]+):\s*$/)?.[1]
      if (serviceName) {
        stack.push({
          kind: "service",
          name: serviceName,
          startIndent: indent,
          accum: { name: serviceName, build: null, ports: [], user: null, volumes: [], startIndent: indent }
        })
        continue
      }
    }

    if (stack[stack.length - 1].kind === "service") {
      const svc = stack[stack.length - 1].accum!
      const keyValue = trimmed.match(/^([a-zA-Z_]+):\s*(.*)$/)
      if (keyValue) {
        const key = keyValue[1]
        const val = keyValue[2].trim()
        if (key === "build") {
          svc.build = val || "."
          stack.push({ kind: "key", name: "build", startIndent: indent })
        } else if (key === "user") {
          svc.user = val
          stack.push({ kind: "key", name: "user", startIndent: indent })
        } else if (key === "ports" || key === "volumes") {
          stack.push({ kind: "key", name: key, startIndent: indent })
        }
        continue
      }
      const listItem = trimmed.match(/^-\s*(.+)$/)
      if (listItem) {
        const val = listItem[1].trim().replace(/^['"]|['"]$/g, "")
        const parentKey = stack[stack.length - 2]?.name
        if (parentKey === "ports") {
          const portM = val.match(/^"?(\d+):(\d+)"?$/)
          if (portM) svc.ports.push(`${portM[1]}:${portM[2]}`)
        } else if (parentKey === "volumes") {
          if (val.includes(":")) {
            svc.volumes.push(val)
          }
        }
      }
    }
  }

  while (stack.length > 0) {
    const popped = stack.pop()!
    if (popped.kind === "service" && popped.accum) {
      services.push(popped.accum)
    }
  }

  return { services, issues }
}

export default tool({
  description: `Pre-flight runtime check para archivos de infraestructura. Detecta incompatibilidades entre USER, install paths, COPY --from, healthcheck, etc.

  Acciones:
  - "check_dockerfile": Parsea un Dockerfile y retorna issues con severity, line, fix_suggestion.
  - "check_docker_compose": Parsea docker-compose.yml y valida user, ports, build context.
  - "check_all": Analiza todos los Dockerfiles y compose files del scope del cambio.

  Llamado por F1.5 (spec reviewer), F2-RED (pre-implementación) y F3 (validator). Atrapa bugs ANTES de que lleguen a F4.`,
  args: {
    action: tool.schema.enum(["check_dockerfile", "check_docker_compose", "check_all"])
      .describe("Acción a ejecutar"),
    filePath: tool.schema.string().optional()
      .describe("Path al Dockerfile o docker-compose.yml (para check_dockerfile/check_docker_compose)"),
    scope: tool.schema.string().optional()
      .describe("Subdirectorio a escanear (para check_all). Default: raíz del proyecto.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }

    if (args.action === "check_dockerfile") {
      if (!args.filePath) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'filePath'."
        }, null, 2)
      }
      const fullPath = path.isAbsolute(args.filePath) ? args.filePath : path.join(projectRoot, args.filePath)
      if (!fs.existsSync(fullPath)) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Dockerfile no encontrado en ${fullPath}`
        }, null, 2)
      }
      const content = fs.readFileSync(fullPath, "utf-8")
      const parse = parseDockerfile(content, fullPath)
      const issues: DryrunIssue[] = [
        ...checkUserVsInstallPaths(parse),
        ...checkExposedPortVsBaseImage(parse),
        ...checkNoCmdOrEntrypoint(parse),
        ...checkNoExpose(parse),
        ...checkMultiStageCopyPath(parse),
        ...checkMissingHealthcheck(parse)
      ]
      const errors = issues.filter(i => i.severity === "error").length
      const warnings = issues.filter(i => i.severity === "warning").length
      const infos = issues.filter(i => i.severity === "info").length
      return JSON.stringify({
        status: errors > 0 ? "FAILED" : (warnings > 0 ? "WARNINGS" : "SUCCESS"),
        verdict: errors > 0 ? "BLOCK" : (warnings > 0 ? "REVIEW" : "OK"),
        summary: {
          errors,
          warnings,
          infos,
          total: issues.length
        },
        dockerfile_summary: {
          stages: parse.fromLines.length,
          has_user: parse.hasUser,
          has_workdir: parse.hasWorkdir,
          has_expose: parse.hasExpose,
          has_healthcheck: parse.hasHealthcheck,
          has_cmd: parse.hasCmd,
          install_patterns_detected: parse.installPatterns.map(p => p.pattern)
        },
        issues,
        instruction: errors > 0
          ? "BLOQUEADO: corregir issues error antes de pasar a F4."
          : warnings > 0
          ? "Revisar warnings. Continuar si son aceptables."
          : "OK. Procede con F2-GREEN o F4."
      }, null, 2)
    }

    if (args.action === "check_docker_compose") {
      if (!args.filePath) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'filePath'."
        }, null, 2)
      }
      const fullPath = path.isAbsolute(args.filePath) ? args.filePath : path.join(projectRoot, args.filePath)
      if (!fs.existsSync(fullPath)) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Compose file no encontrado en ${fullPath}`
        }, null, 2)
      }
      const content = fs.readFileSync(fullPath, "utf-8")
      const { services } = parseDockerCompose(content)
      const issues: DryrunIssue[] = []
      for (const svc of services) {
        if (!svc.build) {
          issues.push({
            severity: "error",
            code: "SERVICE_NO_BUILD",
            message: `Service '${svc.name}' no define 'build'. No se puede construir la imagen.`,
            file: path.basename(fullPath)
          })
        }
        if (svc.user && svc.user === "root") {
          issues.push({
            severity: "warning",
            code: "SERVICE_USER_ROOT",
            message: `Service '${svc.name}' declara 'user: root' (workaround de permisos). El Dockerfile debería estar configurado para correr como no-root.`,
            file: path.basename(fullPath)
          })
        }
        if (svc.volumes.length > 0 && !svc.volumes.some(v => v.includes("./"))) {
          issues.push({
            severity: "info",
            code: "NO_BIND_MOUNT",
            message: `Service '${svc.name}' no tiene bind mount tipo './:/app'. Sin esto, hot-reload requiere rebuild.`,
            file: path.basename(fullPath)
          })
        }
      }
      const errors = issues.filter(i => i.severity === "error").length
      return JSON.stringify({
        status: errors > 0 ? "FAILED" : "SUCCESS",
        services_count: services.length,
        services: services.map(s => ({ name: s.name, build: s.build, ports: s.ports, user: s.user })),
        issues,
        summary: { errors, warnings: issues.filter(i => i.severity === "warning").length, infos: issues.filter(i => i.severity === "info").length }
      }, null, 2)
    }

    if (args.action === "check_all") {
      const scopeDir = args.scope
        ? path.join(projectRoot, args.scope)
        : projectRoot
      if (!fs.existsSync(scopeDir)) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Scope no existe: ${scopeDir}`
        }, null, 2)
      }
      const found: Array<{ type: string; path: string }> = []
      const findFiles = (dir: string) => {
        let entries: string[] = []
        try { entries = fs.readdirSync(dir) } catch { return }
        for (const e of entries) {
          if (["node_modules", ".git", ".openspec", ".opencode", "dist", "build", "__pycache__", ".pytest_cache", ".venv", "venv"].includes(e)) continue
          const full = path.join(dir, e)
          let stat: fs.Stats
          try { stat = fs.statSync(full) } catch { continue }
          if (stat.isDirectory()) findFiles(full)
          else if (/^Dockerfile(\.\w+)?$/.test(e) || e === "docker-compose.yml" || e === "docker-compose.yaml" || /^docker-compose\.\w+\.ya?ml$/.test(e)) {
            found.push({ type: /^Dockerfile/.test(e) ? "dockerfile" : "compose", path: path.relative(projectRoot, full) })
          }
        }
      }
      findFiles(scopeDir)
      const results: any[] = []
      for (const f of found) {
        const fullPath = path.join(projectRoot, f.path)
        const content = fs.readFileSync(fullPath, "utf-8")
        if (f.type === "dockerfile") {
          const parse = parseDockerfile(content, fullPath)
          const issues: DryrunIssue[] = [
            ...checkUserVsInstallPaths(parse),
            ...checkExposedPortVsBaseImage(parse),
            ...checkNoCmdOrEntrypoint(parse),
            ...checkNoExpose(parse),
            ...checkMultiStageCopyPath(parse),
            ...checkMissingHealthcheck(parse)
          ]
          results.push({ file: f.path, type: "dockerfile", issues })
        } else {
          const { services } = parseDockerCompose(content)
          const issues: DryrunIssue[] = []
          for (const svc of services) {
            if (!svc.build) issues.push({ severity: "error", code: "SERVICE_NO_BUILD", message: `Service '${svc.name}' no define build.`, file: f.path })
            if (svc.user === "root") issues.push({ severity: "warning", code: "SERVICE_USER_ROOT", message: `Service '${svc.name}' usa user: root (workaround).`, file: f.path })
          }
          results.push({ file: f.path, type: "compose", services_count: services.length, issues })
        }
      }
      const totalErrors = results.reduce((s, r) => s + r.issues.filter((i: DryrunIssue) => i.severity === "error").length, 0)
      return JSON.stringify({
        status: totalErrors > 0 ? "FAILED" : "SUCCESS",
        verdict: totalErrors > 0 ? "BLOCK" : "OK",
        files_scanned: found.length,
        results,
        summary: {
          errors: totalErrors,
          total_issues: results.reduce((s, r) => s + r.issues.length, 0)
        }
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
