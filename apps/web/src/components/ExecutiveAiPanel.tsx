import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { RuntimeClient } from "@an-act/runtime-client";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { useEscapeKey } from "../hooks/useEscapeKey.js";
import { PresentationError } from "./PresentationError.js";

const RuntimeScreenMount = lazy(() =>
  import("@an-act/runtime-ui/react").then((m) => ({ default: m.RuntimeScreenMount }))
);

export interface ExecutiveAiPanelProps {
  client: RuntimeClient;
}

export function ExecutiveAiPanel({ client }: ExecutiveAiPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<AnActRuntimeScreenView | null>(null);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEscapeKey(open, () => {
    setOpen(false);
    toggleRef.current?.focus();
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.getExecutiveDashboard();
      setScreen(result.screen);
    } catch (err) {
      setError({
        title: "Executive panel unavailable",
        detail: err instanceof Error ? err.message : "We couldn't load the executive dashboard.",
      });
      setScreen(null);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!open) {
      return;
    }
    void loadDashboard();
  }, [loadDashboard, open]);

  return (
    <aside className="an-act-executive-panel" aria-label="Executive AI panel">
      <button
        ref={toggleRef}
        type="button"
        className="an-act-ai-panel__toggle"
        aria-expanded={open}
        aria-controls="executive-ai-panel-body"
        onClick={() => setOpen((v) => !v)}
      >
        Executive AI
      </button>
      {open ? (
        <div id="executive-ai-panel-body" className="an-act-executive-panel__body" role="region">
          {loading ? <p role="status" className="an-act-inline-status" data-compact="true">Loading dashboard...</p> : null}
          {error ? (
            <PresentationError
              title={error.title}
              detail={error.detail}
              onRetry={() => void loadDashboard()}
              onDismiss={() => setError(null)}
            />
          ) : null}
          {screen && !loading && !error ? (
            <Suspense fallback={<p role="status" className="an-act-inline-status" data-compact="true">Rendering...</p>}>
              <RuntimeScreenMount screen={screen} />
            </Suspense>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
