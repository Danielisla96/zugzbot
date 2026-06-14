#!/usr/bin/env bash
# omd-doctor.sh — OMD harness smoke test (read-only)
# Run via `/omd-doctor` slash command or `bash .opencode/tools/omd-doctor.sh`
set -u

PASS=0
FAIL=0
WARN=0

pass() { printf "  \033[32m✓\033[0m %s\n" "$1"; PASS=$((PASS + 1)); }
fail() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAIL=$((FAIL + 1)); }
warn() { printf "  \033[33m⚠\033[0m %s\n" "$1"; WARN=$((WARN + 1)); }

section() { printf "\n\033[1m%s\033[0m\n" "$1"; }

project_root="$(pwd)"
catalog_dir="${OMD_CATALOG_DIR:-.opencode/data}"

# ---- 1. OMD catalog (in .opencode/data — canonical location) ----
section "1. OMD catalog (${catalog_dir}/)"
test -d "${catalog_dir}/references" && pass "${catalog_dir}/references/ exists" || fail "${catalog_dir}/references/ MISSING"
refs=$(ls "${catalog_dir}/references/" 2>/dev/null | wc -l | tr -d ' ')
if [ "$refs" -gt 100 ]; then pass "catalog has ${refs} DESIGN.md references"; else fail "catalog only has ${refs} refs (expected >100)"; fi
test -f "${catalog_dir}/reference-fingerprints.json" && pass "reference-fingerprints.json" || fail "reference-fingerprints.json MISSING"
test -f "${catalog_dir}/vocabulary.json" && pass "vocabulary.json" || warn "vocabulary.json missing (non-critical)"
test -f "${catalog_dir}/reference-tags.md" && pass "reference-tags.md" || warn "reference-tags.md missing (non-critical)"
test -f "${catalog_dir}/scripts/ctx-prime.cjs" && pass "ctx-prime.cjs helper" || warn "ctx-prime.cjs missing (omd:harness Step 2.5 will skip)"

# ---- 2. OMD skills (project-local) ----
section "2. OMD skills (.opencode/skills/)"
omd_skills=$(ls -d .opencode/skills/omd-* 2>/dev/null | wc -l | tr -d ' ')
if [ "$omd_skills" -ge 15 ]; then pass "${omd_skills} OMD skills installed"; else fail "only ${omd_skills} OMD skills (expected ≥15)"; fi
for critical in omd-init omd-apply omd-harness omd-sync omd-remember; do
  test -f ".opencode/skills/${critical}/SKILL.md" && pass "skill: ${critical}" || fail "skill MISSING: ${critical}"
done

# ---- 3. OMD sub-agents (in .opencode/agents — native OpenCode agents) ----
section "3. OMD sub-agents (.opencode/agents/)"
omd_agents=$(ls .opencode/agents/omd-*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$omd_agents" -ge 15 ]; then pass "${omd_agents} OMD sub-agents available"; else fail "only ${omd_agents} OMD sub-agents (expected ≥15)"; fi
test -f .opencode/agents/omd-master.md && pass "omd-master (required for omd:harness)" || fail "omd-master MISSING"

# ---- 4. User's harness agents ----
section "4. Harness agents (.opencode/agents/)"
for a in sdd-orchestrator sdd-spec-writer sdd-coder sdd-tester sdd-deployer; do
  test -f ".opencode/agents/${a}.md" && pass "agent: ${a}" || fail "agent MISSING: ${a}"
done

# ---- 5. Harness plugins (omd-bootstrap + omd-token-audit) ----
section "5. Harness plugins (.opencode/plugins/)"
test -f .opencode/plugins/omd-bootstrap.ts && pass "omd-bootstrap.ts" || fail "omd-bootstrap.ts MISSING"
test -f .opencode/plugins/omd-token-audit.ts && pass "omd-token-audit.ts" || fail "omd-token-audit.ts MISSING"
test -f .opencode/plugins/sdd-bridge.ts && pass "sdd-bridge.ts (existing)" || warn "sdd-bridge.ts missing"
test -d .opencode/node_modules/@opencode-ai/plugin && pass "@opencode-ai/plugin SDK installed" || fail "@opencode-ai/plugin SDK MISSING"

# ---- 6. opencode.json hygiene ----
section "6. opencode.json hygiene"
if [ -f opencode.json ]; then
  grep -q '"heroui"' opencode.json && fail "heroui MCP still enabled (should be removed)" || pass "no heroui MCP"
  grep -q '"plugin"' opencode.json && pass "plugin array configured" || fail "plugin array MISSING — omd plugins won't auto-load"
  grep -q 'omd-bootstrap' opencode.json && pass "omd-bootstrap listed in plugin array" || fail "omd-bootstrap not in plugin array"
  grep -q 'omd-token-audit' opencode.json && pass "omd-token-audit listed in plugin array" || fail "omd-token-audit not in plugin array"
  grep -q '"skill"' opencode.json && pass "permission.skill configured" || warn "permission.skill not configured (all skills will use global default)"
  grep -q '"instructions"' opencode.json && pass "instructions configured" || warn "instructions not configured (AGENTS.md is fallback)"
else
  fail "opencode.json MISSING"
fi

# ---- 7. Defensive cleanup ----
section "7. Defensive cleanup"
test ! -d .cursor && pass "no .cursor/ directory" || fail ".cursor/ exists (Cursor shim should be removed)"
test ! -d .codex && pass "no .codex/ directory" || warn ".codex/ exists (Codex-only channel — safe to remove)"
test ! -d .agents && pass "no .agents/ directory (Codex compat)" || warn ".agents/ exists (Codex compat — safe to remove)"
test ! -d .claude/hooks && pass "no .claude/hooks/ (fully migrated to .opencode)" || warn ".claude/hooks/ exists (should be removed — all tools use .opencode/)"
test ! -f .claude/settings.json && pass "no .claude/settings.json (fully migrated to .opencode)" || warn ".claude/settings.json exists (should be removed)"
test ! -d .claude && pass "no .claude/ directory (fully migrated to .opencode/)" || warn ".claude/ still exists (should be removed — all data/agents moved to .opencode/)"

# ---- 8. .gitignore defensive entries ----
section "8. .gitignore defensive entries"
if [ -f .gitignore ]; then
  grep -q '\.opencode/data/cache' .gitignore && pass ".opencode/data/cache ignored" || warn ".opencode/data/cache NOT in .gitignore"
  grep -q '\.opencode/data/references/' .gitignore && pass "catalog refs ignored (regenerable)" || warn ".opencode/data/references/ NOT in .gitignore"
  grep -q '\.cursor/' .gitignore && pass ".cursor/ ignored" || warn ".cursor/ NOT in .gitignore"
  grep -q '\.omd/' .gitignore && pass ".omd/ ignored" || warn ".omd/ NOT in .gitignore"
else
  fail ".gitignore MISSING"
fi

# ---- Summary ----
printf "\n"
printf "========================================\n"
printf "Result: \033[32m%d pass\033[0m · \033[33m%d warn\033[0m · \033[31m%d fail\033[0m\n" "$PASS" "$WARN" "$FAIL"
printf "========================================\n"

if [ "$FAIL" -eq 0 ]; then
  printf "\033[32m✓ Harness is OMD-ready.\033[0m\n"
  exit 0
else
  printf "\033[31m✗ Fix the failures above before relying on OMD bootstrap.\033[0m\n"
  exit 1
fi
