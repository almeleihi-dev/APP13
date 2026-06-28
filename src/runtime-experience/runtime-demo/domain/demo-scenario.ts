import { RUNTIME_JOURNEY_STEPS } from "../../runtime-journey/domain/runtime-step.js";
import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";

export const DEMO_SCENARIO_IDS = [
  "first-user-journey",
  "need-journey",
  "action-journey",
  "contract-journey",
  "chat-journey",
  "timeline-journey",
  "notification-journey",
  "profile-journey",
  "full-runtime-journey",
  "return-journey",
] as const;

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number];

export type DemoRuntimeMode = "Need" | "Action" | "Transition" | "Shared" | "Orchestration";

export interface DemoScenario {
  id: DemoScenarioId;
  title: string;
  description: string;
  runtimeMode: DemoRuntimeMode;
  entryScreen: string;
  entryRoute: string;
  entryStepId: RuntimeStepId;
  stepIndices: number[];
  expectedDestination: string;
  readiness: "ready" | "degraded" | "unavailable";
  validationStatus: "valid" | "invalid" | "unknown";
}

function steps(...indices: number[]): number[] {
  return indices;
}

function modeForStep(stepId: RuntimeStepId): DemoRuntimeMode {
  const step = RUNTIME_JOURNEY_STEPS.find((s) => s.id === stepId);
  if (!step) return "Orchestration";
  if (step.phase === "transition" || step.phase === "return") return "Transition";
  if (step.phase === "need" || step.phase === "launch") return "Need";
  if (step.phase === "shared") return "Shared";
  return "Action";
}

function buildScenario(input: {
  id: DemoScenarioId;
  title: string;
  description: string;
  stepIndices: number[];
  expectedDestination: string;
}): DemoScenario {
  const firstIndex = input.stepIndices[0] ?? 0;
  const entryStep = RUNTIME_JOURNEY_STEPS[firstIndex]!;
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    runtimeMode: modeForStep(entryStep.id),
    entryScreen: entryStep.screenId ?? entryStep.id,
    entryRoute: entryStep.route,
    entryStepId: entryStep.id,
    stepIndices: input.stepIndices,
    expectedDestination: input.expectedDestination,
    readiness: "ready",
    validationStatus: "valid",
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  buildScenario({
    id: "first-user-journey",
    title: "First User Journey",
    description: "Complete first-time user demonstration from launch through profile.",
    stepIndices: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11),
    expectedDestination: "/profile/home",
  }),
  buildScenario({
    id: "need-journey",
    title: "Need Journey",
    description: "Demonstrates need mode from launch through official transition.",
    stepIndices: steps(0, 1, 2, 3, 4, 5),
    expectedDestination: "/system/transition",
  }),
  buildScenario({
    id: "action-journey",
    title: "Action Journey",
    description: "Demonstrates action mode from action home through completion.",
    stepIndices: steps(6, 12),
    expectedDestination: "/action/completion",
  }),
  buildScenario({
    id: "contract-journey",
    title: "Contract Journey",
    description: "Demonstrates contract experience within the runtime journey.",
    stepIndices: steps(7),
    expectedDestination: "/contract/home",
  }),
  buildScenario({
    id: "chat-journey",
    title: "Chat Journey",
    description: "Demonstrates chat experience handoff from contract.",
    stepIndices: steps(8),
    expectedDestination: "/chat/home",
  }),
  buildScenario({
    id: "timeline-journey",
    title: "Timeline Journey",
    description: "Demonstrates timeline experience in shared mode.",
    stepIndices: steps(9),
    expectedDestination: "/timeline/home",
  }),
  buildScenario({
    id: "notification-journey",
    title: "Notification Journey",
    description: "Demonstrates notification experience in shared mode.",
    stepIndices: steps(10),
    expectedDestination: "/notification/home",
  }),
  buildScenario({
    id: "profile-journey",
    title: "Profile Journey",
    description: "Demonstrates profile experience in shared mode.",
    stepIndices: steps(11),
    expectedDestination: "/profile/home",
  }),
  buildScenario({
    id: "full-runtime-journey",
    title: "Full Runtime Journey",
    description: "Complete deterministic runtime journey including return.",
    stepIndices: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14),
    expectedDestination: "/need/home",
  }),
  buildScenario({
    id: "return-journey",
    title: "Return Journey",
    description: "Demonstrates completion, return transition, and need home return.",
    stepIndices: steps(12, 13, 14),
    expectedDestination: "/need/home",
  }),
];

export function getDemoScenario(id: DemoScenarioId): DemoScenario {
  const scenario = DEMO_SCENARIOS.find((s) => s.id === id);
  if (!scenario) throw new Error(`Unknown demo scenario: ${id}`);
  return scenario;
}

export function isDemoScenarioId(value: string): value is DemoScenarioId {
  return DEMO_SCENARIO_IDS.includes(value as DemoScenarioId);
}

export function scenarioProgress(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 1) return totalSteps === 1 ? 100 : 0;
  return Math.round((currentIndex / (totalSteps - 1)) * 100);
}
