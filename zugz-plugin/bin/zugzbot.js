#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PKG_ROOT = path.resolve(__dirname, "..")

const INSTALL_DIR = process.cwd()

const TEMPLATE_SDD_LOCK = {
  change_name: "nuevo-cambio",
  active_phase: 0,
  active_subagent: "sdd-explorer",
  status: "idle",
  auto_pilot: false,
  iteration: 0,
  last_updated: "",
  orchestrator_mode: "delegation_only",
  direction: "forward",
  last_successful_phase: 0,
  retry_count: 0,
  corrective_loop_active: false,
  fresh_task: false,
  checkpoints: [],
  tasks: [],
  complexity: "medium",
  last_checkpoint_id: null,
  last_restored_from: null
}

const TEMPLATE_TUI_JSON = {
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["./.opencode/plugins/plugin_tui.tsx"]
}

const TEMPLATE_GITIGNORE = `# Zugzbot SDD
.openspec/sdd-lock.json
.openspec/checkpoints/
tui.json
`

const BRAIN_TEMPLATE = `# 🧠 Brain del Proyecto

## General
- Proyecto inicializado con Zugzbot SDD Plugin v1.0.0
`

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

function buildOpencodeJson(models) {
  const defaultModel = models?.default || "minimax-coding-plan/MiniMax-M2.7"
  const agents = models?.agents || {}

  return {
    "$schema": "https://opencode.ai/config.json",
    "lsp": true,
    "permission": {
      "edit": "allow",
      "bash": "allow",
      "lsp": "allow"
    },
    "agent": {
      "zugzbot": {
        "mode": "primary",
        "model": agents.zugzbot || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/zugzbot.md}",
        "permission": {
          "task": { "sdd-*": "allow", "aux-*": "allow" },
          "question": "allow",
          "lsp": "allow",
          "tools": {
            "sdd_transition": "allow",
            "sdd_checkpoint": "allow",
            "sdd_compact_context": "allow",
            "sdd_context_pruner": "allow"
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
          "tools": {
            "sdd_transition": "allow",
            "sdd_generate_tree": "allow"
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
          "tools": {
            "sdd_transition": "allow",
            "sdd_brain_sync": "allow",
            "sdd_requirement_tracker": "allow",
            "check_dependency_cooldown": "allow",
            "sdd_diff_impact_analyzer": "allow",
            "sdd_auto_api_mocker": "allow",
            "sdd_test_scaffold_generator": "allow",
            "sdd_context_pruner": "allow"
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
          "tools": {
            "sdd_transition": "allow",
            "sdd_ui_auditor": "allow",
            "sdd_secret_scanner": "allow",
            "sdd_security_vulnerability_scanner": "allow",
            "sdd_visual_regression_diff": "allow",
            "sdd_auto_api_mocker": "allow",
            "sdd_spec_compliance_linter": "allow",
            "sdd_syntax_and_linter_auditor": "allow"
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
          "tools": {
            "sdd_transition": "allow",
            "sdd_ui_auditor": "allow",
            "sdd_spec_validator": "allow",
            "sdd_regression_detector": "allow",
            "sdd_bdd_tester": "allow",
            "sdd_requirement_tracker": "allow",
            "sdd_diff_impact_analyzer": "allow",
            "sdd_security_vulnerability_scanner": "allow",
            "sdd_visual_regression_diff": "allow",
            "sdd_performance_regress_profiler": "allow",
            "sdd_auto_api_mocker": "allow",
            "sdd_test_scaffold_generator": "allow",
            "sdd_spec_compliance_linter": "allow",
            "sdd_sandbox_patcher": "allow",
            "sdd_syntax_and_linter_auditor": "allow"
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
          "tools": {
            "sdd_archive_and_commit": "allow",
            "sdd_transition": "allow",
            "sdd_brain_sync": "allow",
            "sdd_install_autoskills": "allow",
            "sdd_context_pruner": "allow"
          }
        }
      },
      "sdd-deployer": {
        "mode": "subagent",
        "model": agents["sdd-deployer"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-deployer.md}",
        "permission": {
          "bash": "allow",
          "tools": {
            "sdd_transition": "allow"
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
          "lsp": "allow"
        }
      },
      "aux-oracle": {
        "mode": "subagent",
        "model": agents["aux-oracle"] || defaultModel,
        "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-oracle.md}",
        "permission": {
          "edit": "deny",
          "bash": "deny",
          "lsp": "deny"
        }
      }
    }
  }
}

function green(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`) }
function yellow(msg) { console.log(`  \x1b[33m⚠\x1b[0m ${msg}`) }
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

function init() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║          Zugzbot SDD Plugin v1.0.0                     ║
║          Spec-Driven Development Swarm                  ║
╚══════════════════════════════════════════════════════════╝
`)

  header("📁 Estructurando proyecto...")

  fs.mkdirSync(path.join(INSTALL_DIR, ".openspec/changes"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/plugins"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/skills"), { recursive: true })
  fs.mkdirSync(path.join(INSTALL_DIR, ".opencode/tools"), { recursive: true })
  green("Directorios creados")

  header("📝 Creando archivos de configuración...")

  const models = getTemplateModels()
  const opencodeJson = buildOpencodeJson(models)

  const opencodePath = path.join(INSTALL_DIR, "opencode.json")
  fs.writeFileSync(opencodePath, JSON.stringify(opencodeJson, null, 2), "utf-8")
  green("opencode.json creado (modelos aplicados desde zugz-models.json)")

  const tuiPath = path.join(INSTALL_DIR, "tui.json")
  if (!fs.existsSync(tuiPath)) {
    fs.writeFileSync(tuiPath, JSON.stringify(TEMPLATE_TUI_JSON, null, 2), "utf-8")
    green("tui.json creado")
  } else {
    yellow("tui.json ya existe, preservado")
  }

  const sddLockPath = path.join(INSTALL_DIR, ".openspec/sdd-lock.json")
  if (!fs.existsSync(sddLockPath)) {
    fs.writeFileSync(sddLockPath, JSON.stringify(TEMPLATE_SDD_LOCK, null, 2), "utf-8")
    green(".openspec/sdd-lock.json creado")
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

  const modelsPath = path.join(INSTALL_DIR, "zugz-models.json")
  const templateModelsPath = path.join(PKG_ROOT, "zugz-models.json")
  if (!fs.existsSync(modelsPath) && fs.existsSync(templateModelsPath)) {
    fs.copyFileSync(templateModelsPath, modelsPath)
    green("zugz-models.json copiado")
  }

  const gitignorePath = path.join(INSTALL_DIR, ".gitignore")
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8")
    if (!content.includes("# Zugzbot SDD")) {
      fs.appendFileSync(gitignorePath, "\n" + TEMPLATE_GITIGNORE, "utf-8")
      green(".gitignore actualizado")
    }
  }

  // No local CLI script copying needed (100% native OpenCode architecture)

  const pluginTuiPath = path.join(PKG_ROOT, "plugins/plugin_tui.tsx")
  const pluginCorePath = path.join(PKG_ROOT, "plugins/plugin_sdd_core.ts")
  const localPluginDir = path.join(INSTALL_DIR, ".opencode/plugins")

  if (fs.existsSync(pluginTuiPath)) {
    fs.copyFileSync(pluginTuiPath, path.join(localPluginDir, "plugin_tui.tsx"))
    green("plugin_tui.tsx copiado")
  }
  if (fs.existsSync(pluginCorePath)) {
    fs.copyFileSync(pluginCorePath, path.join(localPluginDir, "plugin_sdd_core.ts"))
    green("plugin_sdd_core.ts copiado")
  }

  const sourceSkillsDir = path.join(PKG_ROOT, "skills")
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

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ✅ Zugzbot SDD Plugin instalado correctamente!        ║
╚══════════════════════════════════════════════════════════╝

   Uso: opencode + @zugzbot para iniciar el ciclo SDD

   Estructura del proyecto:
   ├── opencode.json          (configuración de agentes)
   ├── tui.json               (configuración TUI)
   ├── .openspec/             (estado del ciclo SDD)
   │   ├── sdd-lock.json
   │   └── brain.md
   └── .opencode/plugins/     (plugins de opencode)
`)
}

init()