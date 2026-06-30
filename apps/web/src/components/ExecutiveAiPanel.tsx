import { lazy, Suspense, useEffect, useState } from "react";
import { AnActBrandLoading } from "@an-act/runtime-ui/react";
import type { RuntimeClient } from "@an-act/runtime-client";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getExecutiveDashboard();
        setScreen(result.screen);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Executive panel unavailable");
      } finally {
        setLoading(false);
      }
    })();
  }, [client, open]);

  return (
    <aside className="an-act-executive-panel" aria-label="Executive AI panel">
      <button type="button" className="an-act-ai-panel__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Executive AI
      </button>
      {open ? (
        <div className="an-act-executive-panel__body">
          {loading ? <AnActBrandLoading stageText="Loading executive dashboard..." compact /> : null}
          {error ? <p role="status">{error}</p> : null}
          {screen ? (
            <Suspense fallback={<AnActBrandLoading stageText="Rendering..." compact />}>
              <RuntimeScreenMount screen={screen} />
            </Suspense>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
