import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingTodayIActedContext } from "../domain/acted-context.js";
import {
  buildLivingTodayIActedExperience,
  buildLivingTodayIActedStatistics,
  findActedSection,
  searchProfessionalMemories,
  toLivingTodayIActedStatisticsView,
  toLivingTodayIActedView,
  toActedSectionView,
  validateLivingTodayIActedContext,
} from "../domain/acted-experience.js";
import type { LivingTodayIActedSectionId } from "../domain/acted-schema.js";
import { LIVING_TODAY_I_ACTED_SCHEMA_VERSION, LIVING_TODAY_I_ACTED_SECTIONS } from "../domain/acted-schema.js";
import {
  buildEvidenceDraftWithPermission,
} from "../domain/acted-sections.js";
import type { EvidenceAttachmentType } from "../domain/acted-schema.js";
import {
  collectLivingTodayIActedEngineSnapshot,
  type LivingTodayIActedEngineDeps,
} from "./acted-collector.js";
import {
  createLivingTodayIActedRepository,
  type LivingTodayIActedRepository,
} from "../infrastructure/living-today-i-acted-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingTodayIActedService {
  private readonly repository: LivingTodayIActedRepository;
  private readonly engines: LivingTodayIActedEngineDeps;

  constructor(deps?: {
    repository?: LivingTodayIActedRepository;
    engines?: Partial<LivingTodayIActedEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingTodayIActedRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingTodayIActedView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toActedSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingTodayIActedSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_TODAY_I_ACTED_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findActedSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toActedSectionView(section);
  }

  getSummary(authContext: AuthContext) {
    return this.getSection(authContext, "todays_summary");
  }

  getActions(authContext: AuthContext) {
    return this.getSection(authContext, "todays_actions");
  }

  getStory(authContext: AuthContext) {
    return this.getSection(authContext, "todays_story");
  }

  getAchievements(authContext: AuthContext) {
    return this.getSection(authContext, "todays_achievements");
  }

  getLearning(authContext: AuthContext) {
    return this.getSection(authContext, "todays_learning");
  }

  getTeam(authContext: AuthContext) {
    return this.getSection(authContext, "todays_team");
  }

  getCustomers(authContext: AuthContext) {
    return this.getSection(authContext, "todays_customers");
  }

  getProgress(authContext: AuthContext) {
    return this.getSection(authContext, "todays_progress");
  }

  getImpact(authContext: AuthContext) {
    return this.getSection(authContext, "todays_impact");
  }

  getMemory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "professional_memory", input);
  }

  searchMemory(authContext: AuthContext, query: string) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.getMemoryEntries(authContext.userId);
    const results = searchProfessionalMemories(entries, query);

    return {
      schema_version: LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
      query,
      results: results.map((e) => ({
        memory_id: e.memoryId,
        day_key: e.dayKey,
        title: e.title,
        summary: e.summary,
        professional_score: e.professionalScore,
        created_at: e.createdAt,
      })),
      count: results.length,
      retention_policy: "never_deleted_automatically",
      experience_only: true,
      read_only: true,
    };
  }

  getShareStory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "share_story", input);
  }

  getEvidenceBuilder(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "evidence_builder", input);
  }

  buildEvidence(
    authContext: AuthContext,
    input: {
      evidence_id: string;
      user_permission_granted: boolean;
      attachment_types?: EvidenceAttachmentType[];
      generated_at?: string;
    }
  ) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input.generated_at);
    const storySection = findActedSection(experience, "todays_story");
    const context = buildLivingTodayIActedContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt: input.generated_at,
    });
    const engines = collectLivingTodayIActedEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });

    const result = buildEvidenceDraftWithPermission({
      context,
      story: storySection?.sectionId === "todays_story" ? storySection.story : "",
      engines,
      evidenceId: input.evidence_id,
      userPermissionGranted: input.user_permission_granted,
      attachmentTypes: input.attachment_types,
    });

    return {
      schema_version: LIVING_TODAY_I_ACTED_SCHEMA_VERSION,
      ...result,
    };
  }

  getTomorrow(authContext: AuthContext) {
    return this.getSection(authContext, "tomorrows_suggestion");
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingTodayIActedContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingTodayIActedContext(context);

    return {
      refreshed: true,
      experience: toLivingTodayIActedView(experience),
      validation: {
        valid: validation.valid,
        experience_ready: validation.experienceReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingTodayIActedStatisticsView(
      buildLivingTodayIActedStatistics({
        experiences: this.repository.listExperiences(),
        memoryCount: this.repository.getTotalMemoryCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingTodayIActedContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const memoryEntries = this.repository.getMemoryEntries(authContext.userId);
    const engines = collectLivingTodayIActedEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingTodayIActedExperience({ context, engines, memoryEntries });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingTodayIActedModule {
  livingTodayIActed: LivingTodayIActedService;
}

export function createLivingTodayIActedService(
  deps?: ConstructorParameters<typeof LivingTodayIActedService>[0]
): LivingTodayIActedService {
  return new LivingTodayIActedService(deps);
}

export function createLivingTodayIActedModule(
  deps?: ConstructorParameters<typeof LivingTodayIActedService>[0]
): LivingTodayIActedModule {
  return { livingTodayIActed: createLivingTodayIActedService(deps) };
}
