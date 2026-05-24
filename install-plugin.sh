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

echo ""
echo -e "  ${COLOR_HEADER}Zugzbot SDD Plugin Installer v2${NC}"
echo -e "  ${COLOR_BORDER}────────────────────────────────${NC}"

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
echo -e "  ${COLOR_MUTED}▪ Actualizando archivos de raíz del proyecto...${NC}"

copy_root_file() {
    local src="$1"
    local dst="$2"
    local label="$3"
    if [ "$src" = "$dst" ]; then
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label} (idéntico)"
        return 0
    fi
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label}"
    else
        echo -e "    ${COLOR_WARNING}⚠ No encontrado en origen: ${src}${NC}"
    fi
}

copy_root_file "${REPO_DIR}/AGENTS.md"         "${TARGET_DIR}/AGENTS.md"         "AGENTS.md"
copy_root_file "${REPO_DIR}/opencode.json"     "${TARGET_DIR}/opencode.json"     "opencode.json"

# zugz-models.json: si el destino ya tiene uno, lo preservamos; si no, copiamos el del repo
if [ -f "${TARGET_DIR}/zugz-models.json" ]; then
    echo -e "    ${COLOR_SUCCESS}✓${NC} zugz-models.json ${COLOR_MUTED}(preservado — ya existe en destino)${NC}"
else
    copy_root_file "${REPO_DIR}/zugz-models.json" "${TARGET_DIR}/zugz-models.json" "zugz-models.json (plantilla inicial)"
fi

# ── 6. Aplicar modelos de zugz-models.json a los agentes recién copiados ───────
DEST_AGENTS_DIR="${TARGET_DIR}/.opencode/agents"
MODELS_FILE="${TARGET_DIR}/zugz-models.json"

if [ -f "$MODELS_FILE" ] && [ -d "$DEST_AGENTS_DIR" ]; then
    echo -e "  ${COLOR_MUTED}▪ Aplicando modelos de zugz-models.json a los agentes...${NC}"
    local_changed=0
    # Extraer SOLO el bloque "agents" usando awk (portable macOS/Linux)
    agents_block=$(awk '
        /"agents"[[:space:]]*:/{in_agents=1; next}
        in_agents && /^[[:space:]]*\}/{exit}
        in_agents && /^[[:space:]]*"[a-zA-Z0-9][a-zA-Z0-9_-]+"[[:space:]]*:/{print}
    ' "$MODELS_FILE" | grep -v '"_')
    while IFS= read -r line; do
        agent_key=$(echo "$line" | sed 's/.*"\([a-zA-Z0-9_-]*\)"[[:space:]]*:[[:space:]]*".*/\1/')
        model_val=$(echo "$line"  | sed 's/.*"[a-zA-Z0-9_-]*"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
        if [ -z "$agent_key" ] || [ -z "$model_val" ] || [ "$agent_key" = "$model_val" ]; then
            continue
        fi
        agent_file="${DEST_AGENTS_DIR}/${agent_key}.md"
        if [ -f "$agent_file" ] && grep -q '^model:' "$agent_file"; then
            sed -i.bak "s|^model:.*|model: ${model_val}|" "$agent_file"
            rm -f "${agent_file}.bak"
            echo -e "    ${COLOR_SUCCESS}✓${NC} ${COLOR_MUTED}${agent_key}${NC} → ${COLOR_HEADER}${model_val}${NC}"
            local_changed=$((local_changed + 1))
        fi
    done <<< "$agents_block"
    echo -e "    ${COLOR_MUTED}Total:${NC} ${COLOR_SUCCESS}${local_changed} agente(s) con modelos actualizados${NC}"
fi

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
echo -e "  ${COLOR_BORDER}────────────────────────────────${NC}"
echo -e "  ${COLOR_SUCCESS}🎉 ¡INSTALACIÓN COMPLETADA CON ÉXITO!${NC}"
echo ""
echo -e "  ${COLOR_WARNING}Siguientes pasos:${NC}"
echo -e "    ${COLOR_MUTED}1.${NC} Edita ${COLOR_HEADER}zugz-models.json${NC} para configurar los modelos."
echo -e "    ${COLOR_MUTED}2.${NC} Aplica los modelos:  ${COLOR_HEADER}.opencode/tools/../sdd models apply${NC}"
echo -e "    ${COLOR_MUTED}3.${NC} Abre OpenCode:       ${COLOR_HEADER}opencode${NC}"
echo -e "    ${COLOR_MUTED}4.${NC} Habla con ${COLOR_HEADER}@zugzbot${NC} para iniciar un ciclo SDD."
