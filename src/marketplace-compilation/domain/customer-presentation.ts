import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { ExecutionBlueprint } from "../../execution-blueprint/domain/execution-blueprint.js";

export interface CustomerPresentationModel {
  headline: string;
  valueProposition: string;
  outcome: string;
  inclusions: string[];
  exclusions: string[];
  acceptanceSummary: string;
  estimatedDurationHours: { min: number; max: number };
  summary: string;
}

export function buildCustomerPresentation(input: {
  blueprint: ActionBlueprint;
  executionBlueprint: ExecutionBlueprint;
}): CustomerPresentationModel {
  const acceptance = input.executionBlueprint.acceptanceCriteria
    .slice(0, 3)
    .map((entry) => entry.description)
    .join("; ");

  return {
    headline: input.blueprint.title,
    valueProposition: input.blueprint.summary,
    outcome: input.blueprint.intent.outcome,
    inclusions: input.blueprint.scope.inclusions,
    exclusions: input.blueprint.scope.exclusions,
    acceptanceSummary: acceptance || "Standard APP13 acceptance criteria apply.",
    estimatedDurationHours: input.executionBlueprint.estimatedDurationHours,
    summary: `Customer presentation for ${input.blueprint.title}.`,
  };
}

export interface CustomerListingView {
  headline: string;
  subtitle: string;
  summary: string;
  outcome: string;
  inclusions: string[];
  exclusions: string[];
  estimated_duration_hours: { min: number; max: number };
}

export function buildCustomerView(presentation: CustomerPresentationModel, subtitle: string): CustomerListingView {
  return {
    headline: presentation.headline,
    subtitle,
    summary: presentation.valueProposition,
    outcome: presentation.outcome,
    inclusions: presentation.inclusions,
    exclusions: presentation.exclusions,
    estimated_duration_hours: presentation.estimatedDurationHours,
  };
}
