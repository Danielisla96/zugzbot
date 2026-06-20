import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

// Curated subset of brands with HTML+CSS interactive previews.
export const RECOMMENDED_BRANDS: Record<string, { id: string; name: string; category: string; vibe: string }[]> = {
  saas: [
    { id: "supabase", name: "Supabase", category: "saas", vibe: "Open-source Firebase alternative, dark-mode-first, dense data UI" },
    { id: "linear.app", name: "Linear", category: "saas", vibe: "Issue tracking premium, ultra-fast keyboard-first, monochrome" },
    { id: "vercel", name: "Vercel", category: "saas", vibe: "Vercel/Next.js native, mono+geist font, gradient accents" },
    { id: "raycast", name: "Raycast", category: "saas", vibe: "Productivity launcher, sharp corners, command-bar UX" },
    { id: "posthog", name: "PostHog", category: "saas", vibe: "Product analytics, orange accent, fun playful tone" },
  ],
  fintech: [
    { id: "stripe", name: "Stripe", category: "fintech", vibe: "Premium payments, gradient brand, dense docs" },
    { id: "revolut", name: "Revolut", category: "fintech", vibe: "Neobank, dark+violet, large numbers" },
    { id: "wise", name: "Wise", category: "fintech", vibe: "Cross-border money, bright green, friendly tone" },
    { id: "toss", name: "Toss", category: "fintech", vibe: "Korean super-app, blue primary, imperative microcopy" },
  ],
  ecommerce: [
    { id: "airbnb", name: "Airbnb", category: "ecommerce", vibe: "Travel marketplace, coral accent, photographic" },
    { id: "apple", name: "Apple", category: "ecommerce", vibe: "Hardware store, ultra-minimal, SF Pro typography" },
    { id: "nike", name: "Nike", category: "ecommerce", vibe: "Athletic brand, black+volt, UPPERCASE bold, flat" },
    { id: "shopify", name: "Shopify", category: "ecommerce", vibe: "E-commerce platform, green primary, merchant-focused" },
  ],
  consumer: [
    { id: "spotify", name: "Spotify", category: "consumer", vibe: "Music streaming, green+dark, immersive cards" },
    { id: "figma", name: "Figma", category: "consumer", vibe: "Design tool, multi-color, playful professional" },
    { id: "notion", name: "Notion", category: "consumer", vibe: "Productivity, minimal, document-first" },
  ],
}

// Tool: sdd_select_design
export const select_design = tool({
  description: "Copia fielmente el archivo DESIGN.md y ejemplos de la marca a .openspec/",
  args: {
    brandId: tool.schema.string().describe("ID exacto del diseño en oh-my-design (ej: 'linear.app', 'vercel', 'stripe')")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const brandId = args.brandId.trim()
    const sourceDir = path.resolve(root, ".opencode/oh-my-design/design-md", brandId)

    if (!fs.existsSync(sourceDir)) {
      // Try resolving with substring match if not found exactly
      const catalogDir = path.resolve(root, ".opencode/oh-my-design/design-md")
      if (fs.existsSync(catalogDir)) {
        const brands = fs.readdirSync(catalogDir)
        const match = brands.find(b => b.toLowerCase() === brandId.toLowerCase() || b.toLowerCase().includes(brandId.toLowerCase()))
        if (match && match !== brandId) {
          return selectDesignHelper(match, context)
        }
      }
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el directorio de diseño para la marca "${brandId}" en ${sourceDir}`
      }, null, 2)
    }

    return selectDesignHelper(brandId, context)
  }
})

// Helper extracted to allow substring-match recursion without `this.execute` typing issues.
async function selectDesignHelper(brandId: string, context: any) {
    const root = getRoot(context)
    const sourceDir = path.resolve(root, ".opencode/oh-my-design/design-md", brandId)
    const targetDir = path.resolve(root, ".openspec")

    if (!fs.existsSync(sourceDir)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el directorio de diseño para la marca "${brandId}" en ${sourceDir}`
      }, null, 2)
    }

    // 1. Copy accompanying files (HTML previews, README, DESIGN.md, etc.) to a brand subfolder in .openspec
    const targetBrandDir = path.join(targetDir, "design-assets", brandId)
    if (!fs.existsSync(targetBrandDir)) {
      fs.mkdirSync(targetBrandDir, { recursive: true })
    }

    const copiedFiles: string[] = []
    const sourceDesign = path.join(sourceDir, "DESIGN.md")
    if (!fs.existsSync(sourceDesign)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró el archivo DESIGN.md en la ruta origen: ${sourceDesign}`
      }, null, 2)
    }

    const files = fs.readdirSync(sourceDir)
    for (const file of files) {
      if (file.startsWith(".")) continue
      const srcFile = path.join(sourceDir, file)
      const dstFile = path.join(targetBrandDir, file)
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, dstFile)
        copiedFiles.push(file)
      }
    }

    // 2. Overwrite .openspec/DESIGN.md so that opencode.json static references always resolve and agents get the active design guidelines
    const legacyDesign = path.join(targetDir, "DESIGN.md")
    try {
      fs.copyFileSync(sourceDesign, legacyDesign)
    } catch (e) {
      /* ignore */
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: `Diseño "${brandId}" copiado a la ruta canónica .openspec/design-assets/${brandId}/ y actualizado en .openspec/DESIGN.md`,
      copiedFiles,
      designAssetsDir: path.relative(root, targetBrandDir),
      canonicalDesignPath: path.relative(root, path.join(targetBrandDir, "DESIGN.md")),
    }, null, 2)
}

// Tool: sdd_list_design_recommendations
export const list_design_recommendations = tool({
  description: "Devuelve una lista curada de marcas de diseño recomendadas.",
  args: {
    use_case: tool.schema.enum(["saas", "fintech", "ecommerce", "consumer", "all"]).default("all").describe("Categoría del proyecto para filtrar marcas relevantes"),
    max_per_category: tool.schema.number().default(3).describe("Máximo de marcas a devolver por categoría"),
  },
  async execute(args, context) {
    const useCase = args.use_case
    const maxPer = Math.max(1, Math.min(args.max_per_category || 3, 6))

    if (useCase === "all") {
      const result: Record<string, any[]> = {}
      for (const cat of Object.keys(RECOMMENDED_BRANDS)) {
        result[cat] = RECOMMENDED_BRANDS[cat].slice(0, maxPer)
      }
      return JSON.stringify({
        status: "SUCCESS",
        message: `Recomendaciones de diseño curadas (top ${maxPer} por categoría)`,
        recommendations: result,
        note: "Estas marcas tienen preview.html/preview-dark.html en .opencode/oh-my-design/design-md/. Para marcas adicionales usa oh-my-design_list_references.",
      }, null, 2)
    }

    const list = RECOMMENDED_BRANDS[useCase] || []
    return JSON.stringify({
      status: "SUCCESS",
      message: `Recomendaciones de diseño para use_case="${useCase}"`,
      recommendations: { [useCase]: list.slice(0, maxPer) },
      note: "Estas marcas tienen preview.html/preview-dark.html en .opencode/oh-my-design/design-md/.",
    }, null, 2)
  }
})

// Tool: sdd_apply_brand_tokens
export const apply_brand_tokens = tool({
  description: "Inyecta tokens de diseño de marca en src/app/globals.css.",
  args: {
    tokens: tool.schema.string().describe("JSON stringificado con {colors: {...}, typography: {...}, radius: {...}} extraído de contract.json design.tokens"),
  },
  async execute(args, context) {
    const root = getRoot(context)
    const globalsPath = path.resolve(root, "src/app/globals.css")

    if (!fs.existsSync(globalsPath)) {
      return JSON.stringify({
        status: "ERROR",
        message: `No se encontró src/app/globals.css. Ejecuta primero el bootstrap de nextjs-shadcn.`,
      }, null, 2)
    }

    let brandTokens: any
    try {
      brandTokens = JSON.parse(args.tokens)
    } catch (e) {
      return JSON.stringify({
        status: "ERROR",
        message: `tokens no es JSON válido: ${(e as Error).message}`,
      }, null, 2)
    }

    const colors = brandTokens.colors || {}
    const typography = brandTokens.typography?.family || {}
    const radius = brandTokens.radius || {}

    // Build the brand CSS variables block. Preserves shadcn vars.
    const brandVarLines: string[] = []
    for (const [k, v] of Object.entries(colors)) {
      const safeName = String(k).replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()
      brandVarLines.push(`  --color-brand-${safeName}: ${v};`)
    }
    if (typography.sans) {
      brandVarLines.push(`  --font-sans: ${typography.sans};`)
      brandVarLines.push(`  --font-heading: ${typography.sans};`)
    }
    for (const [k, v] of Object.entries(radius)) {
      brandVarLines.push(`  --radius-${k}: ${v}px;`)
    }

    const brandBlock = `/* Brand tokens (injected by sdd_apply_brand_tokens) */
@theme inline {
${brandVarLines.join("\n")}
}
`

    let css = fs.readFileSync(globalsPath, "utf8")

    // Remove any previous brand block to keep this idempotent.
    css = css.replace(/\/\* Brand tokens[\s\S]*?\}\s*\n/g, "")

    // Append at the end. Existing shadcn @theme inline block remains untouched.
    css = css.trimEnd() + "\n\n" + brandBlock

    fs.writeFileSync(globalsPath, css, "utf8")

    return JSON.stringify({
      status: "SUCCESS",
      message: `Inyectados ${brandVarLines.length} tokens de marca en src/app/globals.css (preservando variables shadcn)`,
      globalsPath: path.relative(root, globalsPath),
      brandVariables: brandVarLines.length,
    }, null, 2)
  }
})

// Tool: sdd_validate_lucide_icons_batch
export const validate_lucide_icons_batch = tool({
  description: "Valida un lote de nombres de iconos de Lucide React de forma rápida.",
  args: {
    icons: tool.schema.array(tool.schema.string()).describe("Lista de nombres de iconos a validar (ej: ['Sun', 'Moon', 'Plus'])"),
  },
  async execute(args, context) {
    const root = getRoot(context)
    const results: Record<string, { valid: boolean; source: string }> = {}
    
    // Lista de iconos comunes como fallback
    const commonIcons = new Set([
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

    let hasNodeModules = false
    let exportsList: Set<string> | null = null

    // Intentar buscar lucide-react en node_modules
    const lucidePath = path.resolve(root, "node_modules/lucide-react")
    if (fs.existsSync(lucidePath)) {
      try {
        const nodeScript = `
          const lucide = require('lucide-react');
          console.log(JSON.stringify(Object.keys(lucide)));
        `
        const output = execSync(`node -e "${nodeScript.replace(/"/g, '\\"')}"`, { cwd: root, stdio: "pipe" }).toString()
        const keys = JSON.parse(output)
        exportsList = new Set(keys)
        hasNodeModules = true
      } catch (e) {
        // Fallback
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
        const inCommon = commonIcons.has(icon)
        results[icon] = {
          valid: inCommon || isPascalCase,
          source: inCommon ? "static_common_list" : "pascal_case_fallback"
        }
      }
    }

    return JSON.stringify({
      status: "SUCCESS",
      validatedAt: new Date().toISOString(),
      results
    }, null, 2)
  }
})
