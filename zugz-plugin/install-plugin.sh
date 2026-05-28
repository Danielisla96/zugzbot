#!/usr/bin/env bash

set -euo pipefail

# ── Paleta de Colores Premium & Minimalista ──────────────────────────────────
COLOR_HEADER="\033[1;36m"     # Cyan brillante para títulos principales
COLOR_SUCCESS="\033[1;32m"    # Verde brillante para checkmarks exitosos
COLOR_WARNING="\033[1;33m"    # Amarillo para advertencias/tips
COLOR_ERROR="\033[1;31m"      # Rojo para errores fatales
COLOR_MUTED="\033[0;90m"      # Gris oscuro para detalles y versiones
COLOR_ORANGE="\033[38;5;208m" # Naranja para logos e hitos clave
NC="\033[0m"                  # Reset de color

# ── Banner de Presentación Premium ──────────────────────────────────────────
echo ""
echo -e "  ${COLOR_ORANGE}⚡ ZUGZBOT${NC}  ${COLOR_MUTED}•${NC}  ${COLOR_HEADER}Spec-Driven Development (SDD) Swarm Harness v2.0${NC}"
echo -e "  ${COLOR_MUTED}─────────────────────────────────────────────────────────────────${NC}"

# ── 1. Validación de Entorno (Dependency Checks) ─────────────────────────────
echo -e "  ${COLOR_HEADER}🔍 Validando requisitos del sistema...${NC}"

HAS_ERRORS=0

check_dependency() {
    local cmd="$1"
    local label="$2"
    local required="$3"

    if command -v "$cmd" &>/dev/null; then
        local version=""
        if [ "$cmd" = "node" ]; then
            version="($(node -v))"
        elif [ "$cmd" = "git" ]; then
            version="($(git --version | awk '{print $3}'))"
        elif [ "$cmd" = "bun" ]; then
            version="($(bun -v))"
        elif [ "$cmd" = "npm" ]; then
            version="(v$(npm -v))"
        elif [ "$cmd" = "opencode" ]; then
            version="(Detectado)"
        fi
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label} ${COLOR_MUTED}${version}${NC}"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "    ${COLOR_ERROR}✗${NC} ${label} ${COLOR_ERROR}(No encontrado — REQUERIDO)${NC}"
            return 1
        else
            echo -e "    ${COLOR_MUTED}○${NC} ${label} ${COLOR_MUTED}(No instalado — Opcional)${NC}"
            return 0
        fi
    fi
}

check_dependency "git" "Git" "true" || HAS_ERRORS=1
check_dependency "node" "Node.js" "true" || HAS_ERRORS=1

# Validación de manejador de paquetes (Bun o NPM)
if command -v bun &>/dev/null; then
    check_dependency "bun" "Bun" "false"
elif command -v npm &>/dev/null; then
    check_dependency "npm" "NPM" "false"
else
    echo -e "    ${COLOR_ERROR}✗ Package Manager (Instale Bun o NPM para continuar)${NC}"
    HAS_ERRORS=1
fi

check_dependency "opencode" "OpenCode CLI" "false"

if [ "$HAS_ERRORS" -eq 1 ]; then
    echo -e "\n  ${COLOR_ERROR}❌ Error: No se cumplen los requisitos mínimos de instalación.${NC}"
    echo -e "  Por favor, instala los componentes requeridos señalados arriba e intenta de nuevo.\n"
    exit 1
fi

echo -e "  ${COLOR_SUCCESS}✓ Entorno compatible y listo para instalar.${NC}"

# ── 2. Resolución de Directorios ─────────────────────────────────────────────
PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$PLUGIN_DIR")"

if [ ! -d "${PLUGIN_DIR}/agents" ]; then
    echo -e "  ${COLOR_ERROR}❌ Error: No se encuentra 'agents/' en ${PLUGIN_DIR}.${NC}"
    exit 1
fi

TARGET_DIR="${1:-$REPO_DIR}"
mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo -e "\n  ${COLOR_HEADER}📂 Configuración de Directorios:${NC}"
echo -e "    ${COLOR_MUTED}▪ Origen (Arnés):${NC}  ${REPO_DIR}"
echo -e "    ${COLOR_MUTED}▪ Destino (Proyecto):${NC} ${TARGET_DIR}"

# ── 3. Limpieza de Instalaciones Previas ──────────────────────────────────────
# Limpiar plugin TUI global silenciosamente si existía
rm -f ~/.config/opencode/plugins/plugin_tui.js &>/dev/null
rm -f ~/.config/opencode/plugins/plugin_tui.tsx &>/dev/null

# Limpiar directorios previos locales de agentes del arnés
rm -rf "${TARGET_DIR}/.opencode/agents"
rm -rf "${TARGET_DIR}/.opencode/commands"
rm -rf "${TARGET_DIR}/.opencode/skills"
rm -rf "${TARGET_DIR}/.opencode/tools"
rm -rf "${TARGET_DIR}/.opencode/plugins"

# ── 4. Copiar o Vincular Arnés SDD ───────────────────────────────────────────
echo -e "\n  ${COLOR_HEADER}⚙️  Instalando Motor de Agentes...${NC}"

if [ "$TARGET_DIR" = "$REPO_DIR" ]; then
    echo -e "    ${COLOR_MUTED}▪ Vinculando arnés local (Modo Desarrollo)...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    ln -sf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    ln -sf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    ln -sf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    ln -sf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    ln -sf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"

    rm -rf "${PLUGIN_DIR}/node_modules"
    ln -sf "${TARGET_DIR}/.opencode/node_modules" "${PLUGIN_DIR}/node_modules"
else
    echo -e "    ${COLOR_MUTED}▪ Copiando agentes y herramientas a .opencode/...${NC}"
    mkdir -p "${TARGET_DIR}/.opencode"
    cp -rf "${PLUGIN_DIR}/agents"   "${TARGET_DIR}/.opencode/agents"
    cp -rf "${PLUGIN_DIR}/commands" "${TARGET_DIR}/.opencode/commands"
    cp -rf "${PLUGIN_DIR}/skills"   "${TARGET_DIR}/.opencode/skills"
    cp -rf "${PLUGIN_DIR}/tools"    "${TARGET_DIR}/.opencode/tools"
    cp -rf "${PLUGIN_DIR}/plugins"  "${TARGET_DIR}/.opencode/plugins"
fi
echo -e "    ${COLOR_SUCCESS}✓${NC} Motor de agentes configurado correctamente"

# ── 5. Actualización de Archivos Raíz ─────────────────────────────────────────
echo -e "\n  ${COLOR_HEADER}📄 Actualizando archivos en la raíz del proyecto...${NC}"

copy_root_file() {
    local src="$1"
    local dst="$2"
    local label="$3"
    if [ "$src" = "$dst" ]; then
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label} ${COLOR_MUTED}(preservado)${NC}"
        return 0
    fi
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo -e "    ${COLOR_SUCCESS}✓${NC} ${label}"
    else
        echo -e "    ${COLOR_WARNING}⚠ ${label} no encontrado en origen: ${src}${NC}"
    fi
}

copy_root_file "${PLUGIN_DIR}/AGENTS.md"         "${TARGET_DIR}/AGENTS.md"         "AGENTS.md"
copy_root_file "${PLUGIN_DIR}/ZUGZ.md"           "${TARGET_DIR}/ZUGZ.md"           "ZUGZ.md"
copy_root_file "${PLUGIN_DIR}/tui.json"          "${TARGET_DIR}/tui.json"          "tui.json"
copy_root_file "${PLUGIN_DIR}/zugz-models.json"  "${TARGET_DIR}/zugz-models.json"  "zugz-models.json"
copy_root_file "${PLUGIN_DIR}/skills-lock.json"  "${TARGET_DIR}/skills-lock.json"  "skills-lock.json"

#zugz-models.json: se copia del plugin directory (preserva personalizaciones del usuario)
if [ -f "${TARGET_DIR}/zugz-models.json" ]; then
    echo -e "    ${COLOR_SUCCESS}✓${NC} zugz-models.json ${COLOR_MUTED}(preservado)${NC}"
elif [ -f "${PLUGIN_DIR}/zugz-models.json" ]; then
    cp "${PLUGIN_DIR}/zugz-models.json" "${TARGET_DIR}/zugz-models.json"
    echo -e "    ${COLOR_SUCCESS}✓${NC} zugz-models.json (copiado del origen)"
else
    cat > "${TARGET_DIR}/zugz-models.json" << 'MODELSEOF'
{
  "presets": {
    "default": {
      "zugzbot": "google/gemini-3.5-flash",
      "sdd-explorer": "google/gemini-3.5-flash",
      "sdd-planner": "google/gemini-3.5-flash",
      "sdd-builder": "google/gemini-3.5-flash",
      "sdd-tester": "google/gemini-3.5-flash",
      "sdd-archiver": "google/gemini-3.5-flash",
      "aux-handyman": "google/gemini-3.5-flash",
      "aux-oracle": "google/gemini-3.5-flash"
    },
    "free": {
      "zugzbot": "opencode/deepseek-v4-flash-free",
      "sdd-explorer": "opencode/deepseek-v4-flash-free",
      "sdd-planner": "opencode/deepseek-v4-flash-free",
      "sdd-builder": "opencode/deepseek-v4-flash-free",
      "sdd-tester": "opencode/deepseek-v4-flash-free",
      "sdd-archiver": "opencode/deepseek-v4-flash-free",
      "aux-handyman": "opencode/deepseek-v4-flash-free",
      "aux-oracle": "opencode/deepseek-v4-flash-free"
    },
    "balanced": {
      "zugzbot": "google/gemini-3.5-flash",
      "sdd-explorer": "google/gemini-3.5-flash",
      "sdd-planner": "google/gemini-3.5-flash",
      "sdd-builder": "google/gemini-3.5-flash",
      "sdd-tester": "google/gemini-3.5-flash",
      "sdd-archiver": "google/gemini-3.5-flash",
      "aux-handyman": "google/gemini-3.5-flash",
      "aux-oracle": "google/gemini-3.5-flash"
    },
    "turbo": {
      "zugzbot": "anthropic/claude-3.5-sonnet",
      "sdd-explorer": "anthropic/claude-3.5-sonnet",
      "sdd-planner": "anthropic/claude-3.5-sonnet",
      "sdd-builder": "anthropic/claude-3.5-sonnet",
      "sdd-tester": "google/gemini-3.5-flash",
      "sdd-archiver": "google/gemini-3.5-flash",
      "aux-handyman": "google/gemini-3.5-flash",
      "aux-oracle": "google/gemini-3.5-flash"
    }
  }
}
MODELSEOF
    echo -e "    ${COLOR_SUCCESS}✓${NC} zugz-models.json (generado automáticamente)"
fi

# sdd script local de control
if [ "$TARGET_DIR" = "$REPO_DIR" ]; then
    echo -e "    ${COLOR_MUTED}▪ Vinculando script sdd local...${NC}"
    ln -sf "${PLUGIN_DIR}/sdd" "${TARGET_DIR}/sdd"
    echo -e "    ${COLOR_SUCCESS}✓${NC} sdd (vinculado)"
else
    echo -e "    ${COLOR_MUTED}▪ Copiando script sdd de control local...${NC}"
    cp -f "${PLUGIN_DIR}/sdd" "${TARGET_DIR}/sdd"
    chmod +x "${TARGET_DIR}/sdd"
    echo -e "    ${COLOR_SUCCESS}✓${NC} sdd (copiado con permisos de ejecución)"
fi

# opencode.json: se copia o se genera dinámicamente si no existe
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
    for pattern in ".opencode/" "tui.json" ".openspec/*-lock.json" "*-lock.json" "zugz-models.json" "bun.lock" "sdd" "package-lock.json"; do
        if ! grep -Fq "$pattern" "$gitignore_file"; then
            needs_update=true
        fi
    done

    if [ "$needs_update" = true ]; then
        echo -e "    ${COLOR_MUTED}▪ Configurando reglas de exclusión en .gitignore...${NC}"
        echo "" >> "$gitignore_file"
        echo "# --- Zugzbot SDD Harness (Locals) ---" >> "$gitignore_file"
        for pattern in ".opencode/" "tui.json" ".openspec/*-lock.json" "*-lock.json" "zugz-models.json" "bun.lock" "sdd" "package-lock.json"; do
            if ! grep -Fq "$pattern" "$gitignore_file"; then
                echo "$pattern" >> "$gitignore_file"
                echo -e "      ${COLOR_SUCCESS}✓${NC} Ignorando: $pattern"
            fi
        done
    else
        echo -e "    ${COLOR_SUCCESS}✓${NC} .gitignore ya está configurado correctamente"
    fi
}

ensure_gitignore

# ── 7. package.json en .opencode/ y dependencias ──────────────────────────────
echo -e "\n  ${COLOR_HEADER}📦 Instalando dependencias internas de los agentes...${NC}"
cat > "${TARGET_DIR}/.opencode/package.json" << 'PKGEOF'
{
  "name": "zugzbot-sdd-local",
  "dependencies": {
    "@opencode-ai/plugin": "1.15.4"
  }
}
PKGEOF

cd "${TARGET_DIR}/.opencode"
if command -v bun &> /dev/null; then
    echo -e "    ${COLOR_MUTED}▪ Corriendo bun install en .opencode/...${NC}"
    bun install --quiet
else
    echo -e "    ${COLOR_MUTED}▪ Corriendo npm install en .opencode/...${NC}"
    npm install --legacy-peer-deps --quiet
fi
cd "${REPO_DIR}"
echo -e "    ${COLOR_SUCCESS}✓${NC} Dependencias internas listas."

# ── 8. package.json y tsconfig.json de raíz ───────────────────────────────────
echo -e "\n  ${COLOR_HEADER}🛠️  Configurando Entorno del Proyecto...${NC}"
if [ ! -f "${TARGET_DIR}/package.json" ]; then
    echo -e "    ${COLOR_MUTED}▪ Generando package.json en la raíz...${NC}"
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
    echo -e "      ${COLOR_SUCCESS}✓${NC} package.json creado"
else
    echo -e "    ${COLOR_MUTED}▪ Asegurando dependencias de TypeScript/ESLint en package.json de raíz...${NC}"
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
          console.log("      \x1b[32m✓\x1b[0m package.json actualizado con dependencias LSP");
        } else {
          console.log("      \x1b[32m✓\x1b[0m package.json ya cuenta con dependencias LSP");
        }
      } catch (e) {
        console.log("      \x1b[31m⚠ Error actualizando package.json:\x1b[0m", e.message);
      }
    '
fi

if [ ! -f "${TARGET_DIR}/tsconfig.json" ]; then
    echo -e "    ${COLOR_MUTED}▪ Generando tsconfig.json en la raíz...${NC}"
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
    echo -e "      ${COLOR_SUCCESS}✓${NC} tsconfig.json creado"
fi

# Generar un archivo eslint.config.js si no existe ningún archivo de configuración de ESLint en el proyecto destino
if [ ! -f "${TARGET_DIR}/eslint.config.js" ] && [ ! -f "${TARGET_DIR}/.eslintrc.json" ] && [ ! -f "${TARGET_DIR}/.eslintrc.js" ] && [ ! -f "${TARGET_DIR}/.eslintrc" ]; then
    echo -e "    ${COLOR_MUTED}▪ Generando eslint.config.js por defecto (Flat Config)...${NC}"
    cat > "${TARGET_DIR}/eslint.config.js" << 'ROOTESLINTEOF'
import js from "@eslint/js";
import html from "eslint-plugin-html";

export default [
  js.configs.recommended,
  {
    plugins: {
      html
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
ROOTESLINTEOF
    echo -e "      ${COLOR_SUCCESS}✓${NC} eslint.config.js creado"
fi

echo -e "    ${COLOR_MUTED}▪ Instalando dependencias de raíz...${NC}"
cd "${TARGET_DIR}"
if command -v bun &> /dev/null; then
    bun install --quiet
else
    npm install --legacy-peer-deps --quiet
fi
cd "${REPO_DIR}"

# ── 9. Inicializar .openspec/ si no existe ────────────────────────────────────
if [ ! -d "${TARGET_DIR}/.openspec" ]; then
    echo -e "\n  ${COLOR_HEADER}🧠 Inicializando Memoria Técnica (.openspec/)...${NC}"
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
    echo -e "    ${COLOR_SUCCESS}✓${NC} .openspec/ inicializado correctamente"
fi

# ── Aplicación de Modelos de IA Personalizados ────────────────────────────────
if [ -f "${TARGET_DIR}/zugz-models.json" ] && [ -f "${TARGET_DIR}/sdd" ]; then
    echo -e "\n  ${COLOR_HEADER}🤖 Aplicando modelos de IA personalizados a los agentes...${NC}"
    cd "${TARGET_DIR}"
    bash "./sdd" models apply
    cd "${REPO_DIR}"
fi

# ── Resultado final ────────────────────────────────────────────────────────────
echo -e "\n  ${COLOR_MUTED}─────────────────────────────────────────────────────────────────${NC}"
echo -e "  ${COLOR_SUCCESS}🎉 ¡ZUGZBOT SDD INSTALADO CON ÉXITO!${NC}"
echo -e "  ${COLOR_MUTED}─────────────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "  ${COLOR_WARNING}Siguientes pasos recomendados:${NC}"
echo -e "    ${COLOR_MUTED}1.${NC} Revisa la guía en:    ${COLOR_HEADER}ZUGZ.md${NC}"
echo -e "    ${COLOR_MUTED}2.${NC} Abre la terminal IA:  ${COLOR_HEADER}opencode${NC}"
echo -e "    ${COLOR_MUTED}3.${NC} Saluda al Orquestador: ${COLOR_HEADER}@zugzbot hola${NC}\n"
