export function extractAgentName(baseTitle, lastAppliedTitle) {
    // We check lastAppliedTitle first as it might contain more meta, but baseTitle is cleaner
    const title = lastAppliedTitle || baseTitle || '';
    // Look for @agentName (e.g. @sdd-architect, @sdd-implementer, etc.)
    const match = title.match(/@([a-zA-Z0-9_-]+)/);
    if (match) {
        return `@${match[1]}`;
    }
    // Fallback to @general
    return '@general';
}
export function aggregateSessions(sessions) {
    const agentMap = new Map();
    for (const session of Object.values(sessions)) {
        // Determine the usage to use. Some sessions might have sidebarPanel.usage which is more up-to-date
        // than session.usage, or vice versa. Let's check both and use the maximum/most complete.
        const usage = session.sidebarPanel?.usage || session.usage || {
            input: 0,
            output: 0,
            cacheRead: 0,
            cost: 0,
            apiCost: 0,
        };
        const agentName = extractAgentName(session.baseTitle, session.lastAppliedTitle);
        const existing = agentMap.get(agentName) || {
            agentName,
            input: 0,
            output: 0,
            cacheRead: 0,
            cost: 0,
            apiCost: 0,
            sessionCount: 0,
        };
        existing.input += usage.input || 0;
        existing.output += usage.output || 0;
        existing.cacheRead += usage.cacheRead || 0;
        existing.cost += usage.cost || 0;
        existing.apiCost += usage.apiCost || 0;
        existing.sessionCount += 1;
        agentMap.set(agentName, existing);
    }
    return Array.from(agentMap.values()).sort((a, b) => b.apiCost - a.apiCost);
}
export function buildDaySummary(dateStr, sessions) {
    const agents = aggregateSessions(sessions);
    let totalInput = 0;
    let totalOutput = 0;
    let totalCacheRead = 0;
    let totalCost = 0;
    let totalApiCost = 0;
    for (const agent of agents) {
        totalInput += agent.input;
        totalOutput += agent.output;
        totalCacheRead += agent.cacheRead;
        totalCost += agent.cost;
        totalApiCost += agent.apiCost;
    }
    return {
        dateStr,
        agents,
        totalInput,
        totalOutput,
        totalCacheRead,
        totalCost,
        totalApiCost,
    };
}
