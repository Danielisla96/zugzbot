#!/usr/bin/env bash

set -euo pipefail

# Colores premium
COLOR_HEADER="\033[1;36m"
COLOR_SUCCESS="\033[1;32m"
COLOR_WARNING="\033[1;33m"
COLOR_ERROR="\033[1;31m"
COLOR_MUTED="\033[0;90m"
COLOR_BORDER="\033[0;34m"
NC="\033[0m"

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Zugzbot SDD Plugin Installer${NC}                            ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"

# 1. Obtener la ruta absoluta del repositorio
REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_DIR="${REPO_DIR}/plugin"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra la carpeta 'plugin/' en ${REPO_DIR}.${NC}"
    exit 1
fi

echo -e "  ${COLOR_MUTED}▪ Directorio detectado:${NC} ${COLOR_SUCCESS}${REPO_DIR}${NC}"

# 2. Paso 0: Limpiar instalaciones previas
echo -e "  ${COLOR_MUTED}▪ Limpiando enlaces simbólicos previos...${NC}"
rm -f ~/.config/opencode/agents
rm -f ~/.config/opencode/commands
rm -f ~/.config/opencode/skills
rm -f ~/.config/opencode/tools
rm -f ~/.config/opencode/plugins/sdd-sidebar.tsx

# 3. Asegurar dependencias locales del plugin para el compilador de OpenCode
echo -e "  ${COLOR_MUTED}▪ Asegurando dependencias de compilación del plugin (npm install)...${NC}"
cd "${PLUGIN_DIR}"
npm install --legacy-peer-deps --quiet
cd "${REPO_DIR}"

# 4. Crear directorios de configuración de OpenCode si no existen
mkdir -p ~/.config/opencode/plugins

# 4. Vincular Arnés SDD
echo -e "  ${COLOR_MUTED}▪ Creando enlaces simbólicos del arnés...${NC}"
ln -s "${PLUGIN_DIR}/agents" ~/.config/opencode/agents
ln -s "${PLUGIN_DIR}/commands" ~/.config/opencode/commands
ln -s "${PLUGIN_DIR}/skills" ~/.config/opencode/skills
ln -s "${PLUGIN_DIR}/tools" ~/.config/opencode/tools

# 5. Vincular Monitor TUI
echo -e "  ${COLOR_MUTED}▪ Vinculando Monitor TUI reactivo en tiempo real...${NC}"
ln -s "${PLUGIN_DIR}/sdd-sidebar.tsx" ~/.config/opencode/plugins/sdd-sidebar.tsx

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡PLUGIN INSTALADO CON ÉXITO!${NC}                             ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  Siguientes pasos recomendados:                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  1. Abre tu proyecto favorito en la terminal.                ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  2. Levanta tu entorno de OpenCode ejecutando:               ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}     ${COLOR_HEADER}OPENCODE_EXPERIMENTAL=true opencode${NC}                      ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  3. Presiona la tecla ${COLOR_WARNING}b${NC} para desplegar el monitor TUI lateral.  ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"
