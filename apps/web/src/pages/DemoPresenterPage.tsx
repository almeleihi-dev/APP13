import { useCallback, useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, AnActBrandLoading, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";
import { OperatorConsoleIdentityRail } from "../passport/PlatformIdentityFrame.js";

export interface DemoPresenterPageProps {
  onExit: () => void;
  onOpenLivePlatform: () => void;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
}

export function DemoPresenterPage({ onExit, onOpenLivePlatform }: DemoPresenterPageProps) {
  const { client, presenterMode, setPresenterMode, loading, error, clearError } = useRuntime();
  const [busy, setBusy] = useState(true);
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string>("first-user-journey");
  const [demoState, setDemoState] = useState<Record<string, unknown> | null>(null);
  const [presenterNote, setPresenterNote] = useState("");

  const refreshDemo = useCallback(async () => {
    setBusy(true);
    clearError();
    try {
      const [scenarioList, demo] = await Promise.all([client.getDemoScenarios(), client.getRuntimeDemo()]);
      const list = (scenarioList.scenarios as DemoScenario[]) ?? [];
      setScenarios(list);
      setDemoState(demo);
      const active = demo.active_scenario as { id?: string; title?: string; description?: string } | undefined;
      if (active?.id) {
        setActiveScenario(active.id);
      }
      if (active?.description) {
        setPresenterNote(active.description);
      }
    } finally {
      setBusy(false);
    }
  }, [clearError, client]);

  useEffect(() => {
    void refreshDemo();
  }, [refreshDemo]);

  async function runControl(action: () => Promise<Record<string, unknown>>) {
    setBusy(true);
    clearError();
    try {
      const result = await action();
      if (result.ok === false) {
        setPresenterNote(String(result.error ?? "Demo control failed"));
        return;
      }
      setDemoState((prev) => ({ ...(prev ?? {}), ...result }));
      const scenario = result.scenario as { description?: string; title?: string } | undefined;
      const step = result.step as { sections?: Array<{ label?: string }> } | undefined;
      setPresenterNote(
        step?.sections?.[0]?.label ?? scenario?.description ?? scenario?.title ?? "Demo step updated"
      );
    } finally {
      setBusy(false);
    }
  }

  const summary = (demoState?.summary ?? {}) as Record<string, unknown>;

  return (
    <ThemeProvider mode="action">
      <div
        className={`premium-console an-act-demo-presenter${presenterMode ? " an-act-demo-presenter--presenter" : ""}`}
      >
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-demo-presenter__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <OperatorConsoleIdentityRail />
          <h1>Developer demo console</h1>
          <div className="an-act-demo-presenter__toolbar">
            <PremiumButton variant="secondary" onClick={onOpenLivePlatform}>
              Open live platform
            </PremiumButton>
            <label className="an-act-field an-act-field--inline">
              <input
                type="checkbox"
                checked={presenterMode}
                onChange={(e) => setPresenterMode(e.target.checked)}
              />
              Presenter mode
            </label>
            <PremiumButton variant="ghost" onClick={onExit}>
              Exit demo
            </PremiumButton>
          </div>
        </header>

        {busy || loading ? <AnActBrandLoading stageText="Loading demo..." compact /> : null}

        <PremiumCard as="section" className="an-act-demo-developer-notice" aria-label="Developer experience notice">
          <h2>Operator tooling</h2>
          <p>
            This console controls internal demo playback APIs. For customer-facing visual walkthroughs, open{" "}
            <strong>Live platform</strong> from the landing page or use the button above.
          </p>
        </PremiumCard>

        {!presenterMode ? (
          <PremiumCard as="section" aria-label="Scenario selection">
            <h2>Select scenario</h2>
            <div className="an-act-demo-scenarios">
              {scenarios.map((scenario) => (
                <PremiumButton
                  key={scenario.id}
                  variant={activeScenario === scenario.id ? "primary" : "secondary"}
                  onClick={() => setActiveScenario(scenario.id)}
                >
                  {scenario.title}
                </PremiumButton>
              ))}
            </div>
          </PremiumCard>
        ) : null}

        <PremiumCard as="section" className="an-act-demo-presenter-note" aria-live="polite">
          <h2>Presenter note</h2>
          <p>{presenterNote || "Select a scenario and press Start to begin the guided walkthrough."}</p>
        </PremiumCard>

        <section className="an-act-demo-summary-grid" aria-label="Demo progress">
          <PremiumCard as="div">
            <strong>Progress</strong>
            <p>{String(summary.progress ?? "—")}%</p>
          </PremiumCard>
          <PremiumCard as="div">
            <strong>Status</strong>
            <p>{String(summary.demoStatus ?? "idle")}</p>
          </PremiumCard>
          <PremiumCard as="div">
            <strong>Health</strong>
            <p>{String(summary.healthStatus ?? "—")}</p>
          </PremiumCard>
          <PremiumCard as="div">
            <strong>Readiness</strong>
            <p>{String(summary.readinessPercentage ?? "—")}%</p>
          </PremiumCard>
        </section>

        <div className="an-act-demo-controls" role="toolbar" aria-label="Demo playback controls">
          <PremiumButton variant="primary" disabled={busy} onClick={() => void runControl(() => client.startDemo(activeScenario))}>
            Start
          </PremiumButton>
          <PremiumButton variant="secondary" disabled={busy} onClick={() => void runControl(() => client.nextDemoStep())}>
            Next
          </PremiumButton>
          <PremiumButton variant="secondary" disabled={busy} onClick={() => void runControl(() => client.previousDemoStep())}>
            Previous
          </PremiumButton>
          <PremiumButton variant="ghost" disabled={busy} onClick={() => void runControl(() => client.pauseDemo())}>
            Pause
          </PremiumButton>
          <PremiumButton variant="ghost" disabled={busy} onClick={() => void runControl(() => client.resumeDemo())}>
            Resume
          </PremiumButton>
          <PremiumButton variant="ghost" disabled={busy} onClick={() => void runControl(() => client.restartDemo())}>
            Restart
          </PremiumButton>
          <PremiumButton variant="ghost" disabled={busy} onClick={() => void runControl(() => client.stopDemo())}>
            Stop
          </PremiumButton>
          <PremiumButton
            variant="secondary"
            disabled={busy}
            onClick={() =>
              void runControl(async () => {
                await client.stopDemo();
                return client.restartDemo();
              })
            }
          >
            Reset demo
          </PremiumButton>
        </div>

        {error ? (
          <p role="alert" className="an-act-demo-error">
            <strong>{error.title}</strong>: {error.detail}
          </p>
        ) : null}
      </div>
    </ThemeProvider>
  );
}
