export type EvidenceType =
  | "EV-TS"
  | "EV-PHOTO"
  | "EV-DOC"
  | "EV-CHECK"
  | "EV-TEST"
  | "EV-SIGN"
  | "EV-CRED"
  | "EV-NOTE";

export type UploadIntentStatus = "pending" | "confirmed" | "expired";

export interface EvidenceUploadIntent {
  id: string;
  contractId: string;
  milestoneId: string;
  userId: string;
  storageKey: string;
  contentHash: string;
  evidenceType: EvidenceType;
  filename: string | null;
  contentType: string | null;
  idempotencyKey: string;
  status: UploadIntentStatus;
  expiresAt: Date;
  confirmedAt: Date | null;
  createdAt: Date;
}

export interface EvidenceRecord {
  id: string;
  contractId: string;
  milestoneId: string;
  submittedByUserId: string;
  evidenceType: EvidenceType;
  storageKey: string | null;
  contentHash: string | null;
  metadata: Record<string, unknown>;
  submittedAt: Date;
  createdAt: Date;
}

export function buildEvidenceStorageKey(
  contractId: string,
  milestoneId: string,
  objectId: string
): string {
  return `contracts/${contractId}/milestones/${milestoneId}/${objectId}`;
}

export function normalizeSha256Hash(value: string): string {
  return value.startsWith("sha256:") ? value : `sha256:${value}`;
}
