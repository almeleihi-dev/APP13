export const RUNTIME_CAPABILITY_IDS = [
  "navigation",
  "screens",
  "handoff",
  "transition",
  "session",
  "validation",
  "discovery",
  "orchestration",
  "state-management",
  "read-only",
  "deterministic",
] as const;

export type RuntimeCapabilityId = (typeof RUNTIME_CAPABILITY_IDS)[number];

export interface RuntimeCapability {
  id: RuntimeCapabilityId;
  label: string;
  description: string;
}

export const RUNTIME_CAPABILITIES: RuntimeCapability[] = [
  { id: "navigation", label: "Navigation", description: "Runtime navigation and route support" },
  { id: "screens", label: "Screens", description: "Declarative runtime screen definitions" },
  { id: "handoff", label: "Handoff", description: "Cross-experience context handoff" },
  { id: "transition", label: "Transition", description: "Official transition stages" },
  { id: "session", label: "Session", description: "Runtime session tracking" },
  { id: "validation", label: "Validation", description: "Runtime experience validation" },
  { id: "discovery", label: "Discovery", description: "Registry discovery support" },
  { id: "orchestration", label: "Orchestration", description: "Multi-experience orchestration" },
  { id: "state-management", label: "State Management", description: "Authoritative runtime state" },
  { id: "read-only", label: "Read Only", description: "No persistence or business mutations" },
  { id: "deterministic", label: "Deterministic", description: "Deterministic runtime behavior" },
];

export function getRuntimeCapability(id: RuntimeCapabilityId): RuntimeCapability | undefined {
  return RUNTIME_CAPABILITIES.find((c) => c.id === id);
}
