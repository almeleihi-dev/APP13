import type { AuthContext } from "../../../shared/auth/index.js";
import type { NeedExperienceService } from "../../need/application/need-experience-service.js";
import type { ActionExperienceService } from "../../action/application/action-experience-service.js";
import type { ContractExperienceService } from "../../contract/application/contract-experience-service.js";
import type { ChatExperienceService } from "../../chat/application/chat-experience-service.js";
import type { TimelineExperienceService } from "../../timeline/application/timeline-experience-service.js";
import type { NotificationExperienceService } from "../../notification/application/notification-experience-service.js";
import type { ProfileExperienceService } from "../../profile/application/profile-experience-service.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeCoordinatorService } from "../../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import type { RuntimeDemoService } from "../../runtime-demo/application/runtime-demo-service.js";
import type { RuntimePreviewService } from "../../runtime-preview/application/runtime-preview-service.js";
import { LAUNCHER_FIXED_TIMESTAMP } from "../domain/runtime-launcher.js";
import { LAUNCH_CHECK_IDS, type LaunchCheck } from "../domain/launch-check.js";
import {
  LAUNCH_MODE_DEFINITIONS,
  type LaunchModeId,
  type LaunchModeView,
  type LaunchReadinessStatus,
} from "../domain/launch-mode.js";
import { buildLaunchReadinessSummary } from "../domain/launch-readiness.js";
import { collectLauncherDependencyValidation } from "./launch-validator.js";

export interface ReadinessEvaluation {
  checks: LaunchCheck[];
  blockers: string[];
  warnings: string[];
  missingItems: string[];
  readiness: ReturnType<typeof buildLaunchReadinessSummary>;
  modes: LaunchModeView[];
}

export interface ReadinessEvaluatorDeps {
  needExperience: NeedExperienceService;
  actionExperience: ActionExperienceService;
  contractExperience: ContractExperienceService;
  chatExperience: ChatExperienceService;
  timelineExperience: TimelineExperienceService;
  notificationExperience: NotificationExperienceService;
  profileExperience: ProfileExperienceService;
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  runtimeCoordinator: RuntimeCoordinatorService;
  runtimeHealth: RuntimeHealthService;
  runtimeDemo: RuntimeDemoService;
  runtimePreview: RuntimePreviewService;
}

const CHECK_META: Record<
  (typeof LAUNCH_CHECK_IDS)[number],
  { label: string; category: LaunchCheck["category"]; delegateModule: string; experienceKey: string }
> = {
  "need-experience": { label: "Need Experience", category: "experience", delegateModule: "CH3-X5", experienceKey: "need" },
  "action-experience": { label: "Action Experience", category: "experience", delegateModule: "CH3-X6", experienceKey: "action" },
  "contract-experience": { label: "Contract Experience", category: "experience", delegateModule: "CH3-X7", experienceKey: "contract" },
  "chat-experience": { label: "Chat Experience", category: "experience", delegateModule: "CH3-X8", experienceKey: "chat" },
  "timeline-experience": { label: "Timeline Experience", category: "experience", delegateModule: "CH3-X9", experienceKey: "timeline" },
  "notification-experience": { label: "Notification Experience", category: "experience", delegateModule: "CH3-X10", experienceKey: "notification" },
  "profile-experience": { label: "Profile Experience", category: "experience", delegateModule: "CH3-X11", experienceKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", category: "runtime", delegateModule: "CH3-X12", experienceKey: "runtime-journey" },
  "runtime-state": { label: "Runtime State", category: "runtime", delegateModule: "CH3-X13", experienceKey: "runtime-state" },
  "runtime-registry": { label: "Runtime Registry", category: "runtime", delegateModule: "CH3-X14", experienceKey: "runtime-registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", category: "runtime", delegateModule: "CH3-X15", experienceKey: "runtime-coordinator" },
  "runtime-health": { label: "Runtime Health", category: "health", delegateModule: "CH3-X16", experienceKey: "runtime-health" },
  "runtime-demo": { label: "Runtime Demo", category: "demo", delegateModule: "CH3-X17", experienceKey: "runtime-demo" },
  "runtime-preview": { label: "Runtime Preview", category: "preview", delegateModule: "CH3-X18", experienceKey: "runtime-preview" },
};

export class ReadinessEvaluator {
  constructor(private readonly deps: ReadinessEvaluatorDeps) {}

  evaluate(authContext: AuthContext): ReadinessEvaluation {
    const deps = collectLauncherDependencyValidation();
    const generatedAt = LAUNCHER_FIXED_TIMESTAMP;
    const input = { generated_at: generatedAt };

    this.deps.runtimeHealth.getHealth(authContext, input);
    this.deps.runtimeDemo.validateRuntime();
    this.deps.runtimePreview.validateRuntime();
    this.deps.runtimeCoordinator.validateRuntime();
    this.deps.runtimeRegistry.validateRuntime();
    this.deps.runtimeState.validateRuntime();
    this.deps.runtimeJourney.validateRuntime();
    this.deps.needExperience.validateRuntime();
    this.deps.actionExperience.validateRuntime();
    this.deps.contractExperience.validateRuntime();
    this.deps.chatExperience.validateRuntime();
    this.deps.timelineExperience.validateRuntime();
    this.deps.notificationExperience.validateRuntime();
    this.deps.profileExperience.validateRuntime();

    const checks = this.buildChecks(deps);
    const blockers = checks.filter((c) => c.status === "failed").map((c) => `${c.label}: ${c.message}`);
    const warnings = checks.filter((c) => c.status === "warning").map((c) => `${c.label}: ${c.message}`);
    const missingItems = blockers;
    const passedChecks = checks.filter((c) => c.status === "passed").length;
    const readiness = buildLaunchReadinessSummary({
      passedChecks,
      totalChecks: checks.length,
      warnings,
      blockers,
    });
    const experienceStatus = Object.fromEntries(
      checks.map((c) => [CHECK_META[c.id as (typeof LAUNCH_CHECK_IDS)[number]]?.experienceKey ?? c.id, c.status === "passed"])
    );
    const modes = LAUNCH_MODE_DEFINITIONS.map((mode) => this.buildModeView(mode.id, mode, experienceStatus, blockers, warnings));

    return { checks, blockers, warnings, missingItems, readiness, modes };
  }

  private buildChecks(deps: ReturnType<typeof collectLauncherDependencyValidation>): LaunchCheck[] {
    const depMap: Record<string, boolean> = {
      need: deps.need,
      action: deps.action,
      contract: deps.contract,
      chat: deps.chat,
      timeline: deps.timeline,
      notification: deps.notification,
      profile: deps.profile,
      "runtime-journey": deps.journey,
      "runtime-state": deps.state,
      "runtime-registry": deps.registry,
      "runtime-coordinator": deps.coordinator,
      "runtime-health": deps.health,
      "runtime-demo": deps.demo,
      "runtime-preview": deps.preview,
    };

    return LAUNCH_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.experienceKey] ?? false;
      return {
        id,
        label: meta.label,
        category: meta.category,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Validation passed" : "Validation failed",
        required: true,
      };
    });
  }

  private buildModeView(
    id: LaunchModeId,
    definition: (typeof LAUNCH_MODE_DEFINITIONS)[number],
    experienceStatus: Record<string, boolean>,
    blockers: string[],
    warnings: string[]
  ): LaunchModeView {
    const missingRequirements = definition.requiredExperiences.filter((exp) => !experienceStatus[exp]);
    const errors = missingRequirements.map((exp) => `Missing requirement: ${exp}`);
    const modeWarnings = id === "production-candidate" && warnings.length > 0 ? [...warnings] : [];
    const enabled = missingRequirements.length === 0 && (id !== "production-candidate" || blockers.length === 0);
    let readinessStatus: LaunchReadinessStatus = "ready";
    if (missingRequirements.length > 0) readinessStatus = "blocked";
    else if (warnings.length > 0) readinessStatus = "partial";
    else if (!enabled) readinessStatus = "pending";

    let recommendedNextStep = "Proceed with selected launch mode.";
    if (missingRequirements.length > 0) {
      recommendedNextStep = `Resolve missing requirements: ${missingRequirements.join(", ")}`;
    } else if (id === "handoff" && blockers.length === 0) {
      recommendedNextStep = "Review handoff summary and share with MVP implementation team.";
    } else if (id === "production-candidate" && warnings.length > 0) {
      recommendedNextStep = "Resolve warnings before production candidate review.";
    } else if (id === "mvp-readiness") {
      recommendedNextStep = "Review MVP readiness percentage and launch checklist.";
    } else if (id === "preview") {
      recommendedNextStep = "Open runtime preview to inspect experiences before execution.";
    } else if (id === "demo") {
      recommendedNextStep = "Start runtime demo to walk through the complete journey.";
    }

    return {
      id,
      title: definition.title,
      description: definition.description,
      enabled,
      readinessStatus,
      requiredExperiences: definition.requiredExperiences,
      missingRequirements,
      warnings: modeWarnings,
      errors,
      recommendedNextStep,
    };
  }
}

export function createReadinessEvaluator(deps: ReadinessEvaluatorDeps): ReadinessEvaluator {
  return new ReadinessEvaluator(deps);
}
