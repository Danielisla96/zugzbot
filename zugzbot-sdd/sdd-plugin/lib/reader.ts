import fs from 'node:fs/promises'
import path from 'node:path'
import type { SddLock, PhaseHistoryEntry, TaskItem } from './types'

export async function readLockFile(workspaceDir: string): Promise<SddLock | null> {
  try {
    const content = await fs.readFile(path.join(workspaceDir, '.openspec', 'sdd-lock.json'), 'utf8')
    return JSON.parse(content) as SddLock
  } catch {
    return null
  }
}

export async function readPhaseHistory(workspaceDir: string, changeName: string): Promise<PhaseHistoryEntry[]> {
  try {
    const content = await fs.readFile(
      path.join(workspaceDir, '.openspec', 'changes', changeName, 'phase_history.jsonl'),
      'utf8',
    )
    const lines = content.trim().split('\n').filter(Boolean)
    const entries: PhaseHistoryEntry[] = []
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line)
        if (parsed.timestamp && typeof parsed.phase === 'number') {
          entries.push(parsed as PhaseHistoryEntry)
        }
      } catch {
        // skip malformed lines
      }
    }
    return entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  } catch {
    return []
  }
}

export async function readTaskChecklist(workspaceDir: string, changeName: string): Promise<TaskItem[]> {
  try {
    const content = await fs.readFile(
      path.join(workspaceDir, '.openspec', 'changes', changeName, 'orchestrator_tasks.md'),
      'utf8',
    )
    return parseMarkdownChecklist(content)
  } catch {
    return []
  }
}

function parseMarkdownChecklist(content: string): TaskItem[] {
  const items: TaskItem[] = []
  let currentSection = 'General'

  for (const line of content.split('\n')) {
    const sectionMatch = line.match(/^##+\s+(.+)/)
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim()
      continue
    }

    const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)/)
    if (taskMatch) {
      items.push({
        text: taskMatch[2].trim(),
        completed: taskMatch[1].toLowerCase() === 'x',
        section: currentSection,
      })
    }
  }

  return items
}

export function resolveWorkspaceDir(api: { state?: { path?: { worktree?: string; directory?: string } } }): string {
  const s = api.state?.path
  return s?.worktree || s?.directory || process.cwd()
}
