import type { ActionBlueprintForm } from "../../components/action-creator/types.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import type { ActionServiceRequest, PublishedProfessionalAction } from "./types.js";
import {
  CONTRACT_PROGRESS_LABELS,
  type ActionContract,
  type ActionContractDetails,
  type ContractEvidence,
  type ContractParty,
} from "./types.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
  readLivingPlatformState,
} from "./living-platform-storage.js";
import { recordContractEconomySignal } from "./economy/contract-economy-ledger.js";

function partyFromIdentity(identity: ActivePersonalIdentity): ContractParty {
  return {
    passportKey: identity.fullName.trim().toLowerCase(),
    fullName: identity.fullName,
    professionalTitle: identity.professionalTitle,
    photoUrl: identity.photoUrl,
    liveFrameTier: identity.liveFrameTier,
    location: identity.location,
  };
}

function partyFromCreator(creator: PublishedProfessionalAction["creator"]): ContractParty {
  return {
    passportKey: creator.passportKey,
    fullName: creator.fullName,
    professionalTitle: creator.professionalTitle,
    photoUrl: creator.photoUrl,
    liveFrameTier: creator.liveFrameTier,
    location: creator.location,
  };
}

function detailsFromBlueprint(blueprint: ActionBlueprintForm): ActionContractDetails {
  return {
    name: blueprint.name.trim(),
    purpose: blueprint.purpose.trim(),
    deliverables: blueprint.deliverables.trim(),
    successCriteria: blueprint.successCriteria.trim(),
    estimatedDuration: blueprint.estimatedDuration.trim(),
    evidenceRequirements: blueprint.evidence.trim(),
  };
}

function fallbackDetails(serviceName: string, providerName: string): ActionContractDetails {
  return {
    name: serviceName,
    purpose: `Professional action engagement with ${providerName}.`,
    deliverables: "Service delivery per marketplace listing.",
    successCriteria: "Verified completion with Live Frame monitoring.",
    estimatedDuration: "As agreed",
    evidenceRequirements: "Live Frame documentation and delivery confirmation.",
  };
}

export function createActionContract(input: {
  request: ActionServiceRequest;
  requester: ActivePersonalIdentity;
  published: PublishedProfessionalAction | null;
  fallbackServiceName: string;
  fallbackProviderName: string;
}): ActionContract {
  const owner: ContractParty = input.published
    ? partyFromCreator(input.published.creator)
    : {
        passportKey: input.fallbackProviderName.trim().toLowerCase(),
        fullName: input.fallbackProviderName,
        liveFrameTier: "Gold",
        professionalTitle: "Verified Professional",
      };

  const actionDetails = input.published
    ? detailsFromBlueprint(input.published.blueprint)
    : fallbackDetails(input.fallbackServiceName, input.fallbackProviderName);

  const contract: ActionContract = {
    contractId: createLivingId("ctr"),
    requestId: input.request.id,
    trackingId: input.request.trackingId,
    publishedActionId: input.request.publishedActionId,
    opportunityId: input.request.opportunityId,
    actionOwner: owner,
    requester: partyFromIdentity(input.requester),
    actionDetails,
    agreementState: "pending_acceptance",
    executionState: "awaiting_acceptance",
    progressStep: 0,
    evidence: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  patchLivingPlatformState((state) =>
    appendLivingActivity(
      { ...state, contracts: [contract, ...state.contracts] },
      {
        kind: "contract",
        title: "Action contract generated",
        detail: `${actionDetails.name} · ${contract.contractId}`,
      },
    ),
  );

  return contract;
}

export function getActionContract(contractId: string): ActionContract | null {
  return readLivingPlatformState().contracts.find((c) => c.contractId === contractId) ?? null;
}

export function getActionContractByTrackingId(trackingId: string): ActionContract | null {
  return readLivingPlatformState().contracts.find((c) => c.trackingId === trackingId) ?? null;
}

export function listContractsForIdentity(identity: ActivePersonalIdentity): ActionContract[] {
  const key = identity.fullName.trim().toLowerCase();
  return readLivingPlatformState().contracts.filter(
    (c) => c.actionOwner.passportKey === key || c.requester.passportKey === key,
  );
}

function updateContract(contractId: string, updater: (contract: ActionContract) => ActionContract): ActionContract | null {
  let updated: ActionContract | null = null;
  patchLivingPlatformState((state) => {
    const index = state.contracts.findIndex((c) => c.contractId === contractId);
    if (index < 0) return state;
    updated = updater(state.contracts[index]!);
    const contracts = [...state.contracts];
    contracts[index] = updated;
    return { ...state, contracts };
  });
  return updated;
}

export function acceptActionContract(contractId: string, identity: ActivePersonalIdentity): ActionContract | null {
  const contract = getActionContract(contractId);
  if (!contract || contract.agreementState !== "pending_acceptance") return contract;

  const key = identity.fullName.trim().toLowerCase();
  const isOwner = contract.actionOwner.passportKey === key;
  const isRequester = contract.requester.passportKey === key;
  if (!isOwner && !isRequester) return contract;

  const autoAcceptCatalog = !contract.publishedActionId && isRequester;

  if (!isOwner && !autoAcceptCatalog) return contract;

  return updateContract(contractId, (current) => ({
    ...current,
    agreementState: "accepted",
    executionState: "in_progress",
    progressStep: Math.max(current.progressStep, 1),
    acceptedAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

export function advanceContractExecution(contractId: string): ActionContract | null {
  const contract = getActionContract(contractId);
  if (!contract || contract.agreementState !== "accepted") return contract;

  const nextStep = Math.min(contract.progressStep + 1, CONTRACT_PROGRESS_LABELS.length - 2);
  let executionState = contract.executionState;
  if (nextStep >= 2) executionState = "in_progress";
  if (nextStep >= 3) executionState = "evidence_pending";

  return updateContract(contractId, (current) => ({
    ...current,
    progressStep: nextStep,
    executionState,
    updatedAt: nowIso(),
  }));
}

export function attachContractEvidence(
  contractId: string,
  label: string,
  description: string,
): ActionContract | null {
  const evidence: ContractEvidence = {
    id: createLivingId("evd"),
    label: label.trim() || "Delivery evidence",
    description: description.trim() || "Evidence attached for beta verification.",
    status: "attached",
    attachedAt: nowIso(),
  };

  patchLivingPlatformState((state) =>
    appendLivingActivity(state, {
      kind: "evidence",
      title: "Evidence attached",
      detail: `${label} · ${contractId}`,
    }),
  );

  return updateContract(contractId, (current) => ({
    ...current,
    evidence: [evidence, ...current.evidence],
    executionState: "evidence_pending",
    progressStep: Math.max(current.progressStep, 3),
    updatedAt: nowIso(),
  }));
}

export function confirmContractEvidence(
  contractId: string,
  evidenceId: string,
  role: "owner" | "requester",
): ActionContract | null {
  return updateContract(contractId, (current) => ({
    ...current,
    evidence: current.evidence.map((item) =>
      item.id === evidenceId
        ? { ...item, status: "confirmed" as const, confirmedAt: nowIso(), confirmedBy: role }
        : item,
    ),
    executionState: "evidence_confirmed",
    progressStep: Math.max(current.progressStep, 4),
    updatedAt: nowIso(),
  }));
}

export function completeActionContract(contractId: string): ActionContract | null {
  const contract = getActionContract(contractId);
  if (!contract || contract.agreementState === "completed") return contract;
  if (contract.agreementState !== "accepted") return contract;

  const hasEvidence = contract.evidence.length > 0;
  const hasConfirmed = contract.evidence.some((e) => e.status === "confirmed");
  if (contract.publishedActionId && !hasEvidence) return contract;
  if (contract.publishedActionId && hasEvidence && !hasConfirmed) return contract;

  let completed: ActionContract | null = null;
  patchLivingPlatformState((state) => {
    const index = state.contracts.findIndex((c) => c.contractId === contractId);
    if (index < 0) return state;
    completed = {
      ...state.contracts[index]!,
      agreementState: "completed",
      executionState: "completed",
      progressStep: CONTRACT_PROGRESS_LABELS.length - 1,
      completedAt: nowIso(),
      updatedAt: nowIso(),
    };
    const contracts = [...state.contracts];
    contracts[index] = completed;
    return appendLivingActivity({ ...state, contracts }, {
      kind: "complete",
      title: "Contract completed",
      detail: `${completed.actionDetails.name} · trust recorded`,
    });
  });
  if (completed) {
    recordContractEconomySignal(completed);
  }
  return completed;
}

export function listPassportContractHistory(passportKey: string) {
  return readLivingPlatformState().passportHistory[passportKey] ?? [];
}
