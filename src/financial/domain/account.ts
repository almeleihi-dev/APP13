export type AccountType =
  | "customer_wallet"
  | "provider_wallet"
  | "escrow_contract"
  | "platform_revenue"
  | "processor_clearing"
  | "refund_payable"
  | "suspense";

export type OwnerEntityType = "user" | "contract" | "escrow" | "platform";

export interface Account {
  id: string;
  accountCode: string;
  accountType: AccountType;
  ownerEntityType: OwnerEntityType | null;
  ownerEntityId: string | null;
  currencyCode: string;
  createdAt: Date;
}
