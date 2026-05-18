---
name: sdd-propose
description: Conduct a structured requirements interview with the user and produce the two canonical proposal artifacts (proposal.md and specs/spec.md) for the named change. Use at the start of every SDD cycle, before any design or implementation work begins.
license: MIT
compatibility: No external tools required. Read/write access to openspec/ is sufficient.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Gather requirements from the user and produce the canonical proposal artifacts for this change.

**Input**: The name of the change in kebab-case (e.g. `user-auth`, `payment-gateway`). If omitted, ask the user for it before proceeding.

**Steps**

1. **Resolve the change name and prepare the workspace**

   - Confirm the change name with the user if it was not provided.
   - Create the directory `openspec/changes/<name>/specs/` if it does not exist.
   - Check whether `openspec/changes/<name>/proposal.md` already exists.
     - If it does: read it, inform the user, and ask whether to overwrite or extend it before continuing.

2. **Conduct the requirements interview**

   Ask the following questions. Wait for answers before moving to the next group. Do NOT ask all questions at once.

   **Group A — Context and purpose**
   - What problem does this change solve? Who is the end user or beneficiary?
   - What is the expected business or technical outcome once this is implemented?

   **Group B — Technical scope**
   - What is the technology stack (language, framework, database, runtime)?
   - Are there existing modules, services, or APIs this change must integrate with?
   - What are the performance or scale expectations (if any)?

   **Group C — Behavioral scenarios**
   - Walk me through the main happy-path flow step by step.
   - What are the most likely failure or edge cases we must handle?
   - Are there any explicit exclusions — things this change must NOT do?

   **Group D — Acceptance criteria**
   - How will you know this is done and correct? What does success look like?
   - Are there any regulatory, security, or accessibility requirements?

   Maintain a professional, consultative tone throughout. Do not proceed to Step 3 until all groups are answered.

3. **Write `proposal.md`**

   Write to `openspec/changes/<name>/proposal.md`:

   ```markdown
   # Proposal — <change-name>

   ## Summary
   <One paragraph describing what is being built and why.>

   ## Objectives
   - <objective 1>
   - <objective 2>

   ## Technology Stack
   | Layer | Technology |
   |---|---|
   | Language | ... |
   | Framework | ... |
   | Database | ... |
   | Runtime | ... |

   ## Scope

   ### In scope
   - <item>

   ### Out of scope
   - <item>

   ## Acceptance Criteria
   - <criterion>

   ## Open Questions
   - <any unresolved item that may affect design>
   ```

4. **Write `specs/spec.md`**

   Write to `openspec/changes/<name>/specs/spec.md`:

   ```markdown
   # Behavioral Specification — <change-name>

   ## Overview
   <Brief description of the system behavior being specified.>

   ## Scenarios

   ### Scenario 1 — <Happy path title>
   **Given** <precondition>
   **When** <action>
   **Then** <expected outcome>

   ### Scenario 2 — <Edge case or failure title>
   **Given** <precondition>
   **When** <action>
   **Then** <expected outcome>

   <!-- Add as many scenarios as needed. Minimum: happy path + 2 edge cases. -->

   ## Constraints
   - <constraint or non-functional requirement>
   ```

   Rules:
   - Every scenario must be traceable to at least one acceptance criterion in `proposal.md`.
   - Include at minimum: one happy-path scenario, one failure/error scenario, and one boundary/edge-case scenario.
   - Scenarios must be concrete and testable — no vague language like "it should work correctly."

5. **Report to Zugzbot**

   ```
   ## Proposal Phase Complete

   **Change:** <change-name>
   **Artifacts written:**
   - openspec/changes/<name>/proposal.md
   - openspec/changes/<name>/specs/spec.md

   **Scenarios defined:** <n>
   **Open questions:** <n — list them if any>

   Fase 1 completada. Propuesta y especificación listos para revisión del usuario.
   ```

**Guardrails**
- Never write code or design architecture — that belongs to sdd-planner and sdd-implementer
- Never skip the interview — writing artifacts from assumptions produces incorrect specs
- Never proceed to artifact writing until all four question groups are answered
- If the user is vague or contradictory, ask ONE targeted clarifying question before moving on
- The spec must be independently readable — do not assume the reader has the conversation context
