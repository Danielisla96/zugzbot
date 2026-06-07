import fs from "fs"
import path from "path"

export interface StackProfile {
  id: string
  display_name: string
  detect: {
    files_any: string[]
    files_any_deep: string[]
  }
  test_runners: Array<{
    name: string
    cmd: string
    detect: string | null
  }>
  linters: Array<{
    name: string
    cmd: string
    detect: string | null
  }>
  formatters: Array<{
    name: string
    cmd: string
    detect: string | null
  }>
  deploy: {
    kind: "dev-server" | "publish" | "clasp" | "build" | "none"
    dev_cmd?: string
    build_cmd?: string
    publish_cmd?: string
    clasp_action?: "push" | "pull"
  }
  skip_tools: string[]
  required_tools: string[]
  conventions: {
    test_dir: string
    test_unit_dir: string
    test_integration_dir: string
    source_dir: string
    version_file: string
  }
  frameworks_hint?: Record<string, Record<string, string>>
  globals_to_mock?: string[]
}

const PROFILES_DIR_CANDIDATES = [
  "profiles",
  ".opencode/profiles",
  "node_modules/zugzbot-sdd/profiles"
]

export function findProfilesDir(projectRoot: string): string | null {
  for (const candidate of PROFILES_DIR_CANDIDATES) {
    const p = path.join(projectRoot, candidate)
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      return p
    }
  }
  return null
}

export function loadProfileFromDisk(profilePath: string): StackProfile | null {
  try {
    const content = fs.readFileSync(profilePath, "utf-8")
    return JSON.parse(content) as StackProfile
  } catch {
    return null
  }
}

export function loadAllProfiles(projectRoot: string): StackProfile[] {
  const dir = findProfilesDir(projectRoot)
  if (!dir) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => loadProfileFromDisk(path.join(dir, f)))
    .filter((p): p is StackProfile => p !== null)
}

export function getProfileById(projectRoot: string, id: string): StackProfile | null {
  const dir = findProfilesDir(projectRoot)
  if (!dir) return null
  return loadProfileFromDisk(path.join(dir, `${id}.json`))
}

export function fileExistsIn(projectRoot: string, rel: string, deep: boolean): boolean {
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

export function globExists(projectRoot: string, pattern: string): boolean {
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

export function matchProfileInRoot(targetRoot: string, profile: StackProfile): { matched: boolean; matchedBy: string[] } {
  const matchedBy: string[] = []
  for (const f of profile.detect.files_any) {
    if (fileExistsIn(targetRoot, f, false)) {
      matchedBy.push(`files_any: ${f}`)
    }
  }
  for (const pattern of profile.detect.files_any_deep) {
    if (globExists(targetRoot, pattern)) {
      matchedBy.push(`files_any_deep: ${pattern}`)
    }
  }
  return { matched: matchedBy.length > 0, matchedBy }
}

export function matchProfileSubdirs(projectRoot: string, profile: StackProfile): boolean {
  for (const f of profile.detect.files_any) {
    if (fileExistsIn(projectRoot, f, false)) return true
  }
  for (const pattern of profile.detect.files_any_deep) {
    if (globExists(projectRoot, pattern)) return true
  }

  try {
    const entries = fs.readdirSync(projectRoot)
    const excludeDirs = ["node_modules", ".git", ".openspec", ".opencode", "dist", "build", ".next", "coverage"]
    for (const entry of entries) {
      if (excludeDirs.includes(entry)) continue
      const fullPath = path.join(projectRoot, entry)
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        for (const f of profile.detect.files_any) {
          if (fileExistsIn(fullPath, f, false)) return true
        }
        for (const pattern of profile.detect.files_any_deep) {
          if (globExists(fullPath, pattern)) return true
        }
      }
    }
  } catch {}

  return false
}
