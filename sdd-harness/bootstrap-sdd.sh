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
AUTO_CONFIRM=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      ;;
    --auto)
      AUTO_CONFIRM=true
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

# 0. Diagnóstico del Proyecto Destino
echo -e "  ${COLOR_BORDER}[0/8]${NC} 🔍 Diagnóstico del Proyecto Destino..."

DETECTED_LANGS=""
DETECTED_FRAMEWORKS=""
DETECTED_DBS=""
DETECTED_TESTS=""
HAS_FRONTEND=false

# 1. Detectar Lenguajes y Entornos de Ejecución
if [ -f "$TARGET_DIR/package.json" ]; then
    DETECTED_LANGS="$DETECTED_LANGS Node.js/JS"
    if grep -q '"typescript"' "$TARGET_DIR/package.json" 2>/dev/null || [ -f "$TARGET_DIR/tsconfig.json" ]; then
        DETECTED_LANGS="$DETECTED_LANGS (TypeScript)"
    fi
    
    if grep -q '"next"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Next.js"
        HAS_FRONTEND=true
    fi
    if grep -q '"react"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS React"
        HAS_FRONTEND=true
    fi
    if grep -q '"vue"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Vue"
        HAS_FRONTEND=true
    fi
    if grep -q '"express"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Express"
    fi
    
    if grep -q '"jest"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_TESTS="$DETECTED_TESTS Jest"
    elif grep -q '"vitest"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_TESTS="$DETECTED_TESTS Vitest"
    elif grep -q '"mocha"' "$TARGET_DIR/package.json" 2>/dev/null; then
        DETECTED_TESTS="$DETECTED_TESTS Mocha"
    fi
fi

if [ -f "$TARGET_DIR/requirements.txt" ] || [ -f "$TARGET_DIR/pyproject.toml" ] || [ -f "$TARGET_DIR/Pipfile" ]; then
    DETECTED_LANGS="$DETECTED_LANGS Python"
    
    if [ -f "$TARGET_DIR/requirements.txt" ]; then
        if grep -q -i "django" "$TARGET_DIR/requirements.txt" 2>/dev/null; then
            DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Django"
        fi
        if grep -q -i "fastapi" "$TARGET_DIR/requirements.txt" 2>/dev/null; then
            DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS FastAPI"
        fi
        if grep -q -i "flask" "$TARGET_DIR/requirements.txt" 2>/dev/null; then
            DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Flask"
        fi
        if grep -q -i "pytest" "$TARGET_DIR/requirements.txt" 2>/dev/null; then
            DETECTED_TESTS="$DETECTED_TESTS Pytest"
        fi
    fi
fi

if [ -f "$TARGET_DIR/go.mod" ]; then
    DETECTED_LANGS="$DETECTED_LANGS Go"
    GO_MOD_NAME=$(grep -m 1 "module " "$TARGET_DIR/go.mod" | awk '{print $2}')
    DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Go-Module ($GO_MOD_NAME)"
fi

if [ -f "$TARGET_DIR/Cargo.toml" ]; then
    DETECTED_LANGS="$DETECTED_LANGS Rust"
fi

if [ -f "$TARGET_DIR/composer.json" ]; then
    DETECTED_LANGS="$DETECTED_LANGS PHP"
    if grep -q '"laravel/framework"' "$TARGET_DIR/composer.json" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Laravel"
    fi
fi

if [ -f "$TARGET_DIR/Gemfile" ]; then
    DETECTED_LANGS="$DETECTED_LANGS Ruby"
    if grep -q "rails" "$TARGET_DIR/Gemfile" 2>/dev/null; then
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Rails"
    fi
fi

if [ "$HAS_FRONTEND" = false ]; then
    if find "$TARGET_DIR" -maxdepth 3 \( -name "*.html" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" \) 2>/dev/null | grep -q .; then
        HAS_FRONTEND=true
        DETECTED_FRAMEWORKS="$DETECTED_FRAMEWORKS Frontend-Files"
    fi
fi

if [ -f "$TARGET_DIR/.env" ]; then
    if grep -q -i "postgres" "$TARGET_DIR/.env" 2>/dev/null; then
        DETECTED_DBS="$DETECTED_DBS PostgreSQL"
    fi
    if grep -q -i "mysql" "$TARGET_DIR/.env" 2>/dev/null; then
        DETECTED_DBS="$DETECTED_DBS MySQL"
    fi
    if grep -q -i "mongo" "$TARGET_DIR/.env" 2>/dev/null; then
        DETECTED_DBS="$DETECTED_DBS MongoDB"
    fi
    if grep -q -i "sqlite" "$TARGET_DIR/.env" 2>/dev/null || grep -q -i "\.db" "$TARGET_DIR/.env" 2>/dev/null; then
        DETECTED_DBS="$DETECTED_DBS SQLite"
    fi
fi

DETECTED_LANGS=$(echo "$DETECTED_LANGS" | sed -e 's/^[[:space:]]*//')
DETECTED_FRAMEWORKS=$(echo "$DETECTED_FRAMEWORKS" | sed -e 's/^[[:space:]]*//')
DETECTED_DBS=$(echo "$DETECTED_DBS" | sed -e 's/^[[:space:]]*//')
DETECTED_TESTS=$(echo "$DETECTED_TESTS" | sed -e 's/^[[:space:]]*//')

[ -z "$DETECTED_LANGS" ] && DETECTED_LANGS="No detectado (Proyecto nuevo / Genérico)"
[ -z "$DETECTED_FRAMEWORKS" ] && DETECTED_FRAMEWORKS="Genérico / Desconocido"
[ -z "$DETECTED_DBS" ] && DETECTED_DBS="Ninguna detectada"
[ -z "$DETECTED_TESTS" ] && DETECTED_TESTS="Ninguno detectado"

echo -e "        ${COLOR_HEADER}📈 DIAGNÓSTICO DEL PROYECTO DESTINO${NC}"
echo -e "        ${COLOR_BORDER}────────────────────────────────────────────────────────${NC}"
echo -e "        ${COLOR_MUTED}▪ Lenguaje(s):${NC}    ${COLOR_SUCCESS}${DETECTED_LANGS}${NC}"
echo -e "        ${COLOR_MUTED}▪ Frameworks:${NC}     ${COLOR_SUCCESS}${DETECTED_FRAMEWORKS}${NC}"
echo -e "        ${COLOR_MUTED}▪ Base de Datos:${NC}  ${COLOR_SUCCESS}${DETECTED_DBS}${NC}"
echo -e "        ${COLOR_MUTED}▪ Pruebas / QA:${NC}   ${COLOR_SUCCESS}${DETECTED_TESTS}${NC}"
if [ "$HAS_FRONTEND" = true ]; then
    echo -e "        ${COLOR_MUTED}▪ UI Designer:${NC}    ${COLOR_SUCCESS}Habilitado (Fase 4 activa)${NC}"
else
    echo -e "        ${COLOR_MUTED}▪ UI Designer:${NC}    ${COLOR_WARNING}Desactivado (Sin frontend)${NC}"
fi
echo -e "        ${COLOR_BORDER}────────────────────────────────────────────────────────${NC}"
echo -e "        ${COLOR_HEADER}💡 RECOMENDACIÓN DE CONTEXTO SEGURO${NC}"
echo -e "        ${COLOR_MUTED}Para crear habilidades personalizadas de forma muy segura${NC}"
echo -e "        ${COLOR_MUTED}y adaptadas a estas tecnologías, te recomendamos ejecutar:${NC}"
echo -e "        ${COLOR_SUCCESS}npx autoskills --detect${NC}"
echo -e "        ${COLOR_BORDER}────────────────────────────────────────────────────────${NC}\n"

# 1. Git repository check and initialization
echo -e "  ${COLOR_BORDER}[1/8]${NC} 🔧 Verificando repositorio Git..."
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
.openspec/changes/archive/
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

# 2. Create project directory structure
echo -e "  ${COLOR_BORDER}[2/8]${NC} 📂 Creando estructura de carpetas..."
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_DIR/.opencode/agents"
    mkdir -p "$TARGET_DIR/.opencode/commands"
    mkdir -p "$TARGET_DIR/.opencode/skills"
    mkdir -p "$TARGET_DIR/.agent/workflows"
    mkdir -p "$TARGET_DIR/.agent/skills"
    mkdir -p "$TARGET_DIR/.openspec/schemas/ssd-orchestrated"
    
    # Inicializar el lockfile de persistencia de estado si no existe
    if [ ! -f "$TARGET_DIR/.openspec/sdd-lock.json" ]; then
        cp "$HARNESS_DIR/project-templates/openspec-schema/ssd-orchestrated/sdd-lock.json" "$TARGET_DIR/.openspec/sdd-lock.json" 2>/dev/null || cat > "$TARGET_DIR/.openspec/sdd-lock.json" << 'EOF'
{
  "change_name": "nuevo-cambio",
  "active_phase": 0,
  "active_subagent": "sdd-architect",
  "status": "idle",
  "auto_pilot": false,
  "last_updated": ""
}
EOF
    fi

    # Inicializar el prompt base centralizado
    cp "$HARNESS_DIR/project-templates/openspec-schema/ssd-orchestrated/prompt_base.md" "$TARGET_DIR/.openspec/prompt_base.md" 2>/dev/null || true

    # Inicializar el cerebro del proyecto si no existe
    if [ ! -f "$TARGET_DIR/.openspec/brain.md" ]; then
        cp "$HARNESS_DIR/project-templates/openspec-schema/ssd-orchestrated/brain.md" "$TARGET_DIR/.openspec/brain.md" 2>/dev/null || cat > "$TARGET_DIR/.openspec/brain.md" << 'EOF'
# 🧠 Cerebro del Proyecto: Memoria y Reglas de Larga Duración

Este archivo actúa como la memoria a largo plazo y el cerebro del proyecto para **Zugzbot** y todos sus subagentes.
EOF
    fi
fi
echo -e "        ${COLOR_SUCCESS}✓ Carpetas del ciclo SDD creadas, lockfile y cerebro inicializados.${NC}"


# 3. Install agent prompts locally (project-scoped, not global)
echo -e "  ${COLOR_BORDER}[3/8]${NC} 🤖 Instalando perfiles de subagentes..."
if [ "$DRY_RUN" = false ]; then
    rm -f "$TARGET_DIR/.opencode/agents/"*.md &>/dev/null || true
    cp "$HARNESS_DIR"/agents/*.md "$TARGET_DIR/.opencode/agents/" &>/dev/null
fi
echo -e "        ${COLOR_SUCCESS}✓ Prompts de sistema inyectados de forma segura.${NC}"

# 4. Generate project-local opencode.jsonc
echo -e "  ${COLOR_BORDER}[4/8]${NC} ⚙️  Generando registro de agentes (opencode.jsonc)..."
OPENCODE_CONFIG="$TARGET_DIR/opencode.jsonc"
SKIP_CONFIG=false

if [ "$DRY_RUN" = true ]; then
    SKIP_CONFIG=true
elif [ -f "$OPENCODE_CONFIG" ]; then
    echo -e "        ${COLOR_WARNING}⚠  Ya existe opencode.jsonc en el proyecto destino.${NC}"
    if [ "$AUTO_CONFIRM" = true ]; then
        confirm="s"
        echo -e "        ${COLOR_MUTED}▪ [Auto-confirm] Sobrescribiendo opencode.jsonc...${NC}"
    else
        read -p "        ¿Sobrescribir con la configuración del arnés SDD? (s/n): " confirm
    fi
    if [[ ! "$confirm" =~ ^[sS]$ ]]; then
        echo -e "        ${COLOR_MUTED}▪ Manteniendo opencode.jsonc original.${NC}"
        SKIP_CONFIG=true
    fi
fi

if [ "$SKIP_CONFIG" = false ]; then
    cat > "$OPENCODE_CONFIG" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "question": "allow",
    "lsp": "allow"
  },
  "agent": {
    "zugzbot": {
      "mode": "primary",
      "model": "google/gemini-3.5-flash",
      "variant": "medium",
      "permission": {
        "task": {
          "sdd-*": "allow"
        },
        "question": "allow",
        "lsp": "allow"
      }
    },
    "sdd-architect": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    },
    "sdd-implementer": {
      "mode": "subagent",
      "model": "google/gemini-3.5-flash",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    },
    "sdd-launcher": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    },
    "sdd-release-manager": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    },
    "aux-oracle": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    },
    "aux-handyman": {
      "mode": "subagent",
      "model": "google/gemini-3.5-flash",
      "variant": "medium",
      "permission": {
        "question": "allow",
        "lsp": "allow"
      }
    }
  }
}
EOF
    echo -e "        ${COLOR_SUCCESS}✓ Archivo opencode.jsonc inyectado.${NC}"
fi

# 5. Copy skills, workflows, commands and OpenSpec schemas
echo -e "  ${COLOR_BORDER}[5/8]${NC} 🧩 Copiando habilidades y configuraciones MCP..."
if [ "$DRY_RUN" = false ]; then
    # Use cp -rn (no-overwrite) so re-running the bootstrap never clobbers customized skills
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/workflows/. "$TARGET_DIR/.agent/workflows/" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/skills/.    "$TARGET_DIR/.agent/skills/" &>/dev/null || true
    cp -n "$HARNESS_DIR"/project-templates/dot-agent/mcp-config.json "$TARGET_DIR/.agent/mcp-config.json" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/commands/. "$TARGET_DIR/.opencode/commands/" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/skills/.  "$TARGET_DIR/.opencode/skills/" &>/dev/null || true
    cp -n "$HARNESS_DIR"/project-templates/dot-opencode/mcp-config.json "$TARGET_DIR/.opencode/mcp-config.json" &>/dev/null || true
    cp -rn "$HARNESS_DIR"/project-templates/openspec-schema/ssd-orchestrated/. \
            "$TARGET_DIR/.openspec/schemas/ssd-orchestrated/" &>/dev/null || true
            
    # Copiar y otorgar permisos de ejecución al ejecutable local sdd
    cp "$HARNESS_DIR/project-templates/sdd" "$TARGET_DIR/.openspec/sdd" &>/dev/null || true
    chmod +x "$TARGET_DIR/.openspec/sdd" 2>/dev/null || true
    rm -f "$TARGET_DIR/.sdd" &>/dev/null || true
fi
echo -e "        ${COLOR_SUCCESS}✓ Habilidades, esquemas, configuraciones MCP y ejecutable local '.openspec/sdd' instalados.${NC}"


# 6. Write harness version marker
echo -e "  ${COLOR_BORDER}[6/8]${NC} 🏷  Escribiendo marcador de versión..."
if [ "$DRY_RUN" = false ]; then
    echo "$HARNESS_VERSION" > "$TARGET_DIR/.agent/.sdd-harness-version"
fi
echo -e "        ${COLOR_SUCCESS}✓ Versión del arnés fijada en v${HARNESS_VERSION}.${NC}"

# 7. Git checkpoint: post-harness-install
echo -e "  ${COLOR_BORDER}[7/8]${NC} 📸 Creando checkpoint de instalación en Git..."
if [ "$DRY_RUN" = false ]; then
    git -C "$TARGET_DIR" add . &>/dev/null
    git -C "$TARGET_DIR" commit -m "chore(sdd): bootstrap harness installed" &>/dev/null || true
fi
echo -e "        ${COLOR_SUCCESS}✓ Punto de control guardado en el historial Git.${NC}"

# 8. Install AGENTS.md
echo -e "  ${COLOR_BORDER}[8/8]${NC} 📜 Sincronizando reglamento de conducta (AGENTS.md)..."
SKIP_AGENTS=false
if [ "$DRY_RUN" = true ]; then
    SKIP_AGENTS=true
elif [ -f "$TARGET_DIR/AGENTS.md" ]; then
    echo -e "        ${COLOR_WARNING}⚠  Ya existe AGENTS.md en el proyecto destino.${NC}"
    if [ "$AUTO_CONFIRM" = true ]; then
        confirm="s"
        echo -e "        ${COLOR_MUTED}▪ [Auto-confirm] Sobrescribiendo AGENTS.md...${NC}"
    else
        read -p "        ¿Sobrescribir con el reglamento de Zugzbot? (s/n): " confirm
    fi
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
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}1. Abre Cursor o corre:                                    ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}   OPENCODE_EXPERIMENTAL=true opencode                     ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}2. Llama a Zugzbot y pídele el cambio que necesitas.       ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_MUTED}3. Zugzbot orquestará el ciclo SDD de forma impecable.     ${NC}${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}\n"
