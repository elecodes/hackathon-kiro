// Agent 1 Placeholder — PM & Market Strategist
// Returns mock market analysis until the real agent is implemented
export const handler = async (event) => {
  const input = typeof event === "string" ? JSON.parse(event) : event;

  return {
    agent: "agent-1-pm",
    status: "completed",
    timestamp: new Date().toISOString(),
    output: {
      projectName: input.projectName || "KiroSpec Studio",
      productVision:
        input.productVision || "AI-powered spec generation platform",
      targetAudience: "Software development teams",
      valueProposition: "Automates architecture specs in seconds",
      mvpFeatures: [
        "AI requirements generation",
        "EARS syntax",
        "Cost estimation",
        "Task planning",
      ],
      expectedMetrics: {
        mvpMonthlyUsers: 500,
        scaleMonthlyUsers: 50000,
        peakConcurrentConnections: 200,
      },
      feasibilityScore: 8,
      verdict: "GO",
    },
  };
};
