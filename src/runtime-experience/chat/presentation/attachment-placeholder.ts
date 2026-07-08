import type { ChatScreenSection } from "../domain/chat-screen.js";
import { buildComponentInstance } from "./screen-builder.js";

export function buildAttachmentPlaceholderSection(enabled: boolean): ChatScreenSection {
  return {
    id: "attachment-placeholder",
    label: "Attachment Placeholder",
    purpose: "Attachment options display only — no upload implementation.",
    components: [
      buildComponentInstance({
        id: "attach-image",
        componentId: "core-ui-button",
        variant: "ghost",
        props: { label: "Image", icon: "image", disabled: !enabled, upload: false },
        label: "Attach image placeholder",
        role: "button",
      }),
      buildComponentInstance({
        id: "attach-document",
        componentId: "core-ui-button",
        variant: "ghost",
        props: { label: "Document", icon: "document", disabled: !enabled, upload: false },
        label: "Attach document placeholder",
        role: "button",
      }),
      buildComponentInstance({
        id: "attach-location",
        componentId: "core-ui-button",
        variant: "ghost",
        props: { label: "Location", icon: "location", disabled: !enabled, upload: false },
        label: "Attach location placeholder",
        role: "button",
      }),
      buildComponentInstance({
        id: "attach-camera",
        componentId: "core-ui-button",
        variant: "ghost",
        props: { label: "Camera", icon: "camera", disabled: !enabled, upload: false },
        label: "Attach camera placeholder",
        role: "button",
      }),
    ],
  };
}
