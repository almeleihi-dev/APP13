import { useEffect, useState, type FormEvent } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import {
  activationSignalLabel,
  addReferralSignal,
  addWaitlistEntry,
  earlyAccessStatusLabel,
  getGrowthFoundationSnapshot,
  personaOptions,
  type GrowthFoundationSnapshot,
  type GrowthPersona,
  type ReferralInput,
  type WaitlistInput,
} from "../lib/growth-foundation.js";

export interface GrowthFoundationPageProps {
  onExit: () => void;
  onOpenFounderConsole: () => void;
  onOpenPilotManagement: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLivePlatform: () => void;
}

type GrowthTab = "overview" | "invitations" | "waitlist" | "referrals" | "activation";

const TABS: Array<{ id: GrowthTab; label: string }> = [
  { id: "overview", label: "Early access overview" },
  { id: "invitations", label: "Invitation management" },
  { id: "waitlist", label: "Waitlist foundation" },
  { id: "referrals", label: "Referral signals" },
  { id: "activation", label: "Marketplace activation" },
];

const EMPTY_WAITLIST: WaitlistInput = {
  persona: "customers",
  source: "",
  readiness: "conditional",
  priority: "medium",
  expectedValue: "",
  nextAction: "",
};

const EMPTY_REFERRAL: ReferralInput = {
  referrerLabel: "",
  targetPersona: "customers",
  confidence: 3,
  reason: "",
  recommendedFollowUp: "",
};

function StatusBadge({ kind, label }: { kind: string; label: string }) {
  return <span className={`an-act-growth-badge an-act-growth-badge--${kind}`}>{label}</span>;
}

export function GrowthFoundationPage({
  onExit,
  onOpenFounderConsole,
  onOpenPilotManagement,
  onOpenExecutiveOperations,
  onOpenLivePlatform,
}: GrowthFoundationPageProps) {
  const [tab, setTab] = useState<GrowthTab>("overview");
  const [snapshot, setSnapshot] = useState<GrowthFoundationSnapshot>(() => getGrowthFoundationSnapshot());
  const [waitlistForm, setWaitlistForm] = useState<WaitlistInput>(EMPTY_WAITLIST);
  const [referralForm, setReferralForm] = useState<ReferralInput>(EMPTY_REFERRAL);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getGrowthFoundationSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  function refresh() {
    setSnapshot(getGrowthFoundationSnapshot());
  }

  function showSaved(message: string) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(null), 2500);
  }

  function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addWaitlistEntry(waitlistForm);
    setWaitlistForm(EMPTY_WAITLIST);
    refresh();
    showSaved("Waitlist entry saved.");
  }

  function submitReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addReferralSignal(referralForm);
    setReferralForm(EMPTY_REFERRAL);
    refresh();
    showSaved("Referral signal saved.");
  }

  const { earlyAccess, invitationBatches, waitlist, referrals, activation } = snapshot;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-growth">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-growth__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Growth Foundation</h1>
            <p className="an-act-growth__subtitle">
              Operator layer for controlled growth — early access, invitations, waitlist, referrals, and activation
              readiness. No public launch mechanics.
            </p>
          </div>
          <div className="an-act-growth__toolbar">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Open live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenFounderConsole}>
              Founder Console
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotManagement}>
              Pilot Management
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={refresh}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </div>
        </header>

        {savedMessage ? (
          <p role="status" className="an-act-growth__saved">
            {savedMessage}
          </p>
        ) : null}

        <nav className="an-act-growth__tabs" aria-label="Growth foundation sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`an-act-growth__tab${tab === item.id ? " an-act-growth__tab--active" : ""}`}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "overview" ? (
          <section aria-labelledby="growth-overview-heading">
            <h2 id="growth-overview-heading" className="an-act-growth__section-title">
              Early access overview
            </h2>
            <div className="an-act-growth__grid">
              <PremiumCard as="article" className="premium-card">
                <h3>Early access status</h3>
                <StatusBadge kind={earlyAccess.status} label={earlyAccessStatusLabel(earlyAccess.status)} />
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Invited users</h3>
                <p className="an-act-growth__metric">{earlyAccess.invitedUsers}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Accepted invitations</h3>
                <p className="an-act-growth__metric">{earlyAccess.acceptedInvitations}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Pending invitations</h3>
                <p className="an-act-growth__metric">{earlyAccess.pendingInvitations}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Waitlist interest</h3>
                <p className="an-act-growth__metric">{earlyAccess.waitlistInterest}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Pilot-to-growth readiness</h3>
                <p className="an-act-growth__metric">{earlyAccess.pilotToGrowthReadiness}%</p>
              </PremiumCard>
            </div>
          </section>
        ) : null}

        {tab === "invitations" ? (
          <section aria-labelledby="growth-invitations-heading">
            <h2 id="growth-invitations-heading" className="an-act-growth__section-title">
              Invitation management
            </h2>
            <div className="an-act-growth__table-wrap">
              <table className="an-act-growth__table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Invited</th>
                    <th>Accepted</th>
                    <th>Activated</th>
                    <th>Blocked</th>
                    <th>Follow-up</th>
                  </tr>
                </thead>
                <tbody>
                  {invitationBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td>{batch.label}</td>
                      <td>{batch.invited}</td>
                      <td>{batch.accepted}</td>
                      <td>{batch.activated}</td>
                      <td>{batch.blocked}</td>
                      <td>{batch.followUpNeeded ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="an-act-growth__hint">
              Activation counts sync from pilot instrumentation sessions where available. Operator sample data fills gaps.
            </p>
          </section>
        ) : null}

        {tab === "waitlist" ? (
          <section className="an-act-growth__split" aria-labelledby="growth-waitlist-heading">
            <PremiumCard as="article" className="premium-card">
              <h2 id="growth-waitlist-heading">Waitlist foundation</h2>
              <form className="an-act-growth-form" onSubmit={submitWaitlist}>
                <label>
                  Persona
                  <select
                    value={waitlistForm.persona}
                    onChange={(event) =>
                      setWaitlistForm((current) => ({ ...current, persona: event.target.value as GrowthPersona }))
                    }
                  >
                    {personaOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Source
                  <input
                    type="text"
                    value={waitlistForm.source}
                    onChange={(event) => setWaitlistForm((current) => ({ ...current, source: event.target.value }))}
                  />
                </label>
                <label>
                  Readiness
                  <select
                    value={waitlistForm.readiness}
                    onChange={(event) =>
                      setWaitlistForm((current) => ({
                        ...current,
                        readiness: event.target.value as WaitlistInput["readiness"],
                      }))
                    }
                  >
                    <option value="ready">Ready</option>
                    <option value="conditional">Conditional</option>
                    <option value="not-started">Not started</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={waitlistForm.priority}
                    onChange={(event) =>
                      setWaitlistForm((current) => ({
                        ...current,
                        priority: event.target.value as WaitlistInput["priority"],
                      }))
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label>
                  Expected value
                  <input
                    type="text"
                    value={waitlistForm.expectedValue}
                    onChange={(event) => setWaitlistForm((current) => ({ ...current, expectedValue: event.target.value }))}
                  />
                </label>
                <label>
                  Next action
                  <input
                    type="text"
                    value={waitlistForm.nextAction}
                    onChange={(event) => setWaitlistForm((current) => ({ ...current, nextAction: event.target.value }))}
                  />
                </label>
                <PremiumButton type="submit" variant="primary">
                  Add waitlist entry
                </PremiumButton>
              </form>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Waitlist entries</h3>
              {waitlist.length === 0 ? (
                <p className="an-act-growth__hint">No waitlist entries yet.</p>
              ) : (
                <ul className="an-act-growth__list">
                  {waitlist.map((entry) => (
                    <li key={entry.id}>
                      <p className="an-act-growth__meta">
                        {personaOptions().find((option) => option.id === entry.persona)?.label} · {entry.priority} priority
                      </p>
                      <p><strong>Source:</strong> {entry.source}</p>
                      <p><strong>Expected value:</strong> {entry.expectedValue}</p>
                      <p><strong>Next action:</strong> {entry.nextAction}</p>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
          </section>
        ) : null}

        {tab === "referrals" ? (
          <section className="an-act-growth__split" aria-labelledby="growth-referrals-heading">
            <PremiumCard as="article" className="premium-card">
              <h2 id="growth-referrals-heading">Referral signal framework</h2>
              <form className="an-act-growth-form" onSubmit={submitReferral}>
                <label>
                  Who would invite others (operator label)
                  <input
                    type="text"
                    value={referralForm.referrerLabel}
                    onChange={(event) => setReferralForm((current) => ({ ...current, referrerLabel: event.target.value }))}
                  />
                </label>
                <label>
                  Persona they would invite
                  <select
                    value={referralForm.targetPersona}
                    onChange={(event) =>
                      setReferralForm((current) => ({
                        ...current,
                        targetPersona: event.target.value as GrowthPersona,
                      }))
                    }
                  >
                    {personaOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Confidence level (1–5)
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={referralForm.confidence}
                    onChange={(event) =>
                      setReferralForm((current) => ({
                        ...current,
                        confidence: Number(event.target.value) as 1 | 2 | 3 | 4 | 5,
                      }))
                    }
                  />
                  <span className="an-act-growth__hint">{referralForm.confidence} / 5</span>
                </label>
                <label>
                  Reason
                  <textarea
                    rows={2}
                    value={referralForm.reason}
                    onChange={(event) => setReferralForm((current) => ({ ...current, reason: event.target.value }))}
                  />
                </label>
                <label>
                  Recommended follow-up
                  <input
                    type="text"
                    value={referralForm.recommendedFollowUp}
                    onChange={(event) =>
                      setReferralForm((current) => ({ ...current, recommendedFollowUp: event.target.value }))
                    }
                  />
                </label>
                <PremiumButton type="submit" variant="primary">
                  Save referral signal
                </PremiumButton>
              </form>
            </PremiumCard>
            <PremiumCard as="article" className="premium-card">
              <h3>Captured referral signals</h3>
              {referrals.length === 0 ? (
                <p className="an-act-growth__hint">No referral signals recorded yet.</p>
              ) : (
                <ul className="an-act-growth__list">
                  {referrals.map((signal) => (
                    <li key={signal.id}>
                      <p className="an-act-growth__meta">
                        {signal.referrerLabel} →{" "}
                        {personaOptions().find((option) => option.id === signal.targetPersona)?.label} · Confidence{" "}
                        {signal.confidence}/5
                      </p>
                      <p><strong>Reason:</strong> {signal.reason}</p>
                      <p><strong>Follow-up:</strong> {signal.recommendedFollowUp}</p>
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
          </section>
        ) : null}

        {tab === "activation" ? (
          <section aria-labelledby="growth-activation-heading">
            <h2 id="growth-activation-heading" className="an-act-growth__section-title">
              Marketplace activation readiness
            </h2>
            <div className="an-act-growth__split">
              <PremiumCard as="article" className="premium-card">
                <h3>Do we have enough customers?</h3>
                <StatusBadge kind={activation.enoughCustomers} label={activationSignalLabel(activation.enoughCustomers)} />
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Do we have enough professionals?</h3>
                <StatusBadge kind={activation.enoughProfessionals} label={activationSignalLabel(activation.enoughProfessionals)} />
              </PremiumCard>
            </div>
            <PremiumCard as="article" className="premium-card">
              <dl className="an-act-growth-dl">
                <div>
                  <dt>Which category should launch first?</dt>
                  <dd>{activation.launchCategoryFirst}</dd>
                </div>
                <div>
                  <dt>Supply / demand imbalance</dt>
                  <dd>{activation.supplyDemandImbalance}</dd>
                </div>
                <div>
                  <dt>Next activation move</dt>
                  <dd>{activation.nextActivationMove}</dd>
                </div>
              </dl>
            </PremiumCard>
          </section>
        ) : null}
      </div>
    </ThemeProvider>
  );
}
