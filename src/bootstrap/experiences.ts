import { createHomeExperienceModule } from "../experience/module.js";
import { createLiveFrameExperienceModule } from "../experience/live-frame/module.js";
import { createContractJourneyModule } from "../experience/contract-journey/module.js";
import { createActionEconomyModule } from "../experience/action-economy/module.js";
import { createRequestMatchExperienceModule } from "../experience/request-match/module.js";
import { createEscrowPaymentExperienceModule } from "../experience/escrow-payment/module.js";
import { createTrustReputationExperienceModule } from "../experience/trust-reputation/module.js";
import { createDiscoveryMatchingModule } from "../experience/discovery-matching/module.js";
import { createProfessionalPassportModule } from "../experience/professional-passport/module.js";
import { createProfessionalSealsModule } from "../experience/professional-seals/module.js";
import { createLiveTrustFrameModule } from "../experience/live-trust-frame/module.js";
import { createProviderCommandCenterModule } from "../experience/provider-command-center/module.js";
import { createCustomerCommandCenterModule } from "../experience/customer-command-center/module.js";
import { createPlatformControlTowerModule } from "../experience/platform-control-tower/module.js";
import { createMarketplaceIntelligenceModule } from "../experience/marketplace-intelligence/module.js";
import { createExecutiveCommandCenterModule } from "../experience/executive-command-center/module.js";
import { createLaunchSimulationModule } from "../experience/launch-simulation/module.js";
import { createInvestorReadinessModule } from "../experience/investor-readiness/module.js";
import { createGovernmentPartnershipModule } from "../experience/government-partnership/module.js";
import { createStrategicOperatingModule } from "../experience/strategic-operating-system/module.js";
import { createMissionControlModule } from "../experience/mission-control/module.js";
import { createExecutiveExperienceModule } from "../experience/executive-experience/module.js";
import { createArchitectureReviewModule } from "../experience/architecture-review/module.js";
import { createApiAuditModule } from "../experience/api-audit/module.js";
import { createProductionReadinessModule } from "../experience/production-readiness/module.js";
import { createSecurityReadinessModule } from "../experience/security-readiness/module.js";
import { createPlatformOperationsModule } from "../experience/platform-operations/module.js";
import { createLaunchControlModule } from "../experience/launch-control/module.js";
import { createPostLaunchMonitoringModule } from "../experience/post-launch-monitoring/module.js";
import { createBusinessIntelligenceModule } from "../experience/business-intelligence/module.js";
import { createExecutiveUxReadinessModule } from "../experience/executive-ux-readiness/module.js";
import { createBrowserExperienceCompletenessModule } from "../experience/browser-experience-completeness/module.js";
import { createOperatorSurfaceNavigationModule } from "../experience/operator-surface-navigation/module.js";
import { createOperatorExperienceIntegrityModule } from "../experience/operator-experience-integrity/module.js";
import { createOperatorOnboardingReadinessModule } from "../experience/operator-onboarding-readiness/module.js";
import { createReleaseReadinessCenterModule } from "../experience/release-readiness/module.js";
import { createBrowserSurfaceModule } from "../browser-surface/module.js";
import { createBrowserStaticModule } from "../browser-static/module.js";
import type { PlatformDependencies } from "./dependencies.js";
import type { EngineDependencies } from "./dependencies.js";
import type { ExperienceDependencies } from "./dependencies.js";

export function bootstrapPlatformExperiences(
  platform: PlatformDependencies,
  engines: EngineDependencies
): Omit<
  ExperienceDependencies,
  "browserSurface" | "browserStatic" | "releaseReadinessCenter"
> {
  const { db } = platform;
  const {
    customerDashboard,
    providerDashboard,
    eventInbox,
    trustScore,
    providerProfile,
  } = engines;

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

  return {
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
  };
}

export function bootstrapBrowserModules(): Pick<
  ExperienceDependencies,
  "browserSurface" | "browserStatic" | "releaseReadinessCenter"
> {
  const { browserSurface } = createBrowserSurfaceModule();
  const { browserStatic } = createBrowserStaticModule();
  const { releaseReadinessCenter } = createReleaseReadinessCenterModule();
  return { browserSurface, browserStatic, releaseReadinessCenter };
}
