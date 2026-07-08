import type { ConversationSummary } from "../domain/conversation.js";
import { describeConversationState } from "../domain/conversation.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildRuntimeScreenView, buildComponentInstance } from "./screen-builder.js";

export function buildConversationInfoScreen(
  conversation: ConversationSummary,
  navigation: NavigationState,
  generatedAt: string
) {
  return buildRuntimeScreenView({
    screenId: "conversation-info",
    navigation,
    generatedAt,
    sections: [
      {
        id: "related-contract",
        label: "Related Contract",
        purpose: "Contract this conversation belongs to.",
        components: [
          buildComponentInstance({
            id: "contract-link",
            componentId: "core-ui-contract-card",
            props: {
              contractId: conversation.context.contractId,
              status: conversation.context.contractStatus,
              route: "/contract/home",
            },
            label: `Related contract ${conversation.context.contractId ?? "none"}`,
            role: "region",
          }),
        ],
      },
      {
        id: "related-action",
        label: "Related Action",
        purpose: "Active action this conversation supports.",
        components: [
          buildComponentInstance({
            id: "action-link",
            componentId: "core-ui-card",
            props: {
              actionId: conversation.context.actionId,
              status: conversation.context.actionStatus,
              route: "/action/active",
            },
            label: `Related action ${conversation.context.actionId ?? "none"}`,
            role: "region",
          }),
        ],
      },
      {
        id: "participants",
        label: "Participants",
        purpose: "Conversation participants.",
        components: conversation.participants.map((p) =>
          buildComponentInstance({
            id: `participant-${p.id}`,
            componentId: "core-ui-avatar",
            props: { name: p.name, role: p.role, liveFrameTier: p.liveFrameTier },
            label: p.name,
            role: "listitem",
          })
        ),
      },
      {
        id: "created-date",
        label: "Created Date",
        purpose: "When the conversation was created.",
        components: [
          buildComponentInstance({
            id: "created-at",
            componentId: "core-ui-card",
            props: { title: "Created", value: conversation.createdAt },
            label: `Created ${conversation.createdAt}`,
          }),
        ],
      },
      {
        id: "current-state",
        label: "Current State",
        purpose: "Current conversation lifecycle state.",
        components: [
          buildComponentInstance({
            id: "state-badge",
            componentId: "core-ui-badge",
            variant: "professional",
            props: { label: conversation.state, description: describeConversationState(conversation.state) },
            label: describeConversationState(conversation.state),
            role: "status",
          }),
        ],
      },
      {
        id: "return-links",
        label: "Return Links",
        purpose: "Return to Action Home or Contract.",
        components: [
          buildComponentInstance({
            id: "return-action-home",
            componentId: "core-ui-button",
            variant: "secondary",
            props: { label: "Return to Action Home", route: "/action/home" },
            label: "Return to action home",
            role: "button",
          }),
          buildComponentInstance({
            id: "return-contract",
            componentId: "core-ui-button",
            variant: "ghost",
            props: { label: "Return to Contract", route: "/contract/home" },
            label: "Return to contract",
            role: "button",
          }),
        ],
      },
    ],
  });
}
