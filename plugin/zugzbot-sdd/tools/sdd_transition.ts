import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

export default tool({
  description: "Tránsiciona de fase en el ciclo Spec-Driven Development (SDD), actualizando el archivo de bloqueo lockfile .openspec/sdd-lock.json de forma segura, e integra control de cambios en Git de forma automática.",
  args: {
    nextPhase: tool.schema.number().describe("El número de la siguiente fase del ciclo SDD (0-8)"),
    status: tool.schema.string().describe("El nuevo estado del ciclo (ej: 'idle', 'in_progress', 'corrective_loop')"),
    reason: tool.schema.string().describe("La justificación o explicación resumida de los cambios logrados en esta fase"),
    activeSubagent: tool.schema.string().optional().describe("El subagente activo opcional (ej: 'sdd-architect', 'sdd-implementer')"),
    iteration: tool.schema.number().optional().describe("El número de iteración correctiva opcional")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    let lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");

    // Validar si existe .openspec/sdd-lock.json o si es openspec/sdd-lock.json
    if (!fs.existsSync(lockfilePath)) {
      const altPath = path.join(projectRoot, "openspec/sdd-lock.json");
      if (fs.existsSync(altPath)) {
        lockfilePath = altPath;
      } else {
        // Si no existe ninguno, creamos el directorio y el archivo por defecto
        const dirPath = path.join(projectRoot, ".openspec");
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    }

    let lockfile: any = {
      change_name: "nuevo-cambio",
      active_phase: 0,
      active_subagent: "sdd-architect",
      status: "idle",
      auto_pilot: false,
      iteration: 0,
      last_updated: ""
    };

    if (fs.existsSync(lockfilePath)) {
      try {
        lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf-8"));
      } catch (e) {
        // Fallback a valores por defecto si está corrupto
      }
    }

    // Actualizar campos
    lockfile.active_phase = args.nextPhase;
    lockfile.status = args.status;
    lockfile.last_updated = new Date().toISOString().split('T')[0];

    if (args.activeSubagent) {
      lockfile.active_subagent = args.activeSubagent;
    } else {
      // Autocompletado del subagente según la fase
      const subagentMapping: { [key: number]: string } = {
        0: "sdd-architect",
        1: "sdd-architect",
        2: "sdd-architect",
        3: "sdd-implementer",
        4: "sdd-implementer",
        5: "sdd-launcher",
        6: "sdd-release-manager",
        7: "sdd-release-manager",
        8: "sdd-release-manager"
      };
      lockfile.active_subagent = subagentMapping[args.nextPhase] || "sdd-architect";
    }

    if (args.iteration !== undefined) {
      lockfile.iteration = args.iteration;
    }

    // Escribir los cambios
    fs.writeFileSync(lockfilePath, JSON.stringify(lockfile, null, 2), "utf-8");

    // Escribir en el log o auditoría interna del cambio activo si existe el directorio
    if (lockfile.change_name && lockfile.change_name !== "nuevo-cambio") {
      const changeDir = path.join(projectRoot, ".openspec/changes", lockfile.change_name);
      if (fs.existsSync(changeDir)) {
        const historyPath = path.join(changeDir, "phase_history.jsonl");
        const logEntry = {
          timestamp: new Date().toISOString(),
          phase: args.nextPhase,
          subagent: lockfile.active_subagent,
          status: args.status,
          reason: args.reason,
          iteration: lockfile.iteration || 0
        };
        fs.appendFileSync(historyPath, JSON.stringify(logEntry) + "\n", "utf-8");
      }
    }

    // INTEGRACIÓN AUTOMÁTICA CON GIT
    let gitStatus = "";
    if (fs.existsSync(path.join(projectRoot, ".git")) && lockfile.change_name && lockfile.change_name !== "nuevo-cambio") {
      try {
        const branchName = `sdd/change-${lockfile.change_name}`;
        
        // 1. Chequear rama actual
        const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
        
        if (currentBranch !== branchName) {
          // Chequear si la rama existe localmente
          let branchExists = false;
          try {
            execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: projectRoot });
            branchExists = true;
          } catch (e) {}

          if (branchExists) {
            execSync(`git checkout ${branchName}`, { cwd: projectRoot, stdio: "ignore" });
          } else {
            execSync(`git checkout -b ${branchName}`, { cwd: projectRoot, stdio: "ignore" });
          }
        }

        // 2. Hacer commit automático de los artefactos .openspec/
        execSync("git add .openspec/", { cwd: projectRoot, stdio: "ignore" });
        
        const commitMsg = `docs(sdd): transition to phase ${args.nextPhase} - ${args.reason.replace(/"/g, '\\"')}`;
        execSync(`git commit -m "${commitMsg}"`, { cwd: projectRoot, stdio: "ignore" });
        
        gitStatus = ` [Git: Rama '${branchName}' actualizada con commit semántico]`;
      } catch (e: any) {
        gitStatus = ` [Git Warning: No se pudo realizar commit automático: ${e.message || e}]`;
      }
    }

    return `[SDD Tool] Fase transicionada con éxito a Fase ${args.nextPhase} (${lockfile.active_subagent}). Estado: ${args.status}. Motivo: ${args.reason}.${gitStatus}`;
  }
})
