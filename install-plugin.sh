#!/usr/bin/env bash

set -euo pipefail

# Colores premium
COLOR_HEADER="\033[1;36m"
COLOR_SUCCESS="\033[1;32m"
COLOR_WARNING="\033[1;33m"
COLOR_ERROR="\033[1;31m"
COLOR_MUTED="\033[0;90m"
COLOR_BORDER="\033[0;34m"
COLOR_ORANGE="\033[38;5;166m"
NC="\033[0m"

echo -e "${COLOR_ORANGE}"
cat << "EOF"
███████╗██╗   ██╗ ██████╗ ███████╗
╚══███╔╝██║   ██║██╔════╝ ╚══███╔╝
  ███╔╝ ██║   ██║██║  ███╗  ███╔╝ 
 ███╔╝  ██║   ██║██║   ██║ ███╔╝  
███████╗╚██████╔╝╚██████╔╝███████╗
╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝
EOF
echo -e "${NC}"

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Zugzbot SDD Plugin Installer v2${NC}                         ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"

# ── 1. Paths ──────────────────────────────────────────────────────────────────
REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_DIR="${REPO_DIR}/zugz-plugin"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra 'zugz-plugin/' en ${REPO_DIR}.${NC}"
    exit 1
fi

TARGET_DIR="${1:-$REPO_DIR}"
mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo -e "  ${COLOR_MUTED}▪ Origen:${NC}  ${COLOR_SUCCESS}${REPO_DIR}${NC}"
echo -e "  ${COLOR_MUTED}▪ Destino:${NC} ${COLOR_SUCCESS}${TARGET_DIR}${NC}"
echo ""

# ── 2. Limpiar plugin TUI global previo ───────────────────────────────────────
echo -e "  ${COLOR_MUTED}▪ Limpiando plugin TUI global previo...${NC}"
rm -f ~/.config/opencode/plugins/plugin_tui.js
rm -f ~/.config/opencode/plugins/plugin_tui.tsx

# ── 3. Limpiar directorios locales del arnés previos ──────────────────────────
echo -e "  ${COLOR_MUTED}▪ Limpiando arnés anterior en .opencode/...${NC}"
rm -rf "${TARGET_DIR}/.opencode/agents"
rm -rf "${TARGET_DIR}/.opencode/commands"
rm -rf "${TARGET_DIR}/.opencode/skills"
rm -rf "${TARGET_DIR}/.opencode/tools"
rm -rf "${TARGET_DIR}/.opencode/plugins"

# ── 4. Copiar o Vincular arnés SDD ────────────────────────────────────────────
if [ "$TARGET_DIR" = "$REPO_DIR" ]; then
    # ── MODO DESARROLLO: symlinks ──
    echo -e "  ${COLOR_MUTED}▪ Vinculando arnés (Modo Desarrollo)...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    ln -sf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    ln -sf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    ln -sf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    ln -sf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    ln -sf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"

    rm -rf "${PLUGIN_DIR}/node_modules"
    ln -sf "${TARGET_DIR}/.opencode/node_modules" "${PLUGIN_DIR}/node_modules"
else
    # ── MODO INSTALACIÓN: copia completa ──
    echo -e "  ${COLOR_MUTED}▪ Instalando arnés SDD en .opencode/...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    cp -rf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    cp -rf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    cp -rf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    cp -rf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    cp -rf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"
fi

# ── 5. Archivos raíz — SIEMPRE se reemplazan ──────────────────────────────────
# Estos archivos son parte del arnés y deben estar siempre actualizados.
echo -e "  ${COLOR_MUTED}▪ Actualizando archivos de raíz del proyecto...${NC}"

copy_root_file() {
    local src="$1"
    local dst="$2"
    local label="$3"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label}"
    else
        echo -e "    ${COLOR_WARNING}⚠ No encontrado en origen: ${src}${NC}"
    fi
}

copy_root_file "${REPO_DIR}/AGENTS.md"         "${TARGET_DIR}/AGENTS.md"         "AGENTS.md"
copy_root_file "${REPO_DIR}/opencode.json"     "${TARGET_DIR}/opencode.json"     "opencode.json"
copy_root_file "${REPO_DIR}/zugz-models.json"  "${TARGET_DIR}/zugz-models.json"  "zugz-models.json"

# tui.json — inline (sin depender de un archivo fuente)
cat > "${TARGET_DIR}/tui.json" << 'TUIEOF'
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    "./.opencode/plugins/plugin_tui.tsx"
  ]
}
TUIEOF
echo -e "    ${COLOR_SUCCESS}✓${NC} tui.json"

# ── 6. package.json en .opencode/ y dependencias ──────────────────────────────
echo -e "  ${COLOR_MUTED}▪ Generando .opencode/package.json...${NC}"
cat > "${TARGET_DIR}/.opencode/package.json" << 'PKGEOF'
{
  "name": "zugzbot-sdd-local",
  "dependencies": {
    "@opencode-ai/plugin": "1.15.4"
  }
}
PKGEOF

echo -e "  ${COLOR_MUTED}▪ Instalando dependencias en .opencode/...${NC}"
cd "${TARGET_DIR}/.opencode"
if command -v bun &> /dev/null; then
    bun install --quiet
else
    npm install --legacy-peer-deps --quiet
fi
cd "${REPO_DIR}"

# ── 7. Inicializar .openspec/ si no existe ────────────────────────────────────
if [ ! -d "${TARGET_DIR}/.openspec" ]; then
    echo -e "  ${COLOR_MUTED}▪ Inicializando .openspec/...${NC}"
    mkdir -p "${TARGET_DIR}/.openspec/changes"
    cat > "${TARGET_DIR}/.openspec/sdd-lock.json" << 'LOCKEOF'
{
  "change_name": "nuevo-cambio",
  "active_phase": 0,
  "active_subagent": "sdd-explorer",
  "status": "idle",
  "auto_pilot": false,
  "last_updated": ""
}
LOCKEOF
    cat > "${TARGET_DIR}/.openspec/brain.md" << 'BRAINEOF'
# 🧠 Cerebro del Proyecto

> Base de conocimiento técnico a largo plazo. Solo registra aprendizajes de alto valor y no triviales.

## Lecciones Aprendidas

_Vacío — el swarm registrará aquí los aprendizajes técnicos del proyecto._
BRAINEOF
    cat > "${TARGET_DIR}/.openspec/prompt_base.md" << 'PROMPTEOF'
# Directrices Globales del Swarm

Eres parte del equipo de desarrollo de este proyecto. Operas bajo las reglas de `AGENTS.md` en la raíz.

- Responde siempre en español con tono técnico directo.
- Aplica la metodología SDD Simplificada de 4 fases.
- Usa Lazy Loading: carga archivos solo bajo demanda.
PROMPTEOF
    echo -e "    ${COLOR_SUCCESS}✓${NC} .openspec/ inicializado"
fi

# ── Resultado final ────────────────────────────────────────────────────────────
echo ""
echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡INSTALACIÓN COMPLETADA CON ÉXITO!${NC}                      ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  Siguientes pasos:                                           ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  1. Edita ${COLOR_HEADER}zugz-models.json${NC} para configurar los modelos.   ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  2. Aplica los modelos:  ${COLOR_HEADER}.opencode/tools/../sdd models apply${NC} ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  3. Abre OpenCode:       ${COLOR_HEADER}opencode${NC}                            ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  4. Habla con ${COLOR_HEADER}@zugzbot${NC} para iniciar un ciclo SDD.          ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"
