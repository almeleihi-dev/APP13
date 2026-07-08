import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { logRuntimeTrace, RUNTIME_DEBUG_ENABLED } from "../lib/runtime-debug.js";
import {
  endPilotTiming,
  recordPilotError,
  recordPilotOffline,
  recordPilotPerformance,
  recordPilotScreenMilestone,
  recordPilotSearchMetric,
  recordPilotMilestone,
  setPilotRecordingPaused,
  startPilotTiming,
} from "../lib/pilot-instrumentation.js";

/** Bump when hydration logic changes — visible in dev console when runtime debug is enabled. */
export const RUNTIME_PROVIDER_BUILD = "2026-06-28-sprint0-rc2-v1";

const NEED_EXPERIENCE_VERSION = "an-act-need-experience-v1";
const ACTION_EXPERIENCE_VERSION = "an-act-action-experience-v1";

export interface ScreenMutationRecord {
  seq: number;
  caller: string;
  screenId: string | null;
  current_screen: string | null;
  at: number;
}

let screenMutationSeq = 0;

/** Callers that may legitimately commit a transition screen (active user journey). */
const INTENTIONAL_TRANSITION_CALLERS = [
  "runTransitionSequence",
  "relay:need.continue-request",
  "relay:need.advance-transition",
  "relay:action.return",
  "returnToNeed",
  "runActionReturnTransitionSequence",
] as const;

function isIntentionalTransitionApply(caller: string): boolean {
  return INTENTIONAL_TRANSITION_CALLERS.some((token) => caller.includes(token));
}

function logRuntimeDebug(label: string, payload: Record<string, unknown>) {
  logRuntimeTrace(`RuntimeProvider: ${label}`, { build: RUNTIME_PROVIDER_BUILD, ...payload });
}

function logRuntimeHydration(label: string, payload: Record<string, unknown>) {
  logRuntimeDebug(label, payload);
}

if (RUNTIME_DEBUG_ENABLED) {
  logRuntimeTrace("RuntimeProvider module loaded", { build: RUNTIME_PROVIDER_BUILD });
}

const NEED_JOURNEY_SCREEN_IDS = new Set([
  "need-home",
  "search",
  "opportunity-list",
  "request",
  "empty-state",
]);

function isNeedJourneyScreen(screenId?: string | null): boolean {
  return Boolean(screenId && NEED_JOURNEY_SCREEN_IDS.has(screenId));
}

function normalizeNeedExperienceMode(envelope: NeedExperienceEnvelope): NeedExperienceEnvelope {
  const screenId = envelope.screen?.screenId ?? envelope.current_screen ?? null;
  if (isNeedJourneyScreen(screenId) && envelope.mode !== "need" && envelope.mode !== "transition") {
    logRuntimeHydration("normalizeNeedExperienceMode: correcting stale mode on need screen", {
      screenId,
      mode: envelope.mode ?? null,
    });
    return { ...envelope, mode: "need" };
  }
  return envelope;
}

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
  lastScreenMutation: ScreenMutationRecord | null;
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
  reloadNeedExperience: () => Promise<void>;
  relay: (intent: RelayIntent) => Promise<void>;
  clearError: () => void;
  demoLogin: () => Promise<boolean>;
  presenterMode: boolean;
  setPresenterMode: (enabled: boolean) => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export interface RuntimeProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

function isHydratedTransitionEnvelope(envelope: {
  current_screen?: string;
  screen?: { screenId?: string };
}): boolean {
  return envelope.current_screen === "transition" || envelope.screen?.screenId === "transition";
}

function isNeedExperienceEnvelope(
  envelope: NeedExperienceEnvelope | ActionExperienceEnvelope
): envelope is NeedExperienceEnvelope {
  return envelope.version === NEED_EXPERIENCE_VERSION;
}

/** Presentation hydration: resume Need Home when the server session is stuck on transition. */
async function resolveHydratedNeedEnvelope(
  client: RuntimeClient,
  next: NeedExperienceEnvelope
): Promise<NeedExperienceEnvelope> {
  if (!isHydratedTransitionEnvelope(next)) {
    return normalizeNeedExperienceMode(next);
  }
  logRuntimeHydration("resolveHydratedNeedEnvelope: recovering need-home", {
    current_screen: next.current_screen,
    screenId: next.screen?.screenId,
    mode: next.mode,
  });
  const homeScreen = await client.loadNeedScreen("need-home", {
    generated_at: next.generated_at,
  });
  logRuntimeHydration("resolveHydratedNeedEnvelope: need-home loaded", {
    screenId: homeScreen.screenId,
  });
  return normalizeNeedExperienceMode({
    ...next,
    current_screen: "need-home",
    mode: "need",
    screen: homeScreen,
    transition: undefined,
  });
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

/**
 * Reality Bridge ET-1 — API origin resolution.
 * Same-origin ("") in dev (Vite proxy) and in same-origin production deployments.
 * When the frontend and backend are deployed to different origins, set
 * VITE_API_BASE_URL (e.g. https://api.anact.app) at build time so the runtime
 * client targets the real backend instead of the static host.
 */
const RESOLVED_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";

export function RuntimeProvider({
  children,
  baseUrl = RESOLVED_API_BASE_URL,
}: RuntimeProviderProps) {
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
  const [presenterMode, setPresenterMode] = useState(false);
  const [lastScreenMutation, setLastScreenMutation] = useState<ScreenMutationRecord | null>(null);
  const reloadNeedInflightRef = useRef<Promise<void> | null>(null);
  const staleRecoveryInflightRef = useRef<Promise<void> | null>(null);

  const recordScreenMutation = useCallback(
    (caller: string, next: { current_screen?: string; screen?: { screenId?: string } }) => {
      screenMutationSeq += 1;
      const record: ScreenMutationRecord = {
        seq: screenMutationSeq,
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        at: Date.now(),
      };
      setLastScreenMutation(record);
      logRuntimeTrace("RuntimeProvider: SCREEN_MUTATION", record as unknown as Record<string, unknown>);
      recordPilotScreenMilestone(record.screenId ?? undefined);
      return record;
    },
    []
  );

  const commitNeedEnvelope = useCallback(
    (next: NeedExperienceEnvelope, caller: string) => {
      recordScreenMutation(caller, next);
      logRuntimeDebug("commitNeedEnvelope", {
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        mode: next.mode ?? null,
        envelope: next,
      });
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
        setTransitionProgress(progress);
        setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
      } else {
        setTransitionActive(false);
        setTransitionProgress(0);
        setTransitionStageText(undefined);
      }
    },
    [recordScreenMutation]
  );

  const commitActionEnvelope = useCallback(
    (next: ActionExperienceEnvelope, caller: string) => {
      recordScreenMutation(caller, next);
      logRuntimeDebug("commitActionEnvelope", {
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        mode: next.mode ?? null,
        envelope: next,
      });
      setEnvelope(next);
      setExperienceKind("action");
      setSessionExpired(false);
      if (next.mode === "transition" || next.current_screen === "transition") {
        const progress = Number((next.transition as { progress?: number } | undefined)?.progress ?? 0);
        setTransitionProgress(progress);
        setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
      } else {
        setTransitionActive(false);
        setTransitionProgress(0);
        setTransitionStageText(undefined);
      }
    },
    [recordScreenMutation]
  );

  const recoverStaleTransitionToNeedHome = useCallback(
    async (source: NeedExperienceEnvelope, caller: string) => {
      if (staleRecoveryInflightRef.current) {
        logRuntimeDebug("recoverStaleTransitionToNeedHome: join inflight", { caller });
        await staleRecoveryInflightRef.current;
        return;
      }
      logRuntimeDebug("recoverStaleTransitionToNeedHome: start", {
        caller,
        screenId: source.screen?.screenId ?? null,
        current_screen: source.current_screen ?? null,
        mode: source.mode ?? null,
      });
      staleRecoveryInflightRef.current = (async () => {
        const resolved = await resolveHydratedNeedEnvelope(client, source);
        commitNeedEnvelope(resolved, `${caller}>recoverStaleTransitionToNeedHome`);
      })().finally(() => {
        staleRecoveryInflightRef.current = null;
      });
      await staleRecoveryInflightRef.current;
    },
    [client, commitNeedEnvelope]
  );

  const applyNeedEnvelope = useCallback(
    (next: NeedExperienceEnvelope, caller = "applyNeedEnvelope") => {
      logRuntimeDebug("applyNeedEnvelope", {
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        mode: next.mode ?? null,
        intentional: isIntentionalTransitionApply(caller),
        envelope: next,
      });
      if (isHydratedTransitionEnvelope(next) && !isIntentionalTransitionApply(caller)) {
        logRuntimeDebug("applyNeedEnvelope: blocked stale transition — scheduling recovery", { caller });
        void recoverStaleTransitionToNeedHome(next, caller);
        return;
      }
      commitNeedEnvelope(next, caller);
    },
    [commitNeedEnvelope, recoverStaleTransitionToNeedHome]
  );

  const applyActionEnvelope = useCallback(
    (next: ActionExperienceEnvelope, caller = "applyActionEnvelope") => {
      logRuntimeDebug("applyActionEnvelope", {
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        mode: next.mode ?? null,
        intentional: isIntentionalTransitionApply(caller),
        envelope: next,
      });
      if (isHydratedTransitionEnvelope(next) && !isIntentionalTransitionApply(caller)) {
        logRuntimeDebug("applyActionEnvelope: blocked stale transition — reloading need experience", { caller });
        void (async () => {
          await recoverStaleTransitionToNeedHome(await client.loadNeedExperience(), `${caller}>action-stale`);
        })();
        return;
      }
      commitActionEnvelope(next, caller);
    },
    [client, commitActionEnvelope, recoverStaleTransitionToNeedHome]
  );

  const DEMO_EMAIL = "customer.demo@anact.local";
  const DEMO_PASSWORD = "demo-password-123";

  const loadUserProfile = useCallback(async (): Promise<boolean> => {
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
      return true;
    } catch {
      setUserProfile(null);
      return false;
    }
  }, [client]);

  useEffect(() => {
    const onOnline = () => {
      setOffline(false);
      recordPilotOffline("recovered");
    };
    const onOffline = () => {
      setOffline(true);
      recordPilotOffline("detected");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    setPilotRecordingPaused(presenterMode);
  }, [presenterMode]);

  const hydrateNeedEnvelope = useCallback(
    async (next: NeedExperienceEnvelope, caller = "hydrateNeedEnvelope") => {
      logRuntimeDebug("hydrateNeedEnvelope: raw GET /need-experience (before resolve)", {
        caller,
        screenId: next.screen?.screenId ?? null,
        current_screen: next.current_screen ?? null,
        mode: next.mode ?? null,
        envelope: next,
      });
      const resolved = normalizeNeedExperienceMode(await resolveHydratedNeedEnvelope(client, next));
      logRuntimeDebug("hydrateNeedEnvelope: after resolve (before apply)", {
        caller,
        screenId: resolved.screen?.screenId ?? null,
        current_screen: resolved.current_screen ?? null,
        mode: resolved.mode ?? null,
        envelope: resolved,
      });
      applyNeedEnvelope(resolved, `${caller}>hydrateNeedEnvelope`);
    },
    [applyNeedEnvelope, client]
  );

  const applyActionScreen = useCallback(
    (screen: AnActRuntimeScreenView, extras?: Partial<ActionExperienceEnvelope>, caller = "applyActionScreen") => {
      applyActionEnvelope(
        {
          version: ACTION_EXPERIENCE_VERSION,
          current_screen: screen.screenId,
          mode: screen.screenId === "transition" ? "transition" : "action",
          screen,
          navigation: envelope && experienceKind === "action" ? (envelope as ActionExperienceEnvelope).navigation : {},
          generated_at: new Date().toISOString(),
          runtime_experience: true,
          ...extras,
        },
        caller
      );
    },
    [applyActionEnvelope, envelope, experienceKind]
  );

  const handleClientError = useCallback((err: unknown) => {
    let title = "Something went wrong";
    let detail = "An unexpected error occurred. Please try again.";
    let code: string | undefined;
    let category = "runtime";

    if (err instanceof RuntimeClientError) {
      if (err.status === 401) {
        setSessionExpired(true);
        setEnvelope(null);
        category = "auth";
      }
      title = err.problem?.title ?? "Something went wrong";
      detail = err.problem?.detail ?? err.message;
      code = err.problem?.code;
      if (err.status === 401) {
        category = "auth";
      } else if (err.status && err.status >= 500) {
        category = "server";
      }
    } else if (err instanceof Error) {
      const message = err.message.toLowerCase();
      if (message.includes("failed to fetch") || message.includes("networkerror") || message.includes("network request failed")) {
        title = "Connection problem";
        detail = "We couldn't reach AN ACT. Check your network connection and try again.";
        code = "NETWORK";
        category = "network";
      } else {
        detail = err.message;
      }
    }

    setError({ title, detail, code });
    recordPilotError({ category, title, code });
  }, []);

  const reloadNeedExperience = useCallback(async () => {
    if (offline || !client.auth.hasSession()) {
      logRuntimeDebug("reloadNeedExperience: skipped", { offline, hasSession: client.auth.hasSession() });
      return;
    }
    if (reloadNeedInflightRef.current) {
      logRuntimeDebug("reloadNeedExperience: join inflight", {});
      return reloadNeedInflightRef.current;
    }
    reloadNeedInflightRef.current = (async () => {
      setLoading(true);
      setError(null);
      const loadStart = performance.now();
      try {
        logRuntimeDebug("reloadNeedExperience: start", { experienceKind, pathname: window.location.pathname });
        const raw = await client.loadNeedExperience();
        logRuntimeDebug("reloadNeedExperience: GET /need-experience response", {
          screenId: raw.screen?.screenId ?? null,
          current_screen: raw.current_screen ?? null,
          mode: raw.mode ?? null,
          envelope: raw,
        });
        await hydrateNeedEnvelope(raw, "reloadNeedExperience");
        recordPilotPerformance("initial_runtime_load", performance.now() - loadStart);
      } catch (err) {
        handleClientError(err);
      } finally {
        setLoading(false);
      }
    })().finally(() => {
      reloadNeedInflightRef.current = null;
    });
    return reloadNeedInflightRef.current;
  }, [client, experienceKind, handleClientError, hydrateNeedEnvelope, offline]);

  const reload = useCallback(async () => {
    if (offline || !client.auth.hasSession()) {
      return;
    }
    logRuntimeDebug("reload: delegating to reloadNeedExperience for need platform recovery", { experienceKind });
    await reloadNeedExperience();
  }, [experienceKind, offline, reloadNeedExperience]);

  const demoLogin = useCallback(async (): Promise<boolean> => {
    if (sessionExpired) {
      client.auth.logout();
    }

    if (client.auth.hasSession()) {
      if (await loadUserProfile()) {
        return true;
      }
      client.auth.logout();
    }

    setLoading(true);
    setError(null);
    setSessionExpired(false);
    try {
      try {
        await client.auth.login(DEMO_EMAIL, DEMO_PASSWORD);
      } catch (err) {
        if (err instanceof RuntimeClientError && err.status === 401) {
          await client.auth.registerCustomer({
            email: DEMO_EMAIL,
            password: DEMO_PASSWORD,
            display_name: "Demo Customer",
          });
        } else {
          throw err;
        }
      }
      await loadUserProfile();
      recordPilotMilestone("auth", "completed");
      startPilotTiming("auth_to_need");
      return true;
    } catch (err) {
      handleClientError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [client, handleClientError, loadUserProfile, sessionExpired]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      setSessionExpired(false);
      try {
        await client.auth.login(email, password);
        await loadUserProfile();
        recordPilotMilestone("auth", "completed");
        startPilotTiming("auth_to_need");
        await hydrateNeedEnvelope(await client.loadNeedExperience(), "login");
      } catch (err) {
        handleClientError(err);
      } finally {
        setLoading(false);
      }
    },
    [client, handleClientError, hydrateNeedEnvelope, loadUserProfile]
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
      await hydrateNeedEnvelope(await client.loadNeedExperience(), "finishRegistration");
    } catch (err) {
      handleClientError(err);
    } finally {
      setLoading(false);
    }
  }, [client, handleClientError, hydrateNeedEnvelope, loadUserProfile]);

  const finishProviderSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadUserProfile();
      const next = await client.loadActionExperience();
      applyActionEnvelope(next, "finishProviderSetup");
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
      applyActionEnvelope(entered, "completeJourneyToContract");
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
          applyNeedEnvelope(
            {
              ...(envelope as NeedExperienceEnvelope),
              screen: next.screen,
              current_screen: "transition",
              mode: "transition",
              transition: next.transition,
            },
            "runTransitionSequence"
          );
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
      applyActionScreen(
        next.screen,
        {
          current_screen: "transition",
          mode: "transition",
          transition: next.transition,
        },
        "runActionReturnTransitionSequence"
      );
      await sleep(AN_ACT_TRANSITION_DURATION_MS / steps.length);
      if (progress >= 1 || next.complete || next.mode === "need") {
        await hydrateNeedEnvelope(await client.loadNeedExperience(), "runActionReturnTransitionSequence:complete");
        setTransitionActive(false);
        return;
      }
    }
    setTransitionActive(false);
  }, [applyActionScreen, client, hydrateNeedEnvelope]);

  const returnToNeed = useCallback(async () => {
    const result = await client.startReturnTransition();
    applyActionScreen(
      result.screen,
      {
        current_screen: "transition",
        mode: "transition",
        transition: result.transition,
      },
      "returnToNeed"
    );
    await runActionReturnTransitionSequence();
  }, [applyActionScreen, client, runActionReturnTransitionSequence]);

  const declineRequest = useCallback(async () => {
    setRelaying(true);
    setError(null);
    try {
      if (experienceKind === "need") {
        await hydrateNeedEnvelope(await client.loadNeedExperience(), "declineRequest");
        return;
      }
      await returnToNeed();
    } catch (err) {
      handleClientError(err);
    } finally {
      setRelaying(false);
    }
  }, [client, experienceKind, handleClientError, hydrateNeedEnvelope, returnToNeed]);

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
        recordPilotError({ category: "offline", title: "Offline", code: "OFFLINE" });
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
          startPilotTiming("search_duration");
          recordPilotMilestone("search", "started");
          const searchStart = performance.now();
          const result = await client.performSearch(intent.body ?? {});
          recordPilotSearchMetric({
            durationMs: performance.now() - searchStart,
            zeroResults: result.opportunity_count === 0,
          });
          endPilotTiming("search_duration");
          recordPilotMilestone("search", "completed");
          if (result.opportunity_count === 0) {
            const emptyScreen = await client.loadNeedEmptyState();
            applyNeedEnvelope(
              {
                ...(envelope as NeedExperienceEnvelope),
                current_screen: emptyScreen.screenId,
                screen: emptyScreen,
                search: result.search,
                mode: "need",
              },
              "relay:need.search:empty"
            );
            return;
          }
          applyNeedEnvelope(
            {
              ...(envelope as NeedExperienceEnvelope),
              current_screen: result.screen.screenId,
              screen: result.screen,
              search: result.search,
              mode: "need",
            },
            "relay:need.search"
          );
          return;
        }

        if (intent.actionId === "need.select-opportunity") {
          const opportunityId = String(intent.body?.opportunity_id ?? "");
          const screen = await client.selectOpportunity(opportunityId);
          applyNeedEnvelope(
            {
              ...(envelope as NeedExperienceEnvelope),
              current_screen: "request",
              screen,
              mode: "need",
            },
            "relay:need.select-opportunity"
          );
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
          applyNeedEnvelope(
            {
              ...(envelope as NeedExperienceEnvelope),
              current_screen: "transition",
              screen: result.screen,
              mode: "transition",
              transition: result.transition,
            },
            "relay:need.continue-request"
          );
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
          applyActionScreen(result.screen, undefined, "relay:action.continue-contract");
          return;
        }

        if (intent.actionId === "action.complete") {
          const result = await client.completeAction();
          applyActionScreen(result.screen, undefined, "relay:action.complete");
          return;
        }

        if (intent.actionId === "action.return") {
          const result = await client.startReturnTransition();
          applyActionScreen(
            result.screen,
            {
              current_screen: "transition",
              mode: "transition",
              transition: result.transition,
            },
            "relay:action.return"
          );
          await runActionReturnTransitionSequence();
          return;
        }

        if (intent.route === "/action/home") {
          const screen = await client.loadActionHome();
          applyActionScreen(screen, undefined, "relay:/action/home");
          return;
        }

        if (intent.route === "/action/contract") {
          const screen = await client.loadContractPreview();
          applyActionScreen(screen, undefined, "relay:/action/contract");
          return;
        }

        if (intent.route === "/action/active") {
          const screen = await client.loadActiveAction();
          applyActionScreen(screen, undefined, "relay:/action/active");
          return;
        }

        if (intent.route === "/action/progress") {
          const screen = await client.loadProgress();
          applyActionScreen(screen, undefined, "relay:/action/progress");
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
            applyActionScreen(
              result.screen,
              {
                current_screen: "transition",
                mode: "transition",
                transition: result.transition as Record<string, unknown>,
              },
              "relay:return-to-need"
            );
            await runActionReturnTransitionSequence();
            return;
          }

          const relayCaller = `relay:screen:${intent.route ?? intent.actionId ?? "unknown"}`;
          if (result.screen.screenId === "transition") {
            await hydrateNeedEnvelope(await client.loadNeedExperience(), relayCaller);
            return;
          }

          if (experienceKind === "action" && result.screen.mode !== "need") {
            applyActionScreen(result.screen, undefined, relayCaller);
          } else {
            applyNeedEnvelope(
              {
                ...(envelope as NeedExperienceEnvelope),
                screen: result.screen,
                current_screen: result.screen.screenId,
                mode: "need",
              },
              relayCaller
            );
          }
          return;
        }

        if ("version" in result) {
          const relayCaller = `relay:envelope:${intent.route ?? intent.actionId ?? "unknown"}`;
          if (isNeedExperienceEnvelope(result as NeedExperienceEnvelope | ActionExperienceEnvelope)) {
            await hydrateNeedEnvelope(result as NeedExperienceEnvelope, relayCaller);
          } else {
            applyActionEnvelope(result as ActionExperienceEnvelope, relayCaller);
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

  useEffect(() => {
    logRuntimeDebug("state snapshot", {
      screenId: screen?.screenId ?? null,
      current_screen: envelope?.current_screen ?? null,
      mode: envelope?.mode ?? null,
      experienceKind,
      transitionActive,
      relaying,
      loading,
      pathname: typeof window !== "undefined" ? window.location.pathname : null,
      envelope,
    });
  }, [
    envelope,
    experienceKind,
    loading,
    relaying,
    screen?.screenId,
    transitionActive,
  ]);

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
    reloadNeedExperience,
    relay,
    clearError: () => setError(null),
    demoLogin,
    presenterMode,
    setPresenterMode,
    transitionActive,
    transitionProgress,
    transitionStageText,
    lastScreenMutation,
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
