import type { RISK_LEVELS, TEAM_ROLES } from "./team-builder-schema.js";
import { READINESS_WEIGHTS, TEAM_BUILDER_SCHEMA_VERSION } from "./team-builder-schema.js";
import type { TeamBuilderContext } from "./team-builder-context.js";
import type { SeedNetworkExpert } from "../../expert-network/domain/expert-network-seed.js";

export type TeamRoleType = (typeof TEAM_ROLES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface TeamMember {
  memberId: string;
  expertId: string;
  displayName: string;
  assignedRoles: TeamRoleType[];
  primaryRole: TeamRoleType;
  skills: string[];
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  experienceYears: number;
  distanceKm: number;
  availabilityScore: number;
  isTeamLeader: boolean;
}

export interface TeamRoleAssignment {
  role: TeamRoleType;
  label: string;
  memberId: string;
  memberName: string;
  filled: boolean;
}

export interface TeamCompatibility {
  score: number;
  skillComplementarity: number;
  experienceBalance: number;
  trustCompatibility: number;
  liveFrameBalance: number;
  passportStrength: number;
  geographicProximity: number;
  communicationBalance: number;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface TeamCoverage {
  coverageScore: number;
  requiredSkills: string[];
  coveredSkills: string[];
  missingSkills: string[];
  roleCoverage: TeamRoleAssignment[];
  explanation: string;
}

export interface TeamReadiness {
  overallScore: number;
  professionalReadiness: number;
  coverageScore: number;
  trustScore: number;
  availabilityScore: number;
  factors: Array<{
    factorId: string;
    label: string;
    score: number;
    weight: number;
    contribution: number;
  }>;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface TeamRisk {
  riskId: string;
  level: RiskLevel;
  category: string;
  title: string;
  message: string;
  mitigation: string;
}

export interface TeamRecommendation {
  recommendationId: string;
  listingId: string;
  listingTitle: string;
  headline: string;
  members: TeamMember[];
  teamLeader: TeamMember;
  assignedRoles: TeamRoleAssignment[];
  coverageScore: number;
  trustScore: number;
  readinessScore: number;
  completionConfidence: number;
  missingSkills: string[];
  suggestedImprovements: string[];
  strengths: string[];
  risks: TeamRisk[];
  compatibility: TeamCompatibility;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
  readOnly: true;
}

export interface TeamProfile {
  profileId: string;
  userId: string;
  listingId: string;
  members: TeamMember[];
  recommendation: TeamRecommendation;
  compatibility: TeamCompatibility;
  readiness: TeamReadiness;
  coverage: TeamCoverage;
  risks: TeamRisk[];
}

export interface TeamValidation {
  valid: boolean;
  teamReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface TeamSummary {
  schemaVersion: typeof TEAM_BUILDER_SCHEMA_VERSION;
  userId: string;
  headline: string;
  subheadline: string;
  listingId: string;
  listingTitle: string;
  memberCount: number;
  coverageScore: number;
  trustScore: number;
  readinessScore: number;
  completionConfidence: number;
  missingRoleCount: number;
  recommendation: TeamRecommendation;
  readOnly: true;
  generatedAt: string;
}

export interface TeamBuilderStatistics {
  totalProfiles: number;
  averageCoverageScore: number;
  averageReadinessScore: number;
  averageCompletionConfidence: number;
  generatedAt: string;
}

const ROLE_LABELS: Record<TeamRoleType, string> = {
  team_leader: "Team Leader",
  technical_expert: "Technical Expert",
  field_specialist: "Field Specialist",
  quality_reviewer: "Quality Reviewer",
  supervisor: "Supervisor",
  safety_officer: "Safety Officer",
  consultant: "Consultant",
  apprentice: "Apprentice",
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

function availabilityScore(expert: SeedNetworkExpert): number {
  return Math.min(100, 70 + (stableHash(expert.expertId) % 25) - Math.min(10, expert.distanceKm));
}

function scoreCandidate(expert: SeedNetworkExpert, skill: string, context: TeamBuilderContext): number {
  const skillMatch = expert.skills.includes(skill) ? 45 : expert.skills.some((s) => skill.includes(s.split("_")[0]!)) ? 25 : 0;
  const trustBoost = expert.trustScore * 0.3;
  const experienceBoost = Math.min(15, expert.experienceYears);
  const distancePenalty = Math.min(12, expert.distanceKm * 1.5);
  const teamBoost = expert.teamsSupported * 2;
  return Math.round(skillMatch + trustBoost + experienceBoost + teamBoost - distancePenalty + (stableHash(`${context.listing.id}:${expert.expertId}`) % 8));
}

function assignTeamRole(expert: SeedNetworkExpert, context: TeamBuilderContext): TeamRoleType {
  if (expert.roles.includes("supervisor") && expert.supervisedProjects >= 20) return "supervisor";
  if (expert.skills.includes("safety_compliance")) return "safety_officer";
  if (expert.roles.includes("reviewer") && expert.reviewedWork >= 50) return "quality_reviewer";
  if (expert.roles.includes("consultant") || expert.roles.includes("retired_expert")) return "consultant";
  if (expert.experienceYears >= 10 && expert.trustScore >= 85) return "technical_expert";
  if (expert.experienceYears <= 6) return "apprentice";
  if (context.executionComplexity === "high" || context.executionComplexity === "expert") {
    return expert.trustScore >= 80 ? "technical_expert" : "field_specialist";
  }
  return "field_specialist";
}

function requiredTeamRoles(context: TeamBuilderContext): TeamRoleType[] {
  const roles: TeamRoleType[] = ["team_leader", "field_specialist"];
  if (context.requiredSkills.some((s) => s.includes("electrical") || s.includes("hvac") || s.includes("diagnostic"))) {
    roles.push("technical_expert");
  }
  if (context.executionComplexity === "high" || context.executionComplexity === "expert") {
    roles.push("supervisor", "quality_reviewer");
  }
  if (context.requiredSkills.some((s) => s.includes("safety")) || context.listing.category.toLowerCase().includes("safety")) {
    roles.push("safety_officer");
  }
  if (context.executionComplexity === "moderate" || context.executionComplexity === "high") {
    roles.push("apprentice");
  }
  return [...new Set(roles)];
}

export function buildTeamMembers(context: TeamBuilderContext): TeamMember[] {
  const usedExperts = new Set<string>();
  const members: TeamMember[] = [];

  const leaderCandidates = [...context.candidatePool].sort(
    (left, right) =>
      right.trustScore + right.teamsSupported * 3 - left.trustScore - left.teamsSupported * 3
  );
  const leader = leaderCandidates[0];
  if (!leader) return members;

  usedExperts.add(leader.expertId);
  members.push({
    memberId: `member://${leader.expertId}`,
    expertId: leader.expertId,
    displayName: leader.displayName,
    assignedRoles: ["team_leader", assignTeamRole(leader, context)],
    primaryRole: "team_leader",
    skills: leader.skills,
    trustScore: leader.trustScore,
    liveFrameTier: leader.liveFrameTier,
    passportLevel: leader.passportLevel,
    experienceYears: leader.experienceYears,
    distanceKm: leader.distanceKm,
    availabilityScore: availabilityScore(leader),
    isTeamLeader: true,
  });

  for (const skill of context.requiredSkills) {
    const candidates = context.candidatePool
      .filter((expert) => !usedExperts.has(expert.expertId))
      .map((expert) => ({ expert, score: scoreCandidate(expert, skill, context) }))
      .filter((entry) => entry.score >= 50)
      .sort((left, right) => right.score - left.score);

    const pick = candidates[0]?.expert;
    if (!pick) continue;

    usedExperts.add(pick.expertId);
    const role = assignTeamRole(pick, context);
    members.push({
      memberId: `member://${pick.expertId}`,
      expertId: pick.expertId,
      displayName: pick.displayName,
      assignedRoles: [role],
      primaryRole: role,
      skills: pick.skills,
      trustScore: pick.trustScore,
      liveFrameTier: pick.liveFrameTier,
      passportLevel: pick.passportLevel,
      experienceYears: pick.experienceYears,
      distanceKm: pick.distanceKm,
      availabilityScore: availabilityScore(pick),
      isTeamLeader: false,
    });
  }

  if (members.length < 3 && context.candidatePool.length > members.length) {
    for (const expert of context.candidatePool) {
      if (usedExperts.has(expert.expertId)) continue;
      if (members.length >= 4) break;
      usedExperts.add(expert.expertId);
      const role = assignTeamRole(expert, context);
      members.push({
        memberId: `member://${expert.expertId}`,
        expertId: expert.expertId,
        displayName: expert.displayName,
        assignedRoles: [role],
        primaryRole: role,
        skills: expert.skills,
        trustScore: expert.trustScore,
        liveFrameTier: expert.liveFrameTier,
        passportLevel: expert.passportLevel,
        experienceYears: expert.experienceYears,
        distanceKm: expert.distanceKm,
        availabilityScore: availabilityScore(expert),
        isTeamLeader: false,
      });
    }
  }

  return members;
}

export function buildTeamCoverage(context: TeamBuilderContext, members: TeamMember[]): TeamCoverage {
  const allSkills = new Set(members.flatMap((member) => member.skills));
  const coveredSkills = context.requiredSkills.filter((skill) =>
    [...allSkills].some((s) => s === skill || s.includes(skill.split("_")[0]!))
  );
  const missingSkills = context.requiredSkills.filter((skill) => !coveredSkills.includes(skill));
  const coverageScore =
    context.requiredSkills.length === 0
      ? 100
      : Math.round((coveredSkills.length / context.requiredSkills.length) * 100);

  const requiredRoles = requiredTeamRoles(context);
  const roleCoverage: TeamRoleAssignment[] = requiredRoles.map((role) => {
    const member = members.find((m) => m.assignedRoles.includes(role) || m.primaryRole === role);
    return {
      role,
      label: ROLE_LABELS[role],
      memberId: member?.memberId ?? "",
      memberName: member?.displayName ?? "",
      filled: Boolean(member),
    };
  });

  return {
    coverageScore,
    requiredSkills: context.requiredSkills,
    coveredSkills,
    missingSkills,
    roleCoverage,
    explanation:
      missingSkills.length === 0
        ? `This team covers ${coverageScore}% of the required skills.`
        : `This team covers ${coverageScore}% of the required skills. Only ${missingSkills.length} specialist(s) still missing.`,
  };
}

export function buildTeamCompatibility(context: TeamBuilderContext, members: TeamMember[]): TeamCompatibility {
  if (members.length === 0) {
    return {
      score: 0,
      skillComplementarity: 0,
      experienceBalance: 0,
      trustCompatibility: 0,
      liveFrameBalance: 0,
      passportStrength: 0,
      geographicProximity: 0,
      communicationBalance: 0,
      explanation: {
        headline: "No team assembled",
        reasons: [],
        summary: "Insufficient candidates for compatibility analysis.",
      },
    };
  }

  const uniqueSkills = new Set(members.flatMap((m) => m.skills));
  const skillComplementarity = Math.min(
    100,
    Math.round((uniqueSkills.size / Math.max(context.requiredSkills.length, 1)) * 80)
  );
  const experienceValues = members.map((m) => m.experienceYears);
  const experienceSpread = Math.max(...experienceValues) - Math.min(...experienceValues);
  const experienceBalance = Math.min(100, 60 + experienceSpread * 3);
  const avgTrust = members.reduce((sum, m) => sum + m.trustScore, 0) / members.length;
  const trustSpread = Math.max(...members.map((m) => m.trustScore)) - Math.min(...members.map((m) => m.trustScore));
  const trustCompatibility = Math.min(100, Math.round(avgTrust * 0.7 + (20 - trustSpread)));
  const tiers = new Set(members.map((m) => m.liveFrameTier));
  const liveFrameBalance = Math.min(100, tiers.size >= 2 ? 85 : 70);
  const passportStrength = Math.min(
    100,
    Math.round(members.filter((m) => m.passportLevel === "Gold").length * 25 + avgTrust * 0.5)
  );
  const avgDistance = members.reduce((sum, m) => sum + m.distanceKm, 0) / members.length;
  const geographicProximity = Math.min(100, Math.round(100 - avgDistance * 4));
  const communicationBalance = Math.min(
    100,
    Math.round(members.filter((m) => m.skills.includes("customer_communication")).length * 20 + 65)
  );

  const score = Math.round(
    skillComplementarity * 0.2 +
      experienceBalance * 0.12 +
      trustCompatibility * 0.2 +
      liveFrameBalance * 0.1 +
      passportStrength * 0.13 +
      geographicProximity * 0.15 +
      communicationBalance * 0.1
  );

  return {
    score,
    skillComplementarity,
    experienceBalance,
    trustCompatibility,
    liveFrameBalance,
    passportStrength,
    geographicProximity,
    communicationBalance,
    explanation: {
      headline: `Team compatibility: ${score}/100`,
      reasons: [
        `Skill complementarity: ${skillComplementarity}%`,
        `Trust compatibility: ${trustCompatibility}%`,
        `Geographic proximity: ${geographicProximity}%`,
        `Experience balance across ${members.length} members`,
      ],
      summary: "Balanced combination of skills, trust, experience, and compatibility.",
    },
  };
}

export function buildTeamReadiness(
  context: TeamBuilderContext,
  members: TeamMember[],
  coverage: TeamCoverage
): TeamReadiness {
  const professionalReadiness = Math.min(
    100,
    Math.round(
      members.reduce((sum, m) => sum + m.trustScore, 0) / Math.max(members.length, 1) * 0.6 +
        context.requesterTrustScore * 0.2
    )
  );
  const coverageScore = coverage.coverageScore;
  const trustScore = Math.min(
    100,
    Math.round(members.reduce((sum, m) => sum + m.trustScore, 0) / Math.max(members.length, 1))
  );
  const availabilityScore = Math.min(
    100,
    Math.round(members.reduce((sum, m) => sum + m.availabilityScore, 0) / Math.max(members.length, 1))
  );

  const factors = [
    {
      factorId: "factor://professional",
      label: "Professional Readiness",
      score: professionalReadiness,
      weight: READINESS_WEIGHTS.professional,
      contribution: Math.round(professionalReadiness * READINESS_WEIGHTS.professional),
    },
    {
      factorId: "factor://coverage",
      label: "Skill Coverage",
      score: coverageScore,
      weight: READINESS_WEIGHTS.coverage,
      contribution: Math.round(coverageScore * READINESS_WEIGHTS.coverage),
    },
    {
      factorId: "factor://trust",
      label: "Team Trust",
      score: trustScore,
      weight: READINESS_WEIGHTS.trust,
      contribution: Math.round(trustScore * READINESS_WEIGHTS.trust),
    },
    {
      factorId: "factor://availability",
      label: "Availability",
      score: availabilityScore,
      weight: READINESS_WEIGHTS.availability,
      contribution: Math.round(availabilityScore * READINESS_WEIGHTS.availability),
    },
  ];

  const overallScore = Math.min(100, factors.reduce((sum, factor) => sum + factor.contribution, 0));

  return {
    overallScore,
    professionalReadiness,
    coverageScore,
    trustScore,
    availabilityScore,
    factors,
    explanation: {
      headline: `Team readiness: ${overallScore}%`,
      reasons: factors.map(
        (factor) => `${factor.label}: ${factor.score}% (weight ${Math.round(factor.weight * 100)}%)`
      ),
      summary: "Readiness combines professional strength, coverage, trust, and availability.",
    },
  };
}

export function buildTeamRisks(
  context: TeamBuilderContext,
  members: TeamMember[],
  coverage: TeamCoverage
): TeamRisk[] {
  const risks: TeamRisk[] = [];

  if (coverage.missingSkills.length > 0) {
    risks.push({
      riskId: `risk://skills/${context.listing.id}`,
      level: coverage.missingSkills.length > 1 ? "high" : "moderate",
      category: "skill_gap",
      title: "Missing specialist skills",
      message: `Missing: ${coverage.missingSkills.map(formatLabel).join(", ")}`,
      mitigation: "Add a specialist from the expert network or Learn by Action.",
    });
  }

  const avgTrust = members.reduce((sum, m) => sum + m.trustScore, 0) / Math.max(members.length, 1);
  if (avgTrust < 75) {
    risks.push({
      riskId: `risk://trust/${context.listing.id}`,
      level: "moderate",
      category: "trust",
      title: "Below-average team trust",
      message: `Average team trust score: ${Math.round(avgTrust)}`,
      mitigation: "Include a gold-frame supervisor to strengthen trust balance.",
    });
  }

  const unfilledRoles = coverage.roleCoverage.filter((role) => !role.filled);
  if (unfilledRoles.length > 0) {
    risks.push({
      riskId: `risk://roles/${context.listing.id}`,
      level: unfilledRoles.length > 2 ? "high" : "moderate",
      category: "missing_roles",
      title: "Unfilled team roles",
      message: `Missing roles: ${unfilledRoles.map((r) => r.label).join(", ")}`,
      mitigation: "Expand candidate pool or adjust role assignments.",
    });
  }

  if (context.executionComplexity === "expert" && members.length < 4) {
    risks.push({
      riskId: `risk://size/${context.listing.id}`,
      level: "high",
      category: "team_size",
      title: "Team may be undersized",
      message: "Expert-complexity listing recommends at least 4 team members.",
      mitigation: "Add a technical expert and quality reviewer.",
    });
  }

  if (risks.length === 0) {
    risks.push({
      riskId: `risk://none/${context.listing.id}`,
      level: "low",
      category: "general",
      title: "Low execution risk",
      message: "Team profile shows strong coverage and trust balance.",
      mitigation: "Proceed with recommended team composition.",
    });
  }

  return risks;
}

export function buildTeamRecommendation(context: TeamBuilderContext): TeamRecommendation {
  const members = buildTeamMembers(context);
  const coverage = buildTeamCoverage(context, members);
  const compatibility = buildTeamCompatibility(context, members);
  const readiness = buildTeamReadiness(context, members, coverage);
  const risks = buildTeamRisks(context, members, coverage);
  const teamLeader = members.find((m) => m.isTeamLeader) ?? members[0]!;

  const completionConfidence = Math.min(
    98,
    Math.round(readiness.overallScore * 0.45 + coverage.coverageScore * 0.35 + compatibility.score * 0.2)
  );

  const strengths: string[] = [];
  if (coverage.coverageScore >= 90) strengths.push(`Covers ${coverage.coverageScore}% of required skills`);
  if (readiness.trustScore >= 80) strengths.push("High team trust score");
  if (members.some((m) => m.passportLevel === "Gold")) strengths.push("Gold-frame professionals on team");
  if (compatibility.geographicProximity >= 70) strengths.push("Strong geographic proximity");
  if (strengths.length === 0) strengths.push("Balanced skill mix for this listing");

  const suggestedImprovements: string[] = [];
  if (coverage.missingSkills.length > 0) {
    suggestedImprovements.push(`Add specialist for ${formatLabel(coverage.missingSkills[0]!)}`);
  }
  const unfilled = coverage.roleCoverage.filter((r) => !r.filled);
  if (unfilled.length > 0) {
    suggestedImprovements.push(`Assign ${unfilled[0]!.label}`);
  }
  if (readiness.availabilityScore < 75) {
    suggestedImprovements.push("Confirm member availability before scheduling");
  }

  return {
    recommendationId: `team://rec/${context.listing.id}/${context.userId}`,
    listingId: context.listing.id,
    listingTitle: context.listing.title,
    headline: "Best team found.",
    members,
    teamLeader,
    assignedRoles: coverage.roleCoverage,
    coverageScore: coverage.coverageScore,
    trustScore: readiness.trustScore,
    readinessScore: readiness.overallScore,
    completionConfidence,
    missingSkills: coverage.missingSkills,
    suggestedImprovements,
    strengths,
    risks,
    compatibility,
    explanation: {
      headline: `Recommended team for ${context.listing.title}`,
      reasons: [
        `${members.length} members with ${coverage.coverageScore}% skill coverage`,
        `Team trust: ${readiness.trustScore}% · Readiness: ${readiness.overallScore}%`,
        `Completion confidence: ${completionConfidence}%`,
        compatibility.explanation.summary,
      ],
      summary:
        coverage.missingSkills.length === 0
          ? `This team covers ${coverage.coverageScore}% of the required skills.`
          : `This team covers ${coverage.coverageScore}% of the required skills. Only ${coverage.missingSkills.length} specialist(s) still missing.`,
    },
    readOnly: true,
  };
}

export function buildTeamProfile(context: TeamBuilderContext): TeamProfile {
  const members = buildTeamMembers(context);
  const recommendation = buildTeamRecommendation(context);
  const coverage = buildTeamCoverage(context, members);
  const compatibility = buildTeamCompatibility(context, members);
  const readiness = buildTeamReadiness(context, members, coverage);
  const risks = buildTeamRisks(context, members, coverage);

  return {
    profileId: `team://profile/${context.userId}/${context.listing.id}`,
    userId: context.userId,
    listingId: context.listing.id,
    members,
    recommendation,
    compatibility,
    readiness,
    coverage,
    risks,
  };
}

export function validateTeamBuilderContext(context: TeamBuilderContext): TeamValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!context.userId) errors.push("user_id is required");
  if (context.candidatePool.length < 3) warnings.push("Limited expert candidate pool");
  if (context.requiredSkills.length === 0) warnings.push("Listing has no explicit required skills");
  return {
    valid: errors.length === 0,
    teamReady: errors.length === 0 && context.candidatePool.length >= 3,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Team builder context is valid and ready."
        : "Team builder context failed validation.",
  };
}

export function buildTeamSummary(context: TeamBuilderContext): TeamSummary {
  const profile = buildTeamProfile(context);
  const missingRoleCount = profile.coverage.roleCoverage.filter((role) => !role.filled).length;

  return {
    schemaVersion: TEAM_BUILDER_SCHEMA_VERSION,
    userId: context.userId,
    headline: profile.recommendation.headline,
    subheadline: profile.recommendation.explanation.summary,
    listingId: context.listing.id,
    listingTitle: context.listing.title,
    memberCount: profile.members.length,
    coverageScore: profile.recommendation.coverageScore,
    trustScore: profile.recommendation.trustScore,
    readinessScore: profile.recommendation.readinessScore,
    completionConfidence: profile.recommendation.completionConfidence,
    missingRoleCount,
    recommendation: profile.recommendation,
    readOnly: true,
    generatedAt: context.generatedAt,
  };
}

export function buildTeamBuilderStatistics(summaries: TeamSummary[]): TeamBuilderStatistics {
  if (summaries.length === 0) {
    return {
      totalProfiles: 0,
      averageCoverageScore: 0,
      averageReadinessScore: 0,
      averageCompletionConfidence: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    totalProfiles: summaries.length,
    averageCoverageScore: Math.round(
      summaries.reduce((sum, s) => sum + s.coverageScore, 0) / summaries.length
    ),
    averageReadinessScore: Math.round(
      summaries.reduce((sum, s) => sum + s.readinessScore, 0) / summaries.length
    ),
    averageCompletionConfidence: Math.round(
      summaries.reduce((sum, s) => sum + s.completionConfidence, 0) / summaries.length
    ),
    generatedAt: new Date().toISOString(),
  };
}

export function collectTeamBuilderPaths(rootDir: string): string[] {
  return [`${rootDir}/src/team-builder`];
}

export function toTeamSummaryView(summary: TeamSummary) {
  return {
    schema_version: summary.schemaVersion,
    user_id: summary.userId,
    headline: summary.headline,
    subheadline: summary.subheadline,
    listing_id: summary.listingId,
    listing_title: summary.listingTitle,
    member_count: summary.memberCount,
    coverage_score: summary.coverageScore,
    trust_score: summary.trustScore,
    readiness_score: summary.readinessScore,
    completion_confidence: summary.completionConfidence,
    missing_role_count: summary.missingRoleCount,
    read_only: summary.readOnly,
    generated_at: summary.generatedAt,
  };
}

export function toTeamMemberView(member: TeamMember) {
  return {
    member_id: member.memberId,
    expert_id: member.expertId,
    display_name: member.displayName,
    assigned_roles: member.assignedRoles,
    primary_role: member.primaryRole,
    skills: member.skills,
    trust_score: member.trustScore,
    live_frame_tier: member.liveFrameTier,
    passport_level: member.passportLevel,
    experience_years: member.experienceYears,
    distance_km: member.distanceKm,
    availability_score: member.availabilityScore,
    is_team_leader: member.isTeamLeader,
  };
}

export function toTeamRecommendationView(rec: TeamRecommendation) {
  return {
    recommendation_id: rec.recommendationId,
    listing_id: rec.listingId,
    listing_title: rec.listingTitle,
    headline: rec.headline,
    members: rec.members.map(toTeamMemberView),
    team_leader: toTeamMemberView(rec.teamLeader),
    assigned_roles: rec.assignedRoles.map((role) => ({
      role: role.role,
      label: role.label,
      member_id: role.memberId,
      member_name: role.memberName,
      filled: role.filled,
    })),
    coverage_score: rec.coverageScore,
    trust_score: rec.trustScore,
    readiness_score: rec.readinessScore,
    completion_confidence: rec.completionConfidence,
    missing_skills: rec.missingSkills,
    suggested_improvements: rec.suggestedImprovements,
    strengths: rec.strengths,
    risks: rec.risks.map(toTeamRiskView),
    compatibility: toTeamCompatibilityView(rec.compatibility),
    explanation: rec.explanation,
    read_only: rec.readOnly,
  };
}

export function toTeamCompatibilityView(compatibility: TeamCompatibility) {
  return {
    score: compatibility.score,
    skill_complementarity: compatibility.skillComplementarity,
    experience_balance: compatibility.experienceBalance,
    trust_compatibility: compatibility.trustCompatibility,
    live_frame_balance: compatibility.liveFrameBalance,
    passport_strength: compatibility.passportStrength,
    geographic_proximity: compatibility.geographicProximity,
    communication_balance: compatibility.communicationBalance,
    explanation: compatibility.explanation,
  };
}

export function toTeamReadinessView(readiness: TeamReadiness) {
  return {
    overall_score: readiness.overallScore,
    professional_readiness: readiness.professionalReadiness,
    coverage_score: readiness.coverageScore,
    trust_score: readiness.trustScore,
    availability_score: readiness.availabilityScore,
    factors: readiness.factors.map((factor) => ({
      factor_id: factor.factorId,
      label: factor.label,
      score: factor.score,
      weight: factor.weight,
      contribution: factor.contribution,
    })),
    explanation: readiness.explanation,
  };
}

export function toTeamCoverageView(coverage: TeamCoverage) {
  return {
    coverage_score: coverage.coverageScore,
    required_skills: coverage.requiredSkills,
    covered_skills: coverage.coveredSkills,
    missing_skills: coverage.missingSkills,
    role_coverage: coverage.roleCoverage.map((role) => ({
      role: role.role,
      label: role.label,
      member_id: role.memberId,
      member_name: role.memberName,
      filled: role.filled,
    })),
    explanation: coverage.explanation,
  };
}

export function toTeamRiskView(risk: TeamRisk) {
  return {
    risk_id: risk.riskId,
    level: risk.level,
    category: risk.category,
    title: risk.title,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toTeamBuilderStatisticsView(stats: TeamBuilderStatistics) {
  return {
    total_profiles: stats.totalProfiles,
    average_coverage_score: stats.averageCoverageScore,
    average_readiness_score: stats.averageReadinessScore,
    average_completion_confidence: stats.averageCompletionConfidence,
    generated_at: stats.generatedAt,
  };
}
