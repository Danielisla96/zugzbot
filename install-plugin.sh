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
NC="\033[0m"

echo -e "${COLOR_ERROR}"
cat << "EOF"
  ______  _    _  _____  ______ 
 |___  / | |  | |/ ____||___  / 
    / /  | |  | | |  __    / /  
EOF
echo -e "${COLOR_WARNING}"
cat << "EOF"
   / /   | |  | | | |_ |  / /   
  / /__  | |__| | |__| | / /__  
 /_____|  \____/ \_____|/_____| 
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

echo -e "  ${COLOR_MUTED}▪ Directorio detectado:${NC} ${COLOR_SUCCESS}${REPO_DIR}${NC}"

# 2. Limpiar instalación global previa del plugin TUI
echo -e "  ${COLOR_MUTED}▪ Limpiando plugin TUI global previo...${NC}"
rm -f ~/.config/opencode/plugins/plugin_tui.js
rm -f ~/.config/opencode/plugins/plugin_tui.tsx

# 3. Limpiar directorios locales del arnés previos
echo -e "  ${COLOR_MUTED}▪ Limpiando directorios locales del arnés...${NC}"
rm -rf "${REPO_DIR}/.opencode/agents"
rm -rf "${REPO_DIR}/.opencode/commands"
rm -rf "${REPO_DIR}/.opencode/skills"
rm -rf "${REPO_DIR}/.opencode/tools"
rm -rf "${REPO_DIR}/.opencode/plugins"

# 4. Vincular arnés SDD localmente
echo -e "  ${COLOR_MUTED}▪ Vinculando arnés SDD...${NC}"
mkdir -p "${REPO_DIR}/.opencode"
ln -sf "${PLUGIN_DIR}/agents"   "${REPO_DIR}/.opencode/agents"
ln -sf "${PLUGIN_DIR}/commands" "${REPO_DIR}/.opencode/commands"
ln -sf "${PLUGIN_DIR}/skills"   "${REPO_DIR}/.opencode/skills"
ln -sf "${PLUGIN_DIR}/tools"    "${REPO_DIR}/.opencode/tools"
ln -sf "${PLUGIN_DIR}/plugins"  "${REPO_DIR}/.opencode/plugins"

# Vincular node_modules de zugz-plugin a .opencode/node_modules para resolución de dependencias
rm -rf "${PLUGIN_DIR}/node_modules"
ln -sf "${REPO_DIR}/.opencode/node_modules" "${PLUGIN_DIR}/node_modules"

# Asegurar registro de plugin TUI local en tui.json si no existe
if [ ! -f "${REPO_DIR}/tui.json" ]; then
    echo -e "  ${COLOR_MUTED}▪ Creando archivo tui.json local para registrar el plugin TUI...${NC}"
    cat << 'EOF' > "${REPO_DIR}/tui.json"
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
cat << 'EOF' > "${REPO_DIR}/.opencode/package.json"
{
  "name": "zugzbot-sdd-local",
  "dependencies": {
    "@opencode-ai/plugin": "1.15.4"
  }
}
EOF

echo -e "  ${COLOR_MUTED}▪ Instalando dependencias en .opencode/...${NC}"
cd "${REPO_DIR}/.opencode"
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
