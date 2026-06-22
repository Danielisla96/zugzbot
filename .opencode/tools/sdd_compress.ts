import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import crypto from "crypto"

// Helper to safely resolve root directory
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

/**
 * Comprime código fuente eliminando comentarios, docstrings y líneas vacías.
 */
export function compressCode(code: string, commentStyle: "slash" | "hash" = "slash"): string {
  if (!code) return ""
  
  let inString: string | null = null
  let inComment: "single" | "multi" | null = null
  let result = ""
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const nextChar = code[i + 1] || ""
    
    if (inComment === "multi") {
      if (char === "*" && nextChar === "/") {
        inComment = null
        i++ // Skip '/'
      }
      continue
    }
    
    if (inComment === "single") {
      if (char === "\n" || char === "\r") {
        inComment = null
        result += char
      }
      continue
    }
    
    if (inString) {
      if (char === inString && code[i - 1] !== "\\") {
        inString = null
      }
      result += char
      continue
    }
    
    // Check for comments based on style
    if (commentStyle === "slash") {
      if (char === "/" && nextChar === "*") {
        inComment = "multi"
        i++
        continue
      }
      if (char === "/" && nextChar === "/") {
        inComment = "single"
        i++
        continue
      }
    } else if (commentStyle === "hash") {
      if (char === "#") {
        inComment = "single"
        continue
      }
    }
    
    // Check for string start
    if (char === "'" || char === '"' || char === "`") {
      inString = char
    }
    
    result += char
  }
  
  // Clean up empty lines
  return result
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0)
    .join("\n")
}

/**
 * Comprime cadenas JSON grandes recortando arrays a un tamaño máximo.
 */
export function compressJson(jsonStr: string, maxItems = 3): string {
  if (!jsonStr) return ""
  try {
    const obj = JSON.parse(jsonStr)
    
    const prune = (o: any): any => {
      if (Array.isArray(o)) {
        if (o.length > maxItems) {
          const sliced = o.slice(0, maxItems).map(prune)
          sliced.push(`... [ZCS: ${o.length - maxItems} elementos omitidos]`)
          return sliced
        }
        return o.map(prune)
      } else if (o !== null && typeof o === "object") {
        const res: any = {}
        for (const k of Object.keys(o)) {
          res[k] = prune(o[k])
        }
        return res
      }
      return o
    }
    
    return JSON.stringify(prune(obj), null, 2)
  } catch (e) {
    // Si no es JSON válido, devolver el texto original
    return jsonStr
  }
}

/**
 * Comprime logs de consola de tests unitarios (Vitest/pytest),
 * preservando los fallos, errores y resúmenes de suites.
 */
export function compressTestLogs(logs: string): string {
  if (!logs) return ""
  const lines = logs.split(/\r?\n/)
  const result: string[] = []
  
  let recordingError = false
  let errorLinesCount = 0
  
  for (const line of lines) {
    const upper = line.toUpperCase()
    
    // Detectar inicio de fallos o errores
    const isErrorIndicator = 
      line.includes("FAIL") || 
      line.includes("Error:") || 
      line.includes("AssertionError") || 
      line.includes("❌") || 
      upper.includes("EXCEPTION") || 
      upper.includes("FAILED")
      
    if (isErrorIndicator) {
      recordingError = true
      errorLinesCount = 0
      result.push(line)
      continue
    }
    
    if (recordingError) {
      // Guardar las primeras 8 líneas del error/stack trace
      if (errorLinesCount < 8) {
        result.push(line)
        errorLinesCount++
      } else {
        // Truncar stack traces largos del framework (node_modules/vitest, etc.)
        if (line.trim() === "" || line.includes("PASS") || line.includes("Test Suites:")) {
          recordingError = false
          result.push("   [... ZCS: stack trace del framework omitido para ahorrar tokens ...]")
          result.push(line)
        }
      }
    } else {
      // Siempre conservar resúmenes e información de suites exitosas
      const isSummaryIndicator = 
        line.includes("PASS") || 
        line.includes("Summary") || 
        line.includes("Test Suites:") || 
        line.includes("Tests:") || 
        line.includes("Snapshots:") || 
        line.includes("Time:") || 
        line.includes("Ran all test suites")
        
      if (isSummaryIndicator || line.trim().startsWith("✓")) {
        result.push(line)
      }
    }
  }
  
  // Si no se capturaron líneas o todo pasó muy rápido, retornar resumido
  if (result.length === 0) {
    return logs.length > 500 ? `${logs.slice(0, 500)}\n... [ZCS: truncado por longitud]` : logs
  }
  
  return result.join("\n")
}

/**
 * Registra el contenido crudo en disco (CCR) y devuelve un placeholder comprimido.
 */
export function ccrCompress(content: string, category: string, context: any): string {
  if (!content) return ""
  
  const root = getRoot(context)
  const rawContextDir = path.resolve(root, ".openspec/.raw_context")
  
  if (!fs.existsSync(rawContextDir)) {
    fs.mkdirSync(rawContextDir, { recursive: true })
  }
  
  // Calcular hash del contenido para evitar duplicados
  const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 12)
  const destFile = path.join(rawContextDir, `${hash}.txt`)
  
  // Escribir solo si no existe ya
  if (!fs.existsSync(destFile)) {
    fs.writeFileSync(destFile, content, "utf8")
  }
  
  const lineCount = content.split(/\r?\n/).length
  return `[CONTEXTO_COMPRIMIDO: ${hash} (Tipo: ${category}, Líneas: ${lineCount}). Si necesitas ver el contenido completo sin compresión para editar o depurar, ejecuta la herramienta sdd_retrieve_raw({ hash: "${hash}" })]`
}

// Tool: sdd_retrieve_raw
export const retrieve_raw = tool({
  description: "Recupera un bloque de contexto original sin comprimir (logs, código, JSON) a partir de su hash identificador.",
  args: {
    hash: tool.schema.string().describe("El hash de 12 caracteres del contexto que deseas recuperar (ej. 'a1b2c3d4e5f6').")
  },
  async execute(args, context) {
    try {
      const root = getRoot(context)
      const hash = args.hash.trim()
      const rawPath = path.resolve(root, `.openspec/.raw_context/${hash}.txt`)
      
      if (!fs.existsSync(rawPath)) {
        return JSON.stringify({
          success: false,
          message: `No se encontró el contexto original para el hash '${hash}'. El caché podría haber sido purgado.`
        }, null, 2)
      }
      
      const content = fs.readFileSync(rawPath, "utf8")
      return content
    } catch (e: any) {
      return JSON.stringify({
        success: false,
        message: `Error al recuperar contexto crudo: ${e.message || e}`
      }, null, 2)
    }
  }
})
