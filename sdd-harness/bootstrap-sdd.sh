#!/bin/bash
# ==============================================================================
#  bootstrap-sdd.sh
#  Spec-Driven Development (SDD) Orchestration Environment Bootstrap Installer
# ==============================================================================
#
# Este script inicializa de forma automatizada la metodología de Spec-Driven Development (SDD)
# en cualquier nuevo repositorio/proyecto que utilice OpenCode.
#
# Uso:
#   1. Copia la carpeta 'sdd-harness' a tu máquina o impórtala como submódulo.
#   2. Navega a la raíz de tu nuevo proyecto.
#   3. Ejecuta: /ruta/a/sdd-harness/bootstrap-sdd.sh
#

set -e

# Colores estéticos para feedback en consola
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0;39m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${CYAN}🚀 Iniciando Instalación del Entorno SDD Orchestrated Harness...${NC}"
echo -e "${BLUE}======================================================================${NC}"

# 1. Obtener directorios locales
HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_AGENTS_DIR="$HOME/.config/opencode/agents"
TARGET_DIR=$(pwd)

# 2. Validación de seguridad
if [ ! -d "$HARNESS_DIR/agents" ] || [ ! -d "$HARNESS_DIR/project-templates" ]; then
    echo -e "${RED}❌ Error: No se pudo localizar la carpeta 'sdd-harness/agents' o 'sdd-harness/project-templates'.${NC}"
    echo -e "${RED}Asegúrate de ejecutar este script desde la carpeta de distribución.${NC}"
    exit 1
fi

echo -e "\n${CYAN}📍 Directorio Origen (Harness):${NC} $HARNESS_DIR"
echo -e "${CYAN}📍 Proyecto de Destino:${NC} $TARGET_DIR"

# 3. Copiar prompts globales de agentes
echo -e "\n${BLUE}[1/4] 📦 Instalando agentes globales de OpenCode...${NC}"
mkdir -p "$GLOBAL_AGENTS_DIR"
cp -v "$HARNESS_DIR"/agents/*.md "$GLOBAL_AGENTS_DIR/"
echo -e "${GREEN}✓ Prompts de agentes instalados correctamente en $GLOBAL_AGENTS_DIR${NC}"

# 4. Crear estructura de carpetas en el proyecto de destino
echo -e "\n${BLUE}[2/4] 📂 Creando estructura de directorios en el proyecto...${NC}"
mkdir -p "$TARGET_DIR/.agent/workflows"
mkdir -p "$TARGET_DIR/.agent/skills"
mkdir -p "$TARGET_DIR/.opencode/commands"
mkdir -p "$TARGET_DIR/.opencode/skills"
mkdir -p "$TARGET_DIR/openspec/schemas/ssd-orchestrated"
echo -e "${GREEN}✓ Directorios de proyecto creados con éxito${NC}"

# 5. Inyectar skills, workflows, comandos y esquemas
echo -e "\n${BLUE}[3/4] 🧩 Copiando skills, workflows, comandos y esquemas de OpenSpec...${NC}"
cp -rv "$HARNESS_DIR"/project-templates/dot-agent/workflows/* "$TARGET_DIR/.agent/workflows/"
cp -rv "$HARNESS_DIR"/project-templates/dot-agent/skills/* "$TARGET_DIR/.agent/skills/"
cp -rv "$HARNESS_DIR"/project-templates/dot-opencode/commands/* "$TARGET_DIR/.opencode/commands/"
cp -rv "$HARNESS_DIR"/project-templates/dot-opencode/skills/* "$TARGET_DIR/.opencode/skills/"
cp -rv "$HARNESS_DIR"/project-templates/openspec-schema/ssd-orchestrated/* "$TARGET_DIR/openspec/schemas/ssd-orchestrated/"
echo -e "${GREEN}✓ Workflows, comandos, skills y esquemas del ciclo de vida SDD inyectados${NC}"

# 6. Copiar archivo AGENTS.md
echo -e "\n${BLUE}[4/4] 📜 Instalando archivo de reglas maestras AGENTS.md...${NC}"
if [ -f "$TARGET_DIR/AGENTS.md" ]; then
    echo -e "${CYAN}⚠ Advertencia: Ya existe un archivo AGENTS.md en el destino.${NC}"
    read -p "¿Deseas sobreescribirlo con las reglas maestras de DaniBot? (s/n): " confirm
    if [[ "$confirm" =~ ^[sS]$ ]]; then
        cp -v "$HARNESS_DIR/project-templates/AGENTS.md" "$TARGET_DIR/AGENTS.md"
        echo -e "${GREEN}✓ AGENTS.md sobreescrito exitosamente${NC}"
    else
        echo -e "${CYAN}✓ Conservado el AGENTS.md existente en el proyecto${NC}"
    fi
else
    cp -v "$HARNESS_DIR/project-templates/AGENTS.md" "$TARGET_DIR/AGENTS.md"
    echo -e "${GREEN}✓ AGENTS.md creado de forma impecable en la raíz del proyecto${NC}"
fi

# 7. Finalización
echo -e "\n${BLUE}======================================================================${NC}"
echo -e "${GREEN}🎉 ¡INSTALACIÓN COMPLETADA DE FORMA IMPECABLE!${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo -e "${CYAN}💡 Próximos Pasos:${NC}"
echo -e "  1. Ejecuta 'opencode' en la raíz de tu nuevo proyecto."
echo -e "  2. Dile a DaniBot el cambio que quieres realizar y él disparará el ciclo."
echo -e "  3. ¡Disfruta del ciclo de desarrollo de software más seguro y premium de la galaxia! 🚀\n"
