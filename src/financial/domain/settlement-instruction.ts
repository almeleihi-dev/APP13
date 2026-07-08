export type SettlementStatus = "pending" | "submitted" | "paid" | "failed";

export interface SettlementInstruction {
  id: string;
  escrowId: string;
  journalId: string;
  beneficiaryUserId: string;
  amountMinor: number;
  currencyCode: string;
  processorTransferRef: string | null;
  status: SettlementStatus;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}
