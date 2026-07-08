import {
  createLivingOnboardingModule,
  createProfessionalHomeModule,
  createLivingPassportModule,
  createLivingLiveFrameModule,
  createLivingJourneyModule,
  createLivingTodayIActedModule,
  createLivingOpportunitiesModule,
  createLivingPartnerEcosystemModule,
  createLivingProfessionalCommunityModule,
  createLivingProfessionalCoachModule,
  createLivingActionPlannerModule,
  createLivingProfessionalImpactModule,
  createLivingProfessionalIdentityModule,
  createLivingProfessionalIntelligenceModule,
  createLivingProfessionalSimulatorModule,
  createLivingProfessionalGoalsModule,
  createLivingProfessionalAchievementsModule,
  createLivingProfessionalAnalyticsModule,
  createLivingProfessionalTimelineModule,
  createLivingProfessionalCareerEngineModule,
} from "../living-experience/module.js";
import type { LivingDependencies } from "./dependencies.js";

export function bootstrapLiving(): LivingDependencies {
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

  return {
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
  };
}
