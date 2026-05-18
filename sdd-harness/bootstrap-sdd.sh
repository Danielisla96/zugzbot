#!/bin/bash
# ==============================================================================
#  bootstrap-sdd.sh
#  Spec-Driven Development (SDD) Orchestration Environment Bootstrap Installer
# ==============================================================================
#
# Initializes the SDD methodology in any new repository using OpenCode.
# All configuration is scoped to the target project — nothing is written globally.
#
# Version: 1.1.0

set -e

HARNESS_VERSION="1.1.0"
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      ;;
  esac
done

# Curated HSL-tailored premium ANSI colors
COLOR_BORDER='\033[38;5;239m'   # Sleek charcoal grey
COLOR_HEADER='\033[38;5;81m'    # Premium electric cyan
COLOR_MUTED='\033[38;5;244m'     # Soft grey for descriptions
COLOR_SUCCESS='\033[38;5;120m'  # Vivid bright green
COLOR_WARNING='\033[38;5;214m'  # Warm amber orange
COLOR_ERROR='\033[38;5;196m'    # Deep crimson red
NC='\033[0m'                    # Reset

# Clear screen only if in an interactive terminal
if [ -t 1 ]; then
    clear 2>/dev/null || true
fi

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Zugzbot SDD Harness${NC} ${COLOR_MUTED}• Orchestration System Installer${NC}  ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "  ${COLOR_WARNING}⚠  MODO PREVISUALIZACIÓN (DRY RUN) — Sin escribir archivos${NC}\n"
fi

# --- Dependency check ---
if ! command -v git &>/dev/null; then
    echo -e "  ${COLOR_ERROR}❌ Error: 'git' no está instalado o no se encuentra en el PATH.${NC}"
    exit 1
fi

# Resolve directories
HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR=$(pwd)

# Safety check
if [ ! -d "$HARNESS_DIR/agents" ] || [ ! -d "$HARNESS_DIR/project-templates" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se pueden localizar las carpetas del arnés.${NC}"
    exit 1
fi

# Prevent running inside the zugzbot repo itself
if [ "$TARGET_DIR" = "$HARNESS_DIR" ] || [ "$TARGET_DIR" = "$(dirname "$HARNESS_DIR")" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: Corre el instalador desde la raíz de tu proyecto DESTINO, no en zugzbot.${NC}"
    exit 1
fi

echo -e "  ${COLOR_MUTED}▪ Directorio del arnés: ${NC}$HARNESS_DIR"
echo -e "  ${COLOR_MUTED}▪ Directorio destino:   ${NC}$TARGET_DIR\n"

# 0. Git repository check and initialization
echo -e "  ${COLOR_BORDER}[0/7]${NC} 🔧 Verificando repositorio Git..."
if [ -d "$TARGET_DIR/.git" ]; then
    echo -e "        ${COLOR_SUCCESS}✓ Repositorio Git activo detectado.${NC}"
else
    echo -e "        ${COLOR_MUTED}▪ Inicializando nuevo repositorio git...${NC}"
    # Create a generic .gitignore if one doesn't exist
    if [ ! -f "$TARGET_DIR/.gitignore" ]; then
        cat > "$TARGET_DIR/.gitignore" << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
out/
.next/
.nuxt/

# Python
__pycache__/
*.py[cod]
*.pyo
*.pyd
.venv/
venv/
env/
*.egg-info/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Editor / OS
.DS_Store
.idea/
.vscode/
*.swp
*.swo
Thumbs.db

# SDD artifacts (generated, not source)
openspec/changes/archive/
GITIGNORE
        echo -e "        ${COLOR_SUCCESS}✓ Archivo .gitignore creado.${NC}"
    fi
    if [ "$DRY_RUN" = false ]; then
        git -C "$TARGET_DIR" init -b main &>/dev/null
        git -C "$TARGET_DIR" add . &>/dev/null
        git -C "$TARGET_DIR" commit -m "chore: initial commit — before SDD harness bootstrap" &>/dev/null
        echo -e "        ${COLOR_SUCCESS}✓ Repositorio Git inicializado con commit inicial.${NC}"
    fi
fi

# 1. Create project directory structure
echo -e "  ${COLOR_BORDER}[1/7]${NC} 📂 Creando estructura de carpetas..."
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_DIR/.opencode/agents"
    mkdir -p "$TARGET_DIR/.opencode/commands"
    mkdir -p "$TARGET_DIR/.opencode/skills"
    mkdir -p "$TARGET_DIR/.agent/workflows"
    mkdir -p "$TARGET_DIR/.agent/skills"
    mkdir -p "$TARGET_DIR/openspec/schemas/ssd-orchestrated"
fi
echo -e "        ${COLOR_SUCCESS}✓ Carpetas del ciclo SDD creadas.${NC}"

# 2. Install agent prompts locally (project-scoped, not global)
echo -e "  ${COLOR_BORDER}[2/7]${NC} 🤖 Instalando perfiles de subagentes..."
if [ "$DRY_RUN" = false ]; then
    cp "$HARNESS_DIR"/agents/*.md "$TARGET_DIR/.opencode/agents/" &>/dev/null
fi
echo -e "        ${COLOR_SUCCESS}✓ Prompts de sistema inyectados de forma segura.${NC}"

# 3. Generate project-local opencode.jsonc
echo -e "  ${COLOR_BORDER}[3/7]${NC} ⚙️  Generando registro de agentes (opencode.jsonc)..."
OPENCODE_CONFIG="$TARGET_DIR/opencode.jsonc"
SKIP_CONFIG=false

if [ "$DRY_RUN" = true ]; then
    SKIP_CONFIG=true
elif [ -f "$OPENCODE_CONFIG" ]; then
    echo -e "        ${COLOR_WARNING}⚠  Ya existe opencode.jsonc en el proyecto destino.${NC}"
    read -p "        ¿Sobrescribir con la configuración del arnés SDD? (s/n): " confirm
    if [[ ! "$confirm" =~ ^[sS]$ ]]; then
        echo -e "        ${COLOR_MUTED}▪ Manteniendo opencode.jsonc original.${NC}"
        SKIP_CONFIG=true
    fi
fi

if [ "$SKIP_CONFIG" = false ]; then
    cat > "$OPENCODE_CONFIG" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "zugzbot": {
      "mode": "primary",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "task": {
          "sdd-*": "allow"
        }
      }
    },
    "sdd-proposer": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-planner": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-implementer": {
      "mode": "subagent",
      "model": "opencode/minimax-m2.5-free",
      "variant": "medium"
    },
    "sdd-verifier": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-documenter": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-ui-designer": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "aux-oracle": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "aux-handyman": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    }
  }
}
EOF
    echo -e "        ${COLOR_SUCCESS}✓ Archivo opencode.jsonc inyectado.${NC}"
fi

# 4. Copy skills, workflows, commands and OpenSpec schemas
echo -e "  ${COLOR_BORDER}[4/7]${NC} 🧩 Copiando habilidades y configuraciones MCP..."
if [ "$DRY_RUN" = false ]; then
    # Use cp -rn (no-overwrite) so re-running the bootstrap never clobbers customized skills
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/workflows/. "$TARGET_DIR/.agent/workflows/" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/skills/.    "$TARGET_DIR/.agent/skills/" &>/dev/null || true
    cp -n "$HARNESS_DIR"/project-templates/dot-agent/mcp-config.json "$TARGET_DIR/.agent/mcp-config.json" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/commands/. "$TARGET_DIR/.opencode/commands/" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/skills/.  "$TARGET_DIR/.opencode/skills/" &>/dev/null || true
    cp -n "$HARNESS_DIR"/project-templates/dot-opencode/mcp-config.json "$TARGET_DIR/.opencode/mcp-config.json" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/openspec-schema/ssd-orchestrated/. \
            "$TARGET_DIR/openspec/schemas/ssd-orchestrated/" &>/dev/null || true
fi
echo -e "        ${COLOR_SUCCESS}✓ Habilidades, esquemas y configuraciones MCP instaladas.${NC}"

# 5. Write harness version marker
echo -e "  ${COLOR_BORDER}[5/7]${NC} 🏷  Escribiendo marcador de versión..."
if [ "$DRY_RUN" = false ]; then
    echo "$HARNESS_VERSION" > "$TARGET_DIR/.agent/.sdd-harness-version"
fi
echo -e "        ${COLOR_SUCCESS}✓ Versión del arnés fijada en v${HARNESS_VERSION}.${NC}"

# 6. Git checkpoint: post-harness-install
echo -e "  ${COLOR_BORDER}[6/7]${NC} 📸 Creando checkpoint de instalación en Git..."
if [ "$DRY_RUN" = false ]; then
    git -C "$TARGET_DIR" add . &>/dev/null
    git -C "$TARGET_DIR" commit -m "chore(sdd): bootstrap harness installed" &>/dev/null || true
fi
echo -e "        ${COLOR_SUCCESS}✓ Punto de control guardado en el historial Git.${NC}"

# 7. Install AGENTS.md
echo -e "  ${COLOR_BORDER}[7/7]${NC} 📜 Sincronizando reglamento de conducta (AGENTS.md)..."
SKIP_AGENTS=false
if [ "$DRY_RUN" = true ]; then
    SKIP_AGENTS=true
elif [ -f "$TARGET_DIR/AGENTS.md" ]; then
    echo -e "        ${COLOR_WARNING}⚠  Ya existe AGENTS.md en el proyecto destino.${NC}"
    read -p "        ¿Sobrescribir con el reglamento de Zugzbot? (s/n): " confirm
    if [[ ! "$confirm" =~ ^[sS]$ ]]; then
        echo -e "        ${COLOR_MUTED}▪ Manteniendo AGENTS.md original.${NC}"
        SKIP_AGENTS=true
    fi
fi

if [ "$SKIP_AGENTS" = false ]; then
    cp "$HARNESS_DIR/project-templates/AGENTS.md" "$TARGET_DIR/AGENTS.md" &>/dev/null
    echo -e "        ${COLOR_SUCCESS}✓ Reglamento de conducta de Zugzbot inyectado.${NC}"
fi

# Premium Done Card
echo -e "\n${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡INSTALACIÓN COMPLETADA CON ÉXITO!                       ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Siguientes pasos recomendados:${NC}                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}1. Abre Cursor o ejecuta 'opencode' en este proyecto.      ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}2. Llama a Zugzbot y pídele el cambio que necesitas.       ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}3. Zugzbot orquestará el ciclo SDD de forma impecable.     ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}\n"
