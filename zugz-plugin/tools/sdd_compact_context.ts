import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

function pruneFileContent(filePath: string): string {
  const ext = path.extname(filePath)
  if (!fs.existsSync(filePath)) {
    return `// Archivo no encontrado: ${filePath}`
  }
  const content = fs.readFileSync(filePath, "utf-8")
  if (![".ts", ".js", ".py"].includes(ext)) {
    return content // Keep other file types intact
  }

  const lines = content.split("\n")
  const prunedLines: string[] = []
  
  if (ext === ".py") {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith("def ") || trimmed.startsWith("class ") || trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
        prunedLines.push(line)
        if (i + 1 < lines.length && (lines[i + 1].trim().startsWith(`"""`) || lines[i + 1].trim().startsWith(`'''`))) {
          prunedLines.push(lines[i + 1])
        }
      }
    }
    return prunedLines.join("\n") || "# (Empty signature)"
  } else {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (
        trimmed.startsWith("import ") ||
        trimmed.startsWith("export ") ||
        trimmed.startsWith("interface ") ||
        trimmed.startsWith("type ") ||
        trimmed.startsWith("class ") ||
        (trimmed.startsWith("const ") && (trimmed.includes("=") || trimmed.includes("=>"))) ||
        trimmed.startsWith("function ") ||
        trimmed.startsWith("public ") ||
        trimmed.startsWith("private ") ||
        trimmed.startsWith("protected ") ||
        trimmed.startsWith("async ")
      ) {
        prunedLines.push(line)
      }
    }
    return prunedLines.join("\n") || "// (Empty signature)"
  }
}

export default tool({
  description: "Crea una consolidación técnica de alta densidad (compaction snapshot) de los artefactos de la fase actual para optimizar tokens y reiniciar la memoria del subagente.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Si se omite, se autodetectará del sdd-lock."),
    filesToPrune: tool.schema.array(tool.schema.string()).optional().describe("Lista de archivos (relativos al root) de los cuales extraer firmas/declaraciones para compactar y agregar al snapshot.")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;

    // 1. Detectar cambio
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

    if (!changeName || changeName === "nuevo-cambio") {
      return `[Compactor Blocked] Error: No se pudo resolver el nombre del cambio activo.`;
    }

    const changeDir = path.join(projectRoot, ".openspec/changes", changeName);
    if (!fs.existsSync(changeDir)) {
      return `[Compactor Blocked] Error: No se encuentra el directorio del cambio en ${path.relative(projectRoot, changeDir)}`;
    }

    // 2. Leer artefactos individuales
    const proposalPath = path.join(changeDir, "proposal.md");
    let specPath = path.join(changeDir, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md");
    }
    const archPath = path.join(changeDir, "orchestrator_architecture.md");
    const tasksPath = path.join(changeDir, "orchestrator_tasks.md");

    let proposalSummary = "No disponible";
    let specsSummary = "No disponible";
    let archSummary = "No disponible";
    let tasksSummary = "No disponible";

    if (fs.existsSync(proposalPath)) {
      const content = fs.readFileSync(proposalPath, "utf-8");
      const descMatch = content.match(/## Description[\s\S]*?(?=##|$)/i) || content.match(/#[\s\S]*?(?=##|$)/i);
      proposalSummary = descMatch ? descMatch[0].trim() : content.substring(0, 500);
    }

    if (fs.existsSync(specPath)) {
      const content = fs.readFileSync(specPath, "utf-8");
      const scens: string[] = [];
      const lines = content.split("\n");
      lines.forEach(l => {
        if (l.trim().startsWith("Scenario:") || l.trim().startsWith("Escenario:")) {
          scens.push(l.trim());
        }
      });
      specsSummary = scens.length > 0 ? `Escenarios validados:\n${scens.map(s => `- ${s}`).join("\n")}` : "Escenarios BDD no estructurados.";
    }

    if (fs.existsSync(archPath)) {
      const content = fs.readFileSync(archPath, "utf-8");
      const mermaid = content.match(/```mermaid[\s\S]*?```/i);
      archSummary = mermaid ? `Esquema Arquitectónico:\n${mermaid[0]}` : "Sin diagramas Mermaid de arquitectura.";
    }

    if (fs.existsSync(tasksPath)) {
      const content = fs.readFileSync(tasksPath, "utf-8");
      const total = (content.match(/- \[[ xX]\]/g) || []).length;
      const completed = (content.match(/- \[[xX]\]/g) || []).length;
      tasksSummary = `Checklist de Tareas: ${completed}/${total} completadas.\n` + 
        content.split("\n").filter(l => l.includes("- [ ]") || l.includes("- [x]")).slice(0, 10).join("\n") +
        (total > 10 ? "\n... (y más)" : "");
    }

    // 3. Escribir el Snapshot consolidado
    const snapshotPath = path.join(changeDir, "compaction_snapshot.md");
    const nowStr = new Date().toISOString().split('T')[0];

    let prunedCodeSummary = "";
    if (args.filesToPrune && args.filesToPrune.length > 0) {
      prunedCodeSummary = "\n## 📁 Firmas de Código Compactadas (Declaraciones de API)\n";
      for (const relFile of args.filesToPrune) {
        const fullFilePath = path.join(projectRoot, relFile);
        const ext = path.extname(relFile);
        const lang = ext === ".py" ? "python" : (ext === ".ts" ? "typescript" : "javascript");
        if (fs.existsSync(fullFilePath)) {
          const signatures = pruneFileContent(fullFilePath);
          prunedCodeSummary += `\n### [${relFile}](file:///${fullFilePath})\n\`\`\`${lang}\n${signatures}\n\`\`\`\n`;
        } else {
          prunedCodeSummary += `\n### ⚠️ Archivo no encontrado: \`${relFile}\`\n`;
        }
      }
      prunedCodeSummary += "\n---\n";
    }

    const markdown = `# 🧠 Consolidado de Contexto de Alta Densidad (SDD Compaction)
Fecha de consolidación: ${nowStr}
Cambio Activo: \`${changeName}\`

---

## 📜 Propuesta y Objetivos
${proposalSummary}

---

## 📐 Especificaciones y Escenarios
${specsSummary}

---

## 🏛️ Estructura Arquitectónica
${archSummary}

---

## 📋 Estado del Checklist
${tasksSummary}

---
${prunedCodeSummary}
> [!TIP]
> **Acción Recomendada para Limpiar Memoria de Contexto:**
> Si eres un subagente y ves este archivo, tu memoria ha sido compactada con éxito.
> Lee **únicamente** este archivo de consolidación para entender el estado actual y los contratos técnicos previos. Descarta la lectura repetitiva de chats históricos o archivos de logs antiguos.
`;

    fs.writeFileSync(snapshotPath, markdown, "utf-8");

    return `[SDD Compactor] Consolidado de alta densidad generado con éxito en ${path.relative(projectRoot, snapshotPath)}.`;
  }
})
