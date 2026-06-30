import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createRuntimeClient,
  RuntimeClientError,
  type ActionExperienceEnvelope,
  type NeedExperienceEnvelope,
  type RuntimeClient,
} from "@an-act/runtime-client";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { AN_ACT_TRANSITION_DURATION_MS } from "@an-act/tokens";
import type { RelayIntent } from "@an-act/runtime-ui/react";

export interface RequestDraftFields {
  location?: string;
  schedule?: string;
  notes?: string;
}

export interface RuntimeContextValue {
  client: RuntimeClient;
  envelope: NeedExperienceEnvelope | ActionExperienceEnvelope | null;
  screen: AnActRuntimeScreenView | null;
  mode: "need" | "action" | "transition";
  experienceKind: "need" | "action";
  loading: boolean;
  relaying: boolean;
  error: { title: string; detail: string; code?: string } | null;
  offline: boolean;
  transitionActive: boolean;
  transitionProgress: number;
  transitionStageText?: string;
  requestDraft: RequestDraftFields;
  login: (email: string, password: string) => Promise<void>;
  reload: () => Promise<void>;
  relay: (intent: RelayIntent) => Promise<void>;
  clearError: () => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export interface RuntimeProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

function mergeDraftIntoScreen(
  screen: AnActRuntimeScreenView,
  draft: RequestDraftFields
): AnActRuntimeScreenView {
  if (screen.screenId !== "request") {
    return screen;
  }
  return {
    ...screen,
    sections: screen.sections.map((section) => ({
      ...section,
      components: section.components.map((component) => {
        if (component.componentId === "core-ui-button" && component.props.action === "continue-request") {
          return {
            ...component,
            props: {
              ...component.props,
              disabled: !(draft.location && draft.schedule),
            },
          };
        }
        if (component.componentId !== "core-ui-input") {
          return component;
        }
        const name = String(component.props.name ?? "");
        const value = draft[name as keyof RequestDraftFields];
        if (value === undefined) {
          return component;
        }
        return { ...component, props: { ...component.props, value } };
      }),
    })),
  };
}

export function RuntimeProvider({ children, baseUrl = "" }: RuntimeProviderProps) {
  const client = useMemo(() => createRuntimeClient({ baseUrl }), [baseUrl]);
  const [envelope, setEnvelope] = useState<NeedExperienceEnvelope | ActionExperienceEnvelope | null>(null);
  const [experienceKind, setExperienceKind] = useState<"need" | "action">("need");
  const [loading, setLoading] = useState(false);
  const [relaying, setRelaying] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string; code?: string } | null>(null);
  const [offline, setOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [transitionActive, setTransitionActive] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionStageText, setTransitionStageText] = useState<string | undefined>();
  const [requestDraft, setRequestDraft] = useState<RequestDraftFields>({});

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const applyNeedEnvelope = useCallback((next: NeedExperienceEnvelope) => {
    setEnvelope(next);
    setExperienceKind("need");
    if (next.request_draft) {
      setRequestDraft({
        location: String((next.request_draft as RequestDraftFields).location ?? ""),
        schedule: String((next.request_draft as RequestDraftFields).schedule ?? ""),
        notes: String((next.request_draft as RequestDraftFields).notes ?? ""),
      });
    }
    if (next.mode === "transition" || next.current_screen === "transition") {
      const progress = Number((next.transition as { progress?: number } | undefined)?.progress ?? 0);
      setTransitionActive(true);
      setTransitionProgress(progress);
      setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
    } else {
      setTransitionActive(false);
      setTransitionProgress(0);
      setTransitionStageText(undefined);
    }
  }, []);

  const applyActionEnvelope = useCallback((next: ActionExperienceEnvelope) => {
    setEnvelope(next);
    setExperienceKind("action");
    setTransitionActive(false);
  }, []);

  const handleClientError = useCallback((err: unknown) => {
    if (err instanceof RuntimeClientError) {
      setError({
        title: err.problem?.title ?? "Runtime Error",
        detail: err.problem?.detail ?? err.message,
        code: err.problem?.code,
      });
      return;
    }
    setError({ title: "Runtime Error", detail: err instanceof Error ? err.message : "Unknown error" });
  }, []);

  const reload = useCallback(async () => {
    if (offline) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (experienceKind === "action") {
        const next = await client.loadActionExperience();
        applyActionEnvelope(next);
      } else {
        const next = await client.loadNeedExperience();
        applyNeedEnvelope(next);
      }
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  }, [applyActionEnvelope, applyNeedEnvelope, client, experienceKind, handleClientError, offline]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await client.auth.login(email, password);
        const next = await client.loadNeedExperience();
        applyNeedEnvelope(next);
      } catch (err) {
        handleClientError(err);
      } finally {
        setLoading(false);
      }
    },
    [applyNeedEnvelope, client, handleClientError]
  );

  const completeJourneyToContract = useCallback(
    async (needHandoff: Record<string, unknown>) => {
      await client.enterActionExperience({
        need_handoff: {
          opportunity_id: needHandoff.opportunityId,
          action_summary: needHandoff.actionSummary,
          location: needHandoff.location,
          schedule: needHandoff.schedule,
          notes: needHandoff.notes,
          estimated_cost: needHandoff.estimatedCost,
        },
      });
      const contractScreen = await client.loadContractPreview();
      applyActionEnvelope({
        version: "an-act-action-experience-v1",
        current_screen: "contract-preview",
        mode: "action",
        screen: contractScreen,
        navigation: {},
        generated_at: new Date().toISOString(),
        runtime_experience: true,
      });
    },
    [applyActionEnvelope, client]
  );

  const runTransitionSequence = useCallback(
    async (handoff: Record<string, unknown>) => {
      setTransitionActive(true);
      setTransitionProgress(0);
      const steps = [0, 0.35, 0.7, 1];
      for (const progress of steps) {
        setTransitionProgress(progress);
        const next = await client.advanceTransition(progress);
        setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
        await sleep(AN_ACT_TRANSITION_DURATION_MS / steps.length);
        if (progress >= 1 || next.complete || next.mode === "action") {
          await completeJourneyToContract(handoff);
          setTransitionActive(false);
          return;
        }
        if (envelope && "runtime_experience" in envelope) {
          applyNeedEnvelope({
            ...(envelope as NeedExperienceEnvelope),
            screen: next.screen,
            current_screen: "transition",
            mode: "transition",
            transition: next.transition,
          });
        }
      }
      setTransitionActive(false);
    },
    [applyNeedEnvelope, client, completeJourneyToContract, envelope]
  );

  const relay = useCallback(
    async (intent: RelayIntent) => {
      if (offline) {
        setError({ title: "Offline", detail: "Reconnect to continue the AN ACT journey." });
        return;
      }
      if (!envelope) {
        return;
      }

      setRelaying(true);
      setError(null);

      try {
        if (intent.actionId === "need.update-draft" && intent.body) {
          setRequestDraft((prev) => ({
            ...prev,
            ...(intent.body as RequestDraftFields),
          }));
          return;
        }

        if (intent.actionId === "need.search") {
          const result = await client.performSearch(intent.body ?? {});
          applyNeedEnvelope({
            ...(envelope as NeedExperienceEnvelope),
            current_screen: result.screen.screenId,
            screen: result.screen,
            search: result.search,
            mode: "need",
          });
          return;
        }

        if (intent.actionId === "need.select-opportunity") {
          const opportunityId = String(intent.body?.opportunity_id ?? "");
          const screen = await client.selectOpportunity(opportunityId);
          applyNeedEnvelope({
            ...(envelope as NeedExperienceEnvelope),
            current_screen: "request",
            screen,
            mode: "need",
          });
          return;
        }

        if (intent.actionId === "need.continue-request") {
          const handoff = {
            ...(envelope as NeedExperienceEnvelope).request_draft,
            ...requestDraft,
          };
          const result = await client.continueRequest({
            location: requestDraft.location,
            schedule: requestDraft.schedule,
            notes: requestDraft.notes,
          });
          applyNeedEnvelope({
            ...(envelope as NeedExperienceEnvelope),
            current_screen: "transition",
            screen: result.screen,
            mode: "transition",
            transition: result.transition,
          });
          await runTransitionSequence(handoff as Record<string, unknown>);
          return;
        }

        if (intent.actionId === "need.advance-transition" || intent.route === "/system/transition") {
          const handoff = {
            ...(envelope as NeedExperienceEnvelope).request_draft,
            ...requestDraft,
          };
          await runTransitionSequence(handoff as Record<string, unknown>);
          return;
        }

        if (intent.actionId === "action.contract" || intent.route === "/action/contract") {
          const screen = await client.loadContractPreview();
          applyActionEnvelope({
            version: "an-act-action-experience-v1",
            current_screen: "contract-preview",
            mode: "action",
            screen,
            navigation: {},
            generated_at: new Date().toISOString(),
            runtime_experience: true,
          });
          return;
        }

        const result = await client.relay({
          actionId: intent.actionId,
          route: intent.route,
          screenId: envelope.current_screen,
          body: intent.body,
        });

        if ("screen" in result && result.screen && !("version" in result)) {
          if (experienceKind === "action") {
            applyActionEnvelope({ ...(envelope as ActionExperienceEnvelope), screen: result.screen, current_screen: result.screen.screenId });
          } else {
            applyNeedEnvelope({ ...(envelope as NeedExperienceEnvelope), screen: result.screen, current_screen: result.screen.screenId });
          }
          return;
        }

        if ("version" in result) {
          if ((result as ActionExperienceEnvelope).mode === "action") {
            applyActionEnvelope(result as ActionExperienceEnvelope);
          } else {
            applyNeedEnvelope(result as NeedExperienceEnvelope);
          }
        }
      } catch (err) {
        handleClientError(err);
      } finally {
        setRelaying(false);
      }
    },
    [
      applyActionEnvelope,
      applyNeedEnvelope,
      client,
      envelope,
      experienceKind,
      handleClientError,
      offline,
      requestDraft,
      runTransitionSequence,
    ]
  );

  const rawScreen = envelope?.screen ?? null;
  const screen = rawScreen ? mergeDraftIntoScreen(rawScreen, requestDraft) : null;

  const value: RuntimeContextValue = {
    client,
    envelope,
    screen,
    mode: envelope?.mode ?? "need",
    experienceKind,
    loading,
    relaying,
    error,
    offline,
    transitionActive,
    transitionProgress,
    transitionStageText,
    requestDraft,
    login,
    reload,
    relay,
    clearError: () => setError(null),
  };

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useRuntime(): RuntimeContextValue {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error("useRuntime must be used within RuntimeProvider");
  }
  return ctx;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
