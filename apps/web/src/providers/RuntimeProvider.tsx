import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createRuntimeClient, type NeedExperienceEnvelope, type RuntimeClient } from "@an-act/runtime-client";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { AN_ACT_TRANSITION_DURATION_MS } from "@an-act/tokens";
import type { RelayIntent } from "@an-act/runtime-ui/react";

export interface RuntimeContextValue {
  client: RuntimeClient;
  envelope: NeedExperienceEnvelope | null;
  screen: AnActRuntimeScreenView | null;
  mode: "need" | "action" | "transition";
  loading: boolean;
  error: string | null;
  transitionActive: boolean;
  transitionProgress: number;
  transitionStageText?: string;
  login: (email: string, password: string) => Promise<void>;
  reload: () => Promise<void>;
  relay: (intent: RelayIntent) => Promise<void>;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export interface RuntimeProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export function RuntimeProvider({ children, baseUrl = "" }: RuntimeProviderProps) {
  const client = useMemo(() => createRuntimeClient({ baseUrl }), [baseUrl]);
  const [envelope, setEnvelope] = useState<NeedExperienceEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transitionActive, setTransitionActive] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionStageText, setTransitionStageText] = useState<string | undefined>();

  const applyEnvelope = useCallback((next: NeedExperienceEnvelope) => {
    setEnvelope(next);
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

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await client.loadNeedExperience();
      applyEnvelope(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load runtime experience");
    } finally {
      setLoading(false);
    }
  }, [applyEnvelope, client]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await client.auth.login(email, password);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [client, reload]
  );

  const runTransitionSequence = useCallback(async () => {
    setTransitionActive(true);
    setTransitionProgress(0);
    const steps = [0, 0.35, 0.7, 1];
    for (const progress of steps) {
      setTransitionProgress(progress);
      const next = await client.advanceTransition(progress);
      setTransitionStageText(String((next.transition as { stageText?: string } | undefined)?.stageText ?? ""));
      await sleep(AN_ACT_TRANSITION_DURATION_MS / steps.length);
      if (progress >= 1 && next.mode === "action") {
        const action = await client.loadActionExperience();
        setEnvelope({
          ...next,
          mode: "action",
          current_screen: action.current_screen,
          screen: action.screen,
        });
        setTransitionActive(false);
        return;
      }
      applyEnvelope(next);
    }
    setTransitionActive(false);
  }, [applyEnvelope, client]);

  const relay = useCallback(
    async (intent: RelayIntent) => {
      if (!envelope) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (intent.actionId === "need.advance-transition" || intent.route === "/system/transition") {
          await runTransitionSequence();
          return;
        }

        const result = await client.relay({
          actionId: intent.actionId,
          route: intent.route,
          screenId: envelope.current_screen,
          body: intent.body,
        });

        if ("screen" in result && result.screen) {
          setEnvelope({ ...envelope, screen: result.screen, current_screen: result.screen.screenId });
          return;
        }

        applyEnvelope(result as NeedExperienceEnvelope);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action relay failed");
      } finally {
        setLoading(false);
      }
    },
    [applyEnvelope, client, envelope, runTransitionSequence]
  );

  const value: RuntimeContextValue = {
    client,
    envelope,
    screen: envelope?.screen ?? null,
    mode: envelope?.mode ?? "need",
    loading,
    error,
    transitionActive,
    transitionProgress,
    transitionStageText,
    login,
    reload,
    relay,
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
