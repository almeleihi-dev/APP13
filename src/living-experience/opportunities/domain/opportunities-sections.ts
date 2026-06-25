import type { PartnershipOpportunityType, OpportunityStatus } from "./opportunities-schema.js";
import type { LivingOpportunitiesContext } from "./opportunities-context.js";
import {
  hashOpportunitySeed,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveReadinessLevel,
} from "./opportunities-context.js";

export interface OpportunityEngineSnapshot {
  readinessScore?: number;
  todaysBestAction?: { title: string; description: string; routeHint: string };
  tomorrowsBestAction?: { title: string; description: string; routeHint: string };
  goals?: Array<{ goalId: string; title: string; priority: number }>;
  growthPath?: string[];
  expertRecommendations?: string[];
  marketplaceListings?: Array<{ listingId: string; title: string; matchScore: number; income?: number }>;
  alternativePaths?: string[];
}

export interface OpportunityItem {
  opportunityId: string;
  title: string;
  category: string;
  summary: string;
  matchScore: number;
  explainable: true;
}

export interface SavedOpportunity {
  opportunityId: string;
  title: string;
  category: string;
  savedAt: string;
  reminderEnabled: boolean;
}

export interface OpportunityHistoryEntry {
  opportunityId: string;
  title: string;
  status: OpportunityStatus;
  recordedAt: string;
  outcome?: string;
}

export interface OpportunitiesSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface TodaysBestOpportunitySection extends OpportunitiesSectionBase {
  sectionId: "todays_best_opportunity";
  opportunity: OpportunityItem;
  why: string;
  expectedOutcome: string;
  estimatedEffortMinutes: number;
}

export interface RecommendedOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "recommended_opportunities";
  opportunities: Array<OpportunityItem & { basedOn: string[] }>;
}

export interface NearbyOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "nearby_opportunities";
  city: string;
  region: string;
  opportunities: Array<OpportunityItem & { distanceKm: number; travelMinutes: number; localDemand: string }>;
}

export interface MarketplaceOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "marketplace_opportunities";
  opportunities: Array<
    OpportunityItem & { matchingScore: number; expectedIncome: string; requiredReadiness: number }
  >;
}

export interface GovernmentProgramsSection extends OpportunitiesSectionBase {
  sectionId: "government_programs";
  programs: Array<{
    programId: string;
    title: string;
    category: string;
    summary: string;
    eligibility: string;
    region: string;
  }>;
}

export interface TrainingOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "training_opportunities";
  programs: Array<{
    programId: string;
    title: string;
    type: "free" | "sponsored" | "certification" | "learning_path";
    partner: string;
    summary: string;
  }>;
}

export interface FundingOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "funding_opportunities";
  recommendations: Array<{
    fundingId: string;
    title: string;
    partnerType: string;
    summary: string;
    recommendationOnly: true;
  }>;
}

export interface TeamOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "team_opportunities";
  opportunities: Array<{
    teamId: string;
    title: string;
    role: string;
    type: "team_member" | "leader" | "mentor" | "expert";
    summary: string;
  }>;
}

export interface ExpertOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "expert_opportunities";
  opportunities: Array<{
    expertId: string;
    title: string;
    type: "assistant" | "mentorship" | "knowledge_sharing" | "consulting";
    summary: string;
  }>;
}

export interface GrowthOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "growth_opportunities";
  opportunities: Array<{
    growthId: string;
    title: string;
    target: "live_frame" | "passport" | "actions" | "knowledge" | "income";
    summary: string;
    impact: string;
  }>;
}

export interface OpportunityHistorySection extends OpportunitiesSectionBase {
  sectionId: "opportunity_history";
  entries: OpportunityHistoryEntry[];
}

export interface SavedOpportunitiesSection extends OpportunitiesSectionBase {
  sectionId: "saved_opportunities";
  saved: SavedOpportunity[];
  favoritesCount: number;
}

export interface TomorrowsOpportunitySection extends OpportunitiesSectionBase {
  sectionId: "tomorrows_opportunity";
  prediction: OpportunityItem;
  why: string;
  expectedImpact: string;
}

export type LivingOpportunitiesSection =
  | TodaysBestOpportunitySection
  | RecommendedOpportunitiesSection
  | NearbyOpportunitiesSection
  | MarketplaceOpportunitiesSection
  | GovernmentProgramsSection
  | TrainingOpportunitiesSection
  | FundingOpportunitiesSection
  | TeamOpportunitiesSection
  | ExpertOpportunitiesSection
  | GrowthOpportunitiesSection
  | OpportunityHistorySection
  | SavedOpportunitiesSection
  | TomorrowsOpportunitySection;

export interface PartnershipOpportunityRecommendation {
  type: PartnershipOpportunityType;
  title: string;
  description: string;
  region: string;
}

function buildBaseOpportunity(
  _context: LivingOpportunitiesContext,
  id: string,
  title: string,
  category: string,
  summary: string,
  matchScore: number
): OpportunityItem {
  return {
    opportunityId: id,
    title,
    category,
    summary,
    matchScore,
    explainable: true,
  };
}

export function buildTodaysBestOpportunitySection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): TodaysBestOpportunitySection {
  const hash = hashOpportunitySeed(context.dayKey, context.userId);
  const skill = resolvePrimarySkill(context);
  const action = engines.todaysBestAction?.title ?? `Lead a ${skill} project in ${context.geographic.city}`;
  const why =
    engines.todaysBestAction?.description ??
    `Best match for your passport, journey, and ${context.geographic.preferredWorkRegion} demand today.`;

  const opportunity = buildBaseOpportunity(
    context,
    `opp://best/${context.dayKey}`,
    action,
    "best_today",
    why,
    95 + (hash % 5)
  );

  return {
    sectionId: "todays_best_opportunity",
    title: "Today's Best Opportunity",
    headline: action,
    description: "Exactly one highest-impact opportunity for today.",
    opportunity,
    why,
    expectedOutcome: "Strengthens your professional standing and opens your next milestone.",
    estimatedEffortMinutes: 60 + (hash % 3) * 30,
    explainable: true,
  };
}

export function buildRecommendedOpportunitiesSection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): RecommendedOpportunitiesSection {
  const skill = resolvePrimarySkill(context);
  const industry = resolvePrimaryIndustry(context);
  const hash = hashOpportunitySeed(context.dayKey, context.userId);

  const baseOn = ["passport", "live_frame", "journey", "knowledge", "skills", "goals"];
  const opportunities = [
    {
      ...buildBaseOpportunity(
        context,
        `opp://rec/1/${context.dayKey}`,
        `${skill} leadership role`,
        "recommended",
        `Personalized for your ${industry} background and current goals.`,
        88 - (hash % 5)
      ),
      basedOn: baseOn,
    },
    {
      ...buildBaseOpportunity(
        context,
        `opp://rec/2/${context.dayKey}`,
        `Regional ${skill} contract`,
        "recommended",
        `Strong match for ${context.geographic.preferredWorkRegion} market demand.`,
        82 - (hash % 4)
      ),
      basedOn: ["passport", "journey", "skills", "goals"],
    },
    {
      ...buildBaseOpportunity(
        context,
        `opp://rec/3/${context.dayKey}`,
        engines.goals?.[0]?.title ?? "Professional certification pathway",
        "recommended",
        "Aligned with your active professional goals.",
        78 - (hash % 3)
      ),
      basedOn: ["goals", "knowledge", "live_frame"],
    },
  ];

  return {
    sectionId: "recommended_opportunities",
    title: "Recommended Opportunities",
    headline: `${opportunities.length} personalized opportunities`,
    description: "Ranked by passport, frame, journey, knowledge, skills, and goals.",
    opportunities,
    explainable: true,
  };
}

export function buildNearbyOpportunitiesSection(context: LivingOpportunitiesContext): NearbyOpportunitiesSection {
  const hash = hashOpportunitySeed(context.dayKey, context.userId);
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "nearby_opportunities",
    title: "Nearby Opportunities",
    headline: `Opportunities near ${context.geographic.city}`,
    description: "Local demand matched to your professional profile.",
    city: context.geographic.city,
    region: context.geographic.preferredWorkRegion,
    opportunities: [
      {
        ...buildBaseOpportunity(
          context,
          `opp://near/1/${context.dayKey}`,
          `${skill} project — ${context.geographic.city}`,
          "nearby",
          `High local demand for ${skill} in your city.`,
          85 + (hash % 5)
        ),
        distanceKm: 5 + (hash % 15),
        travelMinutes: 15 + (hash % 30),
        localDemand: "High",
      },
      {
        ...buildBaseOpportunity(
          context,
          `opp://near/2/${context.dayKey}`,
          `Regional ${context.geographic.preferredWorkRegion} assignment`,
          "nearby",
          "Strong regional demand with manageable travel.",
          80 + (hash % 4)
        ),
        distanceKm: 25 + (hash % 40),
        travelMinutes: 35 + (hash % 45),
        localDemand: "Moderate to high",
      },
    ],
    explainable: true,
  };
}

export function buildMarketplaceOpportunitiesSection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): MarketplaceOpportunitiesSection {
  const readiness = resolveReadinessLevel(context, engines.readinessScore);
  const skill = resolvePrimarySkill(context);
  const hash = hashOpportunitySeed(context.dayKey, context.userId);
  const currency = context.geographic.currency;

  const listings = engines.marketplaceListings ?? [
    { listingId: "mkt://1", title: `${skill} service listing`, matchScore: 87, income: 2500 + hash * 10 },
    { listingId: "mkt://2", title: `${resolvePrimaryIndustry(context)} project`, matchScore: 79, income: 1800 + hash * 8 },
  ];

  return {
    sectionId: "marketplace_opportunities",
    title: "Marketplace Opportunities",
    headline: `${listings.length} relevant listings`,
    description: "Experience-only marketplace matches — no execution.",
    opportunities: listings.map((l) => ({
      ...buildBaseOpportunity(
        context,
        l.listingId,
        l.title,
        "marketplace",
        `Matching score based on your profile and readiness.`,
        l.matchScore
      ),
      matchingScore: l.matchScore,
      expectedIncome: `${currency} ${(l.income ?? 2000).toLocaleString()}`,
      requiredReadiness: readiness,
    })),
    explainable: true,
  };
}

export function buildGovernmentProgramsSection(context: LivingOpportunitiesContext): GovernmentProgramsSection {
  const programs = context.geographic.governmentPrograms;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "government_programs",
    title: "Government Programs",
    headline: `Regional support in ${context.geographic.country}`,
    description: "Training, employment, grants, and public initiatives.",
    programs: [
      {
        programId: `gov://${programs[0] ?? "workforce"}`,
        title: (programs[0] ?? "workforce_development_grant").replace(/_/g, " "),
        category: "training",
        summary: `Government-supported ${skill} development in ${context.geographic.city}.`,
        eligibility: `Active professionals in ${context.geographic.country} with verified identity.`,
        region: context.geographic.preferredWorkRegion,
      },
      {
        programId: "gov://employment",
        title: "Regional employment initiative",
        category: "employment",
        summary: "Public employment support for skilled professionals.",
        eligibility: `Residents of ${context.geographic.city} meeting professional readiness standards.`,
        region: context.geographic.city,
      },
      {
        programId: "gov://grant",
        title: "Professional development grant",
        category: "grant",
        summary: "Funding for certifications and professional growth.",
        eligibility: "Verified APP13 professionals with active passport.",
        region: context.geographic.country,
      },
    ],
    explainable: true,
  };
}

export function buildTrainingOpportunitiesSection(context: LivingOpportunitiesContext): TrainingOpportunitiesSection {
  const skill = resolvePrimarySkill(context);
  const cert = context.onboarding.professionalBackground?.certificates[0]?.replace(/_/g, " ") ?? skill;

  return {
    sectionId: "training_opportunities",
    title: "Training Opportunities",
    headline: "Programs to grow your skills",
    description: "Free, sponsored, and certification pathways.",
    programs: [
      {
        programId: "train://free",
        title: `Free ${skill} workshop`,
        type: "free",
        partner: "Regional training partner",
        summary: `No-cost introduction to advanced ${skill} in ${context.geographic.city}.`,
      },
      {
        programId: "train://sponsored",
        title: "Sponsored professional program",
        type: "sponsored",
        partner: context.geographic.governmentPrograms[0]?.replace(/_/g, " ") ?? "Government partner",
        summary: "Subsidized training aligned with regional demand.",
      },
      {
        programId: "train://cert",
        title: `${cert} certification pathway`,
        type: "certification",
        partner: "Certification organization",
        summary: "Structured path to professional certification.",
      },
      {
        programId: "train://path",
        title: `${skill} learning path`,
        type: "learning_path",
        partner: "Training partner",
        summary: "Step-by-step skill development for your journey.",
      },
    ],
    explainable: true,
  };
}

export function buildFundingOpportunitiesSection(context: LivingOpportunitiesContext): FundingOpportunitiesSection {
  return {
    sectionId: "funding_opportunities",
    title: "Funding Opportunities",
    headline: "Financial support recommendations",
    description: "Recommendation only — never executes financial products.",
    recommendations: [
      {
        fundingId: "fund://micro",
        title: "Microfinance for professional equipment",
        partnerType: "microfinance",
        summary: `Small business support for ${context.geographic.city} professionals.`,
        recommendationOnly: true,
      },
      {
        fundingId: "fund://business",
        title: "Business growth support",
        partnerType: "business_support",
        summary: "Financing for expanding your professional services.",
        recommendationOnly: true,
      },
      {
        fundingId: "fund://retirement",
        title: "Retirement saving partner",
        partnerType: "retirement_saving",
        summary: "Long-term financial planning for professionals.",
        recommendationOnly: true,
      },
      {
        fundingId: "fund://insurance",
        title: "Professional insurance partner",
        partnerType: "insurance",
        summary: "Coverage recommendations for your industry.",
        recommendationOnly: true,
      },
    ],
    explainable: true,
  };
}

export function buildTeamOpportunitiesSection(context: LivingOpportunitiesContext): TeamOpportunitiesSection {
  const sq = context.onboarding.smartQuestions;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "team_opportunities",
    title: "Team Opportunities",
    headline: "Teams that need you",
    description: "Collaboration, leadership, and mentorship openings.",
    opportunities: [
      {
        teamId: "team://need",
        title: `${skill} team seeking member`,
        role: skill,
        type: "team_member",
        summary: `Active team in ${context.geographic.city} needs your expertise.`,
      },
      ...(sq?.enjoysLeading
        ? [
            {
              teamId: "team://lead",
              title: "Project leadership opportunity",
              role: "Team lead",
              type: "leader" as const,
              summary: "Lead a regional project team.",
            },
          ]
        : []),
      ...(sq?.enjoysTeaching
        ? [
            {
              teamId: "team://mentor",
              title: "Mentor opportunity",
              role: "Mentor",
              type: "mentor" as const,
              summary: "Guide junior professionals in your field.",
            },
          ]
        : []),
      {
        teamId: "team://expert",
        title: "Expert contributor role",
        role: "Expert",
        type: "expert",
        summary: "Share deep expertise on specialized projects.",
      },
    ],
    explainable: true,
  };
}

export function buildExpertOpportunitiesSection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): ExpertOpportunitiesSection {
  const recommendations = engines.expertRecommendations ?? [
    "Regional expert mentorship",
    "Knowledge sharing session",
  ];

  return {
    sectionId: "expert_opportunities",
    title: "Expert Opportunities",
    headline: "Learn from and work with experts",
    description: "Mentorship, consulting, and knowledge sharing.",
    opportunities: [
      {
        expertId: "exp://assistant",
        title: "Expert seeking assistant",
        type: "assistant",
        summary: `Assist a senior ${resolvePrimaryIndustry(context)} professional in ${context.geographic.city}.`,
      },
      {
        expertId: "exp://mentor",
        title: recommendations[0] ?? "Expert mentorship",
        type: "mentorship",
        summary: "One-on-one guidance from an industry expert.",
      },
      {
        expertId: "exp://knowledge",
        title: "Knowledge sharing opportunity",
        type: "knowledge_sharing",
        summary: "Contribute and learn in expert-led sessions.",
      },
      {
        expertId: "exp://consult",
        title: "Consulting collaboration",
        type: "consulting",
        summary: engines.alternativePaths?.[0] ?? "Support expert consulting engagements.",
      },
    ],
    explainable: true,
  };
}

export function buildGrowthOpportunitiesSection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): GrowthOpportunitiesSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "growth_opportunities",
    title: "Growth Opportunities",
    headline: "Advance every dimension of your career",
    description: "Frame, passport, actions, knowledge, and income growth.",
    opportunities: [
      {
        growthId: "grow://frame",
        title: "Increase Live Frame standing",
        target: "live_frame",
        summary: "Complete verified actions to upgrade your frame tier.",
        impact: "Higher trust and visibility",
      },
      {
        growthId: "grow://passport",
        title: "Improve Professional Passport",
        target: "passport",
        summary: "Add credentials and verified milestones.",
        impact: "Stronger professional identity",
      },
      {
        growthId: "grow://actions",
        title: `Unlock ${skill} actions`,
        target: "actions",
        summary: engines.growthPath?.[0] ?? "Complete readiness requirements for new actions.",
        impact: "Expand your service capabilities",
      },
      {
        growthId: "grow://knowledge",
        title: "Knowledge contribution opportunity",
        target: "knowledge",
        summary: "Share expertise and build your knowledge bank.",
        impact: "Regional reputation growth",
      },
      {
        growthId: "grow://income",
        title: "Higher income pathway",
        target: "income",
        summary: `Premium ${skill} opportunities in ${context.geographic.preferredWorkRegion}.`,
        impact: "Increased earning potential",
      },
    ],
    explainable: true,
  };
}

export function buildOpportunityHistorySection(
  history: OpportunityHistoryEntry[]
): OpportunityHistorySection {
  return {
    sectionId: "opportunity_history",
    title: "Opportunity History",
    headline: history.length > 0 ? `${history.length} recorded interactions` : "Your opportunity history starts today",
    description: "Viewed, accepted, ignored, and completed opportunities.",
    entries: history,
    explainable: true,
  };
}

export function buildSavedOpportunitiesSection(saved: SavedOpportunity[]): SavedOpportunitiesSection {
  return {
    sectionId: "saved_opportunities",
    title: "Saved Opportunities",
    headline: saved.length > 0 ? `${saved.length} saved opportunities` : "Save opportunities to revisit later",
    description: "Bookmarks, favorites, and reminder support.",
    saved,
    favoritesCount: saved.filter((s) => s.reminderEnabled).length,
    explainable: true,
  };
}

export function buildTomorrowsOpportunitySection(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot
): TomorrowsOpportunitySection {
  const hash = hashOpportunitySeed(context.dayKey, context.userId);
  const skill = resolvePrimarySkill(context);
  const title = engines.tomorrowsBestAction?.title ?? `Regional ${skill} opportunity in ${context.geographic.city}`;
  const why =
    engines.tomorrowsBestAction?.description ??
    `Predicted best match for tomorrow based on today's progress and ${context.geographic.preferredWorkRegion} demand.`;

  return {
    sectionId: "tomorrows_opportunity",
    title: "Tomorrow's Opportunity",
    headline: title,
    description: "Predicted highest-impact opportunity for tomorrow.",
    prediction: buildBaseOpportunity(
      context,
      `opp://tomorrow/${context.dayKey}`,
      title,
      "tomorrow",
      why,
      90 + (hash % 8)
    ),
    why,
    expectedImpact: "Continues momentum toward your next professional milestone.",
    explainable: true,
  };
}

export function buildPartnershipOpportunityRecommendations(
  context: LivingOpportunitiesContext
): PartnershipOpportunityRecommendation[] {
  const programs = context.geographic.governmentPrograms;
  const industry = resolvePrimaryIndustry(context);

  return [
    {
      type: "training_partner",
      title: "Regional skills training partner",
      description: `Accelerate ${resolvePrimarySkill(context)} development.`,
      region: context.geographic.preferredWorkRegion,
    },
    {
      type: "government_agency",
      title: programs[0]?.replace(/_/g, " ") ?? "Regional workforce agency",
      description: `Government programs in ${context.geographic.country}.`,
      region: context.geographic.country,
    },
    {
      type: "financial_partner",
      title: "Professional growth financing",
      description: "Explore financing for equipment and certifications.",
      region: context.geographic.country,
    },
    {
      type: "insurance_partner",
      title: "Professional liability coverage",
      description: `Insurance recommendations for ${industry} professionals.`,
      region: context.geographic.city,
    },
    {
      type: "professional_association",
      title: `${industry} professional association`,
      description: "Connect with peers and access member opportunities.",
      region: context.geographic.city,
    },
    {
      type: "certification_organization",
      title: "Certification body partnership",
      description: "Structured certification pathways for your field.",
      region: context.geographic.preferredWorkRegion,
    },
  ];
}

export function buildAllOpportunitiesSections(
  context: LivingOpportunitiesContext,
  engines: OpportunityEngineSnapshot,
  history: OpportunityHistoryEntry[] = [],
  saved: SavedOpportunity[] = []
): LivingOpportunitiesSection[] {
  return [
    buildTodaysBestOpportunitySection(context, engines),
    buildRecommendedOpportunitiesSection(context, engines),
    buildNearbyOpportunitiesSection(context),
    buildMarketplaceOpportunitiesSection(context, engines),
    buildGovernmentProgramsSection(context),
    buildTrainingOpportunitiesSection(context),
    buildFundingOpportunitiesSection(context),
    buildTeamOpportunitiesSection(context),
    buildExpertOpportunitiesSection(context, engines),
    buildGrowthOpportunitiesSection(context, engines),
    buildOpportunityHistorySection(history),
    buildSavedOpportunitiesSection(saved),
    buildTomorrowsOpportunitySection(context, engines),
  ];
}

function sectionToView(section: LivingOpportunitiesSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "todays_best_opportunity":
      return {
        ...base,
        opportunity: section.opportunity,
        why: section.why,
        expected_outcome: section.expectedOutcome,
        estimated_effort_minutes: section.estimatedEffortMinutes,
      };
    case "recommended_opportunities":
      return { ...base, opportunities: section.opportunities };
    case "nearby_opportunities":
      return {
        ...base,
        city: section.city,
        region: section.region,
        opportunities: section.opportunities,
      };
    case "marketplace_opportunities":
      return { ...base, opportunities: section.opportunities };
    case "government_programs":
      return { ...base, programs: section.programs };
    case "training_opportunities":
      return { ...base, programs: section.programs };
    case "funding_opportunities":
      return { ...base, recommendations: section.recommendations };
    case "team_opportunities":
      return { ...base, opportunities: section.opportunities };
    case "expert_opportunities":
      return { ...base, opportunities: section.opportunities };
    case "growth_opportunities":
      return { ...base, opportunities: section.opportunities };
    case "opportunity_history":
      return { ...base, entries: section.entries };
    case "saved_opportunities":
      return {
        ...base,
        saved: section.saved,
        favorites_count: section.favoritesCount,
      };
    case "tomorrows_opportunity":
      return {
        ...base,
        prediction: section.prediction,
        why: section.why,
        expected_impact: section.expectedImpact,
      };
    default:
      return base;
  }
}

export function toOpportunitiesSectionView(section: LivingOpportunitiesSection) {
  return sectionToView(section);
}

export function toOpportunitiesSectionsView(sections: LivingOpportunitiesSection[]) {
  return sections.map(toOpportunitiesSectionView);
}
