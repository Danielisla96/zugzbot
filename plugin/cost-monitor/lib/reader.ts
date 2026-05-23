import fs from 'node:fs/promises'
import { getQuotaStatePath, getSessionFilePathForDate } from './paths'

export interface SessionUsage {
  input: number
  output: number
  cacheRead?: number
  cost: number
  apiCost: number
  assistantMessages?: number
}

export interface SessionData {
  baseTitle: string
  lastAppliedTitle: string
  createdAt?: number
  usage: SessionUsage
  sidebarPanel?: {
    usage?: SessionUsage
  }
}

export interface QuotaFileContent {
  version: number
  dateKey: string
  sessions: Record<string, SessionData>
}

export interface QuotaState {
  version: number
  sessionDateMap: Record<string, string>
}

export async function readQuotaState(): Promise<QuotaState | null> {
  try {
    const filePath = getQuotaStatePath()
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content) as QuotaState
  } catch {
    return null
  }
}

export async function readQuotaFile(dateStr: string): Promise<QuotaFileContent | null> {
  try {
    const filePath = getSessionFilePathForDate(dateStr)
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content) as QuotaFileContent
  } catch {
    return null
  }
}
