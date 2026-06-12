import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import os from "os"

function decodeGitPath(gitPath: string): string {
  let cleaned = gitPath.replace(/^"|"$/g, "")
  if (cleaned.includes("\\")) {
    try {
      const bytes: number[] = []
      let i = 0
      while (i < cleaned.length) {
        if (cleaned[i] === "\\" && i + 3 < cleaned.length && /^[0-7]{3}$/.test(cleaned.substring(i + 1, i + 4))) {
          const octalVal = cleaned.substring(i + 1, i + 4)
          bytes.push(parseInt(octalVal, 8))
          i += 4
        } else {
          if (cleaned[i] === "\\" && i + 1 < cleaned.length) {
            const next = cleaned[i + 1]
            if (next === "n") { bytes.push(10); i += 2 }
            else if (next === "t") { bytes.push(9); i += 2 }
            else if (next === "\\") { bytes.push(92); i += 2 }
            else if (next === "\"") { bytes.push(34); i += 2 }
            else { bytes.push(cleaned.charCodeAt(i)); i++ }
          } else {
            const code = cleaned.charCodeAt(i)
            if (code < 128) {
              bytes.push(code)
            } else {
              const buf = Buffer.from(cleaned[i], "utf-8")
              for (let b = 0; b < buf.length; b++) {
                bytes.push(buf[b])
              }
            }
            i++
          }
        }
      }
      return Buffer.from(bytes).toString("utf-8")
    } catch {
      return cleaned.replace(/\\([0-7]{3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8))
      })
    }
  }
  return cleaned
}

function sanitizeGitPath(line: string): string {
  const content = line.substring(3).trim()
  if (content.includes(" -> ")) {
    const parts = content.split(" -> ")
    return decodeGitPath(parts[1])
  }
  return decodeGitPath(content)
}

function checkHtmlTagBalance(filePath: string, content: string): string[] {
  const ext = path.extname(filePath).toLowerCase();
  if (![".html", ".tsx", ".jsx", ".ts", ".js"].includes(ext)) {
    return [];
  }

  const issues: string[] = [];
  let cleaned = content;
  if (ext === ".html") {
    cleaned = content.replace(/<!--[\s\S]*?-->/g, "");
    cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, "");
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  } else {
    cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); // JS/TS comments
  }

  // Strip TypeScript generic type arguments from function calls or declarations (e.g. createSignal<string[]>)
  // JSX tags are never directly preceded by a word character (like \w+), whereas TS generics are.
  cleaned = cleaned.replace(/(\w+)<([A-Za-z0-9_[\]\s|]+)>/g, '$1');

  const tagRegex = /<(\/?[a-zA-Z0-9:-]+)(?:\s+[^>]*?)?>/g;
  const stack: string[] = [];
  const selfClosingTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  
  let match;
  while ((match = tagRegex.exec(cleaned)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    if (fullTag.endsWith('/>')) continue;
    if (selfClosingTags.has(tagName)) continue;
    if (fullTag.startsWith('<?') || fullTag.endsWith('?>')) continue;
    if (fullTag.startsWith('<!')) continue;
    
    if (tagName.startsWith('/')) {
      const closingName = tagName.substring(1);
      if (stack.length === 0) {
        issues.push(`Etiqueta de cierre sin apertura: </${closingName}>`);
        break;
      }
      const lastOpen = stack.pop();
      if (lastOpen !== closingName) {
        issues.push(`Anidamiento roto: se esperaba </${lastOpen}> pero se encontró </${closingName}>`);
        break;
      }
    } else {
      stack.push(tagName);
    }
  }
  
  if (stack.length > 0 && issues.length === 0) {
    issues.push(`Etiquetas sin cerrar: <${stack.join('>, <')}>`);
  }
  
  return issues;
}

function detectLocalDevPort(projectRoot: string): number | null {
  try {
    const lsofOut = execSync("lsof -iTCP -sTCP:LISTEN -P -n", { encoding: "utf-8", stdio: "pipe" });
    const lines = lsofOut.split("\n");
    const commonPorts = [5173, 3000, 8000, 8080, 3001, 5174];
    for (const port of commonPorts) {
      if (lines.some(l => l.includes(`:${port} `) || l.includes(`*:${port} `))) {
        return port;
      }
    }
  } catch (e) {}

  try {
    const viteConfigPath = path.join(projectRoot, "frontend/vite.config.js");
    if (fs.existsSync(viteConfigPath)) {
      const content = fs.readFileSync(viteConfigPath, "utf-8");
      const portMatch = content.match(/port:\s*(\d+)/);
      if (portMatch) return parseInt(portMatch[1]);
    }
  } catch (e) {}

  return null;
}


export default tool({
  description: "Audita la estética de la interfaz de usuario en busca de colores genéricos, fuentes predeterminadas del navegador y verifica el cumplimiento de las directrices visuales premium (sdd-ux-premium) de forma localizada.",
  args: {
    changeName: tool.schema.string().optional().describe("El nombre del cambio activo en kebab-case. Si no se provee, se detectará automáticamente."),
    localPort: tool.schema.number().optional().describe("Puerto del servidor de desarrollo local (ej: 3000) para intentar capturar screenshot opcional.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
    
    // 1. Detectar el cambio activo
    let changeName = args.changeName;
    if (!changeName) {
      const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
      const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
      let activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);
      if (activeLockPath) {
        try {
          const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"));
          if (lockObj.change_name && lockObj.change_name !== "nuevo-cambio") {
            changeName = lockObj.change_name;
          }
        } catch {
          // Ignorar error de lectura de lock
        }
      }
    }

    if (!changeName) {
      changeName = "nuevo-cambio";
    }

    let reportDir = path.join(projectRoot, ".openspec/changes", changeName);
    let reportPath = path.join(reportDir, "ui_report.md");
    let usingFallbackPath = false;

    try {
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
    } catch (e) {
      usingFallbackPath = true;
      reportDir = path.join(os.tmpdir(), "openspec-ui-reports", changeName);
      try {
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }
        reportPath = path.join(reportDir, "ui_report.md");
      } catch (err) {
        // Fallback final silencioso
      }
    }

    // 2. Recopilar archivos a auditar de forma localizada (Regla de Impacto Localizado)
    const filesToAudit = new Set<string>();

    // A. Buscar archivos modificados en Git que sean de UI
    if (fs.existsSync(path.join(projectRoot, ".git"))) {
      try {
        const gitOutput = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf-8" });
        gitOutput.split("\n").forEach(line => {
          if (!line || line.length < 4) return;
          const filePathRel = sanitizeGitPath(line);
          const ext = path.extname(filePathRel).toLowerCase();
          if ([".css", ".tsx", ".jsx", ".html"].includes(ext)) {
            filesToAudit.add(filePathRel);
          }
        });
      } catch {
        // Ignorar error de git status
      }
    }

    // B. Buscar archivos listados en el spec.md activo
    const changeDir = path.join(projectRoot, ".openspec/changes", changeName);
    let specPath = path.join(changeDir, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md");
    }
    if (fs.existsSync(specPath)) {
      try {
        const specContent = fs.readFileSync(specPath, "utf-8");
        const fileRegex = /[`']([^`']+\.(css|tsx|jsx|html))[`']/gi;
        let match;
        while ((match = fileRegex.exec(specContent)) !== null) {
          const matchedFile = match[1].trim();
          if (fs.existsSync(path.join(projectRoot, matchedFile))) {
            filesToAudit.add(matchedFile);
          }
        }
      } catch {
        // Ignorar error de lectura de spec
      }
    }

    // 3. Escaneo de las clases y estilos UI
    const nonPremiumColors = [
      /\b(red|blue|green|yellow|black|white|purple|orange|pink|gray|grey)\b/i,
      /#(ff0000|0000ff|00ff00|ffff00|000000|ffffff)\b/i
    ];

    const premiumFonts = ["Inter", "Outfit", "Roboto", "Sans-Serif", "system-ui", "sans-serif"];

    interface FileFinding {
      file: string;
      colorIssues: string[];
      fontIssues: string[];
      hasTransitions: boolean;
      structuralIssues: string[];
    }

    const findings: FileFinding[] = [];

    filesToAudit.forEach(fileRel => {
      const fullPath = path.join(projectRoot, fileRel);
      if (!fs.existsSync(fullPath)) return;
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const colorIssues: string[] = [];
        const fontIssues: string[] = [];
        let hasTransitions = false;

        // Analizar líneas
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          // Chequear colores
          if (line.includes("color") || line.includes("bg-") || line.includes("background") || line.includes("border")) {
            nonPremiumColors.forEach(reg => {
              const match = line.match(reg);
              if (match) {
                colorIssues.push(`Línea ${index + 1}: ${line.trim()} (Detectado color genérico '${match[0]}')`);
              }
            });
          }
          
          // Chequear transiciones
          if (line.includes("transition") || line.includes("cubic-bezier") || line.includes("animate-")) {
            hasTransitions = true;
          }
        });

        // Chequear fuentes
        if (content.includes("font-family")) {
          const hasPremium = premiumFonts.some(f => content.includes(f));
          if (!hasPremium) {
            fontIssues.push("Define 'font-family' pero no incluye fuentes premium recomendadas (Inter, Outfit, etc.).");
          }
        }

        // Chequear balance estructural HTML/DOM
        const structuralIssues = checkHtmlTagBalance(fileRel, content);

        if (colorIssues.length > 0 || fontIssues.length > 0 || !hasTransitions || structuralIssues.length > 0) {
          findings.push({
            file: fileRel,
            colorIssues: colorIssues.slice(0, 5), // Limitar a 5 por archivo
            fontIssues,
            hasTransitions,
            structuralIssues
          });
        }
      } catch {
        // Ignorar error de lectura de archivo a auditar
      }
    });

    // 4. Intento de Screenshot Headless (Opcional si provee o detecta puerto)
    let screenshotStatus = "No ejecutado (Puerto no provisto/detectado o dev server inactivo)";
    let screenshotPathRel = "";
    const targetPort = args.localPort || detectLocalDevPort(projectRoot);
    if (targetPort) {
      try {
        const screenshotFile = path.join(reportDir, "screenshot_ui.png");
        execSync(`npx -y playwright-cli screenshot http://localhost:${targetPort} ${screenshotFile} --timeout 5000`, { stdio: "ignore" });
        if (fs.existsSync(screenshotFile)) {
          screenshotStatus = `Captura realizada con éxito en puerto ${targetPort}!`;
          screenshotPathRel = `./screenshot_ui.png`;
        }
      } catch (e: any) {
        screenshotStatus = `Intento fallido de captura en puerto ${targetPort}: ${e.message || e}`;
      }
    }

    // 5. Escribir reporte markdown premium
    let totalIssues = 0;
    findings.forEach(f => totalIssues += f.colorIssues.length + f.fontIssues.length + f.structuralIssues.length + (f.hasTransitions ? 0 : 1));

    const markdown = `# 🎨 Reporte de Auditoría Estética y Estructural UI/UX: ${changeName}

Este reporte ha sido autogenerado por la herramienta premium **sdd_ui_auditor** para auditar el cumplimiento estricto de las directrices de percepción visual **sdd-ux-premium** y balance estructural de marcado de manera focalizada.

> [!NOTE]
> **Resumen del Diagnóstico Estético y Estructural (Impacto Localizado):**
> - **Total de Errores/Advertencias:** ${totalIssues}
> - **Archivos de UI Auditados con Observaciones:** ${findings.length}
> - **Captura de Pantalla Visual:** ${screenshotStatus}

${screenshotPathRel ? `### 📸 Captura de Pantalla Realizada\n![UI Realtime Live](${screenshotPathRel})\n` : ""}

## 📊 Detalle de Archivos Escaneados

${findings.length === 0 ? "### ¡Felicidades! 🎉 No se encontraron problemas estéticos ni de marcado en los archivos modificados. Tu UI sigue las directrices premium al 100%." : findings.map(f => `
### 📁 Archivo: \`${f.file}\`
- **Micro-animaciones / Transiciones:** ${f.hasTransitions ? "🟢 Detectadas" : "🟡 **FALTAN TRANSICIONES SUAVES** (Agrega cubic-bezier o transition)"}
${f.structuralIssues.length > 0 ? `- **Errores de Marcado Estructural (DOM):**\n${f.structuralIssues.map(s => `  - 🔴 ${s}`).join("\n")}` : "🟢 Balance de etiquetas HTML correcto"}
${f.colorIssues.length > 0 ? `- **Colores Genéricos Detectados:**\n${f.colorIssues.map(c => `  - ${c}`).join("\n")}` : "🟢 Colores correctos"}
${f.fontIssues.length > 0 ? `- **Estilo Tipográfico:**\n${f.fontIssues.map(fi => `  - ${fi}`).join("\n")}` : "🟢 Tipografía correcta o heredada correctamente"}
`).join("\n---\n")}

---

## 💡 Recomendaciones para Diseño Premium

1. **Reemplazo de Colores Planos:**
   - En lugar de usar colores puros o genéricos (como rojo, azul o gris plano), define una paleta HSL adaptada.
   - *Ejemplo:* Usa HSL con tonos pastel sofisticados o grises de base carbón (\`hsl(220, 15%, 16%)\`).

2. **Tipografía moderna en CSS:**
   - Asegura la importación de una tipografía de alta fidelidad:
     \`\`\`css
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
     body {
       font-family: 'Inter', sans-serif;
     }
     \`\`\`

3. **Curvas de Transición Suaves:**
   - En efectos hover o interactivos, evita transiciones secas de 0.1s. Utiliza:
     \`\`\`css
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
     \`\`\`
`;

    try {
      fs.writeFileSync(reportPath, markdown, "utf-8");
    } catch (e: any) {
      return `[SDD UI Auditor Error] No se pudo escribir el reporte debido a restricciones de permisos: ${e.message}. Total advertencias: ${totalIssues}.`;
    }

    const finalPath = usingFallbackPath ? reportPath : path.relative(projectRoot, reportPath);
    return `[SDD UI Auditor] Reporte de estética UI generado con éxito en ${finalPath}. Total advertencias: ${totalIssues}.`;
  }
})
