---
description: Bootstrap a design system in this project via the omd:init skill (loads reference-fingerprints, asks user, writes DESIGN.md)
agent: sdd-orchestrator
model: deepseek/deepseek-v4-flash
---

Run the `omd:init` skill in this project. The user typed `/omd-init` to explicitly request a fresh design-system bootstrap.

Steps:
1. Confirm `omd:init` skill is loadable (it lives at `.opencode/skills/omd-init/SKILL.md`). If missing, run `npx --yes oh-my-design-cli@latest install-skills --all --force` first.
2. Follow the skill's Phase 1 → Phase 7 flow strictly. Do NOT skip the AskUserQuestion step (Phase 3 / 3.5) — the user must pick the reference brand.
3. After the skill emits `DESIGN.md` and `.omd/init-context.json`, the omd-bootstrap plugin will pick up the new state automatically on the next tool execution.
4. Report the chosen `reference_id` and the new DESIGN.md path to the user.

If `DESIGN.md` already exists at project root, warn the user and confirm: the skill will rename it to `DESIGN_DEPRECATED.md` per Phase 4.2 before writing the new one.
