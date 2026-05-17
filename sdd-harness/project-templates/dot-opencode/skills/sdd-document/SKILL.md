---
name: sdd-document
description: Generate the three canonical project documentation files (README.md, docs/TECHNICAL.md, docs/USER_GUIDE.md) based on all SDD artifacts produced during the cycle. Use before archiving a change.
license: MIT
compatibility: Requires an active openspec change with completed proposal, spec, architecture, and verification_report artifacts.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Generate the three canonical documentation files for the project based on all SDD artifacts.

**Input**: The name of the active change (kebab-case). If omitted, infer from conversation context or prompt the user.

**Steps**

1. **Resolve the change name**

   If not provided, run:
   ```bash
   openspec list --json
   ```
   Use the **AskUserQuestion tool** to let the user select the active change.

2. **Read all source artifacts**

   Read the following files in order before writing anything:
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/specs/spec.md`
   - `openspec/changes/<name>/orchestrator_architecture.md`
   - `openspec/changes/<name>/verification_report.md`
   - `src/` directory tree (to understand real module structure)
   - `README.md` at project root (if it exists — update, do not blindly replace)

   **IMPORTANT**: Do NOT generate any document without reading all available sources first. The quality of the output depends entirely on the richness of the context consumed.

3. **Generate `README.md`**

   Write or update the file at the project root. Required sections:
   - Project name + one-sentence description
   - What it does and why it exists (2–3 sentences)
   - Tech stack badge line
   - Quick Start section (minimum viable commands to run the project)
   - Directory structure (simplified tree of key folders)
   - Links to `docs/TECHNICAL.md` and `docs/USER_GUIDE.md`

   Minimum 60 lines. No placeholder text.

4. **Generate `docs/TECHNICAL.md`**

   Write the file at `docs/TECHNICAL.md`. Required sections:
   - System architecture: layers, modules, responsibilities
   - Mermaid flow diagram of the main request/process flow
   - Endpoint or public function catalogue: name, inputs, outputs, behavior
   - Key design decisions and rationale
   - External dependencies and their purpose
   - Extension guide (how to add new features/modules)

   Minimum 80 lines. The Mermaid diagram must reflect the real system flow.

5. **Generate `docs/USER_GUIDE.md`**

   Write the file at `docs/USER_GUIDE.md`. Required sections:
   - System requirements (OS, runtime versions, dependencies)
   - Step-by-step installation (clone → install → env config)
   - Running the project locally
   - Running the test suite
   - Real usage examples with actual curl commands and JSON responses
     (copy from `verification_report.md` — do not invent)
   - Troubleshooting section (common errors and fixes)

   Minimum 80 lines. Commands must be real and accurate.

6. **Verify completeness**

   Confirm all three files exist and have non-trivial content:
   - `README.md` ≥ 60 lines
   - `docs/TECHNICAL.md` ≥ 80 lines
   - `docs/USER_GUIDE.md` ≥ 80 lines

   If any file is incomplete, fix it before proceeding.

7. **Report to Zugzbot**

   Output a structured summary:
   ```
   ## Documentation Phase Complete

   **Change:** <change-name>

   | File | Lines | Description |
   |---|---|---|
   | README.md | <n> | Project overview, quick start, directory structure |
   | docs/TECHNICAL.md | <n> | Architecture, Mermaid diagram, endpoint catalogue |
   | docs/USER_GUIDE.md | <n> | Installation, usage examples, troubleshooting |

   Fase 5 completada. Los documentos están listos para revisión del usuario.
   ```

**Guardrails**
- Never write a document without reading all source artifacts first
- Never leave placeholder text or empty sections in output files
- Commands included must be exact — cross-reference with `verification_report.md` and `src/`
- If `README.md` already exists, preserve valid existing sections and update/extend them
- Create `docs/` directory implicitly by writing to that path — no explicit mkdir needed
- Do NOT archive the change — that is Zugzbot's responsibility after user approval
