// Agent 3 Placeholder — Legal & Compliance
// Returns mock compliance report until the real agent is implemented
export const handler = async (event) => {
  const input = typeof event === "string" ? JSON.parse(event) : event;

  return {
    agent: "agent-3-compliance",
    status: "completed",
    timestamp: new Date().toISOString(),
    output: {
      riskLevel: "Low",
      blockingIssues: 0,
      licenses: [
        { package: "next", license: "MIT", risk: "low" },
        { package: "zod", license: "MIT", risk: "low" },
        { package: "react", license: "MIT", risk: "low" },
      ],
      regulatoryFlags: [
        "AI data processing — prompts contain project descriptions (non-PII)",
        "No user accounts in MVP — GDPR/CCPA not triggered",
      ],
      recommendation:
        "Proceed with MVP. Add privacy policy before collecting user data.",
    },
  };
};
