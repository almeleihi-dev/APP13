import type { NeedRequestDraft } from "../domain/need-state.js";
import type { NeedOpportunity } from "../infrastructure/need-repository.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildRequestScreen(
  draft: NeedRequestDraft,
  opportunity: NeedOpportunity | undefined,
  navigation: NavigationState,
  generatedAt: string
) {
  const summary = draft.actionSummary || opportunity?.title || "New request";
  const estimatedCost = draft.estimatedCost || opportunity?.estimatedCostSar || 0;

  return buildRuntimeScreenView({
    screenId: "request",
    navigation,
    generatedAt,
    sections: [
      {
        id: "action-summary",
        label: "Action Summary",
        purpose: "Summary of the selected action and opportunity.",
        components: [
          buildComponentInstance({
            id: "summary-card",
            componentId: "core-ui-card",
            variant: "elevated",
            props: {
              title: summary,
              category: opportunity?.category,
              rating: opportunity?.rating,
              liveFrameTier: opportunity?.liveFrameTier,
            },
            label: `Action summary: ${summary}`,
            role: "region",
          }),
        ],
      },
      {
        id: "location",
        label: "Location",
        purpose: "Service or meeting location.",
        components: [
          buildComponentInstance({
            id: "location-input",
            componentId: "core-ui-input",
            props: {
              name: "location",
              label: "Location",
              value: draft.location,
              placeholder: "Enter service location",
              required: true,
            },
            label: "Location",
            role: "textbox",
          }),
        ],
      },
      {
        id: "schedule",
        label: "Schedule",
        purpose: "Preferred date and time.",
        components: [
          buildComponentInstance({
            id: "schedule-input",
            componentId: "core-ui-input",
            props: {
              name: "schedule",
              label: "Schedule",
              value: draft.schedule,
              placeholder: "Preferred date and time",
              required: true,
            },
            label: "Schedule",
            role: "textbox",
          }),
        ],
      },
      {
        id: "notes",
        label: "Notes",
        purpose: "Additional request details.",
        components: [
          buildComponentInstance({
            id: "notes-input",
            componentId: "core-ui-input",
            props: {
              name: "notes",
              label: "Notes",
              value: draft.notes,
              placeholder: "Add any special requirements or notes",
              multiline: true,
            },
            label: "Notes",
            role: "textbox",
          }),
        ],
      },
      {
        id: "estimated-cost",
        label: "Estimated Cost",
        purpose: "Estimated cost before continuing to transition.",
        components: [
          buildComponentInstance({
            id: "cost-display",
            componentId: "core-ui-card",
            props: {
              title: "Estimated Cost",
              amountSar: estimatedCost,
              estimatedMinutes: opportunity?.estimatedMinutes,
            },
            label: `Estimated cost ${estimatedCost} SAR`,
            role: "region",
          }),
        ],
      },
      {
        id: "continue",
        label: "Continue",
        purpose: "Continue to official transition.",
        components: [
          buildComponentInstance({
            id: "continue-button",
            componentId: "core-ui-button",
            variant: "primary",
            props: {
              label: "Continue",
              action: "continue-request",
              disabled: !draft.location || !draft.schedule,
            },
            label: "Continue to transition",
            role: "button",
          }),
        ],
      },
    ],
  });
}
