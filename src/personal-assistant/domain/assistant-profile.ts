import type {
  ASSISTANT_CARD_TYPES,
  PRIORITY_LEVELS,
  RECOMMENDATION_CATEGORIES,
} from "./assistant-schema.js";
import { PERSONAL_ASSISTANT_SCHEMA_VERSION } from "./assistant-schema.js";
import type { AssistantContext, AssistantGoal } from "./assistant-context.js";

export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];
export type AssistantCardType = (typeof ASSISTANT_CARD_TYPES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export interface AssistantExplanation {
  headline: string;
  reasons: string[];
  expectedImpact: string;
  summary: string;
}

export interface AssistantRecommendation {
  recommendationId: string;
  category: RecommendationCategory;
  cardType: AssistantCardType;
  priority: PriorityLevel;
  priorityScore: number;
  title: string;
  message: string;
  actionLabel: string;
  relatedListingId?: string;
  relatedGoalId?: string;
  explanation: AssistantExplanation;
  readOnly: true;
  generatedAt: string;
}

export interface AssistantCard {
  cardId: string;
  cardType: AssistantCardType;
  priority: PriorityLevel;
  title: string;
  message: string;
  actionLabel: string;
  recommendationId: string;
  metadata: Record<string, string | number | boolean>;
  generatedAt: string;
}

export interface AssistantInsight {
  insightId: string;
  category: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
  generatedAt: string;
}

export interface AssistantReminder {
  reminderId: string;
  title: string;
  message: string;
  dueAt: string;
  priority: PriorityLevel;
  category: string;
}

export interface AssistantOpportunity {
  opportunityId: string;
  listingId: string;
  title: string;
  message: string;
  estimatedEarningsCents: number;
  matchScore: number;
  distanceLabel: string;
  urgency: PriorityLevel;
}

export interface AssistantSuggestion {
  suggestionId: string;
  category: RecommendationCategory;
  title: string;
  message: string;
  priority: PriorityLevel;
}

export interface AssistantTimelineEvent {
  eventId: string;
  occurredAt: string;
  title: string;
  description: string;
  category: string;
}

export interface AssistantTimeline {
  userId: string;
  events: AssistantTimelineEvent[];
  generatedAt: string;
}

export interface AssistantProgress {
  readinessScore: number;
  trustScore: number;
  passportLevel: string;
  liveFrameTier: string;
  goalsOnTrack: number;
  goalsAtRisk: number;
  completedContracts: number;
  activeActions: number;
  summary: string;
}

export interface AssistantValidation {
  valid: boolean;
  guidanceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface AssistantProfile {
  schemaVersion: typeof PERSONAL_ASSISTANT_SCHEMA_VERSION;
  userId: string;
  displayName: string;
  headline: string;
  subheadline: string;
  passportLevel: string;
  liveFrameLabel: string;
  trustScore: number;
  readinessScore: number;
  todaysBestAction: AssistantRecommendation | null;
  recommendations: AssistantRecommendation[];
  cards: AssistantCard[];
  insights: AssistantInsight[];
  goals: AssistantGoal[];
  reminders: AssistantReminder[];
  opportunities: AssistantOpportunity[];
  suggestions: AssistantSuggestion[];
  timeline: AssistantTimeline;
  progress: AssistantProgress;
  readOnly: true;
  generatedAt: string;
}

export interface AssistantStatistics {
  totalProfiles: number;
  totalRecommendationsGenerated: number;
  averageReadinessScore: number;
  categoryDistribution: Record<string, number>;
  generatedAt: string;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function scoreListingMatch(context: AssistantContext, listingId: string, requiredSkills: string[]): number {
  const skillOverlap = requiredSkills.filter((skill) => context.skills.includes(skill)).length;
  const licenseGap = context.missingLicenses.length;
  const hashBoost = stableHash(`${context.userId}:${listingId}`) % 15;
  return Math.min(100, 55 + skillOverlap * 12 - licenseGap * 8 + hashBoost);
}

function estimateEarnings(listingId: string): number {
  const hash = stableHash(listingId);
  return 15000 + (hash % 85000);
}

export function buildAssistantRecommendations(context: AssistantContext): AssistantRecommendation[] {
  const recommendations: AssistantRecommendation[] = [];
  const generatedAt = context.generatedAt;

  const topListing = context.marketplaceListings[0];
  if (topListing) {
    const matchScore = scoreListingMatch(context, topListing.id, topListing.requiredSkills);
    recommendations.push({
      recommendationId: `rec://best-action/${context.userId}`,
      category: "accept_marketplace_opportunity",
      cardType: "todays_best_action",
      priority: "critical",
      priorityScore: 100,
      title: "Today's Best Action",
      message: `Today you can earn more by accepting this nearby action: ${topListing.title}.`,
      actionLabel: "View opportunity",
      relatedListingId: topListing.id,
      explanation: {
        headline: "Highest income opportunity for your profile",
        reasons: [
          `Matches your ${context.passportLevel} passport level`,
          `Estimated match score ${matchScore}% based on your skills`,
          "Nearby action with strong provider demand",
        ],
        expectedImpact: "Completing this action increases your Professional Passport.",
        summary: "Accept this marketplace opportunity to maximize today's earnings.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  if (context.missingLicenses.length > 0) {
    const license = context.missingLicenses[0]!;
    const blockedCount = 12 + context.missingLicenses.length * 15;
    recommendations.push({
      recommendationId: `rec://license/${context.userId}/${license}`,
      category: "obtain_license",
      cardType: "missing_requirement",
      priority: "high",
      priorityScore: 90,
      title: "Missing Requirement",
      message: `You are one license away from unlocking ${blockedCount} new opportunities.`,
      actionLabel: "Review license requirements",
      explanation: {
        headline: "License gap blocking marketplace access",
        reasons: [
          `Missing: ${license.replace(/_/g, " ")}`,
          `${blockedCount} listings require this credential`,
          "Unlocking this license improves readiness immediately",
        ],
        expectedImpact: "Expands eligible marketplace opportunities.",
        summary: "Obtain the required license to access more high-value actions.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  if (context.missingSkills.length > 0) {
    const skill = context.missingSkills[0]!;
    recommendations.push({
      recommendationId: `rec://learn/${context.userId}/${skill}`,
      category: "learn_skill",
      cardType: "recommended_learning",
      priority: "high",
      priorityScore: 85,
      title: "Recommended Learning",
      message: `A trusted expert near you can teach the missing skill: ${skill.replace(/_/g, " ")}.`,
      actionLabel: "Find learning path",
      explanation: {
        headline: "Skill gap limits your earning potential",
        reasons: [
          `Missing skill: ${skill.replace(/_/g, " ")}`,
          "Experts in your area offer verified training",
          "Learning this skill unlocks higher-complexity actions",
        ],
        expectedImpact: "Strengthens your Professional Passport skill profile.",
        summary: "Learn this skill to qualify for more marketplace actions.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  if (context.trustScore < 75) {
    recommendations.push({
      recommendationId: `rec://trust/${context.userId}`,
      category: "increase_trust_score",
      cardType: "professional_improvement",
      priority: "medium",
      priorityScore: 70,
      title: "Professional Improvement",
      message: `Improve your Live Frame by completing verified actions. You are ${75 - context.trustScore} points from the next tier.`,
      actionLabel: "Improve Live Frame",
      explanation: {
        headline: "Trust score drives visibility and earnings",
        reasons: [
          `Current trust score: ${context.trustScore}`,
          "Verified completions increase trust faster",
          "Higher tiers unlock premium marketplace listings",
        ],
        expectedImpact: "Increases Trust Score and Live Frame tier progression.",
        summary: "Focus on verified completions to reach the next Live Frame tier.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  recommendations.push({
    recommendationId: `rec://team/${context.userId}`,
    category: context.tier === "T3" ? "build_team" : "join_team",
    cardType: "suggested_team",
    priority: "medium",
    priorityScore: 60,
    title: "Suggested Team",
    message:
      context.tier === "T3"
        ? "Build a team to scale high-value marketplace actions in your area."
        : "Join a verified team to access shared marketplace opportunities.",
    actionLabel: context.tier === "T3" ? "Build a team" : "Explore teams",
    explanation: {
      headline: "Teams multiply marketplace capacity",
      reasons: [
        "Collaborative actions increase completion rates",
        "Shared credentials cover skill gaps",
        "Team reputation boosts individual trust signals",
      ],
      expectedImpact: "Accelerates goal progress and income growth.",
      summary: context.tier === "T3" ? "Consider building a team." : "Consider joining a verified team.",
    },
    readOnly: true,
    generatedAt,
  });

  if (context.activeActions > 0) {
    recommendations.push({
      recommendationId: `rec://execute/${context.userId}`,
      category: "execute_action",
      cardType: "todays_best_action",
      priority: "high",
      priorityScore: 88,
      title: "Execute Active Action",
      message: `You have ${context.activeActions} active action${context.activeActions > 1 ? "s" : ""} ready to complete.`,
      actionLabel: "Continue action",
      explanation: {
        headline: "Complete in-progress work first",
        reasons: [
          `${context.activeActions} action(s) in progress`,
          "Completing actions improves trust and passport metrics",
          "Reduces reminder backlog",
        ],
        expectedImpact: "Completing this action increases your Professional Passport.",
        summary: "Finish your active actions before taking new opportunities.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  const atRiskGoal = context.goals.find((goal) => goal.status === "at_risk");
  if (atRiskGoal) {
    recommendations.push({
      recommendationId: `rec://goal/${atRiskGoal.goalId}`,
      category: "execute_action",
      cardType: "goal_progress",
      priority: "medium",
      priorityScore: 65,
      title: "Goal Progress",
      message: `Your goal "${atRiskGoal.title}" is at risk. Current progress: ${atRiskGoal.progressPercent}%.`,
      actionLabel: "View goal",
      relatedGoalId: atRiskGoal.goalId,
      explanation: {
        headline: "Goal needs attention this week",
        reasons: [
          `Progress: ${atRiskGoal.currentValue} / ${atRiskGoal.targetValue} ${atRiskGoal.unit}`,
          "Consistent marketplace activity keeps goals on track",
          "Small daily actions compound toward targets",
        ],
        expectedImpact: "Keeps professional growth goals on schedule.",
        summary: "Take one action today to move this goal forward.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  if (context.certifications.length === 0 && context.tier !== "T1") {
    recommendations.push({
      recommendationId: `rec://cert/${context.userId}`,
      category: "complete_certification",
      cardType: "missing_requirement",
      priority: "medium",
      priorityScore: 55,
      title: "Complete Certification",
      message: "Complete a safety certification to unlock additional marketplace categories.",
      actionLabel: "Start certification",
      explanation: {
        headline: "Certification expands marketplace eligibility",
        reasons: [
          "Several listings require safety certification",
          "Certifications are visible on your Professional Passport",
          "Low time investment with high unlock value",
        ],
        expectedImpact: "Unlocks certified-provider marketplace segments.",
        summary: "Obtain certification to qualify for more actions.",
      },
      readOnly: true,
      generatedAt,
    });
  }

  recommendations.push({
    recommendationId: `rec://expert/${context.userId}`,
    category: "contact_expert",
    cardType: "nearby_expert",
    priority: "low",
    priorityScore: 45,
    title: "Nearby Expert",
    message: "A trusted expert near you can help accelerate your next skill milestone.",
    actionLabel: "Contact expert",
    explanation: {
      headline: "Expert guidance shortens learning curves",
      reasons: [
        "Verified experts in your service area",
        "One-on-one guidance for skill gaps",
        "Mentorship improves completion quality",
      ],
      expectedImpact: "Faster skill acquisition and higher trust scores.",
      summary: "Connect with a nearby expert for personalized guidance.",
    },
    readOnly: true,
    generatedAt,
  });

  return recommendations.sort((left, right) => right.priorityScore - left.priorityScore);
}

export function buildAssistantCards(recommendations: AssistantRecommendation[]): AssistantCard[] {
  return recommendations.map((recommendation) => ({
    cardId: `card://${recommendation.recommendationId}`,
    cardType: recommendation.cardType,
    priority: recommendation.priority,
    title: recommendation.title,
    message: recommendation.message,
    actionLabel: recommendation.actionLabel,
    recommendationId: recommendation.recommendationId,
    metadata: {
      category: recommendation.category,
      priority_score: recommendation.priorityScore,
      read_only: true,
      ...(recommendation.relatedListingId ? { listing_id: recommendation.relatedListingId } : {}),
      ...(recommendation.relatedGoalId ? { goal_id: recommendation.relatedGoalId } : {}),
    },
    generatedAt: recommendation.generatedAt,
  }));
}

export function buildAssistantInsights(context: AssistantContext): AssistantInsight[] {
  return [
    {
      insightId: `insight://readiness/${context.userId}`,
      category: "readiness",
      title: "Readiness Overview",
      message: `Your readiness score is ${context.readinessScore}/100. Focus on licenses and trust to improve.`,
      severity: context.readinessScore >= 70 ? "success" : "warning",
      generatedAt: context.generatedAt,
    },
    {
      insightId: `insight://marketplace/${context.userId}`,
      category: "marketplace",
      title: "Marketplace Activity",
      message: `${context.marketplaceListings.length} opportunities match your current profile.`,
      severity: "info",
      generatedAt: context.generatedAt,
    },
    {
      insightId: `insight://passport/${context.userId}`,
      category: "passport",
      title: "Professional Passport",
      message: `${context.passportLevel} passport with ${context.completedContracts} completed contracts.`,
      severity: "info",
      generatedAt: context.generatedAt,
    },
  ];
}

export function buildAssistantReminders(context: AssistantContext): AssistantReminder[] {
  const reminders: AssistantReminder[] = [];
  if (context.contractsInProgress > 0) {
    reminders.push({
      reminderId: `reminder://contract/${context.userId}`,
      title: "Contract in progress",
      message: "You have an active contract awaiting your next step.",
      dueAt: context.generatedAt,
      priority: "high",
      category: "contract",
    });
  }
  if (context.missingLicenses.length > 0) {
    reminders.push({
      reminderId: `reminder://license/${context.userId}`,
      title: "License renewal window",
      message: `Complete ${context.missingLicenses[0]!.replace(/_/g, " ")} requirements soon.`,
      dueAt: context.generatedAt,
      priority: "medium",
      category: "license",
    });
  }
  reminders.push({
    reminderId: `reminder://daily/${context.userId}`,
    title: "Daily check-in",
    message: "Review today's best action to maximize your earnings.",
    dueAt: context.generatedAt,
    priority: "low",
    category: "daily",
  });
  return reminders;
}

export function buildAssistantOpportunities(context: AssistantContext): AssistantOpportunity[] {
  return context.marketplaceListings.slice(0, 5).map((listing, index) => ({
    opportunityId: `opp://${listing.id}`,
    listingId: listing.id,
    title: listing.title,
    message: listing.summary,
    estimatedEarningsCents: estimateEarnings(listing.id),
    matchScore: scoreListingMatch(context, listing.id, listing.requiredSkills),
    distanceLabel: index === 0 ? "Nearby" : `${2 + index} km`,
    urgency: index === 0 ? "high" : index < 3 ? "medium" : "low",
  }));
}

export function buildAssistantSuggestions(recommendations: AssistantRecommendation[]): AssistantSuggestion[] {
  return recommendations.slice(0, 6).map((recommendation) => ({
    suggestionId: `sug://${recommendation.recommendationId}`,
    category: recommendation.category,
    title: recommendation.title,
    message: recommendation.message,
    priority: recommendation.priority,
  }));
}

export function buildAssistantTimeline(context: AssistantContext): AssistantTimeline {
  const events: AssistantTimelineEvent[] = [
    {
      eventId: `evt://generated/${context.userId}`,
      occurredAt: context.generatedAt,
      title: "Guidance refreshed",
      description: "Personal assistant updated your recommendations.",
      category: "system",
    },
    {
      eventId: `evt://passport/${context.userId}`,
      occurredAt: context.generatedAt,
      title: "Passport milestone",
      description: `${context.passportLevel} passport level maintained.`,
      category: "passport",
    },
  ];
  if (context.completedContracts > 0) {
    events.push({
      eventId: `evt://contract/${context.userId}`,
      occurredAt: context.generatedAt,
      title: "Contract completed",
      description: `Total completed contracts: ${context.completedContracts}.`,
      category: "contract",
    });
  }
  return {
    userId: context.userId,
    events,
    generatedAt: context.generatedAt,
  };
}

export function buildAssistantProgress(context: AssistantContext): AssistantProgress {
  const goalsOnTrack = context.goals.filter((goal) => goal.status === "on_track").length;
  const goalsAtRisk = context.goals.filter((goal) => goal.status === "at_risk").length;
  return {
    readinessScore: context.readinessScore,
    trustScore: context.trustScore,
    passportLevel: context.passportLevel,
    liveFrameTier: context.liveFrameTier,
    goalsOnTrack,
    goalsAtRisk,
    completedContracts: context.completedContracts,
    activeActions: context.activeActions,
    summary: `${goalsOnTrack} goal(s) on track, ${goalsAtRisk} at risk. Readiness ${context.readinessScore}/100.`,
  };
}

export function validateAssistantContext(context: AssistantContext): AssistantValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!context.userId) errors.push("user_id is required");
  if (context.marketplaceListings.length === 0) {
    warnings.push("No marketplace listings available for opportunity matching");
  }
  if (context.readinessScore < 50) {
    warnings.push("Low readiness score — focus on licenses and trust improvements");
  }
  return {
    valid: errors.length === 0,
    guidanceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Assistant context is valid and ready for guidance generation."
        : "Assistant context failed validation.",
  };
}

export function buildAssistantProfile(context: AssistantContext): AssistantProfile {
  const recommendations = buildAssistantRecommendations(context);
  const todaysBestAction =
    recommendations.find((rec) => rec.cardType === "todays_best_action") ?? recommendations[0] ?? null;

  return {
    schemaVersion: PERSONAL_ASSISTANT_SCHEMA_VERSION,
    userId: context.userId,
    displayName: context.displayName,
    headline: todaysBestAction?.message ?? "Your personal action manager is ready.",
    subheadline: `Readiness ${context.readinessScore}/100 · ${context.passportLevel} Passport · ${context.liveFrameLabel}`,
    passportLevel: context.passportLevel,
    liveFrameLabel: context.liveFrameLabel,
    trustScore: context.trustScore,
    readinessScore: context.readinessScore,
    todaysBestAction,
    recommendations,
    cards: buildAssistantCards(recommendations),
    insights: buildAssistantInsights(context),
    goals: context.goals,
    reminders: buildAssistantReminders(context),
    opportunities: buildAssistantOpportunities(context),
    suggestions: buildAssistantSuggestions(recommendations),
    timeline: buildAssistantTimeline(context),
    progress: buildAssistantProgress(context),
    readOnly: true,
    generatedAt: context.generatedAt,
  };
}

export function toAssistantProfileView(profile: AssistantProfile) {
  return {
    schema_version: profile.schemaVersion,
    user_id: profile.userId,
    display_name: profile.displayName,
    headline: profile.headline,
    subheadline: profile.subheadline,
    passport_level: profile.passportLevel,
    live_frame_label: profile.liveFrameLabel,
    trust_score: profile.trustScore,
    readiness_score: profile.readinessScore,
    todays_best_action: profile.todaysBestAction ? toRecommendationView(profile.todaysBestAction) : null,
    recommendation_count: profile.recommendations.length,
    card_count: profile.cards.length,
    read_only: profile.readOnly,
    generated_at: profile.generatedAt,
  };
}

export function toRecommendationView(recommendation: AssistantRecommendation) {
  return {
    recommendation_id: recommendation.recommendationId,
    category: recommendation.category,
    card_type: recommendation.cardType,
    priority: recommendation.priority,
    priority_score: recommendation.priorityScore,
    title: recommendation.title,
    message: recommendation.message,
    action_label: recommendation.actionLabel,
    related_listing_id: recommendation.relatedListingId ?? null,
    related_goal_id: recommendation.relatedGoalId ?? null,
    explanation: {
      headline: recommendation.explanation.headline,
      reasons: recommendation.explanation.reasons,
      expected_impact: recommendation.explanation.expectedImpact,
      summary: recommendation.explanation.summary,
    },
    read_only: recommendation.readOnly,
    generated_at: recommendation.generatedAt,
  };
}

export function toAssistantCardView(card: AssistantCard) {
  return {
    card_id: card.cardId,
    card_type: card.cardType,
    priority: card.priority,
    title: card.title,
    message: card.message,
    action_label: card.actionLabel,
    recommendation_id: card.recommendationId,
    metadata: card.metadata,
    generated_at: card.generatedAt,
  };
}

export function toAssistantGoalView(goal: AssistantGoal) {
  return {
    goal_id: goal.goalId,
    title: goal.title,
    description: goal.description,
    target_value: goal.targetValue,
    current_value: goal.currentValue,
    unit: goal.unit,
    progress_percent: goal.progressPercent,
    status: goal.status,
  };
}

export function toAssistantOpportunityView(opportunity: AssistantOpportunity) {
  return {
    opportunity_id: opportunity.opportunityId,
    listing_id: opportunity.listingId,
    title: opportunity.title,
    message: opportunity.message,
    estimated_earnings_cents: opportunity.estimatedEarningsCents,
    match_score: opportunity.matchScore,
    distance_label: opportunity.distanceLabel,
    urgency: opportunity.urgency,
  };
}

export function toAssistantReminderView(reminder: AssistantReminder) {
  return {
    reminder_id: reminder.reminderId,
    title: reminder.title,
    message: reminder.message,
    due_at: reminder.dueAt,
    priority: reminder.priority,
    category: reminder.category,
  };
}

export function toAssistantTimelineView(timeline: AssistantTimeline) {
  return {
    user_id: timeline.userId,
    events: timeline.events.map((event) => ({
      event_id: event.eventId,
      occurred_at: event.occurredAt,
      title: event.title,
      description: event.description,
      category: event.category,
    })),
    generated_at: timeline.generatedAt,
  };
}

export function toAssistantProgressView(progress: AssistantProgress) {
  return {
    readiness_score: progress.readinessScore,
    trust_score: progress.trustScore,
    passport_level: progress.passportLevel,
    live_frame_tier: progress.liveFrameTier,
    goals_on_track: progress.goalsOnTrack,
    goals_at_risk: progress.goalsAtRisk,
    completed_contracts: progress.completedContracts,
    active_actions: progress.activeActions,
    summary: progress.summary,
  };
}

export function toAssistantStatisticsView(stats: AssistantStatistics) {
  return {
    total_profiles: stats.totalProfiles,
    total_recommendations_generated: stats.totalRecommendationsGenerated,
    average_readiness_score: stats.averageReadinessScore,
    category_distribution: stats.categoryDistribution,
    generated_at: stats.generatedAt,
  };
}

export function collectPersonalAssistantPaths(rootDir: string): string[] {
  return [`${rootDir}/src/personal-assistant`];
}

export function buildAssistantStatistics(profiles: AssistantProfile[]): AssistantStatistics {
  const categoryDistribution: Record<string, number> = {};
  let totalRecommendations = 0;
  let readinessSum = 0;

  for (const profile of profiles) {
    readinessSum += profile.readinessScore;
    totalRecommendations += profile.recommendations.length;
    for (const recommendation of profile.recommendations) {
      categoryDistribution[recommendation.category] =
        (categoryDistribution[recommendation.category] ?? 0) + 1;
    }
  }

  return {
    totalProfiles: profiles.length,
    totalRecommendationsGenerated: totalRecommendations,
    averageReadinessScore:
      profiles.length === 0 ? 0 : Math.round(readinessSum / profiles.length),
    categoryDistribution,
    generatedAt: new Date().toISOString(),
  };
}
