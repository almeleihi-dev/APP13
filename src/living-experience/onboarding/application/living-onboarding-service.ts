import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingStepId } from "../domain/onboarding-schema.js";
import { ONBOARDING_STEPS } from "../domain/onboarding-schema.js";
import {
  buildOnboardingContext,
  resolveCurrentStep,
} from "../domain/onboarding-context.js";
import {
  buildOnboardingJourney,
  buildOnboardingStatistics,
  mergeStepResponse,
  toOnboardingJourneyView,
  toOnboardingStatisticsView,
  validateStepSubmission,
} from "../domain/onboarding-journey.js";
import {
  buildClassificationExplanation,
  buildInitialClassification,
  toClassificationExplanationView,
  toInitialClassificationView,
} from "../domain/onboarding-classification.js";
import {
  buildOnboardingOutputs,
  toEngineFeedView,
  toOnboardingLiveFrameView,
  toOnboardingPassportView,
  toOnboardingPersonalHomeView,
} from "../domain/onboarding-projections.js";
import {
  collectOnboardingEngineFeeds,
  type OnboardingEngineDeps,
} from "./onboarding-engine-feed.js";
import {
  createLivingOnboardingRepository,
  type LivingOnboardingRepository,
} from "../infrastructure/living-onboarding-repository.js";
import { createDevelopMeModule } from "../../../develop-me/module.js";
import { createLearnByActionModule } from "../../../learn-by-action/module.js";
import { createPersonalAssistantModule } from "../../../personal-assistant/module.js";
import { createIntelligenceOrchestrationModule } from "../../../intelligence-orchestration/module.js";
import { createExpertNetworkModule } from "../../../expert-network/module.js";
import { createTeamBuilderModule } from "../../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../../knowledge-bank/module.js";
import { createActionBlueprintModule } from "../../../action-blueprint/module.js";
import { requireAuth, requireRole } from "../../../security/guards.js";
import {
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEP_PURPOSES,
  LIVING_ONBOARDING_SCHEMA_VERSION,
  WELCOME_HEADLINE,
} from "../domain/onboarding-schema.js";

export class LivingOnboardingService {
  private readonly repository: LivingOnboardingRepository;
  private readonly engines: OnboardingEngineDeps;

  constructor(deps?: {
    repository?: LivingOnboardingRepository;
    engines?: Partial<OnboardingEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createLivingOnboardingRepository();
    this.engines = {
      developMe: deps?.engines?.developMe ?? createDevelopMeModule().developMe,
      learnByAction: deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction,
      personalAssistant: deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant,
      intelligenceOrchestration:
        deps?.engines?.intelligenceOrchestration ?? createIntelligenceOrchestrationModule().intelligenceOrchestration,
      expertNetwork: deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork,
      teamBuilder: deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder,
      knowledgeBank: deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank,
      actionBlueprint: deps?.engines?.actionBlueprint ?? createActionBlueprintModule().actionBlueprint,
    };
  }

  getOverview(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const state = this.repository.getOrCreate(authContext.userId);
    const context = buildOnboardingContext({
      authContext,
      responses: state.responses,
      completedSteps: state.completedSteps,
      currentStep: state.currentStep,
      generatedAt: state.generatedAt,
    });
    const journey = buildOnboardingJourney(context);

    return {
      schema_version: LIVING_ONBOARDING_SCHEMA_VERSION,
      user_id: authContext.userId,
      headline: journey.onboardingComplete ? journey.headline : WELCOME_HEADLINE,
      current_step: journey.currentStep,
      progress_percent: journey.progressPercent,
      onboarding_complete: journey.onboardingComplete,
      experience_only: true,
      read_only: false,
      generated_at: context.generatedAt,
    };
  }

  getJourney(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = this.buildContext(authContext);
    return toOnboardingJourneyView(buildOnboardingJourney(context));
  }

  getSteps(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const journey = buildOnboardingJourney(this.buildContext(authContext));
    return {
      schema_version: LIVING_ONBOARDING_SCHEMA_VERSION,
      steps: journey.steps.map((s) => ({
        step_id: s.stepId,
        order: s.order,
        label: s.label,
        purpose: s.purpose,
        status: s.status,
      })),
      current_step: journey.currentStep,
      generated_at: journey.generatedAt,
    };
  }

  getStep(authContext: AuthContext, stepId: OnboardingStepId) {
    this.assertAuthenticated(authContext);
    if (!ONBOARDING_STEPS.includes(stepId)) {
      throw new Error(`Unknown onboarding step: ${stepId}`);
    }
    const context = this.buildContext(authContext);
    const journey = buildOnboardingJourney(context);

    return {
      schema_version: LIVING_ONBOARDING_SCHEMA_VERSION,
      step_id: stepId,
      label: ONBOARDING_STEP_LABELS[stepId],
      purpose: ONBOARDING_STEP_PURPOSES[stepId],
      status: journey.steps.find((s) => s.stepId === stepId)?.status ?? "pending",
      one_purpose_only: true,
      experience_only: true,
      generated_at: context.generatedAt,
    };
  }

  submitStep(
    authContext: AuthContext,
    stepId: OnboardingStepId,
    payload: Record<string, unknown>
  ) {
    this.assertAuthenticated(authContext);
    if (!ONBOARDING_STEPS.includes(stepId)) {
      throw new Error(`Unknown onboarding step: ${stepId}`);
    }

    const validation = validateStepSubmission(stepId, payload);
    if (!validation.valid && stepId !== "welcome") {
      return {
        accepted: false,
        validation: {
          valid: validation.valid,
          step_ready: validation.stepReady,
          errors: validation.errors,
          warnings: validation.warnings,
          summary: validation.summary,
        },
        experience_only: true,
      };
    }

    const state = this.repository.getOrCreate(authContext.userId);
    const responses =
      stepId === "welcome"
        ? state.responses
        : mergeStepResponse(state.responses, stepId, payload);

    const completedSteps = state.completedSteps.includes(stepId)
      ? [...state.completedSteps]
      : [...state.completedSteps, stepId];

    const currentStep = resolveCurrentStep(completedSteps);
    const updated = this.repository.save(authContext.userId, {
      responses,
      completedSteps,
      currentStep,
    });

    const context = buildOnboardingContext({
      authContext,
      responses: updated.responses,
      completedSteps: updated.completedSteps,
      currentStep: updated.currentStep,
      generatedAt: updated.generatedAt,
    });

    return {
      accepted: true,
      step_id: stepId,
      journey: toOnboardingJourneyView(buildOnboardingJourney(context)),
      validation: {
        valid: true,
        step_ready: true,
        errors: [],
        warnings: validation.warnings,
        summary: validation.summary,
      },
      experience_only: true,
    };
  }

  getClassification(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = this.buildContext(authContext);
    const classification = buildInitialClassification(context);
    const explanation = buildClassificationExplanation(classification);

    return {
      classification: toInitialClassificationView(classification),
      explanation: toClassificationExplanationView(explanation),
      experience_only: true,
      read_only: true,
    };
  }

  getPassport(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = this.buildContext(authContext);
    const feeds = collectOnboardingEngineFeeds({
      authContext,
      context,
      engines: this.engines,
    });
    const { passport } = buildOnboardingOutputs(context, feeds);
    return toOnboardingPassportView(passport);
  }

  getLiveFrame(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = this.buildContext(authContext);
    const feeds = collectOnboardingEngineFeeds({
      authContext,
      context,
      engines: this.engines,
    });
    const { liveFrame } = buildOnboardingOutputs(context, feeds);
    return toOnboardingLiveFrameView(liveFrame);
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = this.buildContext(authContext);
    const feeds = collectOnboardingEngineFeeds({
      authContext,
      context,
      engines: this.engines,
    });
    const { personalHome } = buildOnboardingOutputs(context, feeds);
    return toOnboardingPersonalHomeView(personalHome);
  }

  complete(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const state = this.repository.getOrCreate(authContext.userId);
    const completedSteps = [...new Set([...ONBOARDING_STEPS])] as OnboardingStepId[];

    const updated = this.repository.save(authContext.userId, {
      responses: state.responses,
      completedSteps,
      currentStep: "personal_home",
      generatedAt: input?.generated_at,
    });

    const context = buildOnboardingContext({
      authContext,
      responses: updated.responses,
      completedSteps: updated.completedSteps,
      currentStep: updated.currentStep,
      generatedAt: updated.generatedAt,
    });

    const feeds = collectOnboardingEngineFeeds({
      authContext,
      context,
      engines: this.engines,
    });
    const outputs = buildOnboardingOutputs(context, feeds);

    return {
      journey: toOnboardingJourneyView(buildOnboardingJourney(context)),
      classification: toInitialClassificationView(outputs.classification),
      passport: toOnboardingPassportView(outputs.passport),
      live_frame: toOnboardingLiveFrameView(outputs.liveFrame),
      home: toOnboardingPersonalHomeView(outputs.personalHome),
      engine_feeds: toEngineFeedView(feeds),
      onboarding_complete: true,
      experience_only: true,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const state = this.repository.getOrCreate(authContext.userId);
    const updated = this.repository.save(authContext.userId, {
      responses: state.responses,
      completedSteps: state.completedSteps,
      currentStep: state.currentStep,
      generatedAt: input?.generated_at ?? new Date().toISOString(),
    });

    const context = buildOnboardingContext({
      authContext,
      responses: updated.responses,
      completedSteps: updated.completedSteps,
      currentStep: updated.currentStep,
      generatedAt: updated.generatedAt,
    });

    const feeds = collectOnboardingEngineFeeds({
      authContext,
      context,
      engines: this.engines,
    });
    const outputs = buildOnboardingOutputs(context, feeds);

    return {
      refreshed: true,
      classification: toInitialClassificationView(outputs.classification),
      passport: toOnboardingPassportView(outputs.passport),
      live_frame: toOnboardingLiveFrameView(outputs.liveFrame),
      home: toOnboardingPersonalHomeView(outputs.personalHome),
      engine_feeds: toEngineFeedView(feeds),
      experience_only: true,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const journeys = this.repository.listAll().map((state) => {
      const context = buildOnboardingContext({
        authContext: {
          userId: state.userId,
          roles: ["provider"],
          tier: "T1",
          status: "active",
          sessionId: "stats",
        },
        responses: state.responses,
        completedSteps: state.completedSteps,
        currentStep: state.currentStep,
        generatedAt: state.generatedAt,
      });
      return buildOnboardingJourney(context);
    });
    return toOnboardingStatisticsView(buildOnboardingStatistics(journeys));
  }

  private buildContext(authContext: AuthContext) {
    const state = this.repository.getOrCreate(authContext.userId);
    return buildOnboardingContext({
      authContext,
      responses: state.responses,
      completedSteps: state.completedSteps,
      currentStep: state.currentStep,
      generatedAt: state.generatedAt,
    });
  }

  private assertAuthenticated(authContext: AuthContext) {
    requireAuth(authContext);
  }
}

export interface LivingOnboardingModule {
  livingOnboarding: LivingOnboardingService;
}

export function createLivingOnboardingService(
  deps?: ConstructorParameters<typeof LivingOnboardingService>[0]
): LivingOnboardingService {
  return new LivingOnboardingService(deps);
}

export function createLivingOnboardingModule(
  deps?: ConstructorParameters<typeof LivingOnboardingService>[0]
): LivingOnboardingModule {
  return { livingOnboarding: createLivingOnboardingService(deps) };
}
