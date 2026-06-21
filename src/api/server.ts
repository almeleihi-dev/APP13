import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import type { Logger } from "../shared/logging/index.js";
import type { AppConfig } from "../shared/config/index.js";
import type { DbPool } from "../shared/db/index.js";
import type { IdempotencyService } from "../platform/idempotency/index.js";
import type { AuthService } from "../identity/application/auth-service.js";
import type { RegistrationService } from "../identity/application/auth-service.js";
import type { ProfileService } from "../identity/application/profile-service.js";
import type { VerificationService } from "../identity/application/verification-service.js";
import type { IdentityRevalidationService } from "../identity/application/revalidation-service.js";
import type { JwtService } from "../identity/infrastructure/jwt-service.js";
import type { SessionStore } from "../identity/infrastructure/session-store.js";
import { requestIdMiddleware, errorHandler } from "./middleware/request.js";
import {
  createIdempotencyPreHandler,
  createIdempotencyOnSend,
} from "./middleware/idempotency.js";
import { createAuthenticateMiddleware } from "./middleware/authenticate.js";
import { requireAuthMiddleware } from "./middleware/require-auth.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerSecurityAuthRoutes } from "./routes/security-auth.js";
import type { SecurityAuthKernelService } from "../security/auth-kernel-service.js";
import type { OwnershipRegistry } from "../security/ownership-registry.js";
import type { SecurityAuditService } from "../security/audit-service.js";
import { registerIdentityRoutes } from "./routes/identity.js";
import { registerVerificationRoutes } from "./routes/verification.js";
import type { ActionService } from "../action/application/action-service.js";
import type { ContractEngineService } from "../contract/application/contract-engine.service.js";
import type { ExecutionService } from "../execution/application/execution-service.js";
import type { EvaluationService } from "../execution/application/evaluation-service.js";
import type { IssueService } from "../complaint/application/issue-service.js";
import type { ActionIntelligenceService } from "../action/intelligence/action-intelligence-service.js";
import type { RequirementIntelligenceService } from "../action/intelligence/requirement/requirement-intelligence-service.js";
import type { ContractIntelligenceService } from "../contract/intelligence/contract-intelligence-service.js";
import type { TrustIntelligenceService } from "../trust/intelligence/trust-intelligence-service.js";
import type { MatchingIntelligenceService } from "../matching/intelligence/matching-intelligence-service.js";
import type { PricingIntelligenceService } from "../pricing/intelligence/pricing-intelligence-service.js";
import type { NegotiationIntelligenceService } from "../negotiation/intelligence/negotiation-intelligence-service.js";
import type { WorkflowIntelligenceService } from "../orchestrator/intelligence/workflow-intelligence-service.js";
import type { ProviderIntelligenceService } from "../provider/intelligence/provider-intelligence-service.js";
import type { ExperienceServices } from "../experience/index.js";
import { registerEscrowExperienceRoutes } from "./routes/escrow.js";
import { registerExecutionExperienceRoutes } from "./routes/execution.js";
import { registerEvidenceReadRoutes } from "./routes/evidence-read.js";
import { registerDisputesReadRoutes } from "./routes/disputes-read.js";
import { registerTrustExperienceRoutes } from "./routes/trust.js";
import { registerPlatformExperienceRoutes } from "./routes/platform.js";
import { createServiceAuthMiddleware } from "./middleware/service-auth.js";
import { createRevalidationMiddleware } from "./middleware/revalidate.js";
import { registerActionRoutes, registerContractActionRoutes } from "./routes/actions.js";
import { registerContractRoutes } from "./routes/contracts.js";
import { registerEvidenceRoutes } from "./routes/evidence.js";
import { registerIssueRoutes } from "./routes/issues.js";
import { registerInternalContractRoutes } from "./routes/internal/contracts.js";
import { registerAiActionRoutes } from "./routes/ai-actions.js";
import { registerAiRequirementRoutes } from "./routes/ai-requirements.js";
import { registerAiContractRoutes } from "./routes/ai-contracts.js";
import { registerAiTrustRoutes } from "./routes/ai-trust.js";
import { registerAiMatchingRoutes } from "./routes/ai-matching.js";
import { registerAiPricingRoutes } from "./routes/ai-pricing.js";
import { registerAiNegotiationRoutes } from "./routes/ai-negotiation.js";
import { registerAiWorkflowRoutes } from "./routes/ai-workflow.js";
import { registerAiProviderRoutes } from "./routes/ai-providers.js";

export interface AppDependencies {
  config: AppConfig;
  logger: Logger;
  db: DbPool;
  idempotency: IdempotencyService;
  jwt: JwtService;
  sessions: SessionStore;
  auth: AuthService;
  registration: RegistrationService;
  profile: ProfileService;
  verification: VerificationService;
  revalidation: IdentityRevalidationService;
  actions: ActionService;
  contracts: ContractEngineService;
  execution: ExecutionService;
  evaluation: EvaluationService;
  issues: IssueService;
  actionIntelligence: ActionIntelligenceService;
  requirementIntelligence: RequirementIntelligenceService;
  contractIntelligence: ContractIntelligenceService;
  trustIntelligence: TrustIntelligenceService;
  matchingIntelligence: MatchingIntelligenceService;
  pricingIntelligence: PricingIntelligenceService;
  negotiationIntelligence: NegotiationIntelligenceService;
  workflowIntelligence: WorkflowIntelligenceService;
  providerIntelligence: ProviderIntelligenceService;
  experience: ExperienceServices;
  securityAuth: SecurityAuthKernelService;
  ownershipRegistry: OwnershipRegistry;
  securityAudit: SecurityAuditService;
}

export async function buildServer(deps: AppDependencies) {
  const app = Fastify({
    logger: deps.logger,
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  await app.register(cookie);

  app.addHook("onRequest", requestIdMiddleware);
  app.addHook("preHandler", createIdempotencyPreHandler(deps.idempotency));
  app.addHook(
    "preHandler",
    createAuthenticateMiddleware({
      jwt: deps.jwt,
      sessions: deps.sessions,
      config: deps.config,
    })
  );
  app.addHook("preHandler", requireAuthMiddleware);
  app.addHook("preHandler", createRevalidationMiddleware(deps.revalidation));
  app.addHook("preHandler", createServiceAuthMiddleware(deps.config.serviceId));
  app.addHook("onSend", createIdempotencyOnSend(deps.idempotency));
  app.setErrorHandler(errorHandler);

  await registerHealthRoutes(app, deps.db);
  await registerAuthRoutes(app, {
    auth: deps.auth,
    registration: deps.registration,
  });
  await registerSecurityAuthRoutes(app, { securityAuth: deps.securityAuth });
  await registerIdentityRoutes(app, deps.profile);
  await registerVerificationRoutes(app, deps.verification);
  await registerActionRoutes(app, deps.actions);
  await registerContractActionRoutes(app, deps.contracts);
  await registerContractRoutes(app, deps.contracts, deps.evaluation);
  await registerEvidenceRoutes(app, deps.execution);
  await registerIssueRoutes(app, deps.issues);
  await registerAiActionRoutes(app, deps.actionIntelligence);
  await registerAiRequirementRoutes(app, deps.requirementIntelligence);
  await registerAiContractRoutes(app, deps.contractIntelligence);
  await registerAiTrustRoutes(app, deps.trustIntelligence);
  await registerAiMatchingRoutes(app, deps.matchingIntelligence);
  await registerAiPricingRoutes(app, deps.pricingIntelligence);
  await registerAiNegotiationRoutes(app, deps.negotiationIntelligence);
  await registerAiWorkflowRoutes(app, deps.workflowIntelligence);
  await registerAiProviderRoutes(app, deps.providerIntelligence);
  await registerInternalContractRoutes(app, deps.contracts);
  await registerEscrowExperienceRoutes(app, deps.experience.escrow);
  await registerExecutionExperienceRoutes(app, deps.experience.execution);
  await registerEvidenceReadRoutes(app, deps.experience.evidence);
  await registerDisputesReadRoutes(app, deps.experience.dispute);
  await registerTrustExperienceRoutes(app, deps.experience.trust);
  await registerPlatformExperienceRoutes(app, deps.experience.platform);

  return app;
}
