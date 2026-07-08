import type { ActionBlueprintForm } from "../../components/action-creator/types.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import {
  readPersonalPassport,
  savePersonalPassport,
  type PersonalProfessionalPassport,
} from "../../passport/personal-passport-persistence.js";
import { notifyPersonalIdentityUpdated, toActivePersonalIdentity } from "../../passport/personal-identity.js";
import { syncActionInventoryForIdentity } from "./intelligence/action-inventory-store.js";
import type { OpportunitySnapshot } from "../../components/need-mvp/types.js";
import {
  completeActionContract,
  createActionContract,
  getActionContractByTrackingId,
} from "./action-contract-store.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
  readLivingPlatformState,
} from "./living-platform-storage.js";
import {
  REQUEST_PROGRESS_LABELS,
  type ActionCreatorIdentity,
  type ActionServiceRequest,
  type MarketplaceLocationFilters,
  type PassportContractHistoryEntry,
  type PublishedProfessionalAction,
} from "./types.js";
import {
  filterPublishedActionsByLocation,
  type MarketplaceSearchOptions,
} from "./intelligence/marketplace-location-filters.js";
import { readActivePersonalIdentity } from "../../passport/personal-identity.js";

export { notifyLivingPlatformUpdated, readLivingPlatformState } from "./living-platform-storage.js";

export function identityToCreator(identity: ActivePersonalIdentity): ActionCreatorIdentity {
  return {
    passportKey: identity.fullName.trim().toLowerCase(),
    fullName: identity.fullName,
    professionalTitle: identity.professionalTitle,
    photoUrl: identity.photoUrl,
    liveFrameTier: identity.liveFrameTier,
    classification: identity.classification,
    trustIndicators: identity.trustIndicators,
    certifications: identity.certifications,
    mainSkill: identity.mainSkill,
    location: identity.location,
  };
}

export function saveActionDraft(
  blueprint: ActionBlueprintForm,
  qualityScore: number,
  identity: ActivePersonalIdentity | null,
): string {
  const state = readLivingPlatformState();
  const passportKey = identity?.fullName.trim().toLowerCase() ?? "anonymous";
  const existing = state.drafts.find(
    (draft) => draft.blueprint.name.trim() === blueprint.name.trim() && passportKey !== "anonymous",
  );
  const draftId = existing?.id ?? createLivingId("draft");
  const nextDraft = {
    id: draftId,
    blueprint,
    qualityScore,
    savedAt: nowIso(),
  };
  const drafts = [nextDraft, ...state.drafts.filter((draft) => draft.id !== draftId)].slice(0, 12);
  patchLivingPlatformState((s) => ({ ...s, drafts }));
  return draftId;
}

export function publishProfessionalAction(
  blueprint: ActionBlueprintForm,
  qualityScore: number,
  identity: ActivePersonalIdentity,
): PublishedProfessionalAction {
  const published: PublishedProfessionalAction = {
    id: createLivingId("pub"),
    status: "published",
    blueprint,
    qualityScore,
    creator: identityToCreator(identity),
    publishedAt: nowIso(),
    updatedAt: nowIso(),
  };

  patchLivingPlatformState((state) => {
    const drafts = state.drafts.filter((draft) => draft.blueprint.name.trim() !== blueprint.name.trim());
    return appendLivingActivity(
      { ...state, publishedActions: [published, ...state.publishedActions], drafts },
      {
        kind: "publish",
        title: "Action published",
        detail: `${blueprint.name.trim()} is now discoverable in the Action Marketplace.`,
      },
    );
  });
  return published;
}

export function listPublishedActions(): PublishedProfessionalAction[] {
  return readLivingPlatformState().publishedActions;
}

export function getPublishedAction(id: string): PublishedProfessionalAction | null {
  return readLivingPlatformState().publishedActions.find((action) => action.id === id) ?? null;
}

export function publishedActionToOpportunitySnapshot(action: PublishedProfessionalAction): OpportunitySnapshot {
  const { creator, blueprint } = action;
  return {
    opportunityId: action.id,
    title: `${creator.fullName} — ${blueprint.name.trim()}`,
    providerName: creator.fullName,
    serviceName: blueprint.name.trim(),
    liveFrameTier: creator.liveFrameTier,
    rating: 4.9,
    availability: blueprint.estimatedDuration.trim() || "Available",
    estimatedMinutes: 120,
    badges: ["Published action", `${creator.liveFrameTier} Live Frame`, ...creator.certifications.slice(0, 2)],
  };
}

export function searchPublishedActions(
  keyword: string,
  filters?: MarketplaceLocationFilters,
): PublishedProfessionalAction[] {
  const identity = readActivePersonalIdentity();
  const options: MarketplaceSearchOptions = {
    keyword,
    filters,
    viewerLocation: identity
      ? { country: identity.geoProfile.country, city: identity.geoProfile.city }
      : undefined,
  };
  return filterPublishedActionsByLocation(listPublishedActions(), options);
}

export function createTrackingId(): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ACT-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export function createServiceRequest(input: {
  opportunityId: string;
  publishedActionId: string | null;
  serviceName: string;
  providerName: string;
  requester: ActivePersonalIdentity;
  creatorPassportKey: string | null;
}): ActionServiceRequest {
  const request: ActionServiceRequest = {
    id: createLivingId("req"),
    trackingId: createTrackingId(),
    publishedActionId: input.publishedActionId,
    opportunityId: input.opportunityId,
    serviceName: input.serviceName,
    providerName: input.providerName,
    requesterName: input.requester.fullName,
    requesterPassportKey: input.requester.fullName.trim().toLowerCase(),
    creatorPassportKey: input.creatorPassportKey,
    status: "requested",
    progressStep: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  patchLivingPlatformState((state) =>
    appendLivingActivity(
      { ...state, requests: [request, ...state.requests] },
      {
        kind: "request",
        title: "Action requested",
        detail: `${input.serviceName} with ${input.providerName}.`,
      },
    ),
  );

  const published = input.publishedActionId ? getPublishedAction(input.publishedActionId) : null;
  createActionContract({
    request,
    requester: input.requester,
    published,
    fallbackServiceName: input.serviceName,
    fallbackProviderName: input.providerName,
  });

  return request;
}

export function getServiceRequest(id: string): ActionServiceRequest | null {
  return readLivingPlatformState().requests.find((request) => request.id === id) ?? null;
}

export function getServiceRequestByTrackingId(trackingId: string): ActionServiceRequest | null {
  return readLivingPlatformState().requests.find((request) => request.trackingId === trackingId) ?? null;
}

export function advanceServiceRequest(trackingId: string): ActionServiceRequest | null {
  let updated: ActionServiceRequest | null = null;
  patchLivingPlatformState((state) => {
    const index = state.requests.findIndex((request) => request.trackingId === trackingId);
    if (index < 0) return state;

    const current = state.requests[index]!;
    if (current.status === "completed" || current.status === "cancelled") {
      updated = current;
      return state;
    }

    const nextStep = Math.min(current.progressStep + 1, REQUEST_PROGRESS_LABELS.length - 1);
    const nextStatus: ActionServiceRequest["status"] =
      nextStep >= REQUEST_PROGRESS_LABELS.length - 1 ? "in_progress" : nextStep >= 2 ? "accepted" : "requested";

    updated = {
      ...current,
      progressStep: nextStep,
      status: nextStatus,
      updatedAt: nowIso(),
    };

    const requests = [...state.requests];
    requests[index] = updated;
    return appendLivingActivity({ ...state, requests }, {
      kind: "progress",
      title: REQUEST_PROGRESS_LABELS[nextStep] ?? "Progress updated",
      detail: `${current.serviceName} · ${current.trackingId}`,
    });
  });
  return updated;
}

function recordPassportCompletionGrowth(identityKey: string, contractEntry?: PassportContractHistoryEntry): void {
  const passport = readPersonalPassport();
  if (!passport || passport.fullName.trim().toLowerCase() !== identityKey) return;

  const completedActions = passport.completedActions + 1;
  const trustIndicators = [...passport.trustIndicators];
  if (!trustIndicators.includes("Verified action completed")) {
    trustIndicators.push("Verified action completed");
  }
  if (contractEntry && !trustIndicators.includes("Contract-backed delivery")) {
    trustIndicators.push("Contract-backed delivery");
  }

  savePersonalPassport({
    ...passport,
    completedActions,
    trustIndicators,
    rating: completedActions >= 3 ? "4.8" : completedActions >= 1 ? "4.5" : passport.rating,
  });
  notifyPersonalIdentityUpdated();
  syncActionInventoryForIdentity(toActivePersonalIdentity({
    ...passport,
    completedActions,
    trustIndicators,
    rating: completedActions >= 3 ? "4.8" : completedActions >= 1 ? "4.5" : passport.rating,
  }));
}

export function completeServiceRequest(trackingId: string): ActionServiceRequest | null {
  const contract = getActionContractByTrackingId(trackingId);
  if (contract) {
    completeActionContract(contract.contractId);
  }

  let updated: ActionServiceRequest | null = null;
  patchLivingPlatformState((state) => {
    const index = state.requests.findIndex((request) => request.trackingId === trackingId);
    if (index < 0) return state;

    const current = state.requests[index]!;
    updated = {
      ...current,
      status: "completed",
      progressStep: REQUEST_PROGRESS_LABELS.length - 1,
      updatedAt: nowIso(),
      completedAt: nowIso(),
    };

    const requests = [...state.requests];
    requests[index] = updated;

    const completedContract = getActionContractByTrackingId(trackingId);
    let passportHistory = state.passportHistory;

    if (completedContract?.agreementState === "completed") {
      const requesterEntry: PassportContractHistoryEntry = {
        contractId: completedContract.contractId,
        actionName: completedContract.actionDetails.name,
        role: "requester",
        partnerName: completedContract.actionOwner.fullName,
        completedAt: completedContract.completedAt ?? nowIso(),
      };
      const ownerEntry: PassportContractHistoryEntry = {
        contractId: completedContract.contractId,
        actionName: completedContract.actionDetails.name,
        role: "owner",
        partnerName: completedContract.requester.fullName,
        completedAt: completedContract.completedAt ?? nowIso(),
      };
      passportHistory = {
        ...passportHistory,
        [completedContract.requester.passportKey]: [
          requesterEntry,
          ...(passportHistory[completedContract.requester.passportKey] ?? []),
        ].slice(0, 24),
      };
      if (completedContract.actionOwner.passportKey !== completedContract.requester.passportKey) {
        passportHistory = {
          ...passportHistory,
          [completedContract.actionOwner.passportKey]: [
            ownerEntry,
            ...(passportHistory[completedContract.actionOwner.passportKey] ?? []),
          ].slice(0, 24),
        };
      }
      recordPassportCompletionGrowth(completedContract.requester.passportKey, requesterEntry);
      if (completedContract.actionOwner.passportKey !== completedContract.requester.passportKey) {
        recordPassportCompletionGrowth(completedContract.actionOwner.passportKey, ownerEntry);
      }
    } else {
      recordPassportCompletionGrowth(current.requesterPassportKey);
      if (current.creatorPassportKey && current.creatorPassportKey !== current.requesterPassportKey) {
        recordPassportCompletionGrowth(current.creatorPassportKey);
      }
    }

    const withComplete = appendLivingActivity({ ...state, requests, passportHistory }, {
      kind: "complete",
      title: "Action completed",
      detail: `${current.serviceName} · trust indicators updated.`,
    });
    return appendLivingActivity(withComplete, {
      kind: "trust",
      title: "Trust growth recorded",
      detail: "Passport history reflects contracted professional work.",
    });
  });
  return updated;
}

export function listRequestsForIdentity(identity: ActivePersonalIdentity): ActionServiceRequest[] {
  const key = identity.fullName.trim().toLowerCase();
  return readLivingPlatformState().requests.filter(
    (request) => request.requesterPassportKey === key || request.creatorPassportKey === key,
  );
}

export function listPublishedActionsForCreator(identity: ActivePersonalIdentity): PublishedProfessionalAction[] {
  const key = identity.fullName.trim().toLowerCase();
  return readLivingPlatformState().publishedActions.filter((action) => action.creator.passportKey === key);
}

export function formatRelativeTime(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(deltaMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}
