export const PREVIEW_TARGET_IDS = [
  "need",
  "action",
  "contract",
  "chat",
  "timeline",
  "notification",
  "profile",
  "runtime-journey",
  "runtime-state",
  "runtime-registry",
  "runtime-coordinator",
  "runtime-health",
  "runtime-demo",
] as const;

export type PreviewTargetId = (typeof PREVIEW_TARGET_IDS)[number];

export type PreviewTargetCategory = "experience" | "runtime";

export type PreviewReadiness = "ready" | "pending" | "unavailable";

export type PreviewValidationStatus = "valid" | "warning" | "invalid";

export interface PreviewTarget {
  id: PreviewTargetId;
  title: string;
  description: string;
  category: PreviewTargetCategory;
  entryScreen: string;
  delegateModule: string;
  readiness: PreviewReadiness;
  validationStatus: PreviewValidationStatus;
}

export const PREVIEW_TARGETS: PreviewTarget[] = [
  {
    id: "need",
    title: "Need Experience",
    description: "Read-only preview of Need Mode discovery before execution.",
    category: "experience",
    entryScreen: "need-home",
    delegateModule: "CH3-X5",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "action",
    title: "Action Experience",
    description: "Read-only preview of Action Mode execution surfaces.",
    category: "experience",
    entryScreen: "action-home",
    delegateModule: "CH3-X6",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "contract",
    title: "Contract Experience",
    description: "Read-only preview of Contract Mode agreement flows.",
    category: "experience",
    entryScreen: "contract-home",
    delegateModule: "CH3-X7",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "chat",
    title: "Chat Experience",
    description: "Read-only preview of Chat Mode conversation surfaces.",
    category: "experience",
    entryScreen: "chat-home",
    delegateModule: "CH3-X8",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "timeline",
    title: "Timeline Experience",
    description: "Read-only preview of Timeline Mode activity views.",
    category: "experience",
    entryScreen: "timeline-home",
    delegateModule: "CH3-X9",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "notification",
    title: "Notification Experience",
    description: "Read-only preview of Notification Mode alert surfaces.",
    category: "experience",
    entryScreen: "notification-home",
    delegateModule: "CH3-X10",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "profile",
    title: "Profile Experience",
    description: "Read-only preview of Profile Mode identity surfaces.",
    category: "experience",
    entryScreen: "profile-home",
    delegateModule: "CH3-X11",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-journey",
    title: "Runtime Journey",
    description: "Read-only preview of the complete AN ACT journey map.",
    category: "runtime",
    entryScreen: "runtime-journey",
    delegateModule: "CH3-X12",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-state",
    title: "Runtime State",
    description: "Read-only preview of runtime session and lifecycle state.",
    category: "runtime",
    entryScreen: "runtime-state",
    delegateModule: "CH3-X13",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-registry",
    title: "Runtime Registry",
    description: "Read-only preview of registered runtime experiences.",
    category: "runtime",
    entryScreen: "runtime-registry",
    delegateModule: "CH3-X14",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-coordinator",
    title: "Runtime Coordinator",
    description: "Read-only preview of runtime coordination and execution plan.",
    category: "runtime",
    entryScreen: "runtime-coordinator",
    delegateModule: "CH3-X15",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-health",
    title: "Runtime Health",
    description: "Read-only preview of runtime health and diagnostics.",
    category: "runtime",
    entryScreen: "runtime-health",
    delegateModule: "CH3-X16",
    readiness: "ready",
    validationStatus: "valid",
  },
  {
    id: "runtime-demo",
    title: "Runtime Demo",
    description: "Read-only preview of the official runtime demo mode.",
    category: "runtime",
    entryScreen: "demo-home",
    delegateModule: "CH3-X17",
    readiness: "ready",
    validationStatus: "valid",
  },
];

export function isPreviewTargetId(id: string): id is PreviewTargetId {
  return (PREVIEW_TARGET_IDS as readonly string[]).includes(id);
}

export function getPreviewTarget(id: PreviewTargetId): PreviewTarget {
  const target = PREVIEW_TARGETS.find((t) => t.id === id);
  if (!target) throw new Error(`Unknown preview target: ${id}`);
  return target;
}
