export const EXCEPTION_TEMPLATES = [
  {
    exceptionType: "scope_change",
    trigger: "Customer or provider requests scope modification mid-execution.",
    recommendedAction: "Pause execution, document change request, and re-run contract intelligence (read-only).",
    escalationPath: "Platform mediator reviews evidence before any contract amendment.",
  },
  {
    exceptionType: "evidence_rejection",
    trigger: "Acceptance evidence fails verification checkpoint.",
    recommendedAction: "Return to responsible party with specific rejection reasons; do not release escrow.",
    escalationPath: "Customer dispute channel if re-submission fails twice.",
  },
  {
    exceptionType: "schedule_slippage",
    trigger: "Task exceeds estimated max duration by more than 25%.",
    recommendedAction: "Notify all parties, reassess timeline from CH4-C3 plan, update progress model.",
    escalationPath: "Platform notification only — no automatic trust score changes.",
  },
  {
    exceptionType: "provider_unavailable",
    trigger: "Assigned provider cannot continue execution.",
    recommendedAction: "Document interruption, preserve evidence chain, initiate recovery matching flow.",
    escalationPath: "Escrow remains held until resolution or cancellation clause applies.",
  },
] as const;

export const RECOVERY_TEMPLATES = [
  {
    scenario: "partial_completion",
    steps: [
      "Capture completed milestone evidence.",
      "Calculate pro-rata payment per contract milestone percentages.",
      "Document remaining scope for follow-up engagement.",
    ],
    priority: "medium" as const,
  },
  {
    scenario: "quality_rework",
    steps: [
      "Identify failed quality checkpoint and acceptance criteria.",
      "Provider re-executes affected tasks within warranty window.",
      "Customer re-verifies before escrow release.",
    ],
    priority: "high" as const,
  },
  {
    scenario: "cancellation_mid_execution",
    steps: [
      "Apply contract cancellation notice period.",
      "Release escrow for completed milestones only.",
      "Archive evidence for dispute resolution if needed.",
    ],
    priority: "high" as const,
  },
] as const;
