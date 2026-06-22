import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

// ============================================================================
// SDD Catalog Tool - Multi-Registry shadcn Block/Component Browser
// ============================================================================
//
// Catalogo unificado de bloques y componentes para shadcn UI. Indexa y
// resuelve items de multiples registries externos con cache local:
//
//   - shadcn:     https://shadcnui-blocks.com (akash3444/shadcn-ui-blocks)
//                 Componentes y bloques Radix-curados por Akash (TTL 7d).
//                 Fuente: GitHub Contents API sobre /public/r/radix.
//   - basecn:     https://basecn.dev (akash3444/basecn)
//                 Fork Base UI de los mismos bloques (TTL 7d).
//                 Fuente: GitHub Contents API sobre /public/r/basecn.
//   - reactbits:  https://reactbits.dev  (David Haz)
//                 134 primitivas animadas x 4 variantes (JS-CSS / JS-TW /
//                 TS-CSS / TS-TW) = 536 items. Fuente: /r/registry.json
//                 oficial shadcn-compatible. Default variant para el stack
//                 Next.js 16 + Tailwind v4 es TS-TW. TTL 1d.
//   - blocks-so:  https://blocks.so (ephraimduncan/blocks)
//                 60+ bloques Radix prod-ready organizados en 11 categorias
//                 (stats, login, form-layout, file-upload, tables, dialogs,
//                 command-menu, sidebar, onboarding, ai, grid-list). Cada
//                 bloque incluye `categories[]` explicito en el JSON.
//                 Fuente: GitHub Contents API sobre /content/components.
//                 Default para forms/stats/tables/file-upload/dialogs/login/
//                 command-menu/onboarding/ai/grid-list. TTL 7d.
//
// Cache local:
//   - .openspec/cache/shadcn-index.json
//   - .openspec/cache/basecn-index.json
//   - .openspec/cache/reactbits-index.json
//   - .openspec/cache/blocks-so-index.json
//   - .openspec/cache/blocks/<registry>/[<author>/]<name>.json
//
// Registries configurables via env:
//   - SDD_CATALOG_TTL_DAYS_AKASH      (default 7)
//   - SDD_CATALOG_TTL_DAYS_BASECN     (default 7)
//   - SDD_CATALOG_TTL_DAYS_REACTBITS  (default 1)
//   - SDD_CATALOG_TTL_DAYS_BLOCKSSO   (default 7)
//
// Tools exportadas (prefijo opencode = "sdd_catalog_<export>"):
//   - list_blocks    Lista componentes/bloques por registry, categoria, query.
//   - get_block      Obtiene codigo fuente + dependencias + install_command.
//   - warm_index     Pre-calienta los indices locales (idempotente, TTL-aware).
//
// Naming del parametro `name` para get_block:
//   - shadcn/basecn:  "hero-06", "sidebar-07", etc.
//   - reactbits:      "Dither" (base, resuelve a Dither-TS-TW por default)
//                     "Dither-JS-CSS" (variante canonica completa)
//                     "https://reactbits.dev/r/Dither-TS-TW.json" (URL directa)
//   - blocks-so:      "stats-01", "login-03", "form-layout-02", etc.
//                     "https://blocks.so/r/stats-01.json" (URL directa)
// ============================================================================

// ---------------------------------------------------------------------------
// Akash (shadcn-ui-blocks)
// ---------------------------------------------------------------------------
const AKASH_REPO = "akash3444/shadcn-ui-blocks"
const AKASH_API = `https://api.github.com/repos/${AKASH_REPO}/contents/public/r/radix`
const AKASH_RAW = (name: string) =>
  `https://raw.githubusercontent.com/${AKASH_REPO}/main/public/r/radix/${name}.json`
const AKASH_INSTALL = (name: string) =>
  `https://shadcnui-blocks.com/r/radix/${name}.json`
const AKASH_TTL_DAYS = Number(process.env.SDD_CATALOG_TTL_DAYS_AKASH || 7)

// ---------------------------------------------------------------------------
// Basecn (akash3444/basecn)
// ---------------------------------------------------------------------------
const BASECN_REPO = "akash3444/basecn"
const BASECN_API = `https://api.github.com/repos/${BASECN_REPO}/contents/public/r`
const BASECN_RAW = (name: string) =>
  `https://raw.githubusercontent.com/${BASECN_REPO}/main/public/r/${name}.json`
const BASECN_INSTALL = (name: string) =>
  `https://basecn.dev/r/${name}.json`
const BASECN_TTL_DAYS = Number(process.env.SDD_CATALOG_TTL_DAYS_BASECN || 7)

// ---------------------------------------------------------------------------
// reactbits.dev (David Haz)
// ---------------------------------------------------------------------------
const REACTBITS_HOME = "https://reactbits.dev"
const REACTBITS_CATALOG = "https://reactbits.dev/r/registry.json"
const REACTBITS_RAW = (name: string) => `${REACTBITS_HOME}/r/${name}.json`
const REACTBITS_INSTALL = (name: string) => `${REACTBITS_HOME}/r/${name}.json`
const REACTBITS_PREVIEW = (baseName: string) => `${REACTBITS_HOME}/${baseName}`
const REACTBITS_TTL_DAYS = Number(process.env.SDD_CATALOG_TTL_DAYS_REACTBITS || 1)

// Las 4 variantes que reactbits publica por cada componente base.
const REACTBITS_VARIANTS = ["JS-CSS", "JS-TW", "TS-CSS", "TS-TW"] as const
type ReactBitsVariant = (typeof REACTBITS_VARIANTS)[number]
const DEFAULT_REACTBITS_VARIANT: ReactBitsVariant = "TS-TW"

// Sufijos reconocibles al final de un name canónico de reactbits
const REACTBITS_VARIANT_SUFFIX_RE = /-(JS-CSS|JS-TW|TS-CSS|TS-TW)$/

// Mapa curado de las bases mas populares de reactbits.dev organizadas por
// categoria de uso. La categoria se infiere por membership; si la base no
// esta en el mapa, cae en "misc" pero el query/substring sigue funcionando.
const REACTBITS_POPULAR_BY_CATEGORY: Record<string, string[]> = {
  backgrounds: [
    "Aurora", "Beams", "ColorBends", "DarkVeil", "Dither", "FlickeringGrid",
    "GradualBlur", "GridDistortion", "GridMotion", "Hyperspeed", "Iridescence",
    "LightRays", "Lightning", "LiquidChrome", "MetaBalls", "Noise", "Orb",
    "Particles", "PixelSnow", "Silk", "Squares", "StarField", "Strands",
    "Threads", "Vortex", "Waves"
  ],
  text: [
    "ASCIIText", "BlurText", "CircularText", "CountUp", "Counter", "CurvedLoop",
    "DecryptedText", "FuzzyText", "GlitchText", "GradientText", "RotatingText",
    "ScrambledText", "ShinyText", "TextPressure", "TextTrail", "Typewriter"
  ],
  cards: [
    "BounceCards", "CardSwap", "DecayCard", "DraggableCard", "ExpandingCards",
    "FlipCard", "FluidGlass", "GlareHover", "HoloCard", "MagicBento",
    "Masonry", "SpotlightCard", "Stack", "TiltedCard"
  ],
  navigation: [
    "BubbleMenu", "CardNav", "FloatingDock", "FluidMenu", "GooeyNav",
    "MagnetLines", "PillNav", "StaggeredMenu", "Stepper"
  ],
  buttons: [
    "BounceButton", "ClickSpark", "MagneticButton", "RainbowButton", "StarBorder"
  ],
  animations: [
    "AnimatedContent", "AnimatedList", "AnimatedPin", "FadeContent",
    "ScrollFloat", "ScrollReveal", "TrueFocus", "VariableProximity"
  ],
  cursors: [
    "BlobCursor", "Crosshair", "GhostCursor", "ImageTrail",
    "PixelTrail", "SplashCursor", "TextCursor"
  ],
  misc: [
    "Antigravity", "Balatro", "Ballpit", "ChromaGrid", "CircularGallery",
    "ElectricBorder", "Magnet", "MetallicPaint", "ShapeBlur", "StickerPeel"
  ]
}

// Construye el mapa inverso: base name -> categoria
const REACTBITS_CATEGORY_BY_BASE: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const [cat, bases] of Object.entries(REACTBITS_POPULAR_BY_CATEGORY)) {
    for (const base of bases) map.set(base, cat)
  }
  return map
})()

// ---------------------------------------------------------------------------
// blocks.so (ephraimduncan/blocks)
// ---------------------------------------------------------------------------
// Repo: ephraimduncan/blocks
// Public registry URL: https://blocks.so/r/<name>.json
// Categorias oficiales (11): ai, command-menu, dialogs, file-upload,
//   form-layout, grid-list, login, onboarding, sidebar, stats, tables.
// Fuente de descubrimiento: GitHub Contents API sobre /content/components.
// Cada bloque es un .tsx bajo content/components/<category>/; el nombre
// canonico es `<category>-<NN>` (ej: stats-01, login-03, form-layout-02).
// Cada JSON de bloque incluye `categories[]` explicito y `target` para
// inyeccion Zero-Touch en el proyecto Next.js destino.
const BLOCKSSO_REPO = "ephraimduncan/blocks"
const BLOCKSSO_CATEGORIES_API =
  `https://api.github.com/repos/${BLOCKSSO_REPO}/contents/content/components`
const BLOCKSSO_CATEGORY_FILES_API = (category: string) =>
  `https://api.github.com/repos/${BLOCKSSO_REPO}/contents/content/components/${category}`
const BLOCKSSO_RAW = (name: string) =>
  `https://raw.githubusercontent.com/${BLOCKSSO_REPO}/main/content/components/${name}.json`
const BLOCKSSO_INSTALL = (name: string) => `https://blocks.so/r/${name}.json`
const BLOCKSSO_PREVIEW = (category: string, name: string) =>
  `https://blocks.so/${category}/${name}`
const BLOCKSSO_TTL_DAYS = Number(process.env.SDD_CATALOG_TTL_DAYS_BLOCKSSO || 7)

// Categorias oficiales de blocks.so (orden estable para la UI).
const BLOCKSSO_CATEGORIES = [
  "ai", "command-menu", "dialogs", "file-upload", "form-layout",
  "grid-list", "login", "onboarding", "sidebar", "stats", "tables"
] as const

// ---------------------------------------------------------------------------
// Categorias (heuristica por nombre de archivo para Akash/Basecn)
// ---------------------------------------------------------------------------
const CATEGORY_PREFIXES = [
  "hero", "footer", "pricing", "features", "faq", "testimonials",
  "cta", "navbar", "stats", "logo-cloud", "blog", "contact",
  "team", "about", "gallery", "login", "signup", "forgot-password",
  "otp", "chart", "sidebar", "dashboard", "table", "calendar",
  "accordion", "alert", "avatar", "badge", "button", "card", "checkbox",
  "combobox", "command", "date-picker", "dialog", "drawer", "dropdown-menu",
  "input", "kbd", "menubar", "pagination", "popover", "progress",
  "radio-group", "scroll-area", "select", "separator", "sheet", "skeleton",
  "slider", "sonner", "switch", "tabs", "textarea", "toast", "toggle",
  "tooltip", "carousel", "marquee", "bento", "integration", "comparison",
  "how-it-works", "use-cases", "changelog", "cookie-banner", "newsletter"
]

// ============================================================================
// Helpers
// ============================================================================

type RegistryName = "shadcn" | "basecn" | "reactbits" | "blocks-so"

const getRoot = (context: any): string => {
  if (context?.directory && context.directory !== "/") return context.directory
  if (context?.worktree && context.worktree !== "/") return context.worktree
  if (context?.cwd && context.directory !== "/") return context.directory
  return process.cwd()
}

const getCacheDir = (root: string) => path.resolve(root, ".openspec/cache")
const getBlocksDir = (root: string, registry: RegistryName, subdir?: string) =>
  subdir
    ? path.resolve(getCacheDir(root), "blocks", registry, subdir)
    : path.resolve(getCacheDir(root), "blocks", registry)
const getIndexPath = (root: string, registry: RegistryName) =>
  path.resolve(getCacheDir(root), `${registry}-index.json`)

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const inferCategory = (filename: string): string => {
  const stem = filename.replace(/\.json$/, "")
  for (const prefix of CATEGORY_PREFIXES) {
    if (stem === prefix || stem.startsWith(`${prefix}-`)) return prefix
  }
  return "misc"
}

const ttlMs = (days: number) => days * 24 * 60 * 60 * 1000

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type IndexEntry = {
  name: string
  base_name?: string
  filename?: string
  category: string
  registry: RegistryName
  author?: string
  description?: string
  tags?: string[]
  variants?: string[]
  default_variant?: string
  size?: number
  sha?: string
  raw_url?: string
  install_url: string
  install_url_template?: string
  preview_url?: string
  source?: "github" | "registry_json" | "curated"
}

type Index = {
  cached_at: string
  ttl_days: number
  source: string
  total: number
  entries: IndexEntry[]
}

const writeJson = (filePath: string, data: unknown) => {
  ensureDir(path.dirname(filePath))
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8")
  fs.renameSync(tmp, filePath)
}

const readJson = <T>(filePath: string): T | null => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as T
    }
  } catch (e) {
    // ignore corrupt cache; will rebuild
  }
  return null
}

const isCacheStale = (index: Index | null, ttl: number): boolean => {
  if (!index) return true
  const cached = new Date(index.cached_at).getTime()
  if (Number.isNaN(cached)) return true
  return Date.now() - cached > ttl
}

// ---------------------------------------------------------------------------
// GitHub API fetchers (Akash + Basecn)
// ---------------------------------------------------------------------------

const fetchGithubTree = async (
  apiUrl: string,
  repoLabel: string
): Promise<IndexEntry[]> => {
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "zugzbot-sdd-catalog/1.0",
      Accept: "application/vnd.github+json"
    }
  })

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `GitHub API rate limit hit consultando ${repoLabel}. ` +
          `Espera 1h o usa force_refresh=false con cache existente.`
      )
    }
    if (res.status === 404) {
      throw new Error(
        `Repositorio ${repoLabel} no encontrado o ruta cambiada. ` +
          `Verifica que ${apiUrl} siga vigente.`
      )
    }
    throw new Error(`GitHub API ${res.status} ${res.statusText} consultando ${repoLabel}`)
  }

  const arr = (await res.json()) as Array<{
    name: string
    size: number
    sha: string
    download_url: string
  }>

  const registry: RegistryName = repoLabel.includes("basecn") ? "basecn" : "shadcn"

  return arr
    .filter((f) => f.name.endsWith(".json") && !f.name.startsWith("_"))
    .map((f) => {
      const filename = f.name
      const name = filename.replace(/\.json$/, "")
      const installUrl =
        registry === "basecn" ? BASECN_INSTALL(name) : AKASH_INSTALL(name)
      return {
        name,
        filename,
        category: inferCategory(filename),
        registry,
        size: f.size,
        sha: f.sha,
        raw_url: undefined,
        install_url: installUrl,
        preview_url: registry === "basecn"
          ? `https://basecn.dev/blocks/${name}`
          : `https://shadcnui-blocks.com/blocks/${name}`,
        source: "github" as const
      }
    })
}

const buildOrLoadIndex = async (
  root: string,
  registry: "shadcn" | "basecn",
  forceRefresh: boolean
): Promise<{ index: Index; refreshed: boolean; error?: string }> => {
  const indexPath = getIndexPath(root, registry)
  const apiUrl = registry === "basecn" ? BASECN_API : AKASH_API
  const repoLabel = registry === "basecn" ? BASECN_REPO : AKASH_REPO
  const ttl = registry === "basecn" ? ttlMs(BASECN_TTL_DAYS) : ttlMs(AKASH_TTL_DAYS)

  const cached = readJson<Index>(indexPath)
  if (!forceRefresh && !isCacheStale(cached, ttl)) {
    return { index: cached!, refreshed: false }
  }

  try {
    const entries = await fetchGithubTree(apiUrl, repoLabel)
    const index: Index = {
      cached_at: new Date().toISOString(),
      ttl_days: registry === "basecn" ? BASECN_TTL_DAYS : AKASH_TTL_DAYS,
      source: repoLabel,
      total: entries.length,
      entries
    }
    writeJson(indexPath, index)
    return { index, refreshed: true }
  } catch (e) {
    if (cached) {
      return {
        index: cached,
        refreshed: false,
        error: `Refresh fallo (${(e as Error).message}); usando cache de ${cached.cached_at}`
      }
    }
    throw e
  }
}

// ---------------------------------------------------------------------------
// reactbits.dev registry.json loader
// ---------------------------------------------------------------------------

type ReactBitsRegistryItem = {
  name: string
  title?: string
  description?: string
  type?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: Array<{ type?: string; path?: string; content?: string }>
}

type ReactBitsCatalog = {
  $schema?: string
  name?: string
  homepage?: string
  items?: ReactBitsRegistryItem[]
}

const stripVariantSuffix = (name: string): { base: string; variant: ReactBitsVariant | null } => {
  const m = name.match(REACTBITS_VARIANT_SUFFIX_RE)
  if (m) {
    return { base: name.slice(0, m[0].length * -1), variant: m[1] as ReactBitsVariant }
  }
  return { base: name, variant: null }
}

const inferReactbitsCategory = (base: string): string => {
  return REACTBITS_CATEGORY_BY_BASE.get(base) || "misc"
}

const fetchReactbitsCatalog = async (): Promise<ReactBitsCatalog> => {
  const res = await fetch(REACTBITS_CATALOG, {
    headers: {
      "User-Agent": "zugzbot-sdd-catalog/1.0",
      Accept: "application/json"
    }
  })
  if (!res.ok) {
    throw new Error(`Fetch ${res.status} ${res.statusText} -> ${REACTBITS_CATALOG}`)
  }
  const text = await res.text()
  try {
    return JSON.parse(text) as ReactBitsCatalog
  } catch (e) {
    throw new Error(`No se pudo parsear catalog de reactbits: ${(e as Error).message}`)
  }
}

const buildReactbitsIndex = async (
  root: string,
  forceRefresh: boolean
): Promise<{ index: Index; refreshed: boolean; error?: string }> => {
  const indexPath = getIndexPath(root, "reactbits")
  const ttl = ttlMs(REACTBITS_TTL_DAYS)

  const cached = readJson<Index>(indexPath)
  if (!forceRefresh && !isCacheStale(cached, ttl)) {
    return { index: cached!, refreshed: false }
  }

  try {
    const catalog = await fetchReactbitsCatalog()
    const items = catalog.items || []

    // Agrupar items por base. Cada base tiene hasta 4 entradas (variantes).
    const byBase = new Map<string, ReactBitsRegistryItem[]>()
    for (const it of items) {
      const { base } = stripVariantSuffix(it.name)
      if (!byBase.has(base)) byBase.set(base, [])
      byBase.get(base)!.push(it)
    }

    const entries: IndexEntry[] = []
    for (const [base, variants] of byBase.entries()) {
      const variantsAvailable = variants
        .map((v) => stripVariantSuffix(v.name).variant)
        .filter((v): v is ReactBitsVariant => !!v)
      const first = variants[0]
      const description = first.description || first.title || ""
      const category = inferReactbitsCategory(base)
      const deps = Array.from(
        new Set(
          variants.flatMap((v) =>
            Array.isArray(v.dependencies) ? v.dependencies : []
          )
        )
      )

      entries.push({
        name: base,
        base_name: base,
        filename: `${base}-${DEFAULT_REACTBITS_VARIANT}.json`,
        category,
        registry: "reactbits",
        description,
        tags: [category, "animated", "reactbits"].concat(deps.slice(0, 3)),
        variants: variantsAvailable,
        default_variant: DEFAULT_REACTBITS_VARIANT,
        install_url: REACTBITS_INSTALL(`${base}-${DEFAULT_REACTBITS_VARIANT}`),
        install_url_template: `https://reactbits.dev/r/${base}-{variant}.json`,
        preview_url: REACTBITS_PREVIEW(base),
        source: "registry_json"
      })
    }

    // Orden alfabetico para mejor UX
    entries.sort((a, b) => a.name.localeCompare(b.name))

    const index: Index = {
      cached_at: new Date().toISOString(),
      ttl_days: REACTBITS_TTL_DAYS,
      source: REACTBITS_CATALOG,
      total: entries.length,
      entries
    }
    writeJson(indexPath, index)
    return { index, refreshed: true }
  } catch (e) {
    if (cached) {
      return {
        index: cached,
        refreshed: false,
        error: `Refresh fallo (${(e as Error).message}); usando cache de ${cached.cached_at}`
      }
    }
    throw e
  }
}

// Resuelve el slug canonico final para reactbits.
// Acepta:
//   - "Dither" + variant "TS-TW" (default)        => "Dither-TS-TW"
//   - "Dither-JS-CSS" (canonica completa)        => "Dither-JS-CSS"
//   - "Dither" sin variant                        => "Dither-TS-TW"
const resolveReactbitsSlug = (
  input: string,
  variantArg?: string
): { canonicalName: string; baseName: string; variant: ReactBitsVariant } => {
  const trimmed = input.trim()
  const suffixMatch = trimmed.match(REACTBITS_VARIANT_SUFFIX_RE)
  if (suffixMatch) {
    const variant = suffixMatch[1] as ReactBitsVariant
    const base = trimmed.slice(0, suffixMatch[0].length * -1)
    return { canonicalName: `${base}-${variant}`, baseName: base, variant }
  }
  const requestedVariant = (variantArg || DEFAULT_REACTBITS_VARIANT) as ReactBitsVariant
  const safeVariant: ReactBitsVariant = REACTBITS_VARIANTS.includes(requestedVariant)
    ? requestedVariant
    : DEFAULT_REACTBITS_VARIANT
  return {
    canonicalName: `${trimmed}-${safeVariant}`,
    baseName: trimmed,
    variant: safeVariant
  }
}

// ---------------------------------------------------------------------------
// blocks.so index builder
// ---------------------------------------------------------------------------
//
// Estrategia de descubrimiento en 2 niveles (idempotente, TTL 7d):
//   1. Listar subdirectorios bajo /content/components/ (las 11 categorias).
//   2. Para cada categoria, listar archivos .tsx y derivar name canonico.
//
// Output: IndexEntry[] con category real (de la carpeta GitHub), install_url
// apuntando a https://blocks.so/r/<name>.json y preview_url al demo vivo.
//
// Para no saturar la GitHub API (rate limit 60/h sin token), cacheamos el
// indice completo durante 7d. Cualquier update en el repo se reflejara
// solo tras `force_refresh: true` o expiracion del TTL.

type GitHubContentEntry = {
  name: string
  path: string
  size: number
  sha: string
  type: "dir" | "file"
}

const fetchGithubContents = async (
  apiUrl: string,
  repoLabel: string
): Promise<GitHubContentEntry[]> => {
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "zugzbot-sdd-catalog/1.0",
      Accept: "application/vnd.github+json"
    }
  })
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `GitHub API rate limit hit consultando ${repoLabel}. ` +
          `Espera 1h o usa force_refresh=false con cache existente.`
      )
    }
    if (res.status === 404) {
      throw new Error(
        `Repositorio ${repoLabel} no encontrado o ruta cambiada. ` +
          `Verifica que ${apiUrl} siga vigente.`
      )
    }
    throw new Error(`GitHub API ${res.status} ${res.statusText} consultando ${repoLabel}`)
  }
  return (await res.json()) as GitHubContentEntry[]
}

const buildBlocksSoIndex = async (
  root: string,
  forceRefresh: boolean
): Promise<{ index: Index; refreshed: boolean; error?: string }> => {
  const indexPath = getIndexPath(root, "blocks-so")
  const ttl = ttlMs(BLOCKSSO_TTL_DAYS)

  const cached = readJson<Index>(indexPath)
  if (!forceRefresh && !isCacheStale(cached, ttl)) {
    return { index: cached!, refreshed: false }
  }

  try {
    const entries: IndexEntry[] = []

    // Paso 1: listar las 11 categorias oficiales.
    // Si la API falla 404 (ej: rama renombrada) usamos la lista hardcodeada
    // como fallback para no romper el resto del catalogo.
    let categories = [...BLOCKSSO_CATEGORIES] as readonly string[]
    try {
      const catEntries = await fetchGithubContents(
        BLOCKSSO_CATEGORIES_API,
        BLOCKSSO_REPO
      )
      const live = catEntries
        .filter((e) => e.type === "dir")
        .map((e) => e.name)
        .filter((n) => !n.startsWith("_") && !n.startsWith("."))
      if (live.length > 0) categories = live
    } catch (e) {
      if (!cached) throw e
    }

    // Paso 2: por cada categoria, enumerar .tsx (formato plano) O
    // subdirectorios (formato multi-file, usado por sidebar) y derivar
    // el name canonico. Estructuras mixtas soportadas:
    //   - ai/             ai-01.tsx ... ai-05.tsx
    //   - command-menu/   command-menu-01.tsx ... -03.tsx
    //   - dialogs/        dialog-01.tsx ... -12.tsx  (prefijo singular)
    //   - login/          login-01.tsx ... -09.tsx
    //   - onboarding/     onboarding-01.tsx ... -07.tsx
    //   - stats/          stats-01.tsx ... -15.tsx
    //   - tables/         table-01.tsx ... -05.tsx  (prefijo singular)
    //   - form-layout/    form-layout-01.tsx ... -05.tsx
    //   - grid-list/      grid-list-01.tsx ... -03.tsx
    //   - file-upload/    file-upload-01.tsx ... -06.tsx
    //                     (+ file-upload-01/ subdir durante transicion)
    //   - sidebar/        sidebar-01/ ... sidebar-06/  (SUBDIRS multi-file)
    //
    // Si un mismo name aparece como .tsx Y como subdir (transicion en el
    // repo fuente), preferimos el subdir (multi-file) y descartamos el .tsx
    // huerfano. Esto evita entradas duplicadas en el indice.
    const seenNames = new Set<string>()
    const dedupEntries: IndexEntry[] = []

    for (const cat of categories) {
      let items: GitHubContentEntry[]
      try {
        items = await fetchGithubContents(
          BLOCKSSO_CATEGORY_FILES_API(cat),
          BLOCKSSO_REPO
        )
      } catch (e) {
        // Si falla una categoria puntual, seguimos con las demas para no
        // abortar el indice completo. Logueamos via error[] abajo.
        continue
      }
      for (const it of items) {
        // Ignorar archivos no-componente (index.ts, .DS_Store, etc.)
        if (it.name.startsWith("index.")) continue
        if (it.name.startsWith("_")) continue
        if (it.name.startsWith(".")) continue

        // Caso A: archivo .tsx plano. name = file sin extension.
        if (it.type === "file" && it.name.endsWith(".tsx")) {
          const name = it.name.replace(/\.tsx$/, "")
          if (!name) continue
          if (seenNames.has(name)) continue  // dedup
          seenNames.add(name)
          dedupEntries.push({
            name,
            filename: it.name,
            category: cat,
            registry: "blocks-so",
            author: "ephraimduncan",
            description: `blocks.so ${cat} block (${name})`,
            tags: [cat, "shadcn-registry", "blocks-so"],
            install_url: BLOCKSSO_INSTALL(name),
            preview_url: BLOCKSSO_PREVIEW(cat, name),
            source: "github"
          })
          continue
        }

        // Caso B: subdirectorio (multi-file block, ej. sidebar-XX/).
        // El nombre del subdir ES el canonical name del bloque.
        // Sobrescribe cualquier .tsx huerfano con el mismo name.
        if (it.type === "dir") {
          const name = it.name
          if (!name) continue
          // Si ya vimos un .tsx con este name, lo removemos para
          // reemplazarlo por la version multi-file (mas completa).
          const existingIdx = dedupEntries.findIndex(
            (e) => e.name === name && e.category === cat
          )
          if (existingIdx >= 0) dedupEntries.splice(existingIdx, 1)
          seenNames.add(name)
          dedupEntries.push({
            name,
            filename: `${name}/`,
            category: cat,
            registry: "blocks-so",
            author: "ephraimduncan",
            description: `blocks.so ${cat} block (${name}, multi-file)`,
            tags: [cat, "shadcn-registry", "blocks-so", "multi-file"],
            install_url: BLOCKSSO_INSTALL(name),
            preview_url: BLOCKSSO_PREVIEW(cat, name),
            source: "github"
          })
          continue
        }
      }
    }

    dedupEntries.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })
    entries.push(...dedupEntries)

    const index: Index = {
      cached_at: new Date().toISOString(),
      ttl_days: BLOCKSSO_TTL_DAYS,
      source: `${BLOCKSSO_REPO} (${BLOCKSSO_CATEGORIES_API})`,
      total: entries.length,
      entries
    }
    writeJson(indexPath, index)
    return { index, refreshed: true }
  } catch (e) {
    if (cached) {
      return {
        index: cached,
        refreshed: false,
        error: `Refresh fallo (${(e as Error).message}); usando cache de ${cached.cached_at}`
      }
    }
    throw e
  }
}

// ---------------------------------------------------------------------------
// Fetchers compartidos
// ---------------------------------------------------------------------------

const fetchRaw = async (url: string, acceptJson = false): Promise<string> => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "zugzbot-sdd-catalog/1.0",
      ...(acceptJson ? { Accept: "application/json" } : {})
    }
  })
  if (!res.ok) {
    throw new Error(`Fetch ${res.status} ${res.statusText} -> ${url}`)
  }
  return await res.text()
}

const tryParseBlockJson = (raw: string): any => {
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    try {
      return JSON.parse(JSON.parse(trimmed))
    } catch {
      throw new Error(`No se pudo parsear JSON del bloque`)
    }
  }
}

const normalizeBlock = (parsed: any, registry: RegistryName, name: string) => {
  const files: Array<{
    path: string
    type: string
    target?: string
    content?: string
  }> = []

  const deps: string[] = []
  let installUrl: string

  if (registry === "reactbits") {
    installUrl = REACTBITS_INSTALL(name)
  } else if (registry === "basecn") {
    installUrl = BASECN_INSTALL(name)
  } else if (registry === "blocks-so") {
    installUrl = BLOCKSSO_INSTALL(name)
  } else {
    installUrl = AKASH_INSTALL(name)
  }

  if (Array.isArray(parsed?.files)) {
    for (const f of parsed.files) {
      files.push({
        path: f.path || f.name || "unknown",
        type: f.type || "unknown",
        target: f.target,
        content: f.content || f.code
      })
    }
  }
  if (Array.isArray(parsed?.dependencies)) deps.push(...parsed.dependencies)
  if (Array.isArray(parsed?.deps)) deps.push(...parsed.deps)
  if (parsed?.registryDependencies && typeof parsed.registryDependencies === "object") {
    for (const [k, v] of Object.entries(parsed.registryDependencies)) {
      deps.push(`${k}: ${v}`)
    }
  }

  return { files, dependencies: deps, installUrl }
}

// ============================================================================
// Tool: list_blocks
// ============================================================================

type ListResult = {
  status: "SUCCESS" | "ERROR"
  message: string
  registries_queried: RegistryName[]
  cached_at?: Record<string, string>
  total?: number
  filtered?: number
  entries?: IndexEntry[]
  errors?: string[]
  hints?: string[]
}

const REGISTRIES_ALL: RegistryName[] = ["shadcn", "basecn", "reactbits", "blocks-so"]




export const list_blocks = tool({
  description:
    "Lista bloques/componentes del catalogo unificado sdd_catalog. " +
    "Soporta 4 registries con catalogo JSON oficial: 'shadcn' (akash3444/shadcn-ui-blocks, " +
    "Radix), 'basecn' (akash3444/basecn, fork Base UI), 'reactbits' (reactbits.dev, " +
    "primitivas animadas; para cada base se exponen sus 4 variantes JS-CSS/JS-TW/TS-CSS/TS-TW) " +
    "y 'blocks-so' (ephraimduncan/blocks, 60+ bloques Radix prod-ready con categories[] explicito; " +
    "default para stats, login, form-layout, file-upload, tables, dialogs, sidebar, " +
    "command-menu, ai, onboarding, grid-list). " +
    "Cachea en .openspec/cache/ con TTL por registry (7d shadcn/basecn/blocks-so, 1d reactbits). " +
    "Filtra por categoria (hero, footer, pricing, backgrounds, text, cards, stats, login, etc) " +
    "y por query libre (substring sobre name/description/tags).",
  args: {
    category: tool.schema
      .string()
      .optional()
      .describe(
        "Filtra por categoria exacta (hero, footer, pricing, backgrounds, text, " +
          "cards, navigation, buttons, animations, cursors, etc). Opcional."
      ),
    query: tool.schema
      .string()
      .optional()
      .describe("Busqueda libre por substring sobre name/filename/description. Opcional."),
    registry: tool.schema
      .enum(["shadcn", "basecn", "reactbits", "blocks-so", "all"])
      .optional()
      .default("all")
      .describe("Que catalogos consultar. 'all' = shadcn+basecn+reactbits+blocks-so."),
    limit: tool.schema
      .number()
      .optional()
      .default(50)
      .describe("Maximo de entradas a devolver (default 50, max 500)."),
    force_refresh: tool.schema
      .boolean()
      .optional()
      .default(false)
      .describe("Si true, ignora TTL y re-descarga el indice del registry.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const requested: RegistryName[] =
      args.registry === "all" || !args.registry
        ? REGISTRIES_ALL
        : [args.registry as RegistryName]

    const allEntries: IndexEntry[] = []
    const cachedAt: Record<string, string> = {}
    const errors: string[] = []
    const hints: string[] = []

    for (const reg of requested) {
      try {
        if (reg === "reactbits") {
          const { index, refreshed, error } = await buildReactbitsIndex(
            root,
            args.force_refresh || false
          )
          cachedAt[reg] = index.cached_at
          if (refreshed) {
            // ok
          }
          if (error) errors.push(`[${reg}] ${error}`)
          allEntries.push(...index.entries)
          hints.push(
            "[reactbits] Cada entrada lista las 4 variantes disponibles " +
              "(`variants[]`) y `install_url` apunta a la variante por default " +
              "TS-TW (TypeScript + Tailwind v4). Para otra variante, pasa " +
              "`variant='JS-CSS'` a `sdd_catalog_get_block`."
          )
        } else if (reg === "blocks-so") {
          const { index, refreshed, error } = await buildBlocksSoIndex(
            root,
            args.force_refresh || false
          )
          cachedAt[reg] = index.cached_at
          if (refreshed) {
            // ok
          }
          if (error) errors.push(`[${reg}] ${error}`)
          allEntries.push(...index.entries)
          hints.push(
            "[blocks-so] ephraimduncan/blocks (https://blocks.so). " +
              "Default para sus 11 categorias: stats, login, form-layout, " +
              "file-upload, tables, dialogs, sidebar, command-menu, ai, " +
              "onboarding, grid-list. Install: `npx shadcn@latest add " +
              "https://blocks.so/r/<name>.json --yes`."
          )
        } else {
          const { index, refreshed, error } = await buildOrLoadIndex(
            root,
            reg,
            args.force_refresh || false
          )
          cachedAt[reg] = index.cached_at
          if (refreshed) {
            // ok
          }
          if (error) errors.push(`[${reg}] ${error}`)
          allEntries.push(...index.entries)
        }
      } catch (e) {
        errors.push(`[${reg}] ${(e as Error).message}`)
      }
    }

    let filtered = allEntries
    if (args.category) {
      const cat = args.category.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.category === cat ||
          e.name.toLowerCase().startsWith(cat + "-") ||
          (e.tags || []).some((t) => t.toLowerCase().includes(cat))
      )
    }
    if (args.query) {
      const q = args.query.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.filename || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.author || "").toLowerCase().includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }

    const limit = Math.min(args.limit || 50, 500)
    filtered = filtered.slice(0, limit)

    const result: ListResult = {
      status: errors.length && allEntries.length === 0 ? "ERROR" : "SUCCESS",
      message:
        errors.length && allEntries.length === 0
          ? `No se pudo cargar el catalogo. Errores: ${errors.join("; ")}`
          : `Se encontraron ${filtered.length} bloques (total sin filtro: ${allEntries.length}).`,
      registries_queried: requested,
      cached_at: cachedAt,
      total: allEntries.length,
      filtered: filtered.length,
      entries: filtered
    }
    if (errors.length) result.errors = errors
    if (hints.length) result.hints = hints
    return JSON.stringify(result, null, 2)
  }
})

// ============================================================================
// Tool: get_block
// ============================================================================

type GetResult = {
  status: "SUCCESS" | "ERROR"
  message: string
  block: {
    name: string
    base_name?: string
    variant?: string
    registry: RegistryName
    category: string
    author?: string
    install_url: string
    install_command: string
    cached_source: boolean
    cached_at: string
    source_files: Array<{
      path: string
      type: string
      target?: string
      content?: string
    }>
    dependencies?: string[]
    notes?: string
    preview_url?: string
  } | null
}

export const get_block = tool({
  description:
    "Obtiene el codigo fuente, archivos y dependencias de un bloque/componente " +
    "especifico del catalogo unificado. " +
    "Para shadcn/basecn: `name='hero-06'`. " +
    "Para reactbits: `name='Dither'` (resuelve a Dither-TS-TW por default) o " +
    "`name='Dither-JS-CSS'` (variante canonica completa). " +
    "Para blocks-so: `name='stats-01'`. " +
    "Tambien acepta URL directa `name='https://reactbits.dev/r/Dither-TS-TW.json'` " +
    "o `name='https://blocks.so/r/stats-01.json'`, y namespace shadcn " +
    "`name='@acme/button'` (incluido `@blocks-so/stats-01`). " +
    "Cachea en .openspec/cache/blocks/<registry>/<name>.json. " +
    "Devuelve `install_command` listo para ejecutar con `npx shadcn@latest add`.",
  args: {
    name: tool.schema
      .string()
      .describe(
        "Identificador del bloque. Formatos aceptados:\n" +
          "  - shadcn/basecn: 'hero-06', 'sidebar-07'\n" +
          "  - blocks-so: 'stats-01', 'login-03', 'form-layout-02'\n" +
          "  - reactbits: 'Dither' (default TS-TW) o 'Dither-JS-CSS' (canonica)\n" +
          "  - URL directa: 'https://reactbits.dev/r/Dither-TS-TW.json' o 'https://blocks.so/r/stats-01.json'\n" +
          "  - Namespace shadcn: '@acme/button' o '@blocks-so/stats-01'"
      ),
    registry: tool.schema
      .enum(["auto", "shadcn", "basecn", "reactbits", "blocks-so"])
      .optional()
      .default("auto")
      .describe(
        "Registry a consultar. 'auto' detecta por el formato del nombre " +
          "(contiene '/' => namespace, contiene '-JS-...' o '-TS-...' => reactbits, " +
          "sin prefijo => shadcn por default)."
      ),
    variant: tool.schema
      .enum(["JS-CSS", "JS-TW", "TS-CSS", "TS-TW"])
      .optional()
      .describe(
        "Solo para reactbits: variante del componente (default: TS-TW). " +
          "Aplicar cuando se pasa el nombre base sin sufijo de variante."
      ),
    force_refresh: tool.schema
      .boolean()
      .optional()
      .default(false)
      .describe("Si true, re-descarga aunque exista cache.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const rawName = args.name.trim()

    // --- 1. Resolver registry y slug canonico ---
    let registry: RegistryName
    let canonicalName: string
    let baseName: string | undefined
    let variant: ReactBitsVariant | undefined
    let directUrl: string | undefined

    if (rawName.startsWith("http://") || rawName.startsWith("https://")) {
      const url = rawName
      if (url.includes("reactbits.dev/r/")) {
        const m = url.match(/\/r\/([a-zA-Z0-9_.-]+)\.json/)
        if (!m) {
          return JSON.stringify({
            status: "ERROR",
            message: `URL reactbits invalida: ${url}. Esperado patron /r/<name>.json.`,
            block: null
          }, null, 2)
        }
        const slug = m[1]
        const resolved = resolveReactbitsSlug(slug, args.variant)
        registry = "reactbits"
        canonicalName = resolved.canonicalName
        baseName = resolved.baseName
        variant = resolved.variant
        directUrl = url
      } else if (url.includes("blocks.so/r/")) {
        const m = url.match(/\/r\/([a-zA-Z0-9_.-]+)\.json/)
        if (!m) {
          return JSON.stringify({
            status: "ERROR",
            message: `URL blocks.so invalida: ${url}. Esperado patron /r/<name>.json.`,
            block: null
          }, null, 2)
        }
        registry = "blocks-so"
        canonicalName = m[1]
        directUrl = url
      } else {
        // URL generica shadcn: tratarla como shadcn (1 sola parte)
        const m = url.match(/\/([a-zA-Z0-9_.-]+)\.json/)
        if (!m) {
          return JSON.stringify({
            status: "ERROR",
            message: `URL no reconocida como item de registry valido: ${url}`,
            block: null
          }, null, 2)
        }
        registry = "shadcn"
        canonicalName = m[1]
        directUrl = url
      }
    } else if (rawName.startsWith("@")) {
      // Namespace shadcn @<author>/<item>. Detectamos @blocks-so y lo
      // redirigimos al registry blocks-so (canonicalName sin prefijo).
      const m = rawName.match(/^@([a-zA-Z0-9_.-]+)\/(.+)$/)
      if (!m) {
        return JSON.stringify({
          status: "ERROR",
          message: `Namespace invalido: ${rawName}`,
          block: null
        }, null, 2)
      }
      if (m[1] === "blocks-so" || m[1] === "blocks_so") {
        registry = "blocks-so"
        canonicalName = m[2]
      } else {
        registry = "shadcn"
        canonicalName = `${m[1]}/${m[2]}`
      }
    } else {
      // Auto-detectar: si contiene '-JS-' o '-TS-' seguido de CSS/TW, es reactbits canonica.
      // Si el registry forzado es reactbits, resolver siempre.
      const looksLikeReactbitsVariant = REACTBITS_VARIANT_SUFFIX_RE.test(rawName)
      const requestedReg = args.registry === "auto" || !args.registry
        ? (looksLikeReactbitsVariant ? "reactbits" : "shadcn")
        : (args.registry as RegistryName)

      if (requestedReg === "reactbits") {
        const resolved = resolveReactbitsSlug(rawName, args.variant)
        registry = "reactbits"
        canonicalName = resolved.canonicalName
        baseName = resolved.baseName
        variant = resolved.variant
      } else if (requestedReg === "basecn") {
        registry = "basecn"
        canonicalName = rawName
      } else if (requestedReg === "blocks-so") {
        registry = "blocks-so"
        canonicalName = rawName
      } else {
        registry = "shadcn"
        canonicalName = rawName
      }
    }

    // --- 2. Resolver URLs de fetch e install ---
    let rawUrl: string
    let cachePath: string
    let installUrl: string
    let previewUrl: string | undefined
    let category: string
    let installCommand: string
    let notes: string

    if (registry === "reactbits") {
      rawUrl = directUrl || REACTBITS_RAW(canonicalName)
      cachePath = path.resolve(getBlocksDir(root, "reactbits"), `${canonicalName}.json`)
      installUrl = REACTBITS_INSTALL(canonicalName)
      previewUrl = baseName ? REACTBITS_PREVIEW(baseName) : undefined
      installCommand = `npx shadcn@latest add ${installUrl} --yes`
      category = baseName ? inferReactbitsCategory(baseName) : "misc"
      notes = "Item reactbits.dev (David Haz). Dependencias pesadas (gsap/three/motion) son habituales; valida compat antes de instalar."
    } else if (registry === "basecn") {
      rawUrl = BASECN_RAW(canonicalName)
      cachePath = path.resolve(getBlocksDir(root, "basecn"), `${canonicalName}.json`)
      installUrl = BASECN_INSTALL(canonicalName)
      previewUrl = `https://basecn.dev/blocks/${canonicalName}`
      installCommand = `npx shadcn@latest add ${installUrl} --yes`
      category = inferCategory(canonicalName)
      notes = "Bloque Base UI (fork). Verifica que tu proyecto tenga Base UI instalado."
    } else if (registry === "blocks-so") {
      // blocks.so: el JSON crudo vive en /content/components/<category>/<name>.tsx
      // pero el contrato del arnes siempre expone el `name` canonico
      // (ej: "stats-01"), NO el path del repo. La URL raw debe apuntar al
      // archivo .tsx fuente para que `content` contenga el codigo completo.
      rawUrl = directUrl || BLOCKSSO_RAW(canonicalName)
      cachePath = path.resolve(getBlocksDir(root, "blocks-so"), `${canonicalName}.json`)
      installUrl = BLOCKSSO_INSTALL(canonicalName)
      const resolvedCategory = inferCategory(canonicalName)
      previewUrl = BLOCKSSO_PREVIEW(resolvedCategory, canonicalName)
      installCommand = `npx shadcn@latest add ${installUrl} --yes`
      category = resolvedCategory
      notes = "Bloque blocks.so (ephraimduncan/blocks). Formato shadcn registry estandar (registry:block). Compatible con stack nextjs-shadcn."
    } else {
      rawUrl = AKASH_RAW(canonicalName)
      cachePath = path.resolve(getBlocksDir(root, "shadcn"), `${canonicalName}.json`)
      installUrl = AKASH_INSTALL(canonicalName)
      previewUrl = `https://shadcnui-blocks.com/blocks/${canonicalName}`
      installCommand = `npx shadcn@latest add ${installUrl} --yes`
      category = inferCategory(canonicalName)
      notes = "Bloque Radix/shadcn-ui-blocks. Compatible con el stack nextjs-shadcn."
    }

    // --- 3. Fetch + cache ---
    let rawText: string
    let cachedSource = false
    if (!args.force_refresh && fs.existsSync(cachePath)) {
      rawText = fs.readFileSync(cachePath, "utf8")
      cachedSource = true
    } else {
      try {
        // El shadcn CLI negocia content-type via Accept: application/json
        rawText = await fetchRaw(rawUrl, true)
        ensureDir(path.dirname(cachePath))
        fs.writeFileSync(cachePath, rawText, "utf8")
      } catch (e) {
        return JSON.stringify(
          {
            status: "ERROR",
            message: `No se pudo descargar ${rawUrl}: ${(e as Error).message}`,
            block: null
          } satisfies GetResult,
          null,
          2
        )
      }
    }

    // --- 4. Parse + normalizar ---
    let parsed: any
    try {
      parsed = tryParseBlockJson(rawText)
    } catch (e) {
      return JSON.stringify(
        {
          status: "ERROR",
          message: `Bloque ${canonicalName} (${registry}) descargado pero no parseable: ${(e as Error).message}`,
          block: null
        } satisfies GetResult,
        null,
        2
      )
    }

    const { files, dependencies } = normalizeBlock(parsed, registry, canonicalName)

    const result: GetResult = {
      status: "SUCCESS",
      message: `Bloque '${canonicalName}' (${registry}) listo. ${files.length} archivo(s), ${dependencies.length} dependencia(s).`,
      block: {
        name: canonicalName,
        base_name: baseName,
        variant,
        registry,
        category,
        install_url: installUrl,
        install_command: installCommand,
        cached_source: cachedSource,
        cached_at: new Date().toISOString(),
        source_files: files,
        dependencies,
        notes,
        preview_url: previewUrl
      }
    }
    return JSON.stringify(result, null, 2)
  }
})

// ============================================================================
// Tool: warm_index
// ============================================================================

type WarmResult = {
  status: "SUCCESS" | "ERROR"
  message: string
  warmed: string[]
  errors: string[]
}

export const warm_index = tool({
  description:
    "Pre-calienta (descarga) los indices de los registries soportados " +
    "para evitar la latencia del primer list_blocks/get_block. " +
    "Idempotente: si el cache existe y es fresco, no re-descarga. " +
    "TTL por registry: shadcn/basecn/blocks-so 7d, reactbits 1d.",
  args: {
    registry: tool.schema
      .enum(["shadcn", "basecn", "reactbits", "blocks-so", "all"])
      .optional()
      .default("all")
      .describe("Que catalogos pre-calentar.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const requested: RegistryName[] =
      args.registry === "all" || !args.registry
        ? REGISTRIES_ALL
        : [args.registry as RegistryName]

    const warmed: string[] = []
    const errors: string[] = []

    for (const reg of requested) {
      try {
        if (reg === "reactbits") {
          const { index, refreshed } = await buildReactbitsIndex(root, false)
          warmed.push(
            refreshed
              ? `${reg} (re-descargado, ${index.total} bases)`
              : `${reg} (cache fresco de ${index.cached_at})`
          )
        } else if (reg === "blocks-so") {
          const { index, refreshed } = await buildBlocksSoIndex(root, false)
          warmed.push(
            refreshed
              ? `${reg} (re-descargado, ${index.total} bloques)`
              : `${reg} (cache fresco de ${index.cached_at})`
          )
        } else {
          const { index, refreshed } = await buildOrLoadIndex(root, reg, false)
          warmed.push(
            refreshed
              ? `${reg} (re-descargado, ${index.total} bloques)`
              : `${reg} (cache fresco de ${index.cached_at})`
          )
        }
      } catch (e) {
        errors.push(`[${reg}] ${(e as Error).message}`)
      }
    }

    const result: WarmResult = {
      status: errors.length && warmed.length === 0 ? "ERROR" : "SUCCESS",
      message: `Indices: ${warmed.length} listos, ${errors.length} errores.`,
      warmed,
      errors
    }
    return JSON.stringify(result, null, 2)
  }
})
