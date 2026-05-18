---
name: sdd-plan
description: Translate an approved proposal and behavioral specification into a clean architecture design and an atomic implementation checklist. Use after sdd-propose is approved and before any code is written.
license: MIT
compatibility: No external tools required. Read/write access to openspec/ is sufficient.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Design the architecture and produce the implementation checklist for an approved change.

**Input**: The name of the active change (kebab-case). If omitted, infer from context or prompt the user.

**Steps**

1. **Read all context before doing anything**

   Read in order:
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/specs/spec.md`
   - Current `src/` directory tree (to understand existing structure)
   - `openspec/schemas/ssd-orchestrated/` (if present, to understand schema contracts)

   Do not begin writing until all four sources are read and understood.

2. **Design the architecture**

   Apply the following principles to every design decision:
   - **SOLID**: each module has a single, well-defined responsibility
   - **Clean Architecture**: separate domain logic from infrastructure and delivery
   - **DRY**: identify and extract shared logic into reusable modules
   - **Dependency Inversion**: depend on abstractions, not concrete implementations

   Define:
   - Directory and file layout under `src/` — include every new file and its responsibility
   - Module boundaries and their contracts (what each module exposes and consumes)
   - Data flow: how a request travels from entry point to persistence and back
   - External dependencies needed and why each is justified

3. **Write `orchestrator_architecture.md`**

   Write to `openspec/changes/<name>/orchestrator_architecture.md`:

   ```markdown
   # Architecture Design — <change-name>

   ## Design Principles Applied
   <List the specific SOLID / Clean Architecture decisions made and why.>

   ## Directory Layout

   ```
   src/
   ├── <module>/
   │   ├── <file>.py        # <responsibility>
   │   └── ...
   └── ...
   ```

   ## Module Descriptions

   | Module | File(s) | Responsibility |
   |---|---|---|
   | ... | ... | ... |

   ## Data Flow

   ```mermaid
   sequenceDiagram
       participant Client
       participant Router
       participant Service
       participant Repository
       Client->>Router: request
       Router->>Service: call
       Service->>Repository: query
       Repository-->>Service: result
       Service-->>Router: response
       Router-->>Client: HTTP response
   ```

   ## External Dependencies

   | Package | Version | Purpose |
   |---|---|---|
   | ... | ... | ... |

   ## Design Decisions
   - **<Decision>**: <Rationale>

   ## Open Risks
   - <Any technical uncertainty that could affect implementation>
   ```

4. **Write `orchestrator_tasks.md`**

   Write to `openspec/changes/<name>/orchestrator_tasks.md`:

   Rules for task decomposition:
   - Each task must be independently completable (no implicit dependencies on unfinished tasks)
   - Maximum granularity: a single task should touch at most 2–3 files
   - Order: dependencies first (base models → services → routes → tests → UI components)
   - Every task must reference the file it affects

   ```markdown
   # Implementation Checklist — <change-name>

   ## Phase A — Foundation
   - [ ] A1. Create `src/<module>/<file>` — <what it implements and why>
   - [ ] A2. ...

   ## Phase B — Core Logic
   - [ ] B1. Implement `<function/class>` in `src/<file>` — <behavior>
   - [ ] B2. ...

   ## Phase C — Delivery Layer
   - [ ] C1. Wire `<route/endpoint>` in `src/<router-file>` — <contract>
   - [ ] C2. ...

   ## Phase D — Tests
   - [ ] D1. Write `tests/<test-file>` covering Scenario 1 (happy path)
   - [ ] D2. Write edge-case tests for <scenario from spec.md>
   - [ ] D3. ...

   ## Phase E — Integration (if applicable)
   - [ ] E1. ...
   ```

5. **Self-review checklist**

   Before reporting, verify:
   - [ ] Every file in the layout has a clear, single responsibility
   - [ ] The Mermaid diagram compiles (no syntax errors)
   - [ ] Every scenario in `specs/spec.md` is covered by at least one task in Phase D
   - [ ] No task is larger than "implement one unit of behavior in one or two files"

6. **Report to Zugzbot**

   ```
   ## Planning Phase Complete

   **Change:** <change-name>
   **Artifacts written:**
   - openspec/changes/<name>/orchestrator_architecture.md
   - openspec/changes/<name>/orchestrator_tasks.md

   **Total tasks:** <n>
   **New files to create:** <n>
   **External dependencies added:** <list or "none">

   Fase 2 completada. Arquitectura y checklist listos para revisión del usuario.
   ```

**Guardrails**
- Never write source code — that belongs exclusively to sdd-implementer
- Never skip the Mermaid data-flow diagram — it is required for the documenter phase
- If the proposal has open questions, document them as risks in the architecture before proceeding
- Tasks must be ordered such that sdd-implementer can execute them top-to-bottom without blockers
- Do not invent dependencies — only include packages explicitly justified by the spec
