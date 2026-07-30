# KiroSpec Studio — Operations Playbook

## Quick Reference

| Action                | Command                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Run pipeline          | `aws stepfunctions start-execution --state-machine-arn arn:aws:states:us-east-1:764488969047:stateMachine:kirospec-pipeline --input '{"projectName":"X","productVision":"Y"}'` |
| Call Agent 2 directly | `curl -X POST https://0pc2iaxc58.execute-api.us-east-1.amazonaws.com/prod/generate-spec -H "Content-Type: application/json" -d '{}'`                                           |
| Check pipeline status | `aws stepfunctions describe-execution --execution-arn <arn>`                                                                                                                   |
| View dashboard        | AWS Console → CloudWatch → Dashboards → `kirospec-studio`                                                                                                                      |
| View Agent 2 logs     | `aws logs tail /aws/lambda/kirospec-studio-Agent2Function-ndBDFd3DbQiR --follow`                                                                                               |
| View EventBridge logs | `aws logs tail /aws/events/kirospec-agent2-completed --follow`                                                                                                                 |
| Deploy changes        | `cd infrastructure && sam build && sam deploy --no-confirm-changeset`                                                                                                          |
| Validate template     | `cd infrastructure && sam validate --lint`                                                                                                                                     |
| Subscribe to alerts   | `aws sns subscribe --topic-arn arn:aws:sns:us-east-1:764488969047:kirospec-alerts --protocol email --notification-endpoint your@email.com`                                     |

## Architecture Diagram

```
                    ┌──────────────────────────────────────┐
                    │         API Gateway (REST)            │
                    │   /generate-spec  /specs/{id}         │
                    │   /run-pipeline                       │
                    └──────────┬───────────────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              │                │                    │
              ▼                ▼                    ▼
    ┌─────────────┐  ┌─────────────┐     ┌─────────────────┐
    │  Lambda     │  │  Lambda     │     │ Step Functions   │
    │  Agent 2    │  │  (GET spec) │     │ Pipeline         │
    └──────┬──────┘  └─────────────┘     │ A1→A2→A3→A4     │
           │                              └────────┬────────┘
           │                                       │
    ┌──────┼──────────────────────────────────────┐│
    │      ▼                                      ││
    │  DynamoDB                                   ││ invokes
    │  (kirospec-specs)                           ││
    └─────────────────────────────────────────────┘│
           │                                       │
           ▼                              ┌────────┼────────┐
    ┌─────────────┐                       │  Lambda Agent 1  │
    │ EventBridge │                       │  Lambda Agent 2  │
    │ (kirospec-  │                       │  Lambda Agent 3  │
    │  pipeline)  │                       │  Lambda Agent 4  │
    └──────┬──────┘                       └─────────────────┘
           │
           ▼
    ┌─────────────┐     ┌─────────────┐
    │ CloudWatch  │────▶│    SNS      │
    │ Alarms      │     │ (alerts)    │
    └─────────────┘     └─────────────┘
```

## Deploying Changes

```bash
cd infrastructure

# 1. Edit template.yaml or Lambda code
# 2. Validate
sam validate --lint

# 3. Build
sam build

# 4. Deploy
sam deploy --no-confirm-changeset

# Or for first time / config changes:
sam deploy --guided
```

## Monitoring

### Dashboard

Open: AWS Console → CloudWatch → Dashboards → `kirospec-studio`

Shows:

- Pipeline executions (started/succeeded/failed)
- Agent 2 Lambda metrics (invocations/errors/duration)
- API Gateway traffic (count/4xx/5xx/latency)
- DynamoDB consumption (read/write units)

### Alarms

| Alarm                        | Trigger                       | Action           |
| ---------------------------- | ----------------------------- | ---------------- |
| `kirospec-pipeline-failures` | Any pipeline execution fails  | SNS notification |
| `kirospec-agent2-errors`     | 3+ Lambda errors in 5 minutes | SNS notification |

### Logs

```bash
# Agent 2 Lambda logs
aws logs tail /aws/lambda/kirospec-studio-Agent2Function-ndBDFd3DbQiR --follow

# EventBridge events
aws logs tail /aws/events/kirospec-agent2-completed --follow

# All logs in last hour
aws logs filter-log-events --log-group-name /aws/lambda/kirospec-studio-Agent2Function-ndBDFd3DbQiR --start-time $(date -v-1H +%s000)
```

## DynamoDB Schema

```
Table: kirospec-specs
Billing: PAY_PER_REQUEST (Always Free: 25 RCU + 25 WCU)

Primary Key:
  PK (String): SPEC#{specId}
  SK (String): AGENT#{agentNumber}#{timestamp}

Attributes:
  - specId: unique identifier
  - agent: which agent produced this
  - mode: "mock" or "live"
  - timestamp: ISO 8601
  - input: what was given to the agent
  - output: the generated spec (full JSON)
  - ttl: auto-delete timestamp (30 days)
```

## Troubleshooting

### Pipeline fails at Agent 2

1. Check Lambda logs: `aws logs tail /aws/lambda/kirospec-studio-Agent2Function-ndBDFd3DbQiR`
2. Common causes: DynamoDB write permission, EventBridge emit permission
3. Verify IAM role has DynamoDBCrudPolicy and EventBridgePutEventsPolicy

### API Gateway returns 403

- Check if the endpoint path is correct (`/prod/generate-spec`)
- Verify the method (POST not GET)
- Check CORS headers if calling from browser

### DynamoDB throttling

- Check consumed capacity in CloudWatch dashboard
- PAY_PER_REQUEST should handle bursts, but extremely high traffic could trigger throttling
- Solution: reduce call frequency or switch to provisioned capacity

### SAM deploy fails

- Check IAM permissions (needs CloudFormation, Lambda, API Gateway, DynamoDB, S3, IAM, States, Events, SNS, Logs)
- Check `sam validate --lint` for template syntax errors
- Check CloudFormation events: `aws cloudformation describe-stack-events --stack-name kirospec-studio`

## Cost Control

All services are within AWS Always Free Tier:

| Service        | Free Limit             | Our Usage |
| -------------- | ---------------------- | --------- |
| Lambda         | 1M requests/mo         | < 10k     |
| API Gateway    | 1M calls/mo            | < 10k     |
| DynamoDB       | 25 GB + 25 RCU/WCU     | < 1 GB    |
| Step Functions | 4000 transitions/mo    | < 1000    |
| EventBridge    | Unlimited              | —         |
| CloudWatch     | 5 GB logs + 10 metrics | < 1 GB    |
| SNS            | 1M publishes/mo        | < 100     |

**To avoid surprise charges**: Keep pipeline runs under 30/day. TTL auto-deletes DynamoDB items after 30 days.

## Teardown (if needed)

To delete ALL AWS resources:

```bash
aws cloudformation delete-stack --stack-name kirospec-studio
```

This removes Lambda, API Gateway, DynamoDB, Step Functions, EventBridge, CloudWatch, and SNS. Irreversible.
