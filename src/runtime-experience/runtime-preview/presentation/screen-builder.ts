function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

function buildExperiencePreview(screenId: string, label: string, payload: Record<string, unknown>) {
  return {
    screenId,
    readOnly: true,
    sections: [
      {
        id: screenId,
        label,
        components: [
          component("preview-delegated", "core-ui-card", { ...payload, readOnly: true, preview: true }, label),
        ],
      },
    ],
  };
}

export function buildPreviewHome(targetCount: number) {
  return {
    screenId: "preview-home",
    readOnly: true,
    sections: [
      {
        id: "preview-home",
        label: "Runtime Preview Home",
        components: [
          component("target-count", "core-ui-badge", { count: targetCount }, "Preview targets"),
          component("read-only", "core-ui-chip", { readOnly: true, preview: true }, "Read-only preview"),
        ],
      },
    ],
  };
}

export function buildPreviewNeed(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-need", "Need Experience Preview", payload);
}

export function buildPreviewAction(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-action", "Action Experience Preview", payload);
}

export function buildPreviewContract(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-contract", "Contract Experience Preview", payload);
}

export function buildPreviewChat(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-chat", "Chat Experience Preview", payload);
}

export function buildPreviewTimeline(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-timeline", "Timeline Experience Preview", payload);
}

export function buildPreviewNotification(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-notification", "Notification Experience Preview", payload);
}

export function buildPreviewProfile(payload: Record<string, unknown>) {
  return buildExperiencePreview("preview-profile", "Profile Experience Preview", payload);
}

export function buildPreviewSummary(targetId: string, payload: Record<string, unknown>) {
  return {
    screenId: "preview-summary",
    readOnly: true,
    sections: [
      {
        id: "preview-summary",
        label: "Runtime Preview Summary",
        components: [
          component("summary", "core-ui-card", { targetId, ...payload, readOnly: true, preview: true }, "Preview summary"),
        ],
      },
    ],
  };
}
