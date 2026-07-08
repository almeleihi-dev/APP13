export const LESSON_TEMPLATES = [
  {
    category: "evidence",
    insight: "Early evidence capture at each milestone reduces acceptance rework.",
    applicableScenarios: ["moving_a_room", "cleaning_an_apartment", "fixing_small_home_issue"],
  },
  {
    category: "sequencing",
    insight: "Respecting task dependencies prevents parallel execution conflicts.",
    applicableScenarios: ["moving_a_room", "delivering_a_document"],
  },
  {
    category: "scope",
    insight: "Clear deliverable definitions at contract stage improve outcome predictability.",
    applicableScenarios: ["preparing_professional_service_request"],
  },
] as const;

export const OPTIMIZATION_TEMPLATES = [
  {
    area: "checkpoint_density",
    suggestion: "Consolidate redundant verification gates when milestone count exceeds five.",
    expectedBenefit: "Reduced acceptance cycle time without lowering quality bar.",
  },
  {
    area: "parallel_tasks",
    suggestion: "Prioritize parallel-capable tasks during preparation phases.",
    expectedBenefit: "Shorter execution window within same quality envelope.",
  },
  {
    area: "evidence_automation",
    suggestion: "Standardize photo/checklist templates per canonical action category.",
    expectedBenefit: "Higher deliverable verification pass rate on first submission.",
  },
] as const;
