import type { TimelineEvent } from "../domain/timeline-event.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildTimelineDetailScreen(
  event: TimelineEvent,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "timeline-detail",
    navigation,
    generatedAt,
    sections: [
      {
        id: "event-title",
        label: "Title",
        purpose: "Event title.",
        components: [
          buildComponentInstance({
            id: "title",
            componentId: "core-ui-navigation-bar",
            props: { title: event.title, subtitle: event.type },
            label: event.title,
            role: "banner",
          }),
        ],
      },
      {
        id: "event-description",
        label: "Description",
        purpose: "Event description.",
        components: [
          buildComponentInstance({
            id: "description",
            componentId: "core-ui-card",
            props: { title: "Description", summary: event.description },
            label: event.description,
          }),
        ],
      },
      {
        id: "event-timestamp",
        label: "Timestamp",
        purpose: "When the event occurred.",
        components: [
          buildComponentInstance({
            id: "timestamp",
            componentId: "core-ui-badge",
            props: { label: event.timestamp },
            label: `Occurred at ${event.timestamp}`,
            role: "status",
          }),
        ],
      },
      {
        id: "related-contract",
        label: "Related Contract",
        purpose: "Contract linked to this event.",
        components: [
          buildComponentInstance({
            id: "contract",
            componentId: "core-ui-contract-card",
            props: { contractId: event.relatedContractId, route: "/contract/home", readOnly: true },
            label: event.relatedContractId ? `Contract ${event.relatedContractId}` : "No related contract",
            role: "region",
          }),
        ],
      },
      {
        id: "related-participant",
        label: "Related Participant",
        purpose: "Participant linked to this event.",
        components: [
          buildComponentInstance({
            id: "participant",
            componentId: "core-ui-avatar",
            props: { name: event.relatedParticipant ?? "Unknown", readOnly: true },
            label: event.relatedParticipant ?? "No participant",
            role: "listitem",
          }),
        ],
      },
      {
        id: "event-type",
        label: "Event Type",
        purpose: "Timeline event type classification.",
        components: [
          buildComponentInstance({
            id: "type",
            componentId: "core-ui-chip",
            props: { label: event.type, colorToken: event.colorToken },
            label: `Event type: ${event.type}`,
            role: "status",
          }),
        ],
      },
      {
        id: "recommendations",
        label: "Recommendations",
        purpose: "Display-only recommendations — no AI execution.",
        components: event.recommendations.map((rec, i) =>
          buildComponentInstance({
            id: `rec-${i}`,
            componentId: "core-ui-card",
            props: { title: "Recommendation", summary: rec, readOnly: true },
            label: rec,
          })
        ),
      },
      {
        id: "confidence",
        label: "Confidence",
        purpose: "Confidence score display only.",
        components: [
          buildComponentInstance({
            id: "confidence",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: `${Math.round(event.confidence * 100)}% confidence`, value: event.confidence },
            label: `${Math.round(event.confidence * 100)} percent confidence`,
            role: "status",
          }),
        ],
      },
      {
        id: "return-links",
        label: "Return Links",
        purpose: "Return to related experiences — display only.",
        components: [
          buildComponentInstance({
            id: "return-need",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Need Home", route: "/need/home", readOnly: true },
            label: "Return to need home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-action",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Action Home", route: "/action/home", readOnly: true },
            label: "Return to action home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-contract",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Contract", route: "/contract/home", readOnly: true },
            label: "Return to contract",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-chat",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Chat", route: "/chat/home", readOnly: true },
            label: "Return to chat",
            role: "button",
          }),
        ],
      },
    ],
  });
}
