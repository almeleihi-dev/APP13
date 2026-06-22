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
import type { TrustScoreService } from "../trust/application/trust-score-service.js";
import type { ProviderProfileService } from "../provider-experience/application/provider-profile-service.js";
import type { RequestIntelligenceService } from "../request-experience/application/request-intelligence-service.js";
import type { MatchContractConversionService } from "../conversion/application/match-contract-conversion-service.js";
import type { CustomerDashboardService } from "../customer-experience/application/customer-dashboard-service.js";
import type { ProviderDashboardService } from "../provider-workspace/application/provider-dashboard-service.js";
import type { AdminConsoleService } from "../operations/application/admin-console-service.js";
import type { EventInboxService } from "../notifications/application/event-inbox-service.js";
import type { DiscoveryService } from "../discovery/application/discovery-service.js";
import type { PlatformAnalyticsService } from "../analytics/application/platform-analytics-service.js";
import type { HomeExperienceService } from "../experience/application/home-experience-service.js";
import type { LiveFrameExperienceService } from "../experience/live-frame/application/live-frame-experience-service.js";
import type { ContractJourneyService } from "../experience/contract-journey/application/contract-journey-service.js";
import type { ActionEconomyService } from "../experience/action-economy/application/action-economy-service.js";
import type { RequestMatchExperienceService } from "../experience/request-match/application/request-match-experience-service.js";
import type { EscrowPaymentExperienceService } from "../experience/escrow-payment/application/escrow-payment-experience-service.js";
import type { TrustReputationExperienceService } from "../experience/trust-reputation/application/trust-reputation-experience-service.js";
import type { DiscoveryMatchingService } from "../experience/discovery-matching/application/discovery-matching-service.js";
import type { ProfessionalPassportService } from "../experience/professional-passport/application/professional-passport-service.js";
import type { ProfessionalSealsService } from "../experience/professional-seals/application/professional-seals-service.js";
import type { LiveTrustFrameService } from "../experience/live-trust-frame/application/live-trust-frame-service.js";
import type { ProviderCommandCenterService } from "../experience/provider-command-center/application/provider-command-center-service.js";
import type { CustomerCommandCenterService } from "../experience/customer-command-center/application/customer-command-center-service.js";
import type { PlatformControlTowerService } from "../experience/platform-control-tower/application/platform-control-tower-service.js";
import type { ReleaseReadinessCenterService } from "../experience/release-readiness/application/release-readiness-service.js";
import { registerTrustExperienceRoutes, registerTrustReputationRoutes } from "./routes/trust.js";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerRequestRoutes } from "./routes/requests.js";
import { registerConversionRoutes } from "./routes/conversions.js";
import { registerCustomerDashboardRoutes } from "./routes/customer-dashboard.js";
import { registerProviderDashboardRoutes } from "./routes/provider-dashboard.js";
import { registerAdminConsoleRoutes } from "./routes/admin-console.js";
import { registerNotificationRoutes } from "./routes/notifications.js";
import { registerDiscoveryRoutes } from "./routes/discovery.js";
import { registerAnalyticsRoutes } from "./routes/analytics.js";
import { registerHomeRoutes } from "./routes/home.js";
import { registerLiveFrameRoutes } from "./routes/live-frame.js";
import { registerContractJourneyRoutes } from "./routes/contract-journey.js";
import { registerActionEconomyRoutes } from "./routes/action-economy.js";
import { registerRequestMatchRoutes } from "./routes/request-match.js";
import { registerEscrowPaymentRoutes } from "./routes/escrow-payment.js";
import { registerTrustReputationExperienceRoutes } from "./routes/trust-reputation.js";
import { registerDiscoveryMatchingRoutes } from "./routes/discovery-matching.js";
import { registerProfessionalPassportRoutes } from "./routes/professional-passport.js";
import { registerProfessionalSealsRoutes } from "./routes/professional-seals.js";
import { registerLiveTrustFrameRoutes } from "./routes/live-trust-frame.js";
import { registerProviderCommandCenterRoutes } from "./routes/provider-command-center.js";
import { registerCustomerCommandCenterRoutes } from "./routes/customer-command-center.js";
import { registerPlatformControlTowerRoutes } from "./routes/platform-control-tower.js";
import { registerReleaseReadinessRoutes } from "./routes/release-readiness.js";
import { registerMarketplaceIntelligenceRoutes } from "./routes/marketplace-intelligence.js";
import { registerExecutiveCommandCenterRoutes } from "./routes/executive-command-center.js";
import { registerLaunchSimulationRoutes } from "./routes/launch-simulation.js";
import { registerInvestorReadinessRoutes } from "./routes/investor-readiness.js";
import type { InvestorReadinessService } from "../experience/investor-readiness/application/investor-readiness-service.js";
import type { LaunchSimulationService } from "../experience/launch-simulation/application/launch-simulation-service.js";
import type { ExecutiveCommandCenterService } from "../experience/executive-command-center/application/executive-command-center-service.js";
import type { MarketplaceIntelligenceService } from "../experience/marketplace-intelligence/application/marketplace-intelligence-service.js";
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
  trustScore: TrustScoreService;
  providerProfile: ProviderProfileService;
  requestIntelligence: RequestIntelligenceService;
  matchContractConversion: MatchContractConversionService;
  customerDashboard: CustomerDashboardService;
  providerDashboard: ProviderDashboardService;
  adminConsole: AdminConsoleService;
  eventInbox: EventInboxService;
  discovery: DiscoveryService;
  platformAnalytics: PlatformAnalyticsService;
  homeExperience: HomeExperienceService;
  liveFrameExperience: LiveFrameExperienceService;
  contractJourney: ContractJourneyService;
  actionEconomy: ActionEconomyService;
  requestMatchExperience: RequestMatchExperienceService;
  escrowPaymentExperience: EscrowPaymentExperienceService;
  trustReputationExperience: TrustReputationExperienceService;
  discoveryMatching: DiscoveryMatchingService;
  professionalPassport: ProfessionalPassportService;
  professionalSeals: ProfessionalSealsService;
  liveTrustFrame: LiveTrustFrameService;
  providerCommandCenter: ProviderCommandCenterService;
  customerCommandCenter: CustomerCommandCenterService;
  platformControlTower: PlatformControlTowerService;
  marketplaceIntelligence: MarketplaceIntelligenceService;
  executiveCommandCenter: ExecutiveCommandCenterService;
  launchSimulation: LaunchSimulationService;
  investorReadiness: InvestorReadinessService;
  releaseReadinessCenter: ReleaseReadinessCenterService;
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
  await registerTrustReputationRoutes(app, deps.trustScore);
  await registerProviderRoutes(app, deps.providerProfile);
  await registerProviderDashboardRoutes(app, deps.providerDashboard);
  await registerRequestRoutes(app, deps.requestIntelligence);
  await registerConversionRoutes(app, deps.matchContractConversion);
  await registerCustomerDashboardRoutes(app, deps.customerDashboard);
  await registerAdminConsoleRoutes(app, deps.adminConsole);
  await registerNotificationRoutes(app, deps.eventInbox);
  await registerDiscoveryRoutes(app, deps.discovery);
  await registerAnalyticsRoutes(app, deps.platformAnalytics);
  await registerHomeRoutes(app, deps.homeExperience);
  await registerLiveFrameRoutes(app, deps.liveFrameExperience);
  await registerContractJourneyRoutes(app, deps.contractJourney);
  await registerActionEconomyRoutes(app, deps.actionEconomy);
  await registerRequestMatchRoutes(app, deps.requestMatchExperience);
  await registerEscrowPaymentRoutes(app, deps.escrowPaymentExperience);
  await registerTrustReputationExperienceRoutes(app, deps.trustReputationExperience);
  await registerDiscoveryMatchingRoutes(app, deps.discoveryMatching);
  await registerProfessionalPassportRoutes(app, deps.professionalPassport);
  await registerProfessionalSealsRoutes(app, deps.professionalSeals);
  await registerLiveTrustFrameRoutes(app, deps.liveTrustFrame);
  await registerProviderCommandCenterRoutes(app, deps.providerCommandCenter);
  await registerCustomerCommandCenterRoutes(app, deps.customerCommandCenter);
  await registerPlatformControlTowerRoutes(app, deps.platformControlTower);
  await registerMarketplaceIntelligenceRoutes(app, deps.marketplaceIntelligence);
  await registerExecutiveCommandCenterRoutes(app, deps.executiveCommandCenter);
  await registerLaunchSimulationRoutes(app, deps.launchSimulation);
  await registerInvestorReadinessRoutes(app, deps.investorReadiness);
  await registerReleaseReadinessRoutes(app, deps.releaseReadinessCenter);
  await registerPlatformExperienceRoutes(app, deps.experience.platform);

  return app;
}
