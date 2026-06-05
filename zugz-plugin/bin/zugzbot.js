#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PKG_ROOT = path.resolve(__dirname, "..")

const INSTALL_DIR = process.cwd()

const TEMPLATE_SDD_LOCK_V2 = {
  schema_version: 2,
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
  complexity: "medium"
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
`

const BRAIN_TEMPLATE = `# 🧠 Brain del Proyecto

## General
- Proyecto inicializado con Zugzbot SDD v2.0.0 (TDD-discipline, stack-agnostic)
`

function green(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`) }
function yellow(msg) { console.log(`  \x1b[33m⚠\x1b[0m ${msg}`) }
function red(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`) }
function header(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`) }

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
    if (lock.schema_version === 2) return false
    return true
  } catch {
    return true
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
  const defaultModel = models?.default || "minimax-coding-plan/MiniMax-M2.7"
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
            "sdd_clasp": "allow"
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
            "sdd_git_awareness": "allow"
          }
        }
      },
      "sdd-planner": {
        "mode": "subagent",
        "model": agents["sdd-planner"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-planner.md}",
        "permission": {
          "edit": "allow",
          "bash": "ask",
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
            "check_dependency_cooldown": "allow"
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
            "sdd_security_vulnerability_scanner": "allow"
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
            "sdd_git_awareness": "allow"
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
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   Zugzbot SDD Plugin v2.0.0                              ║
║   Stack-Agnostic + TDD Discipline                        ║
╚══════════════════════════════════════════════════════════╝
`)

  if (detectLegacyInstallation(INSTALL_DIR)) {
    console.log()
    red("⚠ INSTALACIÓN LEGACY v1.x DETECTADA")
    red("Zugzbot v2.0.0 es un breaking change limpio (sin migrador).")
    red("Pasos para migrar manualmente:")
    console.log()
    console.log("  1. Cierra el ciclo activo actual:")
    console.log("     rm -rf .openspec/changes/<cambio-activo>")
    console.log("  2. Borra el lockfile antiguo:")
    console.log("     rm .openspec/sdd-lock.json")
    console.log("  3. Continúa con esta instalación de v2.0.0")
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
    green(".openspec/sdd-lock.json v2 creado (con bloque tdd y git)")
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

  const pluginTuiPath = path.join(PKG_ROOT, ".opencode/plugins/plugin_tui.tsx")
  const pluginCorePath = path.join(PKG_ROOT, ".opencode/plugins/plugin_sdd_core.ts")
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

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ✅ Zugzbot v2.0.0 instalado correctamente!             ║
╚══════════════════════════════════════════════════════════╝

   Workflow: opencode + @zugzbot (router cognitivo)

   Estructura del proyecto v2:
   ├── opencode.json              (14 agentes: zugzbot, f0-f5, aux-*)
   ├── tui.json
   ├── .openspec/
   │   ├── sdd-lock.json          (schema v2 con bloque tdd y git)
   │   └── brain.md
   ├── .opencode/
   │   ├── profiles/              (8 profiles: node-ts, python, go, rust, java, gas, static-site)
   │   ├── plugins/               (TUI + SDD core)
   │   ├── skills/                (11 skills premium)
   │   └── tools/                 (33 herramientas SRP)
   └── prompts/                   (contratos y boundaries de cada fase)

   TDD Discipline: Red → Green → Refactor enforced
   Stack-agnostic: detecta automáticamente Node/TS, Python, Go, Rust, Java, GAS
   Workflows: full-sdd-tdd, quick-fix, audit, refactor, explain, oracle
   Agents: 14 (zugzbot + 8 core SDD/TDD + 4 aux + 1 sdd-tester legacy alias)
`)
}

init()
