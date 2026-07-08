import type { OnboardingStepId } from "./onboarding-schema.js";
import {
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEP_PURPOSES,
  ONBOARDING_STEPS,
  WELCOME_HEADLINE,
} from "./onboarding-schema.js";
import type { OnboardingContext, OnboardingResponses } from "./onboarding-context.js";

export type StepStatus = "pending" | "active" | "completed";

export interface OnboardingStepDefinition {
  stepId: OnboardingStepId;
  order: number;
  label: string;
  purpose: string;
  status: StepStatus;
  onePurposeOnly: true;
}

export interface OnboardingJourney {
  userId: string;
  headline: string;
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  totalSteps: number;
  progressPercent: number;
  steps: OnboardingStepDefinition[];
  onboardingComplete: boolean;
  generatedAt: string;
}

export interface OnboardingValidation {
  valid: boolean;
  stepReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface OnboardingStatistics {
  totalUsers: number;
  completedJourneys: number;
  averageProgressPercent: number;
  stepCompletionRates: Record<OnboardingStepId, number>;
  generatedAt: string;
}

export function buildOnboardingJourney(context: OnboardingContext): OnboardingJourney {
  const completed = new Set(context.completedSteps);
  const steps = ONBOARDING_STEPS.map((stepId, index) => ({
    stepId,
    order: index + 1,
    label: ONBOARDING_STEP_LABELS[stepId],
    purpose: ONBOARDING_STEP_PURPOSES[stepId],
    status: resolveStepStatus(stepId, context.currentStep, completed),
    onePurposeOnly: true as const,
  }));

  const dataSteps = ONBOARDING_STEPS.filter((s) => s !== "welcome");
  const dataCompleted = dataSteps.filter((s) => completed.has(s)).length;
  const progressPercent = Math.round((dataCompleted / dataSteps.length) * 100);
  const onboardingComplete = completed.has("personal_home");

  return {
    userId: context.userId,
    headline: onboardingComplete
      ? "Your professional home is ready."
      : WELCOME_HEADLINE,
    currentStep: context.currentStep,
    completedSteps: [...context.completedSteps],
    totalSteps: ONBOARDING_STEPS.length,
    progressPercent,
    steps,
    onboardingComplete,
    generatedAt: context.generatedAt,
  };
}

function resolveStepStatus(
  stepId: OnboardingStepId,
  currentStep: OnboardingStepId,
  completed: Set<OnboardingStepId>
): StepStatus {
  if (completed.has(stepId)) {
    return "completed";
  }
  if (stepId === currentStep) {
    return "active";
  }
  return "pending";
}

export function validateStepSubmission(
  stepId: OnboardingStepId,
  payload: unknown
): OnboardingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (stepId) {
    case "welcome":
      break;
    case "account":
      validateAccount(payload, errors);
      break;
    case "iron_verification":
      validateIronVerification(payload, errors);
      break;
    case "geographic_intelligence":
      validateGeographic(payload, errors);
      break;
    case "professional_background":
      validateBackground(payload, errors, warnings);
      break;
    case "professional_story":
      validateStory(payload, errors);
      break;
    case "smart_questions":
      validateSmartQuestions(payload, errors);
      break;
    case "professional_calibration":
      validateCalibration(payload, errors);
      break;
    default:
      break;
  }

  return {
    valid: errors.length === 0,
    stepReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? `Step ${stepId} is ready.`
        : `Step ${stepId} needs attention: ${errors.join("; ")}`,
  };
}

function validateAccount(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  if (!data.display_name || typeof data.display_name !== "string") {
    errors.push("display_name is required");
  }
  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }
}

function validateIronVerification(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  if (data.identity_confirmed !== true) {
    errors.push("identity must be confirmed");
  }
  if (data.email_verified !== true) {
    errors.push("email must be verified");
  }
}

function validateGeographic(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  for (const field of ["country", "city", "preferred_work_region", "currency", "legal_environment"]) {
    if (!data[field] || typeof data[field] !== "string") {
      errors.push(`${field} is required`);
    }
  }
  if (!Array.isArray(data.languages) || data.languages.length === 0) {
    errors.push("at least one language is required");
  }
}

function validateBackground(payload: unknown, errors: string[], warnings: string[]) {
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push("at least one skill is required");
  }
  if (!Array.isArray(data.industries) || data.industries.length === 0) {
    warnings.push("industries help improve recommendations");
  }
}

function validateStory(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  for (const field of ["proudest_achievement", "career_changing_project", "preferred_work_type"]) {
    if (!data[field] || typeof data[field] !== "string" || (data[field] as string).length < 10) {
      errors.push(`${field} should be at least 10 characters`);
    }
  }
}

function validateSmartQuestions(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  for (const field of ["enjoyed_action", "requested_action", "master_action"]) {
    if (!data[field] || typeof data[field] !== "string") {
      errors.push(`${field} is required`);
    }
  }
}

function validateCalibration(payload: unknown, errors: string[]) {
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.missions) || data.missions.length < 3) {
    errors.push("all three calibration missions are required");
  }
}

export function mergeStepResponse(
  responses: OnboardingResponses,
  stepId: OnboardingStepId,
  payload: Record<string, unknown>
): OnboardingResponses {
  const next = { ...responses };
  switch (stepId) {
    case "account":
      next.account = {
        displayName: String(payload.display_name),
        email: String(payload.email),
        phone: payload.phone ? String(payload.phone) : undefined,
        preferredLanguage: payload.preferred_language ? String(payload.preferred_language) : undefined,
      };
      break;
    case "iron_verification":
      next.ironVerification = {
        identityConfirmed: payload.identity_confirmed === true,
        phoneVerified: payload.phone_verified === true,
        emailVerified: payload.email_verified === true,
        governmentVerificationStatus:
          (payload.government_verification_status as "not_started" | "pending" | "verified") ??
          "not_started",
      };
      break;
    case "geographic_intelligence":
      next.geographicIntelligence = {
        country: String(payload.country),
        city: String(payload.city),
        preferredWorkRegion: String(payload.preferred_work_region),
        languages: (payload.languages as string[]) ?? [],
        currency: String(payload.currency),
        legalEnvironment: String(payload.legal_environment),
        professionalRegulations: (payload.professional_regulations as string[]) ?? [],
        futureCountryTarget: payload.future_country_target
          ? String(payload.future_country_target)
          : undefined,
      };
      break;
    case "professional_background":
      next.professionalBackground = {
        skills: (payload.skills as string[]) ?? [],
        certificates: (payload.certificates as string[]) ?? [],
        licenses: (payload.licenses as string[]) ?? [],
        experienceYears: Number(payload.experience_years ?? 0),
        industries: (payload.industries as string[]) ?? [],
        favoriteActivities: (payload.favorite_activities as string[]) ?? [],
      };
      break;
    case "professional_story":
      next.professionalStory = {
        proudestAchievement: String(payload.proudest_achievement),
        careerChangingProject: String(payload.career_changing_project),
        preferredWorkType: String(payload.preferred_work_type),
      };
      break;
    case "smart_questions":
      next.smartQuestions = {
        enjoyedAction: String(payload.enjoyed_action),
        requestedAction: String(payload.requested_action),
        masterAction: String(payload.master_action),
        enjoysLeading: payload.enjoys_leading === true,
        prefersAlone: payload.prefers_alone === true,
        enjoysTeaching: payload.enjoys_teaching === true,
        enjoysConsulting: payload.enjoys_consulting === true,
        enjoysBuilding: payload.enjoys_building === true,
        enjoysReviewing: payload.enjoys_reviewing === true,
      };
      break;
    case "professional_calibration":
      next.professionalCalibration = {
        missions: ((payload.missions as Array<{ mission_id: string; response: string; score: number }>) ?? []).map(
          (m) => ({
            missionId: m.mission_id,
            response: m.response,
            score: m.score,
          })
        ),
      };
      break;
    default:
      break;
  }
  return next;
}

export function buildOnboardingStatistics(
  journeys: OnboardingJourney[]
): OnboardingStatistics {
  const totalUsers = journeys.length;
  const completedJourneys = journeys.filter((j) => j.onboardingComplete).length;
  const averageProgressPercent =
    totalUsers === 0
      ? 0
      : Math.round(journeys.reduce((sum, j) => sum + j.progressPercent, 0) / totalUsers);

  const stepCompletionRates = {} as Record<OnboardingStepId, number>;
  for (const step of ONBOARDING_STEPS) {
    const count = journeys.filter((j) => j.completedSteps.includes(step)).length;
    stepCompletionRates[step] = totalUsers === 0 ? 0 : Math.round((count / totalUsers) * 100);
  }

  return {
    totalUsers,
    completedJourneys,
    averageProgressPercent,
    stepCompletionRates,
    generatedAt: new Date().toISOString(),
  };
}

export function toOnboardingJourneyView(journey: OnboardingJourney) {
  return {
    schema_version: "living-onboarding-v1",
    user_id: journey.userId,
    headline: journey.headline,
    current_step: journey.currentStep,
    completed_steps: journey.completedSteps,
    total_steps: journey.totalSteps,
    progress_percent: journey.progressPercent,
    steps: journey.steps.map((s) => ({
      step_id: s.stepId,
      order: s.order,
      label: s.label,
      purpose: s.purpose,
      status: s.status,
      one_purpose_only: s.onePurposeOnly,
    })),
    onboarding_complete: journey.onboardingComplete,
    generated_at: journey.generatedAt,
    read_only: false,
    experience_only: true,
  };
}

export function toOnboardingStatisticsView(stats: OnboardingStatistics) {
  return {
    schema_version: "living-onboarding-v1",
    total_users: stats.totalUsers,
    completed_journeys: stats.completedJourneys,
    average_progress_percent: stats.averageProgressPercent,
    step_completion_rates: stats.stepCompletionRates,
    generated_at: stats.generatedAt,
    read_only: true,
  };
}
