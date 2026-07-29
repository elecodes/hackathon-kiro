"use server";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface PipelineOutputs {
  product: string;
  tech: string;
  requirements: string;
  design: string;
  tasks: string;
  compliance: string;
  dockerfile: string;
  ci: string;
}

export type PipelineResult =
  | { success: true; outputs: PipelineOutputs }
  | { success: false; error: string };

async function readFileOrMock(path: string, fallback: string): Promise<string> {
  try {
    return await readFile(resolve(process.cwd(), path), "utf-8");
  } catch {
    return fallback;
  }
}

export async function runPipeline(): Promise<PipelineResult> {
  try {
    const outputs: PipelineOutputs = {
      product: await readFileOrMock(".kiro/steering/product.md", MOCK_PRODUCT),
      tech: await readFileOrMock(".kiro/steering/tech.md", MOCK_TECH),
      requirements: await readFileOrMock(
        ".kiro/specs/requirements.md",
        MOCK_REQUIREMENTS,
      ),
      design: await readFileOrMock(".kiro/specs/design.md", MOCK_DESIGN),
      tasks: await readFileOrMock(".kiro/specs/tasks.md", MOCK_TASKS),
      compliance: await readFileOrMock(
        ".kiro/specs/compliance.md",
        MOCK_COMPLIANCE,
      ),
      dockerfile: await readFileOrMock("Dockerfile", MOCK_DOCKERFILE),
      ci: await readFileOrMock(".github/workflows/ci.yml", MOCK_CI),
    };

    return { success: true, outputs };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}

// --- Fallback mocks for agents that may not have generated files yet ---

const MOCK_TECH = `## Stack Selection

- Next.js 15 (App Router)
- TypeScript 5.x
- Node.js 22 LTS
- Vercel AI SDK
- Zod
- PostgreSQL
- Docker
- Terraform

## Architecture Pattern

Clean

## Deployment Geography

- Deployment Region: us-east-1
- Data Storage Region: eu-west-1

## SOLID Boundaries

| Principle | Rule | Layer |
| --- | --- | --- |
| Single Responsibility | Each module has exactly one reason to change | Domain |
| Open/Closed | Extend via new implementations of port interfaces | Application |
| Liskov Substitution | All LlmPort implementations must be interchangeable | Infrastructure |
| Interface Segregation | Port interfaces define only the methods the use case needs | Application |
| Dependency Inversion | Application layer depends on port abstractions, not concrete infrastructure | Application |

## Security Policies

| Name | Description | Enforcement |
| --- | --- | --- |
| Zod Input Validation | All external inputs validated against strict Zod schemas | Middleware + Use Case entry |
| JWT Authentication | Bearer token validation for API route access | Next.js middleware |
| CORS Policy | Restrict cross-origin requests to allowed domains only | Next.js config + headers |
| HTTPS Enforcement | All traffic encrypted in transit via TLS | Infrastructure/CDN layer |

## Authentication & Authorization

- Provider: NextAuth.js + Cognito
- Login Methods: email/password, Google OAuth, GitHub OAuth
- MFA: Enabled
- Session Lifetime: 1440 minutes
- Authorization Model: RBAC

## AI Configuration

- Model: gpt-4o
- Provider: OpenAI
- Region: us-east-1
- Personal Data in Prompts: No
- Prompt Logging: Enabled
`;

const MOCK_REQUIREMENTS = `# Functional Requirements — KiroSpec Studio

## REQ-1: Specification Generation

WHEN a user submits a product vision document, THE system SHALL generate a complete architecture specification within 60 seconds.

## REQ-2: EARS Syntax Output

WHEN the system generates requirements, THE system SHALL format all requirements strictly in EARS syntax using WHEN/WHILE/WHERE/IF/THE/SHALL clause patterns.

## REQ-3: Mock Fallback

WHEN Agent 2 is invoked without Agent 1 output, THE system SHALL load the fallback mock from .kiro/mocks/agent1.mock.json and proceed with specification generation.

## REQ-4: Schema Validation

WHEN the LLM produces output, THE Zod Validator SHALL validate the response against Agent2OutputSchema before persisting to disk.

IF the LLM output fails schema validation, THEN THE system SHALL throw a typed ValidationError containing the field path and expected type.

## REQ-5: File Persistence

WHEN the system produces a valid Agent2Output, THE Kiro File Writer SHALL write four files: steering/tech.md, specs/requirements.md, specs/design.md, and specs/tasks.md.

WHEN a target directory does not exist, THE Kiro File Writer SHALL create the directory structure before writing files.

## REQ-6: Cost Estimation

WHEN generating the design document, THE system SHALL include an AWS cost breakdown with separate MVP and Scale projections itemized by service name and monthly cost in USD.

## REQ-7: Sequential Task Dependencies

WHEN generating the task list, THE system SHALL produce tasks ordered sequentially where each task's dependencies reference only previously listed task IDs.
`;

const MOCK_DESIGN = `## Domain Entities

### Agent1Output

Properties:
- projectName: string (required)
- productVision: string (required)
- targetAudience: string (required)
- valueProposition: string (required)
- mvpFeatures: string[] (required)
- expectedMetrics: ExpectedMetrics (required)

Relationships: consumed by Agent2

### Agent2Output

Properties:
- techSteering: TechSteering (required)
- requirements: string (required)
- design: DesignOutput (required)
- tasks: TaskItem[] (required)

Relationships: persisted by KiroFileWriter

## Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant Client as API Client
    participant Route as POST /api/generate-spec
    participant UC as GenerateArchitectureSpec
    participant Mock as JsonMockLoader
    participant Val as Zod Validator
    participant LLM as LLM Client
    participant FW as KiroFileWriter

    Client->>Route: POST { agent1Output?, preferredStack? }
    Route->>UC: execute(options)
    alt No agent1Output
        UC->>Mock: load()
        Mock->>Val: Agent1OutputSchema.safeParse()
        Val-->>UC: validated
    end
    UC->>LLM: invoke(systemPrompt, userPrompt)
    LLM-->>UC: raw response
    UC->>Val: Agent2OutputSchema.safeParse(response)
    Val-->>UC: validated Agent2Output
    UC->>FW: writeAll(output, .kiro)
    FW-->>UC: void
    UC-->>Route: Agent2Output
    Route-->>Client: 200 JSON
\`\`\`

## IAM Policies

| Service | Actions | Resource | Effect |
| --- | --- | --- | --- |
| Lambda | lambda:InvokeFunction | arn:aws:lambda:us-east-1:*:function:kirospec-* | Allow |
| S3 | s3:GetObject, s3:PutObject | arn:aws:s3:::kirospec-specs/* | Allow |
| CloudWatch | logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents | arn:aws:logs:us-east-1:*:log-group:/aws/lambda/kirospec-* | Allow |

## AWS Cost Projection

### MVP

| Service | Monthly Cost (USD) |
| --- | --- |
| Vercel Pro (hosting + edge) | $20.00 |
| OpenAI API (GPT-4o, ~500 calls) | $15.00 |
| Vercel Postgres (starter) | $0.00 |
| CloudWatch Logs | $2.00 |

### Scale

| Service | Monthly Cost (USD) |
| --- | --- |
| Vercel Enterprise (hosting + edge) | $150.00 |
| OpenAI API (GPT-4o, ~50k calls) | $1500.00 |
| Vercel Postgres (pro) | $50.00 |
| CloudWatch Logs + Alarms | $25.00 |
| WAF + Shield | $30.00 |
`;

const MOCK_TASKS = `## Tasks

1. **task-1**: Project scaffolding
   Initialize Next.js project with TypeScript, Zod, Vercel AI SDK, and Vitest. Configure path aliases and test patterns.

2. **task-2**: Domain layer implementation (depends on: task-1)
   Create types.ts with all interfaces, schemas.ts with Zod validation, and errors.ts with typed error hierarchy.

3. **task-3**: Application layer implementation (depends on: task-2)
   Create GenerateArchitectureSpec use case with port interfaces, input/output validation pipeline, and error classification.

4. **task-4**: Infrastructure adapters (depends on: task-3)
   Implement JsonMockLoader, LLM client adapter (Vercel AI SDK), and KiroFileWriter with markdown formatters.

5. **task-5**: API route and mock data (depends on: task-4)
   Create Next.js App Router POST endpoint at /api/generate-spec and the agent1.mock.json fallback file.

6. **task-6**: Testing and verification (depends on: task-5)
   Write property-based tests (fast-check, 100+ iterations) for all 6 correctness properties, unit tests for all layers, and integration tests for the full pipeline.
`;

const MOCK_PRODUCT = `# Product Strategy — KiroSpec Studio

## Executive Summary

KiroSpec Studio is an AI-powered platform that converts informal product ideas into
structured, validated architecture specifications ready for implementation.

## Problem & Solution

- **Problem:** Engineering teams spend weeks translating product ideas into actionable specs
- **Solution:** 4-agent AI pipeline that generates complete specs in seconds
- **Target Market:** Software development teams (10-500 engineers)

## Feasibility Scorecard

| Dimension | Score | Justification |
|-----------|:---:|---------------|
| Viability | 8 | Strong demand for AI dev tools |
| Desirability | 9 | Massive time savings |
| Feasibility | 7 | LLM APIs + structured output |
| **Overall** | **8** | GO |

## Verdict

**GO** — Strong market demand, technically feasible with current LLM capabilities.

## Handoff Notes for Agent 2

- **Stack direction:** Next.js, TypeScript, Vercel AI SDK
- **Budget:** MVP under $50/month
- **Key constraint:** Must work offline with mock data for demos
`;

const MOCK_COMPLIANCE = `# Compliance & Legal Audit — KiroSpec Studio

## Executive Summary

**Overall risk level:** Low
**Blocking issues:** 0
**Immediate action required:** No

## Key Findings

- All production dependencies use permissive licenses (MIT, Apache-2.0)
- No personal user data collected in MVP (demo mode only)
- AI prompts contain project descriptions only — no PII

## Open Source License Summary

| Package | License | Risk |
|---------|---------|------|
| next | MIT | 🟢 Low |
| react | MIT | 🟢 Low |
| zod | MIT | 🟢 Low |
| ai (Vercel) | Apache-2.0 | 🟢 Low |
| @ai-sdk/openai | Apache-2.0 | 🟢 Low |

## Regulatory Flags

- AI data processing — prompts contain product descriptions (non-PII)
- No user accounts in MVP — GDPR/CCPA not triggered at current scope
- Cross-border: Vercel Edge + OpenAI US — document in privacy policy at scale

## Recommendation

Proceed with MVP launch. Add privacy policy before collecting user data.

> This is an AI-generated reference guide. It does not replace professional legal advice.
`;

const MOCK_DOCKERFILE = `# Multi-stage build for KiroSpec Studio
# Generated by Agent 4 (DevSecOps)

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
`;

const MOCK_CI = `# CI/CD Pipeline for KiroSpec Studio
# Generated by Agent 4 (DevSecOps)

name: CI Pipeline

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx audit-ci --high

  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'

  build:
    needs: [lint, typecheck, test, security, license-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
`;
