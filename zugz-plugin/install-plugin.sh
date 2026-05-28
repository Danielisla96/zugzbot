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
    echo "📁 Creando estructura .opencode/"
    
    mkdir -p "$INSTALL_DIR/.opencode/tools"
    mkdir -p "$INSTALL_DIR/.opencode/plugins"
    mkdir -p "$INSTALL_DIR/.opencode/skills"
    
    echo "   ✓ Directorios creados"
}

copy_plugin_files() {
    echo "📦 Copiando archivos del plugin..."
    
    if [ -d "$PLUGIN_DIR/.opencode" ]; then
        cp -r "$PLUGIN_DIR/.opencode/"* "$INSTALL_DIR/.opencode/" 2>/dev/null || true
        echo "   ✓ Motor de herramientas (.opencode/tools/) copiado"
    fi
    
    if [ -d "$PLUGIN_DIR/agents" ]; then
        mkdir -p "$INSTALL_DIR/.opencode/agents"
        cp "$PLUGIN_DIR/agents/"*.md "$INSTALL_DIR/.opencode/agents/" 2>/dev/null || true
        echo "   ✓ Prompts de agentes (.opencode/agents/) copiados"
    fi
    
    if [ -d "$PLUGIN_DIR/skills" ]; then
        cp -r "$PLUGIN_DIR/skills/"* "$INSTALL_DIR/.opencode/skills/" 2>/dev/null || true
        echo "   ✓ Skills (.opencode/skills/) copiados"
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
  "$schema": "https://opencode.ai/schema.json",
  "agents": {
    "zugzbot": {
      "description": "Orquestador Maestro SDD",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "sdd-explorer": {
      "description": "Diagnosticador Fase 0",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "sdd-planner": {
      "description": "Planificador Fase 1",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "sdd-builder": {
      "description": "Constructor Fase 2",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "sdd-tester": {
      "description": "Tester Fase 3",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "sdd-archiver": {
      "description": "Archiver Fase 4",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "aux-handyman": {
      "description": "Tareas rápidas",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
    },
    "aux-oracle": {
      "description": "Consultas teóricas",
      "enabled": true,
      "model": "minimax-coding-plan/MiniMax-M2.7"
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
  "current_phase": "idle",
  "phase_status": "not_started",
  "auto_pilot": false,
  "change_name": null,
  "complexity": null,
  "retry_count": 0,
  "last_checkpoint": null
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
    echo "🔗 Creando alias ./sdd..."
    
    cat > "$INSTALL_DIR/sdd" << 'ALIAS_EOF'
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL="$DIR/.opencode/tools/sdd_transition.js"

case "$1" in
    status)
        node "$TOOL" status
        ;;
    clean)
        node "$TOOL" reset
        ;;
    autopilot)
        node "$TOOL" autopilot "${2:-off}"
        ;;
    *)
        node "$TOOL" "$@"
        ;;
esac
ALIAS_EOF
    
    chmod +x "$INSTALL_DIR/sdd"
    echo "   ✓ Alias ./sdd creado"
}

check_dependencies
create_opencode_structure
copy_plugin_files
create_shared_files
setup_openspec
update_gitignore
install_dependencies
create_sdd_alias

echo ""
echo "✅ Zugzbot SDD Plugin instalado correctamente!"
echo ""
echo "   Uso: opencode + @zugzbot para iniciar el ciclo SDD"
echo "   Alias: ./sdd status para ver el estado del ciclo"
echo ""
