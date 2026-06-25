export const LIVING_ONBOARDING_SCHEMA_VERSION = "living-onboarding-v1" as const;

export const ONBOARDING_STEPS = [
  "welcome",
  "account",
  "iron_verification",
  "geographic_intelligence",
  "professional_background",
  "professional_story",
  "smart_questions",
  "professional_calibration",
  "initial_classification",
  "professional_passport",
  "live_frame",
  "personal_home",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_STEP_LABELS: Record<OnboardingStepId, string> = {
  welcome: "Welcome",
  account: "Account",
  iron_verification: "Iron Verification",
  geographic_intelligence: "Geographic Intelligence",
  professional_background: "Professional Background",
  professional_story: "Professional Story",
  smart_questions: "Smart Questions",
  professional_calibration: "Professional Calibration",
  initial_classification: "Initial Classification",
  professional_passport: "Professional Passport",
  live_frame: "Live Frame",
  personal_home: "Personal Home",
};

export const ONBOARDING_STEP_PURPOSES: Record<OnboardingStepId, string> = {
  welcome: "We will build your professional identity.",
  account: "Tell us who you are so we can personalize your journey.",
  iron_verification: "Confirm your identity so the platform can trust you.",
  geographic_intelligence: "Where you work shapes every recommendation we make.",
  professional_background: "Share your skills and experience so we understand your strengths.",
  professional_story: "Help us understand what drives you professionally.",
  smart_questions: "A few quick questions to sharpen your profile.",
  professional_calibration: "Three short missions to calibrate your professional profile.",
  initial_classification: "Your first professional identity, based on everything you shared.",
  professional_passport: "Your professional passport — your identity on APP13.",
  live_frame: "Your live trust frame — how the platform sees your professional standing.",
  personal_home: "Your personalized home — where your professional journey begins.",
};

export const LIVING_ONBOARDING_ROUTES = [
  "/living-onboarding",
  "/living-onboarding/journey",
  "/living-onboarding/steps",
  "/living-onboarding/steps/:stepId",
  "/living-onboarding/classification",
  "/living-onboarding/passport",
  "/living-onboarding/live-frame",
  "/living-onboarding/home",
  "/living-onboarding/complete",
  "/living-onboarding/refresh",
  "/living-onboarding/statistics",
] as const;

export const LIVING_ONBOARDING_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-onboarding-v1.json",
  title: "OnboardingJourney",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_ONBOARDING_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const CONFIDENCE_LEVELS = ["low", "moderate", "high", "very_high"] as const;

export const PROFESSIONAL_RANKS = ["starter", "rising", "established", "advanced"] as const;

export const SMART_QUESTION_IDS = [
  "enjoyed_action",
  "requested_action",
  "master_action",
  "enjoys_leading",
  "prefers_alone",
  "enjoys_teaching",
  "enjoys_consulting",
  "enjoys_building",
  "enjoys_reviewing",
] as const;

export const CALIBRATION_MISSION_IDS = [
  "strongest_skill",
  "learning_ability",
  "professional_behavior",
] as const;

export const WELCOME_HEADLINE = "We will build your professional identity.";
