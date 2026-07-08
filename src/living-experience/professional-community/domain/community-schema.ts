export const LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION = "living-professional-community-v1" as const;

export const LIVING_PROFESSIONAL_COMMUNITY_SECTIONS = [
  "community_overview",
  "todays_community_highlight",
  "professional_groups",
  "nearby_professionals",
  "questions_and_answers",
  "knowledge_contributions",
  "helpful_contributions",
  "expert_discussions",
  "community_challenges",
  "professional_events",
  "collaboration_requests",
  "community_reputation",
  "next_recommended_community_action",
] as const;

export type LivingProfessionalCommunitySectionId = (typeof LIVING_PROFESSIONAL_COMMUNITY_SECTIONS)[number];

export const LIVING_PROFESSIONAL_COMMUNITY_SECTION_LABELS: Record<LivingProfessionalCommunitySectionId, string> = {
  community_overview: "Community Overview",
  todays_community_highlight: "Today's Community Highlight",
  professional_groups: "Professional Groups",
  nearby_professionals: "Nearby Professionals",
  questions_and_answers: "Questions & Answers",
  knowledge_contributions: "Knowledge Contributions",
  helpful_contributions: "Helpful Contributions",
  expert_discussions: "Expert Discussions",
  community_challenges: "Community Challenges",
  professional_events: "Professional Events",
  collaboration_requests: "Collaboration Requests",
  community_reputation: "Community Reputation",
  next_recommended_community_action: "Next Recommended Community Action",
};

export const HELPFUL_CONTRIBUTION_TYPES = ["helpful", "applied", "verified", "professional"] as const;
export type HelpfulContributionType = (typeof HELPFUL_CONTRIBUTION_TYPES)[number];

export const COLLABORATION_REQUEST_TYPES = [
  "mentor",
  "expert",
  "team",
  "trainer",
  "reviewer",
] as const;

export type CollaborationRequestType = (typeof COLLABORATION_REQUEST_TYPES)[number];

export const LIVING_PROFESSIONAL_COMMUNITY_ROUTES = [
  "/living-professional-community",
  "/living-professional-community/sections",
  "/living-professional-community/overview",
  "/living-professional-community/highlight",
  "/living-professional-community/groups",
  "/living-professional-community/nearby",
  "/living-professional-community/qa",
  "/living-professional-community/knowledge",
  "/living-professional-community/helpful",
  "/living-professional-community/experts",
  "/living-professional-community/challenges",
  "/living-professional-community/events",
  "/living-professional-community/collaboration",
  "/living-professional-community/reputation",
  "/living-professional-community/next",
  "/living-professional-community/refresh",
  "/living-professional-community/statistics",
] as const;

export const LIVING_PROFESSIONAL_COMMUNITY_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/living-professional-community-v1.json",
  title: "LivingProfessionalCommunity",
  type: "object",
  required: ["schema_version", "user_id", "headline"],
  properties: {
    schema_version: { type: "string", const: LIVING_PROFESSIONAL_COMMUNITY_SCHEMA_VERSION },
    user_id: { type: "string" },
    headline: { type: "string" },
  },
  additionalProperties: true,
} as const;
