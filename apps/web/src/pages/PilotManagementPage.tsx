import { useEffect, useState, type FormEvent } from "react";
import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";
import { exportPilotEvents } from "../lib/pilot-instrumentation.js";
import {
  addPilotFeedback,
  cohortOptions,
  getPilotManagementSnapshot,
  readinessLabel,
  recordPilotManagementExport,
  updatePilotFollowUp,
  type PilotCohortId,
  type PilotFeedbackInput,
  type PilotManagementSnapshot,
} from "../lib/pilot-management.js";

export interface PilotManagementPageProps {
  onExit: () => void;
  onOpenFounderConsole: () => void;
  onOpenPilotDashboard: () => void;
  onOpenGrowthFoundation: () => void;
  onOpenExecutiveOperations: () => void;
  onOpenLivePlatform: () => void;
}

type ManagementTab = "summary" | "cohorts" | "sessions" | "feedback" | "follow-up";

const TABS: Array<{ id: ManagementTab; label: string }> = [
  { id: "summary", label: "Readiness summary" },
  { id: "cohorts", label: "Pilot cohorts" },
  { id: "sessions", label: "Pilot sessions" },
  { id: "feedback", label: "Feedback capture" },
  { id: "follow-up", label: "Follow-up board" },
];

const EMPTY_FEEDBACK: PilotFeedbackInput = {
  cohortId: "first-customers",
  whatWorked: "",
  whatConfused: "",
  whereStopped: "",
  requiredGuidance: "",
  confidenceScore: 3,
  recommendedAction: "",
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  return <span className={`an-act-pilot-mgmt-outcome an-act-pilot-mgmt-outcome--${outcome}`}>{outcome}</span>;
}

function ReadinessBadge({ readiness }: { readiness: string }) {
  return <span className={`an-act-pilot-mgmt-readiness an-act-pilot-mgmt-readiness--${readiness}`}>{readinessLabel(readiness as "ready" | "conditional" | "not-started")}</span>;
}

export function PilotManagementPage({
  onExit,
  onOpenFounderConsole,
  onOpenPilotDashboard,
  onOpenGrowthFoundation,
  onOpenExecutiveOperations,
  onOpenLivePlatform,
}: PilotManagementPageProps) {
  const [tab, setTab] = useState<ManagementTab>("summary");
  const [snapshot, setSnapshot] = useState<PilotManagementSnapshot>(() => getPilotManagementSnapshot());
  const [feedbackForm, setFeedbackForm] = useState<PilotFeedbackInput>(EMPTY_FEEDBACK);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSnapshot(getPilotManagementSnapshot());
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  function refresh() {
    setSnapshot(getPilotManagementSnapshot());
  }

  function downloadExport() {
    const blob = new Blob([exportPilotEvents()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `an-act-pilot-management-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    recordPilotManagementExport();
    refresh();
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addPilotFeedback(feedbackForm);
    setFeedbackForm(EMPTY_FEEDBACK);
    setFeedbackSaved(true);
    refresh();
    window.setTimeout(() => setFeedbackSaved(false), 2500);
  }

  const { readiness, cohorts, sessions, feedback, followUps } = snapshot;

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-pilot-mgmt">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-pilot-mgmt__header">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <div>
            <h1>Pilot Management</h1>
            <p className="an-act-pilot-mgmt__subtitle">
              Operator layer for controlled MVP pilots — cohorts, sessions, feedback, and follow-up actions.
            </p>
          </div>
          <div className="an-act-pilot-mgmt__toolbar">
            <PremiumButton variant="primary" onClick={onOpenLivePlatform}>
              Open live platform
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenExecutiveOperations}>
              Executive Operations
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenGrowthFoundation}>
              Growth Foundation
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenFounderConsole}>
              Founder Console
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onOpenPilotDashboard}>
              Pilot dashboard
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={refresh}>
              Refresh
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={downloadExport}>
              Export metrics
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </div>
        </header>

        <nav className="an-act-pilot-mgmt__tabs" aria-label="Pilot management sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`an-act-pilot-mgmt__tab${tab === item.id ? " an-act-pilot-mgmt__tab--active" : ""}`}
              aria-current={tab === item.id ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {!snapshot.hasOperatorData && tab === "summary" ? (
          <PremiumCard as="article" className="an-act-pilot-mgmt-empty">
            <h2>No pilot management data yet</h2>
            <p>Run a live platform session or capture feedback to populate cohorts, sessions, and follow-up items.</p>
          </PremiumCard>
        ) : null}

        {tab === "summary" ? (
          <section aria-labelledby="pilot-readiness-heading">
            <h2 id="pilot-readiness-heading" className="an-act-pilot-mgmt__section-title">
              Pilot readiness summary
            </h2>
            <div className="an-act-pilot-mgmt__grid">
              <PremiumCard as="article" className="premium-card">
                <h3>Sessions completed</h3>
                <p className="an-act-pilot-mgmt__metric">{readiness.sessionsCompleted}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Successful journeys</h3>
                <p className="an-act-pilot-mgmt__metric">{readiness.successfulJourneys}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Blocked journeys</h3>
                <p className="an-act-pilot-mgmt__metric">{readiness.blockedJourneys}</p>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Follow-up backlog</h3>
                <p className="an-act-pilot-mgmt__metric">{readiness.followUpBacklog}</p>
              </PremiumCard>
            </div>
            <div className="an-act-pilot-mgmt__split">
              <PremiumCard as="article" className="premium-card">
                <h3>Top friction themes</h3>
                <ul className="an-act-pilot-mgmt__list">
                  {readiness.topFrictionThemes.map((theme) => (
                    <li key={theme}>{theme}</li>
                  ))}
                </ul>
              </PremiumCard>
              <PremiumCard as="article" className="premium-card">
                <h3>Next recommended cohort</h3>
                <p className="an-act-pilot-mgmt__lead">{readiness.nextRecommendedLabel}</p>
                <p className="an-act-pilot-mgmt__hint">Based on readiness status and sessions completed to date.</p>
              </PremiumCard>
            </div>
          </section>
        ) : null}

        {tab === "cohorts" ? (
          <section aria-labelledby="pilot-cohorts-heading">
            <h2 id="pilot-cohorts-heading" className="an-act-pilot-mgmt__section-title">
              Pilot cohorts
            </h2>
            <div className="an-act-pilot-mgmt__cohort-grid">
              {cohorts.map((cohort) => (
                <article key={cohort.id} className="an-act-card an-act-pilot-mgmt-cohort">
                  <div className="an-act-pilot-mgmt-cohort__head">
                    <h3>{cohort.name}</h3>
                    <ReadinessBadge readiness={cohort.readiness} />
                  </div>
                  <p>{cohort.purpose}</p>
                  <dl className="an-act-pilot-mgmt-cohort__stats">
                    <div>
                      <dt>Active sessions</dt>
                      <dd>{cohort.activeSessions}</dd>
                    </div>
                    <div>
                      <dt>Completion status</dt>
                      <dd>{cohort.completionStatus}</dd>
                    </div>
                    <div>
                      <dt>Follow-up needed</dt>
                      <dd>{cohort.followUpNeeded ? "Yes" : "No"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "sessions" ? (
          <section aria-labelledby="pilot-sessions-heading">
            <h2 id="pilot-sessions-heading" className="an-act-pilot-mgmt__section-title">
              Pilot sessions
            </h2>
            {sessions.length === 0 ? (
              <PremiumCard as="article" className="an-act-pilot-mgmt-empty">
                <h3>No sessions recorded</h3>
                <p>Sessions appear automatically from pilot instrumentation activity.</p>
              </PremiumCard>
            ) : (
              <div className="an-act-pilot-mgmt__table-wrap">
                <table className="an-act-pilot-mgmt__table">
                  <thead>
                    <tr>
                      <th>Session</th>
                      <th>Type</th>
                      <th>Persona</th>
                      <th>Journey</th>
                      <th>Outcome</th>
                      <th>Friction</th>
                      <th>Export</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>{session.id.slice(0, 8)}…</td>
                        <td>{session.sessionType}</td>
                        <td>{session.persona}</td>
                        <td>{session.journeyStatus}</td>
                        <td>
                          <OutcomeBadge outcome={session.outcome} />
                        </td>
                        <td>{session.frictionPoints.length > 0 ? session.frictionPoints.join(", ") : "None"}</td>
                        <td>{session.exportStatus}</td>
                        <td>{session.followUpOwner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === "feedback" ? (
          <section aria-labelledby="pilot-feedback-heading" className="an-act-pilot-mgmt__split">
            <PremiumCard as="article" className="premium-card">
              <h2 id="pilot-feedback-heading">Feedback capture</h2>
              <form className="an-act-pilot-mgmt-form" onSubmit={submitFeedback}>
                <label>
                  Cohort
                  <select
                    value={feedbackForm.cohortId}
                    onChange={(event) =>
                      setFeedbackForm((current) => ({ ...current, cohortId: event.target.value as PilotCohortId }))
                    }
                  >
                    {cohortOptions().map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  What worked
                  <textarea
                    value={feedbackForm.whatWorked}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, whatWorked: event.target.value }))}
                    rows={2}
                  />
                </label>
                <label>
                  What confused the user
                  <textarea
                    value={feedbackForm.whatConfused}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, whatConfused: event.target.value }))}
                    rows={2}
                  />
                </label>
                <label>
                  Where the user stopped
                  <input
                    type="text"
                    value={feedbackForm.whereStopped}
                    onChange={(event) => setFeedbackForm((current) => ({ ...current, whereStopped: event.target.value }))}
                  />
                </label>
                <label>
                  What required guidance
                  <textarea
                    value={feedbackForm.requiredGuidance}
                    onChange={(event) =>
                      setFeedbackForm((current) => ({ ...current, requiredGuidance: event.target.value }))
                    }
                    rows={2}
                  />
                </label>
                <label>
                  Confidence score (1–5)
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={feedbackForm.confidenceScore}
                    onChange={(event) =>
                      setFeedbackForm((current) => ({
                        ...current,
                        confidenceScore: Number(event.target.value) as 1 | 2 | 3 | 4 | 5,
                      }))
                    }
                  />
                  <span className="an-act-pilot-mgmt__hint">{feedbackForm.confidenceScore} / 5</span>
                </label>
                <label>
                  Recommended action
                  <input
                    type="text"
                    value={feedbackForm.recommendedAction}
                    onChange={(event) =>
                      setFeedbackForm((current) => ({ ...current, recommendedAction: event.target.value }))
                    }
                  />
                </label>
                <PremiumButton type="submit" variant="primary">
                  Save feedback
                </PremiumButton>
                {feedbackSaved ? (
                  <p role="status" className="an-act-pilot-mgmt__saved">
                    Feedback saved.
                  </p>
                ) : null}
              </form>
            </PremiumCard>

            <PremiumCard as="article" className="premium-card">
              <h3>Captured feedback</h3>
              {feedback.length === 0 ? (
                <p className="an-act-pilot-mgmt__hint">No feedback entries yet.</p>
              ) : (
                <ul className="an-act-pilot-mgmt__feedback-list">
                  {feedback.map((entry) => (
                    <li key={entry.id}>
                      <p className="an-act-pilot-mgmt__feedback-meta">
                        {cohortOptions().find((option) => option.id === entry.cohortId)?.label} · Confidence{" "}
                        {entry.confidenceScore}/5
                      </p>
                      {entry.whatWorked ? <p><strong>Worked:</strong> {entry.whatWorked}</p> : null}
                      {entry.whatConfused ? <p><strong>Confused:</strong> {entry.whatConfused}</p> : null}
                      {entry.whereStopped ? <p><strong>Stopped:</strong> {entry.whereStopped}</p> : null}
                      {entry.recommendedAction ? <p><strong>Action:</strong> {entry.recommendedAction}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </PremiumCard>
          </section>
        ) : null}

        {tab === "follow-up" ? (
          <section aria-labelledby="pilot-followup-heading">
            <h2 id="pilot-followup-heading" className="an-act-pilot-mgmt__section-title">
              Follow-up action board
            </h2>
            <ol className="an-act-pilot-mgmt__followups">
              {followUps.map((item) => (
                <li key={item.id} className={`an-act-pilot-mgmt-followup${item.status === "done" ? " an-act-pilot-mgmt-followup--done" : ""}`}>
                  <div className="an-act-pilot-mgmt-followup__head">
                    <strong>{item.title}</strong>
                    <span className={`an-act-pilot-mgmt-priority an-act-pilot-mgmt-priority--${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="an-act-pilot-mgmt__hint">Owner: {item.owner}</p>
                  <div className="an-act-pilot-mgmt-followup__actions">
                    <label>
                      Status
                      <select
                        value={item.status}
                        onChange={(event) => {
                          updatePilotFollowUp(item.id, { status: event.target.value as "pending" | "done" });
                          refresh();
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="done">Done</option>
                      </select>
                    </label>
                    <label>
                      Decision
                      <select
                        value={item.decision ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          updatePilotFollowUp(item.id, {
                            decision: value ? (value as "fix" | "defer" | "observe") : undefined,
                          });
                          refresh();
                        }}
                      >
                        <option value="">Not set</option>
                        <option value="fix">Fix</option>
                        <option value="defer">Defer</option>
                        <option value="observe">Observe</option>
                      </select>
                    </label>
                    <label>
                      Issue class
                      <input
                        type="text"
                        defaultValue={item.issueClass ?? ""}
                        onBlur={(event) => {
                          updatePilotFollowUp(item.id, { issueClass: event.target.value });
                          refresh();
                        }}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </ThemeProvider>
  );
}
