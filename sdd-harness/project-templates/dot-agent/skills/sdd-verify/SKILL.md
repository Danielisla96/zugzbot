---
name: sdd-verify
description: Validate the implemented change through static analysis, automated tests, and live integration verification. Produces a formal verification_report.md. Use after sdd-implement (or sdd-ui-design if a frontend is present) is approved.
license: MIT
compatibility: Requires bash access to run linters, test suites, and a local server. Read/write access to openspec/ and tests/ is required.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Validate the implemented change and produce a formal verification report.

**Input**: The name of the active change (kebab-case). If omitted, infer from context or prompt the user.

**Steps**

1. **Read all context before running anything**

   Read in order:
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/specs/spec.md`
   - `openspec/changes/<name>/orchestrator_tasks.md` (to confirm all tasks are `- [x]`)
   - `src/` directory tree (to understand what was actually implemented)

   If any task in `orchestrator_tasks.md` is still `- [ ]`, STOP and report to Zugzbot before continuing.

2. **Static quality gate**

   Run linters and syntax checks appropriate to the project stack:

   ```bash
   # Python
   python -m py_compile src/**/*.py
   ruff check src/ || flake8 src/

   # JavaScript / TypeScript
   npx eslint src/ --ext .js,.ts,.jsx,.tsx

   # Other stacks: adapt to project conventions
   ```

   If any static error is found:
   - Document each error with file path, line number, and message
   - Report to Zugzbot immediately with the error list
   - Do NOT proceed to test execution

3. **Write the test suite**

   Create or update files under `tests/` with a BDD-aligned structure:

   Rules:
   - One test function per scenario defined in `specs/spec.md` — strict 1:1 mapping
   - Each test function must have a comment referencing the exact scenario it covers
   - Include at minimum: happy path, one error/failure case, and two boundary/edge cases
   - Test names must be descriptive: `test_<scenario>_<condition>_<expected_result>`

   ```python
   # Example structure (Python/pytest)
   def test_create_user_valid_payload_returns_201():
       """Scenario 1 — Happy path: valid user creation"""
       ...

   def test_create_user_missing_email_returns_422():
       """Scenario 2 — Missing required field"""
       ...
   ```

4. **Run the test suite**

   ```bash
   pytest tests/ -v --tb=short
   ```

   - If all tests pass: proceed to Step 5
   - If any test fails:
     1. Capture the full failure output
     2. Write it to `openspec/changes/<name>/failure_log.md`
     3. Report to Zugzbot with the structured failure log so sdd-implementer is reactivated
     4. Do NOT proceed to integration verification

5. **Integration verification (live server)**

   Start the local server in background:

   ```bash
   # Python
   uvicorn src.app.main:app --reload --port 8000 &
   sleep 3

   # Node.js
   npm run dev &
   sleep 4
   ```

   For each endpoint or function defined in `specs/spec.md`, run a real HTTP call:

   ```bash
   curl -s -X POST http://localhost:8000/<endpoint> \
     -H "Content-Type: application/json" \
     -d '{"key": "value"}' | python3 -m json.tool
   ```

   Capture:
   - The exact curl command used
   - The full HTTP response (status code + body)
   - Whether the response matches the expected outcome in `specs/spec.md`

   Shut down the server cleanly after all calls:

   ```bash
   pkill -f "uvicorn\|npm run dev" 2>/dev/null || true
   ```

6. **Write `verification_report.md`**

   Write to `openspec/changes/<name>/verification_report.md`:

   ```markdown
   # Verification Report — <change-name>

   ## Summary
   | Gate | Result |
   |---|---|
   | Static analysis | ✅ Pass / ❌ Fail |
   | Test suite | ✅ Pass (<n> tests) / ❌ Fail (<n> failures) |
   | Integration (live) | ✅ Pass / ❌ Fail |

   ## Static Analysis
   <Output of linter run or "No issues found.">

   ## Test Suite Results
   ```
   <Full pytest -v output>
   ```

   ## Integration Verification

   ### Endpoint: <METHOD> /<path>
   **Request:**
   ```bash
   curl -s -X <METHOD> http://localhost:<port>/<path> \
     -H "Content-Type: application/json" \
     -d '<payload>'
   ```
   **Response (HTTP <status>):**
   ```json
   <response body>
   ```
   **Result:** ✅ Matches spec / ❌ Deviation: <description>

   <!-- Repeat for each endpoint -->

   ## Conclusion
   <"All verification gates passed. Ready for documentation phase." OR "Failures found — see failure_log.md.">
   ```

7. **Report to Zugzbot**

   ```
   ## Verification Phase Complete

   **Change:** <change-name>
   **Static analysis:** ✅ / ❌
   **Tests:** <n> passed / <n> failed
   **Integration:** ✅ / ❌
   **Report:** openspec/changes/<name>/verification_report.md

   Fase 4 completada. Suite de pruebas y verificación en verde. Lista para documentación.
   ```

**Guardrails**
- Never modify source code in `src/` — fixes belong exclusively to sdd-implementer
- Never skip the live integration step — a passing test suite does not substitute for a real HTTP call
- Never proceed to documentation if any gate fails — report to Zugzbot and wait for sdd-implementer to heal the code
- Always shut down the local server before reporting — leaving it running blocks subsequent runs
- The `verification_report.md` must contain real output, not fabricated — if a call fails, report the actual error
