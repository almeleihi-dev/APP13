/** Canonical domain event vocabulary — Backend Architecture §4.3 */
export const DomainEvents = {
  ACTION_CREATED: "action.created",
  ACTION_READY_FOR_CONTRACT: "action.ready_for_contract",
  CONTRACT_GENERATED: "contract.generated",
  CONTRACT_PROPOSED: "contract.proposed",
  CONTRACT_MATERIALIZED: "contract.materialized",
  CONTRACT_ACTIVATED: "contract.activated",
  CONTRACT_COMPLETED: "contract.completed",
  CONTRACT_CANCELLED: "contract.cancelled",
  EXECUTION_MILESTONE_SUBMITTED: "execution.milestone.submitted",
  EXECUTION_EVIDENCE_RECORDED: "execution.evidence.recorded",
  EXECUTION_ATTESTATION_RATED: "execution.attestation.rated",
  VERIFICATION_APPROVED: "verification.approved",
  COMPLAINT_FILED: "complaint.filed",
  COMPLAINT_TRIAGED: "complaint.triaged",
  COMPLAINT_EVIDENCE_GATHERING: "complaint.evidence_gathering",
  COMPLAINT_CLOSED: "complaint.closed",
  TRUST_SCORE_RECOMPUTED: "trust.score.recomputed",
} as const;

export type DomainEventType = (typeof DomainEvents)[keyof typeof DomainEvents];

export type EngineSource =
  | "identity"
  | "action"
  | "contract"
  | "execution"
  | "complaint"
  | "trust"
  | "platform";

export interface DomainEventPayload {
  [key: string]: unknown;
}

export interface OutboxEventInput {
  eventType: DomainEventType | string;
  payload: DomainEventPayload;
  engineSource: EngineSource;
  idempotencyKey: string;
}

export interface DomainEventRecord extends OutboxEventInput {
  id: string;
  publishedAt: Date | null;
  createdAt: Date;
}
