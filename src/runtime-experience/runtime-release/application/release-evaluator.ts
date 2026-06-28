import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimePreviewService } from "../../runtime-preview/application/runtime-preview-service.js";
import type { RuntimeDemoService } from "../../runtime-demo/application/runtime-demo-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import type { RuntimeCoordinatorService } from "../../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeJourneyService } from "../../runtime-journey/application/runtime-journey-service.js";
import type { NeedExperienceService } from "../../need/application/need-experience-service.js";
import type { ActionExperienceService } from "../../action/application/action-experience-service.js";
import type { ContractExperienceService } from "../../contract/application/contract-experience-service.js";
import type { ChatExperienceService } from "../../chat/application/chat-experience-service.js";
import type { TimelineExperienceService } from "../../timeline/application/timeline-experience-service.js";
import type { NotificationExperienceService } from "../../notification/application/notification-experience-service.js";
import type { ProfileExperienceService } from "../../profile/application/profile-experience-service.js";
import { RELEASE_FIXED_TIMESTAMP } from "../domain/runtime-release.js";
import {
  RELEASE_CHECK_IDS,
  KNOWN_RELEASE_LIMITATIONS,
  type ReleaseCheckItem,
  type ReleaseReport,
} from "../domain/release-report.js";
import { buildReleaseReadiness } from "../domain/release-readiness.js";
import {
  buildReleaseCandidate,
  resolveReleaseCandidateDecision,
} from "../domain/release-candidate.js";
import { buildReleaseSummary, type ReleaseSummary } from "../domain/release-summary.js";
import { collectReleaseDependencyValidation } from "./release-validator.js";

export interface ReleaseEvaluation {
  report: ReleaseReport;
  summary: ReleaseSummary;
  candidate: ReturnType<typeof buildReleaseCandidate>;
  checklist: ReleaseCheckItem[];
}

export interface ReleaseEvaluatorDeps {
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
  runtimeLauncher: RuntimeLauncherService;
}

const CHECK_META: Record<
  (typeof RELEASE_CHECK_IDS)[number],
  { label: string; delegateModule: string; depKey: string }
> = {
  "need-experience": { label: "Need Experience", delegateModule: "CH3-X5", depKey: "need" },
  "action-experience": { label: "Action Experience", delegateModule: "CH3-X6", depKey: "action" },
  "contract-experience": { label: "Contract Experience", delegateModule: "CH3-X7", depKey: "contract" },
  "chat-experience": { label: "Chat Experience", delegateModule: "CH3-X8", depKey: "chat" },
  "timeline-experience": { label: "Timeline Experience", delegateModule: "CH3-X9", depKey: "timeline" },
  "notification-experience": { label: "Notification Experience", delegateModule: "CH3-X10", depKey: "notification" },
  "profile-experience": { label: "Profile Experience", delegateModule: "CH3-X11", depKey: "profile" },
  "runtime-journey": { label: "Runtime Journey", delegateModule: "CH3-X12", depKey: "journey" },
  "runtime-state": { label: "Runtime State", delegateModule: "CH3-X13", depKey: "state" },
  "runtime-registry": { label: "Runtime Registry", delegateModule: "CH3-X14", depKey: "registry" },
  "runtime-coordinator": { label: "Runtime Coordinator", delegateModule: "CH3-X15", depKey: "coordinator" },
  "runtime-health": { label: "Runtime Health", delegateModule: "CH3-X16", depKey: "health" },
  "runtime-demo": { label: "Runtime Demo", delegateModule: "CH3-X17", depKey: "demo" },
  "runtime-preview": { label: "Runtime Preview", delegateModule: "CH3-X18", depKey: "preview" },
  "runtime-launcher": { label: "Runtime Launcher", delegateModule: "CH3-X19", depKey: "launcher" },
};

export class ReleaseEvaluator {
  constructor(private readonly deps: ReleaseEvaluatorDeps) {}

  evaluate(authContext: AuthContext): ReleaseEvaluation {
    const generatedAt = RELEASE_FIXED_TIMESTAMP;
    const input = { generated_at: generatedAt };

    this.deps.runtimeLauncher.refresh(authContext);
    this.deps.runtimeLauncher.getReadiness(authContext);
    this.deps.runtimeLauncher.getChecklist(authContext);
    this.deps.runtimePreview.validateRuntime();
    this.deps.runtimeDemo.validateRuntime();
    this.deps.runtimeHealth.getHealth(authContext, input);
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

    const deps = collectReleaseDependencyValidation();
    const launcherBlockers = this.deps.runtimeLauncher.getBlockers(authContext);
    const launcherWarnings = this.deps.runtimeLauncher.getWarnings(authContext);

    const checklist = this.buildChecklist(deps);
    const blockers = [
      ...checklist.filter((c) => c.status === "failed").map((c) => `${c.label}: ${c.message}`),
      ...launcherBlockers.blockers,
    ];
    const warnings = [
      ...checklist.filter((c) => c.status === "warning").map((c) => `${c.label}: ${c.message}`),
      ...launcherWarnings.warnings,
    ];
    const passedChecks = checklist.filter((c) => c.status === "passed").length;
    const readiness = buildReleaseReadiness({
      passedChecks,
      totalChecks: checklist.length,
      warnings,
      blockers,
    });
    const candidateDecision = resolveReleaseCandidateDecision(readiness.qualityScore, blockers, warnings);
    const candidate = buildReleaseCandidate({
      decision: candidateDecision,
      qualityScore: readiness.qualityScore,
      readinessPercentage: readiness.readinessPercentage,
      blockers,
      warnings,
      generatedAt,
    });
    const recommendations = this.buildRecommendations(blockers, warnings, candidateDecision);
    const report: ReleaseReport = {
      generatedAt,
      readiness,
      checks: checklist,
      blockers,
      warnings,
      recommendations,
      knownLimitations: [...KNOWN_RELEASE_LIMITATIONS],
      candidateDecision,
      readOnly: true,
      noReleaseExecution: true,
    };
    const summary = buildReleaseSummary({
      candidate,
      readiness,
      recommendations,
      knownLimitations: KNOWN_RELEASE_LIMITATIONS,
    });

    return { report, summary, candidate, checklist };
  }

  private buildChecklist(deps: ReturnType<typeof collectReleaseDependencyValidation>): ReleaseCheckItem[] {
    const depMap: Record<string, boolean> = {
      need: deps.need,
      action: deps.action,
      contract: deps.contract,
      chat: deps.chat,
      timeline: deps.timeline,
      notification: deps.notification,
      profile: deps.profile,
      journey: deps.journey,
      state: deps.state,
      registry: deps.registry,
      coordinator: deps.coordinator,
      health: deps.health,
      demo: deps.demo,
      preview: deps.preview,
      launcher: deps.launcher,
    };

    return RELEASE_CHECK_IDS.map((id) => {
      const meta = CHECK_META[id];
      const passed = depMap[meta.depKey] ?? false;
      return {
        id,
        label: meta.label,
        delegateModule: meta.delegateModule,
        status: passed ? ("passed" as const) : ("failed" as const),
        message: passed ? "Validation passed" : "Validation failed",
        required: true,
      };
    });
  }

  private buildRecommendations(
    blockers: string[],
    warnings: string[],
    decision: ReturnType<typeof resolveReleaseCandidateDecision>
  ): string[] {
    if (decision === "certified") {
      return ["Proceed to MVP implementation handoff with certified release candidate."];
    }
    if (blockers.length > 0) {
      return [`Resolve blockers before certification: ${blockers.slice(0, 3).join("; ")}`];
    }
    if (warnings.length > 0) {
      return [`Address warnings before production candidate review: ${warnings.slice(0, 3).join("; ")}`];
    }
    return ["Complete remaining runtime checks to achieve certification."];
  }
}

export function createReleaseEvaluator(deps: ReleaseEvaluatorDeps): ReleaseEvaluator {
  return new ReleaseEvaluator(deps);
}
