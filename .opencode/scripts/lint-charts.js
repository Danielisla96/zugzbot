#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * lint-charts.js — Linter bloqueante para configuraciones de Recharts inválidas.
 *
 * Bugfix sesión 1176: el coder dejó `color: "hsl(var(--chart-1))"` en
 * `chart-area-interactive.tsx`. Como `--chart-1` está definido en OKLCH en
 * `globals.css`, `hsl(oklch(...))` produce CSS inválido y los colores no
 * cambian al actualizar el token.
 *
 * REGLA: en chartConfig, los `color:` DEBEN usar `var(--color-chart-N)`
 * directamente, NUNCA `hsl(var(--chart-N))`.
 *
 * Uso:
 *   node .opencode/scripts/lint-charts.js [paths...]
 *
 * Por defecto escanea `src/` y `app/`. Sale con código 1 si encuentra
 * violaciones (BLOQUEANTE en shift-left).
 *
 * Salida JSON para integración programática:
 *   node .opencode/scripts/lint-charts.js --json
 */
"use strict"

const fs = require("fs")
const path = require("path")

// ============================================================================
// Config
// ============================================================================

const INCLUDE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"])
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".openspec/cache",
  ".openspec/__tests__",
  ".opencode/templates",
  ".opencode/oh-my-design"
])

// Patrones prohibidos: cualquier chartConfig que envuelva una variable CSS
// --chart-N dentro de hsl(). Capturamos la ocurrencia exacta.
const FORBIDDEN_PATTERNS = [
  {
    name: "hsl(oklch) misuse",
    regex: /hsl\(\s*var\(\s*--chart-\d+\s*\)\s*\)/g,
    fix: "Usa 'var(--color-chart-N)' directamente en chartConfig.color"
  },
  {
    name: "hsl(--chart) sin var()",
    regex: /hsl\(\s*--chart-\d+\s*\)/g,
    fix: "Envuelve en var(): 'hsl(var(--chart-N))' — pero si --chart-N es OKLCH, sigue siendo inválido. Usa 'var(--color-chart-N)'."
  }
]

// ============================================================================
// Walk
// ============================================================================

function walk(dir, acc = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    return acc
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".opencode") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      walk(full, acc)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (INCLUDE_EXT.has(ext)) acc.push(full)
    }
  }
  return acc
}

function isInChartContext(filePath, lineContent) {
  // Heurística: considerar chartConfig si el archivo contiene Recharts
  // o si la línea está cerca de una mención a ChartConfig. Para mantener
  // el linter simple y rápido, NO restringimos por contexto y reportamos
  // cualquier coincidencia; el developer decide si aplica.
  return true
}

// ============================================================================
// Lint
// ============================================================================

function lintFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  const violations = []

  lines.forEach((line, idx) => {
    for (const pat of FORBIDDEN_PATTERNS) {
      pat.regex.lastIndex = 0
      let m
      while ((m = pat.regex.exec(line)) !== null) {
        if (!isInChartContext(filePath, line)) continue
        violations.push({
          file: filePath,
          line: idx + 1,
          column: m.index + 1,
          match: m[0],
          pattern: pat.name,
          fix: pat.fix,
          snippet: line.trim()
        })
      }
    }
  })

  return violations
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const argv = process.argv.slice(2)
  const jsonOut = argv.includes("--json")
  const explicitPaths = argv.filter((a) => !a.startsWith("--"))

  const roots =
    explicitPaths.length > 0
      ? explicitPaths
      : [path.join(process.cwd(), "src"), path.join(process.cwd(), "app")].filter((p) => {
          try {
            return fs.statSync(p).isDirectory()
          } catch {
            return false
          }
        })

  if (roots.length === 0) {
    const msg = "No se encontraron directorios src/ ni app/ para escanear."
    if (jsonOut) {
      console.log(JSON.stringify({ status: "SKIPPED", message: msg, violations: [] }, null, 2))
    } else {
      console.log(`[lint-charts] ${msg}`)
    }
    process.exit(0)
  }

  const files = roots.flatMap((r) => walk(r))
  const allViolations = files.flatMap((f) => lintFile(f))

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          status: allViolations.length === 0 ? "PASS" : "FAIL",
          filesScanned: files.length,
          violations: allViolations,
          summary: allViolations.length === 0
            ? "No se encontraron chartConfig con hsl()+oklch misuse."
            : `${allViolations.length} violacion(es) detectada(s).`
        },
        null,
        2
      )
    )
  } else {
    console.log(`[lint-charts] Escaneados ${files.length} archivos.`)
    if (allViolations.length === 0) {
      console.log("[lint-charts] PASS - sin violaciones.")
    } else {
      console.log(`[lint-charts] FAIL - ${allViolations.length} violacion(es):`)
      for (const v of allViolations) {
        const rel = path.relative(process.cwd(), v.file)
        console.log(
          `  ${rel}:${v.line}:${v.column}  ${v.pattern}\n` +
            `    match: ${v.match}\n` +
            `    fix:   ${v.fix}\n` +
            `    line:  ${v.snippet}`
        )
      }
    }
  }

  process.exit(allViolations.length === 0 ? 0 : 1)
}

main()