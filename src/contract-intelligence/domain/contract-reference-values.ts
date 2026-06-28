import type { ContractType, EscrowMode, PaymentStructure } from "./contract-intelligence-schema.js";

export interface CategoryContractProfile {
  category: string;
  contractType: ContractType;
  paymentStructure: PaymentStructure;
  escrowMode: EscrowMode;
  escrowHoldPercentage: number;
  warrantyDays: number;
  cancellationNoticeHours: number;
  governingLaw: string;
}

export const CATEGORY_CONTRACT_PROFILES: CategoryContractProfile[] = [
  {
    category: "moving",
    contractType: "service_agreement_fixed_price",
    paymentStructure: "deposit_balance",
    escrowMode: "partial_hold",
    escrowHoldPercentage: 30,
    warrantyDays: 7,
    cancellationNoticeHours: 24,
    governingLaw: "Kingdom of Saudi Arabia — consumer service regulations",
  },
  {
    category: "cleaning",
    contractType: "service_agreement_fixed_price",
    paymentStructure: "single_release",
    escrowMode: "full_hold",
    escrowHoldPercentage: 100,
    warrantyDays: 3,
    cancellationNoticeHours: 12,
    governingLaw: "Kingdom of Saudi Arabia — consumer service regulations",
  },
  {
    category: "delivery",
    contractType: "delivery_mission_agreement",
    paymentStructure: "single_release",
    escrowMode: "full_hold",
    escrowHoldPercentage: 100,
    warrantyDays: 0,
    cancellationNoticeHours: 6,
    governingLaw: "Kingdom of Saudi Arabia — logistics and courier standards",
  },
  {
    category: "maintenance",
    contractType: "maintenance_service_agreement",
    paymentStructure: "milestone_release",
    escrowMode: "milestone_release",
    escrowHoldPercentage: 50,
    warrantyDays: 30,
    cancellationNoticeHours: 24,
    governingLaw: "Kingdom of Saudi Arabia — trade and maintenance standards",
  },
  {
    category: "professional_service_request",
    contractType: "scope_definition_agreement",
    paymentStructure: "deferred_matching",
    escrowMode: "none",
    escrowHoldPercentage: 0,
    warrantyDays: 0,
    cancellationNoticeHours: 48,
    governingLaw: "Kingdom of Saudi Arabia — professional services framework",
  },
];

export function getCategoryContractProfile(category: string): CategoryContractProfile {
  return (
    CATEGORY_CONTRACT_PROFILES.find((entry) => entry.category === category) ??
    CATEGORY_CONTRACT_PROFILES[0]!
  );
}

export const STANDARD_CONTRACT_SECTIONS = [
  { sectionId: "sec.parties", title: "Parties & Roles", order: 1 },
  { sectionId: "sec.scope", title: "Scope & Deliverables", order: 2 },
  { sectionId: "sec.milestones", title: "Milestones & Timeline", order: 3 },
  { sectionId: "sec.payment", title: "Payment & Escrow", order: 4 },
  { sectionId: "sec.evidence", title: "Evidence & Acceptance", order: 5 },
  { sectionId: "sec.risk", title: "Risk & Liability", order: 6 },
  { sectionId: "sec.cancellation", title: "Cancellation & Refunds", order: 7 },
  { sectionId: "sec.warranty", title: "Warranty & Remedies", order: 8 },
] as const;
