export type ContractLifecycleStatus =
  | "draft"
  | "reviewing"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

export interface ContractPartySummary {
  role: "customer" | "provider";
  name: string;
  verificationStatus: "verified" | "pending" | "unverified";
  badges: string[];
  liveFrameTier?: "bronze" | "silver" | "gold" | "platinum";
  contactAvailable: boolean;
}

export interface ContractReviewDetails {
  actionSummary: string;
  requestDetails: string;
  scope: string;
  assumptions: string[];
  exclusions: string[];
  risks: string[];
  confidenceExplanation: string;
}

export interface ContractTermsDetails {
  scopeOfWork: string;
  requiredSteps: string[];
  responsibilities: { customer: string[]; provider: string[] };
  acceptanceCriteria: string[];
  cancellationNote: string;
  disputeNote: string;
  legalDisclaimer: string;
}

export interface ContractTimelineDetails {
  startTime: string;
  expectedDurationMinutes: number;
  milestones: { id: string; label: string; scheduledAt: string }[];
  checkpoints: { id: string; label: string }[];
  completionEstimate: string;
}

export interface ContractCostDetails {
  estimatedCostSar: number;
  platformFeePlaceholder: string;
  escrowPaymentPlaceholder: string;
  costAssumptions: string[];
  changeFactors: string[];
}

export interface ContractSummaryModel {
  contractId: string;
  actionTitle: string;
  status: ContractLifecycleStatus;
  location: string;
  estimatedCostSar: number;
  estimatedMinutes: number;
  liveFrameTier: "bronze" | "silver" | "gold" | "platinum";
  nextRequiredStep: string;
  parties: ContractPartySummary[];
  review: ContractReviewDetails;
  terms: ContractTermsDetails;
  timeline: ContractTimelineDetails;
  cost: ContractCostDetails;
  userConfirmed: boolean;
}

export function buildDefaultContractSummary(contractId: string): ContractSummaryModel {
  return {
    contractId,
    actionTitle: "Certified Electrician — Panel Upgrade",
    status: "draft",
    location: "Riyadh",
    estimatedCostSar: 850,
    estimatedMinutes: 120,
    liveFrameTier: "gold",
    nextRequiredStep: "Review contract details",
    parties: [
      {
        role: "customer",
        name: "Customer",
        verificationStatus: "verified",
        badges: ["Identity Verified"],
        contactAvailable: true,
      },
      {
        role: "provider",
        name: "Licensed Professional",
        verificationStatus: "verified",
        badges: ["Licensed", "Insured", "Live Frame Verified"],
        liveFrameTier: "gold",
        contactAvailable: true,
      },
    ],
    review: {
      actionSummary: "Certified Electrician — Panel Upgrade",
      requestDetails: "Upgrade residential electrical panel to meet current safety standards.",
      scope: "Assess existing panel, replace breakers, verify grounding, and test circuits.",
      assumptions: ["Access to main panel area", "Power can be shut off for 2 hours"],
      exclusions: ["Permit fees unless separately agreed", "Structural modifications"],
      risks: ["Hidden wiring issues may extend timeline", "Parts availability may vary"],
      confidenceExplanation:
        "Match confidence is based on verified credentials, location proximity, and historical completion rate.",
    },
    terms: {
      scopeOfWork: "Panel upgrade per agreed specification with post-work safety inspection.",
      requiredSteps: ["Site assessment", "Panel replacement", "Testing and sign-off"],
      responsibilities: {
        customer: ["Provide site access", "Confirm schedule availability"],
        provider: ["Perform licensed work", "Document completion evidence"],
      },
      acceptanceCriteria: ["All circuits tested", "Panel labeled correctly", "Work area cleaned"],
      cancellationNote: "Cancellation terms are displayed for review only — no automatic enforcement.",
      disputeNote: "Dispute resolution pathways are informational only in this runtime experience.",
      legalDisclaimer:
        "This contract view is for transparent review only. It does not constitute legal advice or automated legal decisions.",
    },
    timeline: {
      startTime: "Mon 10:00",
      expectedDurationMinutes: 120,
      milestones: [
        { id: "tm-1", label: "Arrive on site", scheduledAt: "Mon 10:00" },
        { id: "tm-2", label: "Panel assessment", scheduledAt: "Mon 10:30" },
        { id: "tm-3", label: "Upgrade work", scheduledAt: "Mon 11:00" },
        { id: "tm-4", label: "Final inspection", scheduledAt: "Mon 11:45" },
      ],
      checkpoints: [
        { id: "cp-1", label: "Customer availability confirmed" },
        { id: "cp-2", label: "Materials on hand" },
      ],
      completionEstimate: "Mon 12:00",
    },
    cost: {
      estimatedCostSar: 850,
      platformFeePlaceholder: "Platform fee shown for transparency — no payment processed here.",
      escrowPaymentPlaceholder: "Escrow/payment placeholder — no payment logic in this module.",
      costAssumptions: ["Standard panel size", "No additional circuits required"],
      changeFactors: ["Additional parts", "Extended labor beyond estimate", "Permit requirements"],
    },
    userConfirmed: false,
  };
}
