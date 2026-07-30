# AWS Free Tier Roadmap for KiroSpec Studio

## Always Free Services (never expires)

| Service            | Free Tier Limit                  | Agent(s)    | Use Case                                    |
| ------------------ | -------------------------------- | ----------- | ------------------------------------------- |
| Lambda             | 1M requests + 400k GB-seconds/mo | All         | Each agent as a serverless function         |
| DynamoDB           | 25 GB + 25 RCU/WCU               | Agent 1 + 2 | Store generated specs, run history          |
| API Gateway (REST) | 1M calls/mo                      | All         | Public API for each agent                   |
| SNS                | 1M publishes/mo                  | Pipeline    | Notify next agent when previous completes   |
| SQS                | 1M requests/mo                   | Pipeline    | Async message queue between agents          |
| Step Functions     | 4000 state transitions/mo        | Pipeline    | Orchestrate all 4 agents as a state machine |
| CloudWatch         | 5 GB logs + 10 custom metrics    | All         | Monitoring, logging, alerting               |
| EventBridge        | All AWS events free              | Pipeline    | Event-driven triggers between agents        |

## 12-Month Free Tier (first year only)

| Service      | Free Tier Limit                     | Agent(s) | Use Case                                |
| ------------ | ----------------------------------- | -------- | --------------------------------------- |
| S3           | 5 GB + 20k GET + 2k PUT/mo          | All      | Store specs, share files between agents |
| Cognito      | 50k MAU                             | Agent 2  | Real user authentication                |
| ECR          | 500 MB storage                      | Agent 4  | Docker image registry                   |
| CodeBuild    | 100 build-min/mo                    | Agent 4  | CI/CD builds                            |
| CodePipeline | 1 active pipeline                   | Pipeline | Automated deployment                    |
| Bedrock      | Limited free tier (model-dependent) | Agent 2  | AWS-native LLM instead of OpenAI        |

---

## Recommended Order (Always Free only)

### Phase 1: Lambda + API Gateway (Foundation)

**What**: Move Agent 2 generateArchitectureSpec to a Lambda function behind API Gateway.

**Why first**: This is the foundation for everything else. Once you know Lambda + API Gateway, you can move all 4 agents to serverless.

**What you learn**:

- AWS SAM or CDK for IaC
- IAM roles and policies (least privilege in practice)
- Cold starts and optimization
- API Gateway request/response mapping
- Environment variables for config

**Applies to**: Agent 2 first, then replicate for Agents 1, 3, 4.

**Free tier math**: 4 agents x 100 calls/day x 30 days = 12,000 requests/mo (well under 1M limit)

---

### Phase 2: DynamoDB (Persistence)

**What**: Store each generated spec run in DynamoDB. Track what was generated, when, with what input.

**Why second**: Gives you persistence without managing a database server. Pairs naturally with Lambda.

**What you learn**:

- NoSQL data modeling (single-table design)
- Partition keys, sort keys, GSIs
- DynamoDB Streams (for triggering events)
- TTL for auto-cleanup of old runs

**Applies to**: All agents write their output to DynamoDB. Agent 2 reads Agent 1 output from DynamoDB.

**Schema idea**:

```
PK: SPEC#specId
SK: AGENT#agentNumber#timestamp
Data: { input, output, status, duration }
```

---

### Phase 3: EventBridge + SQS (Decoupling)

**What**: When Agent 1 finishes and writes to DynamoDB, an event fires and triggers Agent 2. When Agent 2 finishes, triggers Agent 3. Etc.

**Why third**: This is the real architecture upgrade — from call agents in sequence to agents react to events. True microservices.

**What you learn**:

- Event-driven architecture
- EventBridge rules and patterns
- SQS for buffering (prevents Lambda throttling)
- Dead letter queues for failed messages
- Retry policies

**Applies to**: The entire pipeline becomes event-driven.

**Flow**:

```
User Input -> API Gateway -> Lambda (Agent 1)
  -> DynamoDB write -> DynamoDB Stream -> EventBridge
  -> SQS -> Lambda (Agent 2)
  -> DynamoDB write -> DynamoDB Stream -> EventBridge
  -> SQS -> Lambda (Agent 3)
  -> ...
```

---

### Phase 4: Step Functions (Orchestration)

**What**: Replace the EventBridge chain with a Step Functions state machine that orchestrates all 4 agents.

**Why fourth**: Step Functions give you visual debugging, built-in retry/catch, parallel execution, and a clear view of the pipeline state.

**What you learn**:

- State machine design (ASL - Amazon States Language)
- Parallel vs sequential execution
- Error handling and retries at the orchestration level
- Wait states, choices, and maps
- Integration with Lambda, DynamoDB, SNS

**Applies to**: The full pipeline becomes one state machine.

---

### Phase 5: CloudWatch (Observability)

**What**: Add structured logging, custom metrics, and alarms for all agents.

**Why fifth**: Once the infrastructure is running, you need visibility. CloudWatch ties it all together.

**What you learn**:

- Structured JSON logging from Lambda
- Custom metrics (latency per agent, success rate, cost per run)
- Alarms and dashboards
- X-Ray tracing across the pipeline
- Log Insights queries

**Applies to**: All agents + the Step Functions orchestrator.

---

### Phase 6: SNS (Notifications)

**What**: Send notifications when the pipeline completes or fails.

**Why last**: Nice-to-have that completes the user experience.

**What you learn**:

- Topic/subscription model
- Email/SMS notifications
- Fan-out pattern (one event to multiple subscribers)
- Filter policies

**Applies to**: Pipeline completion, error alerts.

---

## Architecture Evolution Summary

```
Phase 0 (now):
  Vercel -> Next.js API -> Mock LLM -> Local files

Phase 1 (Lambda + API Gateway):
  API Gateway -> Lambda (Agent 2) -> Response

Phase 2 (+ DynamoDB):
  API Gateway -> Lambda -> DynamoDB (persist specs)

Phase 3 (+ Events):
  API Gateway -> Lambda (A1) -> DynamoDB -> EventBridge -> Lambda (A2) -> ...

Phase 4 (+ Step Functions):
  API Gateway -> Step Functions -> [Lambda A1, A2, A3, A4] -> DynamoDB

Phase 5 (+ Observability):
  All of the above + CloudWatch Logs, Metrics, Alarms, X-Ray

Phase 6 (+ Notifications):
  Step Functions -> SNS -> Email/SMS on completion
```

## Cost Guard

At learning-level usage (under 100 runs/day), ALL of this stays within Always Free limits:

- Lambda: 3,000 invocations/day x 30 = 90k/mo (limit: 1M)
- DynamoDB: under 1 GB data (limit: 25 GB)
- API Gateway: 3,000/day x 30 = 90k/mo (limit: 1M)
- Step Functions: 4,000 state transitions/mo total

**Step Functions warning**: The Always Free limit is only 4,000 state transitions/mo. At 4 agents per run, that is about 1,000 runs/mo max. For learning, keep runs under 30/day and you are safe.

## Tools for Development

| Tool               | Purpose                                       | Cost                     |
| ------------------ | --------------------------------------------- | ------------------------ |
| AWS SAM CLI        | Local Lambda development + deployment         | Free                     |
| AWS CDK            | Infrastructure as Code (TypeScript)           | Free                     |
| LocalStack         | Run AWS services locally for testing          | Free (community edition) |
| Kiro MCP (AWS SAM) | Already installed — helps write SAM templates | Free                     |
