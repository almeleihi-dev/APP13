import { PremiumCard } from "@an-act/runtime-ui/react";
import type { EconomyDashboardPresentation } from "../../lib/living-platform/types.js";
import { buildEconomyDashboardPresentation } from "../../lib/living-platform/economy/economy-presentation.js";
import { useLivingPlatformState } from "../../lib/living-platform/useLivingPlatform.js";
import { usePersonalIdentity } from "../../passport/usePersonalIdentity.js";

export interface EconomyDashboardExperienceProps {
  onBack: () => void;
}

export function EconomyDashboardExperience({ onBack }: EconomyDashboardExperienceProps) {
  const identity = usePersonalIdentity();
  const livingState = useLivingPlatformState();
  void livingState.economySignals;
  const economy = buildEconomyDashboardPresentation(identity);

  return (
    <div className="an-act-economy-dashboard">
      <header className="an-act-economy-dashboard__header">
        <button type="button" className="ds-btn ds-btn--ghost" onClick={onBack}>
          ← Back to Personal Home
        </button>
        <span className="ds-flow__sample-badge">Contract Economy · Living intelligence</span>
        <h1 className="ds-headline">AN ACT Economy</h1>
        <p className="ds-body">
          Humans perform actions. Actions create contracts. Contracts create trust. Trust creates opportunity.
        </p>
      </header>

      <GlobalContractPulse ledger={economy.ledger} revenue={economy.revenue} />
      <ActionEconomySection economy={economy} />
      <TrustEconomySection economy={economy} />
      <PlatformHealthSection economy={economy} />
      <InsuranceReadinessSection insurance={economy.insurance} />
    </div>
  );
}

function GlobalContractPulse({
  ledger,
  revenue,
}: {
  ledger: EconomyDashboardPresentation["ledger"];
  revenue: EconomyDashboardPresentation["revenue"];
}) {
  return (
    <section className="an-act-economy-dashboard__section">
      <h2 className="ds-title">Global Contract Pulse</h2>
      <div className="an-act-economy-dashboard__grid">
        <MetricCard label="Contracts generated" value={String(ledger.totalCreated)} />
        <MetricCard label="Active contracts" value={String(ledger.active)} />
        <MetricCard label="Completed contracts" value={String(ledger.completed)} />
        <MetricCard label="Value moving (GCV)" value={`$${revenue.grossContractValue.toLocaleString()}`} />
        <MetricCard label="Success rate" value={`${ledger.completionRate}%`} />
        <MetricCard label="Evidence confirmed" value={`${ledger.evidenceConfirmationRate}%`} />
        <MetricCard label="Avg execution" value={`${ledger.averageExecutionDays} days`} />
        <MetricCard label="Contracts / day" value={String(revenue.contractsPerDay)} />
      </div>
    </section>
  );
}

function ActionEconomySection({ economy }: { economy: EconomyDashboardPresentation }) {
  return (
    <section className="an-act-economy-dashboard__section">
      <h2 className="ds-title">Action Economy</h2>
      <div className="an-act-economy-dashboard__columns">
        <PremiumCard className="an-act-economy-dashboard__panel">
          <p className="ds-eyebrow">Trending actions</p>
          <ul className="an-act-economy-dashboard__list">
            {economy.trendingActions.map((profile) => (
              <li key={profile.category}>
                <strong>{profile.category}</strong>
                <span>{profile.summary}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
        <PremiumCard className="an-act-economy-dashboard__panel">
          <p className="ds-eyebrow">Rare action signals</p>
          <ul className="an-act-economy-dashboard__list">
            {economy.rareActions.length === 0 ? (
              <li>No scarcity signals yet — complete contracts to train the economy.</li>
            ) : (
              economy.rareActions.map((signal) => (
                <li key={signal.category}>
                  <strong>{signal.label}</strong>
                  <span>
                    Demand {signal.demandTrend === "up" ? "↑" : "→"} · Supply {signal.supplyTrend === "down" ? "↓" : "↑"} ·
                    Trust {signal.trustRequirement === "elevated" ? "↑" : "→"} · Value {signal.valueTrend === "up" ? "↑" : "→"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </PremiumCard>
        <PremiumCard className="an-act-economy-dashboard__panel">
          <p className="ds-eyebrow">Suggested action value</p>
          <ul className="an-act-economy-dashboard__list">
            {economy.valueRecommendations.map((rec) => (
              <li key={rec.category}>
                <strong>{rec.category}</strong>
                <span>
                  {rec.guidance.toUpperCase()} · ${rec.suggestedLow}–${rec.suggestedPremium} · {rec.factors.join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      </div>
    </section>
  );
}

function TrustEconomySection({ economy }: { economy: EconomyDashboardPresentation }) {
  return (
    <section className="an-act-economy-dashboard__section">
      <h2 className="ds-title">Trust Economy</h2>
      <div className="an-act-economy-dashboard__columns">
        <TrustList title="Trusted humans" items={economy.trustedHumans.map((h) => `${h.name} · ${h.reliability}% · ${h.contracts} contracts`)} />
        <TrustList title="Trusted teams" items={economy.trustedTeams.map((t) => `${t.name} · Trust ${t.trustScore}% · ${t.completedActions} completed`)} />
        <TrustList title="Trusted projects" items={economy.trustedProjects.map((p) => `${p.name} · ${p.trustLevel}% trust · ${p.progressPercent}% progress`)} />
      </div>
    </section>
  );
}

function TrustList({ title, items }: { title: string; items: string[] }) {
  return (
    <PremiumCard className="an-act-economy-dashboard__panel">
      <p className="ds-eyebrow">{title}</p>
      <ul className="an-act-economy-dashboard__list">
        {items.length === 0 ? <li>Awaiting contract-backed trust signals.</li> : items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </PremiumCard>
  );
}

function PlatformHealthSection({ economy }: { economy: EconomyDashboardPresentation }) {
  const { revenue, platformHealth } = economy;
  return (
    <section className="an-act-economy-dashboard__section">
      <h2 className="ds-title">Platform Health · Revenue Engine</h2>
      <div className="an-act-economy-dashboard__grid">
        <MetricCard label="Gross Contract Value" value={`$${revenue.grossContractValue.toLocaleString()}`} />
        <MetricCard label="Platform revenue est." value={`$${revenue.platformRevenueEstimate.toLocaleString()}`} />
        <MetricCard label="Avg contract value" value={`$${revenue.averageContractValue.toLocaleString()}`} />
        <MetricCard label="Platform fee" value={`${revenue.platformFeePercent}%`} />
        <MetricCard label="Contracts / minute" value={String(revenue.contractsPerMinute)} />
        <MetricCard label="Economy growth index" value={String(revenue.economyGrowthIndex)} />
        <MetricCard label="Growth" value={platformHealth.growth} />
        <MetricCard label="Reliability" value={platformHealth.reliability} />
        <MetricCard label="Risk" value={platformHealth.risk} />
      </div>
      <p className="ds-caption an-act-economy-dashboard__formula">
        Contract Volume × Contract Value × Platform Fee % = Economy Growth
      </p>
    </section>
  );
}

function InsuranceReadinessSection({
  insurance,
}: {
  insurance: EconomyDashboardPresentation["insurance"];
}) {
  return (
    <section className="an-act-economy-dashboard__section">
      <h2 className="ds-title">Insurance Readiness</h2>
      <PremiumCard className="an-act-economy-dashboard__panel">
        <div className="an-act-economy-dashboard__grid">
          <MetricCard label="Overall readiness" value={`${insurance.overallReadiness}%`} />
          <MetricCard label="Risk level" value={insurance.riskLevel} />
          <MetricCard label="Failure rate" value={`${insurance.failureRate}%`} />
          <MetricCard label="Verified evidence" value={`${insurance.verifiedEvidencePercent}%`} />
          <MetricCard label="Provider reliability" value={`${insurance.providerReliability}%`} />
          <MetricCard label="Dispute frequency" value={String(insurance.disputeFrequency)} />
        </div>
        <ul className="an-act-economy-dashboard__list">
          {insurance.readinessSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
        <p className="ds-caption">Readiness intelligence only — no insurance product implemented in this beta.</p>
      </PremiumCard>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="an-act-economy-dashboard__metric">
      <span className="ds-caption">{label}</span>
      <strong className="ds-title">{value}</strong>
    </div>
  );
}
