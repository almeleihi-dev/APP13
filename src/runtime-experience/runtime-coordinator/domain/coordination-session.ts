import type { CoordinatorDelegationTarget } from "./runtime-coordinator.js";

export interface CoordinationSession {
  userId: string;
  lastPlanId?: string;
  lastActiveExperience?: CoordinatorDelegationTarget;
  generatedAt: string;
}
