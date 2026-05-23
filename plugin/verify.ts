import { aggregateSessions, extractAgentName } from './cost-monitor/lib/aggregator';

const mockSessions = {
  "session1": {
    baseTitle: "Chat with @sdd-architect",
    lastAppliedTitle: "Planning with @sdd-architect",
    usage: { input: 100, output: 200, cost: 0.01, apiCost: 0.015 }
  },
  "session2": {
    baseTitle: "Coding with @sdd-implementer",
    lastAppliedTitle: "",
    usage: { input: 500, output: 1000, cost: 0.05, apiCost: 0.07 }
  },
  "session3": {
    baseTitle: "General chat",
    lastAppliedTitle: "Random stuff",
    usage: { input: 50, output: 50, cost: 0.001, apiCost: 0.002 }
  }
};

const summary = aggregateSessions(mockSessions as any);

console.log("--- Summary ---");
summary.forEach(s => {
  console.log(`Agent: ${s.agentName}, Cost: ${s.apiCost}, Sessions: ${s.sessionCount}`);
});

const totalCost = summary.reduce((acc, s) => acc + s.apiCost, 0);
console.log(`Total Cost: ${totalCost}`);

if (totalCost === 0.015 + 0.07 + 0.002) {
  console.log("VALIDATION SUCCESS: Total cost matches.");
} else {
  console.error("VALIDATION FAILED: Total cost mismatch.");
  process.exit(1);
}

if (summary.find(s => s.agentName === '@sdd-architect')) {
    console.log("VALIDATION SUCCESS: @sdd-architect detected.");
} else {
    console.error("VALIDATION FAILED: @sdd-architect NOT detected.");
    process.exit(1);
}
