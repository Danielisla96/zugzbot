import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Intenta corregir de forma autónoma errores sintácticos y de compilación simples (comillas rotas, llaves huérfanas, imports duplicados) en base a los logs de error del linter o compilador.",
  args: {
    errorLogs: tool.schema.string().describe("El log de error bruto del compilador o linter."),
    targetFile: tool.schema.string().optional().describe("Archivo sugerido que contiene el error. Si no se provee, se detectará del log.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const report: string[] = ["━━━ sdd_auto_healer ━━━"];

    let detectedFile = args.targetFile;

    // 1. Detectar archivo del log si no se provee
    if (!detectedFile) {
      const fileMatch = args.errorLogs.match(/([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/i);
      if (fileMatch) {
        detectedFile = fileMatch[1];
      }
    }

    if (!detectedFile) {
      return `[SDD AutoHealer] No se pudo identificar ningún archivo objetivo del log de error. Omitiendo.`;
    }

    const fullPath = path.join(projectRoot, detectedFile);
    if (!fs.existsSync(fullPath)) {
      return `[SDD AutoHealer] El archivo detectado no existe en el disco: ${detectedFile}`;
    }

    try {
      let content = fs.readFileSync(fullPath, "utf-8");
      let modified = false;

      // ── MÉTODOS DE AUTOCURACIÓN ESTÁNDAR ──

      // 1. Corregir llaves/paréntesis sin cerrar simples al final de archivos JS/TS
      if (args.errorLogs.includes("Unexpected end of input") || args.errorLogs.includes("Unclosed")) {
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          content += "\n" + "}".repeat(openBraces - closeBraces);
          report.push(`✓ Autocurado: Se añadieron ${openBraces - closeBraces} llaves '}' faltantes al final del archivo.`);
          modified = true;
        }

        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (openParens > closeParens) {
          content += "\n" + ")".repeat(openParens - closeParens);
          report.push(`✓ Autocurado: Se añadieron ${openParens - closeParens} paréntesis ')' faltantes al final del archivo.`);
          modified = true;
        }
      }

      // 2. Resolver imports duplicados simples
      if (args.errorLogs.includes("has already been declared") || args.errorLogs.includes("Duplicate identifier")) {
        const lines = content.split("\n");
        const seenImports = new Set<string>();
        const cleanedLines = lines.filter(line => {
          if (line.trim().startsWith("import ")) {
            if (seenImports.has(line.trim())) {
              report.push(`✓ Autocurado: Import duplicado eliminado de raíz: '${line.trim()}'`);
              modified = true;
              return false;
            }
            seenImports.add(line.trim());
          }
          return true;
        });
        if (modified) {
          content = cleanedLines.join("\n");
        }
      }

      // 3. Corregir punto y coma faltante o errores de formato de JSON simples
      if (detectedFile.endsWith(".json") && (args.errorLogs.includes("JSON") || args.errorLogs.includes("Unexpected token"))) {
        // Eliminar comas colgantes simples al final de objetos JSON (trailing commas)
        const repaired = content.replace(/,(\s*[\]}])/g, "$1");
        if (repaired !== content) {
          content = repaired;
          report.push(`✓ Autocurado: Se removió una coma colgante en el archivo JSON.`);
          modified = true;
        }
      }

      // 4. Guardar archivo si fue modificado
      if (modified) {
        fs.writeFileSync(fullPath, content, "utf-8");
        report.push(`✓ Archivo '${detectedFile}' guardado y reparado de manera autónoma.`);
        return report.join("\n");
      }

      return `[SDD AutoHealer] No se pudo encontrar un patrón de error auto-curable conocido para '${detectedFile}'.`;
    } catch (e: any) {
      return `[SDD AutoHealer] Error intentando auto-curar archivo: ${e.message || e}`;
    }
  }
})
