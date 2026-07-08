import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingLiveFrameContext } from "../domain/live-frame-context.js";
import {
  buildLivingLiveFrameExperience,
  buildLivingLiveFrameStatistics,
  findLiveFrameSection,
  toLivingLiveFrameStatisticsView,
  toLivingLiveFrameView,
  toLiveFrameSectionView,
  validateLivingLiveFrameContext,
} from "../domain/live-frame-experience.js";
import type { LivingLiveFrameSectionId } from "../domain/live-frame-schema.js";
import { LIVING_LIVE_FRAME_SECTIONS } from "../domain/live-frame-schema.js";
import {
  collectLivingLiveFrameEngineSnapshot,
  type LivingLiveFrameEngineDeps,
} from "./live-frame-collector.js";
import {
  createLivingLiveFrameRepository,
  type LivingLiveFrameRepository,
} from "../infrastructure/living-live-frame-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingLiveFrameService {
  private readonly repository: LivingLiveFrameRepository;
  private readonly engines: LivingLiveFrameEngineDeps;

  constructor(deps?: {
    repository?: LivingLiveFrameRepository;
    engines?: Partial<LivingLiveFrameEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingLiveFrameRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
    };
  }

  getFrame(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    return toLivingLiveFrameView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toLiveFrameSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingLiveFrameSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_LIVE_FRAME_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findLiveFrameSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toLiveFrameSectionView(section);
  }

  getCurrent(authContext: AuthContext) {
    return this.getSection(authContext, "current_live_frame");
  }

  getMeaning(authContext: AuthContext) {
    return this.getSection(authContext, "frame_meaning");
  }

  getTrustScore(authContext: AuthContext) {
    return this.getSection(authContext, "trust_score");
  }

  getHistory(authContext: AuthContext) {
    return this.getSection(authContext, "frame_history");
  }

  getProgress(authContext: AuthContext) {
    return this.getSection(authContext, "progress");
  }

  getPositiveDrivers(authContext: AuthContext) {
    return this.getSection(authContext, "positive_drivers");
  }

  getNegativeDrivers(authContext: AuthContext) {
    return this.getSection(authContext, "negative_drivers");
  }

  getGrowth(authContext: AuthContext) {
    return this.getSection(authContext, "professional_growth");
  }

  getRecommendations(authContext: AuthContext) {
    return this.getSection(authContext, "recommendations");
  }

  getTimeline(authContext: AuthContext) {
    return this.getSection(authContext, "timeline");
  }

  getAchievements(authContext: AuthContext) {
    return this.getSection(authContext, "achievements");
  }

  getEvidence(authContext: AuthContext) {
    return this.getSection(authContext, "verified_evidence");
  }

  getProjection(authContext: AuthContext) {
    return this.getSection(authContext, "future_projection");
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingLiveFrameContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingLiveFrameContext(context);

    return {
      refreshed: true,
      frame: toLivingLiveFrameView(experience),
      validation: {
        valid: validation.valid,
        frame_ready: validation.frameReady,
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
    return toLivingLiveFrameStatisticsView(
      buildLivingLiveFrameStatistics({
        experiences: this.repository.listExperiences(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingLiveFrameContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const engines = collectLivingLiveFrameEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingLiveFrameExperience({ context, engines });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingLiveFrameModule {
  livingLiveFrame: LivingLiveFrameService;
}

export function createLivingLiveFrameService(
  deps?: ConstructorParameters<typeof LivingLiveFrameService>[0]
): LivingLiveFrameService {
  return new LivingLiveFrameService(deps);
}

export function createLivingLiveFrameModule(
  deps?: ConstructorParameters<typeof LivingLiveFrameService>[0]
): LivingLiveFrameModule {
  return { livingLiveFrame: createLivingLiveFrameService(deps) };
}
