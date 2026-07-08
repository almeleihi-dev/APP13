import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import type { RelayIntent } from "@an-act/runtime-ui/react";
import {
  endPilotTiming,
  recordPilotMilestone,
  recordPilotSearchMetric,
  startPilotTiming,
} from "../../lib/pilot-instrumentation.js";
import {
  enrichOpportunityDetails,
  snapshotFromRelayBody,
} from "./opportunity-presentation.js";
import type { NeedMvpStage, OpportunitySnapshot } from "./types.js";
import {
  acceptActionContract,
  advanceContractExecution,
  attachContractEvidence,
  completeActionContract,
  confirmContractEvidence,
  getActionContractByTrackingId,
} from "../../lib/living-platform/action-contract-store.js";
import {
  advanceServiceRequest,
  completeServiceRequest,
  createServiceRequest,
  getPublishedAction,
  getServiceRequestByTrackingId,
} from "../../lib/living-platform/professional-action-store.js";
import type { ActionContract } from "../../lib/living-platform/types.js";
import type { ActionServiceRequest } from "../../lib/living-platform/types.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";

export interface UseNeedPresentationOptions {
  relay: (intent: RelayIntent) => Promise<void>;
  reloadNeedExperience: () => Promise<void>;
  identity: ActivePersonalIdentity | null;
}

export function useNeedPresentation({ relay, reloadNeedExperience, identity }: UseNeedPresentationOptions) {
  const [stage, setStage] = useState<NeedMvpStage>("browse");
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunitySnapshot | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<ActionServiceRequest | null>(null);
  const [activeContract, setActiveContract] = useState<ActionContract | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (stage === "detail") {
      recordPilotMilestone("opportunity", "started");
      startPilotTiming("opportunity_review");
    }
    if (stage === "confirm") {
      recordPilotMilestone("opportunity", "completed");
      endPilotTiming("opportunity_review");
      recordPilotMilestone("request", "started");
      startPilotTiming("request_completion");
    }
    if (stage === "success") {
      recordPilotMilestone("request", "completed");
      endPilotTiming("request_completion");
      recordPilotMilestone("success", "started");
      recordPilotMilestone("success", "completed");
      startPilotTiming("success_to_tracking");
    }
    if (stage === "tracking") {
      recordPilotMilestone("tracking", "started");
      endPilotTiming("success_to_tracking");
      recordPilotMilestone("tracking", "completed");
    }
  }, [stage]);

  const detail = useMemo(
    () => (selectedOpportunity ? enrichOpportunityDetails(selectedOpportunity) : null),
    [selectedOpportunity]
  );

  const resetMvpFlow = useCallback(() => {
    setStage("browse");
    setSelectedOpportunity(null);
    setTrackingId(null);
    setActiveRequest(null);
    setActiveContract(null);
    setSubmitting(false);
  }, []);

  const returnHome = useCallback(async () => {
    recordPilotMilestone("tracking", "abandoned");
    resetMvpFlow();
    setSearchKeyword("");
    await reloadNeedExperience();
  }, [reloadNeedExperience, resetMvpFlow]);

  const handleRelay = useCallback(
    async (intent: RelayIntent) => {
      if (intent.actionId === "need.view-opportunity") {
        const snapshot = snapshotFromRelayBody(intent.body);
        if (snapshot) {
          setSelectedOpportunity(snapshot);
          setStage("detail");
        }
        return;
      }

      if (intent.actionId === "need.search") {
        const keyword = String(intent.body?.keyword ?? "");
        const category = intent.body?.category ? String(intent.body.category) : undefined;
        setSearchKeyword(keyword);
        setSearchLoading(true);
        try {
          await relay({
            actionId: "need.search",
            body: category ? { keyword, category } : { keyword },
          });
        } finally {
          setSearchLoading(false);
        }
        return;
      }

      if (intent.actionId === "need.select-opportunity") {
        const snapshot = snapshotFromRelayBody(intent.body);
        if (snapshot) {
          setSelectedOpportunity(snapshot);
          setStage("detail");
          return;
        }
      }

      await relay(intent);
    },
    [relay]
  );

  const requestService = useCallback(() => {
    setStage("confirm");
  }, []);

  const confirmRequest = useCallback(async () => {
    if (!selectedOpportunity) {
      return;
    }
    setSubmitting(true);
    try {
      await relay({
        actionId: "need.select-opportunity",
        body: { opportunity_id: selectedOpportunity.opportunityId },
      });
      await relay({
        actionId: "need.update-draft",
        body: {
          location: identity?.location ?? "Riyadh",
          schedule: detail?.estimatedArrival ?? "Next available",
          notes: detail ? `Service request: ${detail.serviceName}` : "",
        },
      });
      await relay({ actionId: "need.continue-request" });

      const published = getPublishedAction(selectedOpportunity.opportunityId);
      const request = identity
        ? createServiceRequest({
            opportunityId: selectedOpportunity.opportunityId,
            publishedActionId: published?.id ?? null,
            serviceName: selectedOpportunity.serviceName,
            providerName: selectedOpportunity.providerName,
            requester: identity,
            creatorPassportKey: published?.creator.passportKey ?? null,
          })
        : null;

      const tracking = request?.trackingId ?? `ACT-${selectedOpportunity.opportunityId.slice(0, 8).toUpperCase()}`;
      setTrackingId(tracking);
      setActiveRequest(request ?? getServiceRequestByTrackingId(tracking));
      setActiveContract(getActionContractByTrackingId(tracking));
      setStage("success");
    } finally {
      setSubmitting(false);
    }
  }, [detail, identity, relay, selectedOpportunity]);

  const refreshContract = useCallback((tracking: string) => {
    setActiveContract(getActionContractByTrackingId(tracking));
    setActiveRequest(getServiceRequestByTrackingId(tracking));
  }, []);

  const acceptContract = useCallback(() => {
    if (!activeContract || !identity) return;
    acceptActionContract(activeContract.contractId, identity);
    refreshContract(activeContract.trackingId);
  }, [activeContract, identity, refreshContract]);

  const advanceContract = useCallback(() => {
    if (!activeContract) return;
    advanceContractExecution(activeContract.contractId);
    advanceServiceRequest(activeContract.trackingId);
    refreshContract(activeContract.trackingId);
  }, [activeContract, refreshContract]);

  const attachEvidence = useCallback(
    (label: string, description: string) => {
      if (!activeContract) return;
      attachContractEvidence(activeContract.contractId, label, description);
      refreshContract(activeContract.trackingId);
    },
    [activeContract, refreshContract],
  );

  const confirmEvidence = useCallback(
    (evidenceId: string, role: "owner" | "requester") => {
      if (!activeContract) return;
      confirmContractEvidence(activeContract.contractId, evidenceId, role);
      refreshContract(activeContract.trackingId);
    },
    [activeContract, refreshContract],
  );

  const completeContractFlow = useCallback(() => {
    if (!trackingId || !activeContract) return;
    completeActionContract(activeContract.contractId);
    completeServiceRequest(trackingId);
    refreshContract(trackingId);
  }, [activeContract, refreshContract, trackingId]);

  const advanceProgress = useCallback(() => {
    if (!trackingId) return;
    advanceContract();
  }, [advanceContract, trackingId]);

  const completeRequest = useCallback(() => {
    completeContractFlow();
  }, [completeContractFlow]);

  const goBack = useCallback(() => {
    if (stage === "contract" || stage === "tracking") {
      setStage("success");
      return;
    }
    if (stage === "confirm") {
      setStage("detail");
      return;
    }
    if (stage === "detail") {
      recordPilotMilestone("opportunity", "abandoned");
      resetMvpFlow();
    }
  }, [resetMvpFlow, stage]);

  const viewTracking = useCallback(() => {
    if (trackingId) {
      refreshContract(trackingId);
    }
    setStage("contract");
  }, [refreshContract, trackingId]);

  return {
    stage,
    detail,
    trackingId,
    activeRequest,
    activeContract,
    searchLoading,
    searchKeyword,
    submitting,
    handleRelay,
    requestService,
    confirmRequest,
    returnHome,
    goBack,
    resetMvpFlow,
    viewTracking,
    advanceProgress,
    completeRequest,
    acceptContract,
    attachEvidence,
    confirmEvidence,
  };
}

export function injectNeedPresentationProps(
  screen: AnActRuntimeScreenView,
  options: { searchLoading: boolean; searchKeyword: string }
): AnActRuntimeScreenView {
  return {
    ...screen,
    sections: screen.sections.map((section) => ({
      ...section,
      components: section.components.map((component) => {
        if (component.componentId === "core-ui-search") {
          return {
            ...component,
            props: {
              ...component.props,
              loading: options.searchLoading,
              value: options.searchKeyword || component.props?.value,
              liveSearch: true,
            },
          };
        }
        return component;
      }),
    })),
  };
}

export function shouldShowSearchSkeleton(_screenId: string, _searchLoading: boolean): boolean {
  return false;
}
