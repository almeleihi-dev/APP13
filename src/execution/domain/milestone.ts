export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "disputed"
  | "frozen"
  | "waived";

export type ResponsibleParty = "customer" | "provider" | "system" | "both";

export interface MilestoneTransitionRule {
  to: MilestoneStatus;
  from?: MilestoneStatus;
}

export const MILESTONE_TRANSITIONS: Record<string, MilestoneTransitionRule> = {
  start: { to: "in_progress", from: "pending" },
  submit: { to: "submitted", from: "in_progress" },
  accept: { to: "accepted", from: "submitted" },
  dispute: { to: "disputed", from: "submitted" },
  waive: { to: "waived", from: "pending" },
};

export function getMilestoneTransition(transition: string): MilestoneTransitionRule | null {
  return MILESTONE_TRANSITIONS[transition] ?? null;
}
