import { loadConfig } from "./shared/config/index.js";
import { createLogger } from "./shared/logging/index.js";
import { createPool } from "./shared/db/index.js";
import { createIdempotencyService } from "./platform/idempotency/index.js";
import {
  createJwtService,
  createSessionStore,
  createTokenStore,
  createKycSandboxAdapter,
  identityRepository,
  verificationRepository,
} from "./identity/infrastructure/index.js";
import {
  createAuthService,
  createRegistrationService,
  createProfileService,
  createVerificationService,
  createIdentityRevalidationService,
} from "./identity/application/index.js";
import { buildServer } from "./api/server.js";
import { createActionService } from "./action/application/action-service.js";
import { createContractEngineService } from "./contract/application/contract-engine.service.js";
import { contractRepository } from "./contract/infrastructure/contract-repository.js";
import { createExecutionService } from "./execution/application/execution-service.js";
import { createEvaluationService } from "./execution/application/evaluation-service.js";
import { createIssueService } from "./complaint/application/issue-service.js";
import { createObjectStorage } from "./platform/storage/index.js";
import { createActionIntelligenceService } from "./action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "./action/intelligence/requirement/requirement-intelligence-service.js";
import { createContractIntelligenceService } from "./contract/intelligence/contract-intelligence-service.js";
import { createTrustIntelligenceService } from "./trust/intelligence/trust-intelligence-service.js";
import { createMatchingIntelligenceService } from "./matching/intelligence/matching-intelligence-service.js";
import { createPricingIntelligenceService } from "./pricing/intelligence/pricing-intelligence-service.js";
import { createNegotiationIntelligenceService } from "./negotiation/intelligence/negotiation-intelligence-service.js";
import { createWorkflowIntelligenceService } from "./orchestrator/intelligence/workflow-intelligence-service.js";
import { createProviderIntelligenceService } from "./provider/intelligence/provider-intelligence-service.js";
import { createEscrowService } from "./financial/application/escrow-service.js";
import { createTrustModule } from "./trust/module.js";
import { createProviderExperienceModule } from "./provider-experience/module.js";
import { createRequestExperienceModule } from "./request-experience/module.js";
import { createConversionModule } from "./conversion/module.js";
import { createCustomerExperienceModule } from "./customer-experience/module.js";
import { createProviderWorkspaceModule } from "./provider-workspace/module.js";
import { createOperationsModule } from "./operations/module.js";
import { createNotificationsModule } from "./notifications/module.js";
import { createDiscoveryModule } from "./discovery/module.js";
import { createAnalyticsModule } from "./analytics/module.js";
import { createHomeExperienceModule } from "./experience/module.js";
import { createLiveFrameExperienceModule } from "./experience/live-frame/module.js";
import { createContractJourneyModule } from "./experience/contract-journey/module.js";
import { createActionEconomyModule } from "./experience/action-economy/module.js";
import { createRequestMatchExperienceModule } from "./experience/request-match/module.js";
import { createEscrowPaymentExperienceModule } from "./experience/escrow-payment/module.js";
import { createTrustReputationExperienceModule } from "./experience/trust-reputation/module.js";
import { createDiscoveryMatchingModule } from "./experience/discovery-matching/module.js";
import { createProfessionalPassportModule } from "./experience/professional-passport/module.js";
import { createProfessionalSealsModule } from "./experience/professional-seals/module.js";
import { createLiveTrustFrameModule } from "./experience/live-trust-frame/module.js";
import { createProviderCommandCenterModule } from "./experience/provider-command-center/module.js";
import { createCustomerCommandCenterModule } from "./experience/customer-command-center/module.js";
import { createPlatformControlTowerModule } from "./experience/platform-control-tower/module.js";
import { createReleaseReadinessCenterModule } from "./experience/release-readiness/module.js";
import { createMarketplaceIntelligenceModule } from "./experience/marketplace-intelligence/module.js";
import { createExecutiveCommandCenterModule } from "./experience/executive-command-center/module.js";
import { createLaunchSimulationModule } from "./experience/launch-simulation/module.js";
import { createInvestorReadinessModule } from "./experience/investor-readiness/module.js";
import { createGovernmentPartnershipModule } from "./experience/government-partnership/module.js";
import { createStrategicOperatingModule } from "./experience/strategic-operating-system/module.js";
import { createMissionControlModule } from "./experience/mission-control/module.js";
import { createExecutiveExperienceModule } from "./experience/executive-experience/module.js";
import { createArchitectureReviewModule } from "./experience/architecture-review/module.js";
import { createApiAuditModule } from "./experience/api-audit/module.js";
import { createProductionReadinessModule } from "./experience/production-readiness/module.js";
import { createSecurityReadinessModule } from "./experience/security-readiness/module.js";
import { createPlatformOperationsModule } from "./experience/platform-operations/module.js";
import { createLaunchControlModule } from "./experience/launch-control/module.js";
import { createPostLaunchMonitoringModule } from "./experience/post-launch-monitoring/module.js";
import { createBusinessIntelligenceModule } from "./experience/business-intelligence/module.js";
import { createExecutiveUxReadinessModule } from "./experience/executive-ux-readiness/module.js";
import { createBrowserExperienceCompletenessModule } from "./experience/browser-experience-completeness/module.js";
import { createOperatorSurfaceNavigationModule } from "./experience/operator-surface-navigation/module.js";
import { createOperatorExperienceIntegrityModule } from "./experience/operator-experience-integrity/module.js";
import { createOperatorOnboardingReadinessModule } from "./experience/operator-onboarding-readiness/module.js";
import { createActionBlueprintModule } from "./action-blueprint/module.js";
import { createProfessionOntologyModule } from "./profession-ontology/module.js";
import { createProjectDecompositionModule } from "./project-decomposition/module.js";
import { createTekrrIntelligenceModule } from "./tekrr-intelligence/module.js";
import { createExecutionBlueprintModule } from "./execution-blueprint/module.js";
import { createBlueprintGovernanceModule } from "./blueprint-governance/module.js";
import { createMarketplaceCompilationModule } from "./marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "./intelligent-pricing/module.js";
import { createIntelligentCommissionModule } from "./intelligent-commission/module.js";
import { createPersonalAssistantModule } from "./personal-assistant/module.js";
import { createDevelopMeModule } from "./develop-me/module.js";
import { createLearnByActionModule } from "./learn-by-action/module.js";
import { createExpertNetworkModule } from "./expert-network/module.js";
import { createTeamBuilderModule } from "./team-builder/module.js";
import { createKnowledgeBankModule } from "./knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "./intelligence-orchestration/module.js";
import { createNeedExperienceModule } from "./runtime-experience/need/module.js";
import { createActionExperienceModule } from "./runtime-experience/action/module.js";
import { createContractExperienceModule } from "./runtime-experience/contract/module.js";
import { createChatExperienceModule } from "./runtime-experience/chat/module.js";
import { createTimelineExperienceModule } from "./runtime-experience/timeline/module.js";
import { createNotificationExperienceModule } from "./runtime-experience/notification/module.js";
import { createProfileExperienceModule } from "./runtime-experience/profile/module.js";
import { createAnActRuntimeJourneyModule } from "./runtime-experience/runtime-journey/module.js";
import { createAnActRuntimeStateModule } from "./runtime-experience/runtime-state/module.js";
import { createAnActRuntimeRegistryModule } from "./runtime-experience/runtime-registry/module.js";
import { createAnActRuntimeCoordinatorModule } from "./runtime-experience/runtime-coordinator/module.js";
import { createAnActRuntimeHealthModule } from "./runtime-experience/runtime-health/module.js";
import { createAnActRuntimeDemoModule } from "./runtime-experience/runtime-demo/module.js";
import { createAnActRuntimePreviewModule } from "./runtime-experience/runtime-preview/module.js";
import { createAnActRuntimeLauncherModule } from "./runtime-experience/runtime-launcher/module.js";
import { createAnActRuntimeReleaseModule } from "./runtime-experience/runtime-release/module.js";
import { createAnActRuntimeOperationsModule } from "./runtime-experience/runtime-operations/module.js";
import { createAnActRuntimeExecutiveDashboardModule } from "./runtime-experience/runtime-executive/module.js";
import { createAnActRuntimeReadinessConsoleModule } from "./runtime-experience/runtime-readiness/module.js";
import { createAnActRuntimeCertificationCenterModule } from "./runtime-experience/runtime-certification/module.js";
import { createAnActRuntimeFinalReadinessReviewModule } from "./runtime-experience/runtime-final-readiness/module.js";
import { createAnActRuntimeProductionApprovalCenterModule } from "./runtime-experience/runtime-production-approval/module.js";
import { createAnActRuntimeOperationsCenterModule } from "./runtime-experience/runtime-operations-center/module.js";
import { createAnActRuntimeLaunchControlCenterModule } from "./runtime-experience/runtime-launch-control/module.js";
import { createAnActRuntimeLaunchReadinessAuthorityModule } from "./runtime-experience/runtime-launch-readiness-authority/module.js";
import { createLivingOnboardingModule, createProfessionalHomeModule, createLivingPassportModule, createLivingLiveFrameModule, createLivingJourneyModule, createLivingTodayIActedModule, createLivingOpportunitiesModule, createLivingPartnerEcosystemModule, createLivingProfessionalCommunityModule, createLivingProfessionalCoachModule, createLivingActionPlannerModule, createLivingProfessionalImpactModule, createLivingProfessionalIdentityModule, createLivingProfessionalIntelligenceModule, createLivingProfessionalSimulatorModule, createLivingProfessionalGoalsModule, createLivingProfessionalAchievementsModule, createLivingProfessionalAnalyticsModule, createLivingProfessionalTimelineModule, createLivingProfessionalCareerEngineModule } from "./living-experience/module.js";
import { createBrowserSurfaceModule } from "./browser-surface/module.js";
import { createBrowserStaticModule } from "./browser-static/module.js";
import { createExperienceServices } from "./experience/index.js";
import {
  AuditLogRepository,
  createDefaultOwnershipRegistry,
  createSecurityAuditService,
  createSecurityAuthKernelService,
} from "./security/index.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config);
  const db = createPool(config, logger);
  const idempotency = createIdempotencyService(config);

  const jwt = createJwtService(config);
  const sessions = createSessionStore(config);
  const tokenStore = createTokenStore(config);
  const kyc = createKycSandboxAdapter(config, logger);

  const auth = createAuthService({
    db,
    identityRepo: identityRepository,
    jwt,
    sessions,
    tokenStore,
    config,
    logger,
  });

  const registration = createRegistrationService({
    db,
    identityRepo: identityRepository,
    auth,
    tokenStore,
    logger,
  });

  const profile = createProfileService(db, identityRepository);
  const verification = createVerificationService({
    db,
    identityRepo: identityRepository,
    verificationRepo: verificationRepository,
    tokenStore,
    kyc,
    config,
    logger,
  });

  const revalidation = createIdentityRevalidationService(db, identityRepository);

  const actions = createActionService(db, identityRepository);
  const { trust, trustScore } = createTrustModule(db);
  const { eventInbox } = createNotificationsModule(db);
  trust.attachEventInboxService(eventInbox);
  const { providerProfile } = createProviderExperienceModule(db, { trustScore });
  const { requestIntelligence } = createRequestExperienceModule(db, { trustScore });
  const { matchContractConversion } = createConversionModule(db, { eventInbox });
  const { customerDashboard } = createCustomerExperienceModule(db);
  const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
  const { adminConsole } = createOperationsModule(db);
  const { discovery } = createDiscoveryModule(db, { trustScore });
  const { platformAnalytics } = createAnalyticsModule(db);
  const { homeExperience } = createHomeExperienceModule(db, {
    customerDashboard,
    providerDashboard,
    eventInbox,
    trustScore,
  });
  const { liveFrameExperience } = createLiveFrameExperienceModule(db, {
    trustScore,
    providerProfile,
  });
  const { contractJourney } = createContractJourneyModule(db);
  const { actionEconomy } = createActionEconomyModule(db, { trustScore });
  const { requestMatchExperience } = createRequestMatchExperienceModule(db, { trustScore });
  const { escrowPaymentExperience } = createEscrowPaymentExperienceModule(db);
  const { trustReputationExperience } = createTrustReputationExperienceModule(db, {
    trustScore,
    providerProfile,
  });
  const { discoveryMatching } = createDiscoveryMatchingModule(db, { trustScore });
  const { professionalPassport } = createProfessionalPassportModule(db, {
    trustScore,
    providerProfile,
  });
  const { professionalSeals } = createProfessionalSealsModule(db, {
    trustScore,
    providerProfile,
  });
  const { liveTrustFrame } = createLiveTrustFrameModule(db, {
    trustScore,
    providerProfile,
  });
  const { providerCommandCenter } = createProviderCommandCenterModule(db, {
    trustScore,
    providerProfile,
  });
  const { customerCommandCenter } = createCustomerCommandCenterModule(db, {
    liveTrustFrame,
  });
  const { platformControlTower } = createPlatformControlTowerModule(db);
  const { marketplaceIntelligence } = createMarketplaceIntelligenceModule(db);
  const { executiveCommandCenter } = createExecutiveCommandCenterModule(db);
  const { launchSimulation } = createLaunchSimulationModule(db);
  const { investorReadiness } = createInvestorReadinessModule(db);
  const { governmentPartnership } = createGovernmentPartnershipModule(db);
  const { strategicOperatingSystem } = createStrategicOperatingModule(db);
  const { missionControl } = createMissionControlModule(db);
  const { executiveExperience } = createExecutiveExperienceModule(db);
  const { architectureReview } = createArchitectureReviewModule(db);
  const { apiAudit } = createApiAuditModule(db);
  const { productionReadiness } = createProductionReadinessModule(db);
  const { securityReadiness } = createSecurityReadinessModule(db);
  const { platformOperations } = createPlatformOperationsModule(db);
  const { launchControl } = createLaunchControlModule(db);
  const { postLaunchMonitoring } = createPostLaunchMonitoringModule(db);
  const { businessIntelligence } = createBusinessIntelligenceModule(db);
  const { executiveUxReadiness } = createExecutiveUxReadinessModule(db);
  const { browserExperienceCompleteness } = createBrowserExperienceCompletenessModule(db);
  const { operatorSurfaceNavigation } = createOperatorSurfaceNavigationModule(db);
  const { operatorExperienceIntegrity } = createOperatorExperienceIntegrityModule(db);
  const { operatorOnboardingReadiness } = createOperatorOnboardingReadinessModule(db);
  const { actionBlueprint } = createActionBlueprintModule();
  const { professionOntology } = createProfessionOntologyModule();
  const { projectDecomposition } = createProjectDecompositionModule();
  const { tekrrIntelligence } = createTekrrIntelligenceModule();
  const { executionBlueprint } = createExecutionBlueprintModule();
  const { blueprintGovernance } = createBlueprintGovernanceModule();
  const { marketplaceCompilation } = createMarketplaceCompilationModule();
  const { intelligentPricing } = createIntelligentPricingModule();
  const { intelligentCommission } = createIntelligentCommissionModule();
  const { personalAssistant } = createPersonalAssistantModule();
  const { developMe } = createDevelopMeModule();
  const { learnByAction } = createLearnByActionModule();
  const { expertNetwork } = createExpertNetworkModule();
  const { teamBuilder } = createTeamBuilderModule();
  const { knowledgeBank } = createKnowledgeBankModule();
  const { intelligenceOrchestration } = createIntelligenceOrchestrationModule();
  const { livingOnboarding } = createLivingOnboardingModule();
  const { professionalHome } = createProfessionalHomeModule();
  const { livingPassport } = createLivingPassportModule();
  const { livingLiveFrame } = createLivingLiveFrameModule();
  const { livingJourney } = createLivingJourneyModule();
  const { livingTodayIActed } = createLivingTodayIActedModule();
  const { livingOpportunities } = createLivingOpportunitiesModule();
  const { livingPartnerEcosystem } = createLivingPartnerEcosystemModule();
  const { livingProfessionalCommunity } = createLivingProfessionalCommunityModule();
  const { livingProfessionalCoach } = createLivingProfessionalCoachModule();
  const { livingActionPlanner } = createLivingActionPlannerModule();
  const { livingProfessionalImpact } = createLivingProfessionalImpactModule();
  const { livingProfessionalIdentity } = createLivingProfessionalIdentityModule();
  const { livingProfessionalIntelligence } = createLivingProfessionalIntelligenceModule();
  const { livingProfessionalSimulator } = createLivingProfessionalSimulatorModule();
  const { livingProfessionalGoals } = createLivingProfessionalGoalsModule();
  const { livingProfessionalAchievements } = createLivingProfessionalAchievementsModule();
  const { livingProfessionalAnalytics } = createLivingProfessionalAnalyticsModule();
  const { livingProfessionalTimeline } = createLivingProfessionalTimelineModule();
  const { livingProfessionalCareerEngine } = createLivingProfessionalCareerEngineModule();
  const { needExperience } = createNeedExperienceModule();
  const { actionExperience } = createActionExperienceModule();
  const { contractExperience } = createContractExperienceModule();
  const { chatExperience } = createChatExperienceModule();
  const { timelineExperience } = createTimelineExperienceModule();
  const { notificationExperience } = createNotificationExperienceModule();
  const { profileExperience } = createProfileExperienceModule();
  const { runtimeJourney } = createAnActRuntimeJourneyModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
  });
  const { runtimeState } = createAnActRuntimeStateModule({ runtimeJourney });
  const { runtimeRegistry } = createAnActRuntimeRegistryModule();
  const { runtimeCoordinator } = createAnActRuntimeCoordinatorModule({
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
  });
  const { runtimeHealth } = createAnActRuntimeHealthModule({ runtimeRegistry });
  const { runtimeDemo } = createAnActRuntimeDemoModule({
    runtimeState,
    runtimeCoordinator,
    runtimeRegistry,
    runtimeHealth,
  });
  const { runtimePreview } = createAnActRuntimePreviewModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
  });
  const { runtimeLauncher } = createAnActRuntimeLauncherModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
  });
  const { runtimeRelease } = createAnActRuntimeReleaseModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
  });
  const { runtimeOperations } = createAnActRuntimeOperationsModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    runtimeRelease,
  });
  const { runtimeExecutive } = createAnActRuntimeExecutiveDashboardModule({
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    runtimeHealth,
  });
  const { runtimeReadiness } = createAnActRuntimeReadinessConsoleModule({
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
  });
  const { runtimeCertification } = createAnActRuntimeCertificationCenterModule({
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
  });
  const { runtimeFinalReadiness } = createAnActRuntimeFinalReadinessReviewModule({
    runtimeCertification,
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
  });
  const { runtimeProductionApproval } = createAnActRuntimeProductionApprovalCenterModule({
    runtimeFinalReadiness,
    runtimeCertification,
    runtimeExecutive,
    runtimeOperations,
  });
  const { runtimeOperationsCenter } = createAnActRuntimeOperationsCenterModule({
    runtimeProductionApproval,
    runtimeOperations,
    runtimeExecutive,
    runtimeFinalReadiness,
  });
  const { runtimeLaunchControl } = createAnActRuntimeLaunchControlCenterModule({
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    runtimeOperations,
  });
  const { runtimeLaunchReadinessAuthority } = createAnActRuntimeLaunchReadinessAuthorityModule({
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
  });
  const { browserSurface } = createBrowserSurfaceModule();
  const { browserStatic } = createBrowserStaticModule();
  const { releaseReadinessCenter } = createReleaseReadinessCenterModule();
  const contracts = createContractEngineService(db, identityRepository, trust, eventInbox);
  const storage = createObjectStorage(config);
  const execution = createExecutionService(db, contractRepository, storage, undefined, eventInbox);
  const evaluation = createEvaluationService(db, contractRepository, undefined, trust);
  const escrow = createEscrowService(db, undefined, contractRepository, trust, eventInbox);
  const issues = createIssueService(
    db,
    contractRepository,
    undefined,
    escrow,
    trust,
    eventInbox
  );
  const actionIntelligence = createActionIntelligenceService();
  const requirementIntelligence = createRequirementIntelligenceService();
  const contractIntelligence = createContractIntelligenceService(
    actionIntelligence,
    requirementIntelligence
  );
  const trustIntelligence = createTrustIntelligenceService();
  const matchingIntelligence = createMatchingIntelligenceService();
  const pricingIntelligence = createPricingIntelligenceService();
  const negotiationIntelligence = createNegotiationIntelligenceService();
  const workflowIntelligence = createWorkflowIntelligenceService();
  const providerIntelligence = createProviderIntelligenceService();
  const experience = createExperienceServices({
    db,
    contracts,
    execution,
    evaluation,
    issues,
    escrow,
    profile,
    trustIntelligence,
    providerIntelligence,
  });

  const securityAudit = createSecurityAuditService(new AuditLogRepository(db));
  const ownershipRegistry = createDefaultOwnershipRegistry(db);
  const securityAuth = createSecurityAuthKernelService({
    db,
    config,
    auth,
    registration,
    identityRepo: identityRepository,
    jwt,
    sessions,
    audit: securityAudit,
  });

  const app = await buildServer({
    config,
    logger,
    db,
    idempotency,
    jwt,
    sessions,
    auth,
    registration,
    profile,
    verification,
    revalidation,
    actions,
    contracts,
    execution,
    evaluation,
    issues,
    actionIntelligence,
    requirementIntelligence,
    contractIntelligence,
    trustIntelligence,
    matchingIntelligence,
    pricingIntelligence,
    negotiationIntelligence,
    workflowIntelligence,
    providerIntelligence,
    experience,
    trustScore,
    providerProfile,
    requestIntelligence,
    matchContractConversion,
    customerDashboard,
    providerDashboard,
    adminConsole,
    eventInbox,
    discovery,
    platformAnalytics,
    homeExperience,
    liveFrameExperience,
    contractJourney,
    actionEconomy,
    requestMatchExperience,
    escrowPaymentExperience,
    trustReputationExperience,
    discoveryMatching,
    professionalPassport,
    professionalSeals,
    liveTrustFrame,
    providerCommandCenter,
    customerCommandCenter,
    platformControlTower,
    marketplaceIntelligence,
    executiveCommandCenter,
    launchSimulation,
    investorReadiness,
    governmentPartnership,
    strategicOperatingSystem,
    missionControl,
    executiveExperience,
    architectureReview,
    apiAudit,
    productionReadiness,
    securityReadiness,
    platformOperations,
    launchControl,
    postLaunchMonitoring,
    businessIntelligence,
    executiveUxReadiness,
    browserExperienceCompleteness,
    operatorSurfaceNavigation,
    operatorExperienceIntegrity,
    operatorOnboardingReadiness,
    actionBlueprint,
    professionOntology,
    projectDecomposition,
    tekrrIntelligence,
    executionBlueprint,
    blueprintGovernance,
    marketplaceCompilation,
    intelligentPricing,
    intelligentCommission,
    personalAssistant,
    developMe,
    learnByAction,
    expertNetwork,
    teamBuilder,
    knowledgeBank,
    intelligenceOrchestration,
    livingOnboarding,
    professionalHome,
    livingPassport,
    livingLiveFrame,
    livingJourney,
    livingTodayIActed,
    livingOpportunities,
    livingPartnerEcosystem,
    livingProfessionalCommunity,
    livingProfessionalCoach,
    livingActionPlanner,
    livingProfessionalImpact,
    livingProfessionalIdentity,
    livingProfessionalIntelligence,
    livingProfessionalSimulator,
    livingProfessionalGoals,
    livingProfessionalAchievements,
    livingProfessionalAnalytics,
    livingProfessionalTimeline,
    livingProfessionalCareerEngine,
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    runtimeRelease,
    runtimeOperations,
    runtimeExecutive,
    runtimeReadiness,
    runtimeCertification,
    runtimeFinalReadiness,
    runtimeProductionApproval,
    runtimeOperationsCenter,
    runtimeLaunchControl,
    runtimeLaunchReadinessAuthority,
    browserSurface,
    browserStatic,
    releaseReadinessCenter,
    securityAuth,
    ownershipRegistry,
    securityAudit,
  });

  try {
    await app.listen({ host: config.host, port: config.port });
    logger.info({ port: config.port }, "app13-api listening");
  } catch (error) {
    logger.fatal({ err: error }, "failed to start server");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down");
    await app.close();
    await db.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
