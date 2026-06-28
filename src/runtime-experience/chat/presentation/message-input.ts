import type { ChatScreenSection } from "../domain/chat-screen.js";
import { buildComponentInstance } from "./screen-builder.js";

export function buildMessageInputSection(draftMessage: string, canSend: boolean): ChatScreenSection {
  return {
    id: "message-input",
    label: "Message Input",
    purpose: "Text input and send — local only, no messaging backend.",
    components: [
      buildComponentInstance({
        id: "message-text-input",
        componentId: "core-ui-input",
        props: {
          name: "message",
          label: "Message",
          value: draftMessage,
          placeholder: canSend ? "Type a message..." : "Messaging disabled for this conversation state",
          multiline: true,
          disabled: !canSend,
          backend: false,
        },
        label: "Message input",
        role: "textbox",
      }),
      buildComponentInstance({
        id: "send-button",
        componentId: "core-ui-button",
        variant: "primary",
        props: {
          label: "Send",
          action: "send-message",
          disabled: !canSend || !draftMessage.trim(),
          backend: false,
        },
        label: "Send message",
        role: "button",
      }),
    ],
  };
}
