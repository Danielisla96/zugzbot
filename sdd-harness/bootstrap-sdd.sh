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
#   1. Run this script from the root of your new project:
#      /path/to/sdd-harness/bootstrap-sdd.sh
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0;39m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${CYAN}🚀 Initializing SDD Orchestrated Harness...${NC}"
echo -e "${BLUE}======================================================================${NC}"

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

# 3. Create project directory structure
echo -e "\n${BLUE}[1/5] 📂 Creating project directory structure...${NC}"
mkdir -p "$TARGET_DIR/.opencode/agents"
mkdir -p "$TARGET_DIR/.opencode/commands"
mkdir -p "$TARGET_DIR/.opencode/skills"
mkdir -p "$TARGET_DIR/.agent/workflows"
mkdir -p "$TARGET_DIR/.agent/skills"
mkdir -p "$TARGET_DIR/openspec/schemas/ssd-orchestrated"
echo -e "${GREEN}✓ Directories created${NC}"

# 4. Install agent prompts locally (project-scoped, not global)
echo -e "\n${BLUE}[2/5] 🤖 Installing agent prompts into .opencode/agents/...${NC}"
cp -v "$HARNESS_DIR"/agents/*.md "$TARGET_DIR/.opencode/agents/"
echo -e "${GREEN}✓ Agent prompts installed in $TARGET_DIR/.opencode/agents/${NC}"

# 5. Generate project-local opencode.jsonc
echo -e "\n${BLUE}[3/5] ⚙️  Generating project-local opencode.jsonc...${NC}"
OPENCODE_CONFIG="$TARGET_DIR/opencode.jsonc"

if [ -f "$OPENCODE_CONFIG" ]; then
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
    }
  }
}
EOF
    echo -e "${GREEN}✓ opencode.jsonc generated${NC}"
fi

# 6. Copy skills, workflows, commands and OpenSpec schemas
echo -e "\n${BLUE}[4/5] 🧩 Copying skills, workflows, commands and OpenSpec schemas...${NC}"
cp -rv "$HARNESS_DIR"/project-templates/dot-agent/workflows/* "$TARGET_DIR/.agent/workflows/"
cp -rv "$HARNESS_DIR"/project-templates/dot-agent/skills/*    "$TARGET_DIR/.agent/skills/"
cp -rv "$HARNESS_DIR"/project-templates/dot-opencode/commands/* "$TARGET_DIR/.opencode/commands/"
cp -rv "$HARNESS_DIR"/project-templates/dot-opencode/skills/*  "$TARGET_DIR/.opencode/skills/"
cp -rv "$HARNESS_DIR"/project-templates/openspec-schema/ssd-orchestrated/* \
        "$TARGET_DIR/openspec/schemas/ssd-orchestrated/"
echo -e "${GREEN}✓ Skills, workflows, commands and schemas injected${NC}"

# 7. Install AGENTS.md
echo -e "\n${BLUE}[5/5] 📜 Installing AGENTS.md...${NC}"
if [ -f "$TARGET_DIR/AGENTS.md" ]; then
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
