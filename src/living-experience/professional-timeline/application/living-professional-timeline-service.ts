import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalTimelineContext } from "../domain/timeline-context.js";
import {
  buildLivingProfessionalTimelineExperience,
  buildLivingProfessionalTimelineStatistics,
  findTimelineSection,
  toLivingProfessionalTimelineStatisticsView,
  toLivingProfessionalTimelineView,
  toTimelineSectionView,
  TIMELINE_EXPERIENCE_FLAGS,
  validateLivingProfessionalTimelineContext,
} from "../domain/timeline-experience.js";
import type { LivingProfessionalTimelineSectionId } from "../domain/timeline-schema.js";
import { LIVING_PROFESSIONAL_TIMELINE_SECTIONS } from "../domain/timeline-schema.js";
import {
  collectLivingProfessionalTimelineEngineSnapshot,
  type LivingProfessionalTimelineEngineDeps,
} from "./timeline-collector.js";
import {
  createLivingProfessionalTimelineRepository,
  type LivingProfessionalTimelineRepository,
} from "../infrastructure/living-professional-timeline-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalTimelineService {
  private readonly repository: LivingProfessionalTimelineRepository;
  private readonly engines: LivingProfessionalTimelineEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalTimelineRepository;
    engines?: Partial<LivingProfessionalTimelineEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalTimelineRepository();
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
    return toLivingProfessionalTimelineView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toTimelineSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...TIMELINE_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalTimelineSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_TIMELINE_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findTimelineSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toTimelineSectionView(section),
      ...TIMELINE_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "timeline_summary");
  }

  getBeginning(authContext: AuthContext) {
    return this.getSection(authContext, "professional_beginning");
  }

  getEducation(authContext: AuthContext) {
    return this.getSection(authContext, "education_learning_timeline");
  }

  getCareer(authContext: AuthContext) {
    return this.getSection(authContext, "career_timeline");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "skills_evolution");
  }

  getAchievements(authContext: AuthContext) {
    return this.getSection(authContext, "achievement_timeline");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_timeline");
  }

  getLeadership(authContext: AuthContext) {
    return this.getSection(authContext, "leadership_timeline");
  }

  getTurningPoints(authContext: AuthContext) {
    return this.getSection(authContext, "major_turning_points");
  }

  getFuture(authContext: AuthContext) {
    return this.getSection(authContext, "future_timeline_projection");
  }

  getInsights(authContext: AuthContext) {
    return this.getSection(authContext, "timeline_insights");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "timeline_history", input);
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
      input.record_id || `tl-${Date.now()}`,
      input.insight_title,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted timeline insight"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...TIMELINE_EXPERIENCE_FLAGS,
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
      input.record_id || `tl-${Date.now()}`,
      input.insight_title,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...TIMELINE_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalTimelineContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalTimelineContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalTimelineView(experience),
      validation: {
        valid: validation.valid,
        timeline_ready: validation.timelineReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...TIMELINE_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalTimelineStatisticsView(
      buildLivingProfessionalTimelineStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalTimelineContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getTimelineHistory(context);
    const engines = collectLivingProfessionalTimelineEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalTimelineExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalTimelineModule {
  livingProfessionalTimeline: LivingProfessionalTimelineService;
}

export function createLivingProfessionalTimelineService(
  deps?: ConstructorParameters<typeof LivingProfessionalTimelineService>[0]
): LivingProfessionalTimelineService {
  return new LivingProfessionalTimelineService(deps);
}

export function createLivingProfessionalTimelineModule(
  deps?: ConstructorParameters<typeof LivingProfessionalTimelineService>[0]
): LivingProfessionalTimelineModule {
  return { livingProfessionalTimeline: createLivingProfessionalTimelineService(deps) };
}
