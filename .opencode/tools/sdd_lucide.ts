import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// ============================================================================
// SDD Lucide Icons Tool
// ============================================================================
//
// Validacion batch de iconos de Lucide React. Antes vivia en sdd_design.ts
// (junto con tools de oh-my-design). Se independizo para que sobreviva a
// la remocion de oh-my-design (sigue siendo util para spec-writer cuando
// declara iconos en el contract.json).
//
// Fuentes de validacion (en orden de prioridad):
//   1. node_modules/lucide-react: introspeccion real de los exports del paquete
//   2. static_common_list: ~110 iconos mas usados como fallback rapido
//   3. pascal_case_fallback: cualquier PascalCase se asume valido
// ============================================================================

const getRoot = (context: any): string => {
  if (context?.directory && context.directory !== "/") return context.directory
  if (context?.worktree && context.worktree !== "/") return context.worktree
  if (context?.cwd && context.directory !== "/") return context.directory
  return process.cwd()
}

// Lista de iconos comunes como fallback cuando lucide-react no esta instalado
// (ej. durante F1 cuando todavia no se ha corrido el bootstrap del target).
const COMMON_ICONS = new Set([
  "Sun", "Moon", "Plus", "Trash2", "History", "Clock", "Calculator", "User", "Settings",
  "Home", "ChevronLeft", "ChevronRight", "ChevronUp", "ChevronDown", "Search", "X", "Check",
  "Edit", "Menu", "LogOut", "LogIn", "Lock", "Mail", "Phone", "MapPin", "Calendar", "Upload",
  "Download", "ExternalLink", "Eye", "EyeOff", "AlertCircle", "CheckCircle", "Info", "HelpCircle",
  "Bell", "Share2", "Copy", "File", "Folder", "Image", "Video", "Music", "Play", "Pause",
  "Server", "Database", "Terminal", "Code", "Grid", "List", "Filter", "Heart", "Star",
  "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "RefreshCw", "Send", "Activity", "Briefcase",
  "Camera", "Cloud", "Compass", "Cpu", "CreditCard", "DollarSign", "DownloadCloud", "Edit2", "Edit3",
  "FileText", "Gift", "Globe", "Hash", "Key", "Laptop", "Map", "MessageCircle", "MessageSquare",
  "Mic", "Monitor", "Package", "Paperclip", "Percent", "Power", "Printer", "Radio", "RotateCcw",
  "Save", "Scissors", "Shield", "ShoppingBag", "ShoppingCart", "Slider", "Sliders", "Smartphone",
  "Speaker", "Tablet", "Tag", "Target", "ThumbsUp", "ThumbsDown", "ToggleLeft", "ToggleRight",
  "Trash", "TrendingUp", "TrendingDown", "Truck", "Tv", "Type", "Umbrella", "Unlock", "UploadCloud",
  "Users", "Volume2", "VolumeX", "Wifi", "Wind", "Zap"
])

export const validate_lucide_icons_batch = tool({
  description:
    "Valida un lote de nombres de iconos de Lucide React. " +
    "Si el proyecto target tiene `lucide-react` instalado, introspecciona " +
    "los exports reales. Si no, usa una lista estatica de iconos comunes " +
    "(~110) o acepta cualquier PascalCase como fallback. " +
    "Util para que el spec-writer valide iconos antes de declararlos en " +
    "el contract.json (frontend.icons).",
  args: {
    icons: tool.schema
      .array(tool.schema.string())
      .describe("Lista de nombres de iconos a validar (ej: ['Sun', 'Moon', 'Plus']).")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const results: Record<string, { valid: boolean; source: string }> = {}

    let hasNodeModules = false
    let exportsList: Set<string> | null = null

    const lucidePath = path.resolve(root, "node_modules/lucide-react")
    if (fs.existsSync(lucidePath)) {
      try {
        const nodeScript = `
          const lucide = require('lucide-react');
          console.log(JSON.stringify(Object.keys(lucide)));
        `
        const output = execSync(
          `node -e "${nodeScript.replace(/"/g, '\\"')}"`,
          { cwd: root, stdio: "pipe" }
        ).toString()
        const keys = JSON.parse(output) as string[]
        exportsList = new Set(keys)
        hasNodeModules = true
      } catch (e) {
        // lucide-react instalado pero introspeccion fallo: cae a fallback
      }
    }

    for (const icon of args.icons) {
      if (hasNodeModules && exportsList) {
        results[icon] = {
          valid: exportsList.has(icon),
          source: "node_modules/lucide-react"
        }
      } else {
        const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(icon)
        const inCommon = COMMON_ICONS.has(icon)
        results[icon] = {
          valid: inCommon || isPascalCase,
          source: inCommon ? "static_common_list" : "pascal_case_fallback"
        }
      }
    }

    return JSON.stringify(
      {
        status: "SUCCESS",
        validatedAt: new Date().toISOString(),
        results
      },
      null,
      2
    )
  }
})
