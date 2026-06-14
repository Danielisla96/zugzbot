---
description: Run the OMD harness smoke test (checks catalog, skills, agents, plugins, JSON hygiene, gitignore)
agent: build
---

Run `.opencode/tools/omd-doctor.sh` via the bash tool and report the full output to the user.

If the script reports any `✗ MISSING` or `⚠` line, do not attempt to fix automatically — just list the failures and ask the user whether to (a) accept the current state, (b) re-run `npx --yes oh-my-design-cli@latest install-skills --all --force`, or (c) investigate further.

Do not edit any files. Doctor is read-only.
