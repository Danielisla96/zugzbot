# SDD Multi-Agent Orchestrated Project

This project enforces a strict **Spec-Driven Development (SDD)** lifecycle using a modular multi-agent system orchestrated by **Zugzbot**.

## 1. SDD Lifecycle (Mandatory Steps)

CRITICAL: Every feature, bug fix, or codebase change MUST go through the following four sequential phases. No "vibe coding" (direct coding without design/specs) is allowed.

1. **Phase 1: Specification (`sdd-proposer`)**
   - Must perform a technical interview with the user.
   - Generates the proposal under `openspec/changes/<change-name>/proposal.md`.
   - Generates behavior scenarios under `openspec/changes/<change-name>/specs/spec.md` (Given / When / Then).

2. **Phase 2: Planning & Architecture (`sdd-planner`)**
   - Designs modular interfaces and details them under `openspec/changes/<change-name>/orchestrator_architecture.md`.
   - Breaks implementation into independent, atomic tasks in `openspec/changes/<change-name>/orchestrator_tasks.md` with checklist checkboxes `- [ ]`.

3. **Phase 3: Implementation (`sdd-implementer`)**
   - Modifies files in `src/` sequentially based on the checklist.
   - Marks each task completed (`- [ ]` -> `- [x]`) in `orchestrator_tasks.md` after implementation.

4. **Phase 4: Verification & Testing (`sdd-verifier`)**
   - Writes automated tests under `tests/` or component test files.
   - Runs linters and test suites using `bash` and fixes any failures before signing off.

---

## 2. Core Code Standards

- **SOLID Principles**: Keep components cohesive, single-responsibility, and loosely coupled.
- **Clean Code**: Self-documenting code, descriptive variable and function names, and graceful error handling. No placeholders or "TODO" comments in production-ready files.
- **Strict Typing**: Use strict type definitions in TypeScript. No redundant `any` declarations.
- **Test-Driven / Checked**: All behaviors specified in `spec.md` must have matching automated verification cases.
