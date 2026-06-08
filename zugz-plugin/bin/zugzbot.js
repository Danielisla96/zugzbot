#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PKG_ROOT = path.resolve(__dirname, "..")

let PKG_VERSION = "unknown"
try {
  PKG_VERSION = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf-8")).version
} catch (_e) { PKG_VERSION = "unknown" }

const INSTALL_DIR = process.cwd()

const TEMPLATE_SDD_LOCK_V2 = {
  schema_version: 7,
  change_name: "",
  workflow: "full-sdd-tdd",
  stack_profile: "unknown",
  active_phase: "F0",
  active_subagent: "f0-explorer",
  status: "idle",
  auto_pilot: false,
  iteration: 0,
  last_updated: "",
  orchestrator_mode: "router",
  direction: "forward",
  last_successful_phase: "F0",
  retry_count: 0,
  corrective_loop_active: false,
  fresh_task: true,
  tasks: [],
  tdd: {
    red: { completed: false, tests_added: 0, all_failing: false },
    green: { completed: false, tests_passing: 0 },
    refactor: { completed: false, linter_clean: false }
  },
  git: {
    branch: "",
    base_sha: "",
    working_tree_clean: true
  },
  checkpoints: [],
  last_checkpoint_id: null,
  last_restored_from: null,
  complexity: "medium",
  subproject_cwd: "",
  modo_qa: "automatizado",
  session_features: {
    autoskills: false,
    graphify: false
  },
  active_design_system: null,
  design_system_explicitly_skipped: false
}

const TEMPLATE_TUI_JSON = {
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["./.opencode/plugins/plugin_tui.tsx"]
}

const TEMPLATE_GITIGNORE = `# Zugzbot SDD v2
.openspec/sdd-lock.json
.openspec/checkpoints/
tui.json
zugz-models.json
.opencode/profiles-cache/
node_modules/
.opencode/
package-lock.json

# Sistema / OS
.DS_Store
Thumbs.db
Desktop.ini

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Compilados y salidas de construcción
dist/
build/
out/
target/
coverage/
.nyc_output/

# Entornos y Secretos
.env
.env.local
.env.*.local
*.pem
*.key
`

const BRAIN_TEMPLATE = `# 🧠 Brain del Proyecto

## General
- Proyecto inicializado con Zugzbot SDD v${PKG_VERSION} (TDD-discipline, stack-agnostic)
`

function green(msg) { console.log(`  \x1b[32m✔\x1b[0m \x1b[37m${msg}\x1b[0m`) }
function yellow(msg) { console.log(`  \x1b[33m⚠\x1b[0m \x1b[33m${msg}\x1b[0m`) }
function red(msg) { console.log(`  \x1b[31m✘\x1b[0m \x1b[31m\x1b[1m${msg}\x1b[0m`) }
function header(msg) { console.log(`\n\x1b[1m\x1b[36m❯ ${msg}\x1b[0m`) }

function drawBox(lines, borderColorAnsi = "\x1b[35m") {
  const width = 58
  const top = `┌${"─".repeat(width)}┐`
  const bottom = `└${"─".repeat(width)}┘`
  console.log(`${borderColorAnsi}${top}\x1b[0m`)
  for (const line of lines) {
    const visibleLength = line.replace(/\x1b\[[0-9;]*m/g, "").length
    const padding = Math.max(0, width - visibleLength)
    console.log(`${borderColorAnsi}│\x1b[0m${line}${" ".repeat(padding)}${borderColorAnsi}│\x1b[0m`)
  }
  console.log(`${borderColorAnsi}${bottom}\x1b[0m`)
}

function checkDependencies() {
  header("🔍 Verificando dependencias del sistema...")
  
  const results = []
  
  // 1. Node.js (Required)
  const nodeVersionStr = process.version
  const nodeMajor = parseInt(nodeVersionStr.replace(/^v/, "").split(".")[0], 10)
  if (nodeMajor >= 18) {
    green(`Node.js: ${nodeVersionStr} (OK, >= v18.0.0)`)
  } else {
    results.push({ name: "Node.js", required: true, status: "FAIL", current: nodeVersionStr, expected: ">= v18.0.0", msg: "Node.js v18 o superior es requerido." })
  }

  // Helper to run commands
  function testCmd(cmd) {
    try {
      return execSync(cmd, { stdio: "pipe" }).toString().trim()
    } catch (_e) {
      return null
    }
  }

  // 2. Git (Required)
  const gitVersion = testCmd("git --version")
  if (gitVersion) {
    green(`Git: ${gitVersion} (OK)`)
  } else {
    results.push({ name: "Git", required: true, status: "FAIL", current: "No encontrado", expected: "Cualquier versión", msg: "Git es crítico para gestionar commits y checkpoints en el ciclo SDD-TDD." })
  }

  // 3. Docker (Recommended)
  const dockerVersion = testCmd("docker --version")
  if (dockerVersion) {
    green(`Docker: ${dockerVersion.replace(/\n/g, " ")} (OK)`)
  } else {
    results.push({ name: "Docker", required: false, status: "WARN", current: "No encontrado", expected: "Recomendado", msg: "Docker es altamente recomendado para levantar bases de datos y servicios en contenedores." })
  }

  // 4. Python 3 (Recommended)
  const pythonVersion = testCmd("python3 --version") || testCmd("python --version")
  if (pythonVersion) {
    green(`Python: ${pythonVersion} (OK)`)
  } else {
    results.push({ name: "Python", required: false, status: "WARN", current: "No encontrado", expected: "Recomendado", msg: "Python es recomendado para automatizaciones y stacks basados en FastAPI o Django." })
  }

  // Optional toolchains (Go, Rust)
  const goVersion = testCmd("go version")
  if (goVersion) {
    green(`Go: ${goVersion.split(" ")[2]} (OK)`)
  }
  const rustVersion = testCmd("rustc --version")
  if (rustVersion) {
    green(`Rust: ${rustVersion.split(" ")[1]} (OK)`)
  }

  // Print summary of issues
  const errors = results.filter(r => r.status === "FAIL")
  const warnings = results.filter(r => r.status === "WARN")

  if (errors.length > 0 || warnings.length > 0) {
    console.log()
    if (errors.length > 0) {
      red("❌ CRITICAL: Faltan dependencias obligatorias. La herramienta podría no funcionar:")
      errors.forEach(e => {
        console.log(`     - \x1b[1m${e.name}\x1b[0m (Esperado: ${e.expected}, Actual: ${e.current})`)
        console.log(`       \x1b[2m${e.msg}\x1b[0m`)
      })
    }
    if (warnings.length > 0) {
      yellow("⚠ AVISO: Faltan herramientas opcionales recomendadas para ciertos stacks:")
      warnings.forEach(w => {
        console.log(`     - \x1b[1m${w.name}\x1b[0m (Recomendado para ciertos flujos)`)
        console.log(`       \x1b[2m${w.msg}\x1b[0m`)
      })
    }
    console.log()
  } else {
    green("¡Todas las dependencias del sistema están en orden!")
  }
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function detectLegacyInstallation(installDir) {
  const legacyLockPath = path.join(installDir, ".openspec/sdd-lock.json")
  if (!fs.existsSync(legacyLockPath)) return false
  try {
    const lock = JSON.parse(fs.readFileSync(legacyLockPath, "utf-8"))
    if (lock.schema_version === 2 || lock.schema_version === "2") return false
    if (lock.tdd && typeof lock.active_phase === "string") return false
    if (lock.schema_version === 1 || lock.schema_version === "1") return true
    return true
  } catch (_e) {
    return false
  }
}

function getTemplateModels() {
  const templateModelsPath = path.join(PKG_ROOT, "zugz-models.json")
  if (fs.existsSync(templateModelsPath)) {
    try {
      return JSON.parse(fs.readFileSync(templateModelsPath, "utf-8"))
    } catch (e) {
      return null
    }
  }
  return null
}

function getProjectModels(projectModelsPath) {
  if (fs.existsSync(projectModelsPath)) {
    try {
      return JSON.parse(fs.readFileSync(projectModelsPath, "utf-8"))
    } catch (e) {
      red(`zugz-models.json existe pero es inválido, ignorando`)
      return null
    }
  }
  return getTemplateModels()
}

function buildOpencodeJson(models) {
  const defaultModel = models?.default || "deepseek/deepseek-v4-flash"
  const agents = models?.agents || {}

  return {
    "$schema": "https://opencode.ai/config.json",
    "lsp": true,
    "permission": {
      "edit": "allow",
      "bash": "allow",
      "lsp": "allow",
      "skill": {
        "*": "allow"
      }
    },
    "agent": {
      "zugzbot": {
        "mode": "primary",
        "model": agents.zugzbot || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/zugzbot.md}",
        "permission": {
          "task": { "sdd-*": "allow", "f*": "allow", "aux-*": "allow" },
          "question": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_stack_detector": "allow",
            "sdd_git_awareness": "allow",
            "sdd_checkpoint": "allow",
            "sdd_compact_context": "allow",
            "sdd_context_pruner": "allow",
            "sdd_clasp": "allow",
            "sdd_graphify": "allow",
            "sdd_session_features": "allow",
            "sdd_free_port_finder": "allow"
          }
        }
      },
      "sdd-explorer": {
        "mode": "subagent",
        "model": agents["sdd-explorer"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-explorer.md}",
        "permission": {
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_stack_detector": "allow",
            "sdd_generate_tree": "allow",
            "sdd_git_awareness": "allow",
            "sdd_graphify": "allow"
          }
        }
      },
      "sdd-planner": {
        "mode": "subagent",
        "model": agents["sdd-planner"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-planner.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_brain_sync": "allow",
            "sdd_requirement_tracker": "allow",
            "sdd_diff_impact_analyzer": "allow",
            "sdd_auto_api_mocker": "allow",
            "sdd_test_scaffold_generator": "allow",
            "sdd_context_pruner": "allow",
            "sdd_stack_detector": "allow",
            "check_dependency_cooldown": "allow",
            "sdd_graphify": "allow"
          }
        }
      },
      "sdd-builder": {
        "mode": "subagent",
        "model": agents["sdd-builder"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-builder.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_linter": "allow",
            "sdd_test_runner": "allow",
            "sdd_git_awareness": "allow",
            "sdd_security_vulnerability_scanner": "allow",
            "sdd_graphify": "allow"
          }
        }
      },
      "sdd-tester": {
        "mode": "subagent",
        "model": agents["sdd-tester"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-tester.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_linter": "allow",
            "sdd_ui_auditor": "allow",
            "sdd_spec_validator": "allow",
            "sdd_spec_compliance_linter": "allow",
            "sdd_regression_detector": "allow",
            "sdd_bdd_tester": "allow",
            "sdd_requirement_tracker": "allow",
            "sdd_diff_impact_analyzer": "allow",
            "sdd_security_vulnerability_scanner": "allow",
            "sdd_visual_regression_diff": "allow",
            "sdd_performance_regress_profiler": "allow",
            "sdd_secret_scanner": "allow",
            "sdd_auto_api_mocker": "allow",
            "sdd_sandbox_patcher": "allow"
          }
        }
      },
      "sdd-deployer": {
        "mode": "subagent",
        "model": agents["sdd-deployer"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-deployer.md}",
        "permission": {
          "bash": "allow",
          "skill": { "*": "allow" },
          "tools": {
          "sdd_transition": "allow",
          "sdd_lock_manager": "allow",
          "sdd_clasp": "allow",
          "sdd_git_awareness": "allow",
          "sdd_free_port_finder": "allow"
        },
        "write_file": {
          "/tmp": "allow"
        }
      }
    },
      "sdd-archiver": {
        "mode": "subagent",
        "model": agents["sdd-archiver"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-archiver.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_archive_and_commit": "allow",
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_brain_sync": "allow",
            "sdd_install_autoskills": "allow",
            "sdd_context_pruner": "allow"
          }
        }
      },
      "f2-red-test-writer": {
        "mode": "subagent",
        "model": agents["f2-red-test-writer"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/f2-red-test-writer.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_test_runner": "allow",
            "sdd_brain_sync": "allow"
          }
        }
      },
      "f2-refactor-improver": {
        "mode": "subagent",
        "model": agents["f2-refactor-improver"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/f2-refactor-improver.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_transition": "allow",
            "sdd_lock_manager": "allow",
            "sdd_test_runner": "allow",
            "sdd_linter": "allow",
            "sdd_brain_sync": "allow"
          }
        }
      },
      "aux-handyman": {
        "mode": "subagent",
        "model": agents["aux-handyman"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-handyman.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_lock_manager": "allow",
            "sdd_git_awareness": "allow"
          }
        }
      },
      "aux-oracle": {
        "mode": "subagent",
        "model": agents["aux-oracle"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-oracle.md}",
        "permission": {
          "edit": "deny",
          "bash": "deny",
          "lsp": "deny",
          "skill": { "*": "deny" }
        }
      },
      "aux-auditor": {
        "mode": "subagent",
        "model": agents["aux-auditor"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-auditor.md}",
        "permission": {
          "edit": "deny",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_linter": "allow",
            "sdd_secret_scanner": "allow",
            "sdd_security_vulnerability_scanner": "allow",
            "sdd_lock_manager": "allow",
            "sdd_brain_sync": "allow"
          }
        }
      },
      "aux-refactor": {
        "mode": "subagent",
        "model": agents["aux-refactor"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-refactor.md}",
        "permission": {
          "edit": "allow",
          "bash": "allow",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_test_runner": "allow",
            "sdd_linter": "allow",
            "sdd_lock_manager": "allow",
            "sdd_git_awareness": "allow"
          }
        }
      },
      "aux-explainer": {
        "mode": "subagent",
        "model": agents["aux-explainer"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-explainer.md}",
        "permission": {
          "edit": "deny",
          "bash": "deny",
          "lsp": "allow",
          "skill": { "*": "allow" },
          "tools": {
            "sdd_lock_manager": "allow"
          }
        }
      }
    }
  }
}

function init() {
  drawBox([
    `   \x1b[1m\x1b[36mZugzbot SDD Plugin\x1b[0m \x1b[32mv${PKG_VERSION}\x1b[0m`,
    `   \x1b[2mStack-Agnostic + TDD Discipline\x1b[0m`
  ], "\x1b[1m\x1b[35m")

  checkDependencies()

  if (detectLegacyInstallation(INSTALL_DIR)) {
    console.log()
    red("⚠ INSTALACIÓN LEGACY v1.x DETECTADA")
    red(`Zugzbot v${PKG_VERSION} es un breaking change limpio (sin migrador).`)
    red("Pasos para migrar manualmente:")
    console.log()
    console.log("  1. Cierra el ciclo activo actual:")
    console.log("     rm -rf .openspec/changes/<cambio-activo>")
    console.log("  2. Borra el lockfile antiguo:")
    console.log("     rm .openspec/sdd-lock.json")
    console.log(`  3. Continúa con esta instalación de v${PKG_VERSION}`)
    console.log()
    process.exit(1)
  }

  header("📁 Estructurando proyecto v2...")

  fs.mkdirSync(path.join(INSTALL_DIR, ".openspec/changes"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/plugins"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/skills"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/tools"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/profiles-cache"), { recursive: true })
  green("Directorios .openspec/ y .opencode/ creados")

  header("📝 Creando archivos de configuración v2...")

  const modelsPath = path.join(INSTALL_DIR, "zugz-models.json")
  const templateModelsPath = path.join(PKG_ROOT, "zugz-models.json")
  if (!fs.existsSync(modelsPath) && fs.existsSync(templateModelsPath)) {
    fs.copyFileSync(templateModelsPath, modelsPath)
    green("zugz-models.json copiado desde el paquete")
  } else if (fs.existsSync(modelsPath)) {
    yellow("zugz-models.json ya existe, preservado (editable por el usuario)")
  }

  const models = getProjectModels(modelsPath)

  const opencodePath = path.join(INSTALL_DIR, "opencode.json")
  const existingOpencodePath = path.join(INSTALL_DIR, "opencode.json")
  const templateOpencodePath = path.join(PKG_ROOT, "opencode.json")
  let opencodeBase = null
  if (fs.existsSync(existingOpencodePath)) {
    try {
      opencodeBase = JSON.parse(fs.readFileSync(existingOpencodePath, "utf-8"))
      yellow("opencode.json ya existe, fusionando modelos desde zugz-models.json")
    } catch (e) {
      red("opencode.json existe pero es inválido, se regenerará desde el paquete")
    }
  }
    if (!opencodeBase) {
      if (fs.existsSync(templateOpencodePath)) {
        opencodeBase = JSON.parse(fs.readFileSync(templateOpencodePath, "utf-8"))
      } else {
        opencodeBase = buildOpencodeJson(models)
      }
    }

    if (opencodeBase.agent && opencodeBase.agent.zugzbot && opencodeBase.agent.zugzbot.permission) {
      const zugzbotTools = opencodeBase.agent.zugzbot.permission.tools || {}
      if (!zugzbotTools["sdd_session_features"]) {
        zugzbotTools["sdd_session_features"] = "allow"
        opencodeBase.agent.zugzbot.permission.tools = zugzbotTools
        green("Permiso sdd_session_features añadido al agente zugzbot")
      }
    }

    {
      if (!opencodeBase.mcp) opencodeBase.mcp = {}
      if (!opencodeBase.mcp["heroui-react"]) {
        opencodeBase.mcp["heroui-react"] = {
          type: "local",
          command: ["npx", "-y", "@heroui/react-mcp@latest"],
          enabled: true
        }
        green("MCP server heroui-react añadido a opencode.json")
      }
      const uiAgents = ["sdd-planner", "sdd-builder", "f2-refactor-improver", "sdd-tester", "aux-refactor"]
      let mcpAgentsApplied = 0
      for (const agentName of uiAgents) {
        const ag = opencodeBase.agent && opencodeBase.agent[agentName]
        if (!ag) continue
        if (!ag.permission) ag.permission = {}
        if (!ag.permission.tools) ag.permission.tools = {}
        if (ag.permission.tools["heroui-react_*"] !== "allow") {
          ag.permission.tools["heroui-react_*"] = "allow"
          mcpAgentsApplied += 1
        }
      }
      if (mcpAgentsApplied > 0) {
        green(`Permiso heroui-react_* añadido a ${mcpAgentsApplied} agentes UI`)
      }
    }
  if (models && models.agents && opencodeBase.agent) {
    let applied = 0
    for (const [agentName, model] of Object.entries(models.agents)) {
      if (opencodeBase.agent[agentName]) {
        opencodeBase.agent[agentName].model = model
        applied += 1
      }
    }
    if (models.default) {
      for (const agentName of Object.keys(opencodeBase.agent)) {
        if (!models.agents[agentName]) {
          opencodeBase.agent[agentName].model = models.default
          applied += 1
        }
      }
    }
    if (applied > 0) {
      green(`Modelos aplicados a opencode.json (${applied} agentes)`)
    }
  }
  fs.writeFileSync(opencodePath, JSON.stringify(opencodeBase, null, 2), "utf-8")
  if (!fs.existsSync(existingOpencodePath)) {
    green("opencode.json creado (con 14 agentes: zugzbot + 8 core + 4 aux)")
  }

  const tuiPath = path.join(INSTALL_DIR, "tui.json")
  if (!fs.existsSync(tuiPath)) {
    fs.writeFileSync(tuiPath, JSON.stringify(TEMPLATE_TUI_JSON, null, 2), "utf-8")
    green("tui.json creado")
  } else {
    yellow("tui.json ya existe, preservado")
  }

  const sddLockPath = path.join(INSTALL_DIR, ".openspec/sdd-lock.json")
  if (!fs.existsSync(sddLockPath)) {
    fs.writeFileSync(sddLockPath, JSON.stringify(TEMPLATE_SDD_LOCK_V2, null, 2), "utf-8")
    green(".openspec/sdd-lock.json v7 creado (con bloque tdd, git, session_features y design system)")
  } else {
    yellow("sdd-lock.json ya existe, preservado")
  }

  const brainPath = path.join(INSTALL_DIR, ".openspec/brain.md")
  if (!fs.existsSync(brainPath)) {
    fs.writeFileSync(brainPath, BRAIN_TEMPLATE, "utf-8")
    green(".openspec/brain.md creado")
  } else {
    yellow("brain.md ya existe, preservado")
  }

  const gitignorePath = path.join(INSTALL_DIR, ".gitignore")
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8")
    if (!content.includes("# Zugzbot SDD v2")) {
      fs.appendFileSync(gitignorePath, "\n" + TEMPLATE_GITIGNORE, "utf-8")
      green(".gitignore actualizado con exclusiones v2")
    }
  } else {
    fs.writeFileSync(gitignorePath, TEMPLATE_GITIGNORE, "utf-8")
    green(".gitignore creado")
  }

  const pluginTuiPath = path.join(PKG_ROOT, "plugins/plugin_tui.tsx")
  const pluginCorePath = path.join(PKG_ROOT, "plugins/plugin_sdd_core.ts")
  const localPluginDir = path.join(INSTALL_DIR, ".opencode/plugins")
  if (fs.existsSync(pluginTuiPath)) {
    copyRecursiveSync(pluginTuiPath, path.join(localPluginDir, "plugin_tui.tsx"))
    green("plugin_tui.tsx copiado")
  }
  if (fs.existsSync(pluginCorePath)) {
    copyRecursiveSync(pluginCorePath, path.join(localPluginDir, "plugin_sdd_core.ts"))
    green("plugin_sdd_core.ts copiado")
  }

  const sourceSkillsDir = path.join(PKG_ROOT, ".opencode/skills")
  const localSkillsDir = path.join(INSTALL_DIR, ".opencode/skills")
  if (fs.existsSync(sourceSkillsDir)) {
    copyRecursiveSync(sourceSkillsDir, localSkillsDir)
    green("Skills del Swarm copiadas")
  }
  const rootSkillsDir = path.join(PKG_ROOT, "skills")
  if (fs.existsSync(rootSkillsDir)) {
    copyRecursiveSync(rootSkillsDir, localSkillsDir)
    green("Skills principales copiadas")
  }

  const sourceToolsDir = path.join(PKG_ROOT, ".opencode/tools")
  const localToolsDir = path.join(INSTALL_DIR, ".opencode/tools")
  if (fs.existsSync(sourceToolsDir)) {
    copyRecursiveSync(sourceToolsDir, localToolsDir)
    green("Herramientas del Swarm copiadas")
  }

  const sourceProfilesDir = path.join(PKG_ROOT, "profiles")
  if (fs.existsSync(sourceProfilesDir)) {
    const localProfilesDir = path.join(INSTALL_DIR, ".opencode/profiles")
    fs.mkdirSync(localProfilesDir, { recursive: true })
    copyRecursiveSync(sourceProfilesDir, localProfilesDir)
    green("Profiles de stack copiados")
  }

  const sourceDesignDir = path.join(PKG_ROOT, "design")
  if (fs.existsSync(sourceDesignDir)) {
    const localDesignDir = path.join(INSTALL_DIR, ".opencode/design")
    fs.mkdirSync(localDesignDir, { recursive: true })
    copyRecursiveSync(sourceDesignDir, localDesignDir)
    green("Design systems copiados (11 disponibles para el skill sdd-design-system)")
  }

  const sourceTemplatesDir = path.join(PKG_ROOT, "templates")
  if (fs.existsSync(sourceTemplatesDir)) {
    const localTemplatesDir = path.join(INSTALL_DIR, ".opencode/templates")
    fs.mkdirSync(localTemplatesDir, { recursive: true })
    copyRecursiveSync(sourceTemplatesDir, localTemplatesDir)
    green("Plantillas de scaffolding copiadas")
  }

  const hasOfficialHeroUISkills = ["heroui-react", "heroui-migration", "heroui-native"]
    .every(s => fs.existsSync(path.join(PKG_ROOT, "skills", s, "SKILL.md")))
  if (hasOfficialHeroUISkills) {
    green("Skills oficiales de HeroUI empaquetados (heroui-react, heroui-migration, heroui-native)")
  }


  drawBox([
    `   \x1b[1m\x1b[32m✔ Zugzbot v${PKG_VERSION} instalado!\x1b[0m`
  ], "\x1b[1m\x1b[32m")

  console.log(`
   \x1b[1mWorkflow:\x1b[0m opencode + @zugzbot (router cognitivo)

   \x1b[1mEstructura del proyecto v2:\x1b[0m
   ├── opencode.json              (14 agentes: zugzbot, f0-f5, aux-*)
   ├── tui.json
   ├── .openspec/
   │   ├── sdd-lock.json          (schema v7 con bloque tdd, git, session_features y design system)
   │   └── brain.md
   ├── .opencode/
   │   ├── profiles/              (8 profiles: node-ts, python, go, rust, java, gas, static-site)
   │   ├── plugins/               (TUI + SDD core)
   │   ├── skills/                (18 skills: premium + sdd-design-system + oficiales HeroUI)
   │   ├── tools/                 (herramientas SRP)
   │   ├── design/                (11 design systems: airbnb, apple, heroui, meta, nike, notion, renault, theverge, uber, voltagent, x.ai)
   │   └── templates/             (Plantillas oficiales de scaffolding para frontend y backend)
   └── prompts/                   (contratos y boundaries de cada fase)

   \x1b[1mDisciplina TDD:\x1b[0m Red → Green → Refactor
   \x1b[1mMulti-Stack:\x1b[0m Autodetecta Node/TS, Python, Go, Rust, Java, GAS
   \x1b[1mWorkflows:\x1b[0m full-sdd-tdd, quick-fix, audit, refactor, explain, oracle
   \x1b[1mDesign Systems:\x1b[0m 11 frameworks de diseño incorporados (incluyendo HeroUI)
   \x1b[1mHeroUI:\x1b[0m 3 skills oficiales ya copiados y listos en tu carpeta .opencode/skills/ (no requieres instalar nada más).
`)
}

init()
