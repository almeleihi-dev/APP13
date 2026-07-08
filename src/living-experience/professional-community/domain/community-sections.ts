import type { CollaborationRequestType, HelpfulContributionType } from "./community-schema.js";
import type { LivingProfessionalCommunityContext } from "./community-context.js";
import {
  computeContributionScore,
  hashCommunitySeed,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./community-context.js";

export interface CommunityEngineSnapshot {
  readinessScore?: number;
  todaysHighlight?: { title: string; description: string };
  nextCommunityAction?: { title: string; description: string };
  knowledgeItems?: Array<{ title: string; category: string }>;
  expertLabels?: string[];
  challenges?: string[];
}

export interface CommunitySectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface CommunityOverviewSection extends CommunitySectionBase {
  sectionId: "community_overview";
  professionalSummary: string;
  communitiesJoined: number;
  contributionScore: number;
  activityLevel: string;
}

export interface TodaysCommunityHighlightSection extends CommunitySectionBase {
  sectionId: "todays_community_highlight";
  highlight: { highlightId: string; title: string; summary: string; category: string };
  why: string;
}

export interface ProfessionalGroupsSection extends CommunitySectionBase {
  sectionId: "professional_groups";
  groups: Array<{ groupId: string; name: string; filter: string; memberCount: number; summary: string }>;
}

export interface NearbyProfessionalsSection extends CommunitySectionBase {
  sectionId: "nearby_professionals";
  professionals: Array<{
    professionalId: string;
    name: string;
    profession: string;
    city: string;
    compatibilityScore: number;
    compatibilityReason: string;
  }>;
}

export interface QuestionsAndAnswersSection extends CommunitySectionBase {
  sectionId: "questions_and_answers";
  openQuestions: Array<{ questionId: string; title: string; category: string; answers: number }>;
  verifiedAnswers: Array<{ answerId: string; questionTitle: string; verified: boolean; summary: string }>;
  solvedQuestions: string[];
  recommendedDiscussions: string[];
}

export interface KnowledgeContributionsSection extends CommunitySectionBase {
  sectionId: "knowledge_contributions";
  contributions: Array<{
    contributionId: string;
    title: string;
    type: "blueprint" | "guide" | "lesson_learned" | "verified_knowledge";
    verified: boolean;
    knowledgeBankLinked: boolean;
  }>;
}

export interface HelpfulContributionsSection extends CommunitySectionBase {
  sectionId: "helpful_contributions";
  contributions: Array<{
    contributionId: string;
    title: string;
    author: string;
    recognition: Record<HelpfulContributionType, number>;
    noLikes: true;
  }>;
  recognitionTypes: HelpfulContributionType[];
  noLikes: true;
}

export interface ExpertDiscussionsSection extends CommunitySectionBase {
  sectionId: "expert_discussions";
  discussions: Array<{ discussionId: string; title: string; expertType: string; summary: string; verified: boolean }>;
}

export interface CommunityChallengesSection extends CommunitySectionBase {
  sectionId: "community_challenges";
  challenges: Array<{ challengeId: string; title: string; type: string; summary: string; participants: number }>;
}

export interface ProfessionalEventsSection extends CommunitySectionBase {
  sectionId: "professional_events";
  events: Array<{ eventId: string; title: string; type: string; location: string; date: string }>;
}

export interface CollaborationRequestsSection extends CommunitySectionBase {
  sectionId: "collaboration_requests";
  requests: Array<{
    requestId: string;
    title: string;
    type: CollaborationRequestType;
    summary: string;
    recommendationOnly: true;
  }>;
}

export interface CommunityReputationSection extends CommunitySectionBase {
  sectionId: "community_reputation";
  contributionScore: number;
  knowledgeScore: number;
  helpfulnessScore: number;
  verificationLevel: string;
  professionalInfluence: string;
  scoreExplanations: Record<string, string>;
}

export interface NextRecommendedCommunityActionSection extends CommunitySectionBase {
  sectionId: "next_recommended_community_action";
  recommendation: string;
  why: string;
  expectedBenefit: string;
  estimatedEffortMinutes: number;
}

export type LivingProfessionalCommunitySection =
  | CommunityOverviewSection
  | TodaysCommunityHighlightSection
  | ProfessionalGroupsSection
  | NearbyProfessionalsSection
  | QuestionsAndAnswersSection
  | KnowledgeContributionsSection
  | HelpfulContributionsSection
  | ExpertDiscussionsSection
  | CommunityChallengesSection
  | ProfessionalEventsSection
  | CollaborationRequestsSection
  | CommunityReputationSection
  | NextRecommendedCommunityActionSection;

export function buildCommunityOverviewSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): CommunityOverviewSection {
  const score = computeContributionScore(context, engines.readinessScore);
  const industry = resolvePrimaryIndustry(context);

  return {
    sectionId: "community_overview",
    title: "Community Overview",
    headline: `${context.displayName}'s professional community`,
    description: "Your professional community at a glance — trust and contribution, not popularity.",
    professionalSummary: `${context.displayName} is an active ${industry} professional in ${context.geographic.city}.`,
    communitiesJoined: 2 + (hashCommunitySeed(context.dayKey, context.userId) % 4),
    contributionScore: score,
    activityLevel: score >= 60 ? "Active contributor" : "Growing member",
    explainable: true,
  };
}

export function buildTodaysCommunityHighlightSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): TodaysCommunityHighlightSection {
  const skill = resolvePrimarySkill(context);
  const title = engines.todaysHighlight?.title ?? `Best practice discussion: ${skill} in ${context.geographic.city}`;
  const why =
    engines.todaysHighlight?.description ??
    `Most valuable verified discussion for ${skill} professionals in ${context.geographic.preferredWorkRegion} today.`;

  return {
    sectionId: "todays_community_highlight",
    title: "Today's Community Highlight",
    headline: title,
    description: "Exactly one most valuable discussion — professional value over popularity.",
    highlight: {
      highlightId: `highlight://${context.dayKey}`,
      title,
      summary: why,
      category: "verified_discussion",
    },
    why,
    explainable: true,
  };
}

export function buildProfessionalGroupsSection(context: LivingProfessionalCommunityContext): ProfessionalGroupsSection {
  const skill = resolvePrimarySkill(context);
  const industry = resolvePrimaryIndustry(context);
  const cert = context.onboarding.professionalBackground?.certificates[0]?.replace(/_/g, " ") ?? skill;
  const hash = hashCommunitySeed(context.dayKey, context.userId);

  return {
    sectionId: "professional_groups",
    title: "Professional Groups",
    headline: "Groups matched to your profile",
    description: "By profession, action, industry, location, and certification.",
    groups: [
      { groupId: "grp://profession", name: `${industry} professionals`, filter: "profession", memberCount: 120 + hash, summary: `Peer group for ${industry} work.` },
      { groupId: "grp://action", name: `${skill} practitioners`, filter: "action", memberCount: 85 + hash, summary: `Collaborate on ${skill} projects.` },
      { groupId: "grp://city", name: `${context.geographic.city} professionals`, filter: "city", memberCount: 45 + hash, summary: `Local professional network in ${context.geographic.city}.` },
      { groupId: "grp://country", name: `${context.geographic.country} verified professionals`, filter: "country", memberCount: 500 + hash, summary: "National professional community." },
      { groupId: "grp://cert", name: `${cert} certified group`, filter: "certification", memberCount: 60 + hash, summary: `For ${cert} certified professionals.` },
      { groupId: "grp://industry", name: `${industry} industry network`, filter: "industry", memberCount: 200 + hash, summary: "Industry-specific knowledge sharing." },
    ],
    explainable: true,
  };
}

export function buildNearbyProfessionalsSection(context: LivingProfessionalCommunityContext): NearbyProfessionalsSection {
  const skill = resolvePrimarySkill(context);
  const hash = hashCommunitySeed(context.dayKey, context.userId);

  return {
    sectionId: "nearby_professionals",
    title: "Nearby Professionals",
    headline: `Professionals near ${context.geographic.city}`,
    description: "Same interests, profession, and goals — with explainable compatibility.",
    professionals: [
      {
        professionalId: `pro://near/1/${context.dayKey}`,
        name: "Regional peer professional",
        profession: skill,
        city: context.geographic.city,
        compatibilityScore: 88 + (hash % 10),
        compatibilityReason: `Shared ${skill} expertise and ${context.geographic.preferredWorkRegion} focus.`,
      },
      {
        professionalId: `pro://near/2/${context.dayKey}`,
        name: "Local collaborator",
        profession: resolvePrimaryIndustry(context),
        city: context.geographic.city,
        compatibilityScore: 82 + (hash % 8),
        compatibilityReason: "Similar professional goals and verified identity.",
      },
    ],
    explainable: true,
  };
}

export function buildQuestionsAndAnswersSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): QuestionsAndAnswersSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "questions_and_answers",
    title: "Questions & Answers",
    headline: "Professional Q&A with verified answers",
    description: "Ask, answer, and learn — every verified answer strengthens reputation.",
    openQuestions: [
      { questionId: "q://1", title: `Best practices for ${skill}?`, category: skill, answers: 3 },
      { questionId: "q://2", title: `Regulatory requirements in ${context.geographic.country}?`, category: "regulations", answers: 2 },
    ],
    verifiedAnswers: [
      {
        answerId: "a://1",
        questionTitle: `Safety compliance in ${context.geographic.city}`,
        verified: true,
        summary: "Verified answer from an experienced professional.",
      },
    ],
    solvedQuestions: ["How to verify professional credentials on APP13"],
    recommendedDiscussions: engines.challenges ?? [`${skill} professional standards`, "Regional best practices"],
    explainable: true,
  };
}

export function buildKnowledgeContributionsSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): KnowledgeContributionsSection {
  const skill = resolvePrimarySkill(context);
  const items = engines.knowledgeItems ?? [
    { title: `${skill} workflow blueprint`, category: "blueprint" },
    { title: "Lessons from recent project", category: "lesson_learned" },
  ];

  return {
    sectionId: "knowledge_contributions",
    title: "Knowledge Contributions",
    headline: "Verified knowledge for the community",
    description: "Blueprints, guides, and lessons linked to the Knowledge Bank.",
    contributions: items.map((item, i) => ({
      contributionId: `kb://contrib/${i}/${context.dayKey}`,
      title: item.title,
      type: item.category === "blueprint" ? "blueprint" as const : item.category === "guide" ? "guide" as const : "lesson_learned" as const,
      verified: i === 0,
      knowledgeBankLinked: true,
    })),
    explainable: true,
  };
}

export function buildHelpfulContributionsSection(context: LivingProfessionalCommunityContext): HelpfulContributionsSection {
  return {
    sectionId: "helpful_contributions",
    title: "Helpful Contributions",
    headline: "Recognition through professional value — no likes",
    description: "Helpful, Applied, Verified, and Professional recognition only.",
    contributions: [
      {
        contributionId: `help://1/${context.dayKey}`,
        title: "Verified safety checklist guide",
        author: "Community expert",
        recognition: { helpful: 12, applied: 8, verified: 5, professional: 15 },
        noLikes: true,
      },
      {
        contributionId: `help://2/${context.dayKey}`,
        title: "Regional project coordination tips",
        author: context.displayName,
        recognition: { helpful: 6, applied: 4, verified: 2, professional: 9 },
        noLikes: true,
      },
    ],
    recognitionTypes: ["helpful", "applied", "verified", "professional"],
    noLikes: true,
    explainable: true,
  };
}

export function buildExpertDiscussionsSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): ExpertDiscussionsSection {
  const labels = engines.expertLabels ?? ["Regional mentor", "Industry consultant"];

  return {
    sectionId: "expert_discussions",
    title: "Expert Discussions",
    headline: "Learn from verified experts",
    description: "Mentors, consultants, trainers, and industry leaders.",
    discussions: [
      { discussionId: "exp://1", title: labels[0] ?? "Expert mentorship session", expertType: "mentor", summary: "One-on-one professional guidance.", verified: true },
      { discussionId: "exp://2", title: "Industry standards review", expertType: "consultant", summary: "Expert-led quality discussion.", verified: true },
      { discussionId: "exp://3", title: `${resolvePrimarySkill(context)} training Q&A`, expertType: "trainer", summary: "Professional training discussion.", verified: true },
      { discussionId: "exp://4", title: "Leadership in professional teams", expertType: "industry_leader", summary: "Leadership and collaboration insights.", verified: true },
    ],
    explainable: true,
  };
}

export function buildCommunityChallengesSection(context: LivingProfessionalCommunityContext): CommunityChallengesSection {
  const skill = resolvePrimarySkill(context);
  const hash = hashCommunitySeed(context.dayKey, context.userId);

  return {
    sectionId: "community_challenges",
    title: "Community Challenges",
    headline: "Professional missions for growth",
    description: "Learning, action, knowledge, and team challenges.",
    challenges: [
      { challengeId: "chal://learn", title: `Learn advanced ${skill}`, type: "learning_mission", summary: "Complete a learning challenge this week.", participants: 25 + hash },
      { challengeId: "chal://action", title: "Verified action mission", type: "action_mission", summary: "Complete one verified professional action.", participants: 40 + hash },
      { challengeId: "chal://knowledge", title: "Knowledge contribution mission", type: "knowledge_mission", summary: "Share one verified knowledge item.", participants: 18 + hash },
      { challengeId: "chal://team", title: "Team collaboration mission", type: "team_mission", summary: "Collaborate with a regional professional.", participants: 12 + hash },
    ],
    explainable: true,
  };
}

export function buildProfessionalEventsSection(context: LivingProfessionalCommunityContext): ProfessionalEventsSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "professional_events",
    title: "Professional Events",
    headline: `Events in ${context.geographic.city} and online`,
    description: "Meetups, training, workshops, and conferences.",
    events: [
      { eventId: "evt://meetup", title: `${skill} professional meetup`, type: "meetup", location: context.geographic.city, date: context.dayKey },
      { eventId: "evt://workshop", title: "Regional skills workshop", type: "workshop", location: context.geographic.preferredWorkRegion, date: context.dayKey },
      { eventId: "evt://online", title: "Online professional session", type: "online_session", location: "Virtual", date: context.dayKey },
      { eventId: "evt://conf", title: `${resolvePrimaryIndustry(context)} conference`, type: "conference", location: context.geographic.country, date: context.dayKey },
    ],
    explainable: true,
  };
}

export function buildCollaborationRequestsSection(context: LivingProfessionalCommunityContext): CollaborationRequestsSection {
  const sq = context.onboarding.smartQuestions;
  const requests: CollaborationRequestsSection["requests"] = [
    { requestId: "collab://mentor", title: "Looking for mentor", type: "mentor", summary: "Seeking experienced guidance in your field.", recommendationOnly: true },
    { requestId: "collab://expert", title: "Looking for expert reviewer", type: "expert", summary: "Need expert review on professional work.", recommendationOnly: true },
    { requestId: "collab://team", title: "Looking for team members", type: "team", summary: "Building a professional project team.", recommendationOnly: true },
  ];
  if (sq?.enjoysTeaching) {
    requests.push({ requestId: "collab://trainer", title: "Looking for training partner", type: "trainer", summary: "Collaborate on professional training.", recommendationOnly: true });
  }
  requests.push({ requestId: "collab://reviewer", title: "Looking for quality reviewer", type: "reviewer", summary: "Professional quality review needed.", recommendationOnly: true });

  return {
    sectionId: "collaboration_requests",
    title: "Collaboration Requests",
    headline: "Connect for professional collaboration",
    description: "Recommendation only — professional connections, not social networking.",
    requests,
    explainable: true,
  };
}

export function buildCommunityReputationSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): CommunityReputationSection {
  const hash = hashCommunitySeed(context.dayKey, context.userId);
  const contribution = computeContributionScore(context, engines.readinessScore);
  const knowledge = Math.min(100, contribution - 5 + (hash % 15));
  const helpfulness = Math.min(100, contribution - 10 + (hash % 20));
  const iron = context.onboarding.ironVerification;

  return {
    sectionId: "community_reputation",
    title: "Community Reputation",
    headline: "Your professional standing in the community",
    description: "Every score is explainable — value over popularity.",
    contributionScore: contribution,
    knowledgeScore: knowledge,
    helpfulnessScore: helpfulness,
    verificationLevel: iron?.identityConfirmed ? "verified_identity" : "basic",
    professionalInfluence: contribution >= 70 ? "Trusted contributor" : "Growing influence",
    scoreExplanations: {
      contribution: "Based on verified actions, community participation, and identity verification.",
      knowledge: "Reflects verified knowledge contributions and Knowledge Bank links.",
      helpfulness: "Measured by Helpful, Applied, Verified, and Professional recognition — never likes.",
      verification: iron?.identityConfirmed ? "Identity verified — full community trust." : "Complete identity verification to increase trust.",
      influence: "Professional impact from helping, teaching, and verified answers.",
    },
    explainable: true,
  };
}

export function buildNextRecommendedCommunityActionSection(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): NextRecommendedCommunityActionSection {
  const hash = hashCommunitySeed(context.dayKey, context.userId);
  const action = engines.nextCommunityAction?.title ?? "Answer one professional question in your field";
  const why =
    engines.nextCommunityAction?.description ??
    `Highest community impact for ${resolvePrimarySkill(context)} professionals in ${context.geographic.city}.`;

  return {
    sectionId: "next_recommended_community_action",
    title: "Next Recommended Community Action",
    headline: action,
    description: "Exactly one action with highest professional community impact.",
    recommendation: action,
    why,
    expectedBenefit: "Strengthens community reputation through verified contribution.",
    estimatedEffortMinutes: 20 + (hash % 4) * 10,
    explainable: true,
  };
}

export function buildAllCommunitySections(
  context: LivingProfessionalCommunityContext,
  engines: CommunityEngineSnapshot
): LivingProfessionalCommunitySection[] {
  return [
    buildCommunityOverviewSection(context, engines),
    buildTodaysCommunityHighlightSection(context, engines),
    buildProfessionalGroupsSection(context),
    buildNearbyProfessionalsSection(context),
    buildQuestionsAndAnswersSection(context, engines),
    buildKnowledgeContributionsSection(context, engines),
    buildHelpfulContributionsSection(context),
    buildExpertDiscussionsSection(context, engines),
    buildCommunityChallengesSection(context),
    buildProfessionalEventsSection(context),
    buildCollaborationRequestsSection(context),
    buildCommunityReputationSection(context, engines),
    buildNextRecommendedCommunityActionSection(context, engines),
  ];
}

function sectionToView(section: LivingProfessionalCommunitySection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "community_overview":
      return {
        ...base,
        professional_summary: section.professionalSummary,
        communities_joined: section.communitiesJoined,
        contribution_score: section.contributionScore,
        activity_level: section.activityLevel,
      };
    case "todays_community_highlight":
      return { ...base, highlight: section.highlight, why: section.why };
    case "professional_groups":
      return { ...base, groups: section.groups };
    case "nearby_professionals":
      return { ...base, professionals: section.professionals };
    case "questions_and_answers":
      return {
        ...base,
        open_questions: section.openQuestions,
        verified_answers: section.verifiedAnswers,
        solved_questions: section.solvedQuestions,
        recommended_discussions: section.recommendedDiscussions,
      };
    case "knowledge_contributions":
      return { ...base, contributions: section.contributions };
    case "helpful_contributions":
      return {
        ...base,
        contributions: section.contributions,
        recognition_types: section.recognitionTypes,
        no_likes: true,
      };
    case "expert_discussions":
      return { ...base, discussions: section.discussions };
    case "community_challenges":
      return { ...base, challenges: section.challenges };
    case "professional_events":
      return { ...base, events: section.events };
    case "collaboration_requests":
      return { ...base, requests: section.requests };
    case "community_reputation":
      return {
        ...base,
        contribution_score: section.contributionScore,
        knowledge_score: section.knowledgeScore,
        helpfulness_score: section.helpfulnessScore,
        verification_level: section.verificationLevel,
        professional_influence: section.professionalInfluence,
        score_explanations: section.scoreExplanations,
      };
    case "next_recommended_community_action":
      return {
        ...base,
        recommendation: section.recommendation,
        why: section.why,
        expected_benefit: section.expectedBenefit,
        estimated_effort_minutes: section.estimatedEffortMinutes,
      };
    default:
      return base;
  }
}

export function toCommunitySectionView(section: LivingProfessionalCommunitySection) {
  return sectionToView(section);
}

export function toCommunitySectionsView(sections: LivingProfessionalCommunitySection[]) {
  return sections.map(toCommunitySectionView);
}
