import type { OnboardingStepId } from "../domain/onboarding-schema.js";
import type { OnboardingResponses } from "../domain/onboarding-context.js";

export interface OnboardingUserState {
  userId: string;
  responses: OnboardingResponses;
  completedSteps: OnboardingStepId[];
  currentStep: OnboardingStepId;
  generatedAt: string;
}

const SEED_RESPONSES: OnboardingResponses = {
  account: {
    displayName: "Sample Professional",
    email: "sample@app13.dev",
  },
};

export class LivingOnboardingRepository {
  private readonly store = new Map<string, OnboardingUserState>();

  constructor() {
    this.store.set("seed-onboarding-user", {
      userId: "seed-onboarding-user",
      responses: SEED_RESPONSES,
      completedSteps: ["welcome", "account"],
      currentStep: "iron_verification",
      generatedAt: "2026-06-01T00:00:00.000Z",
    });
  }

  getOrCreate(userId: string): OnboardingUserState {
    const existing = this.store.get(userId);
    if (existing) {
      return { ...existing, responses: { ...existing.responses } };
    }

    const created: OnboardingUserState = {
      userId,
      responses: {},
      completedSteps: [],
      currentStep: "welcome",
      generatedAt: new Date().toISOString(),
    };
    this.store.set(userId, created);
    return { ...created };
  }

  save(
    userId: string,
    input: {
      responses: OnboardingResponses;
      completedSteps: OnboardingStepId[];
      currentStep: OnboardingStepId;
      generatedAt?: string;
    }
  ): OnboardingUserState {
    const updated: OnboardingUserState = {
      userId,
      responses: { ...input.responses },
      completedSteps: [...input.completedSteps],
      currentStep: input.currentStep,
      generatedAt: input.generatedAt ?? new Date().toISOString(),
    };
    this.store.set(userId, updated);
    return { ...updated };
  }

  listAll(): OnboardingUserState[] {
    return [...this.store.values()].map((state) => ({
      ...state,
      responses: { ...state.responses },
      completedSteps: [...state.completedSteps],
    }));
  }
}

let defaultRepository: LivingOnboardingRepository | undefined;

export function createLivingOnboardingRepository(): LivingOnboardingRepository {
  return new LivingOnboardingRepository();
}

export function livingOnboardingRepository(): LivingOnboardingRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingOnboardingRepository();
  }
  return defaultRepository;
}
