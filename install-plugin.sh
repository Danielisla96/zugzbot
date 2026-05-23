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
PLUGIN_DIR="${REPO_DIR}/plugin"

if [ ! -d "$PLUGIN_DIR" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra la carpeta 'plugin/' en ${REPO_DIR}.${NC}"
    exit 1
fi

echo -e "  ${COLOR_MUTED}▪ Directorio detectado:${NC} ${COLOR_SUCCESS}${REPO_DIR}${NC}"

# 2. Paso 0: Limpiar instalaciones previas (globales y locales) y desvincular paquetes npm locales conflictivos
echo -e "  ${COLOR_MUTED}▪ Limpiando enlaces simbólicos globales previos...${NC}"
rm -f ~/.config/opencode/agents
rm -f ~/.config/opencode/commands
rm -f ~/.config/opencode/skills
rm -f ~/.config/opencode/tools
rm -f ~/.config/opencode/plugins/sdd-sidebar.tsx
rm -f ~/.config/opencode/plugins/sdd-sidebar.ts

echo -e "  ${COLOR_MUTED}▪ Limpiando enlaces simbólicos y configuraciones locales previas...${NC}"
rm -rf "${REPO_DIR}/.opencode/agents"
rm -rf "${REPO_DIR}/.opencode/commands"
rm -rf "${REPO_DIR}/.opencode/skills"
rm -rf "${REPO_DIR}/.opencode/tools"
rm -rf "${REPO_DIR}/.opencode/plugins/sdd-sidebar.tsx"
rm -rf "${REPO_DIR}/.opencode/plugins/sdd-sidebar.ts"
rm -rf "${REPO_DIR}/.opencode/package.json"
rm -rf "${REPO_DIR}/.opencode/package-lock.json"
rm -rf "${REPO_DIR}/.opencode/node_modules"

echo -e "  ${COLOR_MUTED}▪ Removiendo referencias globales y locales de configuración...${NC}"
node -e "
const fs = require('fs');
const path = require('path');

// 1. Limpiar opencode.jsonc / opencode.json global
const globalConfigPath = path.join(process.env.HOME, '.config', 'opencode', 'opencode.jsonc');
const cleanConfig = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    try {
      const clean = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
      const config = JSON.parse(clean);
      if (config.plugin) {
        config.plugin = config.plugin.filter(p => p !== 'zugzbot-sdd');
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
      }
    } catch (e) {
      if (content.includes('\"zugzbot-sdd\"')) {
        content = content.replace(/\"zugzbot-sdd\",?\\s*/g, '');
        fs.writeFileSync(filePath, content);
      }
    }
  }
};
cleanConfig(globalConfigPath);
cleanConfig(path.join(process.env.HOME, '.config', 'opencode', 'opencode.json'));

// 2. Limpiar package.json global
const globalPkgPath = path.join(process.env.HOME, '.config', 'opencode', 'package.json');
if (fs.existsSync(globalPkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(globalPkgPath, 'utf8'));
    if (pkg.dependencies && pkg.dependencies['zugzbot-sdd']) {
      delete pkg.dependencies['zugzbot-sdd'];
      fs.writeFileSync(globalPkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }
  } catch (e) {}
}

// 3. Limpiar opencode.json del proyecto local
const localConfigPath = path.join('${REPO_DIR}', 'opencode.json');
cleanConfig(localConfigPath);
"

# 3. Asegurar dependencias locales del plugin para el compilador de OpenCode
echo -e "  ${COLOR_MUTED}▪ Asegurando dependencias de compilación del plugin (npm install)...${NC}"
cd "${PLUGIN_DIR}"
npm install --legacy-peer-deps --quiet
cd "${REPO_DIR}"

# 4. Crear estructura del directorio local .opencode
echo -e "  ${COLOR_MUTED}▪ Creando directorio de configuración del proyecto .opencode...${NC}"
mkdir -p "${REPO_DIR}/.opencode/plugins"

# 5. Vincular Arnés SDD y Plugin TUI localmente
echo -e "  ${COLOR_MUTED}▪ Creando enlaces simbólicos locales de arnés...${NC}"
ln -s "${PLUGIN_DIR}/agents" "${REPO_DIR}/.opencode/agents"
ln -s "${PLUGIN_DIR}/commands" "${REPO_DIR}/.opencode/commands"
ln -s "${PLUGIN_DIR}/skills" "${REPO_DIR}/.opencode/skills"
ln -s "${PLUGIN_DIR}/tools" "${REPO_DIR}/.opencode/tools"
ln -s "${PLUGIN_DIR}/sdd-sidebar.ts" "${REPO_DIR}/.opencode/plugins/sdd-sidebar.ts"


echo -e "${COLOR_BORDER}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${COLOR_BORDER}│${NC}  ${COLOR_SUCCESS}🎉 ¡PLUGIN INSTALADO CON ÉXITO!${NC}                             ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}├──────────────────────────────────────────────────────────────┤${NC}"
echo -e "${COLOR_BORDER}│${NC}  Siguientes pasos recomendados:                              ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  1. Abre tu proyecto favorito en la terminal.                ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  2. Levanta tu entorno de OpenCode ejecutando:               ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}     ${COLOR_HEADER}OPENCODE_EXPERIMENTAL=true opencode${NC}                      ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}│${NC}  3. Presiona la tecla ${COLOR_WARNING}b${NC} para desplegar el monitor TUI lateral.  ${COLOR_BORDER}│${NC}"
echo -e "${COLOR_BORDER}└──────────────────────────────────────────────────────────────┘${NC}"
