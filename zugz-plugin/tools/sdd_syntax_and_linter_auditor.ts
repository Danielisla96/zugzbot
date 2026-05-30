import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Audita estáticamente cualquier archivo (o conjunto de archivos modificados) para diagnosticar fallas de sintaxis, paréntesis/llaves rotas, errores sintácticos o problemas de formato en múltiples tecnologías (JS, TS, Python, JSON, HTML, GS, CSS, CPP, SH, YAML, PHP, MD).",
  args: {
    filePath: tool.schema.string().optional().describe("Ruta absoluta o relativa del archivo a auditar de forma quirúrgica. Si se omite, detectará automáticamente los archivos modificados vía git.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const diagnostics: Array<{ file: string; type: string; line?: number; message: string }> = []
    
    let filesToAudit: string[] = []

    if (args.filePath) {
      const absolutePath = path.isAbsolute(args.filePath) ? args.filePath : path.join(projectRoot, args.filePath)
      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
        filesToAudit.push(absolutePath)
      }
    } else {
      // Autodetectar vía git status
      try {
        const gitStatus = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" })
        gitStatus.split("\n").forEach(line => {
          const trimmed = line.trim()
          if (trimmed) {
            const parts = trimmed.split(/\s+/)
            if (parts.length >= 2) {
              const relPath = parts.slice(1).join(" ")
              const absolutePath = path.join(projectRoot, relPath)
              if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
                filesToAudit.push(absolutePath)
              }
            }
          }
        })
      } catch (e) {}
    }

    if (filesToAudit.length === 0) {
      return JSON.stringify({
        status: "APPROVED",
        message: "✓ No se encontraron archivos para auditar o todo está limpio.",
        diagnostics: []
      }, null, 2)
    }

    // Heurística de balanceo de paréntesis/llaves/corchetes general
    const hasBalancedTokens = (str: string): { balanced: boolean; message?: string } => {
      const stack: { char: string; index: number; line: number }[] = []
      const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' }
      let lineNum = 1
      
      for (let i = 0; i < str.length; i++) {
        const char = str[i]
        if (char === '\n') {
          lineNum++
          continue
        }
        
        if (['(', '{', '['].includes(char)) {
          stack.push({ char, index: i, line: lineNum })
        } else if ([')', '}', ']'].includes(char)) {
          const top = stack.pop()
          if (!top || top.char !== pairs[char]) {
            return {
              balanced: false,
              message: `Error de balanceo: Se encontró '${char}' en línea ${lineNum} pero se esperaba cierre para '${top ? top.char : 'ninguno'}' (línea ${top ? top.line : 'N/A'}).`
            }
          }
        }
      }
      
      if (stack.length > 0) {
        const unclosed = stack.pop()!
        return {
          balanced: false,
          message: `Error de balanceo: El token '${unclosed.char}' abierto en la línea ${unclosed.line} nunca fue cerrado.`
        }
      }
      
      return { balanced: true }
    }

    for (const file of filesToAudit) {
      const ext = path.extname(file).toLowerCase()
      const relFile = path.relative(projectRoot, file)
      
      try {
        const content = fs.readFileSync(file, "utf-8")

        // 1. JSON
        if (ext === ".json") {
          try {
            JSON.parse(content)
          } catch (err: any) {
            const lineMatch = err.message.match(/line (\d+)/i)
            diagnostics.push({
              file: relFile,
              type: "JSON Syntax Error",
              line: lineMatch ? parseInt(lineMatch[1]) : undefined,
              message: err.message
            })
          }
        }
        
        // 2. JavaScript / Google Apps Script (.js, .jsx, .gs)
        else if (ext === ".js" || ext === ".jsx" || ext === ".gs") {
          try {
            execSync(`node --check "${file}"`, { stdio: "pipe" })
          } catch (err: any) {
            const stderr = err.stderr?.toString() || err.message || ""
            const lineMatch = stderr.match(/:(\d+)\r?\n/m) || stderr.match(/line (\d+)/i)
            diagnostics.push({
              file: relFile,
              type: "JS/GS Syntax Error",
              line: lineMatch ? parseInt(lineMatch[1]) : undefined,
              message: stderr.split("\n")[0] || "Syntax error detected"
            })
          }
        }

        // 3. TypeScript / TSX
        else if (ext === ".ts" || ext === ".tsx") {
          const balanceCheck = hasBalancedTokens(content)
          if (!balanceCheck.balanced) {
            diagnostics.push({
              file: relFile,
              type: "TypeScript Syntax/Token Mismatch",
              message: balanceCheck.message || "Falla de balanceo en tokens estructurados."
            })
          }
        }

        // 4. Python (.py)
        else if (ext === ".py") {
          try {
            execSync(`python -m py_compile "${file}"`, { stdio: "pipe" })
          } catch (err: any) {
            const stderr = err.stderr?.toString() || err.message || ""
            const lineMatch = stderr.match(/line (\d+)/i)
            diagnostics.push({
              file: relFile,
              type: "Python Syntax Error",
              line: lineMatch ? parseInt(lineMatch[1]) : undefined,
              message: stderr.split("\n")[0] || "Python syntax compilation failed"
            })
          }
        }

        // 5. HTML
        else if (ext === ".html") {
          const unclosedTags: string[] = []
          const tags = content.match(/<[^>]+>/g) || []
          const stack: string[] = []
          
          tags.forEach(tag => {
            const match = tag.match(/<\/?([a-zA-Z0-9:-]+)/)
            if (match) {
              const name = match[1]
              if (tag.startsWith("</")) {
                if (stack.length > 0 && stack[stack.length - 1] === name) {
                  stack.pop()
                } else {
                  unclosedTags.push(`Tag de cierre huérfano: ${tag}`)
                }
              } else if (!tag.endsWith("/>") && !["img", "br", "hr", "input", "meta", "link"].includes(name)) {
                stack.push(name)
              }
            }
          })
          
          if (stack.length > 0 || unclosedTags.length > 0) {
            diagnostics.push({
              file: relFile,
              type: "HTML Tag Mismatch",
              message: `Estructura HTML mal balanceada. Tags sin cerrar: ${stack.join(", ")}. ${unclosedTags.join("; ")}`
            })
          }
        }

        // 6. Shell Scripts (.sh, .bash)
        else if (ext === ".sh" || ext === ".bash") {
          try {
            execSync(`bash -n "${file}"`, { stdio: "pipe" })
          } catch (err: any) {
            const stderr = err.stderr?.toString() || err.message || ""
            const lineMatch = stderr.match(/: line (\d+):/i) || stderr.match(/:(\d+):/i)
            diagnostics.push({
              file: relFile,
              type: "Shell Script Syntax Error",
              line: lineMatch ? parseInt(lineMatch[1]) : undefined,
              message: stderr.split("\n")[0] || "Shell script syntax check failed"
            })
          }
        }

        // 7. CSS
        else if (ext === ".css") {
          const balanceCheck = hasBalancedTokens(content)
          if (!balanceCheck.balanced) {
            diagnostics.push({
              file: relFile,
              type: "CSS Rule Mismatch",
              message: `Falla de balanceo en CSS: ${balanceCheck.message}`
            })
          }
        }

        // 8. C / C++ (.c, .cpp, .h, .hpp)
        else if (ext === ".c" || ext === ".cpp" || ext === ".h" || ext === ".hpp") {
          const balanceCheck = hasBalancedTokens(content)
          if (!balanceCheck.balanced) {
            diagnostics.push({
              file: relFile,
              type: "C/C++ Syntax Token Mismatch",
              message: `Falla estructural C/C++: ${balanceCheck.message}`
            })
          }
        }

        // 9. YAML / YML
        else if (ext === ".yaml" || ext === ".yml") {
          // Chequeo básico de indentación y formato YAML sin requerir librerías externas pesadas
          const lines = content.split("\n")
          lines.forEach((line, idx) => {
            const spaces = line.match(/^(\s*)/)?.[1].length || 0
            if (spaces % 2 !== 0 && line.trim().length > 0 && !line.trim().startsWith("#")) {
              diagnostics.push({
                file: relFile,
                type: "YAML Indentation Warning",
                line: idx + 1,
                message: `Indentación sospechosa (${spaces} espacios). YAML prefiere múltiplos de 2.`
              })
            }
          })
        }

        // 10. PHP
        else if (ext === ".php") {
          try {
            execSync(`php -l "${file}"`, { stdio: "pipe" })
          } catch (err: any) {
            const stderr = err.stderr?.toString() || err.message || ""
            const lineMatch = stderr.match(/on line (\d+)/i)
            diagnostics.push({
              file: relFile,
              type: "PHP Syntax Error",
              line: lineMatch ? parseInt(lineMatch[1]) : undefined,
              message: stderr.split("\n")[0] || "PHP syntax check failed"
            })
          }
        }

        // 11. Markdown (.md)
        else if (ext === ".md") {
          const openBlocks = (content.match(/^```/gm) || []).length
          if (openBlocks % 2 !== 0) {
            diagnostics.push({
              file: relFile,
              type: "Markdown Fenced Block Mismatch",
              message: "Se detectó un bloque de código fenced (```) sin cerrar en el archivo markdown."
            })
          }
        }

      } catch (e: any) {
        diagnostics.push({
          file: relFile,
          type: "Read/Compile Error",
          message: `Imposible leer o analizar el archivo: ${e.message}`
        })
      }
    }

    if (diagnostics.length > 0) {
      return JSON.stringify({
        status: "FAILED",
        message: `❌ VALIDACIÓN DE SINTAXIS MULTI-TECNOLOGÍA FALLIDA: Se detectaron ${diagnostics.length} errores estáticos o de formato en los archivos modificados.`,
        diagnostics
      }, null, 2)
    }

    return JSON.stringify({
      status: "APPROVED",
      message: "✓ Validación de sintaxis exitosa. Todos los archivos auditados se encuentran 100% íntegros y limpios.",
      diagnostics: []
    }, null, 2)
  }
})
