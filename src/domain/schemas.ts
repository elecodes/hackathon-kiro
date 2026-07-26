// src/domain/schemas.ts — Zod schema definitions for all domain types
import { z } from "zod";

export const ExpectedMetricsSchema = z.object({
  mvpMonthlyUsers: z.number().positive(),
  scaleMonthlyUsers: z.number().positive(),
  peakConcurrentConnections: z.number().positive(),
});

export const Agent1OutputSchema = z.object({
  projectName: z.string().min(1),
  productVision: z.string().min(1),
  targetAudience: z.string().min(1),
  valueProposition: z.string().min(1),
  mvpFeatures: z.array(z.string().min(1)).min(1),
  expectedMetrics: ExpectedMetricsSchema,
});

export const SolidBoundarySchema = z.object({
  principle: z.string().min(1),
  rule: z.string().min(1),
  layer: z.string().min(1),
});

export const SecurityGuardSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  enforcement: z.string().min(1),
});

export const TechSteeringSchema = z.object({
  stack: z.array(z.string().min(1)).min(1),
  architecturePattern: z.enum(["Clean", "Hexagonal"]),
  solidBoundaries: z.array(SolidBoundarySchema).min(1),
  securityGuards: z.array(SecurityGuardSchema).min(1),
  deploymentRegion: z.string().min(1),
  dataStorageRegion: z.string().min(1),
});

export const AuthConfigSchema = z.object({
  provider: z.string().min(1),
  loginMethods: z.array(z.string().min(1)).min(1),
  mfa: z.boolean(),
  sessionLifetimeMinutes: z.number().positive(),
  authorizationModel: z.enum(["RBAC", "ABAC", "ReBAC"]),
});

export const AiConfigSchema = z.object({
  model: z.string().min(1),
  provider: z.string().min(1),
  region: z.string().min(1),
  personalDataInPrompts: z.boolean(),
  promptLogging: z.boolean(),
});

export const EntityPropertySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
});

export const DomainEntitySchema = z.object({
  name: z.string().min(1),
  properties: z.array(EntityPropertySchema).min(1),
  relationships: z.array(z.string()),
});

export const IamPolicySchema = z.object({
  service: z.string().min(1),
  actions: z.array(z.string().min(1)).min(1),
  resource: z.string().min(1),
  effect: z.enum(["Allow", "Deny"]),
});

export const ServiceCostSchema = z.object({
  service: z.string().min(1),
  monthlyCostUsd: z.number().nonnegative(),
});

export const CostProjectionSchema = z.object({
  mvpMonthlyCostUsd: z.array(ServiceCostSchema).min(1),
  scaleMonthlyCostUsd: z.array(ServiceCostSchema).min(1),
});

export const DesignSchema = z.object({
  domainEntities: z.array(DomainEntitySchema).min(1),
  mermaidDiagram: z.string().min(1),
  iamPolicySummary: z.array(IamPolicySchema).min(1),
  awsCostProjection: CostProjectionSchema,
});

export const TaskItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dependencies: z.array(z.string()),
});

export const Agent2OutputSchema = z.object({
  techSteering: TechSteeringSchema,
  requirements: z.string().min(1),
  design: DesignSchema,
  tasks: z.array(TaskItemSchema).min(1),
  authConfig: AuthConfigSchema,
  aiConfig: AiConfigSchema,
});
