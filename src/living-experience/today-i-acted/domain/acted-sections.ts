import type { EvidenceAttachmentType } from "./acted-schema.js";
import type { LivingTodayIActedContext } from "./acted-context.js";
import {
  hashActedSeed,
  resolveHoursInvested,
  resolveProfessionalScore,
} from "./acted-context.js";

export interface ActedEngineSnapshot {
  completedActions?: Array<{ actionId: string; title: string; status: string; completedAt?: string }>;
  pendingActions?: Array<{ actionId: string; title: string; status: string }>;
  verifiedActions?: Array<{ actionId: string; title: string; verified: boolean }>;
  learningSessions?: Array<{ sessionId: string; title: string; skill?: string }>;
  expertSessions?: Array<{ sessionId: string; title: string; expert?: string }>;
  teamMembers?: Array<{ memberId: string; name: string; role: string; contribution: string }>;
  customers?: Array<{ customerId: string; name: string; satisfaction?: number; thanks?: string }>;
  achievements?: string[];
  readinessScore?: number;
  tomorrowsBestAction?: { title: string; description: string; routeHint: string };
  journeyProgress?: number;
  passportGrowth?: number;
  frameImprovement?: string;
}

export interface ActedSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface TodaysSummarySection extends ActedSectionBase {
  sectionId: "todays_summary";
  actionsCompleted: number;
  hoursInvested: number;
  professionalScore: number;
  daySummary: string;
}

export interface TodaysActionsSection extends ActedSectionBase {
  sectionId: "todays_actions";
  verified: Array<{ actionId: string; title: string; verified: boolean }>;
  pending: Array<{ actionId: string; title: string; status: string }>;
  completed: Array<{ actionId: string; title: string; completedAt: string }>;
}

export interface TodaysStorySection extends ActedSectionBase {
  sectionId: "todays_story";
  story: string;
  tone: "motivating" | "positive" | "professional";
}

export interface TodaysAchievementsSection extends ActedSectionBase {
  sectionId: "todays_achievements";
  certificates: string[];
  milestones: string[];
  frameImprovements: string[];
  journeyMilestones: string[];
  knowledgeContributions: string[];
}

export interface TodaysLearningSection extends ActedSectionBase {
  sectionId: "todays_learning";
  skillsLearned: string[];
  expertSessions: Array<{ title: string; expert: string }>;
  courses: string[];
  knowledgeGained: string[];
}

export interface TodaysTeamSection extends ActedSectionBase {
  sectionId: "todays_team";
  members: Array<{ name: string; role: string; contribution: string }>;
}

export interface TodaysCustomersSection extends ActedSectionBase {
  sectionId: "todays_customers";
  completed: Array<{ name: string; satisfaction: number; thanks: string }>;
}

export interface TodaysProgressSection extends ActedSectionBase {
  sectionId: "todays_progress";
  journeyProgress: number;
  passportGrowth: number;
  frameImprovement: string;
  professionalMaturity: string;
}

export interface TodaysImpactSection extends ActedSectionBase {
  sectionId: "todays_impact";
  peopleHelped: number;
  knowledgeShared: number;
  teamsSupported: number;
  projectsCompleted: number;
  impactSummary: string;
}

export interface ProfessionalMemoryEntry {
  memoryId: string;
  dayKey: string;
  title: string;
  summary: string;
  story: string;
  professionalScore: number;
  createdAt: string;
  searchableText: string;
}

export interface ProfessionalMemorySection extends ActedSectionBase {
  sectionId: "professional_memory";
  todayEntry: ProfessionalMemoryEntry;
  recentEntries: ProfessionalMemoryEntry[];
  searchable: true;
  retentionPolicy: "never_deleted_automatically";
}

export interface ShareStorySection extends ActedSectionBase {
  sectionId: "share_story";
  shareableStory: string;
  imageMetadata: {
    title: string;
    subtitle: string;
    badge: string;
    accentColor: string;
    professionalName: string;
    date: string;
  };
  branding: {
    tagline: string;
    watermark: string;
  };
}

export interface EvidenceDraftItem {
  evidenceId: string;
  title: string;
  summary: string;
  sourceStory: string;
  attachmentTypes: EvidenceAttachmentType[];
  requiresPermission: true;
}

export interface EvidenceBuilderSection extends ActedSectionBase {
  sectionId: "evidence_builder";
  drafts: EvidenceDraftItem[];
  permissionRequired: true;
  experienceOnly: true;
}

export interface TomorrowsSuggestionSection extends ActedSectionBase {
  sectionId: "tomorrows_suggestion";
  recommendation: string;
  why: string;
  expectedBenefit: string;
  estimatedMinutes: number;
  routeHint: string;
}

export type LivingTodayIActedSection =
  | TodaysSummarySection
  | TodaysActionsSection
  | TodaysStorySection
  | TodaysAchievementsSection
  | TodaysLearningSection
  | TodaysTeamSection
  | TodaysCustomersSection
  | TodaysProgressSection
  | TodaysImpactSection
  | ProfessionalMemorySection
  | ShareStorySection
  | EvidenceBuilderSection
  | TomorrowsSuggestionSection;

function defaultCompletedActions(
  context: LivingTodayIActedContext
): NonNullable<ActedEngineSnapshot["completedActions"]> {
  const sq = context.onboarding.smartQuestions;
  const actions = [
    { actionId: "act://profile_review", title: "Reviewed professional profile", status: "completed", completedAt: context.generatedAt },
    { actionId: "act://daily_checkin", title: "Completed daily professional check-in", status: "completed", completedAt: context.generatedAt },
  ];
  if (sq?.enjoysBuilding) {
    actions.push({
      actionId: "act://project_update",
      title: "Updated active project progress",
      status: "completed",
      completedAt: context.generatedAt,
    });
  }
  return actions;
}

function defaultVerifiedActions(
  context: LivingTodayIActedContext
): NonNullable<ActedEngineSnapshot["verifiedActions"]> {
  return [
    { actionId: "act://identity", title: "Identity verification maintained", verified: true },
    ...(context.onboarding.professionalBackground?.certificates.slice(0, 1).map((c, i) => ({
      actionId: `act://cert/${i}`,
      title: `${c.replace(/_/g, " ")} credential active`,
      verified: true,
    })) ?? []),
  ];
}

export function buildProfessionalMemoryEntry(
  context: LivingTodayIActedContext,
  story: string,
  actionsCompleted: number,
  professionalScore: number
): ProfessionalMemoryEntry {
  const title = `${context.displayName}'s professional day — ${context.dayKey}`;
  const summary = `Completed ${actionsCompleted} actions with a professional score of ${professionalScore}.`;
  return {
    memoryId: `mem://${context.userId}/${context.dayKey}`,
    dayKey: context.dayKey,
    title,
    summary,
    story,
    professionalScore,
    createdAt: context.generatedAt,
    searchableText: `${title} ${summary} ${story} ${context.geographic.city} ${context.geographic.country}`.toLowerCase(),
  };
}

export function buildTodaysSummarySection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysSummarySection {
  const completed = engines.completedActions ?? defaultCompletedActions(context);
  const actionsCompleted = completed.length;
  const hoursInvested = resolveHoursInvested(context, actionsCompleted);
  const professionalScore = resolveProfessionalScore(context, actionsCompleted);

  return {
    sectionId: "todays_summary",
    title: "Today's Summary",
    headline: actionsCompleted > 0 ? "A meaningful professional day" : "Your day is ready to begin",
    description: "Your professional day at a glance.",
    actionsCompleted,
    hoursInvested,
    professionalScore,
    daySummary: `${context.displayName} invested ${hoursInvested} hours in ${actionsCompleted} professional actions in ${context.geographic.city}.`,
    explainable: true,
  };
}

export function buildTodaysActionsSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysActionsSection {
  const completed = engines.completedActions ?? defaultCompletedActions(context);
  const verified = engines.verifiedActions ?? defaultVerifiedActions(context);
  const pending = engines.pendingActions ?? [
    { actionId: "act://tomorrow_prep", title: "Prepare tomorrow's priority action", status: "pending" },
  ];

  return {
    sectionId: "todays_actions",
    title: "Today's Actions",
    headline: `${completed.length} completed, ${verified.length} verified`,
    description: "Every verified action strengthens your professional story.",
    verified,
    pending,
    completed: completed.map((a) => ({
      actionId: a.actionId,
      title: a.title,
      completedAt: a.completedAt ?? context.generatedAt,
    })),
    explainable: true,
  };
}

export function buildTodaysStorySection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysStorySection {
  const completed = engines.completedActions ?? defaultCompletedActions(context);
  const industry = context.onboarding.professionalBackground?.industries[0]?.replace(/_/g, " ") ?? "professional work";
  const city = context.geographic.city;

  let story: string;
  if (completed.length >= 3) {
    story = `Today, ${context.displayName} showed up for ${industry} in ${city}. You completed ${completed.length} meaningful actions, strengthened your professional standing, and moved your career forward one step at a time. Every action you took today becomes part of your permanent professional story.`;
  } else if (completed.length >= 1) {
    story = `Today, ${context.displayName} took steady steps in ${industry}. You completed ${completed[0]?.title.toLowerCase() ?? "a professional action"} and kept your momentum going in ${city}. Small consistent actions build lasting professional success.`;
  } else {
    story = `Today is a fresh page in ${context.displayName}'s professional story. ${city} offers opportunities waiting for your next verified action. When you're ready, every step you take will be remembered.`;
  }

  return {
    sectionId: "todays_story",
    title: "Today's Story",
    headline: "Your professional diary for today",
    description: "Automatically generated — simple, human, motivating.",
    story,
    tone: "motivating",
    explainable: true,
  };
}

export function buildTodaysAchievementsSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysAchievementsSection {
  const bg = context.onboarding.professionalBackground;
  return {
    sectionId: "todays_achievements",
    title: "Today's Achievements",
    headline: "What you accomplished today",
    description: "Certificates, milestones, and growth from today's work.",
    certificates: bg?.certificates.slice(0, 2).map((c) => c.replace(/_/g, " ")) ?? [],
    milestones: engines.achievements ?? ["Daily professional check-in completed"],
    frameImprovements: engines.frameImprovement ? [engines.frameImprovement] : ["Maintained trusted Live Frame standing"],
    journeyMilestones: ["Continued professional journey progress"],
    knowledgeContributions: context.onboarding.smartQuestions?.enjoysTeaching
      ? ["Shared professional insight with peers"]
      : ["Documented today's learning"],
    explainable: true,
  };
}

export function buildTodaysLearningSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysLearningSection {
  const bg = context.onboarding.professionalBackground;
  const sessions = engines.learningSessions ?? [];
  const experts = engines.expertSessions ?? [];

  return {
    sectionId: "todays_learning",
    title: "Today's Learning",
    headline: sessions.length > 0 ? "You grew your skills today" : "Learning opportunities ready",
    description: "Skills, sessions, and knowledge gained today.",
    skillsLearned: sessions.map((s) => s.skill ?? s.title).concat(bg?.skills.slice(0, 1) ?? []),
    expertSessions: experts.map((e) => ({ title: e.title, expert: e.expert ?? "Regional expert" })),
    courses: sessions.length > 0 ? sessions.map((s) => s.title) : [`${context.geographic.preferredWorkRegion} skills development`],
    knowledgeGained: ["Applied learning to today's professional actions"],
    explainable: true,
  };
}

export function buildTodaysTeamSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysTeamSection {
  const members = engines.teamMembers ?? [];
  const defaultMembers =
    members.length > 0
      ? members
      : context.onboarding.smartQuestions?.enjoysLeading
        ? [
            { memberId: "tm://lead", name: "Site crew", role: "Field team", contribution: "Coordinated daily tasks" },
            { memberId: "tm://coord", name: "Project coordinator", role: "Support", contribution: "Aligned deliverables" },
          ]
        : [{ memberId: "tm://peer", name: "Professional peer", role: "Collaborator", contribution: "Shared expertise on today's work" }];

  return {
    sectionId: "todays_team",
    title: "Today's Team",
    headline: `Worked with ${defaultMembers.length} team member${defaultMembers.length === 1 ? "" : "s"}`,
    description: "People you collaborated with today.",
    members: defaultMembers.map((m) => ({
      name: m.name,
      role: m.role,
      contribution: m.contribution,
    })),
    explainable: true,
  };
}

export function buildTodaysCustomersSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysCustomersSection {
  const customers = engines.customers ?? [];
  const hash = hashActedSeed(context.dayKey, context.userId);
  const defaultCustomers =
    customers.length > 0
      ? customers
      : [
          {
            customerId: "cust://daily",
            name: "Regional client",
            satisfaction: 85 + (hash % 10),
            thanks: "Thank you for your professional service today.",
          },
        ];

  return {
    sectionId: "todays_customers",
    title: "Today's Customers",
    headline: `${defaultCustomers.length} customer${defaultCustomers.length === 1 ? "" : "s"} served`,
    description: "Customers you completed work for today.",
    completed: defaultCustomers.map((c) => ({
      name: c.name,
      satisfaction: c.satisfaction ?? 90,
      thanks: c.thanks ?? "Professional service appreciated.",
    })),
    explainable: true,
  };
}

export function buildTodaysProgressSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysProgressSection {
  const hash = hashActedSeed(context.dayKey, context.userId);
  const journeyProgress = engines.journeyProgress ?? 40 + (hash % 25);
  const passportGrowth = engines.passportGrowth ?? 2 + (hash % 5);

  return {
    sectionId: "todays_progress",
    title: "Today's Progress",
    headline: "Your professional growth today",
    description: "Journey, passport, and frame progress from today's actions.",
    journeyProgress,
    passportGrowth,
    frameImprovement: engines.frameImprovement ?? "Maintained verified standing",
    professionalMaturity: journeyProgress >= 60 ? "Growing steadily" : "Building foundation",
    explainable: true,
  };
}

export function buildTodaysImpactSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TodaysImpactSection {
  const completed = (engines.completedActions ?? defaultCompletedActions(context)).length;
  const customers = (engines.customers ?? [{ customerId: "c1", name: "Client" }]).length;
  const team = (engines.teamMembers ?? [{ memberId: "t1", name: "Peer", role: "collaborator", contribution: "support" }]).length;
  const hash = hashActedSeed(context.dayKey, context.userId);

  return {
    sectionId: "todays_impact",
    title: "Today's Impact",
    headline: "The difference you made today",
    description: "People helped, knowledge shared, and projects completed.",
    peopleHelped: customers + team,
    knowledgeShared: 1 + (hash % 3),
    teamsSupported: team,
    projectsCompleted: Math.max(1, completed - 1),
    impactSummary: `Today you supported ${team} team member${team === 1 ? "" : "s"}, served ${customers} customer${customers === 1 ? "" : "s"}, and advanced ${Math.max(1, completed - 1)} project${completed - 1 === 1 ? "" : "s"}.`,
    explainable: true,
  };
}

export function buildProfessionalMemorySection(
  context: LivingTodayIActedContext,
  story: string,
  actionsCompleted: number,
  professionalScore: number,
  recentEntries: ProfessionalMemoryEntry[] = []
): ProfessionalMemorySection {
  const todayEntry = buildProfessionalMemoryEntry(context, story, actionsCompleted, professionalScore);
  const filteredRecent = recentEntries.filter((e) => e.dayKey !== context.dayKey);

  return {
    sectionId: "professional_memory",
    title: "Professional Memory",
    headline: "Today's memory saved permanently",
    description: "Searchable professional history — never deleted automatically.",
    todayEntry,
    recentEntries: [todayEntry, ...filteredRecent].slice(0, 10),
    searchable: true,
    retentionPolicy: "never_deleted_automatically",
    explainable: true,
  };
}

export function buildShareStorySection(
  context: LivingTodayIActedContext,
  story: string,
  professionalScore: number
): ShareStorySection {
  return {
    sectionId: "share_story",
    title: "Share Story",
    headline: "Share your professional day",
    description: "A shareable story with professional branding — no internal details exposed.",
    shareableStory: story,
    imageMetadata: {
      title: "Today I Acted",
      subtitle: `${context.displayName} — ${context.dayKey}`,
      badge: `Score: ${professionalScore}`,
      accentColor: "#1a5f4a",
      professionalName: context.displayName,
      date: context.dayKey,
    },
    branding: {
      tagline: "Building a verified professional story, one day at a time.",
      watermark: "APP13 Professional",
    },
    explainable: true,
  };
}

export function buildEvidenceBuilderSection(
  context: LivingTodayIActedContext,
  story: string,
  engines: ActedEngineSnapshot
): EvidenceBuilderSection {
  const completed = engines.completedActions ?? defaultCompletedActions(context);
  const drafts: EvidenceDraftItem[] = completed.slice(0, 3).map((action, i) => {
    const attachmentTypes: EvidenceAttachmentType[] = ["photo"];
    if (i === 0) attachmentTypes.push("customer_approval");
    if (context.onboarding.professionalBackground?.certificates.length) {
      attachmentTypes.push("certificate");
    }
    if (context.onboarding.smartQuestions?.enjoysTeaching) {
      attachmentTypes.push("knowledge_contribution");
    }

    return {
      evidenceId: `ev-draft://${context.dayKey}/${i}`,
      title: action.title,
      summary: `Verified evidence from today's story: ${action.title}`,
      sourceStory: story,
      attachmentTypes,
      requiresPermission: true,
    };
  });

  if (drafts.length === 0) {
    drafts.push({
      evidenceId: `ev-draft://${context.dayKey}/default`,
      title: "Today's professional activity",
      summary: "Convert today's story into verified professional evidence.",
      sourceStory: story,
      attachmentTypes: ["photo", "certificate"],
      requiresPermission: true,
    });
  }

  return {
    sectionId: "evidence_builder",
    title: "Evidence Builder",
    headline: `${drafts.length} evidence draft${drafts.length === 1 ? "" : "s"} ready`,
    description: "Convert today's story into verified evidence — only with your permission.",
    drafts,
    permissionRequired: true,
    experienceOnly: true,
    explainable: true,
  };
}

export function buildTomorrowsSuggestionSection(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot
): TomorrowsSuggestionSection {
  const hash = hashActedSeed(context.dayKey, context.userId);
  const action = engines.tomorrowsBestAction?.title ?? "Complete your highest-impact professional action tomorrow";
  const why =
    engines.tomorrowsBestAction?.description ??
    `Best next step for ${context.geographic.preferredWorkRegion} demand and your current professional growth.`;

  return {
    sectionId: "tomorrows_suggestion",
    title: "Tomorrow's Suggestion",
    headline: action,
    description: "Exactly one recommendation for tomorrow — highest impact.",
    recommendation: action,
    why,
    expectedBenefit: "Strengthens your passport, journey, and professional memory for tomorrow.",
    estimatedMinutes: 30 + (hash % 4) * 15,
    routeHint: engines.tomorrowsBestAction?.routeHint ?? "/develop-me",
    explainable: true,
  };
}

export function buildAllActedSections(
  context: LivingTodayIActedContext,
  engines: ActedEngineSnapshot,
  memoryEntries: ProfessionalMemoryEntry[] = []
): LivingTodayIActedSection[] {
  const summary = buildTodaysSummarySection(context, engines);
  const storySection = buildTodaysStorySection(context, engines);

  return [
    summary,
    buildTodaysActionsSection(context, engines),
    storySection,
    buildTodaysAchievementsSection(context, engines),
    buildTodaysLearningSection(context, engines),
    buildTodaysTeamSection(context, engines),
    buildTodaysCustomersSection(context, engines),
    buildTodaysProgressSection(context, engines),
    buildTodaysImpactSection(context, engines),
    buildProfessionalMemorySection(
      context,
      storySection.story,
      summary.actionsCompleted,
      summary.professionalScore,
      memoryEntries
    ),
    buildShareStorySection(context, storySection.story, summary.professionalScore),
    buildEvidenceBuilderSection(context, storySection.story, engines),
    buildTomorrowsSuggestionSection(context, engines),
  ];
}

function sectionToView(section: LivingTodayIActedSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "todays_summary":
      return {
        ...base,
        actions_completed: section.actionsCompleted,
        hours_invested: section.hoursInvested,
        professional_score: section.professionalScore,
        day_summary: section.daySummary,
      };
    case "todays_actions":
      return {
        ...base,
        verified: section.verified,
        pending: section.pending,
        completed: section.completed,
      };
    case "todays_story":
      return { ...base, story: section.story, tone: section.tone };
    case "todays_achievements":
      return {
        ...base,
        certificates: section.certificates,
        milestones: section.milestones,
        frame_improvements: section.frameImprovements,
        journey_milestones: section.journeyMilestones,
        knowledge_contributions: section.knowledgeContributions,
      };
    case "todays_learning":
      return {
        ...base,
        skills_learned: section.skillsLearned,
        expert_sessions: section.expertSessions,
        courses: section.courses,
        knowledge_gained: section.knowledgeGained,
      };
    case "todays_team":
      return { ...base, members: section.members };
    case "todays_customers":
      return { ...base, completed: section.completed };
    case "todays_progress":
      return {
        ...base,
        journey_progress: section.journeyProgress,
        passport_growth: section.passportGrowth,
        frame_improvement: section.frameImprovement,
        professional_maturity: section.professionalMaturity,
      };
    case "todays_impact":
      return {
        ...base,
        people_helped: section.peopleHelped,
        knowledge_shared: section.knowledgeShared,
        teams_supported: section.teamsSupported,
        projects_completed: section.projectsCompleted,
        impact_summary: section.impactSummary,
      };
    case "professional_memory":
      return {
        ...base,
        today_entry: section.todayEntry,
        recent_entries: section.recentEntries,
        searchable: section.searchable,
        retention_policy: section.retentionPolicy,
      };
    case "share_story":
      return {
        ...base,
        shareable_story: section.shareableStory,
        image_metadata: section.imageMetadata,
        branding: section.branding,
      };
    case "evidence_builder":
      return {
        ...base,
        drafts: section.drafts.map((d) => ({
          evidence_id: d.evidenceId,
          title: d.title,
          summary: d.summary,
          source_story: d.sourceStory,
          attachment_types: d.attachmentTypes,
          requires_permission: d.requiresPermission,
        })),
        permission_required: section.permissionRequired,
        experience_only: section.experienceOnly,
      };
    case "tomorrows_suggestion":
      return {
        ...base,
        recommendation: section.recommendation,
        why: section.why,
        expected_benefit: section.expectedBenefit,
        estimated_minutes: section.estimatedMinutes,
        route_hint: section.routeHint,
      };
    default:
      return base;
  }
}

export function toActedSectionView(section: LivingTodayIActedSection) {
  return sectionToView(section);
}

export function toActedSectionsView(sections: LivingTodayIActedSection[]) {
  return sections.map(toActedSectionView);
}

export function buildEvidenceDraftWithPermission(input: {
  context: LivingTodayIActedContext;
  story: string;
  engines: ActedEngineSnapshot;
  evidenceId: string;
  userPermissionGranted: boolean;
  attachmentTypes?: EvidenceAttachmentType[];
}) {
  const section = buildEvidenceBuilderSection(input.context, input.story, input.engines);
  const draft = section.drafts.find((d) => d.evidenceId === input.evidenceId);

  if (!draft) {
    return { found: false as const, permissionGranted: input.userPermissionGranted };
  }

  if (!input.userPermissionGranted) {
    return {
      found: true as const,
      permissionGranted: false as const,
      draft,
      message: "User permission required before converting story to verified evidence.",
      experience_only: true,
    };
  }

  const attachments = input.attachmentTypes ?? draft.attachmentTypes;
  return {
    found: true as const,
    permissionGranted: true as const,
    evidence: {
      evidence_id: draft.evidenceId,
      title: draft.title,
      summary: draft.summary,
      attachments,
      verified: false,
      status: "draft_ready",
      created_at: input.context.generatedAt,
    },
    message: "Evidence draft prepared — experience only, no automatic verification.",
    experience_only: true,
  };
}
