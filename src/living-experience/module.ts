export {
  LIVING_ONBOARDING_SCHEMA_VERSION,
  LIVING_ONBOARDING_JSON_SCHEMA,
  LIVING_ONBOARDING_ROUTES,
  ONBOARDING_STEPS,
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEP_PURPOSES,
  WELCOME_HEADLINE,
} from "./onboarding/domain/onboarding-schema.js";
export {
  buildOnboardingContext,
  resolveCurrentStep,
  collectOnboardingIntelligencePaths,
  type OnboardingContext,
  type OnboardingResponses,
  type AccountData,
  type GeographicIntelligenceData,
  type ProfessionalBackgroundData,
  type SmartQuestionsData,
} from "./onboarding/domain/onboarding-context.js";
export {
  buildOnboardingJourney,
  buildOnboardingStatistics,
  validateStepSubmission,
  mergeStepResponse,
  toOnboardingJourneyView,
  toOnboardingStatisticsView,
  type OnboardingJourney,
  type OnboardingValidation,
  type OnboardingStatistics,
} from "./onboarding/domain/onboarding-journey.js";
export {
  buildInitialClassification,
  buildClassificationExplanation,
  toInitialClassificationView,
  toClassificationExplanationView,
  type InitialClassification,
} from "./onboarding/domain/onboarding-classification.js";
export {
  buildOnboardingPassport,
  buildOnboardingLiveFrame,
  buildOnboardingPersonalHome,
  buildOnboardingOutputs,
  toOnboardingPassportView,
  toOnboardingLiveFrameView,
  toOnboardingPersonalHomeView,
  type OnboardingPassport,
  type OnboardingLiveFrame,
  type OnboardingPersonalHome,
} from "./onboarding/domain/onboarding-projections.js";
export {
  collectOnboardingEngineFeeds,
  type OnboardingEngineDeps,
} from "./onboarding/application/onboarding-engine-feed.js";
export {
  LivingOnboardingService,
  createLivingOnboardingModule,
  createLivingOnboardingService,
  type LivingOnboardingModule,
} from "./onboarding/application/living-onboarding-service.js";
export {
  LivingOnboardingRepository,
  createLivingOnboardingRepository,
  livingOnboardingRepository,
} from "./onboarding/infrastructure/living-onboarding-repository.js";
export {
  PROFESSIONAL_HOME_SCHEMA_VERSION,
  PROFESSIONAL_HOME_JSON_SCHEMA,
  PROFESSIONAL_HOME_ROUTES,
  PROFESSIONAL_HOME_SECTIONS,
  PROFESSIONAL_HOME_SECTION_LABELS,
} from "./professional-home/domain/professional-home-schema.js";
export {
  buildProfessionalHomeContext,
  buildGeographicProfile,
  hashDayUser,
  type ProfessionalHomeContext,
  type GeographicProfile,
} from "./professional-home/domain/professional-home-context.js";
export {
  buildAllHomeSections,
  buildGreetingSection,
  buildTodaysBestStepSection,
  toHomeSectionView,
  toHomeSectionsView,
  type EngineSnapshot,
  type ProfessionalHomeSection,
} from "./professional-home/domain/professional-home-sections.js";
export {
  buildProfessionalHomeExperience,
  buildProfessionalHomeStatistics,
  validateProfessionalHomeContext,
  toProfessionalHomeView,
  toProfessionalHomeStatisticsView,
  findHomeSection,
  type ProfessionalHomeExperience,
  type ProfessionalHomeStatistics,
} from "./professional-home/domain/professional-home-experience.js";
export {
  collectProfessionalHomeEngineSnapshot,
  type ProfessionalHomeEngineDeps,
} from "./professional-home/application/professional-home-collector.js";
export {
  ProfessionalHomeService,
  createProfessionalHomeModule,
  createProfessionalHomeService,
  type ProfessionalHomeModule,
} from "./professional-home/application/professional-home-service.js";
export {
  ProfessionalHomeRepository,
  createProfessionalHomeRepository,
  professionalHomeRepository,
} from "./professional-home/infrastructure/professional-home-repository.js";
export {
  LIVING_PASSPORT_SCHEMA_VERSION,
  LIVING_PASSPORT_JSON_SCHEMA,
  LIVING_PASSPORT_ROUTES,
  LIVING_PASSPORT_SECTIONS,
  LIVING_PASSPORT_SECTION_LABELS,
  PARTNER_TYPES,
} from "./professional-passport/domain/passport-schema.js";
export {
  buildLivingPassportContext,
  resolvePrimaryProfession,
  resolveProfessionalTitle,
  type LivingPassportContext,
} from "./professional-passport/domain/passport-context.js";
export {
  buildAllPassportSections,
  toPassportSectionView,
  toPassportSectionsView,
  type LivingPassportSection,
  type PassportEngineSnapshot,
  type PartnerShareRequest,
} from "./professional-passport/domain/passport-sections.js";
export {
  buildLivingProfessionalPassport,
  buildLivingPassportStatistics,
  validateLivingPassportContext,
  toLivingPassportView,
  toLivingPassportStatisticsView,
  findPassportSection,
  type LivingProfessionalPassport,
  type LivingPassportStatistics,
} from "./professional-passport/domain/passport-experience.js";
export {
  collectLivingPassportEngineSnapshot,
  type LivingPassportEngineDeps,
} from "./professional-passport/application/passport-collector.js";
export {
  LivingPassportService,
  createLivingPassportModule,
  createLivingPassportService,
  type LivingPassportModule,
} from "./professional-passport/application/living-passport-service.js";
export {
  LivingPassportRepository,
  createLivingPassportRepository,
  livingPassportRepository,
} from "./professional-passport/infrastructure/living-passport-repository.js";
export {
  LIVING_LIVE_FRAME_SCHEMA_VERSION,
  LIVING_LIVE_FRAME_JSON_SCHEMA,
  LIVING_LIVE_FRAME_ROUTES,
  LIVING_LIVE_FRAME_SECTIONS,
  LIVING_LIVE_FRAME_SECTION_LABELS,
  FRAME_TIERS,
  FRAME_TIER_LABELS,
} from "./live-frame/domain/live-frame-schema.js";
export {
  buildLivingLiveFrameContext,
  computeBaseTrustScore,
  resolveFrameTier,
  hashFrameSeed,
  type LivingLiveFrameContext,
} from "./live-frame/domain/live-frame-context.js";
export {
  buildAllLiveFrameSections,
  toLiveFrameSectionView,
  toLiveFrameSectionsView,
  type LivingLiveFrameSection,
  type LiveFrameEngineSnapshot,
} from "./live-frame/domain/live-frame-sections.js";
export {
  buildLivingLiveFrameExperience,
  buildLivingLiveFrameStatistics,
  validateLivingLiveFrameContext,
  toLivingLiveFrameView,
  toLivingLiveFrameStatisticsView,
  findLiveFrameSection,
  type LivingLiveFrameExperience,
  type LivingLiveFrameStatistics,
} from "./live-frame/domain/live-frame-experience.js";
export {
  collectLivingLiveFrameEngineSnapshot,
  type LivingLiveFrameEngineDeps,
} from "./live-frame/application/live-frame-collector.js";
export {
  LivingLiveFrameService,
  createLivingLiveFrameModule,
  createLivingLiveFrameService,
  type LivingLiveFrameModule,
} from "./live-frame/application/living-live-frame-service.js";
export {
  LivingLiveFrameRepository,
  createLivingLiveFrameRepository,
  livingLiveFrameRepository,
} from "./live-frame/infrastructure/living-live-frame-repository.js";
export {
  LIVING_JOURNEY_SCHEMA_VERSION,
  LIVING_JOURNEY_JSON_SCHEMA,
  LIVING_JOURNEY_ROUTES,
  LIVING_JOURNEY_SECTIONS,
  LIVING_JOURNEY_SECTION_LABELS,
} from "./professional-journey/domain/journey-schema.js";
export {
  buildLivingJourneyContext,
  resolveJourneyStage,
  resolveJourneyName,
  hashJourneySeed,
  type LivingJourneyContext,
} from "./professional-journey/domain/journey-context.js";
export {
  buildAllJourneySections,
  buildPartnershipRecommendations,
  toJourneySectionView,
  toJourneySectionsView,
  type LivingJourneySection,
  type JourneyEngineSnapshot,
} from "./professional-journey/domain/journey-sections.js";
export {
  buildLivingProfessionalJourney,
  buildLivingJourneyStatistics,
  validateLivingJourneyContext,
  toLivingJourneyView,
  toLivingJourneyStatisticsView,
  findJourneySection,
  type LivingProfessionalJourney,
  type LivingJourneyStatistics,
} from "./professional-journey/domain/journey-experience.js";
export {
  collectLivingJourneyEngineSnapshot,
  type LivingJourneyEngineDeps,
} from "./professional-journey/application/journey-collector.js";
export {
  LivingJourneyService,
  createLivingJourneyModule,
  createLivingJourneyService,
  type LivingJourneyModule,
} from "./professional-journey/application/living-journey-service.js";
export {
  LivingJourneyRepository,
  createLivingJourneyRepository,
  livingJourneyRepository,
} from "./professional-journey/infrastructure/living-journey-repository.js";
export {
  LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
  LIVING_TODAY_I_ACTED_JSON_SCHEMA,
  LIVING_TODAY_I_ACTED_ROUTES,
  LIVING_TODAY_I_ACTED_SECTIONS,
  LIVING_TODAY_I_ACTED_SECTION_LABELS,
} from "./today-i-acted/domain/acted-schema.js";
export {
  buildLivingTodayIActedContext,
  hashActedSeed,
  type LivingTodayIActedContext,
} from "./today-i-acted/domain/acted-context.js";
export {
  buildAllActedSections,
  buildEvidenceDraftWithPermission,
  toActedSectionView,
  toActedSectionsView,
  type LivingTodayIActedSection,
  type ActedEngineSnapshot,
  type ProfessionalMemoryEntry,
} from "./today-i-acted/domain/acted-sections.js";
export {
  buildLivingTodayIActedExperience,
  buildLivingTodayIActedStatistics,
  validateLivingTodayIActedContext,
  toLivingTodayIActedView,
  toLivingTodayIActedStatisticsView,
  findActedSection,
  searchProfessionalMemories,
  type LivingTodayIActedExperience,
  type LivingTodayIActedStatistics,
} from "./today-i-acted/domain/acted-experience.js";
export {
  collectLivingTodayIActedEngineSnapshot,
  type LivingTodayIActedEngineDeps,
} from "./today-i-acted/application/acted-collector.js";
export {
  LivingTodayIActedService,
  createLivingTodayIActedModule,
  createLivingTodayIActedService,
  type LivingTodayIActedModule,
} from "./today-i-acted/application/living-today-i-acted-service.js";
export {
  LivingTodayIActedRepository,
  createLivingTodayIActedRepository,
  livingTodayIActedRepository,
} from "./today-i-acted/infrastructure/living-today-i-acted-repository.js";
export {
  LIVING_OPPORTUNITIES_SCHEMA_VERSION,
  LIVING_OPPORTUNITIES_JSON_SCHEMA,
  LIVING_OPPORTUNITIES_ROUTES,
  LIVING_OPPORTUNITIES_SECTIONS,
  LIVING_OPPORTUNITIES_SECTION_LABELS,
} from "./opportunities/domain/opportunities-schema.js";
export {
  buildLivingOpportunitiesContext,
  hashOpportunitySeed,
  type LivingOpportunitiesContext,
} from "./opportunities/domain/opportunities-context.js";
export {
  buildAllOpportunitiesSections,
  buildPartnershipOpportunityRecommendations,
  toOpportunitiesSectionView,
  toOpportunitiesSectionsView,
  type LivingOpportunitiesSection,
  type OpportunityEngineSnapshot,
  type SavedOpportunity,
  type OpportunityHistoryEntry,
} from "./opportunities/domain/opportunities-sections.js";
export {
  buildLivingOpportunitiesExperience,
  buildLivingOpportunitiesStatistics,
  validateLivingOpportunitiesContext,
  toLivingOpportunitiesView,
  toLivingOpportunitiesStatisticsView,
  findOpportunitiesSection,
  type LivingOpportunitiesExperience,
  type LivingOpportunitiesStatistics,
} from "./opportunities/domain/opportunities-experience.js";
export {
  collectLivingOpportunitiesEngineSnapshot,
  type LivingOpportunitiesEngineDeps,
} from "./opportunities/application/opportunities-collector.js";
export {
  LivingOpportunitiesService,
  createLivingOpportunitiesModule,
  createLivingOpportunitiesService,
  type LivingOpportunitiesModule,
} from "./opportunities/application/living-opportunities-service.js";
export {
  LivingOpportunitiesRepository,
  createLivingOpportunitiesRepository,
  livingOpportunitiesRepository,
} from "./opportunities/infrastructure/living-opportunities-repository.js";
export {
  LIVING_PARTNER_ECOSYSTEM_SCHEMA_VERSION,
  LIVING_PARTNER_ECOSYSTEM_JSON_SCHEMA,
  LIVING_PARTNER_ECOSYSTEM_ROUTES,
  LIVING_PARTNER_ECOSYSTEM_SECTIONS,
  LIVING_PARTNER_ECOSYSTEM_SECTION_LABELS,
} from "./partner-ecosystem/domain/partner-schema.js";
export {
  buildLivingPartnerEcosystemContext,
  hashPartnerSeed,
  type LivingPartnerEcosystemContext,
} from "./partner-ecosystem/domain/partner-context.js";
export {
  buildAllPartnerEcosystemSections,
  toPartnerSectionView,
  toPartnerSectionsView,
  type LivingPartnerEcosystemSection,
  type PartnerEngineSnapshot,
  type ConnectedPartner,
  type PermissionHistoryEntry,
} from "./partner-ecosystem/domain/partner-sections.js";
export {
  buildLivingPartnerEcosystemExperience,
  buildLivingPartnerEcosystemStatistics,
  validateLivingPartnerEcosystemContext,
  toLivingPartnerEcosystemView,
  toLivingPartnerEcosystemStatisticsView,
  findPartnerSection,
  type LivingPartnerEcosystemExperience,
  type LivingPartnerEcosystemStatistics,
} from "./partner-ecosystem/domain/partner-experience.js";
export {
  collectLivingPartnerEcosystemEngineSnapshot,
  type LivingPartnerEcosystemEngineDeps,
} from "./partner-ecosystem/application/partner-collector.js";
export {
  LivingPartnerEcosystemService,
  createLivingPartnerEcosystemModule,
  createLivingPartnerEcosystemService,
  type LivingPartnerEcosystemModule,
} from "./partner-ecosystem/application/living-partner-ecosystem-service.js";
export {
  LivingPartnerEcosystemRepository,
  createLivingPartnerEcosystemRepository,
  livingPartnerEcosystemRepository,
} from "./partner-ecosystem/infrastructure/living-partner-ecosystem-repository.js";
export {
  LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COMMUNITY_JSON_SCHEMA,
  LIVING_PROFESSIONAL_COMMUNITY_ROUTES,
  LIVING_PROFESSIONAL_COMMUNITY_SECTIONS,
  LIVING_PROFESSIONAL_COMMUNITY_SECTION_LABELS,
  HELPFUL_CONTRIBUTION_TYPES,
} from "./professional-community/domain/community-schema.js";
export {
  buildLivingProfessionalCommunityContext,
  hashCommunitySeed,
  type LivingProfessionalCommunityContext,
} from "./professional-community/domain/community-context.js";
export {
  buildAllCommunitySections,
  toCommunitySectionView,
  toCommunitySectionsView,
  type LivingProfessionalCommunitySection,
  type CommunityEngineSnapshot,
} from "./professional-community/domain/community-sections.js";
export {
  buildLivingProfessionalCommunityExperience,
  buildLivingProfessionalCommunityStatistics,
  validateLivingProfessionalCommunityContext,
  toLivingProfessionalCommunityView,
  toLivingProfessionalCommunityStatisticsView,
  findCommunitySection,
  type LivingProfessionalCommunityExperience,
  type LivingProfessionalCommunityStatistics,
} from "./professional-community/domain/community-experience.js";
export {
  collectLivingProfessionalCommunityEngineSnapshot,
  type LivingProfessionalCommunityEngineDeps,
} from "./professional-community/application/community-collector.js";
export {
  LivingProfessionalCommunityService,
  createLivingProfessionalCommunityModule,
  createLivingProfessionalCommunityService,
  type LivingProfessionalCommunityModule,
} from "./professional-community/application/living-professional-community-service.js";
export {
  LivingProfessionalCommunityRepository,
  createLivingProfessionalCommunityRepository,
  livingProfessionalCommunityRepository,
} from "./professional-community/infrastructure/living-professional-community-repository.js";
export {
  LIVING_PROFESSIONAL_COACH_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_COACH_JSON_SCHEMA,
  LIVING_PROFESSIONAL_COACH_ROUTES,
  LIVING_PROFESSIONAL_COACH_SECTIONS,
  LIVING_PROFESSIONAL_COACH_SECTION_LABELS,
} from "./professional-coach/domain/coach-schema.js";
export {
  buildLivingProfessionalCoachContext,
  hashCoachSeed,
  type LivingProfessionalCoachContext,
} from "./professional-coach/domain/coach-context.js";
export {
  buildAllCoachSections,
  buildDefaultCoachMemory,
  recordSuccessfulRecommendation,
  toCoachSectionView,
  toCoachSectionsView,
  type LivingProfessionalCoachSection,
  type CoachEngineSnapshot,
  type CoachMemoryProfile,
} from "./professional-coach/domain/coach-sections.js";
export {
  buildLivingProfessionalCoachExperience,
  buildLivingProfessionalCoachStatistics,
  validateLivingProfessionalCoachContext,
  toLivingProfessionalCoachView,
  toLivingProfessionalCoachStatisticsView,
  findCoachSection,
  type LivingProfessionalCoachExperience,
  type LivingProfessionalCoachStatistics,
} from "./professional-coach/domain/coach-experience.js";
export {
  collectLivingProfessionalCoachEngineSnapshot,
  type LivingProfessionalCoachEngineDeps,
} from "./professional-coach/application/coach-collector.js";
export {
  LivingProfessionalCoachService,
  createLivingProfessionalCoachModule,
  createLivingProfessionalCoachService,
  type LivingProfessionalCoachModule,
} from "./professional-coach/application/living-professional-coach-service.js";
export {
  LivingProfessionalCoachRepository,
  createLivingProfessionalCoachRepository,
  livingProfessionalCoachRepository,
} from "./professional-coach/infrastructure/living-professional-coach-repository.js";
export {
  LIVING_ACTION_PLANNER_SCHEMA_VERSION,
  LIVING_ACTION_PLANNER_JSON_SCHEMA,
  LIVING_ACTION_PLANNER_ROUTES,
  LIVING_ACTION_PLANNER_SECTIONS,
  LIVING_ACTION_PLANNER_SECTION_LABELS,
} from "./action-planner/domain/planner-schema.js";
export {
  buildLivingActionPlannerContext,
  hashPlannerSeed,
  type LivingActionPlannerContext,
} from "./action-planner/domain/planner-context.js";
export {
  buildAllPlannerSections,
  buildDefaultExecutionState,
  recordActionCompleted,
  recordActionPostponed,
  toPlannerSectionView,
  toPlannerSectionsView,
  type LivingActionPlannerSection,
  type PlannerEngineSnapshot,
  type PlannerExecutionState,
} from "./action-planner/domain/planner-sections.js";
export {
  buildLivingActionPlannerExperience,
  buildLivingActionPlannerStatistics,
  validateLivingActionPlannerContext,
  toLivingActionPlannerView,
  toLivingActionPlannerStatisticsView,
  findPlannerSection,
  type LivingActionPlannerExperience,
  type LivingActionPlannerStatistics,
} from "./action-planner/domain/planner-experience.js";
export {
  collectLivingActionPlannerEngineSnapshot,
  type LivingActionPlannerEngineDeps,
} from "./action-planner/application/planner-collector.js";
export {
  LivingActionPlannerService,
  createLivingActionPlannerModule,
  createLivingActionPlannerService,
  type LivingActionPlannerModule,
} from "./action-planner/application/living-action-planner-service.js";
export {
  LivingActionPlannerRepository,
  createLivingActionPlannerRepository,
  livingActionPlannerRepository,
} from "./action-planner/infrastructure/living-action-planner-repository.js";
export {
  LIVING_PROFESSIONAL_IMPACT_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IMPACT_JSON_SCHEMA,
  LIVING_PROFESSIONAL_IMPACT_ROUTES,
  LIVING_PROFESSIONAL_IMPACT_SECTIONS,
  LIVING_PROFESSIONAL_IMPACT_SECTION_LABELS,
} from "./professional-impact/domain/impact-schema.js";
export {
  buildLivingProfessionalImpactContext,
  hashImpactSeed,
  type LivingProfessionalImpactContext,
} from "./professional-impact/domain/impact-context.js";
export {
  buildAllImpactSections,
  toImpactSectionView,
  toImpactSectionsView,
  type LivingProfessionalImpactSection,
  type ImpactEngineSnapshot,
} from "./professional-impact/domain/impact-sections.js";
export {
  buildLivingProfessionalImpactExperience,
  buildLivingProfessionalImpactStatistics,
  validateLivingProfessionalImpactContext,
  toLivingProfessionalImpactView,
  toLivingProfessionalImpactStatisticsView,
  findImpactSection,
  type LivingProfessionalImpactExperience,
  type LivingProfessionalImpactStatistics,
} from "./professional-impact/domain/impact-experience.js";
export {
  collectLivingProfessionalImpactEngineSnapshot,
  type LivingProfessionalImpactEngineDeps,
} from "./professional-impact/application/impact-collector.js";
export {
  LivingProfessionalImpactService,
  createLivingProfessionalImpactModule,
  createLivingProfessionalImpactService,
  type LivingProfessionalImpactModule,
} from "./professional-impact/application/living-professional-impact-service.js";
export {
  LivingProfessionalImpactRepository,
  createLivingProfessionalImpactRepository,
  livingProfessionalImpactRepository,
} from "./professional-impact/infrastructure/living-professional-impact-repository.js";
export {
  LIVING_PROFESSIONAL_IDENTITY_SCHEMA_VERSION,
  LIVING_PROFESSIONAL_IDENTITY_JSON_SCHEMA,
  LIVING_PROFESSIONAL_IDENTITY_ROUTES,
  LIVING_PROFESSIONAL_IDENTITY_SECTIONS,
  LIVING_PROFESSIONAL_IDENTITY_SECTION_LABELS,
} from "./professional-identity/domain/identity-schema.js";
export {
  buildLivingProfessionalIdentityContext,
  hashIdentitySeed,
  type LivingProfessionalIdentityContext,
} from "./professional-identity/domain/identity-context.js";
export {
  buildAllIdentitySections,
  buildDefaultSharingPermissions,
  updateSharingPermissions,
  toIdentitySectionView,
  toIdentitySectionsView,
  type LivingProfessionalIdentitySection,
  type IdentityEngineSnapshot,
  type IdentitySharingPermissions,
} from "./professional-identity/domain/identity-sections.js";
export {
  buildLivingProfessionalIdentityExperience,
  buildLivingProfessionalIdentityStatistics,
  validateLivingProfessionalIdentityContext,
  toLivingProfessionalIdentityView,
  toLivingProfessionalIdentityStatisticsView,
  findIdentitySection,
  type LivingProfessionalIdentityExperience,
  type LivingProfessionalIdentityStatistics,
} from "./professional-identity/domain/identity-experience.js";
export {
  collectLivingProfessionalIdentityEngineSnapshot,
  type LivingProfessionalIdentityEngineDeps,
} from "./professional-identity/application/identity-collector.js";
export {
  LivingProfessionalIdentityService,
  createLivingProfessionalIdentityModule,
  createLivingProfessionalIdentityService,
  type LivingProfessionalIdentityModule,
} from "./professional-identity/application/living-professional-identity-service.js";
export {
  LivingProfessionalIdentityRepository,
  createLivingProfessionalIdentityRepository,
  livingProfessionalIdentityRepository,
} from "./professional-identity/infrastructure/living-professional-identity-repository.js";
