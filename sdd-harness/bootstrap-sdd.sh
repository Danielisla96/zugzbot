#!/bin/bash
# ==============================================================================
#  bootstrap-sdd.sh
#  Spec-Driven Development (SDD) Orchestration Environment Bootstrap Installer
# ==============================================================================
#
# Initializes the SDD methodology in any new repository using OpenCode.
# All configuration is scoped to the target project — nothing is written globally.
#
# Usage:
#   Run this script from the root of your target project:
#     /path/to/sdd-harness/bootstrap-sdd.sh [--dry-run]
#
# Flags:
#   --dry-run   Preview all actions without writing any files or running git commands.
#
# Version: 1.1.0

set -e

HARNESS_VERSION="1.1.0"
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0;39m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${CYAN}🚀 Initializing SDD Orchestrated Harness v${HARNESS_VERSION}...${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}⚠  DRY RUN — no files will be written or committed${NC}"
fi
echo -e "${BLUE}======================================================================${NC}"

# --- Dependency check ---
if ! command -v git &>/dev/null; then
    echo -e "${RED}❌ Error: 'git' is not installed or not in PATH.${NC}"
    exit 1
fi

# 1. Resolve directories
HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR=$(pwd)

# 2. Safety check
if [ ! -d "$HARNESS_DIR/agents" ] || [ ! -d "$HARNESS_DIR/project-templates" ]; then
    echo -e "${RED}❌ Error: Cannot locate 'sdd-harness/agents' or 'sdd-harness/project-templates'.${NC}"
    echo -e "${RED}Make sure you run this script from its distribution folder.${NC}"
    exit 1
fi

# Prevent running inside the zugzbot repo itself
if [ "$TARGET_DIR" = "$HARNESS_DIR" ] || [ "$TARGET_DIR" = "$(dirname "$HARNESS_DIR")" ]; then
    echo -e "${RED}❌ Error: Run this script from your TARGET project root, not from the zugzbot repo.${NC}"
    exit 1
fi

echo -e "\n${CYAN}📍 Harness source:${NC} $HARNESS_DIR"
echo -e "${CYAN}📍 Target project:${NC} $TARGET_DIR"

# 3. Git repository check and initialization
echo -e "\n${BLUE}[0/7] 🔧 Checking git repository...${NC}"
if [ -d "$TARGET_DIR/.git" ]; then
    echo -e "${GREEN}✓ Git repository already exists — skipping init${NC}"
else
    echo -e "${CYAN}⚠ No git repository found. Initializing...${NC}"
    # Create a generic .gitignore if one doesn't exist
    if [ ! -f "$TARGET_DIR/.gitignore" ]; then
        cat > "$TARGET_DIR/.gitignore" << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
out/
.next/
.nuxt/

# Python
__pycache__/
*.py[cod]
*.pyo
*.pyd
.venv/
venv/
env/
*.egg-info/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Editor / OS
.DS_Store
.idea/
.vscode/
*.swp
*.swo
Thumbs.db

# SDD artifacts (generated, not source)
openspec/changes/archive/
GITIGNORE
        echo -e "${GREEN}✓ .gitignore created${NC}"
    else
        echo -e "${CYAN}✓ .gitignore already exists — keeping it${NC}"
    fi
    if [ "$DRY_RUN" = false ]; then
        git -C "$TARGET_DIR" init -b main
        git -C "$TARGET_DIR" add .
        git -C "$TARGET_DIR" commit -m "chore: initial commit — before SDD harness bootstrap"
        echo -e "${GREEN}✓ Git repository initialized with initial commit${NC}"
    else
        echo -e "${CYAN}[dry-run] Would run: git init + initial commit${NC}"
    fi
fi

# 4. Create project directory structure
echo -e "\n${BLUE}[1/7] 📂 Creating project directory structure...${NC}"
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$TARGET_DIR/.opencode/agents"
    mkdir -p "$TARGET_DIR/.opencode/commands"
    mkdir -p "$TARGET_DIR/.opencode/skills"
    mkdir -p "$TARGET_DIR/.agent/workflows"
    mkdir -p "$TARGET_DIR/.agent/skills"
    mkdir -p "$TARGET_DIR/openspec/schemas/ssd-orchestrated"
    echo -e "${GREEN}✓ Directories created${NC}"
else
    echo -e "${CYAN}[dry-run] Would create: .opencode/agents, .opencode/commands, .opencode/skills, .agent/workflows, .agent/skills, openspec/schemas/ssd-orchestrated${NC}"
fi

# 5. Install agent prompts locally (project-scoped, not global)
echo -e "\n${BLUE}[2/7] 🤖 Installing agent prompts into .opencode/agents/...${NC}"
if [ "$DRY_RUN" = false ]; then
    cp -v "$HARNESS_DIR"/agents/*.md "$TARGET_DIR/.opencode/agents/"
    echo -e "${GREEN}✓ Agent prompts installed in $TARGET_DIR/.opencode/agents/${NC}"
else
    echo -e "${CYAN}[dry-run] Would copy: agents/*.md → .opencode/agents/${NC}"
fi

# 6. Generate project-local opencode.jsonc
echo -e "\n${BLUE}[3/7] ⚙️  Generating project-local opencode.jsonc...${NC}"
OPENCODE_CONFIG="$TARGET_DIR/opencode.jsonc"

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}[dry-run] Would generate: opencode.jsonc${NC}"
    SKIP_CONFIG=true
elif [ -f "$OPENCODE_CONFIG" ]; then
    echo -e "${CYAN}⚠ opencode.jsonc already exists in target project.${NC}"
    read -p "Overwrite it with the SDD agent config? (y/n): " confirm
    if [[ ! "$confirm" =~ ^[yY]$ ]]; then
        echo -e "${CYAN}✓ Keeping existing opencode.jsonc${NC}"
        SKIP_CONFIG=true
    fi
fi

if [ "${SKIP_CONFIG}" != "true" ]; then
    cat > "$OPENCODE_CONFIG" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "zugzbot": {
      "mode": "primary",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium",
      "permission": {
        "task": {
          "sdd-*": "allow"
        }
      }
    },
    "sdd-proposer": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-planner": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-implementer": {
      "mode": "subagent",
      "model": "opencode/minimax-m2.5-free",
      "variant": "medium"
    },
    "sdd-verifier": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-documenter": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "sdd-ui-designer": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "aux-oracle": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    },
    "aux-handyman": {
      "mode": "subagent",
      "model": "opencode/deepseek-v4-flash-free",
      "variant": "medium"
    }
  }
}
EOF
    echo -e "${GREEN}✓ opencode.jsonc generated${NC}"
fi

# 7. Copy skills, workflows, commands and OpenSpec schemas
echo -e "\n${BLUE}[4/7] 🧩 Copying skills, workflows, commands and OpenSpec schemas...${NC}"
if [ "$DRY_RUN" = false ]; then
    # Use cp -rn (no-overwrite) so re-running the bootstrap never clobbers customized skills
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/workflows/. "$TARGET_DIR/.agent/workflows/"
    cp -rn "$HARNESS_DIR"/project-templates/dot-agent/skills/.    "$TARGET_DIR/.agent/skills/"
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/commands/. "$TARGET_DIR/.opencode/commands/"
    cp -rn "$HARNESS_DIR"/project-templates/dot-opencode/skills/.  "$TARGET_DIR/.opencode/skills/"
    cp -rn "$HARNESS_DIR"/project-templates/openspec-schema/ssd-orchestrated/. \
            "$TARGET_DIR/openspec/schemas/ssd-orchestrated/"
    echo -e "${GREEN}✓ Skills, workflows, commands and schemas injected${NC}"
else
    echo -e "${CYAN}[dry-run] Would copy: workflows, skills, commands, schemas${NC}"
fi

# 8. Write harness version marker
echo -e "\n${BLUE}[5/7] 🏷  Writing harness version marker...${NC}"
if [ "$DRY_RUN" = false ]; then
    echo "$HARNESS_VERSION" > "$TARGET_DIR/.agent/.sdd-harness-version"
    echo -e "${GREEN}✓ Version marker written: .agent/.sdd-harness-version ($HARNESS_VERSION)${NC}"
else
    echo -e "${CYAN}[dry-run] Would write: .agent/.sdd-harness-version${NC}"
fi

# 9. Git checkpoint: post-harness-install
echo -e "\n${BLUE}[6/7] 📸 Creating post-install git checkpoint...${NC}"
if [ "$DRY_RUN" = false ]; then
    git -C "$TARGET_DIR" add .
    git -C "$TARGET_DIR" commit -m "chore(sdd): bootstrap harness installed" 2>/dev/null || \
        echo -e "${CYAN}✓ No changes to commit (harness already tracked)${NC}"
    echo -e "${GREEN}✓ Git checkpoint created${NC}"
else
    echo -e "${CYAN}[dry-run] Would run: git add . && git commit${NC}"
fi

# 10. Install AGENTS.md
echo -e "\n${BLUE}[7/7] 📜 Installing AGENTS.md...${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}[dry-run] Would install: AGENTS.md${NC}"
elif [ -f "$TARGET_DIR/AGENTS.md" ]; then
    echo -e "${CYAN}⚠ AGENTS.md already exists in target project.${NC}"
    read -p "Overwrite with Zugzbot master rules? (y/n): " confirm
    if [[ "$confirm" =~ ^[yY]$ ]]; then
        cp -v "$HARNESS_DIR/project-templates/AGENTS.md" "$TARGET_DIR/AGENTS.md"
        echo -e "${GREEN}✓ AGENTS.md overwritten${NC}"
    else
        echo -e "${CYAN}✓ Keeping existing AGENTS.md${NC}"
    fi
else
    cp -v "$HARNESS_DIR/project-templates/AGENTS.md" "$TARGET_DIR/AGENTS.md"
    echo -e "${GREEN}✓ AGENTS.md installed${NC}"
fi

# Done
echo -e "\n${BLUE}======================================================================${NC}"
echo -e "${GREEN}🎉 INSTALLATION COMPLETE!${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo -e "${CYAN}💡 Next steps:${NC}"
echo -e "  1. Run 'opencode' from the root of your new project."
echo -e "  2. Tell Zugzbot what change you want — it will orchestrate the full SDD cycle."
echo -e "  3. Nothing was written to your global opencode config. 🔒\n"
