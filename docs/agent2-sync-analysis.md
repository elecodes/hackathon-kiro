# Agent 2 — Sync Analysis: Current vs Expected

This document compares what Agent 2 currently produces against the data contract document created by the Agent 4 team.

---

## Summary

Agent 2 currently covers approximately **30–40%** of what the Agent 4 contract expects. The gap is mostly around compliance/privacy data, deployment geography, auth details, vendor inventory, and supply chain — areas that arguably belong to Agent 3 (Legal) or are populated at deployment time by Agent 4 itself.

---

## Section-by-Section Breakdown

### 1. Architecture and Geography

| Expected Field                                                        | Agent 2 Status  | Where/How                                               |
| --------------------------------------------------------------------- | --------------- | ------------------------------------------------------- |
| Frontend, backend, databases, storage, queues, analytics, AI services | ✅ Covered      | `tech.md` → stack list includes all service types       |
| Development, staging, production environments                         | ❌ Not produced | Agent 2 selects stack, not environment topology         |
| AWS deployment region(s)                                              | ❌ Not produced | No region selection logic                               |
| Primary data storage region(s)                                        | ❌ Not produced | —                                                       |
| Backup/disaster-recovery region(s)                                    | ❌ Not produced | —                                                       |
| User jurisdictions                                                    | ❌ Not produced | Agent 1 provides `targetAudience` but not jurisdictions |
| Cross-border data transfers                                           | ❌ Not produced | Compliance domain (Agent 3)                             |
| Architecture and data-flow diagrams                                   | ✅ Covered      | `design.md` → Mermaid sequence diagram                  |

**Gap**: Region/geography selection, environment topology, jurisdiction mapping.

---

### 2. Data Processing Map

| Expected Field                                        | Agent 2 Status  | Where/How |
| ----------------------------------------------------- | --------------- | --------- |
| Data categories (personal, sensitive, AI, logs, etc.) | ❌ Not produced | —         |
| Subject/Source per category                           | ❌ Not produced | —         |
| Collection method                                     | ❌ Not produced | —         |
| Purpose                                               | ❌ Not produced | —         |
| Storage + Region                                      | ❌ Not produced | —         |
| Access roles                                          | ❌ Not produced | —         |
| Processor                                             | ❌ Not produced | —         |
| Retention period                                      | ❌ Not produced | —         |
| Deletion mechanism                                    | ❌ Not produced | —         |

**Gap**: Entire section missing. This is a GDPR/compliance artifact — naturally belongs to Agent 3 (Legal & Compliance).

---

### 3. Identity, Authentication, and Authorization

| Expected Field                                      | Agent 2 Status  | Where/How                                                                                        |
| --------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| Identity provider and login methods                 | ⚠️ Partial      | `tech.md` mentions "JWT Auth" as a security guard but doesn't specify IdP (Cognito, Auth0, etc.) |
| Identity attributes stored                          | ❌ Not produced | —                                                                                                |
| MFA and account recovery                            | ❌ Not produced | —                                                                                                |
| Session/token lifetime, refresh, revocation, logout | ❌ Not produced | —                                                                                                |
| Authorization model (RBAC, ABAC)                    | ❌ Not produced | —                                                                                                |
| Admin and privileged roles                          | ❌ Not produced | —                                                                                                |
| Service-to-service identities                       | ❌ Not produced | —                                                                                                |

**Gap**: Agent 2 flags JWT as a security policy but doesn't architect the full identity system.

---

### 4. Third-Party Processors

| Expected Field                         | Agent 2 Status  | Where/How                   |
| -------------------------------------- | --------------- | --------------------------- |
| Provider inventory table               | ❌ Not produced | —                           |
| Data received by each provider         | ❌ Not produced | —                           |
| Processing region per provider         | ❌ Not produced | —                           |
| Agreement/control type (DPA, BAA, SCC) | ❌ Not produced | Compliance domain (Agent 3) |
| Provider training/use settings         | ❌ Not produced | —                           |

**Gap**: Entire section missing. Vendor inventory with legal agreements is Agent 3's domain.

---

### 5. AI and Amazon Bedrock

| Expected Field                                    | Agent 2 Status  | Where/How                                                                                                      |
| ------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| Model/provider and region                         | ⚠️ Partial      | `tech.md` stack includes "Vercel AI SDK" and mock response references "OpenAI API (GPT-4o)" in cost projection |
| Data included in prompts/outputs                  | ❌ Not produced | —                                                                                                              |
| Whether PII is sent to model                      | ❌ Not produced | —                                                                                                              |
| Prompt/output logging and retention               | ❌ Not produced | —                                                                                                              |
| Provider training/use settings                    | ❌ Not produced | —                                                                                                              |
| Guardrails, moderation, prompt-injection controls | ❌ Not produced | —                                                                                                              |
| Human review for consequential decisions          | ❌ Not produced | —                                                                                                              |
| User-facing AI disclosures                        | ❌ Not produced | Compliance domain (Agent 3)                                                                                    |

**Gap**: Agent 2 picks the AI service in the stack but doesn't document AI governance controls.

---

### 6. Security and Operations

| Expected Field                               | Agent 2 Status  | Where/How                                                                        |
| -------------------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| IAM roles, trust boundaries, least-privilege | ✅ Covered      | `design.md` → `iamPolicySummary` with service, actions, resource, effect         |
| Public endpoints, CORS, rate limits, WAF     | ⚠️ Partial      | `tech.md` security guards mention CORS and HTTPS but no WAF or rate limit config |
| Encryption in transit and at rest            | ⚠️ Partial      | `tech.md` mentions "HTTPS Enforcement" (transit) but not encryption at rest      |
| KMS/key ownership and rotation               | ❌ Not produced | —                                                                                |
| Secrets management                           | ❌ Not produced | —                                                                                |
| Audit and application logging                | ❌ Not produced | —                                                                                |
| Log and backup retention                     | ❌ Not produced | —                                                                                |
| Monitoring and alerting                      | ❌ Not produced | —                                                                                |
| Incident response and breach assessment      | ❌ Not produced | —                                                                                |
| Backup restoration, DR, data deletion        | ❌ Not produced | —                                                                                |

**Gap**: Agent 2 defines high-level security policies and IAM summary. Operational security details (KMS, logs, monitoring, incident response) are not in scope.

---

### 7. Scale and Commercial Threshold Inputs

| Expected Field                            | Agent 2 Status  | Where/How                                                                                        |
| ----------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| MVP and growth users by jurisdiction      | ⚠️ Partial      | Agent 1 provides `mvpMonthlyUsers` and `scaleMonthlyUsers` as totals — no jurisdiction breakdown |
| Estimated annual revenue                  | ❌ Not produced | Not in Agent 1 input schema                                                                      |
| Personal data sold/shared for advertising | ❌ Not produced | —                                                                                                |
| Revenue from selling/sharing data         | ❌ Not produced | —                                                                                                |
| Payment/transaction volume                | ❌ Not produced | —                                                                                                |

**Gap**: Agent 2 passes through user metrics from Agent 1 (in the cost projection), but doesn't add jurisdiction or commercial data. The document explicitly says "Agent 2 must not declare a privacy law applicable from user count alone" — so this is really Agent 3's call.

---

### 8. Software Supply Chain

| Expected Field                     | Agent 2 Status  | Where/How                                                                       |
| ---------------------------------- | --------------- | ------------------------------------------------------------------------------- |
| Direct and transitive dependencies | ❌ Not produced | —                                                                               |
| Exact versions, not open ranges    | ⚠️ Partial      | Our `package.json` uses pinned versions, but Agent 2's OUTPUT doesn't list deps |
| Production or development scope    | ❌ Not produced | —                                                                               |
| Declared SPDX license              | ❌ Not produced | —                                                                               |
| Package registry/evidence URL      | ❌ Not produced | —                                                                               |
| Container images, OS, runtimes     | ❌ Not produced | Agent 4 (DevSecOps) generates Dockerfile                                        |

**Gap**: Supply chain SBOM is Agent 4's domain (it has access to the actual package files and Dockerfile).

---

## What Agent 2 DOES Produce (Current Output)

```
.kiro/steering/tech.md
├── Stack Selection (service list)
├── Architecture Pattern (Clean / Hexagonal)
├── SOLID Boundaries (principle, rule, layer table)
└── Security Policies (name, description, enforcement table)

.kiro/specs/requirements.md
└── EARS-syntax requirements (WHEN/SHALL functional requirements)

.kiro/specs/design.md
├── Domain Entities (DDD entities with properties and relationships)
├── Sequence Diagram (Mermaid)
├── IAM Policies (service, actions, resource, effect table)
└── AWS Cost Projection (MVP and Scale, itemized by service in USD/month)

.kiro/specs/tasks.md
└── Sequential task list with dependency ordering
```

---

## Recommended Responsibility Split

| Section                                   | Best Owner                          | Rationale                                                      |
| ----------------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| 1. Architecture (services, diagram)       | **Agent 2** ✅                      | Already does this                                              |
| 1. Geography (regions, DR, jurisdictions) | **Agent 2** (extend) or **Agent 3** | Could be added to Agent 2's output                             |
| 2. Data Processing Map                    | **Agent 3**                         | GDPR/privacy mapping is legal/compliance work                  |
| 3. Auth details                           | **Agent 2** (extend)                | Architecture decision, but needs richer output                 |
| 4. Third-Party Processors                 | **Agent 3**                         | Vendor agreements, DPAs are legal artifacts                    |
| 5. AI Governance                          | **Agent 2** (extend) + **Agent 3**  | Agent 2 picks the model; Agent 3 adds governance               |
| 6. Security Ops                           | **Agent 2** (partial) + **Agent 4** | Agent 2 defines policies; Agent 4 implements (KMS, monitoring) |
| 7. Commercial Thresholds                  | **Agent 1** + **Agent 3**           | Agent 1 provides business metrics; Agent 3 maps to law         |
| 8. Supply Chain                           | **Agent 4**                         | It generates Dockerfile and has access to package files        |

---

## Decision Needed from Team

The Agent 4 contract expects Agent 2 to produce data that spans architecture, compliance, and operations. Three options:

1. **Extend Agent 2 scope** — Add geography, auth details, and AI governance to `Agent2OutputSchema`. Leaves compliance (sections 2, 4, 7) to Agent 3 and ops (section 8) to Agent 4.

2. **Keep Agent 2 as-is** — Treat the current output as the architecture skeleton. Agents 3 and 4 enrich it with their domain-specific details.

3. **Split the document** — Each agent owns the sections it can fill. Agent 4 aggregates everything into a final unified document.

Option 2 or 3 is most aligned with how we built Agent 2 (focused, Clean Architecture, single responsibility). Option 1 bloats Agent 2's scope significantly.
