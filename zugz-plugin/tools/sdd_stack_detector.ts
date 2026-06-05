import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { StackProfile, findProfilesDir, loadProfileFromDisk, loadAllProfiles } from "./sdd_stack_detector_lib.js"

function fileExistsIn(projectRoot: string, rel: string, deep: boolean): boolean {
  const fullPath = path.join(projectRoot, rel)
  if (fs.existsSync(fullPath)) {
    if (!deep) return true
    try {
      return fs.statSync(fullPath).isFile()
    } catch {
      return false
    }
  }
  return false
}

function globExists(projectRoot: string, pattern: string): boolean {
  const fullPath = path.join(projectRoot, pattern)
  if (fs.existsSync(fullPath)) return true
  if (pattern.includes("*")) {
    try {
      const segs = pattern.split("/")
      let dir = projectRoot
      for (let i = 0; i < segs.length - 1; i++) {
        dir = path.join(dir, segs[i])
      }
      if (!fs.existsSync(dir)) return false
      const lastSeg = segs[segs.length - 1]
      const isGlob = lastSeg.includes("*")
      if (!isGlob) return false
      const prefix = lastSeg.split("*")[0]
      const entries = fs.readdirSync(dir)
      return entries.some(e => e.startsWith(prefix))
    } catch {
      return false
    }
  }
  return false
}

function matchProfile(projectRoot: string, profile: StackProfile): { matched: boolean; matchedBy: string[] } {
  const matchedBy: string[] = []
  for (const f of profile.detect.files_any) {
    if (fileExistsIn(projectRoot, f, false)) {
      matchedBy.push(`files_any: ${f}`)
    }
  }
  for (const pattern of profile.detect.files_any_deep) {
    if (globExists(projectRoot, pattern)) {
      matchedBy.push(`files_any_deep: ${pattern}`)
    }
  }
  return { matched: matchedBy.length > 0, matchedBy }
}

export default tool({
  description: `Detector y gestor de stack profile. Identifica el stack del proyecto (Node/TS, Python, Go, Rust, Java, GAS, static-site, etc.) leyendo los profiles en profiles/*.json.
  
  Acciones:
  - "detect": Detecta el stack_profile del proyecto. Retorna el ID del profile más específico.
  - "list": Lista todos los profiles disponibles.
  - "get": Obtiene la definición completa de un profile por ID.
  - "match": Lista todos los profiles que matchean el proyecto (útil para desambiguar).

  Los profiles están en profiles/<id>.json y siguen el formato:
  {
    "id": "node-typescript",
    "detect": { "files_any": ["package.json"], "files_any_deep": ["tsconfig.json"] },
    "test_runners": [...],
    "linters": [...],
    "deploy": { "kind": "dev-server", "dev_cmd": "npm run dev" }
  }`,
  args: {
    action: tool.schema.enum(["detect", "list", "get", "match"])
      .describe("Acción a ejecutar"),
    profileId: tool.schema.string().optional()
      .describe("ID del profile (para action=get)")
  },
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory
    const profilesDir = findProfilesDir(projectRoot)

    if (!profilesDir) {
      return JSON.stringify({
        status: "FAILED",
        reason: "No se encontró directorio 'profiles' en el proyecto ni en node_modules/zugzbot-sdd/profiles/."
      }, null, 2)
    }

    if (args.action === "list") {
      const profiles = loadAllProfiles(projectRoot).map(p => ({
        id: p.id,
        display_name: p.display_name
      }))
      return JSON.stringify({
        status: "SUCCESS",
        profiles,
        profiles_dir: profilesDir
      }, null, 2)
    }

    if (args.action === "get") {
      if (!args.profileId) {
        return JSON.stringify({
          status: "FAILED",
          reason: "Falta 'profileId'."
        }, null, 2)
      }
      const p = loadProfileFromDisk(path.join(profilesDir, `${args.profileId}.json`))
      if (!p) {
        return JSON.stringify({
          status: "FAILED",
          reason: `Profile '${args.profileId}' no encontrado en ${profilesDir}`
        }, null, 2)
      }
      return JSON.stringify({
        status: "SUCCESS",
        profile: p
      }, null, 2)
    }

    if (args.action === "match") {
      const profiles = loadAllProfiles(projectRoot)
      const matches: Array<{ id: string; matchedBy: string[] }> = []
      for (const p of profiles) {
        const result = matchProfile(projectRoot, p)
        if (result.matched) {
          matches.push({ id: p.id, matchedBy: result.matchedBy })
        }
      }
      return JSON.stringify({
        status: "SUCCESS",
        matches
      }, null, 2)
    }

    if (args.action === "detect") {
      const profiles = loadAllProfiles(projectRoot)
      const allMatches: Array<{ id: string; score: number; matchedBy: string[] }> = []
      for (const p of profiles) {
        const result = matchProfile(projectRoot, p)
        if (result.matched) {
          allMatches.push({
            id: p.id,
            score: result.matchedBy.length,
            matchedBy: result.matchedBy
          })
        }
      }
      if (allMatches.length === 0) {
        return JSON.stringify({
          status: "SUCCESS",
          stack_profile: "unknown",
          reason: "Ningún profile matcheó. Revisar profiles/ o crear uno custom.",
          candidates: []
        }, null, 2)
      }
      allMatches.sort((a, b) => b.score - a.score)
      return JSON.stringify({
        status: "SUCCESS",
        stack_profile: allMatches[0].id,
        score: allMatches[0].score,
        candidates: allMatches
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})
