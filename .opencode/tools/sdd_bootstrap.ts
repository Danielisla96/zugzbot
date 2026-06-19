import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Constants
const BOOTSTRAP_STATUS_PATH = ".openspec/.sdd_bootstrap.json"
const TEMPLATE_VERSION = "1.0.0"
const MIN_NODE_VERSION = "v20.9.0"  // Next.js 16 requirement
const MIN_PYTHON_VERSION = "3.11"   // FastAPI modern syntax (X | Y unions, etc.)

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

function readBootstrapStatus(root: string): any | null {
  const statusPath = path.resolve(root, BOOTSTRAP_STATUS_PATH)
  try {
    if (fs.existsSync(statusPath)) {
      return JSON.parse(fs.readFileSync(statusPath, "utf8"))
    }
  } catch (e) { /* ignore */ }
  return null
}

function writeBootstrapStatus(root: string, status: any): void {
  const statusPath = path.resolve(root, BOOTSTRAP_STATUS_PATH)
  const dir = path.dirname(statusPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2), "utf8")
}

function detectPackageManager(root: string): "pnpm" | "yarn" | "npm" {
  if (fs.existsSync(path.resolve(root, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.resolve(root, "yarn.lock"))) return "yarn"
  return "npm"
}

function getNodeVersion(): string {
  try {
    return execSync("node --version", { encoding: "utf8" }).trim()
  } catch {
    return "unknown"
  }
}

function semverMajor(version: string): number {
  const m = version.replace(/^v/, "").match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : 0
}

function getPythonVersion(): string {
  for (const cmd of ["python3 --version", "python --version"]) {
    try {
      const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
      const m = out.match(/Python\s+(\d+\.\d+(?:\.\d+)?)/i)
      if (m) return m[1]
    } catch {
      // ignore
    }
  }
  return "unknown"
}

function checkPythonVersion(): { ok: boolean; version: string; message: string } {
  const version = getPythonVersion()
  if (version === "unknown") {
    return {
      ok: false,
      version,
      message: `No se detectó Python en PATH. Instala Python >= ${MIN_PYTHON_VERSION} antes de continuar.`,
    }
  }
  const parts = version.split(".")
  const major = parseInt(parts[0], 10)
  const minor = parseInt(parts[1] || "0", 10)
  const minParts = MIN_PYTHON_VERSION.split(".").map((n) => parseInt(n, 10))
  const ok = major > minParts[0] || (major === minParts[0] && minor >= minParts[1])
  if (!ok) {
    return {
      ok: false,
      version,
      message: `Python ${version} detectado. FastAPI moderno requiere >= ${MIN_PYTHON_VERSION}. Actualiza Python antes de continuar.`,
    }
  }
  return { ok: true, version, message: "OK" }
}

function detectPythonPackageManager(root: string): "uv" | "pip" {
  try {
    execSync("uv --version", { stdio: "ignore" })
    return "uv"
  } catch {
    return "pip"
  }
}

// Tool: sdd_bootstrap_status
export const bootstrap_status = tool({
  description: "Reporta el estado de bootstrap del proyecto (qué plantilla se usó, cuándo, qué componentes shadcn están instalados, versión de Node y package manager). Si el proyecto no está bootstrapped, retorna NOT_BOOTSTRAPPED. Útil para que el coder verifique antes de empezar a codear.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const status = readBootstrapStatus(root)

    if (!status) {
      return JSON.stringify({
        status: "NOT_BOOTSTRAPPED",
        message: "El proyecto no ha sido bootstrapped. Llama sdd_bootstrap_nextjs_shadcn o sdd_bootstrap_fastapi primero.",
        projectRoot: root,
        hasNodeModules: fs.existsSync(path.resolve(root, "node_modules")),
        hasPyproject: fs.existsSync(path.resolve(root, "pyproject.toml")),
      }, null, 2)
    }

    const pm = status.packageManager || "npm"
    const lockfile = pm === "pnpm" ? "pnpm-lock.yaml" : pm === "yarn" ? "yarn.lock" : "package-lock.json"
    const lockfilePath = path.resolve(root, lockfile)
    let needsRebootstrap = false
    if (fs.existsSync(lockfilePath)) {
      const lockMtime = fs.statSync(lockfilePath).mtimeMs
      const lastBootstrap = new Date(status.lastBootstrappedAt).getTime()
      if (lockMtime > lastBootstrap) needsRebootstrap = true
    }

    return JSON.stringify({
      status: "BOOTSTRAPPED",
      message: needsRebootstrap
        ? "Bootstrap previo detectado pero el lockfile es más nuevo. Considera re-bootstrappear con force=true."
        : "Bootstrap vigente.",
      projectRoot: root,
      currentNodeVersion: getNodeVersion(),
      recommendedMinNode: MIN_NODE_VERSION,
      ...status,
      needsRebootstrap,
    }, null, 2)
  }
})

// Tool: sdd_bootstrap_nextjs_shadcn
export const bootstrap_nextjs_shadcn = tool({
  description: "Inicializa un proyecto Next.js 16 + Shadcn UI + Tailwind v4 + Vitest a partir de la plantilla canónica en .opencode/templates/nextjs-shadcn/. Es IDEMPOTENTE: si el proyecto ya está inicializado y no se pasa force=true, no toca nada. Copia archivo-por-archivo (sin pisar los existentes), mergea package.json, y opcionalmente instala dependencias y shadcn components.",
  args: {
    components: tool.schema.array(tool.schema.string()).default([]).describe("Lista de shadcn components a instalar (ej: ['button','input','table']). Vacío = no instalar shadcn components."),
    install: tool.schema.boolean().default(true).describe("Si true, ejecuta npm/pnpm/yarn install después de copiar. Si false, solo copia archivos."),
    force: tool.schema.boolean().default(false).describe("Si true, sobrescribe archivos existentes. Si false, los salta (mergea package.json)."),
  },
  async execute(args, context) {
    const root = getRoot(context)
    const start = Date.now()
    const templateDir = path.resolve(root, ".opencode/templates/nextjs-shadcn")

    if (!fs.existsSync(templateDir)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró la plantilla en ${templateDir}. Verifica que .opencode/ esté intacto.`,
      }, null, 2)
    }

    const nodeVersion = getNodeVersion()
    if (nodeVersion === "unknown" || semverMajor(nodeVersion) < 20) {
      return JSON.stringify({
        status: "ERROR",
        message: `Node ${nodeVersion} detectado. Next.js 16 requiere >= ${MIN_NODE_VERSION}. Instala/actualiza Node antes de continuar.`,
        nodeVersion,
        recommendedMinNode: MIN_NODE_VERSION,
      }, null, 2)
    }

    const isInitialized =
      fs.existsSync(path.resolve(root, "src/app/page.tsx")) &&
      fs.existsSync(path.resolve(root, "package.json")) &&
      fs.existsSync(path.resolve(root, "src/lib/utils.ts"))

    if (isInitialized && !args.force) {
      return JSON.stringify({
        status: "SUCCESS",
        initialized: false,
        message: "Proyecto ya inicializado. Pasa force=true para re-bootstrappear (CUIDADO: sobrescribirá archivos existentes).",
        nextSteps: "Llama sdd_bootstrap_status para ver el estado actual.",
      }, null, 2)
    }

    const filesCopied: string[] = []
    const filesSkipped: string[] = []
    const copyFileSafe = (rel: string) => {
      const src = path.join(templateDir, rel)
      const dst = path.resolve(root, rel)
      if (!fs.existsSync(src)) return
      const dstExists = fs.existsSync(dst)
      if (dstExists && !args.force) {
        filesSkipped.push(rel)
        return
      }
      fs.mkdirSync(path.dirname(dst), { recursive: true })
      fs.copyFileSync(src, dst)
      filesCopied.push(rel)
    }

    const userPkgPath = path.resolve(root, "package.json")
    let mergedPkg: any = null
    if (fs.existsSync(userPkgPath) && !args.force) {
      try {
        const userPkg = JSON.parse(fs.readFileSync(userPkgPath, "utf8"))
        const tmplPkg = JSON.parse(fs.readFileSync(path.join(templateDir, "package.json"), "utf8"))
        for (const key of ["dependencies", "devDependencies", "peerDependencies"]) {
          if (tmplPkg[key]) {
            userPkg[key] = { ...tmplPkg[key], ...(userPkg[key] || {}) }
          }
        }
        userPkg.scripts = { ...(tmplPkg.scripts || {}), ...(userPkg.scripts || {}) }
        mergedPkg = userPkg
        fs.writeFileSync(userPkgPath, JSON.stringify(userPkg, null, 2), "utf8")
        filesCopied.push("package.json (merged)")
      } catch (e) {
        copyFileSafe("package.json")
      }
    } else {
      copyFileSafe("package.json")
    }

    const userNextConfig = path.resolve(root, "next.config.ts")
    if (fs.existsSync(userNextConfig) && !args.force) {
      try {
        const content = fs.readFileSync(userNextConfig, "utf8")
        if (!content.includes("output: \"standalone\"") && !content.includes("output: 'standalone'")) {
          const updated = content.replace(
            /(const nextConfig[^{]*\{)/,
            `$1\n  output: "standalone",`
          )
          fs.writeFileSync(userNextConfig, updated, "utf8")
          filesCopied.push("next.config.ts (added standalone)")
        } else {
          filesSkipped.push("next.config.ts")
        }
      } catch (e) {
        copyFileSafe("next.config.ts")
      }
    } else {
      copyFileSafe("next.config.ts")
    }

    const standardFiles = [
      "tsconfig.json",
      "eslint.config.mjs",
      "vitest.config.ts",
      "postcss.config.mjs",
      "components.json",
      "src/app/page.tsx",
      "src/app/layout.tsx",
      "src/app/globals.css",
      "src/lib/utils.ts",
      "src/components/theme-provider.tsx",
      "src/test/setup.ts",
      "public/.gitkeep",
    ]
    for (const f of standardFiles) copyFileSafe(f)

    const pm = detectPackageManager(root)

    let installDuration = 0
    let installSkipped = false
    let installError: string | null = null
    const hasNodeModules = fs.existsSync(path.resolve(root, "node_modules"))
    if (args.install && (args.force || !hasNodeModules)) {
      const installStart = Date.now()
      const installCmd = pm === "pnpm"
        ? "pnpm install --prefer-offline --frozen-lockfile"
        : pm === "yarn"
          ? "yarn install --frozen-lockfile"
          : "npm install --prefer-offline"
      try {
        execSync(installCmd, {
          cwd: root,
          stdio: "ignore",
          timeout: 300_000,
        })
        installDuration = Date.now() - installStart
      } catch (e: any) {
        installError = e.message?.slice(0, 500) || "unknown error"
      }
    } else if (hasNodeModules && !args.force) {
      installSkipped = true
    }

    const componentsInstalled: string[] = []
    let componentsError: string | null = null
    if (args.components && args.components.length > 0) {
      try {
        const cmd = `npx shadcn@latest add ${args.components.join(" ")} --yes --overwrite`
        execSync(cmd, {
          cwd: root,
          stdio: "ignore",
          timeout: 180_000,
        })
        componentsInstalled.push(...args.components)
      } catch (e: any) {
        componentsError = e.message?.slice(0, 500) || "unknown error"
      }
    }

    const bootstrapRecord = {
      template: "nextjs-shadcn",
      version: TEMPLATE_VERSION,
      lastBootstrappedAt: new Date().toISOString(),
      packageManager: pm,
      nodeVersion,
      filesCopied,
      filesSkipped,
      componentsInstalled,
      installDuration,
      totalDuration: Date.now() - start,
    }
    writeBootstrapStatus(root, bootstrapRecord)

    let finalPackageJson: any = null
    try {
      finalPackageJson = JSON.parse(fs.readFileSync(userPkgPath, "utf8"))
    } catch (e) { /* ignore */ }

    return JSON.stringify({
      status: installError || componentsError ? "WARNING" : "SUCCESS",
      initialized: true,
      message: installError
        ? `Bootstrap completo con warnings: install falló. ${installError}`
        : componentsError
          ? `Bootstrap completo con warnings: shadcn add falló. ${componentsError}`
          : `Bootstrap completo en ${Date.now() - start}ms.`,
      packageManager: pm,
      nodeVersion,
      filesCopied,
      filesSkipped,
      installSkipped,
      installDuration,
      componentsInstalled,
      finalPackageJson,
      nextSteps: "Run sdd_start_server({ command: '<pm> dev', port: 3000 }) para arrancar el dev server.",
      _bootstrapRecord: bootstrapRecord,
    }, null, 2)
  }
})

// Tool: sdd_bootstrap_fastapi
export const bootstrap_fastapi = tool({
  description: "Inicializa un proyecto FastAPI + Pydantic + Uvicorn + Pytest + Ruff a partir de la plantilla canónica en .opencode/templates/fastapi-sdd/. Es IDEMPOTENTE: si el proyecto ya está inicializado y no se pasa force=true, no toca nada. Copia archivo-por-archivo (sin pisar los existentes), opcionalmente instala dependencias con uv (fallback pip).",
  args: {
    extras: tool.schema.array(tool.schema.string()).default([]).describe("Lista de paquetes Python adicionales a instalar (ej: ['sqlalchemy','pydantic-settings','pytest-asyncio']). Vacío = no instalar extras extra."),
    install: tool.schema.boolean().default(true).describe("Si true, ejecuta uv sync (o pip install -e '.[dev]') después de copiar. Si false, solo copia archivos."),
    force: tool.schema.boolean().default(false).describe("Si true, sobrescribe archivos existentes. Si false, los salta."),
  },
  async execute(args, context) {
    const root = getRoot(context)
    const start = Date.now()
    const templateDir = path.resolve(root, ".opencode/templates/fastapi-sdd")

    if (!fs.existsSync(templateDir)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró la plantilla en ${templateDir}. Verifica que .opencode/ esté intacto.`,
      }, null, 2)
    }

    const pythonCheck = checkPythonVersion()
    if (!pythonCheck.ok) {
      return JSON.stringify({
        status: "ERROR",
        message: pythonCheck.message,
        pythonVersion: pythonCheck.version,
        recommendedMinPython: MIN_PYTHON_VERSION,
      }, null, 2)
    }

    const isInitialized =
      fs.existsSync(path.resolve(root, "src/app/main.py")) &&
      fs.existsSync(path.resolve(root, "pyproject.toml"))

    if (isInitialized && !args.force) {
      return JSON.stringify({
        status: "SUCCESS",
        initialized: false,
        message: "Proyecto Python ya inicializado. Pasa force=true para re-bootstrappear (CUIDADO: sobrescribirá archivos existentes).",
        nextSteps: "Llama sdd_bootstrap_status para ver el estado actual.",
      }, null, 2)
    }

    const filesCopied: string[] = []
    const filesSkipped: string[] = []
    const copyFileSafe = (rel: string) => {
      const src = path.join(templateDir, rel)
      const dst = path.resolve(root, rel)
      if (!fs.existsSync(src)) return
      const dstExists = fs.existsSync(dst)
      if (dstExists && !args.force) {
        filesSkipped.push(rel)
        return
      }
      fs.mkdirSync(path.dirname(dst), { recursive: true })
      fs.copyFileSync(src, dst)
      filesCopied.push(rel)
    }

    const userPyprojectPath = path.resolve(root, "pyproject.toml")
    let mergedPyproject: string | null = null
    if (fs.existsSync(userPyprojectPath) && !args.force) {
      try {
        const userToml = fs.readFileSync(userPyprojectPath, "utf8")
        const tmplToml = fs.readFileSync(path.join(templateDir, "pyproject.toml"), "utf8")
        if (userToml.includes("[project]") || userToml.includes("[tool.")) {
          filesSkipped.push("pyproject.toml (user-defined, not auto-merged)")
        } else {
          fs.writeFileSync(userPyprojectPath, tmplToml, "utf8")
          mergedPyproject = tmplToml
          filesCopied.push("pyproject.toml (template only)")
        }
      } catch (e) {
        copyFileSafe("pyproject.toml")
      }
    } else {
      copyFileSafe("pyproject.toml")
    }

    const standardFiles = [
      "ruff.toml",
      ".python-version",
      "Dockerfile",
      ".dockerignore",
      "docker-compose.yml",
      "README.md",
      "src/app/__init__.py",
      "src/app/main.py",
      "src/app/core/__init__.py",
      "src/app/core/config.py",
      "src/app/routers/__init__.py",
      "src/app/schemas/__init__.py",
      "src/tests/__init__.py",
      "src/tests/conftest.py",
      "src/tests/test_main.py",
      "tests/__init__.py",
    ]
    for (const f of standardFiles) copyFileSafe(f)

    const pm = detectPythonPackageManager(root)

    let installDuration = 0
    let installSkipped = false
    let installError: string | null = null
    const hasVenv = fs.existsSync(path.resolve(root, ".venv"))
    const hasInstalled = fs.existsSync(path.resolve(root, "uv.lock")) || hasVenv
    if (args.install && (args.force || !hasInstalled)) {
      const installStart = Date.now()
      const installCmd = pm === "uv"
        ? "uv sync"
        : "pip install -e '.[dev]'"
      try {
        execSync(installCmd, {
          cwd: root,
          stdio: "ignore",
          timeout: 300_000,
        })
        installDuration = Date.now() - installStart
      } catch (e: any) {
        installError = e.message?.slice(0, 500) || "unknown error"
      }
    } else if (hasInstalled && !args.force) {
      installSkipped = true
    }

    const extrasInstalled: string[] = []
    let extrasError: string | null = null
    if (args.extras && args.extras.length > 0) {
      const extrasCmd = pm === "uv"
        ? `uv add ${args.extras.join(" ")}`
        : `pip install ${args.extras.join(" ")}`
      try {
        execSync(extrasCmd, {
          cwd: root,
          stdio: "ignore",
          timeout: 180_000,
        })
        extrasInstalled.push(...args.extras)
      } catch (e: any) {
        extrasError = e.message?.slice(0, 500) || "unknown error"
      }
    }

    const bootstrapRecord = {
      template: "fastapi-sdd",
      version: TEMPLATE_VERSION,
      lastBootstrappedAt: new Date().toISOString(),
      packageManager: pm,
      pythonVersion: pythonCheck.version,
      filesCopied,
      filesSkipped,
      extrasInstalled,
      installDuration,
      totalDuration: Date.now() - start,
    }
    writeBootstrapStatus(root, bootstrapRecord)

    let finalPyprojectToml: string | null = null
    try {
      finalPyprojectToml = fs.readFileSync(userPyprojectPath, "utf8")
    } catch (e) { /* ignore */ }

    return JSON.stringify({
      status: installError || extrasError ? "WARNING" : "SUCCESS",
      initialized: true,
      message: installError
        ? `Bootstrap completo con warnings: install falló. ${installError}`
        : extrasError
          ? `Bootstrap completo con warnings: extras add falló. ${extrasError}`
          : `Bootstrap completo en ${Date.now() - start}ms.`,
      packageManager: pm,
      pythonVersion: pythonCheck.version,
      filesCopied,
      filesSkipped,
      installSkipped,
      installDuration,
      extrasInstalled,
      finalPyprojectToml,
      nextSteps: "Run `uv run uvicorn app.main:app --reload --port 8000` (o `uvicorn ...` con venv activo) para arrancar el dev server.",
      _bootstrapRecord: bootstrapRecord,
    }, null, 2)
  }
})

// Tool: sdd_bootstrap_agnostic
export const bootstrap_agnostic = tool({
  description: "Inicializa un proyecto de tipo script, tooling o agnóstico de forma idempotente (crea un package.json básico, requirements.txt, o estructura plana de archivos según sea necesario). Evita la sobrecarga de frameworks pesados.",
  args: {
    language: tool.schema.enum(["javascript", "python", "bash", "google-apps-script", "plano"]).default("plano").describe("El lenguaje o entorno para inicializar"),
    install: tool.schema.boolean().default(true).describe("Si true, ejecuta npm init -y o uv init de forma básica si aplica.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const start = Date.now()
    const filesCopied: string[] = []
    
    // Create src/ directory as best practice for escalabilidad
    const srcDir = path.resolve(root, "src")
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true })
    }

    if (args.language === "javascript") {
      const pkgPath = path.resolve(root, "package.json")
      if (!fs.existsSync(pkgPath) && args.install) {
        try {
          execSync("npm init -y", { cwd: root, stdio: "ignore" })
          filesCopied.push("package.json (auto-generated)")
        } catch (e) {}
      }
      const indexJs = path.join(srcDir, "index.js")
      if (!fs.existsSync(indexJs)) {
        fs.writeFileSync(indexJs, "// Entry point for Javascript Agnostic Script\nconsole.log('Hello, world!');\n", "utf8")
        filesCopied.push("src/index.js")
      }
    } else if (args.language === "python") {
      const pyproject = path.resolve(root, "pyproject.toml")
      const reqTxt = path.resolve(root, "requirements.txt")
      
      if (!fs.existsSync(pyproject) && !fs.existsSync(reqTxt) && args.install) {
        try {
          execSync("uv init --lib", { cwd: root, stdio: "ignore" })
          filesCopied.push("pyproject.toml (uv init)")
        } catch (e) {
          try {
            fs.writeFileSync(reqTxt, "# Python requirements\n", "utf8")
            filesCopied.push("requirements.txt")
          } catch (err) {}
        }
      }
      const mainPy = path.join(srcDir, "main.py")
      if (!fs.existsSync(mainPy)) {
        fs.writeFileSync(mainPy, "#!/usr/bin/env python3\n\ndef main():\n    print('Hello from Agnostic Python Script')\n\nif __name__ == '__main__':\n    main()\n", "utf8")
        filesCopied.push("src/main.py")
      }
    } else if (args.language === "google-apps-script") {
      const appScriptFile = path.join(srcDir, "codigo.gs")
      if (!fs.existsSync(appScriptFile)) {
        fs.writeFileSync(appScriptFile, "function myFunction() {\n  Logger.log('Hello from Google Apps Script');\n}\n", "utf8")
        filesCopied.push("src/codigo.gs")
      }
    } else if (args.language === "bash") {
      const scriptSh = path.join(srcDir, "script.sh")
      if (!fs.existsSync(scriptSh)) {
        fs.writeFileSync(scriptSh, "#!/usr/bin/env bash\nset -euo pipefail\necho 'Hello from Bash script!'\n", "utf8")
        filesCopied.push("src/script.sh")
        try { fs.chmodSync(scriptSh, "755") } catch (e) {}
      }
    } else {
      const mainTxt = path.join(srcDir, "README.md")
      if (!fs.existsSync(mainTxt)) {
        fs.writeFileSync(mainTxt, "# Agnostic Flat Script Workspace\n\nPlace your files here.\n", "utf8")
        filesCopied.push("src/README.md")
      }
    }

    const bootstrapRecord = {
      template: "agnostic-fast",
      version: TEMPLATE_VERSION,
      lastBootstrappedAt: new Date().toISOString(),
      packageManager: args.language === "python" ? "uv" : args.language === "javascript" ? "npm" : "none",
      filesCopied,
      filesSkipped: [],
      componentsInstalled: [],
      installDuration: 0,
      totalDuration: Date.now() - start
    }
    
    writeBootstrapStatus(root, bootstrapRecord)

    return JSON.stringify({
      status: "SUCCESS",
      initialized: true,
      message: `Bootstrap de proyecto agnóstico (${args.language}) completado exitosamente.`,
      filesCopied,
      _bootstrapRecord: bootstrapRecord
    }, null, 2)
  }
})
