---
name: sdd-ui-design
description: Review and improve the frontend UI/UX of the implemented solution. Starts the dev server, takes screenshots, analyzes the interface against UX/UI best practices, applies targeted improvements, and generates a visual review report. Use after implementation is complete and a frontend is present.
license: MIT
compatibility: Requires a frontend project with a runnable dev server. Requires browser tool access.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Review and improve the frontend UI/UX of the implemented solution using visual perception.

**Input**: The name of the active change (kebab-case). If omitted, infer from context or prompt the user.

**Steps**

1. **Resolve the change name and read context**

   Read the following before doing anything:
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/orchestrator_architecture.md`
   - `src/` directory tree to identify frontend files

   Identify frontend indicators:
   - Framework files: `.jsx`, `.tsx`, `.vue`, `.svelte`, `.html`
   - Style files: `.css`, `.scss`, `.less`
   - `package.json` with frontend dependencies (react, vue, vite, next, etc.)

   **If no frontend is detected**: Stop and report to Zugzbot: "No frontend detected. Skipping Fase 3.5."

2. **Detect and start the dev server**

   Check `package.json` scripts for `dev`, `start`, or `serve`. Fall back to framework conventions:
   - Vite: `npx vite`
   - Next.js: `npm run dev`
   - Plain HTML: `python3 -m http.server 8080`

   ```bash
   <dev-command> &
   sleep 4
   ```

   Identify the local port from the command output or package.json config.
   If server fails to start, report the error and abort the phase.

3. **Capture initial screenshot**

   Navigate to `http://localhost:<port>` using the browser tool.
   Capture a screenshot of the current UI state. This is your **before** reference.

4. **Analyze the UI against UX/UI principles**

   Evaluate each of the following. Mark as ✅ ok / ⚠️ needs improvement / ❌ critical:

   | Principle | Check |
   |---|---|
   | Visual hierarchy | Is there a clear primary focal point? |
   | Typography scale | Consistent type sizes and weights? |
   | Color harmony | Curated palette? WCAG AA contrast? |
   | Spacing and rhythm | Consistent padding/margin? Room to breathe? |
   | Micro-animations | Hover states, transitions, loading feedback? |
   | Mobile-first layout | Works at narrow viewport? No overflow? |
   | Empty/error/loading states | Handled visually? |
   | Component consistency | Unified visual language across all elements? |

5. **Generate prioritized issue list**

   List up to 10 issues ordered by visual impact (critical → cosmetic).
   For each issue:
   - **Problem**: What's wrong and where
   - **File**: The file to change
   - **Fix**: Specific change to apply

6. **Apply improvements**

   Fix issues directly in `src/`. Rules:
   - Surgical edits only — do not rewrite entire components
   - Prefer CSS custom properties / design tokens over hardcoded values
   - Do not touch business logic, routing, or application state
   - After each round of changes, take a new screenshot to verify improvement

   Iterate at least twice. Stop when the UI reaches premium quality.

7. **Shut down the dev server cleanly**

   ```bash
   pkill -f "<dev-command-pattern>" 2>/dev/null || true
   ```

8. **Write `ui_review_report.md`**

   Write to `openspec/changes/<name>/ui_review_report.md`:

   ```markdown
   # UI Review Report — <change-name>

   ## Stack Detected
   <framework, dev command, port>

   ## Before / After
   <screenshots or description of visual delta>

   ## Issues Found & Resolved

   | # | Priority | Issue | File | Fix Applied |
   |---|---|---|---|---|
   | 1 | Critical | ... | ... | ... |

   ## UX/UI Principles Checklist
   - ✅ Visual hierarchy
   - ✅ Typography scale
   - ⚠️ Color harmony (improved)
   - ...

   ## Files Modified
   - `src/styles/main.css` — added CSS custom properties for color palette
   - `src/components/Button.jsx` — added hover transition and focus ring
   - ...
   ```

9. **Report to Zugzbot**

   ```
   ## UI Design Phase Complete

   **Change:** <change-name>
   **Issues found:** <n>  |  **Issues resolved:** <n>
   **Files modified:** <list>
   **Report:** openspec/changes/<name>/ui_review_report.md

   Fase 3.5 completada. UI revisada y mejorada. Lista para verificación.
   ```

**Guardrails**
- Never modify business logic, state management, or routing — visual layer only
- Never skip the screenshot step — visual perception is the core value of this phase
- If the dev server port conflicts, try the next common port (3000 → 3001 → 5173 → 8080)
- Always shut down the dev server before reporting completion
- If no frontend is detected, report immediately and do not proceed
- Functional bugs found during visual review go to Zugzbot as a note — do NOT fix them here
