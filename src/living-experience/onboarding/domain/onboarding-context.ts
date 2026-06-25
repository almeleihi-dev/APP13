import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingStepId } from "./onboarding-schema.js";
import { ONBOARDING_STEPS } from "./onboarding-schema.js";

export interface AccountData {
  displayName: string;
  email: string;
  phone?: string;
  preferredLanguage?: string;
}

export interface IronVerificationData {
  identityConfirmed: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  governmentVerificationStatus: "not_started" | "pending" | "verified";
}

export interface GeographicIntelligenceData {
  country: string;
  city: string;
  preferredWorkRegion: string;
  languages: string[];
  currency: string;
  legalEnvironment: string;
  professionalRegulations: string[];
  futureCountryTarget?: string;
}

export interface ProfessionalBackgroundData {
  skills: string[];
  certificates: string[];
  licenses: string[];
  experienceYears: number;
  industries: string[];
  favoriteActivities: string[];
}

export interface ProfessionalStoryData {
  proudestAchievement: string;
  careerChangingProject: string;
  preferredWorkType: string;
}

export interface SmartQuestionsData {
  enjoyedAction: string;
  requestedAction: string;
  masterAction: string;
  enjoysLeading: boolean;
  prefersAlone: boolean;
  enjoysTeaching: boolean;
  enjoysConsulting: boolean;
  enjoysBuilding: boolean;
  enjoysReviewing: boolean;
}

export interface CalibrationMissionResult {
  missionId: string;
  response: string;
  score: number;
}

export interface ProfessionalCalibrationData {
  missions: CalibrationMissionResult[];
}

export interface OnboardingResponses {
  account?: AccountData;
  ironVerification?: IronVerificationData;
  geographicIntelligence?: GeographicIntelligenceData;
  professionalBackground?: ProfessionalBackgroundData;
  professionalStory?: ProfessionalStoryData;
  smartQuestions?: SmartQuestionsData;
  professionalCalibration?: ProfessionalCalibrationData;
}

export interface OnboardingContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  responses: OnboardingResponses;
  generatedAt: string;
}

export function buildOnboardingContext(input: {
  authContext: AuthContext;
  responses?: OnboardingResponses;
  completedSteps?: OnboardingStepId[];
  currentStep?: OnboardingStepId;
  generatedAt?: string;
}): OnboardingContext {
  const responses = input.responses ?? {};
  const completedSteps = input.completedSteps ?? [];
  const displayName =
    responses.account?.displayName ??
    `Professional ${input.authContext.userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`;

  return {
    userId: input.authContext.userId,
    roles: [...input.authContext.roles],
    tier: input.authContext.tier,
    displayName,
    currentStep: input.currentStep ?? resolveCurrentStep(completedSteps),
    completedSteps: [...completedSteps],
    responses,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}

export function resolveCurrentStep(completedSteps: OnboardingStepId[]): OnboardingStepId {
  for (const step of ONBOARDING_STEPS) {
    if (!completedSteps.includes(step)) {
      return step;
    }
  }
  return "personal_home";
}

export function collectOnboardingIntelligencePaths(context: OnboardingContext): string[] {
  const paths: string[] = [];
  if (context.responses.geographicIntelligence) {
    paths.push("geography://region", "geography://languages", "geography://currency");
  }
  if (context.responses.professionalBackground) {
    paths.push("background://skills", "background://industries");
  }
  if (context.responses.smartQuestions) {
    paths.push("preferences://actions", "preferences://work_style");
  }
  if (context.responses.professionalCalibration) {
    paths.push("calibration://missions");
  }
  return paths;
}
