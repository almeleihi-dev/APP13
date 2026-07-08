import {
  matchProjectTemplate,
  deriveProjectName,
  type ProjectTemplateSpec,
} from "../project-decomposition-engine.js";
import { createLivingId } from "../living-platform-storage.js";
import type { MicroActionContractScope, ProjectExecutionPath } from "../types.js";
import { resolveActionCategory } from "../economy/action-category.js";
import { normalizeMultilingualInput } from "../../../i18n/multilingual-input.js";

export interface GoalActionItem {
  actionIndex: number;
  actionId: string;
  name: string;
  description: string;
  requiredSkill: string;
  executionScope: MicroActionContractScope;
  estimatedDays: number;
  estimatedValue: number;
  evidenceRequired: string;
  contractReady: boolean;
  startNow: boolean;
  phaseName: string;
  subPhaseName: string;
  phaseOrder: number;
}

export interface GoalActionSubPhaseBreakdown {
  subPhaseName: string;
  actions: GoalActionItem[];
}

export interface GoalActionPhaseBreakdown {
  phaseName: string;
  order: number;
  status: string;
  subPhases: GoalActionSubPhaseBreakdown[];
}

export interface GoalActionBreakdown {
  goal: string;
  projectName: string;
  templateId: string;
  templateLabel: string;
  templateSummary: string;
  totalActions: number;
  totalEstimatedValue: number;
  totalEstimatedDays: number;
  phases: GoalActionPhaseBreakdown[];
  startNowActions: GoalActionItem[];
}

const PATH_MULTIPLIERS: Record<ProjectExecutionPath, { cost: number; days: number }> = {
  fast: { cost: 1.4, days: 0.65 },
  balanced: { cost: 1.0, days: 1.0 },
  step_by_step: { cost: 0.75, days: 1.35 },
};

function evidenceForSkill(skill: string): string {
  const normalized = skill.trim().toLowerCase();
  if (normalized.includes("inspect") || normalized.includes("compliance")) {
    return "Inspection report · signed checklist · photo evidence";
  }
  if (normalized.includes("design") || normalized.includes("ux") || normalized.includes("ui")) {
    return "Design deliverable · review sign-off · source files";
  }
  if (
    normalized.includes("engineer") ||
    normalized.includes("develop") ||
    normalized.includes("devops") ||
    normalized.includes("backend")
  ) {
    return "Working deliverable · test results · deployment confirmation";
  }
  if (normalized.includes("legal") || normalized.includes("permit")) {
    return "Filed documentation · approval reference · compliance attestation";
  }
  return "Deliverable confirmation · completion attestation · Live Frame capture";
}

function describeAction(name: string, skill: string, template: ProjectTemplateSpec): string {
  return `${name} — a ${skill} action within the ${template.label.toLowerCase()} path, contract-ready with evidence requirements.`;
}

function scopeForSkill(skill: string): MicroActionContractScope {
  const normalized = skill.trim().toLowerCase();
  if (
    normalized.includes("construction") ||
    normalized.includes("carpentry") ||
    normalized.includes("electrical") ||
    normalized.includes("plumbing") ||
    normalized.includes("roofing") ||
    normalized.includes("hvac")
  ) {
    return "team";
  }
  return "individual";
}

export function buildGoalActionBreakdown(
  goal: string,
  path: ProjectExecutionPath = "balanced",
): GoalActionBreakdown {
  const trimmedGoal = normalizeMultilingualInput(goal.trim());
  const template = matchProjectTemplate(trimmedGoal);
  const multipliers = PATH_MULTIPLIERS[path];
  const projectName = deriveProjectName(trimmedGoal, template);

  let actionIndex = 0;
  const allActions: GoalActionItem[] = [];

  const phaseBreakdowns: GoalActionPhaseBreakdown[] = template.phases.map((phaseSpec, phaseIndex) => ({
    phaseName: phaseSpec.name,
    order: phaseIndex,
    status: phaseIndex === 0 ? "available" : "locked",
    subPhases: phaseSpec.subPhases.map((subSpec) => ({
      subPhaseName: subSpec.name,
      actions: subSpec.microActions.map((micro) => {
        actionIndex += 1;
        const category = resolveActionCategory(micro.name);
        const estimatedValue = Math.round(micro.baseCost * multipliers.cost);
        const estimatedDays = Math.max(1, Math.round(micro.baseDays * multipliers.days));
        const item: GoalActionItem = {
          actionIndex,
          actionId: createLivingId("act"),
          name: micro.name,
          description: describeAction(micro.name, micro.skill, template),
          requiredSkill: micro.skill,
          executionScope: scopeForSkill(micro.skill),
          estimatedDays,
          estimatedValue,
          evidenceRequired: evidenceForSkill(micro.skill),
          contractReady: phaseIndex === 0,
          startNow: false,
          phaseName: phaseSpec.name,
          subPhaseName: subSpec.name,
          phaseOrder: phaseIndex,
        };
        void category;
        allActions.push(item);
        return item;
      }),
    })),
  }));

  const startNowActions = allActions
    .filter((action) => action.phaseOrder === 0)
    .slice(0, 3)
    .map((action) => ({ ...action, startNow: true }));

  const startNowIds = new Set(startNowActions.map((action) => action.actionId));
  for (const phase of phaseBreakdowns) {
    for (const sub of phase.subPhases) {
      for (const action of sub.actions) {
        action.startNow = startNowIds.has(action.actionId);
      }
    }
  }

  return {
    goal: trimmedGoal,
    projectName,
    templateId: template.templateId,
    templateLabel: template.label,
    templateSummary: template.summary,
    totalActions: allActions.length,
    totalEstimatedValue: allActions.reduce((sum, action) => sum + action.estimatedValue, 0),
    totalEstimatedDays: allActions.reduce((sum, action) => sum + action.estimatedDays, 0),
    phases: phaseBreakdowns,
    startNowActions,
  };
}
