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
copy_root_file "${REPO_DIR}/ZUGZ.md"           "${TARGET_DIR}/ZUGZ.md"           "ZUGZ.md"

# opencode.json: si existe en origen se copia; si no, se genera de forma dinámica con permisos de los 5 agentes
if [ -f "${REPO_DIR}/opencode.json" ] && [ "${REPO_DIR}/opencode.json" != "${TARGET_DIR}/opencode.json" ]; then
    copy_root_file "${REPO_DIR}/opencode.json" "${TARGET_DIR}/opencode.json" "opencode.json"
elif [ ! -f "${TARGET_DIR}/opencode.json" ]; then
    cat > "${TARGET_DIR}/opencode.json" << 'OPCODEEOF'
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "allow",
    "bash": "allow",
    "lsp": "allow"
  },
  "agent": {
    "zugzbot": {
      "mode": "primary",
      "prompt": "{file:./.opencode/agents/zugzbot.md}",
      "permission": {
        "task": {
          "sdd-*": "allow",
          "aux-*": "allow"
        },
        "question": "allow",
        "lsp": "allow",
        "edit": {
          ".openspec/sdd-lock.json": "allow"
        }
      }
    },
    "sdd-explorer": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/sdd-explorer.md}",
      "permission": {
        "task": {
          "sdd-*": "allow"
        },
        "bash": {
          "ls": "allow",
          "ls *": "allow",
          "ls -la *": "allow",
          "find *": "allow",
          "cat *": "allow",
          "grep *": "allow",
          "wc *": "allow",
          "mkdir": "allow",
          "mkdir *": "allow",
          "mkdir -p *": "allow",
          "echo": "allow",
          "echo *": "allow",
          "cp *": "allow",
          "mv *": "allow",
          "node --version": "allow",
          "node -v": "allow",
          "npm --version": "allow",
          "npm -v": "allow",
          "python --version": "allow",
          "python3 --version": "allow",
          "go version": "allow",
          "cargo --version": "allow",
          "git log *": "allow",
          "git status": "allow",
          "git status *": "allow",
          "git branch": "allow",
          "git branch *": "allow",
          "npx autoskills *": "allow",
          "npx -y autoskills *": "allow"
        }
      }
    },
    "sdd-planner": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/sdd-planner.md}",
      "permission": {
        "edit": "allow",
        "bash": "ask",
        "lsp": "allow"
      }
    },
    "sdd-builder": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/sdd-builder.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "sdd-tester": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/sdd-tester.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "sdd-archiver": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/sdd-archiver.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "aux-handyman": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/aux-handyman.md}",
      "permission": {
        "edit": "allow",
        "bash": "allow",
        "lsp": "allow"
      }
    },
    "aux-oracle": {
      "mode": "subagent",
      "prompt": "{file:./.opencode/agents/aux-oracle.md}",
      "permission": {
        "edit": "deny",
        "bash": "deny",
        "lsp": "deny"
      }
    }
  }
}
OPCODEEOF
    echo -e "    ${COLOR_SUCCESS}✓${NC} opencode.json (generado automáticamente)"
else
    echo -e "    ${COLOR_SUCCESS}✓${NC} opencode.json (preservado/idéntico)"
fi

# ── 6. Asegurar reglas en .gitignore ──────────────────────────────────────────
ensure_gitignore() {
    local gitignore_file="${TARGET_DIR}/.gitignore"
    touch "$gitignore_file"
    
    local needs_update=false
    for pattern in ".opencode/" "tui.json" ".openspec/*-lock.json" "*-lock.json"; do
        if ! grep -Fq "$pattern" "$gitignore_file"; then
            needs_update=true
        fi
    done

    if [ "$needs_update" = true ]; then
        echo -e "  ${COLOR_MUTED}▪ Configurando reglas locales en .gitignore...${NC}"
        echo "" >> "$gitignore_file"
        echo "# --- Zugzbot SDD Harness (Locals) ---" >> "$gitignore_file"
        for pattern in ".opencode/" "tui.json" ".openspec/*-lock.json" "*-lock.json"; do
            if ! grep -Fq "$pattern" "$gitignore_file"; then
                echo "$pattern" >> "$gitignore_file"
                echo -e "    ${COLOR_SUCCESS}✓${NC} Agregado $pattern a .gitignore"
            fi
        done
    else
        echo -e "  ${COLOR_SUCCESS}✓${NC} .gitignore ya está configurado con las reglas del arnés"
    fi
}

ensure_gitignore

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

# ── 7. package.json en .opencode/ y dependencias ──────────────────────────────
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

# ── 8. package.json y tsconfig.json de raíz (SOLO EN MODO DESARROLLO) ─────────
if [ "$TARGET_DIR" = "$REPO_DIR" ]; then
    if [ ! -f "${TARGET_DIR}/package.json" ]; then
        echo -e "  ${COLOR_MUTED}▪ Generando package.json en la raíz (Modo Desarrollo)...${NC}"
        cat > "${TARGET_DIR}/package.json" << 'ROOTPKGEOF'
{
  "name": "project-sdd-workspace",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "devDependencies": {
    "typescript": "^5.4.5",
    "eslint": "^9.3.0",
    "@eslint/js": "^9.3.0",
    "eslint-plugin-html": "^8.1.1",
    "@opencode-ai/plugin": "1.15.4",
    "@types/node": "^20.12.12"
  }
}
ROOTPKGEOF
        echo -e "    ${COLOR_SUCCESS}✓${NC} package.json creado"
    else
        echo -e "  ${COLOR_MUTED}▪ Asegurando dependencias de TypeScript/ESLint en package.json de raíz...${NC}"
        node -e '
          const fs = require("fs");
          const path = require("path");
          const pkgPath = path.join("'"$TARGET_DIR"'", "package.json");
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            pkg.devDependencies = pkg.devDependencies || {};
            let changed = false;
            if (!pkg.type || pkg.type !== "module") { pkg.type = "module"; changed = true; }
            if (!pkg.devDependencies.typescript) { pkg.devDependencies.typescript = "^5.4.5"; changed = true; }
            if (!pkg.devDependencies.eslint) { pkg.devDependencies.eslint = "^9.3.0"; changed = true; }
            if (!pkg.devDependencies["@eslint/js"]) { pkg.devDependencies["@eslint/js"] = "^9.3.0"; changed = true; }
            if (!pkg.devDependencies["eslint-plugin-html"]) { pkg.devDependencies["eslint-plugin-html"] = "^8.1.1"; changed = true; }
            if (!pkg.devDependencies["@opencode-ai/plugin"]) { pkg.devDependencies["@opencode-ai/plugin"] = "1.15.4"; changed = true; }
            if (changed) {
              fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
              console.log("    \x1b[32m✓\x1b[0m package.json actualizado con dependencias LSP");
            } else {
              console.log("    \x1b[32m✓\x1b[0m package.json ya cuenta con dependencias LSP");
            }
          } catch (e) {
            console.log("    \x1b[31m⚠ Error actualizando package.json:\x1b[0m", e.message);
          }
        '
    fi

    if [ ! -f "${TARGET_DIR}/tsconfig.json" ]; then
        echo -e "  ${COLOR_MUTED}▪ Generando tsconfig.json en la raíz (Modo Desarrollo)...${NC}"
        cat > "${TARGET_DIR}/tsconfig.json" << 'ROOTTSCONFIGEOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowJs": true
  },
  "include": [
    "zugz-plugin/**/*"
  ],
  "exclude": [
    "node_modules",
    "zugz-plugin/plugins/plugin_tui.tsx"
  ]
}
ROOTTSCONFIGEOF
        echo -e "    ${COLOR_SUCCESS}✓${NC} tsconfig.json creado"
    fi

    echo -e "  ${COLOR_MUTED}▪ Instalando dependencias de raíz (Modo Desarrollo)...${NC}"
    cd "${TARGET_DIR}"
    if command -v bun &> /dev/null; then
        bun install --quiet
    else
        npm install --legacy-peer-deps --quiet
    fi
    cd "${REPO_DIR}"
fi

# ── 9. Inicializar .openspec/ si no existe ────────────────────────────────────
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
echo -e "    ${COLOR_MUTED}1.${NC} Abre OpenCode:       ${COLOR_HEADER}opencode${NC}"
echo -e "    ${COLOR_MUTED}2.${NC} Habla con ${COLOR_HEADER}@zugzbot${NC} para iniciar un ciclo SDD."
