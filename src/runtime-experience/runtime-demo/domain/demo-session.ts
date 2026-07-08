import type { DemoPlaybackStatus } from "./runtime-demo.js";
import type { DemoScenarioId } from "./demo-scenario.js";

export interface DemoSession {
  userId: string;
  sessionId: string;
  scenarioId?: DemoScenarioId;
  status: DemoPlaybackStatus;
  currentStepIndex: number;
  stepIndices: number[];
  generatedAt: string;
  startedAt?: string;
  pausedAt?: string;
}

export function createDemoSession(userId: string, generatedAt: string): DemoSession {
  return {
    userId,
    sessionId: `demo-${userId.slice(-8)}-${Date.now()}`,
    status: "idle",
    currentStepIndex: 0,
    stepIndices: [],
    generatedAt,
  };
}
