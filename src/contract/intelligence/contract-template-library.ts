import type { ActionExtractResult } from "../../action/intelligence/types.js";
import type { RequirementExtractResult } from "../../action/intelligence/requirement/types.js";
import type {
  ContractMilestone,
  DraftContract,
  EscrowPlan,
  ProfessionCategory,
  ScopeOfWorkItem,
} from "./types.js";
import type { EscrowRule } from "./escrow-rule-library.js";

const PROFESSION_CATEGORY_ALIASES: Record<ProfessionCategory, string[]> = {
  cleaning: ["cleaner", "cleaning", "janitor", "housekeeping", "sanitization", "تنظيف", "منظف"],
  design: ["graphic_designer", "designer", "graphic", "logo", "brand", "مصمم", "تصميم"],
  software: [
    "software_developer",
    "developer",
    "engineer",
    "software",
    "website",
    "web",
    "app",
    "مطور",
    "برمجيات",
  ],
  construction: ["plumber", "electrician", "plumbing", "electrical", "repair", "سباك", "كهربائي"],
  consulting: ["consultant", "accountant", "lawyer", "advisory", "استشاري", "محاسب", "محامي"],
  events: ["event_coordinator", "event", "venue", "conference", "فعاليات", "منسق"],
  education: ["tutor", "teacher", "tutoring", "مدرس", "تدريس"],
  general: [],
};

interface AcceptanceCriteriaTemplate {
  id: string;
  text: string;
}

const STANDARD_ACCEPTANCE_CRITERIA: AcceptanceCriteriaTemplate[] = [
  {
    id: "files_delivered",
    text: "All agreed deliverable files or artifacts are submitted",
  },
  {
    id: "service_completed",
    text: "Service scope is completed as described in the milestone",
  },
  {
    id: "no_critical_defects",
    text: "No unresolved critical defects block acceptance",
  },
  {
    id: "customer_review_window",
    text: "Customer review window elapsed or explicit acceptance recorded",
  },
];

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function resolveProfessionCategory(
  profession: string,
  requirementText: string
): ProfessionCategory {
  const corpus = `${profession} ${requirementText}`.toLowerCase();

  for (const [category, aliases] of Object.entries(PROFESSION_CATEGORY_ALIASES) as Array<
    [ProfessionCategory, string[]]
  >) {
    if (category === "general") continue;
    if (aliases.some((alias) => corpus.includes(alias.toLowerCase()) || corpus.includes(alias))) {
      return category;
    }
  }

  return "general";
}

export function collectActionCodes(
  ai1: ActionExtractResult,
  ai2: RequirementExtractResult
): string[] {
  const codes = new Set<string>();
  for (const action of ai1.actions) {
    if (action.action_code) codes.add(action.action_code);
  }
  for (const action of ai2.suggested_actions) {
    if (action.action_code) codes.add(action.action_code);
  }
  return [...codes];
}

export function generateScopeOfWork(
  ai1: ActionExtractResult,
  ai2: RequirementExtractResult
): ScopeOfWorkItem[] {
  const scope: ScopeOfWorkItem[] = [];
  const seen = new Set<string>();

  for (const action of ai2.suggested_actions) {
    const key = `action:${action.action_code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scope.push({
      title: action.label,
      description: action.reason,
      action_code: action.action_code,
    });
  }

  for (const deliverable of ai2.deliverables) {
    const key = `deliverable:${deliverable.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scope.push({
      title: deliverable.title,
      description: deliverable.description,
    });
  }

  for (const action of ai1.actions) {
    const key = `ai1-action:${action.action_code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scope.push({
      title: action.action_name,
      description: `Provider capability mapped to ${action.action_code}`,
      action_code: action.action_code,
    });
  }

  for (const deliverable of ai1.deliverables) {
    const key = `ai1-deliverable:${deliverable.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scope.push({
      title: deliverable,
      description: "Suggested provider deliverable aligned to requirement scope",
    });
  }

  return scope;
}

export function generateMilestones(
  ai2: RequirementExtractResult,
  rule: EscrowRule
): ContractMilestone[] {
  const milestones: ContractMilestone[] = [];

  for (let index = 0; index < rule.milestoneCount; index += 1) {
    const template = ai2.milestones[index];
    const percentage = rule.percentages[index] ?? 0;
    const title = template?.title ?? rule.stageLabels[index] ?? `Milestone ${index + 1}`;
    const description = template
      ? `Deliverables for ${template.title}`
      : rule.triggers[index] ?? `Complete stage ${index + 1}`;

    const acceptanceCriteria = [
      ...(template?.acceptance_criteria ?? []),
      rule.triggers[index] ?? STANDARD_ACCEPTANCE_CRITERIA[1].text,
    ].filter((value, position, list) => list.indexOf(value) === position);

    milestones.push({
      title,
      description,
      percentage,
      acceptance_criteria: acceptanceCriteria,
    });
  }

  return milestones;
}

export function generateAcceptanceCriteria(
  milestones: ContractMilestone[],
  category: ProfessionCategory
): string[] {
  const criteria = new Set<string>();

  for (const milestone of milestones) {
    for (const criterion of milestone.acceptance_criteria) {
      criteria.add(criterion);
    }
  }

  for (const template of STANDARD_ACCEPTANCE_CRITERIA) {
    criteria.add(template.text);
  }

  if (category === "design") {
    criteria.add("Final design files delivered in agreed formats");
  }
  if (category === "software") {
    criteria.add("Deployed build passes agreed functional checks");
  }
  if (category === "cleaning") {
    criteria.add("Completed cleaning checklist signed off");
  }

  return [...criteria];
}

export function buildDraftContract(input: {
  profession: string;
  requirementText: string;
  contractValue: number;
  currency: string;
  scope: ScopeOfWorkItem[];
  milestones: ContractMilestone[];
  escrowPlan: EscrowPlan;
  acceptanceCriteria: string[];
}): DraftContract {
  const title = `${input.profession} Service Agreement`;
  const summary = normalizeWhitespace(
    [
      `Draft contract proposal for ${input.profession}.`,
      input.requirementText,
      input.contractValue > 0
        ? `Estimated value ${input.contractValue} ${input.currency}.`
        : "Contract value to be confirmed.",
    ].join(" ")
  );

  const scopeSummary = input.scope.map((item) => `- ${item.title}: ${item.description}`).join("\n");
  const milestoneSummary = input.milestones
    .map(
      (milestone) =>
        `- ${milestone.title} (${milestone.percentage}%): ${milestone.description}`
    )
    .join("\n");
  const escrowSummary = input.escrowPlan.recommended_structure
    .map((stage) => `- ${stage.label}: ${stage.percentage}% — ${stage.trigger}`)
    .join("\n");
  const acceptanceSummary = input.acceptanceCriteria.map((item) => `- ${item}`).join("\n");

  return {
    title,
    summary,
    sections: [
      {
        heading: "Scope of Work",
        content: scopeSummary || "Scope items to be confirmed.",
      },
      {
        heading: "Milestone Plan",
        content: milestoneSummary || "Milestone plan to be confirmed.",
      },
      {
        heading: "Escrow Release Plan",
        content: escrowSummary || "Escrow structure to be confirmed.",
      },
      {
        heading: "Acceptance Criteria",
        content: acceptanceSummary || "Acceptance criteria to be confirmed.",
      },
    ],
  };
}

export function isUnknownIntelligence(
  ai1: ActionExtractResult,
  ai2: RequirementExtractResult
): boolean {
  return (
    ai1.profession === "unknown" &&
    ai1.confidence === 0 &&
    ai2.contract_readiness === "unknown" &&
    ai2.confidence === 0
  );
}

export function buildUnknownContractResult(): import("./types.js").ContractGenerateResult {
  return {
    contract_readiness: "unknown",
    risk_profile: {
      risk_level: "high",
      reason: "Insufficient AI-1/AI-2 signal to propose a contract structure",
      recommended_milestones: 0,
    },
    scope_of_work: [],
    milestones: [],
    acceptance_criteria: [],
    escrow_plan: {
      recommended_structure: [],
      release_strategy: "milestone_based",
    },
    draft_contract: {
      title: "Contract proposal unavailable",
      summary: "Unable to generate a draft contract without matched profession and requirement signals.",
      sections: [],
    },
  };
}