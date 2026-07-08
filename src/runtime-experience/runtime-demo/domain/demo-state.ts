import type { DemoPlaybackStatus } from "./runtime-demo.js";
import type { DemoScenarioId } from "./demo-scenario.js";

export interface DemoState {
  scenarioId?: DemoScenarioId;
  status: DemoPlaybackStatus;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  currentStepId?: string;
  currentRoute?: string;
  currentExperience?: string;
  lifecyclePhase?: string;
  transitionInProgress: boolean;
}

export function createInitialDemoState(): DemoState {
  return {
    status: "idle",
    currentStepIndex: 0,
    totalSteps: 0,
    progress: 0,
    transitionInProgress: false,
  };
}
