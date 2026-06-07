import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import {
  StackProfile,
  findProfilesDir,
  loadProfileFromDisk,
  loadAllProfiles,
  matchProfileInRoot
} from "./sdd_stack_detector_lib.js"

export default tool({
  description: `Detector y gestor de stack profile. Identifica el stack del proyecto (Node/TS, Python, Go, Rust, Java, GAS, static-site, etc.) leyendo los profiles en profiles/*.json.
  
  Acciones:
  - "detect": Detecta el stack_profile del proyecto. Retorna el ID del profile más específico.
  - "list": Lista todos los profiles disponibles.
  - "get": Obtiene la definición completa de un profile por ID.
  - "match": Lista todos los profiles que matchean el proyecto (útil para desambiguar).
  - "matchForChange": Resuelve el stack_profile para un change_name específico, opcionalmente acotado a una subcarpeta (subprojectCwd). Soluciona el caso de proyectos políglotas donde el root tiene un stack pero el cambio ocurre en un subdirectorio con otro stack.

  Los profiles están en profiles/<id>.json y siguen el formato:
  {
    "id": "node-typescript",
    "detect": { "files_any": ["package.json"], "files_any_deep": ["tsconfig.json"] },
    "test_runners": [...],
    "linters": [...],
    "deploy": { "kind": "dev-server", "dev_cmd": "npm run dev" }
  }`,
  args: {
    action: tool.schema.enum(["detect", "list", "get", "match", "matchForChange"])
      .describe("Acción a ejecutar"),
    profileId: tool.schema.string().optional()
      .describe("ID del profile (para action=get)"),
    changeName: tool.schema.string().optional()
      .describe("Nombre del change (kebab-case). Para action=matchForChange."),
    subprojectCwd: tool.schema.string().optional()
      .describe("Ruta relativa al subproyecto (e.g., 'backend'). Aplica a detect y matchForChange. Si se omite, detecta en root.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd()
    if (projectRoot === "/") {
      projectRoot = process.cwd()
    }
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
        const result = matchProfileInRoot(projectRoot, p)
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
      const subprojectCwd = args.subprojectCwd || ""
      const targetRoot = subprojectCwd
        ? (() => {
            const candidate = path.join(projectRoot, subprojectCwd)
            if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
              return candidate
            }
            return projectRoot
          })()
        : projectRoot
      const profiles = loadAllProfiles(projectRoot)
      const allMatches: Array<{ id: string; score: number; matchedBy: string[] }> = []
      for (const p of profiles) {
        const result = matchProfileInRoot(targetRoot, p)
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
          detected_at: subprojectCwd || ".",
          candidates: []
        }, null, 2)
      }
      allMatches.sort((a, b) => b.score - a.score)
      return JSON.stringify({
        status: "SUCCESS",
        stack_profile: allMatches[0].id,
        score: allMatches[0].score,
        detected_at: subprojectCwd || ".",
        candidates: allMatches
      }, null, 2)
    }

    if (args.action === "matchForChange") {
      const changeName = args.changeName || ""
      const subprojectCwd = args.subprojectCwd || ""
      const profiles = loadAllProfiles(projectRoot)

      let resolvedAt = ""
      let targetRoot = projectRoot

      if (subprojectCwd) {
        const candidate = path.join(projectRoot, subprojectCwd)
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
          targetRoot = candidate
          resolvedAt = subprojectCwd
        } else {
          return JSON.stringify({
            status: "SUCCESS",
            change_name: changeName,
            subproject_cwd: subprojectCwd,
            resolved_at: "",
            stack_profile: bestMatchAt(projectRoot, profiles).id,
            candidates: candidatesAt(projectRoot, profiles),
            warning: `subprojectCwd '${subprojectCwd}' no existe. Fallback a root.`
          }, null, 2)
        }
      } else {
        // Sin subprojectCwd: deducir del change_name o escanear subdirs.
        // Solo escanear subdirs si el change_name tiene un prefijo "scoping" (add-, fix-, feat-, update-).
        const inferred = inferSubdirFromChangeName(changeName, projectRoot)
        if (inferred) {
          targetRoot = path.join(projectRoot, inferred)
          resolvedAt = inferred
        } else if (isScopingChangeName(changeName)) {
          // Fallback: si el root matchea un stack pero existe una subcarpeta con
          // un stack diferente, preferir el stack de la subcarpeta (proyectos políglotas).
          const rootBest = bestMatchAt(projectRoot, profiles)
          if (rootBest.id !== "unknown") {
            const otherInSubdirs = firstSubdirWithDifferentProfile(projectRoot, profiles, rootBest.id)
            if (otherInSubdirs) {
              targetRoot = path.join(projectRoot, otherInSubdirs)
              resolvedAt = otherInSubdirs
            }
          }
        }
      }

      const best = bestMatchAt(targetRoot, profiles)
      return JSON.stringify({
        status: "SUCCESS",
        change_name: changeName,
        subproject_cwd: subprojectCwd,
        resolved_at: resolvedAt,
        stack_profile: best.id,
        candidates: candidatesAt(targetRoot, profiles)
      }, null, 2)
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `Acción '${args.action}' no reconocida.`
    }, null, 2)
  }
})

function bestMatchAt(root: string, profiles: StackProfile[]): { id: string; score: number } {
  const allMatches: Array<{ id: string; score: number }> = []
  for (const p of profiles) {
    const result = matchProfileInRoot(root, p)
    if (result.matched) {
      allMatches.push({ id: p.id, score: result.matchedBy.length })
    }
  }
  if (allMatches.length === 0) {
    return { id: "unknown", score: 0 }
  }
  allMatches.sort((a, b) => b.score - a.score)
  return allMatches[0]
}

function candidatesAt(root: string, profiles: StackProfile[]) {
  const allMatches: Array<{ id: string; score: number; matchedBy: string[] }> = []
  for (const p of profiles) {
    const result = matchProfileInRoot(root, p)
    if (result.matched) {
      allMatches.push({
        id: p.id,
        score: result.matchedBy.length,
        matchedBy: result.matchedBy
      })
    }
  }
  return allMatches
}

function inferSubdirFromChangeName(changeName: string, projectRoot: string): string | null {
  if (!changeName) return null
  // Convención: si el change_name empieza con "add-<subdir>-..." y esa subdir existe
  // en el proyecto, devolverla. Útil para que zugzbot no tenga que pasar subprojectCwd
  // explícitamente en casos comunes.
  const m = changeName.match(/^(?:add|fix|feat|update|refactor|remove)-([a-z0-9-]+?)-(?:to-|for-|on-)?/i)
  if (!m) return null
  const candidate = m[1]
  const full = path.join(projectRoot, candidate)
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    return candidate
  }
  return null
}

function isScopingChangeName(changeName: string): boolean {
  if (!changeName) return false
  return /^(?:add|fix|feat|update|refactor|remove)-/i.test(changeName)
}

function firstSubdirWithDifferentProfile(projectRoot: string, profiles: StackProfile[], rootProfileId: string): string | null {
  const excludeDirs = ["node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage", "venv", ".venv"]
  let entries: string[] = []
  try {
    entries = fs.readdirSync(projectRoot)
  } catch {
    return null
  }
  for (const entry of entries) {
    if (excludeDirs.includes(entry)) continue
    const fullPath = path.join(projectRoot, entry)
    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }
    if (!stat.isDirectory()) continue
    const subBest = bestMatchAt(fullPath, profiles)
    if (subBest.id !== "unknown" && subBest.id !== rootProfileId) {
      return entry
    }
  }
  return null
}
