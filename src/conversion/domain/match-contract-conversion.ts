import type { ContractDraftView } from "../../contracts-experience/domain/contract-initiation.js";
import type { ContractCreationResult } from "../../contracts-experience/domain/contract-creation-bridge.js";
import type { MatchableProviderRecord } from "../../request-experience/infrastructure/request-repository.js";
import type { MarketplaceProviderRecord } from "../../marketplace/application/marketplace-service.js";
import type { CustomerRequest } from "../../request-experience/domain/request.js";

export type ConversionStatus =
  | "offer_created"
  | "draft_previewed"
  | "accepted"
  | "contract_created"
  | "cancelled";

export interface ProposedCommercialTerms {
  estimatedValue?: number;
  estimatedDuration?: string;
  title?: string;
  description?: string;
}

export interface ContractOffer {
  id: string;
  customerRequestId: string;
  customerUserId: string;
  customerId: string;
  providerId: string;
  providerUserId: string;
  selectedActionId: string;
  selectedActionCode: string;
  commercialTerms: ProposedCommercialTerms;
  status: ConversionStatus;
  contractId: string | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractDraftPreview {
  draftId: string;
  providerId: string;
  providerDisplayName: string;
  actionCode: string;
  actionName: string;
  proposedTitle: string;
  proposedDescription: string;
  estimatedValue: number;
  estimatedDuration: string;
  trustScore: number;
  trustTier: string;
  liveFrameLabel: string;
  generatedAt: Date;
}

export interface ConversionSummary {
  offerId: string;
  customerRequestId: string;
  providerId: string;
  providerUserId: string;
  selectedActionId: string;
  selectedActionCode: string;
  status: ConversionStatus;
  contractId: string | null;
  summary: string;
  generatedAt: Date;
}

export interface MatchContractConversion {
  offer: ContractOffer;
  draftPreview: ContractDraftPreview | null;
  summary: ConversionSummary;
}

export interface ContractOfferView {
  id: string;
  customer_request_id: string;
  customer_user_id: string;
  customer_id: string;
  provider_id: string;
  provider_user_id: string;
  selected_action_id: string;
  selected_action_code: string;
  commercial_terms: ProposedCommercialTerms;
  status: ConversionStatus;
  contract_id: string | null;
  summary: ConversionSummaryView;
  created_at: string;
  updated_at: string;
}

export interface ConversionSummaryView {
  offer_id: string;
  customer_request_id: string;
  provider_id: string;
  provider_user_id: string;
  selected_action_id: string;
  selected_action_code: string;
  status: ConversionStatus;
  contract_id: string | null;
  summary: string;
  generated_at: string;
}

export interface ContractDraftPreviewView {
  offer_id: string;
  draft: ContractDraftPreview;
  status: ConversionStatus;
  generated_at: string;
}

export interface AcceptConversionResultView {
  offer_id: string;
  status: ConversionStatus;
  contract: {
    contract_id: string;
    contract_number: string;
    status: string;
    action_id: string;
    created: boolean;
  };
  summary: ConversionSummaryView;
}

const TERMINAL_STATUSES: ReadonlySet<ConversionStatus> = new Set([
  "contract_created",
  "cancelled",
]);

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function normalizeProposedCommercialTerms(
  terms: ProposedCommercialTerms & {
    estimated_value?: number;
    estimated_duration?: string;
  } = {}
): ProposedCommercialTerms {
  return {
    estimatedValue: terms.estimatedValue ?? terms.estimated_value,
    estimatedDuration: terms.estimatedDuration ?? terms.estimated_duration,
    title: terms.title,
    description: terms.description,
  };
}

export function normalizeContractDraftPreview(
  preview: ContractDraftPreview & { generatedAt: Date | string }
): ContractDraftPreview {
  return {
    ...preview,
    generatedAt: toDate(preview.generatedAt),
  };
}

export function isTerminalConversionStatus(status: ConversionStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function canPreviewDraft(status: ConversionStatus): boolean {
  return status === "offer_created" || status === "draft_previewed";
}

export function canAcceptOffer(status: ConversionStatus): boolean {
  return status === "offer_created" || status === "draft_previewed";
}

export function canCancelOffer(status: ConversionStatus): boolean {
  return status === "offer_created" || status === "draft_previewed";
}

export function toMarketplaceProviderRecord(
  provider: MatchableProviderRecord,
  commercialTerms: ProposedCommercialTerms,
  request: CustomerRequest
): MarketplaceProviderRecord {
  return {
    providerId: provider.providerId,
    displayName: provider.displayName,
    actionCodes: [...provider.actionCodes],
    trustScore: provider.trustScore,
    availableNow: provider.availableNow,
    distanceKm: provider.distanceKm,
    priceEstimate:
      commercialTerms.estimatedValue ?? request.budget ?? provider.priceEstimate,
    completedContractsForAction: provider.completedContractsForAction,
    completedContracts: provider.completedContracts,
    averageRating: provider.averageRating,
  };
}

export function buildContractDraftPreview(draft: ContractDraftView): ContractDraftPreview {
  return {
    draftId: draft.draftId,
    providerId: draft.providerSummary.providerId,
    providerDisplayName: draft.providerSummary.displayName,
    actionCode: draft.actionSummary.actionCode,
    actionName: draft.actionSummary.actionName,
    proposedTitle: draft.proposedTitle,
    proposedDescription: draft.proposedDescription,
    estimatedValue: draft.commercialTerms.estimatedValue,
    estimatedDuration: draft.commercialTerms.estimatedDuration,
    trustScore: draft.trustSummary.trustScore,
    trustTier: draft.trustSummary.tier,
    liveFrameLabel: draft.liveFrameSummary.label,
    generatedAt: draft.generatedAt,
  };
}

export function buildConversionSummary(
  offer: ContractOffer,
  generatedAt?: Date
): ConversionSummary {
  let summary = `Contract offer ${offer.id} is ${offer.status.replaceAll("_", " ")}.`;

  if (offer.status === "contract_created" && offer.contractId) {
    summary = `Contract offer converted to contract ${offer.contractId}.`;
  } else if (offer.status === "cancelled") {
    summary = "Contract offer was cancelled before contract creation.";
  } else if (offer.status === "draft_previewed") {
    summary = "Contract draft preview is ready for customer review.";
  } else if (offer.status === "accepted") {
    summary = "Contract offer accepted; creating contract.";
  }

  return {
    offerId: offer.id,
    customerRequestId: offer.customerRequestId,
    providerId: offer.providerId,
    providerUserId: offer.providerUserId,
    selectedActionId: offer.selectedActionId,
    selectedActionCode: offer.selectedActionCode,
    status: offer.status,
    contractId: offer.contractId,
    summary,
    generatedAt: generatedAt ?? new Date(),
  };
}

export function buildMatchContractConversion(input: {
  offer: ContractOffer;
  draftPreview?: ContractDraftPreview | null;
  generatedAt?: Date;
}): MatchContractConversion {
  return {
    offer: input.offer,
    draftPreview: input.draftPreview ?? null,
    summary: buildConversionSummary(input.offer, input.generatedAt),
  };
}

export function toConversionSummaryView(summary: ConversionSummary): ConversionSummaryView {
  return {
    offer_id: summary.offerId,
    customer_request_id: summary.customerRequestId,
    provider_id: summary.providerId,
    provider_user_id: summary.providerUserId,
    selected_action_id: summary.selectedActionId,
    selected_action_code: summary.selectedActionCode,
    status: summary.status,
    contract_id: summary.contractId,
    summary: summary.summary,
    generated_at: toIsoString(summary.generatedAt),
  };
}

export function toContractOfferView(conversion: MatchContractConversion): ContractOfferView {
  return {
    id: conversion.offer.id,
    customer_request_id: conversion.offer.customerRequestId,
    customer_user_id: conversion.offer.customerUserId,
    customer_id: conversion.offer.customerId,
    provider_id: conversion.offer.providerId,
    provider_user_id: conversion.offer.providerUserId,
    selected_action_id: conversion.offer.selectedActionId,
    selected_action_code: conversion.offer.selectedActionCode,
    commercial_terms: conversion.offer.commercialTerms,
    status: conversion.offer.status,
    contract_id: conversion.offer.contractId,
    summary: toConversionSummaryView(conversion.summary),
    created_at: toIsoString(conversion.offer.createdAt),
    updated_at: toIsoString(conversion.offer.updatedAt),
  };
}

export function toContractDraftPreviewView(
  offer: ContractOffer,
  draft: ContractDraftPreview
): ContractDraftPreviewView {
  const normalizedDraft = normalizeContractDraftPreview(draft);
  return {
    offer_id: offer.id,
    draft: normalizedDraft,
    status: offer.status,
    generated_at: toIsoString(normalizedDraft.generatedAt),
  };
}

export function toAcceptConversionResultView(input: {
  offer: ContractOffer;
  result: ContractCreationResult;
  summary: ConversionSummary;
}): AcceptConversionResultView {
  return {
    offer_id: input.offer.id,
    status: input.offer.status,
    contract: {
      contract_id: input.result.contractId,
      contract_number: input.result.contractNumber,
      status: input.result.status,
      action_id: input.result.actionId,
      created: input.result.created,
    },
    summary: toConversionSummaryView(input.summary),
  };
}
