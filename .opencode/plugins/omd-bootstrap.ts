import { type Plugin } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

const CATALOG_DIR = process.env.OMD_CATALOG_DIR || ".opencode/data"
const INIT_CONTEXT_FILE = ".omd/init-context.json"
const DESIGN_FILE = "DESIGN.md"

type InitContext = {
  reference_id: string
  description: string
  bootstrapped_at: string
}

const state = {
  catalogOK: false,
  initContext: null as InitContext | null,
  designExists: false,
  bootMessage: "" as string,
}

const readInitContext = (root: string): InitContext | null => {
  const p = path.resolve(root, INIT_CONTEXT_FILE)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"))
  } catch {
    return null
  }
}

const ensureCatalog = async ($: any, root: string): Promise<boolean> => {
  const refsDir = path.resolve(root, CATALOG_DIR, "references")
  if (fs.existsSync(refsDir) && fs.readdirSync(refsDir).length > 50) return true
  try {
    await $`npx --yes oh-my-design-cli@latest install-skills --all --force --agent opencode`.quiet()
    return fs.existsSync(refsDir) && fs.readdirSync(refsDir).length > 50
  } catch {
    return false
  }
}

export const OmdBootstrap: Plugin = async ({ project, client, $, directory, worktree }) => {
  const root = worktree || directory || process.cwd()
  state.initContext = readInitContext(root)
  state.designExists = fs.existsSync(path.resolve(root, DESIGN_FILE))
  state.catalogOK = await ensureCatalog($, root)
  state.bootMessage = state.catalogOK
    ? `[omd-bootstrap] OMD catalog OK at ${CATALOG_DIR}/references/ (${fs.readdirSync(path.resolve(root, CATALOG_DIR, "references")).length} refs)${state.initContext ? ` · active brand: ${state.initContext.reference_id}` : " · no active brand"}`
    : `[omd-bootstrap] ⚠ OMD catalog MISSING at ${CATALOG_DIR}/references/ — run \`npx oh-my-design-cli install-skills --all --force\``

  if (state.catalogOK) {
    await client.app
      .log({
        body: { service: "omd-bootstrap", level: "info", message: state.bootMessage },
      })
      .catch(() => {})
  }

  return {
    "experimental.session.compacting": async (_input, output) => {
      const reminders: string[] = []
      if (state.initContext) {
        reminders.push(
          `Active OMD brand: \`${state.initContext.reference_id}\` (bootstrapped ${state.initContext.bootstrapped_at}).`,
        )
        reminders.push(
          `Apply DESIGN.md tokens (canonical source: \`${CATALOG_DIR}/references/${state.initContext.reference_id}/DESIGN.md\`). Use omd:apply skill per component.`,
        )
      } else if (!state.designExists) {
        reminders.push(
          `No DESIGN.md and no .omd/init-context.json. Before implementing UI: invoke the \`omd:init\` skill. It loads \`${CATALOG_DIR}/reference-fingerprints.json\`, scores 246 references, and writes a canonical DESIGN.md.`,
        )
      } else {
        reminders.push(
          `DESIGN.md exists but no .omd/init-context.json — the \`omd:apply\` skill will still load DESIGN.md correctly.`,
        )
      }
      const list = reminders.map((r) => `- ${r}`).join("\n")
      output.context.push(`\n## OMD bootstrap context\n${list}\n`)
    },

    "tool.execute.after": async (input, output) => {
      if (!["write", "edit"].includes(input.tool)) return
      const filePath = String(input.args?.filePath || "")
      if (!filePath) return

      if (path.resolve(root, filePath) === path.resolve(root, DESIGN_FILE)) {
        state.designExists = true
        state.bootMessage = `[omd-bootstrap] DESIGN.md created/updated · re-run omd:init to regenerate .omd/init-context.json`
        await client.app
          .log({ body: { service: "omd-bootstrap", level: "info", message: state.bootMessage } })
          .catch(() => {})
      }
      if (path.resolve(root, filePath) === path.resolve(root, INIT_CONTEXT_FILE)) {
        state.initContext = readInitContext(root)
        await client.app
          .log({
            body: {
              service: "omd-bootstrap",
              level: "info",
              message: `[omd-bootstrap] init-context reloaded · brand=${state.initContext?.reference_id || "?"}`,
            },
          })
          .catch(() => {})
      }
    },
  }
}
