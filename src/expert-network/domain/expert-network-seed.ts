import type { EXPERT_ROLES } from "./expert-network-schema.js";

export type ExpertRoleType = (typeof EXPERT_ROLES)[number];

export interface SeedNetworkExpert {
  expertId: string;
  displayName: string;
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  experienceYears: number;
  completedActions: number;
  customerRating: number;
  skills: string[];
  roles: ExpertRoleType[];
  learnersTrained: number;
  trainingSuccessRate: number;
  supervisedProjects: number;
  reviewedWork: number;
  consultingSessions: number;
  knowledgeContributions: number;
  teamsSupported: number;
  disputesReviewed: number;
  blueprintsImproved: number;
  distanceKm: number;
  headline: string;
  summary: string;
}

export const SEED_NETWORK_EXPERTS: Omit<SeedNetworkExpert, "distanceKm">[] = [
  {
    expertId: "expert://maria-santos",
    displayName: "Maria Santos",
    trustScore: 88,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 12,
    completedActions: 340,
    customerRating: 4.8,
    skills: ["electrical_installation", "electrical_troubleshooting", "safety_compliance"],
    roles: ["service_expert", "trainer", "mentor"],
    learnersTrained: 42,
    trainingSuccessRate: 91,
    supervisedProjects: 28,
    reviewedWork: 65,
    consultingSessions: 12,
    knowledgeContributions: 8,
    teamsSupported: 5,
    disputesReviewed: 3,
    blueprintsImproved: 2,
    headline: "Electrical expert and trusted trainer",
    summary: "Gold-frame electrical specialist with strong training track record.",
  },
  {
    expertId: "expert://james-chen",
    displayName: "James Chen",
    trustScore: 79,
    liveFrameTier: "silver",
    passportLevel: "Silver",
    experienceYears: 8,
    completedActions: 185,
    customerRating: 4.6,
    skills: ["plumbing_repair", "hvac_systems", "tool_usage"],
    roles: ["service_expert", "supervisor", "reviewer"],
    learnersTrained: 18,
    trainingSuccessRate: 84,
    supervisedProjects: 45,
    reviewedWork: 120,
    consultingSessions: 6,
    knowledgeContributions: 4,
    teamsSupported: 8,
    disputesReviewed: 15,
    blueprintsImproved: 1,
    headline: "Plumbing supervisor and quality reviewer",
    summary: "Experienced supervisor with high review volume and team support.",
  },
  {
    expertId: "expert://aisha-patel",
    displayName: "Aisha Patel",
    trustScore: 92,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 15,
    completedActions: 420,
    customerRating: 4.9,
    skills: ["safety_compliance", "advanced_diagnostics", "project_coordination"],
    roles: ["service_expert", "trainer", "mentor", "supervisor", "knowledge_contributor"],
    learnersTrained: 67,
    trainingSuccessRate: 94,
    supervisedProjects: 52,
    reviewedWork: 88,
    consultingSessions: 24,
    knowledgeContributions: 22,
    teamsSupported: 12,
    disputesReviewed: 8,
    blueprintsImproved: 6,
    headline: "Platform-leading trainer and knowledge contributor",
    summary: "Top-tier mentor with highest training success and knowledge contributions.",
  },
  {
    expertId: "expert://carlos-rivera",
    displayName: "Carlos Rivera",
    trustScore: 74,
    liveFrameTier: "silver",
    passportLevel: "Silver",
    experienceYears: 6,
    completedActions: 95,
    customerRating: 4.4,
    skills: ["general_maintenance", "customer_communication", "electrical_installation"],
    roles: ["service_expert", "mentor"],
    learnersTrained: 12,
    trainingSuccessRate: 78,
    supervisedProjects: 8,
    reviewedWork: 22,
    consultingSessions: 3,
    knowledgeContributions: 2,
    teamsSupported: 2,
    disputesReviewed: 1,
    blueprintsImproved: 0,
    headline: "Accessible mentor for beginner professionals",
    summary: "Silver-frame mentor focused on beginner marketplace actions.",
  },
  {
    expertId: "expert://elena-volkov",
    displayName: "Elena Volkov",
    trustScore: 85,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 10,
    completedActions: 260,
    customerRating: 4.7,
    skills: ["electrical_troubleshooting", "hvac_systems", "quality_assurance"],
    roles: ["service_expert", "trainer", "reviewer", "consultant"],
    learnersTrained: 35,
    trainingSuccessRate: 89,
    supervisedProjects: 18,
    reviewedWork: 95,
    consultingSessions: 18,
    knowledgeContributions: 11,
    teamsSupported: 6,
    disputesReviewed: 12,
    blueprintsImproved: 3,
    headline: "Technical trainer and consulting specialist",
    summary: "Gold-frame consultant with strong review and training capabilities.",
  },
  {
    expertId: "expert://robert-kim",
    displayName: "Robert Kim",
    trustScore: 86,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 22,
    completedActions: 580,
    customerRating: 4.9,
    skills: ["project_coordination", "team_leadership", "quality_assurance", "advanced_diagnostics"],
    roles: ["retired_expert", "consultant", "knowledge_contributor", "reviewer"],
    learnersTrained: 28,
    trainingSuccessRate: 92,
    supervisedProjects: 0,
    reviewedWork: 45,
    consultingSessions: 56,
    knowledgeContributions: 34,
    teamsSupported: 4,
    disputesReviewed: 22,
    blueprintsImproved: 9,
    headline: "Retired expert available for consulting",
    summary: "Retired professional offering consulting and knowledge bank contributions.",
  },
  {
    expertId: "expert://sophia-martinez",
    displayName: "Sophia Martinez",
    trustScore: 81,
    liveFrameTier: "silver",
    passportLevel: "Silver",
    experienceYears: 9,
    completedActions: 210,
    customerRating: 4.5,
    skills: ["hvac_systems", "safety_compliance", "tool_usage"],
    roles: ["service_expert", "trainer", "supervisor"],
    learnersTrained: 24,
    trainingSuccessRate: 86,
    supervisedProjects: 32,
    reviewedWork: 40,
    consultingSessions: 8,
    knowledgeContributions: 6,
    teamsSupported: 7,
    disputesReviewed: 5,
    blueprintsImproved: 2,
    headline: "Trusted supervisor for field teams",
    summary: "Silver-frame supervisor with strong team and project oversight.",
  },
];

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function assignExpertDistances(
  userId: string,
  experts: Omit<SeedNetworkExpert, "distanceKm">[]
): SeedNetworkExpert[] {
  return experts
    .map((expert, index) => ({
      ...expert,
      distanceKm: 1 + ((stableHash(`${userId}:${expert.expertId}`) + index) % 15),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);
}

export function getSeedExpertsForUser(userId: string): SeedNetworkExpert[] {
  return assignExpertDistances(userId, SEED_NETWORK_EXPERTS);
}

export function getSeedExpertById(expertId: string, userId: string): SeedNetworkExpert | undefined {
  return getSeedExpertsForUser(userId).find((expert) => expert.expertId === expertId);
}
