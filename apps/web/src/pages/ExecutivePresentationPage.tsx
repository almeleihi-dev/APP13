import { lazy, Suspense, useEffect, useState } from "react";
import { ThemeProvider, AnActWordmark, AnActBrandLoading, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";
import { OperatorConsoleIdentityRail } from "../passport/PlatformIdentityFrame.js";
import { PresentationError } from "../components/PresentationError.js";

const RuntimeScreenMount = lazy(() =>
  import("@an-act/runtime-ui/react").then((m) => ({ default: m.RuntimeScreenMount }))
);

export interface ExecutivePresentationPageProps {
  onExit: () => void;
}

const ARCHITECTURE_HIGHLIGHTS = [
  {
    title: "Marketplace",
    detail: "Need experience drives search, opportunity selection, and request handoff into Action Mode.",
  },
  {
    title: "Trust architecture",
    detail: "Live Frame presentation uses ui_tier only — trust intelligence stays server-side.",
  },
  {
    title: "Contract architecture",
    detail: "Contract preview, activation, and completion screens are Runtime JSON with server orchestration.",
  },
  {
    title: "AI architecture",
    detail: "22+ AI experience modules compose guidance, execution companion, and contract intelligence.",
  },
];

interface ExecutiveSummaryView {
  platform_status?: string;
  top_decisions?: Array<{ title?: string; summary?: string; priority?: string }>;
  top_risks?: Array<{ title?: string; summary?: string; severity?: string }>;
  top_opportunities?: Array<{ title?: string; summary?: string; impact?: string }>;
  action_queue_summary?: string;
  summary?: string;
}

interface KnowledgeBankSummaryView {
  headline?: string;
  subheadline?: string;
  item_count?: number;
  published_count?: number;
  category_count?: number;
  source_engine_count?: number;
  relationship_count?: number;
  registry?: {
    contribution_count?: number;
    version_count?: number;
  };
}

function ExecutiveSummaryCards({ summary }: { summary: ExecutiveSummaryView }) {
  return (
    <section className="an-act-partner-section" aria-labelledby="platform-summary-heading">
      <h2 id="platform-summary-heading">Platform summary</h2>
      {summary.platform_status ? (
        <PremiumCard as="article" className="an-act-executive-status-card">
          <p className="ds-eyebrow" style={{ margin: 0 }}>
            Platform status
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "1.125rem", fontWeight: 600 }}>{summary.platform_status}</p>
          {summary.summary ? <p style={{ margin: "12px 0 0", color: "var(--an-act-color-text-secondary)" }}>{summary.summary}</p> : null}
        </PremiumCard>
      ) : null}
      {summary.action_queue_summary ? (
        <PremiumCard as="article" className="premium-card">
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Action queue</h3>
          <p style={{ margin: "8px 0 0" }}>{summary.action_queue_summary}</p>
        </PremiumCard>
      ) : null}
      <div className="premium-console an-act-executive-highlight-grid">
        <div className="premium-console__ambient" aria-hidden="true" />
        {summary.top_decisions && summary.top_decisions.length > 0 ? (
          <PremiumCard as="article" className="premium-card">
            <h3 style={{ margin: 0 }}>Top decisions</h3>
            <ul style={{ margin: "12px 0 0", paddingLeft: "1.25rem" }}>
              {summary.top_decisions.map((item) => (
                <li key={item.title ?? item.summary}>
                  <strong>{item.title ?? "Decision"}</strong>
                  {item.summary ? `: ${item.summary}` : null}
                </li>
              ))}
            </ul>
          </PremiumCard>
        ) : null}
        {summary.top_risks && summary.top_risks.length > 0 ? (
          <PremiumCard as="article" className="premium-card">
            <h3 style={{ margin: 0 }}>Top risks</h3>
            <ul style={{ margin: "12px 0 0", paddingLeft: "1.25rem" }}>
              {summary.top_risks.map((item) => (
                <li key={item.title ?? item.summary}>
                  <strong>{item.title ?? "Risk"}</strong>
                  {item.summary ? `: ${item.summary}` : null}
                </li>
              ))}
            </ul>
          </PremiumCard>
        ) : null}
        {summary.top_opportunities && summary.top_opportunities.length > 0 ? (
          <PremiumCard as="article" className="premium-card">
            <h3 style={{ margin: 0 }}>Top opportunities</h3>
            <ul style={{ margin: "12px 0 0", paddingLeft: "1.25rem" }}>
              {summary.top_opportunities.map((item) => (
                <li key={item.title ?? item.summary}>
                  <strong>{item.title ?? "Opportunity"}</strong>
                  {item.summary ? `: ${item.summary}` : null}
                </li>
              ))}
            </ul>
          </PremiumCard>
        ) : null}
      </div>
    </section>
  );
}

function KnowledgeBankSummaryCards({ summary }: { summary: KnowledgeBankSummaryView }) {
  const stats = [
    { label: "Items", value: summary.item_count },
    { label: "Published", value: summary.published_count },
    { label: "Categories", value: summary.category_count },
    { label: "Source engines", value: summary.source_engine_count },
    { label: "Relationships", value: summary.relationship_count },
    { label: "Contributions", value: summary.registry?.contribution_count },
  ].filter((stat) => typeof stat.value === "number");

  return (
    <section className="an-act-partner-section" aria-labelledby="knowledge-bank-heading">
      <h2 id="knowledge-bank-heading">Knowledge Bank overview</h2>
      <PremiumCard as="article" className="premium-card">
        {summary.headline ? <h3 style={{ margin: 0 }}>{summary.headline}</h3> : null}
        {summary.subheadline ? (
          <p style={{ margin: "8px 0 0", color: "var(--an-act-color-text-secondary)" }}>{summary.subheadline}</p>
        ) : null}
        {stats.length > 0 ? (
          <div className="an-act-executive-highlight-grid" style={{ marginTop: 16 }}>
            {stats.map((stat) => (
              <div key={stat.label} className="an-act-card" style={{ padding: "12px 16px" }}>
                <p className="ds-eyebrow" style={{ margin: 0 }}>
                  {stat.label}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 650 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </PremiumCard>
    </section>
  );
}

export function ExecutivePresentationPage({ onExit }: ExecutivePresentationPageProps) {
  const { client, error, clearError } = useRuntime();
  const [busy, setBusy] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [dashboardScreen, setDashboardScreen] = useState<AnActRuntimeScreenView | null>(null);
  const [summaryScreen, setSummaryScreen] = useState<AnActRuntimeScreenView | null>(null);
  const [knowledgeSummary, setKnowledgeSummary] = useState<KnowledgeBankSummaryView | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummaryView | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      setBusy(true);
      clearError();
      const errors: string[] = [];
      try {
        const dashboard = await client.getExecutiveDashboard();
        setDashboardScreen(dashboard.screen);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Executive dashboard unavailable");
      }
      try {
        const summary = await client.getRuntimeExecutiveSummary();
        setSummaryScreen(summary.screen);
      } catch {
        /* optional panel */
      }
      try {
        setKnowledgeSummary((await client.getKnowledgeBankSummary()) as KnowledgeBankSummaryView);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Knowledge Bank summary unavailable");
      }
      try {
        setExecutiveSummary((await client.getExecutiveExperienceSummary()) as ExecutiveSummaryView);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Executive experience summary unavailable");
      }
      setLoadErrors(errors);
      setBusy(false);
    })();
  }, [clearError, client, reloadKey]);

  function retryBriefing() {
    setReloadKey((value) => value + 1);
  }

  const showContent = !busy;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-executive-presentation">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-executive-presentation__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <OperatorConsoleIdentityRail />
          <h1>Executive presentation</h1>
          <PremiumButton variant="ghost" onClick={onExit}>
            Back to landing
          </PremiumButton>
        </header>

        {busy ? <AnActBrandLoading stageText="Preparing executive briefing..." compact /> : null}

        {showContent ? (
          <>
        <section className="an-act-partner-section" aria-labelledby="highlights-heading">
          <h2 id="highlights-heading">Product highlights</h2>
          <div className="premium-console an-act-executive-highlight-grid">
        <div className="premium-console__ambient" aria-hidden="true" />
            {ARCHITECTURE_HIGHLIGHTS.map((item) => (
              <PremiumCard as="article" key={item.title} className="premium-card">
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </PremiumCard>
            ))}
          </div>
        </section>

        {executiveSummary ? <ExecutiveSummaryCards summary={executiveSummary} /> : null}

        {knowledgeSummary ? <KnowledgeBankSummaryCards summary={knowledgeSummary} /> : null}

        {dashboardScreen ? (
          <PremiumCard as="section" aria-label="Executive dashboard">
            <h2>Executive dashboard</h2>
            <Suspense fallback={<p role="status" className="an-act-inline-status" data-compact="true">Rendering dashboard...</p>}>
              <RuntimeScreenMount screen={dashboardScreen} />
            </Suspense>
          </PremiumCard>
        ) : null}

        {summaryScreen ? (
          <PremiumCard as="section" aria-label="Runtime summary">
            <h2>Runtime summary</h2>
            <Suspense fallback={<p role="status" className="an-act-inline-status" data-compact="true">Rendering summary...</p>}>
              <RuntimeScreenMount screen={summaryScreen} />
            </Suspense>
          </PremiumCard>
        ) : null}

        {loadErrors.length > 0 ? (
          <PresentationError
            title="Some briefing sections didn't load"
            detail="Product highlights are available. Retry to load the missing executive panels."
            onRetry={retryBriefing}
            onDismiss={() => setLoadErrors([])}
          />
        ) : null}

        {error ? (
          <PresentationError
            title={error.title}
            detail={error.detail}
            code={error.code}
            onRetry={retryBriefing}
            onDismiss={clearError}
          />
        ) : null}
          </>
        ) : null}
      </div>
    </ThemeProvider>
  );
}
