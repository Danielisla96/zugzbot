import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Audita la estética de la interfaz de usuario en busca de colores genéricos, fuentes predeterminadas del navegador y verifica el cumplimiento de las directrices visuales premium (sdd-ux-premium).",
  args: {
    changeName: tool.schema.string().optional().describe("El nombre del cambio activo en kebab-case. Si no se provee, se detectará automáticamente."),
    localPort: tool.schema.number().optional().describe("Puerto del servidor de desarrollo local (ej: 3000) para intentar capturar screenshot opcional.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    
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
        } catch (e) {}
      }
    }

    if (!changeName) {
      changeName = "nuevo-cambio";
    }

    const reportDir = path.join(projectRoot, ".openspec/changes", changeName);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, "ui_report.md");

    // 2. Escaneo Estático
    const nonPremiumColors = [
      /\b(red|blue|green|yellow|black|white|purple|orange|pink|gray|grey)\b/i,
      /#(ff0000|0000ff|00ff00|ffff00|000000|ffffff)\b/i
    ];

    const premiumFonts = ["Inter", "Outfit", "Roboto", "Outfit", "Sans-Serif", "system-ui", "sans-serif"];

    interface FileFinding {
      file: string;
      colorIssues: string[];
      fontIssues: string[];
      hasTransitions: boolean;
    }

    const findings: FileFinding[] = [];
    
    function scanDir(dir: string, depth = 0) {
      if (depth > 6) return;
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file !== "node_modules" && file !== ".git" && file !== ".openspec" && file !== ".opencode" && file !== "dist" && file !== ".next" && file !== "build") {
            scanDir(fullPath, depth + 1);
          }
        } else {
          const ext = path.extname(file).toLowerCase();
          if ([".css", ".tsx", ".jsx", ".html"].includes(ext)) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              const relPath = path.relative(projectRoot, fullPath);
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

              if (colorIssues.length > 0 || fontIssues.length > 0 || !hasTransitions) {
                findings.push({
                  file: relPath,
                  colorIssues: colorIssues.slice(0, 5), // Limitar a 5 issues por archivo
                  fontIssues,
                  hasTransitions
                });
              }
            } catch (e) {}
          }
        }
      }
    }

    scanDir(projectRoot);

    // 3. Intento de Screenshot Headless (Opcional si provee puerto)
    let screenshotStatus = "No ejecutado (Puerto no provisto o dev server inactivo)";
    let screenshotPathRel = "";
    if (args.localPort) {
      try {
        const screenshotFile = path.join(reportDir, "screenshot_ui.png");
        execSync(`npx -y playwright-cli screenshot http://localhost:${args.localPort} ${screenshotFile} --timeout 5000`, { stdio: "ignore" });
        if (fs.existsSync(screenshotFile)) {
          screenshotStatus = `Captura realizada con éxito en puerto ${args.localPort}!`;
          screenshotPathRel = `./screenshot_ui.png`;
        }
      } catch (e: any) {
        screenshotStatus = `Intento fallido de captura: ${e.message || e}`;
      }
    }

    // 4. Escribir reporte markdown premium
    let totalIssues = 0;
    findings.forEach(f => totalIssues += f.colorIssues.length + f.fontIssues.length + (f.hasTransitions ? 0 : 1));

    const markdown = `# 🎨 Reporte de Auditoría Estética UI/UX: ${changeName}

Este reporte ha sido autogenerado por la herramienta premium **sdd_ui_auditor** para auditar el cumplimiento estricto de las directrices de percepción visual **sdd-ux-premium**.

> [!NOTE]
> **Resumen del Diagnóstico Estético:**
> - **Total de Errores/Advertencias:** ${totalIssues}
> - **Archivos Auditados con Observaciones:** ${findings.length}
> - **Captura de Pantalla Visual:** ${screenshotStatus}

${screenshotPathRel ? `### 📸 Captura de Pantalla Realizada\n![UI Realtime Live](${screenshotPathRel})\n` : ""}

## 📊 Detalle de Archivos Escaneados

${findings.length === 0 ? "### ¡Felicidades! 🎉 No se encontraron problemas estéticos. La interfaz sigue las directrices premium al 100%." : findings.map(f => `
### 📁 Archivo: \`${f.file}\`
- **Micro-animaciones / Transiciones:** ${f.hasTransitions ? "🟢 Detectadas" : "🟡 **FALTAN TRANSICIONES SUAVES** (Agrega cubic-bezier o transition)"}
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

    fs.writeFileSync(reportPath, markdown, "utf-8");

    return `[SDD UI Auditor] Reporte de estética UI generado con éxito en ${path.relative(projectRoot, reportPath)}. Total advertencias: ${totalIssues}.`;
  }
})
