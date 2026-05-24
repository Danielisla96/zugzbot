import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

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
    return `⚠️  ${skillName}: movido (SKILL.md no encontrado, .md alternativo: ${files.join(", ")})`
  }
  return `✓ ${skillName} → .opencode/skills/${skillName}/`
}

export default tool({
  description: "Ejecuta npx autoskills y migra automáticamente los skills instalados en .agents/skills/ a .opencode/skills/. Integra detección post-instalación y reporte.",
  args: {
    dryRun: tool.schema.boolean().optional().default(false).describe("Si es true, solo muestra qué se movería sin ejecutar autoskills ni mover archivos")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const agentsSkillsDir = path.join(projectRoot, ".agents/skills")
    const opencodeSkillsDir = path.join(projectRoot, ".opencode/skills")

    const report: string[] = []
    report.push("━━━ sdd_install_autoskills ━━━")

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
        report.push(`  📦 ${skill} ${tag} → .opencode/skills/${skill}/`)
      }
    } else {
      report.push("\n📦 Migrando skills a .opencode/skills/:")
      for (const skill of allSkills) {
        const result = moveSkill(agentsSkillsDir, skill, opencodeSkillsDir)
        report.push(`  ${result}${newSkills.includes(skill) ? " (nuevo)" : " (movido)"}`)
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
