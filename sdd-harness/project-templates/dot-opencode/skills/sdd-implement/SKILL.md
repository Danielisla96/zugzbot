---
name: sdd-implement
description: Execute the implementation checklist produced by sdd-plan, writing clean production-quality source code that strictly respects the approved architecture. Use after the architecture and task checklist are approved by the user.
license: MIT
compatibility: Requires read/write access to src/ and openspec/. LSP diagnostics access is required for the static quality gate.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Implement the approved checklist by writing clean, production-quality source code.

**Input**: The name of the active change (kebab-case). If omitted, infer from context or prompt the user.

**Steps**

1. **Read all context before writing a single line of code**

   Read in order:
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/specs/spec.md`
   - `openspec/changes/<name>/orchestrator_architecture.md`
   - `openspec/changes/<name>/orchestrator_tasks.md`

   Map every unchecked task (`- [ ]`) to its target file before starting.

2. **Execute the checklist sequentially**

   Rules:
   - Complete tasks in the exact order defined in `orchestrator_tasks.md` (Phase A → B → C → D → E)
   - After completing each task, mark it `- [x]` immediately in `orchestrator_tasks.md`
   - One task at a time — do not batch unrelated changes across multiple files in a single edit

   For each task:
   1. Re-read the relevant section of `orchestrator_architecture.md`
   2. Re-read the relevant scenario in `specs/spec.md`
   3. Write or modify the target file
   4. Mark the task complete
   5. Briefly note what was done before moving to the next task

3. **Code quality standards (non-negotiable)**

   Every piece of code produced must meet:

   | Standard | Requirement |
   |---|---|
   | Naming | Descriptive names for all identifiers — no abbreviations, no single-letter variables outside loops |
   | Functions | Single responsibility — one function does one thing |
   | Error handling | All failure paths handled explicitly — no silent catches |
   | Comments | Explain WHY, not what — only where non-obvious |
   | Coupling | Depend on abstractions (interfaces/protocols) not concrete classes |
   | Duplication | Zero duplication — extract shared logic immediately |
   | File length | No file over 300 lines — split if exceeded |

4. **Static quality gate (LSP)**

   After all tasks are marked `- [x]`, before reporting to Zugzbot:
   - Review every file modified during this session for LSP diagnostics (errors, type mismatches, undefined symbols)
   - Fix ALL errors before proceeding — zero tolerance
   - Warnings may be noted but do not block delivery

5. **Auto-healing mode (if reactivated by Zugzbot)**

   If Zugzbot reactivates this skill after test failures reported by sdd-verifier:
   - Read the failure log provided in the task context
   - Locate the exact failing code using the stack trace
   - Apply a surgical fix — do not refactor unrelated code
   - Update `orchestrator_tasks.md` with a note on what was corrected
   - Return control to Zugzbot for re-verification

   Do NOT assume the fix is correct until sdd-verifier confirms it.

6. **Report to Zugzbot**

   ```
   ## Implementation Phase Complete

   **Change:** <change-name>
   **Tasks completed:** <n>/<n>
   **Files created:** <list>
   **Files modified:** <list>
   **LSP errors at delivery:** 0

   Summary of changes:
   - <task A1>: <what was implemented>
   - <task B1>: <what was implemented>
   - ...

   Fase 3 completada. Código listo para revisión del usuario.
   ```

**Guardrails**
- Never execute bash commands — you have no terminal access; that belongs to sdd-verifier
- Never write tests here — test creation belongs to sdd-verifier's phase
- Never modify `orchestrator_architecture.md` — if the architecture needs to change, report it to Zugzbot instead
- Never deliver with LSP errors — a file with diagnostics is not considered complete
- If a task is ambiguous, re-read `specs/spec.md` before asking — most answers are in the spec
- If you discover the architecture is wrong or incomplete, STOP and report to Zugzbot before continuing
