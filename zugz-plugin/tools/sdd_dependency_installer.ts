import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

function safeExec(cmd: string, cwd: string): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execSync(cmd, { cwd, encoding: "utf-8", stdio: "pipe" })
    return { ok: true, stdout: stdout.trim(), stderr: "" }
  } catch (err: any) {
    return { ok: false, stdout: "", stderr: err.stderr?.toString() || err.message || "" }
  }
}

export default tool({
  description: "Instalador de dependencias agnóstico al stack. Detecta archivos de manifiesto (package.json, requirements.txt, go.mod, Cargo.toml, pom.xml, build.gradle) y ejecuta el comando de instalación correcto en la subcarpeta correspondiente.",
  args: {},
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    if (projectRoot === "/" || projectRoot.startsWith("/usr") || projectRoot.startsWith("/System") || projectRoot.startsWith("/private")) {
      return JSON.stringify({
        status: "SUCCESS",
        message: "No se permite escanear directorios raíz del sistema para instalación de dependencias."
      }, null, 2)
    }
    
    const report: string[] = ["━━━ sdd_dependency_installer ━━━"]
    
    // Find all files
    const manifests: Array<{ type: string; file: string; cwd: string }> = []
    const excludeDirs = [
      "node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage", "__pycache__", ".pytest_cache",
      "bin", "boot", "dev", "etc", "home", "lib", "lib64", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"
    ]
    
    function scan(dir: string) {
      if (!fs.existsSync(dir)) return
      let entries: string[] = []
      try {
        entries = fs.readdirSync(dir)
      } catch {
        return
      }
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry)
        let stat
        try {
          stat = fs.statSync(fullPath)
        } catch {
          continue
        }
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(entry)) {
            scan(fullPath)
          }
        } else {
          if (entry === "package.json") {
            manifests.push({ type: "node", file: entry, cwd: dir })
          } else if (entry === "requirements.txt") {
            manifests.push({ type: "python", file: entry, cwd: dir })
          } else if (entry === "go.mod") {
            manifests.push({ type: "go", file: entry, cwd: dir })
          } else if (entry === "Cargo.toml") {
            manifests.push({ type: "rust", file: entry, cwd: dir })
          } else if (entry === "pom.xml") {
            manifests.push({ type: "java-maven", file: entry, cwd: dir })
          } else if (entry === "build.gradle") {
            manifests.push({ type: "java-gradle", file: entry, cwd: dir })
          }
        }
      }
    }
    
    scan(projectRoot)
    
    if (manifests.length === 0) {
      return JSON.stringify({
        status: "SUCCESS",
        message: "No se encontraron manifiestos de dependencias para instalar."
      }, null, 2)
    }
    
    let allOk = true
    const installations = []
    
    for (const m of manifests) {
      let cmd = ""
      const relPath = path.relative(projectRoot, path.join(m.cwd, m.file))
      
      if (m.type === "node") {
        if (fs.existsSync(path.join(m.cwd, "bun.lockb")) || fs.existsSync(path.join(m.cwd, "bun.lock"))) {
          cmd = "bun install"
        } else if (fs.existsSync(path.join(m.cwd, "pnpm-lock.yaml"))) {
          cmd = "pnpm install"
        } else if (fs.existsSync(path.join(m.cwd, "yarn.lock"))) {
          cmd = "yarn install"
        } else {
          cmd = "npm install"
        }
      } else if (m.type === "python") {
        // Check for venv locally
        if (fs.existsSync(path.join(m.cwd, ".venv")) || fs.existsSync(path.join(m.cwd, "venv"))) {
          const venvName = fs.existsSync(path.join(m.cwd, ".venv")) ? ".venv" : "venv"
          cmd = `${venvName}/bin/pip install -r requirements.txt`
        } else {
          cmd = "pip install -r requirements.txt"
        }
      } else if (m.type === "go") {
        cmd = "go mod download"
      } else if (m.type === "rust") {
        cmd = "cargo check"
      } else if (m.type === "java-maven") {
        cmd = "mvn dependency:resolve"
      } else if (m.type === "java-gradle") {
        cmd = fs.existsSync(path.join(m.cwd, "gradlew")) ? "./gradlew build -x test" : "gradle build -x test"
      }
      
      if (cmd) {
        report.push(`▶ Ejecutando '${cmd}' en ${m.cwd === projectRoot ? "raíz" : relPath}...`)
        const res = safeExec(cmd, m.cwd)
        installations.push({
          manifest: relPath,
          command: cmd,
          ok: res.ok,
          output: res.ok ? res.stdout : res.stderr
        })
        if (res.ok) {
          report.push(`✓ Dependencias instaladas para ${relPath}`)
        } else {
          allOk = false
          report.push(`❌ Error instalando en ${relPath}: ${res.stderr}`)
        }
      }
    }
    
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    return JSON.stringify({
      status: allOk ? "SUCCESS" : "FAILED",
      report: report.join("\n"),
      installations
    }, null, 2)
  }
})
