import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

export default tool({
  description: "Obtiene el estado unificado del ciclo SDD y un resumen de las categorías del Brain.",
  args: {},
  async execute(args, context) {
    const root = getRoot(context)
    const statePath = path.resolve(root, ".openspec/sdd_state.json")
    const brainPath = path.resolve(root, ".openspec/brain.md")

    let sddState = {
      phase: "F0_DETECT",
      activeContract: "",
      stack: { core: [], databases: [] },
      loopMode: false,
      loopTargetIterations: 1,
      loopCurrentIteration: 1,
      rollbackCount: 0,
      updatedAt: ""
    }

    if (fs.existsSync(statePath)) {
      try {
        sddState = JSON.parse(fs.readFileSync(statePath, "utf8"))
      } catch (e) {
        // ignore parsing errors
      }
    }

    const availableCategories: Record<string, { entriesCount: number, preview: string }> = {}
    let brainTitle = "Zugzbot Brain - Memory and Learnings"
    let brainExists = false

    if (fs.existsSync(brainPath)) {
      brainExists = true
      try {
        const content = fs.readFileSync(brainPath, "utf8") || ""
        const lines = content.split(/\r?\n/)
        let startIndex = 0
        if (lines.length > 0 && lines[0] && lines[0].startsWith("# ")) {
          brainTitle = lines[0].substring(2).trim()
          startIndex = 1
        }

        const sections: Record<string, string[]> = {}
        let currentHeader = ""

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i]
          if (line === undefined || line === null) continue
          if (line.startsWith("# ")) {
            currentHeader = line.substring(2).trim().toLowerCase()
            sections[currentHeader] = []
          } else if (line.trim().length > 0 && currentHeader) {
            sections[currentHeader].push(line)
          }
        }

        for (const [key, valLines] of Object.entries(sections)) {
          const entriesCount = valLines.filter(l => l.startsWith("- ")).length
          const preview = valLines.slice(-2).join("\n") || "(Sección vacía)"
          availableCategories[key] = {
            entriesCount,
            preview
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const output = {
      sdd_state: sddState,
      brain: {
        exists: brainExists,
        title: brainTitle,
        categories: availableCategories
      }
    }

    return JSON.stringify(output, null, 2)
  }
})
