export type ContractStatus =
  | "draft"
  | "proposed"
  | "accepted"
  | "active"
  | "completed"
  | "issue_raised"
  | "disputed"
  | "resolved"
  | "closed"
  | "void"
  | "cancelled";

export type PartyRole = "customer" | "provider";

export interface Contract {
  id: string;
  actionId: string;
  customerId: string | null;
  providerId: string | null;
  contractNumber: string;
  templateId: string;
  templateVersion: string;
  jurisdictionPack: string;
  status: ContractStatus;
  tekrrSnapshot: Record<string, unknown>;
  commercialTerms: Record<string, unknown>;
  verificationSnapshot: Record<string, unknown> | null;
  documentHash: string | null;
  pdfStorageKey: string | null;
  customerAcceptedAt: Date | null;
  providerAcceptedAt: Date | null;
  activatedAt: Date | null;
  completedAt: Date | null;
  complaintWindowEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractParty {
  id: string;
  contractId: string;
  userId: string;
  partyRole: PartyRole;
  acceptanceRequired: boolean;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  verificationTierAtAccept: string | null;
}

/** Allowed contract transitions — State Machine v1 / Contract Engine §6 */
export const CONTRACT_TRANSITIONS: Record<
  ContractStatus,
  Partial<Record<string, ContractStatus>>
> = {
  draft: { propose: "proposed", cancel: "cancelled" },
  proposed: { accept: "proposed", decline: "draft", cancel: "cancelled" },
  accepted: { activate: "active", cancel: "cancelled" },
  active: { complete: "completed", issue_raise: "issue_raised" },
  issue_raised: { dispute: "disputed", withdraw: "active" },
  disputed: { resolve: "resolved" },
  resolved: { close: "closed", complete: "completed" },
  completed: { close: "closed" },
  closed: {},
  void: {},
  cancelled: {},
};

export function allPartiesAccepted(parties: ContractParty[]): boolean {
  const required = parties.filter((p) => p.acceptanceRequired);
  return required.length > 0 && required.every((p) => p.acceptedAt !== null);
}
