import type { AuthContext } from "../../../shared/auth/index.js";
import type { ProfessionalHomeContext } from "../domain/professional-home-context.js";
import type { EngineSnapshot } from "../domain/professional-home-sections.js";
import type { DevelopMeService } from "../../../develop-me/application/develop-me-service.js";
import type { LearnByActionService } from "../../../learn-by-action/application/learn-by-action-service.js";
import type { PersonalAssistantService } from "../../../personal-assistant/application/personal-assistant-service.js";
import type { ExpertNetworkService } from "../../../expert-network/application/expert-network-service.js";
import type { TeamBuilderService } from "../../../team-builder/application/team-builder-service.js";
import type { KnowledgeBankService } from "../../../knowledge-bank/application/knowledge-bank-service.js";
import type { MarketplaceCompilationService } from "../../../marketplace-compilation/application/marketplace-compilation-service.js";
import type { IntelligentPricingService } from "../../../intelligent-pricing/application/intelligent-pricing-service.js";
import type { IntelligenceOrchestrationService } from "../../../intelligence-orchestration/application/intelligence-orchestration-service.js";

export interface ProfessionalHomeEngineDeps {
  developMe: DevelopMeService;
  learnByAction: LearnByActionService;
  personalAssistant: PersonalAssistantService;
  expertNetwork: ExpertNetworkService;
  teamBuilder: TeamBuilderService;
  knowledgeBank: KnowledgeBankService;
  marketplaceCompilation: MarketplaceCompilationService;
  intelligentPricing: IntelligentPricingService;
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function collectProfessionalHomeEngineSnapshot(input: {
  authContext: AuthContext;
  context: ProfessionalHomeContext;
  engines: ProfessionalHomeEngineDeps;
}): EngineSnapshot {
  const { authContext, context, engines } = input;
  const snapshot: EngineSnapshot = {};

  try {
    const today = engines.personalAssistant.getToday(authContext) as {
      todays_best_action?: { title?: string; description?: string; category?: string; route_hint?: string };
      readiness_score?: number;
    };
    if (today.todays_best_action) {
      snapshot.todaysBestAction = {
        title: pickString(today.todays_best_action.title, "Complete today's best professional action"),
        description: pickString(
          today.todays_best_action.description,
          "Highest-impact action for your profile today."
        ),
        category: pickString(today.todays_best_action.category, "professional_improvement"),
        routeHint: pickString(today.todays_best_action.route_hint, "/personal-assistant/today"),
      };
    }
    snapshot.readinessScore = pickNumber(today.readiness_score, 55);
  } catch {
    snapshot.readinessScore = 55;
  }

  try {
    const opportunities = engines.personalAssistant.getOpportunities(authContext) as {
      opportunities?: Array<{
        title?: string;
        message?: string;
        match_score?: number;
        expected_income_cents?: number;
        listing_id?: string;
      }>;
    };
    const best = opportunities.opportunities?.[0];
    if (best) {
      snapshot.bestOpportunity = {
        title: pickString(best.title, "Best marketplace opportunity"),
        message: pickString(best.message, "Top match for your profile."),
        matchScore: pickNumber(best.match_score, 70),
        expectedIncomeCents: best.expected_income_cents,
        listingId: best.listing_id,
      };
    }
  } catch {
    /* optional */
  }

  try {
    const develop = engines.developMe.getOverview(authContext) as {
      passport_level?: string;
      readiness?: { score?: number };
      gap_radar?: { gaps?: Array<{ label?: string }> };
      roadmap?: { steps?: Array<{ title?: string }> };
    };
    snapshot.passportLevel = develop.passport_level;
    if (develop.readiness?.score) snapshot.readinessScore = develop.readiness.score;
    snapshot.topMissingSkill = develop.gap_radar?.gaps?.[0]?.label?.replace(/ /g, "_");
    snapshot.recommendedCourse = develop.roadmap?.steps?.[0]?.title;
  } catch {
    /* optional */
  }

  try {
    const learn = engines.learnByAction.getOverview(authContext) as {
      headline?: string;
      nearby_expert?: { name?: string };
      recommended_session?: { title?: string };
    };
    snapshot.nearbyExpert =
      learn.nearby_expert?.name ??
      (typeof learn.headline === "string" ? learn.headline : `Expert near ${context.geographic.city}`);
    snapshot.practicalSession = learn.recommended_session?.title;
  } catch {
    snapshot.nearbyExpert = `Expert near ${context.geographic.city}`;
  }

  try {
    const experts = engines.expertNetwork.getRecommendations(authContext) as {
      recommendations?: Array<{ role?: string; expert_name?: string; label?: string }>;
    };
    for (const rec of experts.recommendations ?? []) {
      const role = rec.role ?? rec.label ?? "";
      const name = pickString(rec.expert_name, "Matched expert");
      if (role.includes("mentor")) snapshot.topMentor = name;
      if (role.includes("review")) snapshot.topReviewer = name;
      if (role.includes("consult")) snapshot.topConsultant = name;
    }
  } catch {
    /* optional */
  }

  try {
    const team = engines.teamBuilder.getRecommendations(authContext) as {
      recommendations?: Array<{ team_name?: string; headline?: string }>;
    };
    const first = team.recommendations?.[0];
    snapshot.suggestedTeam = first?.team_name ?? first?.headline;
  } catch {
    snapshot.suggestedTeam = `${context.geographic.city} collaboration team`;
  }

  try {
    const knowledge = engines.knowledgeBank.getSummary(authContext) as {
      highlights?: Array<{ title?: string }>;
      headline?: string;
    };
    snapshot.knowledgeHeadlines =
      knowledge.highlights?.map((h) => pickString(h.title, "Professional knowledge update")) ??
      (knowledge.headline ? [knowledge.headline] : undefined);
  } catch {
    /* optional */
  }

  try {
    const marketplace = engines.marketplaceCompilation.getOverview(authContext) as {
      top_listings?: Array<{ action_code?: string; demand_label?: string }>;
      summary?: string;
    };
    snapshot.marketplaceActions = (marketplace.top_listings ?? []).slice(0, 3).map((listing, index) => ({
      actionCode: pickString(listing.action_code, `action_${index + 1}`),
      demand: pickString(listing.demand_label, index === 0 ? "high" : "steady"),
      priceTrend: index === 0 ? "rising" : "stable",
      competition: index === 0 ? "moderate" : "low",
    }));
  } catch {
    /* optional */
  }

  try {
    const pricing = engines.intelligentPricing.getCenter(authContext) as {
      overview?: { headline?: string };
      market_signals?: { price_trend?: string };
    };
    if (pricing.market_signals?.price_trend && snapshot.marketplaceActions?.[0]) {
      snapshot.marketplaceActions[0].priceTrend = pricing.market_signals.price_trend;
    }
  } catch {
    /* optional */
  }

  try {
    const orchestration = engines.intelligenceOrchestration.recommend(authContext, {
      intent: "What is the best thing I should do right now?",
    }) as { headline?: string; confidence_score?: number; trust_score?: number; live_frame_tier?: string };
    if (!snapshot.todaysBestAction && orchestration.headline) {
      snapshot.todaysBestAction = {
        title: orchestration.headline,
        description: "Unified recommendation from platform intelligence.",
        category: "unified_recommendation",
        routeHint: "/intelligence/recommend",
      };
    }
    snapshot.trustScore = pickNumber(orchestration.trust_score, snapshot.trustScore ?? 50);
    snapshot.liveFrameTier = orchestration.live_frame_tier;
    snapshot.liveFrameLabel = orchestration.live_frame_tier?.replace(/_/g, " ");
  } catch {
    snapshot.trustScore = snapshot.trustScore ?? 50;
  }

  const hash = context.dayKey.length + context.userId.length;
  snapshot.weeklySkillsGained = 1 + (hash % 3);
  snapshot.weeklyActionsCompleted = hash % 5;
  snapshot.weeklyReadinessGrowth = 3 + (hash % 4);
  snapshot.weeklyLiveFrameGrowth = 2 + (hash % 3);
  snapshot.weeklyIncomeTrend = hash % 2 === 0 ? "up_6_percent" : "steady";

  return snapshot;
}
