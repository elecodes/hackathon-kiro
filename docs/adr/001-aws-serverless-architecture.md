# ADR-001: AWS Serverless Architecture for KiroSpec Studio

## Status

Accepted

## Date

2026-07-30

## Context

KiroSpec Studio has 4 AI agents that run sequentially. We needed to decide how to host and orchestrate them beyond the initial Vercel deployment. Key constraints:

- Must stay within AWS Free Tier (no costs for learning)
- Each agent should be independently deployable
- Pipeline must handle failures gracefully
- Must support future real LLM integration without architecture changes

## Decision

We chose a fully serverless architecture on AWS using:

- **AWS Lambda** for compute (each agent = one function)
- **API Gateway REST** for HTTP access
- **DynamoDB** for persistence (generated specs)
- **EventBridge** for decoupled inter-agent communication
- **Step Functions** for pipeline orchestration
- **CloudWatch** for observability (dashboard, alarms)
- **SNS** for alerting

## Rationale

### Why Lambda over ECS/EC2

- Zero cost at rest (pay only per invocation)
- 1M free requests/month (Always Free)
- No server management
- Each agent is a small, focused function (< 10s execution)

### Why Step Functions over EventBridge-only orchestration

- Visual debugging in AWS Console
- Built-in retry/catch per step
- Clear sequential flow matches our pipeline
- State machine pattern maps directly to Agent 1 → 2 → 3 → 4

### Why DynamoDB over RDS/S3

- 25 GB Always Free (never expires)
- PAY_PER_REQUEST eliminates capacity planning
- Single-table design supports all agents
- TTL auto-deletes old data (cost control)
- DynamoDB Streams enable future event-driven triggers

### Why EventBridge alongside Step Functions

- Step Functions orchestrates the synchronous pipeline
- EventBridge enables async notifications (Agent 2 done → log, notify, trigger side effects)
- Decouples concerns: orchestration vs notification

## Consequences

### Positive

- Zero infrastructure cost for learning and demos
- Each agent can be developed and deployed independently
- Pipeline failures are visible in CloudWatch immediately
- Architecture scales to production without redesign

### Negative

- Step Functions has only 4000 free transitions/month (limits to ~1000 pipeline runs/month)
- Cold starts add 200-500ms to first invocation
- Local testing requires SAM CLI or mocks (no live reload like Next.js dev)

### Risks

- IAM permissions can be confusing for newcomers
- Free tier limits could be hit if someone scripts automated calls
- DynamoDB single-table design requires discipline

## Alternatives Considered

| Alternative            | Why rejected                                         |
| ---------------------- | ---------------------------------------------------- |
| ECS Fargate            | Not free tier friendly, overkill for < 10s tasks     |
| EC2                    | Always-on cost, management overhead                  |
| SQS-only orchestration | No visual debugging, harder to follow flow           |
| S3 for persistence     | No query capability, no TTL                          |
| Vercel for everything  | No DynamoDB, no Step Functions, limited AWS learning |
