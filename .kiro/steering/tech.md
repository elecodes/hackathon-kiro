## Stack Selection

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
| Open/Closed | Extend via new implementations of port interfaces, not by modifying existing code | Application |
| Liskov Substitution | All LlmPort implementations must be interchangeable without altering use case behavior | Infrastructure |
| Interface Segregation | Port interfaces define only the methods the use case needs | Application |
| Dependency Inversion | Application layer depends on port abstractions, not concrete infrastructure | Application |

## Security Policies

| Name | Description | Enforcement |
| --- | --- | --- |
| Zod Input Validation | All external inputs validated against strict Zod schemas at system boundaries | Middleware + Use Case entry |
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
