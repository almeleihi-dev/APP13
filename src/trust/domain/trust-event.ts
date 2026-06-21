/** S3.3 Trust Engine — append-only lifecycle event vocabulary */
export const TrustEventTypes = {
  CONTRACT_COMPLETED: "contract_completed",
  MILESTONE_ACCEPTED: "milestone_accepted",
  ISSUE_RAISED: "issue_raised",
  ISSUE_RESOLVED: "issue_resolved",
  CUSTOMER_EVALUATION_SUBMITTED: "customer_evaluation_submitted",
  ESCROW_RELEASED: "escrow_released",
  ESCROW_REFUNDED: "escrow_refunded",
} as const;

export type TrustEventType = (typeof TrustEventTypes)[keyof typeof TrustEventTypes];

export const TRUST_EVENT_TYPES: ReadonlySet<TrustEventType> = new Set(
  Object.values(TrustEventTypes)
);

export interface TrustEventPayload {
  [key: string]: unknown;
}

export interface TrustEvent {
  id: string;
  providerId: string;
  eventType: TrustEventType;
  sourceEntityType: string;
  sourceEntityId: string;
  contractId: string | null;
  payload: TrustEventPayload;
  idempotencyKey: string;
  occurredAt: Date;
  createdAt: Date;
}

export interface RecordTrustEventInput {
  providerId: string;
  eventType: TrustEventType;
  sourceEntityType: string;
  sourceEntityId: string;
  contractId?: string | null;
  payload?: TrustEventPayload;
  idempotencyKey: string;
}

export interface ProviderTrustScore {
  providerId: string;
  score: number;
  executionScore: number;
  verificationComponent: number;
  executionComponent: number;
  timeComponent: number;
  complaintsComponent: number;
  evaluationComponent: number;
  contractCount: number;
  completedContractCount: number;
  complaintUpheldCount: number;
  confidenceBand: "low" | "medium" | "high";
  recordState: "uninitialized" | "provisional" | "active" | "dispute_hold" | "frozen" | "archived";
  computedAt: Date;
}

export function assertTrustEventType(value: string): asserts value is TrustEventType {
  if (!TRUST_EVENT_TYPES.has(value as TrustEventType)) {
    throw new Error(`invalid trust event type: ${value}`);
  }
}

export function resolveConfidenceBand(contractCount: number): ProviderTrustScore["confidenceBand"] {
  if (contractCount >= 10) return "high";
  if (contractCount >= 3) return "medium";
  return "low";
}
