import { readQuotaState, readQuotaFile } from '../cost-monitor/lib/reader'
import { buildDaySummary } from '../cost-monitor/lib/aggregator'
import { getTodayDateKey } from '../cost-monitor/lib/paths'

async function test() {
  console.log('--- TESTING PATHS & STATE ---')
  const today = getTodayDateKey()
  console.log('Today DateKey:', today)

  const state = await readQuotaState()
  if (!state) {
    console.error('Failed to read quota-sidebar.state.json')
    process.exit(1)
  }
  console.log('Quota State version:', state.version)
  const sessionCount = Object.keys(state.sessionDateMap).length
  console.log('Total sessions in state:', sessionCount)

  console.log('\n--- TESTING FILE PARSING & AGGREGATION ---')
  // We saw 22.json has lots of sessions
  const testDate = '2026-05-22'
  console.log('Loading data for date:', testDate)
  const fileContent = await readQuotaFile(testDate)
  if (!fileContent) {
    console.error(`Failed to read file for date: ${testDate}`)
    process.exit(1)
  }

  const sessionsCount = Object.keys(fileContent.sessions).length
  console.log(`Successfully parsed ${sessionsCount} sessions from ${testDate}.json`)

  const summary = buildDaySummary(testDate, fileContent.sessions)
  console.log('\nAggregation Results for 2026-05-22:')
  console.log(`- Date: ${summary.dateStr}`)
  console.log(`- Total Input Tokens: ${summary.totalInput}`)
  console.log(`- Total Output Tokens: ${summary.totalOutput}`)
  console.log(`- Total Cost (cost): $${summary.totalCost.toFixed(6)}`)
  console.log(`- Total API Cost (apiCost): $${summary.totalApiCost.toFixed(6)}`)

  console.log('\nAgent Breakdown:')
  for (const agent of summary.agents) {
    console.log(`  * ${agent.agentName}:`)
    console.log(`    Sessions: ${agent.sessionCount}`)
    console.log(`    Input Tokens: ${agent.input}`)
    console.log(`    Output Tokens: ${agent.output}`)
    console.log(`    API Cost: $${agent.apiCost.toFixed(6)}`)
  }

  console.log('\n--- VERIFICATION SUCCESSFUL ---')
}

test().catch(console.error)
