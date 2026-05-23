#!/usr/bin/env bash

set -euo pipefail

# Colores premium
COLOR_HEADER="\033[1;36m"
COLOR_MAGENTA="\033[1;35m"
COLOR_SUCCESS="\033[1;32m"
COLOR_WARNING="\033[1;33m"
COLOR_ERROR="\033[1;31m"
COLOR_MUTED="\033[0;90m"
COLOR_BORDER="\033[0;34m"
COLOR_ORANGE="\033[38;5;166m" # Naranjo oscuro premium
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
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Zugzbot SDD Plugin Installer${NC}                            ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"

# 1. Obtener la ruta absoluta del repositorio
REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_DIR="${REPO_DIR}/zugz-plugin"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra la carpeta 'zugz-plugin/' en ${REPO_DIR}.${NC}"
    exit 1
fi

# Directorio de destino (por defecto la raíz del repositorio)
TARGET_DIR="${1:-$REPO_DIR}"
mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo -e "  ${COLOR_MUTED}▪ Repositorio origen:${NC} ${COLOR_SUCCESS}${REPO_DIR}${NC}"
echo -e "  ${COLOR_MUTED}▪ Proyecto destino:${NC}   ${COLOR_SUCCESS}${TARGET_DIR}${NC}"

# 2. Limpiar instalación global previa del plugin TUI
echo -e "  ${COLOR_MUTED}▪ Limpiando plugin TUI global previo...${NC}"
rm -f ~/.config/opencode/plugins/plugin_tui.js
rm -f ~/.config/opencode/plugins/plugin_tui.tsx

# 3. Limpiar directorios locales del arnés previos
echo -e "  ${COLOR_MUTED}▪ Limpiando directorios locales del arnés...${NC}"
rm -rf "${TARGET_DIR}/.opencode/agents"
rm -rf "${TARGET_DIR}/.opencode/commands"
rm -rf "${TARGET_DIR}/.opencode/skills"
rm -rf "${TARGET_DIR}/.opencode/tools"
rm -rf "${TARGET_DIR}/.opencode/plugins"

# 4. Copiar o Vincular arnés SDD según el destino
if [ "$TARGET_DIR" = "$REPO_DIR" ]; then
    echo -e "  ${COLOR_MUTED}▪ Vinculando arnés SDD localmente (Modo Desarrollo)...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    ln -sf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    ln -sf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    ln -sf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    ln -sf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    ln -sf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"
    
    # Vincular node_modules de zugz-plugin a .opencode/node_modules para resolución de dependencias
    rm -rf "${PLUGIN_DIR}/node_modules"
    ln -sf "${TARGET_DIR}/.opencode/node_modules" "${PLUGIN_DIR}/node_modules"
else
    echo -e "  ${COLOR_MUTED}▪ Instalando arnés SDD de forma permanente...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    cp -rf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    cp -rf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    cp -rf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    cp -rf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    cp -rf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"
    
    # Copiar opencode.json y AGENTS.md si no existen en el destino
    if [ ! -f "${TARGET_DIR}/opencode.json" ]; then
        echo -e "  ${COLOR_MUTED}▪ Copiando opencode.json al destino...${NC}"
        cp "${REPO_DIR}/opencode.json" "${TARGET_DIR}/opencode.json"
    fi
    if [ ! -f "${TARGET_DIR}/AGENTS.md" ]; then
        echo -e "  ${COLOR_MUTED}▪ Copiando AGENTS.md al destino...${NC}"
        cp "${REPO_DIR}/AGENTS.md" "${TARGET_DIR}/AGENTS.md"
    fi
fi

# Asegurar registro de plugin TUI local en tui.json si no existe
if [ ! -f "${TARGET_DIR}/tui.json" ]; then
    echo -e "  ${COLOR_MUTED}▪ Creando archivo tui.json local para registrar el plugin TUI...${NC}"
    cat << 'EOF' > "${TARGET_DIR}/tui.json"
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": [
    "./.opencode/plugins/plugin_tui.tsx"
  ]
}
EOF
fi

# 5. Asegurar package.json en .opencode/ para dependencias
echo -e "  ${COLOR_MUTED}▪ Generando .opencode/package.json con dependencias...${NC}"
cat << 'EOF' > "${TARGET_DIR}/.opencode/package.json"
{
  "name": "zugzbot-sdd-local",
  "dependencies": {
    "@opencode-ai/plugin": "1.15.4"
  }
}
EOF

echo -e "  ${COLOR_MUTED}▪ Instalando dependencias en .opencode/...${NC}"
cd "${TARGET_DIR}/.opencode"
if command -v bun &> /dev/null; then
    bun install --quiet
else
    npm install --legacy-peer-deps --quiet
fi
cd "${REPO_DIR}"

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡PLUGIN INSTALADO CON ÉXITO!${NC}                             ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  Siguientes pasos recomendados:                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  1. Abre tu proyecto favorito en la terminal.                ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  2. Levanta tu entorno de OpenCode ejecutando:               ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}     ${COLOR_HEADER}OPENCODE_EXPERIMENTAL=true opencode${NC}                      ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"
