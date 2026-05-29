#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PKG_ROOT = path.resolve(__dirname, "..")

const INSTALL_DIR = process.cwd()

const TEMPLATE_OPENCODE_JSON = {
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
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/zugzbot.md}",
      "permission": {
        "task": { "sdd-*": "allow", "aux-*": "allow" },
        "question": "allow",
        "lsp": "allow",
        "edit": { ".openspec/sdd-lock.json": "allow" }
      }
    },
    "sdd-explorer": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-explorer.md}",
      "permission": {
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_generate_tree": "allow" }
      }
    },
    "sdd-planner": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-planner.md}",
      "permission": {
        "edit": "allow",
        "bash": "ask",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_brain_sync": "allow" }
      }
    },
    "sdd-builder": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-builder.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_ui_auditor": "allow" }
      }
    },
    "sdd-tester": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-tester.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_ui_auditor": "allow", "sdd_spec_validator": "allow" }
      }
    },
    "sdd-archiver": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-archiver.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_archive_and_commit": "allow", "sdd_transition": "allow", "sdd_brain_sync": "allow", "sdd_install_autoskills": "allow" }
      }
    },
    "sdd-deployer": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/sdd-deployer.md}",
      "permission": {
        "bash": "allow",
        "tools": { "sdd_transition": "allow" }
      }
    },
    "aux-handyman": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-handyman.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "aux-oracle": {
      "mode": "subagent",
      "prompt": "{file:./node_modules/zugzbot-sdd/agents/aux-oracle.md}",
      "permission": {
        "edit": "deny",
        "bash": "deny",
        "lsp": "deny"
      }
    }
  }
}

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

function green(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`) }
function yellow(msg) { console.log(`  \x1b[33m⚠\x1b[0m ${msg}`) }
function header(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`) }

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
  green("Directorios creados")

  header("📝 Creando archivos de configuración...")

  const opencodePath = path.join(INSTALL_DIR, "opencode.json")
  if (!fs.existsSync(opencodePath)) {
    fs.writeFileSync(opencodePath, JSON.stringify(TEMPLATE_OPENCODE_JSON, null, 2), "utf-8")
    green("opencode.json creado")
  } else {
    yellow("opencode.json ya existe, preservado")
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

  const gitignorePath = path.join(INSTALL_DIR, ".gitignore")
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8")
    if (!content.includes("# Zugzbot SDD")) {
      fs.appendFileSync(gitignorePath, "\n" + TEMPLATE_GITIGNORE, "utf-8")
      green(".gitignore actualizado")
    }
  }

  const sddScriptPath = path.join(PKG_ROOT, "sdd")
  const localSddPath = path.join(INSTALL_DIR, "sdd")
  if (fs.existsSync(sddScriptPath) && !fs.existsSync(localSddPath)) {
    fs.copyFileSync(sddScriptPath, localSddPath)
    fs.chmodSync(localSddPath, 0o755)
    green("Script ./sdd copiado")
  }

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

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ✅ Zugzbot SDD Plugin instalado correctamente!        ║
╚══════════════════════════════════════════════════════════╝

   Uso: opencode + @zugzbot para iniciar el ciclo SDD
        ./sdd status para ver el estado

   Estructura del proyecto:
   ├── opencode.json          (configuración de agentes)
   ├── tui.json               (configuración TUI)
   ├── .openspec/             (estado del ciclo SDD)
   │   ├── sdd-lock.json
   │   └── brain.md
   ├── .opencode/plugins/     (plugins de opencode)
   └── sdd                    (comando local)
`)
}

init()