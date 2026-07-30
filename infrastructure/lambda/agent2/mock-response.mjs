// Pre-built mock response for Agent 2 (no LLM needed)
export const mockResponse = {
  techSteering: {
    stack: [
      "Next.js 15 (App Router)",
      "TypeScript 5.x",
      "Node.js 22 LTS",
      "Vercel AI SDK",
      "Zod",
      "PostgreSQL",
      "Docker",
      "Terraform",
    ],
    architecturePattern: "Clean",
    solidBoundaries: [
      {
        principle: "Single Responsibility",
        rule: "Each module has exactly one reason to change",
        layer: "Domain",
      },
      {
        principle: "Open/Closed",
        rule: "Extend via new implementations of port interfaces",
        layer: "Application",
      },
      {
        principle: "Dependency Inversion",
        rule: "Application depends on abstractions, not concrete infrastructure",
        layer: "Application",
      },
    ],
    securityGuards: [
      {
        name: "Zod Input Validation",
        description: "All inputs validated at boundaries",
        enforcement: "Middleware",
      },
      {
        name: "JWT Authentication",
        description: "Bearer token validation",
        enforcement: "Next.js middleware",
      },
      {
        name: "CORS Policy",
        description: "Restrict cross-origin requests",
        enforcement: "API Gateway",
      },
      {
        name: "HTTPS Enforcement",
        description: "TLS encryption in transit",
        enforcement: "CloudFront/ALB",
      },
    ],
    deploymentRegion: "us-east-1",
    dataStorageRegion: "us-east-1",
  },
  requirements:
    "# Functional Requirements\n\n## REQ-1\nWHEN a user submits a product vision, THE system SHALL generate architecture specs within 60 seconds.\n\n## REQ-2\nWHEN generating requirements, THE system SHALL format them in EARS syntax.\n\n## REQ-3\nWHEN invoked without Agent 1 output, THE system SHALL load the fallback mock.\n\n## REQ-4\nWHEN the LLM produces output, THE validator SHALL check it against the schema before persisting.\n\n## REQ-5\nWHEN generating the design, THE system SHALL include AWS cost projections (MVP vs Scale).",
  design: {
    domainEntities: [
      {
        name: "Agent1Output",
        properties: [
          { name: "projectName", type: "string", required: true },
          { name: "productVision", type: "string", required: true },
        ],
        relationships: ["consumed by Agent2"],
      },
      {
        name: "Agent2Output",
        properties: [
          { name: "techSteering", type: "TechSteering", required: true },
          { name: "tasks", type: "TaskItem[]", required: true },
        ],
        relationships: ["persisted by FileWriter"],
      },
    ],
    mermaidDiagram:
      "sequenceDiagram\n  Client->>API Gateway: POST /generate-spec\n  API Gateway->>Lambda: invoke\n  Lambda->>Validator: validate input\n  Validator-->>Lambda: ok\n  Lambda->>LLM: generate\n  LLM-->>Lambda: response\n  Lambda->>Validator: validate output\n  Lambda-->>API Gateway: Agent2Output\n  API Gateway-->>Client: 200 JSON",
    iamPolicySummary: [
      {
        service: "Lambda",
        actions: ["lambda:InvokeFunction"],
        resource: "*",
        effect: "Allow",
      },
      {
        service: "CloudWatch",
        actions: ["logs:CreateLogGroup", "logs:PutLogEvents"],
        resource: "*",
        effect: "Allow",
      },
    ],
    awsCostProjection: {
      mvpMonthlyCostUsd: [
        { service: "Lambda (1M free requests)", monthlyCostUsd: 0 },
        { service: "API Gateway (1M free calls)", monthlyCostUsd: 0 },
        { service: "CloudWatch (5GB free)", monthlyCostUsd: 0 },
        { service: "Vercel (free tier)", monthlyCostUsd: 0 },
      ],
      scaleMonthlyCostUsd: [
        { service: "Lambda (10M requests)", monthlyCostUsd: 20 },
        { service: "API Gateway (10M calls)", monthlyCostUsd: 35 },
        { service: "CloudWatch Logs", monthlyCostUsd: 10 },
        { service: "Vercel Pro", monthlyCostUsd: 20 },
      ],
    },
  },
  tasks: [
    {
      id: "task-1",
      title: "SAM template + Lambda handler",
      description: "Create infrastructure/template.yaml and Lambda function",
      dependencies: [],
    },
    {
      id: "task-2",
      title: "Deploy to AWS",
      description: "sam build and sam deploy --guided",
      dependencies: ["task-1"],
    },
    {
      id: "task-3",
      title: "Connect UI to Lambda",
      description: "Update Vercel frontend to call API Gateway endpoint",
      dependencies: ["task-2"],
    },
    {
      id: "task-4",
      title: "Add DynamoDB persistence",
      description: "Store generated specs in DynamoDB",
      dependencies: ["task-3"],
    },
  ],
  authConfig: {
    provider: "API Gateway Key",
    loginMethods: ["header-based"],
    mfa: false,
    sessionLifetimeMinutes: 0,
    authorizationModel: "RBAC",
  },
  aiConfig: {
    model: "mock (free tier)",
    provider: "Local mock",
    region: "us-east-1",
    personalDataInPrompts: false,
    promptLogging: false,
  },
};
