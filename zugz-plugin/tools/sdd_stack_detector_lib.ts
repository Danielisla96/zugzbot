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
