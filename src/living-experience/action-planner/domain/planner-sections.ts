import type { LivingActionPlannerContext } from "./planner-context.js";
import {
  hashPlannerSeed,
  resolveGovernmentServices,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolvePublicHolidayHint,
  resolveWorkingWeek,
} from "./planner-context.js";

export interface PlannerEngineSnapshot {
  readinessScore?: number;
  todaysBestAction?: { title: string; description: string; routeHint?: string };
  growthPath?: string[];
  challenges?: string[];
  goals?: Array<{ title: string; priority: number }>;
  expertRecommendations?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
  tomorrowsPrep?: { title: string; description: string };
}

export interface PlannerActionRecord {
  actionId: string;
  title: string;
  recordedAt: string;
  status: "completed" | "in_progress" | "waiting" | "postponed" | "blocked";
  notes?: string;
}

export interface PlannerDailyArchive {
  dayKey: string;
  completedCount: number;
  totalPlanned: number;
  recordedAt: string;
}

export interface PlannerExecutionState {
  actions: PlannerActionRecord[];
  dailyArchives: PlannerDailyArchive[];
  updatedAt: string;
}

export interface PlannerSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface TodaysMissionSection extends PlannerSectionBase {
  sectionId: "todays_mission";
  mission: string;
  why: string;
  expectedProfessionalImpact: string;
}

export interface TodaysActionPlanSection extends PlannerSectionBase {
  sectionId: "todays_action_plan";
  actions: Array<{
    order: number;
    title: string;
    estimatedEffortMinutes: number;
    dependencies: string[];
    professionalValue: string;
  }>;
}

export interface PriorityTimelineSection extends PlannerSectionBase {
  sectionId: "priority_timeline";
  morning: string[];
  afternoon: string[];
  evening: string[];
  executionOrderExplanation: string;
}

export interface ProfessionalChecklistSection extends PlannerSectionBase {
  sectionId: "professional_checklist";
  tasks: string[];
  documents: string[];
  certificates: string[];
  evidence: string[];
  preparation: string[];
}

export interface RequiredPreparationSection extends PlannerSectionBase {
  sectionId: "required_preparation";
  skills: string[];
  tools: string[];
  partners: string[];
  location: string;
  requirements: string[];
}

export interface RecommendedResourcesSection extends PlannerSectionBase {
  sectionId: "recommended_resources";
  learning: string[];
  knowledgeBank: string[];
  experts: string[];
  templates: string[];
  governmentResources: string[];
}

export interface TimePlannerSection extends PlannerSectionBase {
  sectionId: "time_planner";
  estimatedDurationMinutes: number;
  remainingMinutes: number;
  flexibleSchedule: string;
  professionalWorkload: string;
  workingWeek: string;
}

export interface ProgressTrackerSection extends PlannerSectionBase {
  sectionId: "progress_tracker";
  completed: string[];
  inProgress: string[];
  waiting: string[];
  postponed: string[];
  overallCompletionPercent: number;
}

export interface CompletedTodaySection extends PlannerSectionBase {
  sectionId: "completed_today";
  professionalWins: string[];
  evidenceCollected: string[];
  knowledgeGained: string[];
  journeyProgress: string;
}

export interface BlockedActionsSection extends PlannerSectionBase {
  sectionId: "blocked_actions";
  blockers: Array<{ action: string; preventing: string; explanation: string }>;
  recommendedSolution: string;
}

export interface ReschedulePlannerSection extends PlannerSectionBase {
  sectionId: "reschedule_planner";
  safePostponements: Array<{ action: string; reason: string; suggestedNewDate: string }>;
  impactAnalysis: string;
  newRecommendation: string;
}

export interface TomorrowQueueSection extends PlannerSectionBase {
  sectionId: "tomorrow_queue";
  priorities: string[];
  recommendedFirstAction: string;
}

export interface ExecutionHistorySection extends PlannerSectionBase {
  sectionId: "execution_history";
  dailyArchive: PlannerDailyArchive[];
  weeklyTrend: string;
  monthlyTrend: string;
  professionalConsistency: string;
}

export type LivingActionPlannerSection =
  | TodaysMissionSection
  | TodaysActionPlanSection
  | PriorityTimelineSection
  | ProfessionalChecklistSection
  | RequiredPreparationSection
  | RecommendedResourcesSection
  | TimePlannerSection
  | ProgressTrackerSection
  | CompletedTodaySection
  | BlockedActionsSection
  | ReschedulePlannerSection
  | TomorrowQueueSection
  | ExecutionHistorySection;

export function buildDefaultExecutionState(context: LivingActionPlannerContext): PlannerExecutionState {
  return {
    actions: [],
    dailyArchives: [],
    updatedAt: context.generatedAt,
  };
}

function defaultPlannedActions(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): Array<{ title: string; minutes: number; deps: string[]; value: string }> {
  const skill = resolvePrimarySkill(context);
  const hash = hashPlannerSeed(context.dayKey, context.userId);
  const mission =
    engines.todaysBestAction?.title ?? `Advance ${skill} readiness with one verified professional step`;

  return [
    {
      title: mission,
      minutes: 45 + (hash % 30),
      deps: [],
      value: "Highest-impact professional progress today",
    },
    {
      title: engines.growthPath?.[0] ?? `Review ${skill} learning module`,
      minutes: 30,
      deps: [mission],
      value: "Closes skill gap and strengthens journey",
    },
    {
      title: engines.opportunities?.[0]?.title ?? `Review regional ${skill} opportunity`,
      minutes: 25,
      deps: [],
      value: "Keeps pipeline active without committing automatically",
    },
    {
      title: "Update professional evidence and checklist items",
      minutes: 20,
      deps: [mission],
      value: "Maintains trusted frame and compliance readiness",
    },
  ];
}

export function buildTodaysMissionSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): TodaysMissionSection {
  const skill = resolvePrimarySkill(context);
  const mission =
    engines.todaysBestAction?.title ?? `Complete one high-impact ${skill} action that advances your journey`;

  return {
    sectionId: "todays_mission",
    title: "Today's Mission",
    headline: "One mission — clear professional focus",
    description: "Exactly one mission to guide your day. You decide whether and how to execute.",
    mission,
    why: `Aligned with your ${resolvePrimaryIndustry(context)} profile and ${context.geographic.preferredWorkRegion} market demand.`,
    expectedProfessionalImpact: "Measurable progress on readiness, evidence, and trusted professional standing.",
    explainable: true,
  };
}

export function buildTodaysActionPlanSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): TodaysActionPlanSection {
  const planned = defaultPlannedActions(context, engines);

  return {
    sectionId: "todays_action_plan",
    title: "Today's Action Plan",
    headline: `${planned.length} ordered actions for today`,
    description: "Executable daily plan — recommendations only, never auto-executed.",
    actions: planned.map((action, index) => ({
      order: index + 1,
      title: action.title,
      estimatedEffortMinutes: action.minutes,
      dependencies: action.deps,
      professionalValue: action.value,
    })),
    explainable: true,
  };
}

export function buildPriorityTimelineSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): PriorityTimelineSection {
  const planned = defaultPlannedActions(context, engines);
  const morning = planned.slice(0, 2).map((a) => a.title);
  const afternoon = planned.slice(2, 3).map((a) => a.title);
  const evening = ["Review progress and prepare tomorrow's first action"];

  return {
    sectionId: "priority_timeline",
    title: "Priority Timeline",
    headline: "Morning, afternoon, and evening execution order",
    description: `Adapted to ${resolveWorkingWeek(context)} in ${context.geographic.city}.`,
    morning,
    afternoon,
    evening,
    executionOrderExplanation: `High-focus work first while energy is highest. ${resolvePublicHolidayHint(context)}.`,
    explainable: true,
  };
}

export function buildProfessionalChecklistSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): ProfessionalChecklistSection {
  const bg = context.onboarding.professionalBackground;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "professional_checklist",
    title: "Professional Checklist",
    headline: "Tasks, documents, and evidence for today",
    description: "Checklist guidance — you mark completion when ready.",
    tasks: [
      engines.todaysBestAction?.title ?? `Complete primary ${skill} action`,
      "Review professional risk alerts",
      engines.growthPath?.[0] ?? "Advance learning path step",
    ],
    documents: ["Professional passport updates", "License renewal documents if applicable"],
    certificates: bg?.certificates.map((c) => c.replace(/_/g, " ")) ?? [`${skill} certification records`],
    evidence: ["Collect proof of today's professional action", "Update journey evidence log"],
    preparation: ["Gather required tools before starting", "Confirm schedule availability"],
    explainable: true,
  };
}

export function buildRequiredPreparationSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): RequiredPreparationSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "required_preparation",
    title: "Required Preparation",
    headline: "Prepare before you execute",
    description: "Skills, tools, and requirements — no automatic actions taken.",
    skills: [skill, ...(engines.challenges ?? []).slice(0, 2)],
    tools: ["Verified professional profile", "Document storage access", "Calendar for time blocks"],
    partners: engines.expertRecommendations?.slice(0, 2) ?? ["Regional training partner (recommendation only)"],
    location: `${context.geographic.city}, ${context.geographic.country}`,
    requirements: [
      ...context.geographic.professionalRegulations.map((r) => r.replace(/_/g, " ")),
      `${context.geographic.legalEnvironment} compliance awareness`,
    ],
    explainable: true,
  };
}

export function buildRecommendedResourcesSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): RecommendedResourcesSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "recommended_resources",
    title: "Recommended Resources",
    headline: "Learning, experts, and templates to support execution",
    description: "Resources to help you execute — never purchased or applied automatically.",
    learning: [engines.growthPath?.[0] ?? `${skill} fundamentals module`, "Knowledge Bank: regional best practices"],
    knowledgeBank: [`${skill} execution guides`, `${resolvePrimaryIndustry(context)} compliance notes`],
    experts: engines.expertRecommendations?.slice(0, 3) ?? [`${skill} mentor (recommendation only)`],
    templates: ["Daily action log template", "Evidence collection checklist"],
    governmentResources: resolveGovernmentServices(context),
    explainable: true,
  };
}

export function buildTimePlannerSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): TimePlannerSection {
  const planned = defaultPlannedActions(context, engines);
  const estimated = planned.reduce((sum, a) => sum + a.minutes, 0);
  const completed = 0;
  const hash = hashPlannerSeed(context.dayKey, context.userId);
  const workload = hash % 3 === 0 ? "Moderate" : hash % 3 === 1 ? "Focused" : "Light with flexibility";

  return {
    sectionId: "time_planner",
    title: "Time Planner",
    headline: `${estimated} minutes planned — ${estimated - completed} remaining`,
    description: "Time guidance based on your professional workload and schedule.",
    estimatedDurationMinutes: estimated,
    remainingMinutes: estimated - completed,
    flexibleSchedule: `Block ${Math.min(90, estimated)} minutes in two focused sessions if needed.`,
    professionalWorkload: workload,
    workingWeek: resolveWorkingWeek(context),
    explainable: true,
  };
}

export function buildProgressTrackerSection(
  _context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot,
  execution: PlannerExecutionState
): ProgressTrackerSection {
  const planned = execution.actions.length > 0 ? execution.actions : [];
  const completed = planned.filter((a) => a.status === "completed").map((a) => a.title);
  const inProgress = planned.filter((a) => a.status === "in_progress").map((a) => a.title);
  const waiting = planned.filter((a) => a.status === "waiting").map((a) => a.title);
  const postponed = planned.filter((a) => a.status === "postponed").map((a) => a.title);

  const defaultTotal = defaultPlannedActions(_context, engines).length;
  const total = Math.max(defaultTotal, planned.length);
  const completionPercent = total === 0 ? 0 : Math.round((completed.length / total) * 100);

  return {
    sectionId: "progress_tracker",
    title: "Progress Tracker",
    headline: `${completionPercent}% overall completion today`,
    description: "Track what you have done — the planner never executes on your behalf.",
    completed,
    inProgress,
    waiting,
    postponed,
    overallCompletionPercent: completionPercent,
    explainable: true,
  };
}

export function buildCompletedTodaySection(
  _context: LivingActionPlannerContext,
  execution: PlannerExecutionState
): CompletedTodaySection {
  const wins = execution.actions.filter((a) => a.status === "completed").map((a) => a.title);

  return {
    sectionId: "completed_today",
    title: "Completed Today",
    headline: wins.length > 0 ? `${wins.length} professional win${wins.length === 1 ? "" : "s"} today` : "Ready to record your first win",
    description: "Celebrate progress you choose to complete.",
    professionalWins: wins.length > 0 ? wins : ["No completions recorded yet — your first action awaits"],
    evidenceCollected: wins.length > 0 ? ["Evidence linked to completed actions"] : [],
    knowledgeGained: wins.length > 0 ? ["Applied learning from today's actions"] : [],
    journeyProgress: wins.length > 0 ? "Journey advanced through verified execution" : "Complete an action to advance your journey",
    explainable: true,
  };
}

export function buildBlockedActionsSection(
  context: LivingActionPlannerContext,
  execution: PlannerExecutionState
): BlockedActionsSection {
  const blocked = execution.actions.filter((a) => a.status === "blocked");
  const hash = hashPlannerSeed(context.dayKey, context.userId);

  const blockers =
    blocked.length > 0
      ? blocked.map((a) => ({
          action: a.title,
          preventing: a.notes ?? "External dependency",
          explanation: `This action is waiting on a condition you identified. The planner recommends resolving it before proceeding.`,
        }))
      : [
          {
            action: "Optional certification study",
            preventing: "Time allocation conflict",
            explanation: "Lower priority today — safe to postpone without blocking mission progress.",
          },
        ];

  const solutions = [
    "Block 30 minutes tomorrow morning for the blocked item",
    "Request partner support for the blocking dependency",
    "Reschedule to next working day within your flexible window",
  ];

  return {
    sectionId: "blocked_actions",
    title: "Blocked Actions",
    headline: blockers.length > 0 ? `${blockers.length} blocker${blockers.length === 1 ? "" : "s"} identified` : "No critical blockers today",
    description: "Every blocker is explained with one recommended solution.",
    blockers,
    recommendedSolution: solutions[hash % solutions.length]!,
    explainable: true,
  };
}

export function buildReschedulePlannerSection(
  context: LivingActionPlannerContext,
  execution: PlannerExecutionState
): ReschedulePlannerSection {
  const postponed = execution.actions.filter((a) => a.status === "postponed");
  const tomorrow = new Date(context.generatedAt);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const suggestedDate = tomorrow.toISOString().slice(0, 10);

  return {
    sectionId: "reschedule_planner",
    title: "Reschedule Planner",
    headline: "Safe postponement with impact analysis",
    description: "Recommendations for rescheduling — you approve any change.",
    safePostponements:
      postponed.length > 0
        ? postponed.map((a) => ({
            action: a.title,
            reason: a.notes ?? "User chose to postpone",
            suggestedNewDate: suggestedDate,
          }))
        : [
            {
              action: "Optional certification study",
              reason: "Lower priority than today's mission",
              suggestedNewDate: suggestedDate,
            },
          ],
    impactAnalysis: "Postponing low-priority items preserves focus on today's mission without harming compliance.",
    newRecommendation: `Start tomorrow with your mission action in ${context.geographic.city} during your first focused block.`,
    explainable: true,
  };
}

export function buildTomorrowQueueSection(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot
): TomorrowQueueSection {
  const skill = resolvePrimarySkill(context);
  const priorities = [
    engines.tomorrowsPrep?.title ?? `Prepare ${skill} evidence review`,
    engines.growthPath?.[1] ?? engines.growthPath?.[0] ?? "Continue learning path",
    engines.opportunities?.[0]?.title ?? "Review top regional opportunity",
  ];

  return {
    sectionId: "tomorrow_queue",
    title: "Tomorrow Queue",
    headline: "Tomorrow's priorities prepared today",
    description: "Automatically prepared queue — one recommended first action.",
    priorities,
    recommendedFirstAction: priorities[0]!,
    explainable: true,
  };
}

export function buildExecutionHistorySection(
  _context: LivingActionPlannerContext,
  execution: PlannerExecutionState
): ExecutionHistorySection {
  const archives = execution.dailyArchives.slice(0, 30);
  const weeklyCompleted = archives.slice(0, 7).reduce((sum, a) => sum + a.completedCount, 0);
  const monthlyCompleted = archives.reduce((sum, a) => sum + a.completedCount, 0);

  return {
    sectionId: "execution_history",
    title: "Execution History",
    headline: "Your daily execution archive",
    description: "Professional consistency tracked over time — read-only history.",
    dailyArchive: archives,
    weeklyTrend: weeklyCompleted >= 5 ? "Strong weekly consistency" : weeklyCompleted >= 2 ? "Building weekly habit" : "Start recording completions to build trend",
    monthlyTrend: monthlyCompleted >= 15 ? "Excellent monthly execution" : monthlyCompleted >= 5 ? "Steady monthly progress" : "Monthly trend forming",
    professionalConsistency: archives.length >= 7 ? "Consistent daily planning habit" : "Consistency grows as you record execution",
    explainable: true,
  };
}

export function buildAllPlannerSections(
  context: LivingActionPlannerContext,
  engines: PlannerEngineSnapshot,
  execution: PlannerExecutionState
): LivingActionPlannerSection[] {
  return [
    buildTodaysMissionSection(context, engines),
    buildTodaysActionPlanSection(context, engines),
    buildPriorityTimelineSection(context, engines),
    buildProfessionalChecklistSection(context, engines),
    buildRequiredPreparationSection(context, engines),
    buildRecommendedResourcesSection(context, engines),
    buildTimePlannerSection(context, engines),
    buildProgressTrackerSection(context, engines, execution),
    buildCompletedTodaySection(context, execution),
    buildBlockedActionsSection(context, execution),
    buildReschedulePlannerSection(context, execution),
    buildTomorrowQueueSection(context, engines),
    buildExecutionHistorySection(context, execution),
  ];
}

function sectionToView(section: LivingActionPlannerSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "todays_mission":
      return {
        ...base,
        mission: section.mission,
        why: section.why,
        expected_professional_impact: section.expectedProfessionalImpact,
      };
    case "todays_action_plan":
      return {
        ...base,
        actions: section.actions.map((a) => ({
          order: a.order,
          title: a.title,
          estimated_effort_minutes: a.estimatedEffortMinutes,
          dependencies: a.dependencies,
          professional_value: a.professionalValue,
        })),
      };
    case "priority_timeline":
      return {
        ...base,
        morning: section.morning,
        afternoon: section.afternoon,
        evening: section.evening,
        execution_order_explanation: section.executionOrderExplanation,
      };
    case "professional_checklist":
      return {
        ...base,
        tasks: section.tasks,
        documents: section.documents,
        certificates: section.certificates,
        evidence: section.evidence,
        preparation: section.preparation,
      };
    case "required_preparation":
      return {
        ...base,
        skills: section.skills,
        tools: section.tools,
        partners: section.partners,
        location: section.location,
        requirements: section.requirements,
      };
    case "recommended_resources":
      return {
        ...base,
        learning: section.learning,
        knowledge_bank: section.knowledgeBank,
        experts: section.experts,
        templates: section.templates,
        government_resources: section.governmentResources,
      };
    case "time_planner":
      return {
        ...base,
        estimated_duration_minutes: section.estimatedDurationMinutes,
        remaining_minutes: section.remainingMinutes,
        flexible_schedule: section.flexibleSchedule,
        professional_workload: section.professionalWorkload,
        working_week: section.workingWeek,
      };
    case "progress_tracker":
      return {
        ...base,
        completed: section.completed,
        in_progress: section.inProgress,
        waiting: section.waiting,
        postponed: section.postponed,
        overall_completion_percent: section.overallCompletionPercent,
      };
    case "completed_today":
      return {
        ...base,
        professional_wins: section.professionalWins,
        evidence_collected: section.evidenceCollected,
        knowledge_gained: section.knowledgeGained,
        journey_progress: section.journeyProgress,
      };
    case "blocked_actions":
      return {
        ...base,
        blockers: section.blockers,
        recommended_solution: section.recommendedSolution,
      };
    case "reschedule_planner":
      return {
        ...base,
        safe_postponements: section.safePostponements.map((p) => ({
          action: p.action,
          reason: p.reason,
          suggested_new_date: p.suggestedNewDate,
        })),
        impact_analysis: section.impactAnalysis,
        new_recommendation: section.newRecommendation,
      };
    case "tomorrow_queue":
      return {
        ...base,
        priorities: section.priorities,
        recommended_first_action: section.recommendedFirstAction,
      };
    case "execution_history":
      return {
        ...base,
        daily_archive: section.dailyArchive.map((a) => ({
          day_key: a.dayKey,
          completed_count: a.completedCount,
          total_planned: a.totalPlanned,
          recorded_at: a.recordedAt,
        })),
        weekly_trend: section.weeklyTrend,
        monthly_trend: section.monthlyTrend,
        professional_consistency: section.professionalConsistency,
      };
    default:
      return base;
  }
}

export function toPlannerSectionView(section: LivingActionPlannerSection) {
  return sectionToView(section);
}

export function toPlannerSectionsView(sections: LivingActionPlannerSection[]) {
  return sections.map(toPlannerSectionView);
}

export function recordActionCompleted(
  execution: PlannerExecutionState,
  actionId: string,
  title: string,
  recordedAt: string,
  notes?: string
): PlannerExecutionState {
  const without = execution.actions.filter((a) => a.actionId !== actionId);
  return {
    ...execution,
    actions: [{ actionId, title, recordedAt, status: "completed" as const, notes }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}

export function recordActionPostponed(
  execution: PlannerExecutionState,
  actionId: string,
  title: string,
  recordedAt: string,
  notes?: string
): PlannerExecutionState {
  const without = execution.actions.filter((a) => a.actionId !== actionId);
  return {
    ...execution,
    actions: [{ actionId, title, recordedAt, status: "postponed" as const, notes }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}

export function archiveDayExecution(
  execution: PlannerExecutionState,
  dayKey: string,
  totalPlanned: number,
  recordedAt: string
): PlannerExecutionState {
  const completedCount = execution.actions.filter((a) => a.status === "completed").length;
  const withoutDay = execution.dailyArchives.filter((a) => a.dayKey !== dayKey);
  return {
    ...execution,
    dailyArchives: [{ dayKey, completedCount, totalPlanned, recordedAt }, ...withoutDay].slice(0, 90),
    updatedAt: recordedAt,
  };
}
