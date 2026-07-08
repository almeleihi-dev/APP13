import type { EscrowStatus } from "../../financial/domain/escrow.js";
import type { Contract } from "../../contract/domain/contract.js";
import type { EscrowAgreement } from "../../financial/domain/escrow.js";
import { formatMinorAmount } from "../../experience/format.js";

export type EscrowInitiationStatus = EscrowStatus | "awaiting_escrow";

export interface FundingInstructions {
  amount: string;
  amountMinor: number;
  currency: string;
  referenceNumber: string;
  paymentExplanation: string;
  customerGuidance: string;
}

export interface EscrowSummary {
  contractValueMinor: number;
  contractValue: string;
  escrowAmountMinor: number;
  escrowAmount: string;
  platformFeeMinor: number;
  platformFee: string;
  fundingAmountMinor: number;
  fundingAmount: string;
  currencyCode: string;
  protectedAmountExplanation: string;
  platformFeeExplanation: string;
}

export interface EscrowInitiationView {
  contractId: string;
  contractNumber: string;
  contractValue: string;
  escrowAmount: string;
  platformFee: string;
  fundingAmount: string;
  fundingInstructions: FundingInstructions;
  status: EscrowInitiationStatus;
  generatedAt: Date;
}

export const DEFAULT_EXPERIENCE_CURRENCY = "SAR";
export const EXPERIENCE_PLATFORM_FEE_RATE = 0.05;

const ELIGIBLE_CONTRACT_STATUSES = new Set<Contract["status"]>(["active", "accepted"]);

export function isEligibleContractForEscrowInitiation(contract: Contract): boolean {
  return ELIGIBLE_CONTRACT_STATUSES.has(contract.status);
}

export function majorUnitsToMinor(value: number): number {
  return Math.round(value * 100);
}

export function readCurrencyCode(commercialTerms: Record<string, unknown>): string {
  const currency = commercialTerms.currency_code;
  if (typeof currency === "string" && currency.length === 3) {
    return currency.toUpperCase();
  }
  return DEFAULT_EXPERIENCE_CURRENCY;
}

export function readContractValueMinor(commercialTerms: Record<string, unknown>): number {
  const estimatedMinor = commercialTerms.estimated_value_minor;
  if (typeof estimatedMinor === "number" && estimatedMinor > 0) {
    return estimatedMinor;
  }

  const estimatedValue = commercialTerms.estimated_value;
  if (typeof estimatedValue === "number" && estimatedValue > 0) {
    return majorUnitsToMinor(estimatedValue);
  }

  return 0;
}

export function projectPlatformFeeMinor(
  contractValueMinor: number,
  commercialTerms: Record<string, unknown>
): number {
  const storedMinor = commercialTerms.platform_fee_minor;
  if (typeof storedMinor === "number" && storedMinor >= 0) {
    return storedMinor;
  }

  const storedMajor = commercialTerms.platform_fee;
  if (typeof storedMajor === "number" && storedMajor >= 0) {
    return majorUnitsToMinor(storedMajor);
  }

  const rate = commercialTerms.platform_fee_rate;
  if (typeof rate === "number" && rate >= 0) {
    return Math.round(contractValueMinor * rate);
  }

  return Math.round(contractValueMinor * EXPERIENCE_PLATFORM_FEE_RATE);
}

export function buildFundingReferenceNumber(contractNumber: string): string {
  return `APP13-${contractNumber}`;
}

export function buildProtectedAmountExplanation(
  escrowAmount: string,
  contractNumber: string
): string {
  return `${escrowAmount} is protected in escrow for contract ${contractNumber} until milestones are accepted.`;
}

export function buildPlatformFeeExplanation(platformFee: string): string {
  return `${platformFee} is the transparent APP13 platform fee for contract facilitation and dispute support.`;
}

export function buildEscrowSummary(input: {
  contract: Contract;
  escrow: EscrowAgreement | null;
}): EscrowSummary | null {
  const currencyCode = input.escrow?.currencyCode ?? readCurrencyCode(input.contract.commercialTerms);

  const contractValueMinor = input.escrow
    ? input.escrow.grossAmountMinor
    : readContractValueMinor(input.contract.commercialTerms);
  if (contractValueMinor <= 0) {
    return null;
  }

  const platformFeeMinor = input.escrow
    ? input.escrow.platformFeeMinor
    : projectPlatformFeeMinor(contractValueMinor, input.contract.commercialTerms);
  const escrowAmountMinor = contractValueMinor;
  const fundingAmountMinor = contractValueMinor + platformFeeMinor;

  const contractValue = formatMinorAmount(contractValueMinor, currencyCode);
  const escrowAmount = formatMinorAmount(escrowAmountMinor, currencyCode);
  const platformFee = formatMinorAmount(platformFeeMinor, currencyCode);
  const fundingAmount = formatMinorAmount(fundingAmountMinor, currencyCode);

  return {
    contractValueMinor,
    contractValue,
    escrowAmountMinor,
    escrowAmount,
    platformFeeMinor,
    platformFee,
    fundingAmountMinor,
    fundingAmount,
    currencyCode,
    protectedAmountExplanation: buildProtectedAmountExplanation(
      escrowAmount,
      input.contract.contractNumber
    ),
    platformFeeExplanation: buildPlatformFeeExplanation(platformFee),
  };
}

export function buildFundingInstructions(input: {
  contractNumber: string;
  summary: EscrowSummary;
}): FundingInstructions {
  const referenceNumber = buildFundingReferenceNumber(input.contractNumber);

  return {
    amount: input.summary.fundingAmount,
    amountMinor: input.summary.fundingAmountMinor,
    currency: input.summary.currencyCode,
    referenceNumber,
    paymentExplanation:
      `You are funding ${input.summary.fundingAmount} to initiate escrow for contract ${input.contractNumber}. ` +
      `${input.summary.protectedAmountExplanation} ${input.summary.platformFeeExplanation}`,
    customerGuidance:
      `Use reference ${referenceNumber} when submitting payment. ` +
      "No funds move until you confirm funding through the APP13 payment flow.",
  };
}

export function buildEscrowInitiationView(input: {
  contract: Contract;
  escrow: EscrowAgreement | null;
  generatedAt?: Date;
}): EscrowInitiationView | null {
  if (!isEligibleContractForEscrowInitiation(input.contract)) {
    return null;
  }

  const summary = buildEscrowSummary(input);
  if (!summary) return null;

  return {
    contractId: input.contract.id,
    contractNumber: input.contract.contractNumber,
    contractValue: summary.contractValue,
    escrowAmount: summary.escrowAmount,
    platformFee: summary.platformFee,
    fundingAmount: summary.fundingAmount,
    fundingInstructions: buildFundingInstructions({
      contractNumber: input.contract.contractNumber,
      summary,
    }),
    status: input.escrow?.status ?? "awaiting_escrow",
    generatedAt: input.generatedAt ?? new Date(),
  };
}
