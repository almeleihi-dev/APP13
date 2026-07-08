import { useCallback, useEffect, useState } from "react";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import {
  readLivingPlatformState,
} from "./professional-action-store.js";
import { LIVING_PLATFORM_UPDATED_EVENT, type LivingPlatformState } from "./types.js";

export function useLivingPlatformState(): LivingPlatformState {
  const [state, setState] = useState<LivingPlatformState>(() => readLivingPlatformState());

  const refresh = useCallback(() => {
    setState(readLivingPlatformState());
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(LIVING_PLATFORM_UPDATED_EVENT, onUpdate);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(LIVING_PLATFORM_UPDATED_EVENT, onUpdate);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return state;
}

export interface LivingHomeMetrics {
  myPublishedCount: number;
  activeRequestCount: number;
  completedRequestCount: number;
  draftCount: number;
}

export function deriveLivingHomeMetrics(
  state: LivingPlatformState,
  identity: ActivePersonalIdentity,
): LivingHomeMetrics {
  const key = identity.fullName.trim().toLowerCase();
  const myPublished = state.publishedActions.filter((action) => action.creator.passportKey === key);
  const myRequests = state.requests.filter(
    (request) => request.requesterPassportKey === key || request.creatorPassportKey === key,
  );

  return {
    myPublishedCount: myPublished.length,
    activeRequestCount: myRequests.filter((request) => request.status !== "completed" && request.status !== "cancelled")
      .length,
    completedRequestCount: myRequests.filter((request) => request.status === "completed").length,
    draftCount: state.drafts.length,
  };
}
