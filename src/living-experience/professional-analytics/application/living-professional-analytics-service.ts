import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalAnalyticsContext } from "../domain/analytics-context.js";
import {
  buildLivingProfessionalAnalyticsExperience,
  buildLivingProfessionalAnalyticsStatistics,
  findAnalyticsSection,
  toLivingProfessionalAnalyticsStatisticsView,
  toLivingProfessionalAnalyticsView,
  toAnalyticsSectionView,
  ANALYTICS_EXPERIENCE_FLAGS,
  validateLivingProfessionalAnalyticsContext,
} from "../domain/analytics-experience.js";
import type { LivingProfessionalAnalyticsSectionId } from "../domain/analytics-schema.js";
import { LIVING_PROFESSIONAL_ANALYTICS_SECTIONS } from "../domain/analytics-schema.js";
import {
  collectLivingProfessionalAnalyticsEngineSnapshot,
  type LivingProfessionalAnalyticsEngineDeps,
} from "./analytics-collector.js";
import {
  createLivingProfessionalAnalyticsRepository,
  type LivingProfessionalAnalyticsRepository,
} from "../infrastructure/living-professional-analytics-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalAnalyticsService {
  private readonly repository: LivingProfessionalAnalyticsRepository;
  private readonly engines: LivingProfessionalAnalyticsEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalAnalyticsRepository;
    engines?: Partial<LivingProfessionalAnalyticsEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalAnalyticsRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      teamBuilder: deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingProfessionalAnalyticsView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toAnalyticsSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...ANALYTICS_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalAnalyticsSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_ANALYTICS_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findAnalyticsSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toAnalyticsSectionView(section),
      ...ANALYTICS_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "analytics_summary");
  }

  getGrowth(authContext: AuthContext) {
    return this.getSection(authContext, "professional_growth");
  }

  getPerformance(authContext: AuthContext) {
    return this.getSection(authContext, "performance_metrics");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "skills_analytics");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_analytics");
  }

  getProductivity(authContext: AuthContext) {
    return this.getSection(authContext, "productivity_analytics");
  }

  getOpportunities(authContext: AuthContext) {
    return this.getSection(authContext, "opportunity_analytics");
  }

  getRisks(authContext: AuthContext) {
    return this.getSection(authContext, "risk_analytics");
  }

  getAchievements(authContext: AuthContext) {
    return this.getSection(authContext, "achievement_analytics");
  }

  getTrends(authContext: AuthContext) {
    return this.getSection(authContext, "trend_analysis");
  }

  getInsights(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_insights");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "analytics_history", input);
  }

  acceptInsight(
    authContext: AuthContext,
    input: { record_id: string; insight_title: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordInsight(
      authContext.userId,
      input.record_id || `insight-${Date.now()}`,
      input.insight_title,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted analytics insight"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...ANALYTICS_EXPERIENCE_FLAGS,
    };
  }

  ignoreInsight(
    authContext: AuthContext,
    input: { record_id: string; insight_title: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordInsight(
      authContext.userId,
      input.record_id || `insight-${Date.now()}`,
      input.insight_title,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...ANALYTICS_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalAnalyticsContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalAnalyticsContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalAnalyticsView(experience),
      validation: {
        valid: validation.valid,
        analytics_ready: validation.analyticsReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...ANALYTICS_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalAnalyticsStatisticsView(
      buildLivingProfessionalAnalyticsStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalAnalyticsContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getAnalyticsHistory(context);
    const engines = collectLivingProfessionalAnalyticsEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalAnalyticsExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalAnalyticsModule {
  livingProfessionalAnalytics: LivingProfessionalAnalyticsService;
}

export function createLivingProfessionalAnalyticsService(
  deps?: ConstructorParameters<typeof LivingProfessionalAnalyticsService>[0]
): LivingProfessionalAnalyticsService {
  return new LivingProfessionalAnalyticsService(deps);
}

export function createLivingProfessionalAnalyticsModule(
  deps?: ConstructorParameters<typeof LivingProfessionalAnalyticsService>[0]
): LivingProfessionalAnalyticsModule {
  return { livingProfessionalAnalytics: createLivingProfessionalAnalyticsService(deps) };
}
