import type { MilestoneArchetype } from "../../action-blueprint/domain/action-blueprint.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { ExecutionMilestone } from "./milestone-pattern.js";

export interface AcceptanceCriterion {
  criterionId: string;
  milestoneCode: MilestoneArchetype;
  description: string;
  measurable: boolean;
  required: boolean;
}

export interface ExecutionDeliverable {
  deliverableId: string;
  milestoneCode: MilestoneArchetype;
  label: string;
  source: "scope_inclusion" | "milestone_pattern" | "template_default";
  required: boolean;
}

export function buildAcceptanceCriteria(input: {
  blueprint: ActionBlueprint;
  milestones: ExecutionMilestone[];
}): AcceptanceCriterion[] {
  const acceptMilestone = input.milestones.find((entry) => entry.milestoneCode === "M-ACCEPT");
  const criteria: AcceptanceCriterion[] = input.blueprint.scope.inclusions.map((inclusion, index) => ({
    criterionId: `accept://${input.blueprint.blueprintId}/scope/${index + 1}`,
    milestoneCode: "M-ACCEPT",
    description: `Customer accepts: ${inclusion}`,
    measurable: true,
    required: true,
  }));

  criteria.push({
    criterionId: `accept://${input.blueprint.blueprintId}/outcome`,
    milestoneCode: acceptMilestone?.milestoneCode ?? "M-ACCEPT",
    description: input.blueprint.intent.outcome,
    measurable: true,
    required: true,
  });

  criteria.push({
    criterionId: `accept://${input.blueprint.blueprintId}/standard`,
    milestoneCode: "M-VERIFY",
    description: `Work meets APP13 taxonomy ${input.blueprint.primaryTaxonomyCode} standard of care`,
    measurable: false,
    required: true,
  });

  return criteria;
}

export function buildDeliverables(input: {
  blueprint: ActionBlueprint;
  milestones: ExecutionMilestone[];
}): ExecutionDeliverable[] {
  const deliverMilestone =
    input.milestones.find((entry) => entry.milestoneCode === "M-DELIVER") ??
    input.milestones.find((entry) => entry.milestoneCode === "M-VERIFY");

  const milestoneCode = deliverMilestone?.milestoneCode ?? "M-VERIFY";

  const scopeDeliverables = input.blueprint.scope.inclusions.map((inclusion, index) => ({
    deliverableId: `deliver://${input.blueprint.blueprintId}/scope/${index + 1}`,
    milestoneCode,
    label: inclusion,
    source: "scope_inclusion" as const,
    required: true,
  }));

  const patternDeliverables = input.blueprint.milestonePattern
    .filter((entry) => entry.milestoneCode === "M-DELIVER" || entry.milestoneCode === "M-VERIFY")
    .map((entry, index) => ({
      deliverableId: `deliver://${input.blueprint.blueprintId}/pattern/${index + 1}`,
      milestoneCode: entry.milestoneCode,
      label: `${entry.milestoneCode} deliverable checkpoint`,
      source: "milestone_pattern" as const,
      required: entry.blocking,
    }));

  if (scopeDeliverables.length === 0 && patternDeliverables.length === 0) {
    return [
      {
        deliverableId: `deliver://${input.blueprint.blueprintId}/default`,
        milestoneCode,
        label: input.blueprint.intent.object,
        source: "template_default",
        required: true,
      },
    ];
  }

  return [...scopeDeliverables, ...patternDeliverables];
}
