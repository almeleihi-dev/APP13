export type ActionProfileSourceType =
  | "provider_profile"
  | "experience"
  | "cv"
  | "manual";

export interface ActionCapability {
  actionCode: string;
  actionName: string;
  confidence: number;
  experienceWeight: number;
}

export interface ActionProfile {
  providerId: string;
  sourceType: ActionProfileSourceType;
  sourceReference: string;
  actions: ActionCapability[];
  generatedAt: Date;
}

export interface ActionProfileMatchingSignals {
  providerId: string;
  actionCodes: string[];
  actionConfidences: Record<string, number>;
  averageConfidence: number;
}

export interface DecomposedTaskAction {
  actionCode: string;
  actionName: string;
  sequenceOrder: number;
}

export interface TaskDecomposition {
  taskDescription: string;
  actions: DecomposedTaskAction[];
}

export function toMatchingSignals(profile: ActionProfile): ActionProfileMatchingSignals {
  const actionConfidences: Record<string, number> = {};
  for (const action of profile.actions) {
    actionConfidences[action.actionCode] = action.confidence;
  }

  const averageConfidence =
    profile.actions.length === 0
      ? 0
      : Math.round(
          profile.actions.reduce((sum, action) => sum + action.confidence, 0) /
            profile.actions.length
        );

  return {
    providerId: profile.providerId,
    actionCodes: profile.actions.map((action) => action.actionCode),
    actionConfidences,
    averageConfidence,
  };
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateActionConfidence(input: {
  keywordMatchStrength: number;
  yearsExperience?: number;
  completedContracts?: number;
  certifications?: string[];
  previousActionCodes?: string[];
  actionCode: string;
}): number {
  const keywordComponent = clampConfidence(input.keywordMatchStrength * 35);
  const experienceYears = Math.max(0, input.yearsExperience ?? 0);
  const completedContracts = Math.max(0, input.completedContracts ?? 0);
  const certificationCount = input.certifications?.length ?? 0;
  const hasPriorAction = (input.previousActionCodes ?? []).includes(input.actionCode);

  const experienceComponent = Math.min(20, experienceYears * 2);
  const contractComponent = Math.min(20, completedContracts * 4);
  const certificationComponent = Math.min(10, certificationCount * 5);
  const historyComponent = hasPriorAction ? 15 : 0;

  return clampConfidence(
    10 +
      keywordComponent +
      experienceComponent +
      contractComponent +
      certificationComponent +
      historyComponent
  );
}

export function calculateExperienceWeight(confidence: number, yearsExperience = 0): number {
  return clampConfidence(confidence * 0.7 + Math.min(yearsExperience, 10) * 3);
}
