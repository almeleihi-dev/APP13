export type PaymentIntentStatus =
  | "requires_payment_method"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface PaymentIntent {
  id: string;
  escrowId: string;
  customerUserId: string;
  processor: string;
  processorRef: string | null;
  status: PaymentIntentStatus;
  amountMinor: number;
  currencyCode: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
