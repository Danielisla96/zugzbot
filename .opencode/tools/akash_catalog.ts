import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import crypto from "crypto"

// ============================================================================
// Akash3444 Catalog MCP - Shadcn UI Blocks + Basecn
// ============================================================================
//
// Indexa localmente los catalogos externos de Akash (akash3444):
//   - shadcn-ui-blocks:  https://shadcnui-blocks.com (Radix-based)
//   - basecn:            https://basecn.dev (Base UI-based, fork)
//
// Para evitar redescubrimiento por webfetch en cada sesion, cacheamos:
//   - .openspec/cache/akash-index.json   (listado maestro, refresco cada 7d)
//   - .openspec/cache/basecn-index.json  (idem para basecn)
//   - .openspec/cache/blocks/<registry>/<name>.json (fuente individual por bloque)
//
// TTL configurable via AKASH_INDEX_TTL_DAYS env (default 7).
// ============================================================================

const AKASH_REPO = "akash3444/shadcn-ui-blocks"
const BASECN_REPO = "akash3444/basecn"

const AKASH_API = `https://api.github.com/repos/${AKASH_REPO}/contents/public/r/radix`
const BASECN_API = `https://api.github.com/repos/${BASECN_REPO}/contents/public/r/basecn`

const AKASH_RAW = (name: string) =>
  `https://raw.githubusercontent.com/${AKASH_REPO}/main/public/r/radix/${name}.json`
const BASECN_RAW = (name: string) =>
  `https://raw.githubusercontent.com/${BASECN_REPO}/main/public/r/basecn/${name}.json`

const AKASH_INSTALL = (name: string) =>
  `https://shadcnui-blocks.com/r/radix/${name}.json`
const BASECN_INSTALL = (name: string) =>
  `https://basecn.dev/r/basecn/${name}.json`

const DEFAULT_TTL_DAYS = Number(process.env.AKASH_INDEX_TTL_DAYS || 7)
const TTL_MS = DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000

// Prefijos conocidos para extraer categoria del nombre de archivo
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

const getRoot = (context: any): string => {
  if (context?.directory && context.directory !== "/") return context.directory
  if (context?.worktree && context.worktree !== "/") return context.worktree
  if (context?.cwd && context.cwd !== "/") return context.cwd
  return process.cwd()
}

const getCacheDir = (root: string) => path.resolve(root, ".openspec/cache")
const getBlocksDir = (root: string, registry: string) =>
  path.resolve(getCacheDir(root), "blocks", registry)
const getIndexPath = (root: string, registry: string) =>
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

type IndexEntry = {
  name: string
  filename: string
  category: string
  registry: "shadcn" | "basecn"
  size: number
  sha: string
  raw_url: string
  install_url: string
}

type Index = {
  cached_at: string
  ttl_days: number
  source_repo: string
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

const isCacheStale = (index: Index | null): boolean => {
  if (!index) return true
  const cached = new Date(index.cached_at).getTime()
  if (Number.isNaN(cached)) return true
  return Date.now() - cached > TTL_MS
}

// ============================================================================
// GitHub API fetchers (with simple rate-limit handling)
// ============================================================================

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

  const registry: "shadcn" | "basecn" =
    repoLabel.includes("basecn") ? "basecn" : "shadcn"

  return arr
    .filter((f) => f.name.endsWith(".json") && !f.name.startsWith("_"))
    .map((f) => {
      const filename = f.name
      const name = filename.replace(/\.json$/, "")
      const rawUrl =
        registry === "basecn" ? BASECN_RAW(filename) : AKASH_RAW(filename)
      const installUrl =
        registry === "basecn"
          ? BASECN_INSTALL(filename)
          : AKASH_INSTALL(filename)

      return {
        name,
        filename,
        category: inferCategory(filename),
        registry,
        size: f.size,
        sha: f.sha,
        raw_url: rawUrl,
        install_url: installUrl
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

  const cached = readJson<Index>(indexPath)
  if (!forceRefresh && !isCacheStale(cached)) {
    return { index: cached!, refreshed: false }
  }

  try {
    const entries = await fetchGithubTree(apiUrl, repoLabel)
    const index: Index = {
      cached_at: new Date().toISOString(),
      ttl_days: DEFAULT_TTL_DAYS,
      source_repo: repoLabel,
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

// ============================================================================
// Tool: list_blocks
// ============================================================================

type ListResult = {
  status: "SUCCESS" | "ERROR"
  message: string
  registries_queried: Array<"shadcn" | "basecn">
  cached_at?: Record<string, string>
  total?: number
  filtered?: number
  entries?: IndexEntry[]
  errors?: string[]
}

export const list_blocks = tool({
  description:
    "Lista bloques del catalogo externo de Akash (shadcn-ui-blocks y/o basecn). " +
    "Cachea el indice localmente en .openspec/cache/ y lo refresca cada 7 dias (configurable con AKASH_INDEX_TTL_DAYS). " +
    "Filtra por categoria (hero, footer, pricing, faq, dashboard, etc.) y por registry.",
  args: {
    category: tool.schema
      .string()
      .optional()
      .describe(
        "Filtra por categoria exacta (hero, footer, pricing, faq, dashboard, etc). Opcional."
      ),
    query: tool.schema
      .string()
      .optional()
      .describe(
        "Busqueda libre por substring sobre name o filename (case-insensitive). Opcional."
      ),
    registry: tool.schema
      .enum(["shadcn", "basecn", "both"])
      .optional()
      .default("both")
      .describe(
        "Que catalogo consultar: 'shadcn' (Radix), 'basecn' (Base UI) o 'both' (default)."
      ),
    limit: tool.schema
      .number()
      .optional()
      .default(50)
      .describe("Maximo de entradas a devolver (default 50, max 500)."),
    force_refresh: tool.schema
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Si true, ignora el TTL y re-descarga el arbol completo de GitHub API."
      )
  },
  async execute(args, context) {
    const root = getRoot(context)
    const registries: Array<"shadcn" | "basecn"> =
      args.registry === "both" || !args.registry
        ? ["shadcn", "basecn"]
        : [args.registry]

    const allEntries: IndexEntry[] = []
    const cachedAt: Record<string, string> = {}
    const errors: string[] = []

    for (const reg of registries) {
      try {
        const { index, refreshed, error } = await buildOrLoadIndex(
          root,
          reg,
          args.force_refresh || false
        )
        cachedAt[reg] = index.cached_at
        if (refreshed) {
          // noop; success already
        }
        if (error) errors.push(`[${reg}] ${error}`)
        allEntries.push(...index.entries)
      } catch (e) {
        errors.push(`[${reg}] ${(e as Error).message}`)
      }
    }

    let filtered = allEntries
    if (args.category) {
      const cat = args.category.toLowerCase()
      filtered = filtered.filter(
        (e) => e.category === cat || e.name.toLowerCase().startsWith(cat + "-")
      )
    }
    if (args.query) {
      const q = args.query.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.filename.toLowerCase().includes(q)
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
      registries_queried: registries,
      cached_at: cachedAt,
      total: allEntries.length,
      filtered: filtered.length,
      entries: filtered
    }
    if (errors.length) result.errors = errors
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
    registry: "shadcn" | "basecn"
    category: string
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

const fetchRaw = async (url: string): Promise<string> => {
  const res = await fetch(url, {
    headers: { "User-Agent": "zugzbot-sdd-catalog/1.0" }
  })
  if (!res.ok) {
    throw new Error(`Fetch ${res.status} ${res.statusText} -> ${url}`)
  }
  return await res.text()
}

const tryParseBlockJson = (raw: string): any => {
  // Algunos bloques Akash envuelven el JSON en JSON.stringify(...) dentro
  // de un .json "doblemente serializado" para shadcn CLI. Manejamos ambos.
  const trimmed = raw.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    // posible doble encoding
    try {
      return JSON.parse(JSON.parse(trimmed))
    } catch {
      throw new Error(`No se pudo parsear JSON del bloque`)
    }
  }
}

const normalizeBlock = (parsed: any, registry: "shadcn" | "basecn", name: string) => {
  const files: Array<{
    path: string
    type: string
    target?: string
    content?: string
  }> = []

  const deps: string[] = []
  const installUrl =
    registry === "basecn" ? BASECN_INSTALL(name) : AKASH_INSTALL(name)

  // Variantes comunes del schema JSON de Akash
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

export const get_block = tool({
  description:
    "Obtiene el codigo fuente, archivos y dependencias de un bloque especifico " +
    "del catalogo de Akash (shadcn-ui-blocks o basecn). " +
    "Cachea la fuente localmente en .openspec/cache/blocks/<registry>/<name>.json. " +
    "Devuelve ademas el comando `npx shadcn add` listo para ejecutar.",
  args: {
    name: tool.schema
      .string()
      .describe(
        "Nombre del bloque SIN .json (ej: 'hero-06', 'login-01', 'sidebar-07')."
      ),
    registry: tool.schema
      .enum(["shadcn", "basecn"])
      .optional()
      .default("shadcn")
      .describe("Catalogo a consultar. Default: 'shadcn'."),
    force_refresh: tool.schema
      .boolean()
      .optional()
      .default(false)
      .describe("Si true, re-descarga la fuente del bloque aunque exista cache.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const reg = args.registry || "shadcn"
    const filename = `${args.name}.json`
    const cachePath = path.resolve(getBlocksDir(root, reg), filename)
    const rawUrl = reg === "basecn" ? BASECN_RAW(filename) : AKASH_RAW(filename)
    const installUrl = reg === "basecn"
      ? BASECN_INSTALL(filename)
      : AKASH_INSTALL(filename)

    let rawText: string
    let cachedSource = false
    if (!args.force_refresh && fs.existsSync(cachePath)) {
      rawText = fs.readFileSync(cachePath, "utf8")
      cachedSource = true
    } else {
      try {
        rawText = await fetchRaw(rawUrl)
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

    let parsed: any
    try {
      parsed = tryParseBlockJson(rawText)
    } catch (e) {
      return JSON.stringify(
        {
          status: "ERROR",
          message: `Bloque ${args.name} descargado pero no parseable: ${(e as Error).message}`,
          block: null
        } satisfies GetResult,
        null,
        2
      )
    }

    const { files, dependencies, installUrl: install } = normalizeBlock(
      parsed,
      reg,
      args.name
    )

    const previewUrl =
      reg === "basecn"
        ? `https://basecn.dev/blocks/${args.name}`
        : `https://shadcnui-blocks.com/blocks/${args.name}`

    const installCommand = `npx shadcn@latest add ${install} --yes`

    const result: GetResult = {
      status: "SUCCESS",
      message: `Bloque '${args.name}' (${reg}) listo. ${files.length} archivo(s), ${dependencies.length} dependencia(s).`,
      block: {
        name: args.name,
        registry: reg,
        category: inferCategory(filename),
        install_url: install,
        install_command: installCommand,
        cached_source: cachedSource,
        cached_at: new Date().toISOString(),
        source_files: files,
        dependencies,
        notes:
          reg === "basecn"
            ? "Bloque Base UI (fork). Verifica que tu proyecto tenga Base UI instalado."
            : "Bloque Radix/shadcn-ui-blocks. Compatible con el stack nextjs-shadcn.",
        preview_url: previewUrl
      }
    }
    return JSON.stringify(result, null, 2)
  }
})

// ============================================================================
// Tool: warm_index (utilidad para bootstrap)
// ============================================================================

type WarmResult = {
  status: "SUCCESS" | "ERROR"
  message: string
  warmed: string[]
  errors: string[]
}

export const warm_index = tool({
  description:
    "Pre-calienta (descarga) los indices de Akash y/o Basecn para evitar la latencia " +
    "del primer list_blocks. Ideal de llamar al bootstrap del proyecto o al inicio de F0. " +
    "Idempotente: si el cache existe y es fresco (<7d), no re-descarga.",
  args: {
    registry: tool.schema
      .enum(["shadcn", "basecn", "both"])
      .optional()
      .default("both")
      .describe("Que catalogos pre-calentar.")
  },
  async execute(args, context) {
    const root = getRoot(context)
    const registries: Array<"shadcn" | "basecn"> =
      args.registry === "both" || !args.registry
        ? ["shadcn", "basecn"]
        : [args.registry]

    const warmed: string[] = []
    const errors: string[] = []

    for (const reg of registries) {
      try {
        const { refreshed, index } = await buildOrLoadIndex(root, reg, false)
        if (refreshed) warmed.push(`${reg} (re-descargado, ${index.total} bloques)`)
        else warmed.push(`${reg} (cache fresco de ${index.cached_at})`)
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