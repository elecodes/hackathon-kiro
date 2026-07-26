# KiroSpec Studio — Agent 2: Software Architect, Security & Financial Officer

## What Is This

Agent 2 is an AI-powered service that transforms a product vision into complete, validated architecture documentation. It receives structured input from Agent 1 (Product Manager) and generates four specification files ready for implementation.

Part of a 4-agent pipeline for KiroSpec Studio, a hackathon project that auto-generates entire development workspaces from a single idea.

## Pipeline Position

```
Agent 1 (PM & Market Strategist)
    │
    │  produces: projectName, productVision, targetAudience,
    │            valueProposition, mvpFeatures, expectedMetrics
    ▼
Agent 2 (Software Architect) ← THIS REPO
    │
    │  produces: tech.md, requirements.md, design.md, tasks.md
    ▼
Agent 3 (Legal & Compliance)
    │
    ▼
Agent 4 (DevSecOps & Automation)
```

## What It Produces

| File                          | Content                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.kiro/steering/tech.md`      | Stack selection, Clean Architecture boundaries, SOLID rules, security policies, deployment geography, auth config, AI config |
| `.kiro/specs/requirements.md` | Functional requirements in EARS syntax (WHEN/SHALL patterns)                                                                 |
| `.kiro/specs/design.md`       | DDD entities, Mermaid sequence diagram, IAM policies, AWS cost breakdown (MVP vs Scale)                                      |
| `.kiro/specs/tasks.md`        | Sequential task list with dependency ordering                                                                                |

## Quick Start

```bash
# Install dependencies
npm install

# Run Agent 2 in offline mode (no API key needed)
npm run demo

# Run tests
npm test
```

### Output from `npm run demo`:

```
🏗️  Agent 2 — Software Architect Demo (offline mode)

📥 Loading Agent 1 mock input...
🤖 Generating architecture specification (mocked LLM)...

✅ Agent 2 output generated successfully!

📋 Stack: Next.js 15, TypeScript 5.x, Node.js 22 LTS, Vercel AI SDK, Zod, PostgreSQL, Docker, Terraform
🏛️  Architecture: Clean
📝 Requirements: 33 lines
🗂️  Domain entities: 3
💰 MVP cost: $37.00/mo
💰 Scale cost: $1755.00/mo
📦 Tasks: 6

📁 Files written to .kiro/
```

## Usage Modes

### 1. Offline Demo (no API key)

```bash
npm run demo
```

Uses a pre-built mock response. Deterministic, zero network calls. Ideal for hackathon presentations.

### 2. Programmatic (with mock)

```typescript
import { createAgent2 } from "./src/index";
import mockResponse from "./.kiro/mocks/agent2.mock-response.json";

const agent2 = createAgent2({ mockLlmResponse: mockResponse });
const result = await agent2.execute();
```

### 3. Programmatic (with real LLM)

```typescript
import { createAgent2 } from "./src/index";

// Requires OPENAI_API_KEY in environment
const agent2 = createAgent2({ model: "gpt-4o" });
const result = await agent2.execute({
  agent1Output: {
    projectName: "MyApp",
    productVision: "An app that does X",
    targetAudience: "Developers",
    valueProposition: "Saves time doing Y",
    mvpFeatures: ["Feature A", "Feature B"],
    expectedMetrics: {
      mvpMonthlyUsers: 1000,
      scaleMonthlyUsers: 50000,
      peakConcurrentConnections: 200,
    },
  },
  preferredStack: ["React", "Supabase", "Vercel"],
});
```

### 4. API Endpoint (Next.js)

```bash
# Start the dev server
npm run dev

# Call the endpoint
curl -X POST http://localhost:3000/api/generate-spec \
  -H "Content-Type: application/json" \
  -d '{
    "agent1Output": { ... },
    "preferredStack": ["React", "Node.js"]
  }'
```

**Response codes:**

- `200` — Success, returns `Agent2Output` JSON
- `400` — Validation error (bad input)
- `502` — LLM transient error (timeout, rate limit)
- `500` — Permanent error (auth failure, filesystem)

## Input Contract (from Agent 1)

```typescript
interface Agent1Output {
  projectName: string;
  productVision: string;
  targetAudience: string;
  valueProposition: string;
  mvpFeatures: string[]; // min 1 item
  expectedMetrics: {
    mvpMonthlyUsers: number; // positive
    scaleMonthlyUsers: number; // positive
    peakConcurrentConnections: number; // positive
  };
}
```

A fallback mock is available at `.kiro/mocks/agent1.mock.json` for development.

## Output Contract (for Agents 3 & 4)

```typescript
interface Agent2Output {
  techSteering: {
    stack: string[];
    architecturePattern: "Clean" | "Hexagonal";
    solidBoundaries: { principle: string; rule: string; layer: string }[];
    securityGuards: { name: string; description: string; enforcement: string }[];
    deploymentRegion: string;       // e.g. "us-east-1"
    dataStorageRegion: string;      // e.g. "eu-west-1"
  };
  requirements: string;  // EARS-formatted markdown
  design: {
    domainEntities: { name: string; properties: {...}[]; relationships: string[] }[];
    mermaidDiagram: string;
    iamPolicySummary: { service: string; actions: string[]; resource: string; effect: "Allow"|"Deny" }[];
    awsCostProjection: {
      mvpMonthlyCostUsd: { service: string; monthlyCostUsd: number }[];
      scaleMonthlyCostUsd: { service: string; monthlyCostUsd: number }[];
    };
  };
  tasks: { id: string; title: string; description: string; dependencies: string[] }[];
  authConfig: {
    provider: string;               // e.g. "NextAuth.js + Cognito"
    loginMethods: string[];         // e.g. ["email/password", "Google OAuth"]
    mfa: boolean;
    sessionLifetimeMinutes: number;
    authorizationModel: "RBAC" | "ABAC" | "ReBAC";
  };
  aiConfig: {
    model: string;                  // e.g. "gpt-4o"
    provider: string;               // e.g. "OpenAI"
    region: string;                 // e.g. "us-east-1"
    personalDataInPrompts: boolean;
    promptLogging: boolean;
  };
}
```

## Architecture

```
src/
├── domain/              ← Pure types, Zod schemas, typed errors (no I/O)
├── application/         ← Use case + port interfaces (LlmPort, MockLoaderPort, FileWriterPort)
├── infrastructure/      ← Concrete adapters (Vercel AI SDK, filesystem, mock LLM)
├── presentation/        ← Next.js App Router API route
├── config/              ← System prompt constant
├── __tests__/           ← Property-based + unit + integration tests
└── index.ts             ← Factory function (createAgent2)
```

**Clean Architecture** — dependencies point inward only. Swap LLM providers by implementing `LlmPort`. No code changes needed in domain or application layers.

## Tech Stack

- **Runtime**: Node.js 22, TypeScript 5.8 (strict)
- **Framework**: Next.js 15 (App Router)
- **LLM**: Vercel AI SDK (`generateObject` with schema enforcement) — swappable for Genkit
- **Validation**: Zod (compile-time types + runtime validation)
- **Testing**: Vitest + fast-check (property-based testing)
- **Offline**: MockLlmClient with pre-built response

## Testing

```bash
npm test              # Run all 77 tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Test Breakdown

| Category                  | Tests  | What It Covers                             |
| ------------------------- | ------ | ------------------------------------------ |
| Schema unit tests         | 27     | Valid/invalid objects, edge cases          |
| Error unit tests          | 11     | Error construction, field propagation      |
| Use case unit tests       | 16     | Happy path, fallback, error classification |
| Infrastructure unit tests | 8      | Mock loader, file writer                   |
| Integration tests         | 3      | Full pipeline end-to-end                   |
| Property tests (P1–P6)    | 12     | 100 iterations each, universal correctness |
| **Total**                 | **77** | **All passing**                            |

### Correctness Properties (PBT)

1. **Schema rejects invalid objects** with correct error paths
2. **Valid objects round-trip** through schema without loss
3. **File writer preserves** all output content
4. **Input validation precedes** LLM invocation (always)
5. **All errors carry** operation name + context
6. **Task dependencies** form valid topological order

## Error Handling

| Error Type           | HTTP Code | Retryable | Contains                           |
| -------------------- | --------- | --------- | ---------------------------------- |
| ValidationError      | 400       | No        | fieldPath, expectedType, operation |
| LlmError (transient) | 502       | Yes       | message, isTransient=true          |
| LlmError (permanent) | 500       | No        | message, isTransient=false         |
| FilesystemError      | 500       | Maybe     | targetPath, cause                  |

## Project Structure

```
hackathon-kiro/
├── src/                        ← Source code (Clean Architecture)
├── scripts/
│   └── demo.ts                 ← Offline demo runner
├── .kiro/
│   ├── mocks/
│   │   ├── agent1.mock.json          ← Fallback input (Agent 1 output)
│   │   └── agent2.mock-response.json ← Pre-built LLM response for demos
│   ├── steering/
│   │   └── tech.md                   ← Generated output
│   └── specs/
│       ├── requirements.md           ← Generated output
│       ├── design.md                 ← Generated output
│       └── tasks.md                  ← Generated output
├── docs/
│   └── agent4-readme.md       ← Reference doc for Agent 4 team
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md                  ← This file
```

## For Teammates

**Agent 1 team**: Your output needs to match `Agent1OutputSchema` (see Input Contract above). Write it to `.kiro/steering/product.md` as JSON, or pass it directly to Agent 2's API.

**Agent 3 team**: You can consume Agent 2's output from `.kiro/specs/design.md` (for IAM policies, entities with PII) and `.kiro/steering/tech.md` (for stack/license audit). Or call the API and parse the JSON response.

**Agent 4 team**: See `docs/agent4-readme.md` for what you can consume. All spec files are well-structured markdown with consistent section headers.

## Developer

**Elena Menéndez** — Agent 2 implementation for KiroSpec Studio hackathon.
