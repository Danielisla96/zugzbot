import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { readLockfile } from "./sdd_lock_manager.js"

function readdirSafe(dir: string): string[] {
  try { return fs.readdirSync(dir) } catch { return [] }
}

function rmrf(dir: string) {
  fs.rmSync(dir, { recursive: true, force: true })
}

function moveSkill(srcDir: string, skillName: string, destBase: string): string {
  const src = path.join(srcDir, skillName)
  const dest = path.join(destBase, skillName)

  if (fs.existsSync(dest)) rmrf(dest)
  fs.mkdirSync(destBase, { recursive: true })
  fs.renameSync(src, dest)

  const skillFile = path.join(dest, "SKILL.md")
  if (!fs.existsSync(skillFile)) {
    const files = readdirSafe(dest).filter(f => f.endsWith(".md"))
    if (files.length === 0) return `⚠️  ${skillName}: movido pero sin SKILL.md`
    return `⚠️  ${skillName}: movido (SKILL.md no encontrado)`
  }
  return `✓ ${skillName} → .opencode/skills/${skillName}/`
}

const SKILL_TO_PROFILE_AFFINITY: Record<string, string[]> = {
  "sdd-clean-architecture": ["node-typescript", "node-javascript", "python", "go", "rust", "java"],
  "sdd-secure-coding": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "static-site"],
  "sdd-root-cause-diagnostician": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "gas", "static-site"],
  "sdd-token-economy": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "gas", "static-site"],
  "sdd-brain-curator": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "gas", "static-site"],
  "sdd-dependency-cooldown": ["node-typescript", "node-javascript", "python", "go", "rust", "java"],
  "sdd-tree-generator": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "gas", "static-site"],
  "sdd-auto-api-mocker": ["node-typescript", "node-javascript", "python", "gas"],
  "sdd-semantic-context-pruner": ["node-typescript", "node-javascript", "python", "go", "rust", "java"],
  "sdd-auto-rollback-recovery": ["node-typescript", "node-javascript", "python", "go", "rust", "java", "static-site"]
}

function skillApplicableToProfile(skillName: string, profileId: string): boolean {
  if (profileId === "unknown") return true
  const affinity = SKILL_TO_PROFILE_AFFINITY[skillName]
  if (!affinity) return true
  return affinity.includes(profileId)
}

export default tool({
  description: `Instala y resuelve skills del swarm de forma agnóstica al stack.
  
  Acciones:
  - "install": Ejecuta npx autoskills --yes y migra .agents/skills/ → .opencode/skills/ (comportamiento legacy v1).
  - "list": Lista los skills actualmente disponibles en .opencode/skills/ con su afinidad de profile.
  - "resolve-by-profile": Dado el stack_profile activo del lockfile, retorna qué skills son relevantes.
  - "sync": Sincroniza y recomienda skills basado en el profile activo (resolución automática).`,
  args: {
    action: tool.schema.enum(["install", "list", "resolve-by-profile", "sync"])
      .describe("Acción a ejecutar"),
    dryRun: tool.schema.boolean().optional().default(false)
      .describe("Si es true, solo simula la acción install sin modificar archivos"),
    profileId: tool.schema.string().optional()
      .describe("ID del profile (opcional, si no se da se lee del lockfile)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory

    if (args.action === "list") {
      const skillsDir = path.join(projectRoot, ".opencode/skills")
      const skills = readdirSafe(skillsDir).filter(s => {
        const sp = path.join(skillsDir, s)
        try { return fs.statSync(sp).isDirectory() } catch { return false }
      })

      const list = skills.map(s => {
        const affinity = SKILL_TO_PROFILE_AFFINITY[s] || ["*"]
        return { name: s, applicable_to: affinity }
      })
      return JSON.stringify({
        status: "SUCCESS",
        skills: list,
        total: skills.length
      }, null, 2)
    }

    if (args.action === "resolve-by-profile") {
      const lock = readLockfile(projectRoot)
      const profileId = args.profileId || lock.stack_profile || "unknown"
      const skillsDir = path.join(projectRoot, ".opencode/skills")
      const skills = readdirSafe(skillsDir).filter(s => {
        const sp = path.join(skillsDir, s)
        try { return fs.statSync(sp).isDirectory() } catch { return false }
      })

      const applicable = skills.filter(s => skillApplicableToProfile(s, profileId))
      const notApplicable = skills.filter(s => !skillApplicableToProfile(s, profileId))

      return JSON.stringify({
        status: "SUCCESS",
        active_profile: profileId,
        applicable_skills: applicable,
        not_applicable_skills: notApplicable,
        recommended: applicable.length > 0 ? applicable : skills
      }, null, 2)
    }

    if (args.action === "sync") {
      const lock = readLockfile(projectRoot)
      const profileId = lock.stack_profile || "unknown"
      const skillsDir = path.join(projectRoot, ".opencode/skills")
      const skills = readdirSafe(skillsDir).filter(s => {
        const sp = path.join(skillsDir, s)
        try { return fs.statSync(sp).isDirectory() } catch { return false }
      })

      const lines: string[] = []
      lines.push("━━━ sdd_install_autoskills (sync) ━━━")
      lines.push(`Stack profile activo: ${profileId}`)
      lines.push("")
      lines.push("📦 Skills aplicables a este stack:")
      for (const s of skills.filter(s => skillApplicableToProfile(s, profileId))) {
        lines.push(`  ✓ ${s}`)
      }
      const notApplicable = skills.filter(s => !skillApplicableToProfile(s, profileId))
      if (notApplicable.length > 0) {
        lines.push("")
        lines.push("⏭️  Skills no relevantes (se mantienen pero no se activan):")
        for (const s of notApplicable) {
          lines.push(`  - ${s}`)
        }
      }
      lines.push("━━━ fin ━━━")
      return lines.join("\n")
    }

    const agentsSkillsDir = path.join(projectRoot, ".agents/skills")
    const opencodeSkillsDir = path.join(projectRoot, ".opencode/skills")

    const report: string[] = []
    report.push("━━━ sdd_install_autoskills (install) ━━━")

    const beforeSkills = new Set(readdirSafe(agentsSkillsDir))

    if (args.dryRun) {
      report.push("[DRY-RUN] Saltando ejecución de npx autoskills")
    } else {
      try {
        report.push("▶ Ejecutando npx -y autoskills --yes...")
        const output = execSync("npx -y autoskills --yes 2>&1", {
          cwd: projectRoot,
          encoding: "utf-8",
          timeout: 120000
        })
        const lines = output.split("\n").filter((l: string) => l.trim())
        report.push(...lines.slice(0, 30).map((l: string) => `  ${l}`))
        if (lines.length > 30) report.push(`  ... (${lines.length - 30} líneas más)`)
      } catch (e: any) {
        report.push(`❌ Error ejecutando autoskills: ${e.message || e}`)
        return report.join("\n")
      }
    }

    const afterSkills = readdirSafe(agentsSkillsDir)
    const newSkills = afterSkills.filter(s => !beforeSkills.has(s))
    const allSkills = afterSkills.filter(s => {
      const skillPath = path.join(agentsSkillsDir, s)
      try { return fs.statSync(skillPath).isDirectory() } catch { return false }
    })

    if (allSkills.length === 0) {
      report.push("📭 No se encontraron skills en .agents/skills/ para migrar")
      return report.join("\n")
    }

    if (args.dryRun) {
      report.push("\n[DRY-RUN] Skills que se migrarían:")
      for (const skill of allSkills) {
        const tag = newSkills.includes(skill) ? "(nuevo)" : "(pre-existente)"
        const profileTag = skillApplicableToProfile(skill, readLockfile(projectRoot).stack_profile) ? "" : " [no-applicable-al-profile]"
        report.push(`  📦 ${skill} ${tag}${profileTag} → .opencode/skills/${skill}/`)
      }
    } else {
      report.push("\n📦 Migrando skills a .opencode/skills/:")
      for (const skill of allSkills) {
        const result = moveSkill(agentsSkillsDir, skill, opencodeSkillsDir)
        const tag = newSkills.includes(skill) ? " (nuevo)" : " (movido)"
        report.push(`  ${result}${tag}`)
      }

      const remaining = readdirSafe(agentsSkillsDir)
      if (remaining.length === 0) {
        try { fs.rmdirSync(agentsSkillsDir) } catch {}
        report.push("🧹 .agents/skills/ eliminado (quedó vacío)")
      }
    }

    report.push("━━━ fin ━━━")
    return report.join("\n")
  }
})
