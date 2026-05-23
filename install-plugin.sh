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
   ███████╗██╗   ██╗ ██████╗ ███████╗
   ╚══███╔╝██║   ██║██╔════╝ ╚══███╔╝
     ███╔╝ ██║   ██║██║  ███╗  ███╔╝ 
    ███╔╝  ██║   ██║██║   ██║ ███╔╝  
   ███████╗╚██████╔╝╚██████╔╝███████╗
   ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝
EOF
echo -e "${NC}"

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_HEADER}Zugzbot SDD Local Installer & Global Reset${NC}                 ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"

# 1. Obtener la ruta absoluta del repositorio
REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLUGIN_DIR="${REPO_DIR}/plugin/zugzbot-sdd"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra la carpeta 'plugin/zugzbot-sdd' en ${REPO_DIR}.${NC}"
    exit 1
fi

echo -e "  ${COLOR_MUTED}▪ Directorio detectado:${NC} ${COLOR_SUCCESS}${REPO_DIR}${NC}"

# 2. Paso 1: Resetear Configuración Global (De Fábrica)
echo -e "  ${COLOR_WARNING}▪ Reseteando configuración global a valores de fábrica...${NC}"
rm -rf ~/.config/opencode
rm -rf ~/.cache/opencode/packages

# 3. Paso 2: Limpiar directorios locales del arnés previos
echo -e "  ${COLOR_MUTED}▪ Limpiando directorios locales del arnés...${NC}"
rm -rf "${REPO_DIR}/.opencode/agents"
rm -rf "${REPO_DIR}/.opencode/commands"
rm -rf "${REPO_DIR}/.opencode/skills"
rm -rf "${REPO_DIR}/.opencode/tools"
rm -rf "${REPO_DIR}/.opencode/plugins"

# Asegurar directorios base
mkdir -p "${REPO_DIR}/.opencode/plugins"

# 4. Paso 3: Copiar Arnés SDD "En Duro" Localmente
echo -e "  ${COLOR_MUTED}▪ Copiando componentes del arnés y plugins TUI físicamente a .opencode/...${NC}"
cp -r "${PLUGIN_DIR}/agents" "${REPO_DIR}/.opencode/agents"
cp -r "${PLUGIN_DIR}/commands" "${REPO_DIR}/.opencode/commands"
cp -r "${PLUGIN_DIR}/skills" "${REPO_DIR}/.opencode/skills"
cp -r "${PLUGIN_DIR}/tools" "${REPO_DIR}/.opencode/tools"
cp -r "${PLUGIN_DIR}/plugins/." "${REPO_DIR}/.opencode/plugins/"

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

# Asegurar archivo opencode.json local si no existe
if [ ! -f "${REPO_DIR}/opencode.json" ]; then
    echo -e "  ${COLOR_MUTED}▪ Creando archivo opencode.json local con modelo por defecto...${NC}"
    cat << 'EOF' > "${REPO_DIR}/opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/deepseek-v4-flash-free",
  "permission": {
    "question": "allow",
    "lsp": "allow"
  },
  "agent": {
    "zugzbot": {
      "mode": "primary",
      "model": "opencode/deepseek-v4-flash-free",
      "permission": {
        "task": {
          "sdd-*": "allow",
          "aux-*": "allow"
        },
        "question": "allow",
        "lsp": "allow"
      }
    }
  }
}
EOF
fi

# Asegurar archivo .gitignore local y agregar exclusiones si no existen
GITIGNORE_FILE="${REPO_DIR}/.gitignore"
if [ ! -f "$GITIGNORE_FILE" ]; then
    echo -e "  ${COLOR_MUTED}▪ Creando archivo .gitignore local...${NC}"
    touch "$GITIGNORE_FILE"
fi

if ! grep -q "\.opencode/" "$GITIGNORE_FILE"; then
    echo -e "  ${COLOR_MUTED}▪ Agregando exclusiones de OpenCode local a .gitignore...${NC}"
    cat << 'EOF' >> "$GITIGNORE_FILE"

# --- .opencode Local Installation ---
.opencode/
tui.json
opencode.json
EOF
fi

# 5. Paso 4: Crear y Sincronizar package.json en .opencode/
echo -e "  ${COLOR_MUTED}▪ Generando dependencias locales en .opencode/package.json...${NC}"
cat << 'EOF' > "${REPO_DIR}/.opencode/package.json"
{
  "name": "zugzbot-sdd-local",
  "dependencies": {
    "@opencode-ai/plugin": "1.15.4"
  }
}
EOF

echo -e "  ${COLOR_MUTED}▪ Instalando dependencias de compilación local en .opencode/...${NC}"
cd "${REPO_DIR}/.opencode"
npm install --legacy-peer-deps --quiet
cd "${REPO_DIR}"

echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡INSTALACIÓN LOCAL COMPLETADA CON ÉXITO!${NC}                 ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  1. Configuración global reseteada completamente.            ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  2. Arnés SDD copiado en duro localmente.                     ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  3. Dependencias de compilación instaladas localmente.        ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}                                                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  Siguientes pasos recomendados:                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  - Inicia tu entorno local de OpenCode:                      ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}    ${COLOR_HEADER}OPENCODE_EXPERIMENTAL=true opencode${NC}                       ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"
