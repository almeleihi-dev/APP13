import type {
  CAPABILITY_TYPES,
  VISIBILITY_CHANNELS,
} from "./expert-network-schema.js";
import { EXPERT_NETWORK_SCHEMA_VERSION } from "./expert-network-schema.js";
import type { ExpertNetworkContext } from "./expert-network-context.js";
import type { SeedNetworkExpert } from "./expert-network-seed.js";
import type { ExpertRoleType } from "./expert-network-seed.js";

export type ExpertRole = ExpertRoleType;
export type CapabilityType = (typeof CAPABILITY_TYPES)[number];
export type VisibilityChannel = (typeof VISIBILITY_CHANNELS)[number];

export interface ExpertRoleAssignment {
  role: ExpertRole;
  label: string;
  active: boolean;
  strengthScore: number;
}

export interface ExpertCapability {
  capabilityId: string;
  expertId: string;
  type: CapabilityType;
  label: string;
  score: number;
  summary: string;
}

export interface ExperienceBalance {
  expertId: string;
  experienceYears: number;
  completedActions: number;
  customerRating: number;
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  learnersTrained: number;
  trainingSuccessRate: number;
  supervisedProjects: number;
  reviewedWork: number;
  consultingSessions: number;
  knowledgeContributions: number;
  balanceScore: number;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface ExpertImpact {
  expertId: string;
  learnersTrained: number;
  learnerReadinessImprovement: number;
  learnerIncomeImprovementCents: number;
  actionsUnlockedByLearners: number;
  teamsSupported: number;
  projectsSupervised: number;
  disputesReviewed: number;
  blueprintsImproved: number;
  knowledgeItemsContributed: number;
  impactScore: number;
  summary: string;
}

export interface ExpertContribution {
  contributionId: string;
  expertId: string;
  expertName: string;
  type: "knowledge" | "blueprint" | "review" | "training" | "consulting";
  title: string;
  description: string;
  impactLabel: string;
  contributedAt: string;
}

export interface ExpertVisibility {
  expertId: string;
  channels: Array<{
    channel: VisibilityChannel;
    visible: boolean;
    reason: string;
  }>;
  publicProfile: boolean;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface ExpertRecommendation {
  recommendationId: string;
  expertId: string;
  displayName: string;
  role: ExpertRole;
  targetSkill: string;
  matchScore: number;
  distanceKm: number;
  distanceLabel: string;
  message: string;
  visibilityChannel: VisibilityChannel;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface ExpertTrustSummary {
  expertId: string;
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  customerRating: number;
  verificationLabel: string;
  summary: string;
}

export interface ExpertProfile {
  expertId: string;
  displayName: string;
  headline: string;
  summary: string;
  skills: string[];
  roles: ExpertRoleAssignment[];
  trustSummary: ExpertTrustSummary;
  experienceBalance: ExperienceBalance;
  capabilities: ExpertCapability[];
  impact: ExpertImpact;
  visibility: ExpertVisibility;
  distanceKm: number;
  distanceLabel: string;
}

export interface ExpertValidation {
  valid: boolean;
  networkReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ExpertNetworkSummary {
  schemaVersion: typeof EXPERT_NETWORK_SCHEMA_VERSION;
  userId: string;
  headline: string;
  subheadline: string;
  expertCount: number;
  roleDistribution: Record<string, number>;
  totalLearnersTrained: number;
  averageTrustScore: number;
  topExperts: ExpertProfile[];
  recommendations: ExpertRecommendation[];
  readOnly: true;
  generatedAt: string;
}

export interface ExpertNetworkStatistics {
  totalExperts: number;
  totalRolesAssigned: number;
  averageImpactScore: number;
  totalKnowledgeContributions: number;
  roleDistribution: Record<string, number>;
  generatedAt: string;
}

const ROLE_LABELS: Record<ExpertRole, string> = {
  service_expert: "Service Expert",
  trainer: "Trainer",
  mentor: "Mentor",
  supervisor: "Supervisor",
  reviewer: "Reviewer",
  consultant: "Consultant",
  retired_expert: "Retired Expert",
  knowledge_contributor: "Knowledge Contributor",
};

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function roleStrength(expert: SeedNetworkExpert, role: ExpertRole): number {
  const base = expert.trustScore;
  switch (role) {
    case "trainer":
      return Math.min(100, base * 0.4 + expert.trainingSuccessRate * 0.5 + expert.learnersTrained * 0.3);
    case "mentor":
      return Math.min(100, base * 0.5 + expert.learnersTrained * 0.4);
    case "supervisor":
      return Math.min(100, base * 0.4 + expert.supervisedProjects * 0.8);
    case "reviewer":
      return Math.min(100, base * 0.4 + expert.reviewedWork * 0.15);
    case "consultant":
      return Math.min(100, base * 0.5 + expert.consultingSessions * 0.6);
    case "retired_expert":
      return expert.roles.includes("retired_expert") ? Math.min(100, base + expert.experienceYears) : 0;
    case "knowledge_contributor":
      return Math.min(100, base * 0.3 + expert.knowledgeContributions * 2.5);
    default:
      return Math.min(100, base * 0.6 + expert.completedActions * 0.05);
  }
}

export function buildExpertRoles(expert: SeedNetworkExpert): ExpertRoleAssignment[] {
  return expert.roles.map((role) => ({
    role,
    label: ROLE_LABELS[role],
    active: true,
    strengthScore: Math.round(roleStrength(expert, role)),
  }));
}

export function buildExpertTrustSummary(expert: SeedNetworkExpert): ExpertTrustSummary {
  return {
    expertId: expert.expertId,
    trustScore: expert.trustScore,
    liveFrameTier: expert.liveFrameTier,
    passportLevel: expert.passportLevel,
    customerRating: expert.customerRating,
    verificationLabel: `${expert.passportLevel} · ${expert.liveFrameTier} frame`,
    summary: `Trust score ${expert.trustScore} with ${expert.customerRating}/5.0 customer rating.`,
  };
}

export function buildExperienceBalance(expert: SeedNetworkExpert): ExperienceBalance {
  const balanceScore = Math.round(
    expert.experienceYears * 2 +
      expert.completedActions * 0.08 +
      expert.trustScore * 0.25 +
      expert.trainingSuccessRate * 0.15 +
      expert.learnersTrained * 0.4
  );

  return {
    expertId: expert.expertId,
    experienceYears: expert.experienceYears,
    completedActions: expert.completedActions,
    customerRating: expert.customerRating,
    trustScore: expert.trustScore,
    liveFrameTier: expert.liveFrameTier,
    passportLevel: expert.passportLevel,
    learnersTrained: expert.learnersTrained,
    trainingSuccessRate: expert.trainingSuccessRate,
    supervisedProjects: expert.supervisedProjects,
    reviewedWork: expert.reviewedWork,
    consultingSessions: expert.consultingSessions,
    knowledgeContributions: expert.knowledgeContributions,
    balanceScore: Math.min(100, balanceScore),
    explanation: {
      headline: `Experience balance score: ${Math.min(100, balanceScore)}/100`,
      reasons: [
        `${expert.experienceYears} years experience · ${expert.completedActions} completed actions`,
        `${expert.learnersTrained} learners trained at ${expert.trainingSuccessRate}% success`,
        `${expert.supervisedProjects} supervised · ${expert.reviewedWork} reviewed · ${expert.consultingSessions} consulting`,
      ],
      summary: "Balanced mix of service delivery, training, and oversight experience.",
    },
  };
}

export function buildExpertCapabilities(expert: SeedNetworkExpert): ExpertCapability[] {
  const capabilities: ExpertCapability[] = [];

  if (expert.roles.includes("trainer") || expert.learnersTrained > 0) {
    capabilities.push({
      capabilityId: `cap://training/${expert.expertId}`,
      expertId: expert.expertId,
      type: "training",
      label: "Training Capability",
      score: Math.round(roleStrength(expert, "trainer")),
      summary: `${expert.learnersTrained} learners trained at ${expert.trainingSuccessRate}% success rate.`,
    });
  }
  if (expert.roles.includes("supervisor") || expert.supervisedProjects > 0) {
    capabilities.push({
      capabilityId: `cap://supervision/${expert.expertId}`,
      expertId: expert.expertId,
      type: "supervision",
      label: "Supervision Capability",
      score: Math.round(roleStrength(expert, "supervisor")),
      summary: `${expert.supervisedProjects} projects supervised.`,
    });
  }
  if (expert.roles.includes("reviewer") || expert.reviewedWork > 0) {
    capabilities.push({
      capabilityId: `cap://review/${expert.expertId}`,
      expertId: expert.expertId,
      type: "review",
      label: "Review Capability",
      score: Math.round(roleStrength(expert, "reviewer")),
      summary: `${expert.reviewedWork} work items reviewed.`,
    });
  }
  if (expert.roles.includes("consultant") || expert.consultingSessions > 0) {
    capabilities.push({
      capabilityId: `cap://consulting/${expert.expertId}`,
      expertId: expert.expertId,
      type: "consulting",
      label: "Consulting Capability",
      score: Math.round(roleStrength(expert, "consultant")),
      summary: `${expert.consultingSessions} consulting sessions delivered.`,
    });
  }
  if (expert.roles.includes("mentor")) {
    capabilities.push({
      capabilityId: `cap://mentorship/${expert.expertId}`,
      expertId: expert.expertId,
      type: "mentorship",
      label: "Mentorship Capability",
      score: Math.round(roleStrength(expert, "mentor")),
      summary: "Trusted mentor for guided professional development.",
    });
  }
  capabilities.push({
    capabilityId: `cap://service/${expert.expertId}`,
    expertId: expert.expertId,
    type: "service_delivery",
    label: "Service Delivery",
    score: Math.round(roleStrength(expert, "service_expert")),
    summary: `${expert.completedActions} marketplace actions completed.`,
  });
  if (expert.knowledgeContributions > 0) {
    capabilities.push({
      capabilityId: `cap://knowledge/${expert.expertId}`,
      expertId: expert.expertId,
      type: "knowledge_sharing",
      label: "Knowledge Sharing",
      score: Math.round(roleStrength(expert, "knowledge_contributor")),
      summary: `${expert.knowledgeContributions} knowledge items contributed.`,
    });
  }

  return capabilities.sort((left, right) => right.score - left.score);
}

export function buildExpertImpact(expert: SeedNetworkExpert): ExpertImpact {
  const learnerReadinessImprovement = Math.round(expert.learnersTrained * 0.8 + expert.trainingSuccessRate * 0.1);
  const learnerIncomeImprovementCents = expert.learnersTrained * 42000;
  const actionsUnlocked = expert.learnersTrained * 3 + expert.blueprintsImproved * 5;
  const impactScore = Math.round(
    expert.learnersTrained * 1.2 +
      expert.teamsSupported * 2 +
      expert.disputesReviewed * 1.5 +
      expert.knowledgeContributions * 2.5 +
      expert.blueprintsImproved * 3
  );

  return {
    expertId: expert.expertId,
    learnersTrained: expert.learnersTrained,
    learnerReadinessImprovement,
    learnerIncomeImprovementCents,
    actionsUnlockedByLearners: actionsUnlocked,
    teamsSupported: expert.teamsSupported,
    projectsSupervised: expert.supervisedProjects,
    disputesReviewed: expert.disputesReviewed,
    blueprintsImproved: expert.blueprintsImproved,
    knowledgeItemsContributed: expert.knowledgeContributions,
    impactScore,
    summary: `This expert helped ${expert.learnersTrained} learners improve.`,
  };
}

export function buildExpertVisibility(expert: SeedNetworkExpert): ExpertVisibility {
  const channels: ExpertVisibility["channels"] = [
    {
      channel: "public_expert_profile",
      visible: expert.trustScore >= 70,
      reason: expert.trustScore >= 70 ? "Meets public profile trust threshold" : "Below trust threshold",
    },
    {
      channel: "learn_by_action",
      visible: expert.roles.some((r) => ["trainer", "mentor", "service_expert"].includes(r)),
      reason: "Available for learn-by-action recommendations",
    },
    {
      channel: "supervisor_recommendation",
      visible: expert.roles.includes("supervisor") && expert.supervisedProjects >= 10,
      reason: "Qualified supervisor with project oversight history",
    },
    {
      channel: "team_builder",
      visible: expert.teamsSupported >= 2,
      reason: "Demonstrated team support experience",
    },
    {
      channel: "consulting_recommendation",
      visible: expert.roles.includes("consultant") || expert.roles.includes("retired_expert"),
      reason: expert.roles.includes("retired_expert")
        ? "Retired expert available for consulting"
        : "Active consulting capability",
    },
    {
      channel: "knowledge_bank",
      visible: expert.knowledgeContributions >= 3,
      reason: "Knowledge contributor with published items",
    },
  ];

  return {
    expertId: expert.expertId,
    channels,
    publicProfile: expert.trustScore >= 70,
    explanation: {
      headline: "Explainable expert visibility",
      reasons: channels.filter((c) => c.visible).map((c) => `${c.channel}: ${c.reason}`),
      summary: `${channels.filter((c) => c.visible).length} visibility channel(s) active.`,
    },
  };
}

export function buildExpertProfile(expert: SeedNetworkExpert): ExpertProfile {
  return {
    expertId: expert.expertId,
    displayName: expert.displayName,
    headline: expert.headline,
    summary: expert.summary,
    skills: expert.skills,
    roles: buildExpertRoles(expert),
    trustSummary: buildExpertTrustSummary(expert),
    experienceBalance: buildExperienceBalance(expert),
    capabilities: buildExpertCapabilities(expert),
    impact: buildExpertImpact(expert),
    visibility: buildExpertVisibility(expert),
    distanceKm: expert.distanceKm,
    distanceLabel: expert.distanceKm <= 3 ? "Nearby" : `${expert.distanceKm} km`,
  };
}

export function buildExpertContributions(experts: SeedNetworkExpert[]): ExpertContribution[] {
  const contributions: ExpertContribution[] = [];

  for (const expert of experts) {
    if (expert.knowledgeContributions > 0) {
      contributions.push({
        contributionId: `contrib://knowledge/${expert.expertId}`,
        expertId: expert.expertId,
        expertName: expert.displayName,
        type: "knowledge",
        title: "Knowledge bank articles",
        description: `${expert.knowledgeContributions} knowledge items contributed.`,
        impactLabel: `${expert.learnersTrained} learners benefited`,
        contributedAt: "2026-06-01T00:00:00.000Z",
      });
    }
    if (expert.blueprintsImproved > 0) {
      contributions.push({
        contributionId: `contrib://blueprint/${expert.expertId}`,
        expertId: expert.expertId,
        expertName: expert.displayName,
        type: "blueprint",
        title: "Blueprint improvements",
        description: `${expert.blueprintsImproved} marketplace blueprints improved.`,
        impactLabel: `${expert.blueprintsImproved * 5} actions unlocked`,
        contributedAt: "2026-05-15T00:00:00.000Z",
      });
    }
    if (expert.learnersTrained > 0) {
      contributions.push({
        contributionId: `contrib://training/${expert.expertId}`,
        expertId: expert.expertId,
        expertName: expert.displayName,
        type: "training",
        title: "Training sessions delivered",
        description: `Trained ${expert.learnersTrained} professionals at ${expert.trainingSuccessRate}% success.`,
        impactLabel: `+${Math.round(expert.learnersTrained * 0.8)}% avg readiness improvement`,
        contributedAt: "2026-06-10T00:00:00.000Z",
      });
    }
  }

  return contributions.sort((left, right) => right.impactLabel.localeCompare(left.impactLabel));
}

function scoreExpertForSkill(expert: SeedNetworkExpert, skill: string, role: ExpertRole): number {
  const skillMatch = expert.skills.includes(skill) ? 40 : expert.skills.some((s) => skill.startsWith(s.split("_")[0]!)) ? 20 : 0;
  const roleBoost = roleStrength(expert, role) * 0.35;
  const distancePenalty = Math.min(15, expert.distanceKm);
  return Math.min(100, Math.round(skillMatch + roleBoost - distancePenalty + (stableHash(expert.expertId + skill) % 10)));
}

export function buildExpertRecommendations(context: ExpertNetworkContext): ExpertRecommendation[] {
  const targetSkills = context.missingSkills.length > 0 ? context.missingSkills : ["general_maintenance"];
  const recommendations: ExpertRecommendation[] = [];

  for (const skill of targetSkills) {
    for (const expert of context.experts) {
      for (const role of expert.roles) {
        if (role === "knowledge_contributor") continue;
        const matchScore = scoreExpertForSkill(expert, skill, role);
        if (matchScore < 45) continue;

        const channel: VisibilityChannel =
          role === "trainer" || role === "mentor"
            ? "learn_by_action"
            : role === "supervisor"
              ? "supervisor_recommendation"
              : role === "consultant" || role === "retired_expert"
                ? "consulting_recommendation"
                : role === "reviewer"
                  ? "team_builder"
                  : "public_expert_profile";

        const message =
          role === "trainer"
            ? `Best trainer near you for ${formatLabel(skill)}.`
            : role === "supervisor"
              ? "Trusted supervisor."
              : role === "retired_expert"
                ? "Retired expert available for consulting."
                : role === "mentor"
                  ? `Best expert for ${formatLabel(skill)}.`
                  : `Recommended ${ROLE_LABELS[role].toLowerCase()} for ${formatLabel(skill)}.`;

        recommendations.push({
          recommendationId: `en://rec/${expert.expertId}/${role}/${skill}`,
          expertId: expert.expertId,
          displayName: expert.displayName,
          role,
          targetSkill: skill,
          matchScore,
          distanceKm: expert.distanceKm,
          distanceLabel: expert.distanceKm <= 3 ? "Nearby" : `${expert.distanceKm} km`,
          message,
          visibilityChannel: channel,
          explanation: {
            headline: message,
            reasons: [
              `${expert.trustScore} trust score · ${expert.liveFrameTier} Live Frame`,
              `${ROLE_LABELS[role]} strength: ${Math.round(roleStrength(expert, role))}/100`,
              `${expert.distanceKm} km away`,
            ],
            summary: `Helped ${expert.learnersTrained} learners improve.`,
          },
        });
      }
    }
  }

  return recommendations.sort((left, right) => right.matchScore - left.matchScore);
}

export function buildRoleDistribution(experts: SeedNetworkExpert[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const expert of experts) {
    for (const role of expert.roles) {
      distribution[role] = (distribution[role] ?? 0) + 1;
    }
  }
  return distribution;
}

export function validateExpertNetwork(context: ExpertNetworkContext): ExpertValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (context.experts.length === 0) errors.push("No experts in network");
  if (context.experts.length < 3) warnings.push("Limited expert network size");
  return {
    valid: errors.length === 0,
    networkReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Expert network is valid and ready."
        : "Expert network validation failed.",
  };
}

export function buildExpertNetworkSummary(context: ExpertNetworkContext): ExpertNetworkSummary {
  const profiles = context.experts.map(buildExpertProfile);
  const recommendations = buildExpertRecommendations(context);
  const roleDistribution = buildRoleDistribution(context.experts);
  const totalLearnersTrained = context.experts.reduce((sum, e) => sum + e.learnersTrained, 0);
  const averageTrustScore = Math.round(
    context.experts.reduce((sum, e) => sum + e.trustScore, 0) / context.experts.length
  );
  const topExperts = [...profiles]
    .sort((left, right) => right.impact.impactScore - left.impact.impactScore)
    .slice(0, 3);

  return {
    schemaVersion: EXPERT_NETWORK_SCHEMA_VERSION,
    userId: context.userId,
    headline: `${context.experts.length} trusted experts in your network`,
    subheadline: `${totalLearnersTrained} learners trained · avg trust ${averageTrustScore}`,
    expertCount: context.experts.length,
    roleDistribution,
    totalLearnersTrained,
    averageTrustScore,
    topExperts,
    recommendations: recommendations.slice(0, 8),
    readOnly: true,
    generatedAt: context.generatedAt,
  };
}

export function buildExpertNetworkStatistics(experts: SeedNetworkExpert[]): ExpertNetworkStatistics {
  const roleDistribution = buildRoleDistribution(experts);
  const totalRolesAssigned = Object.values(roleDistribution).reduce((sum, count) => sum + count, 0);
  const impacts = experts.map(buildExpertImpact);
  const averageImpactScore =
    impacts.length === 0 ? 0 : Math.round(impacts.reduce((sum, i) => sum + i.impactScore, 0) / impacts.length);
  const totalKnowledgeContributions = experts.reduce((sum, e) => sum + e.knowledgeContributions, 0);

  return {
    totalExperts: experts.length,
    totalRolesAssigned,
    averageImpactScore,
    totalKnowledgeContributions,
    roleDistribution,
    generatedAt: new Date().toISOString(),
  };
}

export function collectExpertNetworkPaths(rootDir: string): string[] {
  return [`${rootDir}/src/expert-network`];
}

export function toExpertNetworkSummaryView(summary: ExpertNetworkSummary) {
  return {
    schema_version: summary.schemaVersion,
    user_id: summary.userId,
    headline: summary.headline,
    subheadline: summary.subheadline,
    expert_count: summary.expertCount,
    role_distribution: summary.roleDistribution,
    total_learners_trained: summary.totalLearnersTrained,
    average_trust_score: summary.averageTrustScore,
    top_experts: summary.topExperts.map(toExpertProfileSummaryView),
    recommendation_count: summary.recommendations.length,
    read_only: summary.readOnly,
    generated_at: summary.generatedAt,
  };
}

export function toExpertProfileSummaryView(profile: ExpertProfile) {
  return {
    expert_id: profile.expertId,
    display_name: profile.displayName,
    headline: profile.headline,
    trust_score: profile.trustSummary.trustScore,
    impact_score: profile.impact.impactScore,
    learners_trained: profile.impact.learnersTrained,
    roles: profile.roles.map((r) => r.role),
    distance_label: profile.distanceLabel,
  };
}

export function toExpertProfileView(profile: ExpertProfile) {
  return {
    expert_id: profile.expertId,
    display_name: profile.displayName,
    headline: profile.headline,
    summary: profile.summary,
    skills: profile.skills,
    roles: profile.roles.map((r) => ({
      role: r.role,
      label: r.label,
      active: r.active,
      strength_score: r.strengthScore,
    })),
    trust_summary: {
      trust_score: profile.trustSummary.trustScore,
      live_frame_tier: profile.trustSummary.liveFrameTier,
      passport_level: profile.trustSummary.passportLevel,
      customer_rating: profile.trustSummary.customerRating,
      verification_label: profile.trustSummary.verificationLabel,
      summary: profile.trustSummary.summary,
    },
    experience_balance: toExperienceBalanceView(profile.experienceBalance),
    capabilities: profile.capabilities.map(toExpertCapabilityView),
    impact: toExpertImpactView(profile.impact),
    visibility: toExpertVisibilityView(profile.visibility),
    distance_km: profile.distanceKm,
    distance_label: profile.distanceLabel,
  };
}

export function toExperienceBalanceView(balance: ExperienceBalance) {
  return {
    experience_years: balance.experienceYears,
    completed_actions: balance.completedActions,
    customer_rating: balance.customerRating,
    trust_score: balance.trustScore,
    live_frame_tier: balance.liveFrameTier,
    passport_level: balance.passportLevel,
    learners_trained: balance.learnersTrained,
    training_success_rate: balance.trainingSuccessRate,
    supervised_projects: balance.supervisedProjects,
    reviewed_work: balance.reviewedWork,
    consulting_sessions: balance.consultingSessions,
    knowledge_contributions: balance.knowledgeContributions,
    balance_score: balance.balanceScore,
    explanation: balance.explanation,
  };
}

export function toExpertCapabilityView(cap: ExpertCapability) {
  return {
    capability_id: cap.capabilityId,
    expert_id: cap.expertId,
    type: cap.type,
    label: cap.label,
    score: cap.score,
    summary: cap.summary,
  };
}

export function toExpertImpactView(impact: ExpertImpact) {
  return {
    expert_id: impact.expertId,
    learners_trained: impact.learnersTrained,
    learner_readiness_improvement: impact.learnerReadinessImprovement,
    learner_income_improvement_cents: impact.learnerIncomeImprovementCents,
    actions_unlocked_by_learners: impact.actionsUnlockedByLearners,
    teams_supported: impact.teamsSupported,
    projects_supervised: impact.projectsSupervised,
    disputes_reviewed: impact.disputesReviewed,
    blueprints_improved: impact.blueprintsImproved,
    knowledge_items_contributed: impact.knowledgeItemsContributed,
    impact_score: impact.impactScore,
    summary: impact.summary,
  };
}

export function toExpertVisibilityView(visibility: ExpertVisibility) {
  return {
    expert_id: visibility.expertId,
    channels: visibility.channels.map((c) => ({
      channel: c.channel,
      visible: c.visible,
      reason: c.reason,
    })),
    public_profile: visibility.publicProfile,
    explanation: visibility.explanation,
  };
}

export function toExpertRecommendationView(rec: ExpertRecommendation) {
  return {
    recommendation_id: rec.recommendationId,
    expert_id: rec.expertId,
    display_name: rec.displayName,
    role: rec.role,
    target_skill: rec.targetSkill,
    match_score: rec.matchScore,
    distance_km: rec.distanceKm,
    distance_label: rec.distanceLabel,
    message: rec.message,
    visibility_channel: rec.visibilityChannel,
    explanation: rec.explanation,
  };
}

export function toExpertContributionView(contribution: ExpertContribution) {
  return {
    contribution_id: contribution.contributionId,
    expert_id: contribution.expertId,
    expert_name: contribution.expertName,
    type: contribution.type,
    title: contribution.title,
    description: contribution.description,
    impact_label: contribution.impactLabel,
    contributed_at: contribution.contributedAt,
  };
}

export function toExpertNetworkStatisticsView(stats: ExpertNetworkStatistics) {
  return {
    total_experts: stats.totalExperts,
    total_roles_assigned: stats.totalRolesAssigned,
    average_impact_score: stats.averageImpactScore,
    total_knowledge_contributions: stats.totalKnowledgeContributions,
    role_distribution: stats.roleDistribution,
    generated_at: stats.generatedAt,
  };
}

export function toRoleCatalogView(experts: SeedNetworkExpert[]) {
  const distribution = buildRoleDistribution(experts);
  return {
    roles: (Object.keys(ROLE_LABELS) as ExpertRole[]).map((role) => ({
      role,
      label: ROLE_LABELS[role],
      expert_count: distribution[role] ?? 0,
    })),
    total_assignments: Object.values(distribution).reduce((sum, c) => sum + c, 0),
  };
}
