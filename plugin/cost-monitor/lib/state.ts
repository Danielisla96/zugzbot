import { createSignal, onCleanup } from 'solid-js'
import type { TuiPluginApi } from '@opencode-ai/plugin/tui'
import { getTodayDateKey } from './paths'
import { readQuotaState, readQuotaFile } from './reader'
import { buildDaySummary, type DayCostSummary } from './aggregator'

export interface CostMonitorState {
  status: 'loading' | 'ready' | 'error'
  todaySummary: DayCostSummary | null
  historySummaries: DayCostSummary[]
  activeDateKey: string
}

export interface CostResource {
  state: () => CostMonitorState
  refresh: () => Promise<void>
}

// Global state / singleton map to avoid duplicate subscriptions/intervals per component
const activeResources = new Map<string, CostResource>()

export function useCostResource(api: TuiPluginApi): CostResource {
  // We can use a simple key for the active resource
  const resourceKey = 'global-cost-monitor'
  
  if (activeResources.has(resourceKey)) {
    return activeResources.get(resourceKey)!
  }

  const [state, setState] = createSignal<CostMonitorState>({
    status: 'loading',
    todaySummary: null,
    historySummaries: [],
    activeDateKey: getTodayDateKey(),
  })

  let inflight = false
  let version = 0

  async function doRefresh() {
    if (inflight) return
    inflight = true
    const myVersion = ++version

    try {
      const todayDate = getTodayDateKey()
      const quotaState = await readQuotaState()
      
      if (myVersion !== version) {
        inflight = false
        return
      }

      // Collect unique dates from sessionDateMap and today's date
      const datesSet = new Set<string>()
      datesSet.add(todayDate)

      if (quotaState?.sessionDateMap) {
        for (const dateStr of Object.values(quotaState.sessionDateMap)) {
          if (dateStr) {
            datesSet.add(dateStr)
          }
        }
      }

      // Sort dates descending (most recent first)
      const sortedDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a))

      // We only load the most recent 5 days to ensure high performance
      const datesToLoad = sortedDates.slice(0, 5)

      // Load files in parallel
      const loadedFiles = await Promise.all(
        datesToLoad.map(async (date) => {
          const content = await readQuotaFile(date)
          return { date, content }
        })
      )

      if (myVersion !== version) {
        inflight = false
        return
      }

      const summaries: DayCostSummary[] = []
      let todaySummary: DayCostSummary | null = null

      for (const item of loadedFiles) {
        if (item.content && item.content.sessions) {
          const summary = buildDaySummary(item.date, item.content.sessions)
          if (item.date === todayDate) {
            todaySummary = summary
          } else {
            summaries.push(summary)
          }
        }
      }

      // If todaySummary is null because no sessions were created yet today,
      // let's initialize a blank today's summary so the UI is not empty
      if (!todaySummary) {
        todaySummary = {
          dateStr: todayDate,
          agents: [],
          totalInput: 0,
          totalOutput: 0,
          totalCacheRead: 0,
          totalCost: 0,
          totalApiCost: 0,
        }
      }

      setState({
        status: 'ready',
        todaySummary,
        historySummaries: summaries,
        activeDateKey: todayDate,
      })
    } catch (e) {
      console.error('[CostMonitor State] Error refreshing:', e)
      setState((prev) => ({
        ...prev,
        status: 'ready', // gracefully keep ready, or keep old state
      }))
    } finally {
      inflight = false
    }
  }

  // Trigger initial refresh
  void doRefresh()

  // Polling interval as a backup (every 5 seconds)
  const interval = setInterval(doRefresh, 5000)

  // SSE Event Listener: on session.updated
  let unsubscribe: (() => void) | null = null
  if (api.event && typeof api.event.on === 'function') {
    unsubscribe = api.event.on('session.updated', () => {
      void doRefresh()
    })
  }

  onCleanup(() => {
    clearInterval(interval)
    if (unsubscribe) {
      unsubscribe()
    }
    activeResources.delete(resourceKey)
  })

  const resource: CostResource = {
    state,
    refresh: doRefresh,
  }

  activeResources.set(resourceKey, resource)
  return resource
}
