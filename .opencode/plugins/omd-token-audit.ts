import { type Plugin } from "@opencode-ai/plugin"
import path from "path"

const HEX_RE = /#[0-9a-fA-F]{6}\b/
const RGB_RE = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/
const INLINE_STYLE_COLOR_RE = /style\s*=\s*\{\{[^}]*(backgroundColor|color|borderColor|fill|stroke)\s*:/
const ALLOWED_PATH_RE = /(globals\.css|tailwind\.config|@theme|theme\.css|design-tokens)/i
const TSX_TARGET_RE = /\.(tsx|jsx|ts|js)$/

const findViolations = (text: string): string[] => {
  const hits: string[] = []
  if (HEX_RE.test(text)) hits.push("hex literal (#rrggbb) — use token from DESIGN.md (e.g. bg-primary, text-muted)")
  if (RGB_RE.test(text)) hits.push("rgb() literal — use semantic Tailwind class (bg-card, text-foreground)")
  if (INLINE_STYLE_COLOR_RE.test(text)) hits.push("inline color/background style={{...}} — use Tailwind class")
  return hits
}

const extractWriteContent = (args: any): string => {
  if (!args) return ""
  if (typeof args.content === "string") return args.content
  if (typeof args.contents === "string") return args.contents
  if (typeof args.text === "string") return args.text
  if (typeof args.new_string === "string") return args.new_string
  if (typeof args.newString === "string") return args.newString
  if (typeof args.fileText === "string") return args.fileText
  if (typeof args.body === "string") return args.body
  if (typeof args.input === "string") return args.input
  if (Array.isArray(args.edits)) {
    return args.edits.map((e: any) => e?.new_string || e?.newString || e?.content || "").join("\n")
  }
  return ""
}

export const OmdTokenAudit: Plugin = async ({ project, client, directory, worktree }) => {
  const root = worktree || directory || process.cwd()
  return {
    "tool.execute.after": async (input, output) => {
      if (!["write", "edit", "patch", "apply"].includes(input.tool)) return

      const filePath = String(input.args?.filePath || input.args?.path || input.args?.file || "")
      if (!filePath) return
      if (ALLOWED_PATH_RE.test(filePath)) return
      if (!TSX_TARGET_RE.test(filePath)) return

      const content = extractWriteContent(input.args) || String(output?.output || "")
      if (!content) return

      const violations = findViolations(content)
      if (violations.length === 0) return

      const rel = path.relative(root, filePath)
      const summary = `omd-token-audit: ${violations.length} violation(s) in ${rel}`
      await client.app
        .log({
          body: {
            service: "omd-token-audit",
            level: "warn",
            message: summary,
            extra: { file: rel, violations },
          },
        })
        .catch(() => {})

      const note = `\n\n⚠️ [omd-token-audit] ${violations.join(" | ")}\n   → file: ${rel}\n   → fix: use semantic Tailwind class (bg-primary, bg-card, text-foreground) per DESIGN.md, or use \`omd:apply\` skill to resolve tokens.\n   → this is advisory; the write succeeded. Re-run omd:apply or edit manually if intentional.`
      output.output = `${output.output ?? ""}${note}`
    },
  }
}
