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
  LocalStorageAuthStorage,
  RuntimeClientError,
  type ActionExperienceEnvelope,
  type NeedExperienceEnvelope,
  type RegisterCustomerInput,
  type RegisterProviderInput,
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

export interface UserProfile {
  userId: string;
  roles: string[];
  providerId?: string;
  customerId?: string;
  displayName?: string;
  isProvider: boolean;
}

export interface RuntimeContextValue {
  client: RuntimeClient;
  envelope: NeedExperienceEnvelope | ActionExperienceEnvelope | null;
  screen: AnActRuntimeScreenView | null;
  mode: "need" | "action" | "transition";
  experienceKind: "need" | "action";
  userProfile: UserProfile | null;
  loading: boolean;
  relaying: boolean;
  error: { title: string; detail: string; code?: string } | null;
  offline: boolean;
  sessionExpired: boolean;
  transitionActive: boolean;
  transitionProgress: number;
  transitionStageText?: string;
  requestDraft: RequestDraftFields;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterCustomerInput) => Promise<boolean>;
  registerProvider: (input: RegisterProviderInput) => Promise<boolean>;
  updateProviderProfile: (
    providerId: string,
    body: { display_name?: string; bio?: string; business_name?: string }
  ) => Promise<boolean>;
  declineRequest: () => Promise<void>;
  cancelAction: () => Promise<void>;
  logout: () => Promise<void>;
  finishRegistration: () => Promise<void>;
  finishProviderSetup: () => Promise<void>;
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
  const [sessionExpired, setSessionExpired] = useState(false);
  const client = useMemo(
    () =>
      createRuntimeClient({
        baseUrl,
        authStorage: typeof localStorage !== "undefined" ? new LocalStorageAuthStorage() : undefined,
        onRefreshFailure: () => {
          setSessionExpired(true);
          setEnvelope(null);
        },
      }),
    [baseUrl]
  );
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadUserProfile = useCallback(async () => {
    try {
      const me = await client.getMe();
      const roles = Array.isArray(me.roles) ? (me.roles as string[]) : [];
      setUserProfile({
        userId: String(me.user_id ?? me.id ?? ""),
        roles,
        providerId: me.provider_id ? String(me.provider_id) : undefined,
        customerId: me.customer_id ? String(me.customer_id) : undefined,
        displayName: me.display_name ? String(me.display_name) : undefined,
        isProvider: roles.includes("provider"),
      });
    } catch {
      setUserProfile(null);
    }
  }, [client]);

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
    setSessionExpired(false);
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
    setSessionExpired(false);
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

  const applyActionScreen = useCallback(
    (screen: AnActRuntimeScreenView, extras?: Partial<ActionExperienceEnvelope>) => {
      applyActionEnvelope({
        version: "an-act-action-experience-v1",
        current_screen: screen.screenId,
        mode: screen.screenId === "transition" ? "transition" : "action",
        screen,
        navigation: envelope && experienceKind === "action" ? (envelope as ActionExperienceEnvelope).navigation : {},
        generated_at: new Date().toISOString(),
        runtime_experience: true,
        ...extras,
      });
    },
    [applyActionEnvelope, envelope, experienceKind]
  );

  const handleClientError = useCallback((err: unknown) => {
    if (err instanceof RuntimeClientError) {
      if (err.status === 401) {
        setSessionExpired(true);
        setEnvelope(null);
      }
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
    if (offline || !client.auth.hasSession()) {
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
      setSessionExpired(false);
      try {
        await client.auth.login(email, password);
        await loadUserProfile();
        const next = await client.loadNeedExperience();
        applyNeedEnvelope(next);
      } catch (err) {
        handleClientError(err);
      } finally {
        setLoading(false);
      }
    },
    [applyNeedEnvelope, client, handleClientError, loadUserProfile]
  );

  const register = useCallback(
    async (input: RegisterCustomerInput): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      try {
        await client.auth.registerCustomer(input);
        await loadUserProfile();
        return true;
      } catch (err) {
        handleClientError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, handleClientError, loadUserProfile]
  );

  const registerProvider = useCallback(
    async (input: RegisterProviderInput): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      try {
        await client.auth.registerProvider(input);
        await loadUserProfile();
        return true;
      } catch (err) {
        handleClientError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, handleClientError, loadUserProfile]
  );

  const updateProviderProfile = useCallback(
    async (
      providerId: string,
      body: { display_name?: string; bio?: string; business_name?: string }
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await client.updateProvider(providerId, body);
        await loadUserProfile();
        return true;
      } catch (err) {
        handleClientError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, handleClientError, loadUserProfile]
  );

  const finishRegistration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadUserProfile();
      const next = await client.loadNeedExperience();
      applyNeedEnvelope(next);
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  }, [applyNeedEnvelope, client, handleClientError, loadUserProfile]);

  const finishProviderSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadUserProfile();
      const next = await client.loadActionExperience();
      applyActionEnvelope(next);
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  }, [applyActionEnvelope, client, handleClientError, loadUserProfile]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await client.auth.logoutServer();
    } finally {
      setEnvelope(null);
      setUserProfile(null);
      setSessionExpired(false);
      setError(null);
      setLoading(false);
    }
  }, [client]);

  const completeJourneyToContract = useCallback(
    async (needHandoff: Record<string, unknown>) => {
      const entered = await client.enterActionExperience({
        need_handoff: {
          opportunity_id: needHandoff.opportunityId,
          action_summary: needHandoff.actionSummary,
          location: needHandoff.location,
          schedule: needHandoff.schedule,
          notes: needHandoff.notes,
          estimated_cost: needHandoff.estimatedCost,
        },
      });
      applyActionEnvelope(entered);
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

  const runActionReturnTransitionSequence = useCallback(async () => {
    setTransitionActive(true);
    setTransitionProgress(0);
    const steps = [0, 0.35, 0.7, 1];
    for (const progress of steps) {
      setTransitionProgress(progress);
      const next = await client.advanceActionTransition(progress);
      setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
      applyActionScreen(next.screen, {
        current_screen: "transition",
        mode: "transition",
        transition: next.transition,
      });
      await sleep(AN_ACT_TRANSITION_DURATION_MS / steps.length);
      if (progress >= 1 || next.complete || next.mode === "need") {
        const need = await client.loadNeedExperience();
        applyNeedEnvelope(need);
        setTransitionActive(false);
        return;
      }
    }
    setTransitionActive(false);
  }, [applyActionScreen, applyNeedEnvelope, client]);

  const returnToNeed = useCallback(async () => {
    const result = await client.startReturnTransition();
    applyActionScreen(result.screen, {
      current_screen: "transition",
      mode: "transition",
      transition: result.transition,
    });
    await runActionReturnTransitionSequence();
  }, [applyActionScreen, client, runActionReturnTransitionSequence]);

  const declineRequest = useCallback(async () => {
    setRelaying(true);
    setError(null);
    try {
      if (experienceKind === "need") {
        const next = await client.loadNeedExperience();
        applyNeedEnvelope(next);
        return;
      }
      await returnToNeed();
    } catch (err) {
      handleClientError(err);
    } finally {
      setRelaying(false);
    }
  }, [applyNeedEnvelope, client, experienceKind, handleClientError, returnToNeed]);

  const cancelAction = useCallback(async () => {
    setRelaying(true);
    setError(null);
    try {
      await returnToNeed();
    } catch (err) {
      handleClientError(err);
    } finally {
      setRelaying(false);
    }
  }, [handleClientError, returnToNeed]);

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
          if (result.opportunity_count === 0) {
            const emptyScreen = await client.loadNeedEmptyState();
            applyNeedEnvelope({
              ...(envelope as NeedExperienceEnvelope),
              current_screen: emptyScreen.screenId,
              screen: emptyScreen,
              search: result.search,
              mode: "need",
            });
            return;
          }
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

        if (intent.actionId === "action.continue-contract") {
          const result = await client.continueContract();
          applyActionScreen(result.screen);
          return;
        }

        if (intent.actionId === "action.complete") {
          const result = await client.completeAction();
          applyActionScreen(result.screen);
          return;
        }

        if (intent.actionId === "action.return") {
          const result = await client.startReturnTransition();
          applyActionScreen(result.screen, {
            current_screen: "transition",
            mode: "transition",
            transition: result.transition,
          });
          await runActionReturnTransitionSequence();
          return;
        }

        if (intent.route === "/action/home") {
          const screen = await client.loadActionHome();
          applyActionScreen(screen);
          return;
        }

        if (intent.route === "/action/contract") {
          const screen = await client.loadContractPreview();
          applyActionScreen(screen);
          return;
        }

        if (intent.route === "/action/active") {
          const screen = await client.loadActiveAction();
          applyActionScreen(screen);
          return;
        }

        if (intent.route === "/action/progress") {
          const screen = await client.loadProgress();
          applyActionScreen(screen);
          return;
        }

        const result = await client.relay({
          actionId: intent.actionId,
          route: intent.route,
          screenId: envelope.current_screen,
          body: intent.body,
        });

        if ("screen" in result && result.screen) {
          if ("next_mode" in result && result.next_mode === "need" && "transition" in result) {
            applyActionScreen(result.screen, {
              current_screen: "transition",
              mode: "transition",
              transition: result.transition as Record<string, unknown>,
            });
            await runActionReturnTransitionSequence();
            return;
          }

          if (experienceKind === "action" || (result.screen.mode ?? "action") === "action") {
            applyActionScreen(result.screen);
          } else {
            applyNeedEnvelope({
              ...(envelope as NeedExperienceEnvelope),
              screen: result.screen,
              current_screen: result.screen.screenId,
            });
          }
          return;
        }

        if ("version" in result) {
          if ((result as ActionExperienceEnvelope).mode === "action" || (result as ActionExperienceEnvelope).mode === "transition") {
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
      applyActionScreen,
      applyNeedEnvelope,
      client,
      envelope,
      experienceKind,
      handleClientError,
      offline,
      requestDraft,
      runActionReturnTransitionSequence,
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
    userProfile,
    loading,
    relaying,
    error,
    offline,
    sessionExpired,
    login,
    register,
    registerProvider,
    updateProviderProfile,
    declineRequest,
    cancelAction,
    logout,
    finishRegistration,
    finishProviderSetup,
    reload,
    relay,
    clearError: () => setError(null),
    transitionActive,
    transitionProgress,
    transitionStageText,
    requestDraft,
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
