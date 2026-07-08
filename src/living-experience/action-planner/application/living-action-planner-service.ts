import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import { buildLivingActionPlannerContext } from "../domain/planner-context.js";
import {
  buildLivingActionPlannerExperience,
  buildLivingActionPlannerStatistics,
  findPlannerSection,
  toLivingActionPlannerStatisticsView,
  toLivingActionPlannerView,
  toPlannerSectionView,
  validateLivingActionPlannerContext,
} from "../domain/planner-experience.js";
import type { LivingActionPlannerSectionId } from "../domain/planner-schema.js";
import { LIVING_ACTION_PLANNER_SECTIONS } from "../domain/planner-schema.js";
import {
  collectLivingActionPlannerEngineSnapshot,
  type LivingActionPlannerEngineDeps,
} from "./planner-collector.js";
import {
  createLivingActionPlannerRepository,
  type LivingActionPlannerRepository,
} from "../infrastructure/living-action-planner-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";

export class LivingActionPlannerService {
  private readonly repository: LivingActionPlannerRepository;
  private readonly engines: LivingActionPlannerEngineDeps;

  constructor(deps?: {
    repository?: LivingActionPlannerRepository;
    engines?: Partial<LivingActionPlannerEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingActionPlannerRepository();
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
    return toLivingActionPlannerView(this.buildExperience(authContext, input?.generated_at));
  }

  getSections(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const experience = this.buildExperience(authContext, input?.generated_at);
    return {
      sections: experience.sections.map(toPlannerSectionView),
      count: experience.sections.length,
      generated_at: experience.generatedAt,
      experience_only: true,
      read_only: true,
      explainable: true,
      never_executes_automatically: true,
      never_decides_for_user: true,
    };
  }

  getSection(authContext: AuthContext, sectionId: LivingActionPlannerSectionId, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    if (!LIVING_ACTION_PLANNER_SECTIONS.includes(sectionId)) {
      throw new Error(`Unknown section: ${sectionId}`);
    }
    const experience = this.buildExperience(authContext, input?.generated_at);
    const section = findPlannerSection(experience, sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }
    return toPlannerSectionView(section);
  }

  getMission(authContext: AuthContext) {
    return this.getSection(authContext, "todays_mission");
  }

  getActionPlan(authContext: AuthContext) {
    return this.getSection(authContext, "todays_action_plan");
  }

  getTimeline(authContext: AuthContext) {
    return this.getSection(authContext, "priority_timeline");
  }

  getChecklist(authContext: AuthContext) {
    return this.getSection(authContext, "professional_checklist");
  }

  getPreparation(authContext: AuthContext) {
    return this.getSection(authContext, "required_preparation");
  }

  getResources(authContext: AuthContext) {
    return this.getSection(authContext, "recommended_resources");
  }

  getTime(authContext: AuthContext) {
    return this.getSection(authContext, "time_planner");
  }

  getProgress(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "progress_tracker", input);
  }

  getCompleted(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "completed_today", input);
  }

  getBlocked(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "blocked_actions", input);
  }

  getReschedule(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "reschedule_planner", input);
  }

  getTomorrow(authContext: AuthContext) {
    return this.getSection(authContext, "tomorrow_queue");
  }

  getHistory(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.getSection(authContext, "execution_history", input);
  }

  markComplete(
    authContext: AuthContext,
    input: { action_id: string; title: string; notes?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const execution = this.repository.recordActionCompleted(
      authContext.userId,
      input.action_id,
      input.title,
      recordedAt,
      input.notes
    );

    return {
      recorded: true,
      execution: {
        completed_count: execution.actions.filter((a) => a.status === "completed").length,
        updated_at: execution.updatedAt,
      },
      experience_only: true,
      never_executes_automatically: true,
      never_decides_for_user: true,
    };
  }

  markPostponed(
    authContext: AuthContext,
    input: { action_id: string; title: string; notes?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const recordedAt = input.generated_at ?? new Date().toISOString();
    this.buildExperience(authContext, recordedAt);
    const execution = this.repository.recordActionPostponed(
      authContext.userId,
      input.action_id,
      input.title,
      recordedAt,
      input.notes
    );

    return {
      recorded: true,
      execution: {
        postponed_count: execution.actions.filter((a) => a.status === "postponed").length,
        updated_at: execution.updatedAt,
      },
      experience_only: true,
      never_executes_automatically: true,
      never_decides_for_user: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const experience = this.buildExperience(authContext, generatedAt, true);
    this.repository.incrementRefreshCount();

    const context = buildLivingActionPlannerContext({
      authContext,
      onboarding: this.repository.getOnboardingResponses(authContext.userId),
      generatedAt,
    });
    const validation = validateLivingActionPlannerContext(context);

    return {
      refreshed: true,
      experience: toLivingActionPlannerView(experience),
      validation: {
        valid: validation.valid,
        planner_ready: validation.plannerReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
      read_only: true,
      never_executes_automatically: true,
      never_decides_for_user: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    return toLivingActionPlannerStatisticsView(
      buildLivingActionPlannerStatistics({
        experiences: this.repository.listExperiences(),
        executionProfiles: this.repository.getExecutionProfileCount(),
        refreshCount: this.repository.getRefreshCount(),
      })
    );
  }

  private buildExperience(authContext: AuthContext, generatedAt?: string, forceRefresh = false) {
    const onboarding = this.repository.getOnboardingResponses(authContext.userId);
    const context = buildLivingActionPlannerContext({ authContext, onboarding, generatedAt });

    if (!forceRefresh && !generatedAt) {
      const cached = this.repository.getCachedExperience(authContext.userId, context.dayKey);
      if (cached) return cached;
    }

    const execution = this.repository.getExecutionState(context);
    const engines = collectLivingActionPlannerEngineSnapshot({
      authContext,
      context,
      engines: this.engines,
    });
    const experience = buildLivingActionPlannerExperience({ context, engines, execution });
    this.repository.saveExperience(authContext.userId, experience);
    return experience;
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingActionPlannerModule {
  livingActionPlanner: LivingActionPlannerService;
}

export function createLivingActionPlannerService(
  deps?: ConstructorParameters<typeof LivingActionPlannerService>[0]
): LivingActionPlannerService {
  return new LivingActionPlannerService(deps);
}

export function createLivingActionPlannerModule(
  deps?: ConstructorParameters<typeof LivingActionPlannerService>[0]
): LivingActionPlannerModule {
  return { livingActionPlanner: createLivingActionPlannerService(deps) };
}
