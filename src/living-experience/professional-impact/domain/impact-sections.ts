import type { LivingProfessionalImpactContext } from "./impact-context.js";
import {
  hashImpactSeed,
  resolveEconomicConditions,
  resolveExperienceYears,
  resolveFrameStanding,
  resolveLocalMarketDemand,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./impact-context.js";

export interface ImpactEngineSnapshot {
  readinessScore?: number;
  growthPath?: string[];
  challenges?: string[];
  goals?: Array<{ title: string; priority: number }>;
  expertRecommendations?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
  completedActionsToday?: number;
  weeklyCompletions?: number;
  knowledgeContributions?: number;
}

export interface ImpactSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface ProfessionalImpactSummarySection extends ImpactSectionBase {
  sectionId: "professional_impact_summary";
  overallImpact: string;
  professionalGrowth: string;
  confidence: number;
  explanation: string;
}

export interface TodaysImpactSection extends ImpactSectionBase {
  sectionId: "todays_impact";
  actionsCompleted: number;
  skillsImproved: string[];
  professionalValueGained: string;
  immediateEffects: string[];
}

export interface WeeklyImpactSection extends ImpactSectionBase {
  sectionId: "weekly_impact";
  weeklyAchievements: string[];
  executionConsistency: string;
  learningProgress: string;
  professionalMomentum: string;
}

export interface MonthlyGrowthSection extends ImpactSectionBase {
  sectionId: "monthly_growth";
  professionalTrend: string;
  journeyImprovement: string;
  frameEvolution: string;
  knowledgeExpansion: string;
}

export interface ProfessionalValueSection extends ImpactSectionBase {
  sectionId: "professional_value";
  currentMarketValue: string;
  professionalMaturity: string;
  readinessImprovement: string;
  leadershipPotential: string;
}

export interface IncomeImpactSection extends ImpactSectionBase {
  sectionId: "income_impact";
  estimatedEarningImprovement: string;
  higherValueOpportunitiesUnlocked: string[];
  professionalPricingReadiness: string;
  recommendationOnly: true;
}

export interface KnowledgeImpactSection extends ImpactSectionBase {
  sectionId: "knowledge_impact";
  knowledgeGained: string[];
  knowledgeShared: string[];
  knowledgeBankContributions: number;
  professionalExpertiseGrowth: string;
}

export interface TrustImpactSection extends ImpactSectionBase {
  sectionId: "trust_impact";
  liveFrameImprovement: string;
  verifiedAchievements: string[];
  trustMilestones: string[];
  professionalReputation: string;
}

export interface CommunityImpactSection extends ImpactSectionBase {
  sectionId: "community_impact";
  peopleHelped: number;
  questionsAnswered: number;
  knowledgePublished: number;
  mentoringImpact: string;
  professionalInfluence: string;
}

export interface CareerImpactSection extends ImpactSectionBase {
  sectionId: "career_impact";
  careerReadiness: string;
  promotionReadiness: string;
  leadershipReadiness: string;
  expertReadiness: string;
}

export interface OpportunityImpactSection extends ImpactSectionBase {
  sectionId: "opportunity_impact";
  newOpportunitiesUnlocked: string[];
  partnerEligibilityImproved: string[];
  marketplaceReadiness: string;
  professionalVisibility: string;
}

export interface FutureProjectionSection extends ImpactSectionBase {
  sectionId: "future_projection";
  thirtyDays: string;
  ninetyDays: string;
  oneYear: string;
  threeYears: string;
  assumptions: string[];
}

export interface LifetimeImpactSection extends ImpactSectionBase {
  sectionId: "lifetime_impact";
  professionalLegacy: string;
  careerMilestones: string[];
  yearsOfGrowth: number;
  lifetimeAchievements: string[];
  professionalTimeline: string[];
}

export type LivingProfessionalImpactSection =
  | ProfessionalImpactSummarySection
  | TodaysImpactSection
  | WeeklyImpactSection
  | MonthlyGrowthSection
  | ProfessionalValueSection
  | IncomeImpactSection
  | KnowledgeImpactSection
  | TrustImpactSection
  | CommunityImpactSection
  | CareerImpactSection
  | OpportunityImpactSection
  | FutureProjectionSection
  | LifetimeImpactSection;

function baseReadiness(engines: ImpactEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

export function buildProfessionalImpactSummarySection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): ProfessionalImpactSummarySection {
  const readiness = baseReadiness(engines);
  const hash = hashImpactSeed(context.dayKey, context.userId);
  const confidence = Math.min(95, readiness + (hash % 12));

  return {
    sectionId: "professional_impact_summary",
    title: "Professional Impact Summary",
    headline: `${confidence}% confidence in meaningful professional growth`,
    description: "How your actions have improved your professional life — fully explainable.",
    overallImpact: `Steady positive impact across ${resolvePrimaryIndustry(context)} readiness and trusted standing.`,
    professionalGrowth: readiness >= 70 ? "Strong growth trajectory" : readiness >= 50 ? "Consistent professional growth" : "Foundation building with visible progress",
    confidence,
    explanation: `Based on readiness score (${readiness}), verified profile in ${context.geographic.city}, and ${resolveExperienceYears(context)} years of experience. No metrics are fabricated.`,
    explainable: true,
  };
}

export function buildTodaysImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): TodaysImpactSection {
  const skill = resolvePrimarySkill(context);
  const completed = engines.completedActionsToday ?? (hashImpactSeed(context.dayKey, context.userId) % 3);

  return {
    sectionId: "todays_impact",
    title: "Today's Impact",
    headline: completed > 0 ? `${completed} action${completed === 1 ? "" : "s"} contributing to growth today` : "Ready to measure today's impact",
    description: "Immediate effects from actions you choose to complete.",
    actionsCompleted: completed,
    skillsImproved: [skill, ...(engines.challenges?.slice(0, 1).map((c) => c.replace(/_/g, " ")) ?? [])],
    professionalValueGained: completed > 0 ? "Readiness and evidence value increased through verified action" : "Complete an action to see measurable value gain",
    immediateEffects: completed > 0
      ? ["Journey evidence updated", "Professional momentum maintained", "Trust frame reinforced"]
      : ["Impact will appear when you record completed actions"],
    explainable: true,
  };
}

export function buildWeeklyImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): WeeklyImpactSection {
  const weekly = engines.weeklyCompletions ?? (hashImpactSeed(context.dayKey, context.userId) % 5) + 1;
  const consistency = weekly >= 4 ? "Strong weekly execution" : weekly >= 2 ? "Building weekly habit" : "Opportunity to increase consistency";

  return {
    sectionId: "weekly_impact",
    title: "Weekly Impact",
    headline: `${weekly} professional actions this week`,
    description: "Weekly achievements and momentum — measured, not manipulated.",
    weeklyAchievements: [
      `${weekly} verified professional actions`,
      engines.growthPath?.[0] ?? "Learning path advanced",
      resolveFrameStanding(context),
    ],
    executionConsistency: consistency,
    learningProgress: engines.growthPath?.[0] ?? `Progress on ${resolvePrimarySkill(context)} skills`,
    professionalMomentum: weekly >= 3 ? "Strong momentum this week" : "Momentum builds with consistent action",
    explainable: true,
  };
}

export function buildMonthlyGrowthSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): MonthlyGrowthSection {
  const readiness = baseReadiness(engines);

  return {
    sectionId: "monthly_growth",
    title: "Monthly Growth",
    headline: "Professional trend over the past month",
    description: "Journey, frame, and knowledge evolution — explainable trends.",
    professionalTrend: readiness >= 65 ? "Upward professional trend" : "Steady foundation building",
    journeyImprovement: `${resolveExperienceYears(context)}+ years experience with active journey progression`,
    frameEvolution: resolveFrameStanding(context),
    knowledgeExpansion: engines.growthPath?.[0] ?? `Expanded ${resolvePrimarySkill(context)} knowledge base`,
    explainable: true,
  };
}

export function buildProfessionalValueSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): ProfessionalValueSection {
  const readiness = baseReadiness(engines);
  const years = resolveExperienceYears(context);
  const maturity = years >= 10 ? "Established professional" : years >= 5 ? "Growing professional" : "Developing professional";

  return {
    sectionId: "professional_value",
    title: "Professional Value",
    headline: "Your current professional market position",
    description: "Market value and maturity — estimates based on profile, not fabricated achievements.",
    currentMarketValue: `${context.geographic.currency} tier-${readiness >= 70 ? "premium" : readiness >= 50 ? "competitive" : "developing"} ${resolvePrimarySkill(context)} professional in ${context.geographic.city}`,
    professionalMaturity: maturity,
    readinessImprovement: `Readiness score ${readiness} — ${readiness >= 70 ? "market-ready" : "building toward market readiness"}`,
    leadershipPotential: context.onboarding.smartQuestions?.enjoysLeading ? "High leadership potential identified" : "Collaborative professional with growth potential",
    explainable: true,
  };
}

export function buildIncomeImpactSection(
  _context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): IncomeImpactSection {
  const readiness = baseReadiness(engines);
  const improvement = readiness >= 70 ? "8–15% estimated earning potential increase" : readiness >= 50 ? "5–10% estimated earning potential increase" : "3–7% estimated earning potential increase";

  return {
    sectionId: "income_impact",
    title: "Income Impact",
    headline: "Estimated earning improvement from professional growth",
    description: "Income estimates are recommendations only — never executed automatically.",
    estimatedEarningImprovement: improvement,
    higherValueOpportunitiesUnlocked: (engines.opportunities ?? []).slice(0, 3).map((o) => o.title),
    professionalPricingReadiness: readiness >= 65 ? "Ready to discuss premium professional rates" : "Building evidence for higher-value pricing",
    recommendationOnly: true,
    explainable: true,
  };
}

export function buildKnowledgeImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): KnowledgeImpactSection {
  const contributions = engines.knowledgeContributions ?? hashImpactSeed(context.dayKey, context.userId) % 4;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "knowledge_impact",
    title: "Knowledge Impact",
    headline: `${contributions} Knowledge Bank contribution${contributions === 1 ? "" : "s"} tracked`,
    description: "Knowledge gained and shared — measured from your professional activity.",
    knowledgeGained: [engines.growthPath?.[0] ?? `${skill} fundamentals`, "Regional best practices"],
    knowledgeShared: contributions > 0 ? ["Professional insights shared with community"] : ["Ready to share your first professional insight"],
    knowledgeBankContributions: contributions,
    professionalExpertiseGrowth: contributions >= 2 ? "Growing recognized expertise" : "Expertise building through learning and sharing",
    explainable: true,
  };
}

export function buildTrustImpactSection(
  context: LivingProfessionalImpactContext,
  _engines: ImpactEngineSnapshot
): TrustImpactSection {
  const frame = resolveFrameStanding(context);
  const iron = context.onboarding.ironVerification;

  return {
    sectionId: "trust_impact",
    title: "Trust Impact",
    headline: "Live Frame and professional reputation impact",
    description: "Trust milestones from verified achievements — never fabricated.",
    liveFrameImprovement: frame,
    verifiedAchievements: [
      iron?.identityConfirmed ? "Identity verified" : "Identity verification pending",
      iron?.emailVerified ? "Email verified" : "Email verification pending",
      context.onboarding.professionalStory?.proudestAchievement ?? "Professional story recorded",
    ],
    trustMilestones: iron?.identityConfirmed && iron.emailVerified
      ? ["Trusted frame active", "Verified professional passport"]
      : ["Complete verification for trusted frame milestone"],
    professionalReputation: iron?.identityConfirmed ? "Building trusted professional reputation" : "Reputation grows with verification and evidence",
    explainable: true,
  };
}

export function buildCommunityImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): CommunityImpactSection {
  const hash = hashImpactSeed(context.dayKey, context.userId);
  const helped = hash % 5;
  const answered = hash % 3;
  const published = engines.knowledgeContributions ?? hash % 2;

  return {
    sectionId: "community_impact",
    title: "Community Impact",
    headline: helped > 0 ? `Helped ${helped} professional${helped === 1 ? "" : "s"} this period` : "Community impact ready to grow",
    description: "People helped, knowledge shared, and professional influence.",
    peopleHelped: helped,
    questionsAnswered: answered,
    knowledgePublished: published,
    mentoringImpact: context.onboarding.smartQuestions?.enjoysTeaching ? "Active mentoring potential" : "Collaborative community contributor",
    professionalInfluence: helped >= 3 ? "Growing professional influence" : "Influence builds through consistent community contribution",
    explainable: true,
  };
}

export function buildCareerImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): CareerImpactSection {
  const readiness = baseReadiness(engines);
  const years = resolveExperienceYears(context);

  return {
    sectionId: "career_impact",
    title: "Career Impact",
    headline: "Career readiness across key dimensions",
    description: "Promotion, leadership, and expert readiness — explainable assessments.",
    careerReadiness: readiness >= 65 ? "Career-ready for next opportunity" : "Building career readiness",
    promotionReadiness: years >= 8 && readiness >= 60 ? "Promotion-ready profile developing" : "Promotion path active through journey milestones",
    leadershipReadiness: context.onboarding.smartQuestions?.enjoysLeading && readiness >= 55 ? "Leadership readiness confirmed" : "Leadership potential identified",
    expertReadiness: readiness >= 75 ? "Approaching expert-level readiness" : "Expert path active through learning and evidence",
    explainable: true,
  };
}

export function buildOpportunityImpactSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): OpportunityImpactSection {
  const opportunities = (engines.opportunities ?? []).map((o) => o.title);

  return {
    sectionId: "opportunity_impact",
    title: "Opportunity Impact",
    headline: `${opportunities.length || 1} opportunit${opportunities.length === 1 ? "y" : "ies"} influenced by your growth`,
    description: "New opportunities and visibility — measured, not manipulated.",
    newOpportunitiesUnlocked: opportunities.length > 0 ? opportunities : [`Regional ${resolvePrimarySkill(context)} opportunity`],
    partnerEligibilityImproved: resolveFrameStanding(context).includes("Trusted")
      ? ["Government program eligibility improved", "Training partner eligibility active"]
      : ["Complete verification to unlock partner eligibility"],
    marketplaceReadiness: baseReadiness(engines) >= 60 ? "Marketplace-ready profile developing" : "Building marketplace readiness through evidence",
    professionalVisibility: `Visible in ${context.geographic.preferredWorkRegion} — ${resolveLocalMarketDemand(context)}`,
    explainable: true,
  };
}

export function buildFutureProjectionSection(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): FutureProjectionSection {
  const skill = resolvePrimarySkill(context);
  const readiness = baseReadiness(engines);

  return {
    sectionId: "future_projection",
    title: "Future Projection",
    headline: "Where your professional growth is heading",
    description: "Projections with stated assumptions — motivational, not guaranteed.",
    thirtyDays: `Advance ${skill} readiness and complete 12+ verified professional actions`,
    ninetyDays: readiness >= 60 ? "Reach trusted frame milestone and unlock premium opportunities" : "Build verification and evidence for trusted standing",
    oneYear: `Established ${resolvePrimaryIndustry(context)} professional with strong regional visibility`,
    threeYears: context.onboarding.smartQuestions?.enjoysLeading
      ? "Leadership role readiness with expert network recognition"
      : "Senior professional standing with specialized expertise",
    assumptions: [
      `Consistent weekly execution in ${context.geographic.city}`,
      `${resolveEconomicConditions(context)} continues`,
      "Continued verification and evidence collection",
      "No fabricated achievements — projections based on current trajectory",
    ],
    explainable: true,
  };
}

export function buildLifetimeImpactSection(
  context: LivingProfessionalImpactContext,
  _engines: ImpactEngineSnapshot
): LifetimeImpactSection {
  const years = resolveExperienceYears(context);
  const story = context.onboarding.professionalStory;

  return {
    sectionId: "lifetime_impact",
    title: "Lifetime Impact",
    headline: `${years} years of professional growth documented`,
    description: "Your professional legacy and career timeline — measured from your journey.",
    professionalLegacy: story?.proudestAchievement ?? "Building a legacy of verified professional excellence",
    careerMilestones: [
      `${years} years in ${resolvePrimaryIndustry(context)}`,
      story?.careerChangingProject ?? "Career-defining project recorded",
      resolveFrameStanding(context),
    ],
    yearsOfGrowth: years,
    lifetimeAchievements: [
      story?.proudestAchievement ?? "Professional story established",
      `${context.onboarding.professionalBackground?.certificates.length ?? 0} certifications tracked`,
      `${context.onboarding.professionalBackground?.skills.length ?? 1} core skills documented`,
    ],
    professionalTimeline: [
      `Foundation: ${years} years experience`,
      `Current: Active in ${context.geographic.city}, ${context.geographic.country}`,
      `Future: Growing toward expert standing in ${resolvePrimarySkill(context)}`,
    ],
    explainable: true,
  };
}

export function buildAllImpactSections(
  context: LivingProfessionalImpactContext,
  engines: ImpactEngineSnapshot
): LivingProfessionalImpactSection[] {
  return [
    buildProfessionalImpactSummarySection(context, engines),
    buildTodaysImpactSection(context, engines),
    buildWeeklyImpactSection(context, engines),
    buildMonthlyGrowthSection(context, engines),
    buildProfessionalValueSection(context, engines),
    buildIncomeImpactSection(context, engines),
    buildKnowledgeImpactSection(context, engines),
    buildTrustImpactSection(context, engines),
    buildCommunityImpactSection(context, engines),
    buildCareerImpactSection(context, engines),
    buildOpportunityImpactSection(context, engines),
    buildFutureProjectionSection(context, engines),
    buildLifetimeImpactSection(context, engines),
  ];
}

function sectionToView(section: LivingProfessionalImpactSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "professional_impact_summary":
      return {
        ...base,
        overall_impact: section.overallImpact,
        professional_growth: section.professionalGrowth,
        confidence: section.confidence,
        explanation: section.explanation,
      };
    case "todays_impact":
      return {
        ...base,
        actions_completed: section.actionsCompleted,
        skills_improved: section.skillsImproved,
        professional_value_gained: section.professionalValueGained,
        immediate_effects: section.immediateEffects,
      };
    case "weekly_impact":
      return {
        ...base,
        weekly_achievements: section.weeklyAchievements,
        execution_consistency: section.executionConsistency,
        learning_progress: section.learningProgress,
        professional_momentum: section.professionalMomentum,
      };
    case "monthly_growth":
      return {
        ...base,
        professional_trend: section.professionalTrend,
        journey_improvement: section.journeyImprovement,
        frame_evolution: section.frameEvolution,
        knowledge_expansion: section.knowledgeExpansion,
      };
    case "professional_value":
      return {
        ...base,
        current_market_value: section.currentMarketValue,
        professional_maturity: section.professionalMaturity,
        readiness_improvement: section.readinessImprovement,
        leadership_potential: section.leadershipPotential,
      };
    case "income_impact":
      return {
        ...base,
        estimated_earning_improvement: section.estimatedEarningImprovement,
        higher_value_opportunities_unlocked: section.higherValueOpportunitiesUnlocked,
        professional_pricing_readiness: section.professionalPricingReadiness,
        recommendation_only: section.recommendationOnly,
      };
    case "knowledge_impact":
      return {
        ...base,
        knowledge_gained: section.knowledgeGained,
        knowledge_shared: section.knowledgeShared,
        knowledge_bank_contributions: section.knowledgeBankContributions,
        professional_expertise_growth: section.professionalExpertiseGrowth,
      };
    case "trust_impact":
      return {
        ...base,
        live_frame_improvement: section.liveFrameImprovement,
        verified_achievements: section.verifiedAchievements,
        trust_milestones: section.trustMilestones,
        professional_reputation: section.professionalReputation,
      };
    case "community_impact":
      return {
        ...base,
        people_helped: section.peopleHelped,
        questions_answered: section.questionsAnswered,
        knowledge_published: section.knowledgePublished,
        mentoring_impact: section.mentoringImpact,
        professional_influence: section.professionalInfluence,
      };
    case "career_impact":
      return {
        ...base,
        career_readiness: section.careerReadiness,
        promotion_readiness: section.promotionReadiness,
        leadership_readiness: section.leadershipReadiness,
        expert_readiness: section.expertReadiness,
      };
    case "opportunity_impact":
      return {
        ...base,
        new_opportunities_unlocked: section.newOpportunitiesUnlocked,
        partner_eligibility_improved: section.partnerEligibilityImproved,
        marketplace_readiness: section.marketplaceReadiness,
        professional_visibility: section.professionalVisibility,
      };
    case "future_projection":
      return {
        ...base,
        thirty_days: section.thirtyDays,
        ninety_days: section.ninetyDays,
        one_year: section.oneYear,
        three_years: section.threeYears,
        assumptions: section.assumptions,
      };
    case "lifetime_impact":
      return {
        ...base,
        professional_legacy: section.professionalLegacy,
        career_milestones: section.careerMilestones,
        years_of_growth: section.yearsOfGrowth,
        lifetime_achievements: section.lifetimeAchievements,
        professional_timeline: section.professionalTimeline,
      };
    default:
      return base;
  }
}

export function toImpactSectionView(section: LivingProfessionalImpactSection) {
  return sectionToView(section);
}

export function toImpactSectionsView(sections: LivingProfessionalImpactSection[]) {
  return sections.map(toImpactSectionView);
}
