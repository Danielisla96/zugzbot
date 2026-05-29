#!/usr/bin/env bash

set -e

INSTALL_DIR="$(pwd)"
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Instalando Zugzbot SDD Plugin..."

check_dependencies() {
    command -v node >/dev/null 2>&1 || { echo "❌ Node.js es requerido pero no está instalado."; exit 1; }
    command -v git >/dev/null 2>&1 || { echo "❌ Git es requerido pero no está instalado."; exit 1; }
    
    if command -v bun >/dev/null 2>&1; then
        PKG_MANAGER="bun"
    elif command -v npm >/dev/null 2>&1; then
        PKG_MANAGER="npm"
    else
        echo "❌ Se requiere Bun o NPM"
        exit 1
    fi
    
    echo "✅ Dependencias verificadas (usando $PKG_MANAGER)"
}

create_opencode_structure() {
    echo "📁 Creando estructura de herramientas..."
    
    mkdir -p "$INSTALL_DIR/.opencode/agents"
    mkdir -p "$INSTALL_DIR/.opencode/plugins"
    mkdir -p "$INSTALL_DIR/tools"
    mkdir -p "$INSTALL_DIR/plugins"
    mkdir -p "$INSTALL_DIR/skills"
    
    echo "   ✓ Directorios creados"
}

copy_plugin_files() {
    echo "📦 Copiando archivos del plugin..."
    
    local copy_failed=0
    
    if [ -d "$PLUGIN_DIR/tools" ]; then
        if ! cp -r "$PLUGIN_DIR/tools/"* "$INSTALL_DIR/tools/" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar tools/"
            copy_failed=1
        else
            echo "   ✓ Motor de herramientas (tools/) copiado"
        fi
    fi
    
    if [ -d "$PLUGIN_DIR/agents" ]; then
        if ! cp "$PLUGIN_DIR/agents/"*.md "$INSTALL_DIR/.opencode/agents/" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar agents/"
            copy_failed=1
        else
            echo "   ✓ Prompts de agentes (.opencode/agents/) copiados"
        fi
    fi
    
    if [ -d "$PLUGIN_DIR/commands" ]; then
        mkdir -p "$INSTALL_DIR/commands"
        if ! cp "$PLUGIN_DIR/commands/"*.md "$INSTALL_DIR/commands/" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar commands/"
            copy_failed=1
        else
            echo "   ✓ Comandos (commands/) copiados"
        fi
    fi
    
    if [ -d "$PLUGIN_DIR/skills" ]; then
        if ! cp -r "$PLUGIN_DIR/skills/"* "$INSTALL_DIR/skills/" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar skills/"
            copy_failed=1
        else
            echo "   ✓ Skills (skills/) copiados"
        fi
    fi
    
    if [ -d "$PLUGIN_DIR/plugins" ]; then
        if ! cp -r "$PLUGIN_DIR/plugins/"* "$INSTALL_DIR/plugins/" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar plugins/"
            copy_failed=1
        else
            echo "   ✓ Plugins (plugins/) copiados"
        fi
    fi
    
    if [ -f "$PLUGIN_DIR/sdd" ]; then
        if ! cp "$PLUGIN_DIR/sdd" "$INSTALL_DIR/sdd" 2>&1; then
            echo "   ⚠ ADVERTENCIA: Fallo al copiar script sdd"
            copy_failed=1
        else
            chmod +x "$INSTALL_DIR/sdd"
            echo "   ✓ Script sdd copiado"
        fi
    fi
    
    if [ $copy_failed -eq 1 ]; then
        echo "   ⚠ Algunos archivos no se copiaron correctamente"
    fi
    
    echo "   ✓ Archivos del plugin copiados"
}

create_shared_files() {
    echo "📝 Creando archivos compartidos..."
    
    if [ ! -f "$INSTALL_DIR/AGENTS.md" ]; then
        cp "$PLUGIN_DIR/AGENTS.md" "$INSTALL_DIR/AGENTS.md" 2>/dev/null || true
        echo "   ✓ AGENTS.md creado"
    fi
    
    if [ ! -f "$INSTALL_DIR/ZUGZ.md" ]; then
        cp "$PLUGIN_DIR/ZUGZ.md" "$INSTALL_DIR/ZUGZ.md" 2>/dev/null || true
        echo "   ✓ ZUGZ.md creado"
    fi
    
    if [ ! -f "$INSTALL_DIR/opencode.json" ]; then
        cat > "$INSTALL_DIR/opencode.json" << 'EOF'
{
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
      "prompt": "./agents/zugzbot.md",
      "permission": {
        "task": { "sdd-*": "allow", "aux-*": "allow" },
        "question": "allow",
        "lsp": "allow",
        "edit": { ".openspec/sdd-lock.json": "allow" }
      }
    },
"sdd-explorer": {
      "mode": "subagent",
      "prompt": "./agents/sdd-explorer.md",
      "permission": {
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_generate_tree": "allow" }
      }
    },
    "sdd-planner": {
      "mode": "subagent",
      "prompt": "./agents/sdd-planner.md",
      "permission": {
        "edit": "allow",
        "bash": "ask",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_brain_sync": "allow" }
      }
    },
    "sdd-builder": {
      "mode": "subagent",
      "prompt": "./agents/sdd-builder.md",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_ui_auditor": "allow" }
      }
    },
    "sdd-tester": {
      "mode": "subagent",
      "prompt": "./agents/sdd-tester.md",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_transition": "allow", "sdd_ui_auditor": "allow", "sdd_spec_validator": "allow" }
      }
    },
    "sdd-archiver": {
      "mode": "subagent",
      "prompt": "./agents/sdd-archiver.md",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow",
        "tools": { "sdd_archive_and_commit": "allow", "sdd_transition": "allow", "sdd_brain_sync": "allow", "sdd_install_autoskills": "allow" }
      }
    },
    "sdd-deployer": {
      "mode": "subagent",
      "prompt": "./agents/sdd-deployer.md",
      "permission": {
        "bash": "allow",
        "tools": { "sdd_transition": "allow" }
      }
    },
    "aux-handyman": {
      "mode": "subagent",
      "prompt": "./agents/aux-handyman.md",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "aux-oracle": {
      "mode": "subagent",
      "prompt": "./agents/aux-oracle.md",
      "permission": {
        "edit": "deny",
        "bash": "deny",
        "lsp": "deny"
      }
    }
  }
}
EOF
        echo "   ✓ opencode.json creado"
    fi
}

setup_openspec() {
    echo "🗂️ Configurando .openspec/"
    
    mkdir -p "$INSTALL_DIR/.openspec/changes"
    
    if [ ! -f "$INSTALL_DIR/.openspec/sdd-lock.json" ]; then
        cat > "$INSTALL_DIR/.openspec/sdd-lock.json" << 'EOF'
{
  "change_name": "nuevo-cambio",
  "active_phase": 0,
  "active_subagent": "sdd-explorer",
  "status": "idle",
  "auto_pilot": false,
  "iteration": 0,
  "last_updated": "",
  "orchestrator_mode": "delegation_only",
  "direction": "forward",
  "last_successful_phase": 0,
  "retry_count": 0,
  "corrective_loop_active": false,
  "fresh_task": false,
  "checkpoints": [],
  "tasks": [],
  "complexity": "medium",
  "last_checkpoint_id": null,
  "last_restored_from": null
}
EOF
        echo "   ✓ sdd-lock.json creado"
    fi
    
    if [ ! -f "$INSTALL_DIR/.openspec/brain.md" ]; then
        cat > "$INSTALL_DIR/.openspec/brain.md" << 'EOF'
# 🧠 Brain del Proyecto

## General
- Proyecto inicializado con Zugzbot SDD Plugin
EOF
        echo "   ✓ brain.md creado"
    fi
}

setup_opencode_plugins() {
    echo "🔌 Configurando plugins de OpenCode..."
    
    mkdir -p "$INSTALL_DIR/.opencode/plugins"
    
    if [ -f "$PLUGIN_DIR/plugins/plugin_tui.tsx" ]; then
        cp "$PLUGIN_DIR/plugins/plugin_tui.tsx" "$INSTALL_DIR/.opencode/plugins/" 2>/dev/null || true
        echo "   ✓ TUI plugin configurado"
    fi
    
    if [ -f "$PLUGIN_DIR/plugins/plugin_sdd_core.ts" ]; then
        cp "$PLUGIN_DIR/plugins/plugin_sdd_core.ts" "$INSTALL_DIR/.opencode/plugins/" 2>/dev/null || true
        echo "   ✓ Core plugin configurado"
    fi
    
    echo "   ✓ OpenCode plugins configurados"
}

copy_models_config() {
    echo "📊 Copiando configuración de modelos..."
    
    if [ -f "$PLUGIN_DIR/zugz-models.json" ]; then
        if [ ! -f "$INSTALL_DIR/zugz-models.json" ]; then
            cp "$PLUGIN_DIR/zugz-models.json" "$INSTALL_DIR/zugz-models.json" 2>/dev/null || true
            echo "   ✓ zugz-models.json copiado"
        else
            echo "   ✓ zugz-models.json ya existe"
        fi
    fi
    
    echo "   ✓ Configuración de modelos completada"
}

update_gitignore() {
    echo "🔒 Actualizando .gitignore..."
    
    if [ ! -f "$INSTALL_DIR/.gitignore" ]; then
        touch "$INSTALL_DIR/.gitignore"
    fi
    
    GITIGNORE_CONTENT='
# Zugzbot SDD Plugin - Archivos locales
.opencode/
tui.json
.openspec/sdd-lock.json
.openspec/checkpoints/

# Logs y backups
*.log
*.backup

# OS files
.DS_Store
Thumbs.db
'
    
    if ! grep -q "# Zugzbot SDD Plugin" "$INSTALL_DIR/.gitignore" 2>/dev/null; then
        echo "$GITIGNORE_CONTENT" >> "$INSTALL_DIR/.gitignore"
        echo "   ✓ .gitignore actualizado"
    fi
}

install_dependencies() {
    echo "📚 Instalando dependencias..."
    
    cd "$INSTALL_DIR"
    
    if [ -f "$PLUGIN_DIR/package.json" ]; then
        if [ "$PKG_MANAGER" = "bun" ]; then
            bun install
        else
            npm install
        fi
        echo "   ✓ Dependencias instaladas"
    fi
}

create_sdd_alias() {
    echo "🔗 Configurando comando ./sdd..."
    
    if [ -f "$INSTALL_DIR/sdd" ]; then
        chmod +x "$INSTALL_DIR/sdd"
        echo "   ✓ ./sdd configurado y ejecutable"
    else
        echo "   ⚠ ADVERTENCIA: Script sdd no encontrado en $INSTALL_DIR/sdd"
    fi
}

check_dependencies
create_opencode_structure
copy_plugin_files
create_shared_files
setup_openspec
setup_opencode_plugins
copy_models_config
update_gitignore
install_dependencies
create_sdd_alias

echo ""
echo "✅ Zugzbot SDD Plugin instalado correctamente!"
echo ""
echo "   Uso: opencode + @zugzbot para iniciar el ciclo SDD"
echo "   Alias: ./sdd status para ver el estado del ciclo"
echo ""
