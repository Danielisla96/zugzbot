import type { Plugin } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export const SddCorePlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      const projectRoot = worktree || directory;
      const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
      const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
      const activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);

      let lockInfo = "No active change or SDD phase detected.";
      if (activeLockPath) {
        try {
          const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"));
          lockInfo = `
### SDD SWARM ACTIVE STATUS (DO NOT FORGET)
- Active Change: \`${lockObj.change_name || "Ninguno"}\`
- Active Phase: \`${lockObj.active_phase ?? 0}\` (@${lockObj.active_subagent || "sdd-planner"})
- Status: \`${lockObj.status || "idle"}\`
- Iteration: \`${lockObj.iteration || 0}\`
- Last Updated: \`${lockObj.last_updated || ""}\`
`;
        } catch (e) {}
      }

      // 1. Inyectar estado activo en el contexto de compactación para preservar memoria metodológica
      output.context.push(lockInfo);

      // 2. Personalizar el prompt de compactación para recortar logs redundantes de terminal
      output.prompt = `
You are generating a highly condensed continuation prompt for an active Spec-Driven Development (SDD) multi-agent session.

To maximize token savings and avoid long latency, you MUST:
1. Summarize any long command terminal output, compiler errors, or test logs into a single high-density line (e.g., "[Linter: 3 syntax errors resolved in auth.ts]" or "[Vitest: 12 tests passed, 0 failed in 1.2s]"). Do NOT repeat full traceback logs.
2. Keep the current task status, active file modifications, and direct goals in a concise, bulleted list.
3. Keep the active SDD phase and change name verbatim.
4. Keep the overall continuation prompt extremely brief (under 15 lines if possible).
`;
    }
  }
}

export default SddCorePlugin;
