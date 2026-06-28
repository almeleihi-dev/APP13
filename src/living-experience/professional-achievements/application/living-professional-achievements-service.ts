import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingProfessionalAchievementsContext } from "../domain/achievements-context.js";
import {
  buildLivingProfessionalAchievementsExperience,
  buildLivingProfessionalAchievementsStatistics,
  findAchievementsSection,
  toLivingProfessionalAchievementsStatisticsView,
  toLivingProfessionalAchievementsView,
  toAchievementsSectionView,
  ACHIEVEMENTS_EXPERIENCE_FLAGS,
  validateLivingProfessionalAchievementsContext,
} from "../domain/achievements-experience.js";
import type { LivingProfessionalAchievementsSectionId } from "../domain/achievements-schema.js";
import { LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS } from "../domain/achievements-schema.js";
import {
  collectLivingProfessionalAchievementsEngineSnapshot,
  type LivingProfessionalAchievementsEngineDeps,
} from "./achievements-collector.js";
import {
  createLivingProfessionalAchievementsRepository,
  type LivingProfessionalAchievementsRepository,
} from "../infrastructure/living-professional-achievements-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingProfessionalAchievementsService {
  private readonly repository: LivingProfessionalAchievementsRepository;
  private readonly engines: LivingProfessionalAchievementsEngineDeps;

  constructor(deps?: {
    repository?: LivingProfessionalAchievementsRepository;
    engines?: Partial<LivingProfessionalAchievementsEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingProfessionalAchievementsRepository();
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
    return toLivingProfessionalAchievementsView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toAchievementsSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
    };
  }

  getSection(
    authContext: AuthContext,
    sectionId: LivingProfessionalAchievementsSectionId,
    input?: { generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    if (!LIVING_PROFESSIONAL_ACHIEVEMENTS_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findAchievementsSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return {
      ...toAchievementsSectionView(section),
      ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
    };
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "achievements_summary");
  }

  getMilestones(authContext: AuthContext) {
    return this.getSection(authContext, "professional_milestones");
  }

  getCertifications(authContext: AuthContext) {
    return this.getSection(authContext, "certifications");
  }

  getAwards(authContext: AuthContext) {
    return this.getSection(authContext, "awards_honors");
  }

  getBadges(authContext: AuthContext) {
    return this.getSection(authContext, "professional_badges");
  }

  getRecords(authContext: AuthContext) {
    return this.getSection(authContext, "career_records");
  }

  getSkills(authContext: AuthContext) {
    return this.getSection(authContext, "skill_achievements");
  }

  getFinancial(authContext: AuthContext) {
    return this.getSection(authContext, "financial_achievements");
  }

  getLeadership(authContext: AuthContext) {
    return this.getSection(authContext, "leadership_achievements");
  }

  getTimeline(authContext: AuthContext) {
    return this.getSection(authContext, "achievement_timeline");
  }

  getRecommendations(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_next_achievements");
  }

  getConfidence(authContext: AuthContext) {
    return this.getSection(authContext, "confidence_explanation");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "achievement_history", input);
  }

  acceptAchievement(
    authContext: AuthContext,
    input: { record_id: string; achievement_title: string; outcome?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordAchievement(
      authContext.userId,
      input.record_id || `ach-${Date.now()}`,
      input.achievement_title,
      "accepted",
      recordedAt,
      input.outcome ?? "User accepted achievement recommendation"
    );

    return {
      recorded: true,
      accepted_count: history.records.filter((r) => r.status === "accepted").length,
      ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
    };
  }

  ignoreAchievement(
    authContext: AuthContext,
    input: { record_id: string; achievement_title: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const history = this.repository.recordAchievement(
      authContext.userId,
      input.record_id || `ach-${Date.now()}`,
      input.achievement_title,
      "ignored",
      recordedAt
    );

    return {
      recorded: true,
      ignored_count: history.records.filter((r) => r.status === "ignored").length,
      ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingProfessionalAchievementsContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingProfessionalAchievementsContext(context);

    return {
      refreshed: true,
      experience: toLivingProfessionalAchievementsView(experience),
      validation: {
        valid: validation.valid,
        achievements_ready: validation.achievementsReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      ...ACHIEVEMENTS_EXPERIENCE_FLAGS,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingProfessionalAchievementsStatisticsView(
      buildLivingProfessionalAchievementsStatistics({
        experiences: this.repository.listExperiences(),
        historyProfiles: this.repository.getHistoryProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingProfessionalAchievementsContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const history = this.repository.getAchievementHistory(context);
    const engines = collectLivingProfessionalAchievementsEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingProfessionalAchievementsExperience({ context, engines, history });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingProfessionalAchievementsModule {
  livingProfessionalAchievements: LivingProfessionalAchievementsService;
}

export function createLivingProfessionalAchievementsService(
  deps?: ConstructorParameters<typeof LivingProfessionalAchievementsService>[0]
): LivingProfessionalAchievementsService {
  return new LivingProfessionalAchievementsService(deps);
}

export function createLivingProfessionalAchievementsModule(
  deps?: ConstructorParameters<typeof LivingProfessionalAchievementsService>[0]
): LivingProfessionalAchievementsModule {
  return { livingProfessionalAchievements: createLivingProfessionalAchievementsService(deps) };
}
