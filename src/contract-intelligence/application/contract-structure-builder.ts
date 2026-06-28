import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type {
  ContractAcceptanceCriteria,
  ContractApproval,
  ContractDeliverable,
  ContractEvidenceRequirement,
  ContractMilestone,
  ContractParty,
  ContractStructure,
} from "../domain/contract-context.js";
import {
  getCategoryContractProfile,
  STANDARD_CONTRACT_SECTIONS,
} from "../domain/contract-reference-values.js";

export class ContractStructureBuilder {
  build(plan: ActionPlan, category: string): ContractStructure {
    const profile = getCategoryContractProfile(category);
    return {
      structureId: `structure-${plan.planId}`,
      sections: STANDARD_CONTRACT_SECTIONS.map((section) => ({
        ...section,
        description: describeSection(section.sectionId, plan.goal),
      })),
      governingLaw: profile.governingLaw,
      disputeResolution:
        "Platform-mediated dispute resolution with evidence review before arbitration escalation.",
    };
  }
}

export class ContractPartiesBuilder {
  build(plan: ActionPlan, canonicalAction: CanonicalAction): ContractParty[] {
    return [
      {
        partyId: "party.customer",
        role: "customer",
        label: "Customer (Requester)",
        responsibilities: [
          "Provide accurate scope and access details.",
          "Approve milestones and release evidence when satisfied.",
          ...canonicalAction.preconditions
            .filter((p) => p.mandatory)
            .map((p) => p.label),
        ],
      },
      {
        partyId: "party.provider",
        role: "provider",
        label: "Service Provider",
        responsibilities: [
          `Execute "${plan.goal}" per agreed milestones.`,
          "Submit required evidence at each acceptance gate.",
          ...canonicalAction.requiredSkills.map((s) => `Demonstrate ${s.name} competency.`),
        ],
      },
      {
        partyId: "party.platform",
        role: "platform",
        label: "AN ACT Platform",
        responsibilities: [
          "Hold escrow per recommendation (read-only intelligence — no funds moved).",
          "Facilitate evidence verification and dispute mediation.",
          "Maintain audit trail without mutating trust scores.",
        ],
      },
    ];
  }
}

export class ContractMilestoneBuilder {
  build(plan: ActionPlan): {
    milestones: ContractMilestone[];
    deliverables: ContractDeliverable[];
    acceptanceCriteria: ContractAcceptanceCriteria[];
  } {
    const stageCount = plan.stages.length;
    const paymentShare = stageCount > 0 ? Math.round(100 / stageCount) : 100;

    const milestones: ContractMilestone[] = plan.stages.map((stage, index) => {
      const evidence = plan.completionCriteria
        .filter((c) => c.label.toLowerCase().includes(stage.phase))
        .flatMap((c) => c.evidenceRequired);

      return {
        milestoneId: `milestone.${stage.stageId}`,
        order: index + 1,
        title: stage.title,
        description: stage.description,
        linkedStageId: stage.stageId,
        paymentPercentage: index === stageCount - 1 ? 100 - paymentShare * (stageCount - 1) : paymentShare,
        evidenceRequired: evidence.length > 0 ? evidence : [`Evidence for ${stage.title}`],
      };
    });

    const deliverables: ContractDeliverable[] = plan.tasks
      .filter((task) => task.order >= plan.tasks.length - 2 || task.title.toLowerCase().includes("complete"))
      .map((task) => ({
        deliverableId: `deliverable.${task.taskId}`,
        title: task.title,
        description: task.description,
        linkedTaskId: task.taskId,
        mandatory: true,
      }));

    if (deliverables.length === 0) {
      deliverables.push({
        deliverableId: `deliverable.${plan.planId}`,
        title: plan.goal,
        description: `Completed execution of ${plan.goal} with all acceptance criteria met.`,
        linkedTaskId: plan.tasks[plan.tasks.length - 1]?.taskId ?? null,
        mandatory: true,
      });
    }

    const acceptanceCriteria: ContractAcceptanceCriteria[] = plan.completionCriteria.map((criteria) => ({
      criteriaId: criteria.criteriaId,
      label: criteria.label,
      description: criteria.description,
      evidenceRequired: criteria.evidenceRequired,
      mandatory: criteria.mandatory,
    }));

    return { milestones, deliverables, acceptanceCriteria };
  }
}

export class ContractEvidenceBuilder {
  build(canonicalAction: CanonicalAction, plan: ActionPlan): ContractEvidenceRequirement[] {
    const fromCanonical = canonicalAction.evidenceRequirements.map((ev) => ({
      evidenceId: ev.evidenceId,
      label: ev.label,
      description: ev.description,
      minimumCount: ev.minimumCount,
      source: "canonical_action" as const,
    }));

    const fromCriteria = plan.completionCriteria.flatMap((c) =>
      c.evidenceRequired.map((label, index) => ({
        evidenceId: `ev.criteria.${c.criteriaId}.${index}`,
        label,
        description: `Required for acceptance: ${c.label}`,
        minimumCount: 1,
        source: "completion_criteria" as const,
      }))
    );

    const fromTrust = canonicalAction.trustSignals.slice(0, 2).map((signal, index) => ({
      evidenceId: `ev.trust.${index}`,
      label: `Trust safeguard ${index + 1}`,
      description: signal,
      minimumCount: 1,
      source: "trust_signal" as const,
    }));

    return [...fromCanonical, ...fromCriteria, ...fromTrust];
  }
}

export class ContractApprovalsBuilder {
  build(plan: ActionPlan): ContractApproval[] {
    return plan.decisionPoints.map((point) => ({
      approvalId: point.decisionId,
      gateType: point.gateType,
      label: point.label,
      requiredParty:
        point.gateType === "approval"
          ? "customer"
          : point.gateType === "verification"
            ? "platform"
            : "provider",
      mandatory: point.mandatory,
    }));
  }
}

function describeSection(sectionId: string, goal: string): string {
  switch (sectionId) {
    case "sec.parties":
      return "Defines customer, provider, and platform roles for this engagement.";
    case "sec.scope":
      return `Scope covers: ${goal}. Deliverables map to plan tasks.`;
    case "sec.milestones":
      return "Milestones align with action plan stages and payment release gates.";
    case "sec.payment":
      return "Payment terms derived from CH4-C4 dynamic pricing recommendation.";
    case "sec.evidence":
      return "Evidence requirements from canonical action and completion criteria.";
    case "sec.risk":
      return "Risk clauses reflect canonical action risk signals and plan complexity.";
    case "sec.cancellation":
      return "Cancellation terms based on category profile and urgency.";
    case "sec.warranty":
      return "Warranty remedies appropriate to service category.";
    default:
      return "Standard contract section.";
  }
}

export function createContractStructureBuilder(): ContractStructureBuilder {
  return new ContractStructureBuilder();
}
export function createContractPartiesBuilder(): ContractPartiesBuilder {
  return new ContractPartiesBuilder();
}
export function createContractMilestoneBuilder(): ContractMilestoneBuilder {
  return new ContractMilestoneBuilder();
}
export function createContractEvidenceBuilder(): ContractEvidenceBuilder {
  return new ContractEvidenceBuilder();
}
export function createContractApprovalsBuilder(): ContractApprovalsBuilder {
  return new ContractApprovalsBuilder();
}
