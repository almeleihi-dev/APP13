import type { OnboardingContext } from "./onboarding-context.js";
import {
  buildInitialClassification,
  resolveProfessionalRank,
  type InitialClassification,
} from "./onboarding-classification.js";

export interface OnboardingPassport {
  userId: string;
  professionalId: string;
  displayName: string;
  verifiedSkills: string[];
  unlockedActions: string[];
  professionalRank: string;
  passportLevel: string;
  headline: string;
  summary: string;
  generatedAt: string;
}

export interface OnboardingLiveFrame {
  userId: string;
  displayName: string;
  trustScore: number;
  tier: string;
  tierLabel: string;
  badgeLabel: string;
  headline: string;
  explanation: string;
  progressPercent: number;
  generatedAt: string;
}

export interface PersonalHomeSection {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  routeHint: string;
}

export interface OnboardingPersonalHome {
  userId: string;
  headline: string;
  todaysBestStep: PersonalHomeSection;
  professionalPassport: PersonalHomeSection;
  liveFrame: PersonalHomeSection;
  developMe: PersonalHomeSection;
  learnByAction: PersonalHomeSection;
  bestOpportunity: PersonalHomeSection;
  professionalJourney: PersonalHomeSection;
  generatedAt: string;
}

export interface EngineFeedContribution {
  engineId: string;
  contributed: boolean;
  summary: string;
  headline?: string;
}

function resolveUnlockedActions(context: OnboardingContext): string[] {
  const sq = context.responses.smartQuestions;
  const skills = context.responses.professionalBackground?.skills ?? [];
  const actions = new Set<string>();
  if (sq?.enjoyedAction) actions.add(sq.enjoyedAction);
  if (sq?.requestedAction) actions.add(sq.requestedAction);
  skills.slice(0, 3).forEach((s) => actions.add(s.replace(/ /g, "_")));
  if (actions.size === 0) {
    actions.add("general_professional_services");
  }
  return [...actions].slice(0, 5);
}

function resolvePassportLevel(readiness: number): string {
  if (readiness >= 75) return "silver";
  if (readiness >= 55) return "bronze";
  return "starter";
}

export function buildOnboardingPassport(
  context: OnboardingContext,
  classification: InitialClassification
): OnboardingPassport {
  const bg = context.responses.professionalBackground;
  const verifiedSkills = [...(bg?.skills ?? []), ...(bg?.certificates ?? [])].slice(0, 8);
  const rank = resolveProfessionalRank(context);
  const level = resolvePassportLevel(classification.professionalReadiness);

  return {
    userId: context.userId,
    professionalId: `prof://${context.userId}`,
    displayName: context.displayName,
    verifiedSkills,
    unlockedActions: resolveUnlockedActions(context),
    professionalRank: rank,
    passportLevel: level,
    headline: "Your first professional passport",
    summary: `${context.displayName} — ${classification.professionalIdentity}`,
    generatedAt: context.generatedAt,
  };
}

export function buildOnboardingLiveFrame(
  context: OnboardingContext,
  classification: InitialClassification
): OnboardingLiveFrame {
  const baseScore = Math.min(85, 35 + classification.professionalReadiness * 0.4);
  const iron = context.responses.ironVerification;
  let trustScore = baseScore;
  if (iron?.identityConfirmed) trustScore += 5;
  if (iron?.emailVerified) trustScore += 3;
  trustScore = Math.round(Math.min(100, trustScore));

  let tier = "STANDARD";
  let tierLabel = "Standard";
  if (trustScore >= 70) {
    tier = "TRUSTED";
    tierLabel = "Trusted";
  } else if (trustScore >= 55) {
    tier = "EMERALD_PRO";
    tierLabel = "Emerald Pro";
  }

  return {
    userId: context.userId,
    displayName: context.displayName,
    trustScore,
    tier,
    tierLabel,
    badgeLabel: "New Professional",
    headline: "Your first Live Frame",
    explanation:
      "Your Live Frame reflects your verified identity, professional background, and calibration results. It will grow as you complete work on APP13.",
    progressPercent: Math.min(100, Math.round(trustScore * 0.8)),
    generatedAt: context.generatedAt,
  };
}

export function buildOnboardingPersonalHome(
  context: OnboardingContext,
  classification: InitialClassification,
  engineFeeds: EngineFeedContribution[]
): OnboardingPersonalHome {
  const growthStep = classification.recommendedGrowthPath[0] ?? "Complete your professional profile";
  const developFeed = engineFeeds.find((e) => e.engineId === "develop_me");
  const learnFeed = engineFeeds.find((e) => e.engineId === "learn_by_action");
  const opportunityFeed = engineFeeds.find((e) => e.engineId === "personal_assistant");

  return {
    userId: context.userId,
    headline: `Welcome home, ${context.displayName.split(" ")[0] || "Professional"}.`,
    todaysBestStep: {
      sectionId: "todays_best_step",
      title: "Today's Best Step",
      headline: growthStep,
      description: "Your most impactful next move, based on your onboarding.",
      routeHint: "/develop-me",
    },
    professionalPassport: {
      sectionId: "professional_passport",
      title: "Professional Passport",
      headline: classification.professionalIdentity,
      description: "Your verified professional identity on APP13.",
      routeHint: "/professional-passport",
    },
    liveFrame: {
      sectionId: "live_frame",
      title: "Live Frame",
      headline: "Your trust frame is active",
      description: "See how your professional standing evolves over time.",
      routeHint: "/live-frame",
    },
    developMe: {
      sectionId: "develop_me",
      title: "Develop Me",
      headline: developFeed?.headline ?? "Your growth roadmap is ready",
      description: developFeed?.summary ?? "Personalized development guidance awaits.",
      routeHint: "/develop-me",
    },
    learnByAction: {
      sectionId: "learn_by_action",
      title: "Learn by Action",
      headline: learnFeed?.headline ?? "Learn through real professional actions",
      description: learnFeed?.summary ?? "Hands-on learning paths matched to your profile.",
      routeHint: "/learn-by-action",
    },
    bestOpportunity: {
      sectionId: "best_opportunity",
      title: "Best Opportunity",
      headline: opportunityFeed?.headline ?? classification.recommendedGrowthPath[0] ?? "Explore opportunities",
      description: opportunityFeed?.summary ?? "Curated opportunities based on your profile.",
      routeHint: "/personal-assistant/opportunities",
    },
    professionalJourney: {
      sectionId: "professional_journey",
      title: "Professional Journey",
      headline: classification.professionalPotential.replace(/_/g, " "),
      description: `Confidence: ${classification.confidence}. ${classification.reasoning[0] ?? ""}`,
      routeHint: "/living-onboarding/journey",
    },
    generatedAt: context.generatedAt,
  };
}

export function buildOnboardingOutputs(context: OnboardingContext, engineFeeds: EngineFeedContribution[]) {
  const classification = buildInitialClassification(context);
  const passport = buildOnboardingPassport(context, classification);
  const liveFrame = buildOnboardingLiveFrame(context, classification);
  const personalHome = buildOnboardingPersonalHome(context, classification, engineFeeds);

  return { classification, passport, liveFrame, personalHome };
}

export function toOnboardingPassportView(passport: OnboardingPassport) {
  return {
    schema_version: "living-onboarding-v1",
    user_id: passport.userId,
    professional_id: passport.professionalId,
    display_name: passport.displayName,
    verified_skills: passport.verifiedSkills,
    unlocked_actions: passport.unlockedActions,
    professional_rank: passport.professionalRank,
    passport_level: passport.passportLevel,
    headline: passport.headline,
    summary: passport.summary,
    generated_at: passport.generatedAt,
    read_only: true,
    experience_only: true,
  };
}

export function toOnboardingLiveFrameView(liveFrame: OnboardingLiveFrame) {
  return {
    schema_version: "living-onboarding-v1",
    user_id: liveFrame.userId,
    display_name: liveFrame.displayName,
    trust_score: liveFrame.trustScore,
    tier: liveFrame.tier,
    tier_label: liveFrame.tierLabel,
    badge_label: liveFrame.badgeLabel,
    headline: liveFrame.headline,
    explanation: liveFrame.explanation,
    progress_percent: liveFrame.progressPercent,
    generated_at: liveFrame.generatedAt,
    read_only: true,
    experience_only: true,
  };
}

export function toOnboardingPersonalHomeView(home: OnboardingPersonalHome) {
  const section = (s: PersonalHomeSection) => ({
    section_id: s.sectionId,
    title: s.title,
    headline: s.headline,
    description: s.description,
    route_hint: s.routeHint,
  });

  return {
    schema_version: "living-onboarding-v1",
    user_id: home.userId,
    headline: home.headline,
    todays_best_step: section(home.todaysBestStep),
    professional_passport: section(home.professionalPassport),
    live_frame: section(home.liveFrame),
    develop_me: section(home.developMe),
    learn_by_action: section(home.learnByAction),
    best_opportunity: section(home.bestOpportunity),
    professional_journey: section(home.professionalJourney),
    generated_at: home.generatedAt,
    read_only: true,
    experience_only: true,
  };
}

export function toEngineFeedView(feeds: EngineFeedContribution[]) {
  return feeds.map((f) => ({
    engine_id: f.engineId,
    contributed: f.contributed,
    summary: f.summary,
    headline: f.headline,
  }));
}
