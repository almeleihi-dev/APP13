import { PremiumCard } from "@an-act/runtime-ui/react";
import type { GoalActionBreakdown } from "../../lib/living-platform/intelligence/goal-action-breakdown.js";

export interface GoalActionBreakdownPanelProps {
  breakdown: GoalActionBreakdown;
  guestMode?: boolean;
}

export function GoalActionBreakdownPanel({ breakdown, guestMode = false }: GoalActionBreakdownPanelProps) {
  return (
    <section className="an-act-goal-breakdown" aria-label="Goal action breakdown">
      <header className="an-act-goal-breakdown__header">
        <p className="an-act-goal-breakdown__eyebrow">
          {guestMode ? "Guest Preview · Goal → Actions" : "Goal → Actions"}
        </p>
        <h2 className="an-act-goal-breakdown__title">
          Your goal becomes <strong>{breakdown.totalActions} acts</strong>
        </h2>
        <p className="an-act-goal-breakdown__project">
          Project: <span>{breakdown.projectName}</span> · {breakdown.templateLabel}
        </p>
        <p className="an-act-goal-breakdown__summary">{breakdown.templateSummary}</p>
        <div className="an-act-goal-breakdown__totals">
          <span>${breakdown.totalEstimatedValue.toLocaleString()} estimated value</span>
          <span>{breakdown.totalEstimatedDays} days total</span>
        </div>
      </header>

      {breakdown.startNowActions.length > 0 ? (
        <PremiumCard featured className="an-act-goal-breakdown__start-now">
          <p className="an-act-goal-breakdown__start-label">Start now</p>
          <ul className="an-act-goal-breakdown__start-list">
            {breakdown.startNowActions.map((action) => (
              <li key={action.actionId}>
                <strong>{action.actionIndex}. {action.name}</strong>
                <span>
                  {action.requiredSkill} · {action.estimatedDays}d · ${action.estimatedValue.toLocaleString()} ·{" "}
                  {action.executionScope}
                </span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      ) : null}

      {guestMode ? (
        <PremiumCard className="an-act-goal-breakdown__contract-preview">
          <p className="an-act-goal-breakdown__start-label">Contract preview</p>
          <p className="an-act-goal-breakdown__guest-note">
            Guest mode shows how actions become contracts — real contracts require a Professional Passport.
          </p>
          <ul className="an-act-goal-breakdown__start-list">
            {breakdown.startNowActions.map((action) => (
              <li key={action.actionId}>
                <strong>{action.name}</strong>
                <span>
                  {action.requiredSkill} · {action.estimatedDays}d · ${action.estimatedValue.toLocaleString()} ·{" "}
                  Contract preview
                </span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      ) : null}

      <div className="an-act-goal-breakdown__phases">
        {breakdown.phases.map((phase) => (
          <details key={phase.phaseName} className="an-act-goal-breakdown__phase" open={phase.order === 0}>
            <summary>
              {phase.phaseName}
              <span className={`an-act-goal-breakdown__phase-status an-act-goal-breakdown__phase-status--${phase.status}`}>
                {phase.status}
              </span>
            </summary>
            {phase.subPhases.map((subPhase) => (
              <div key={subPhase.subPhaseName} className="an-act-goal-breakdown__subphase">
                <p className="an-act-goal-breakdown__subphase-name">→ {subPhase.subPhaseName}</p>
                <ol className="an-act-goal-breakdown__actions">
                  {subPhase.actions.map((action) => (
                    <li
                      key={action.actionId}
                      className={action.startNow ? "an-act-goal-breakdown__action--start-now" : undefined}
                    >
                      <div className="an-act-goal-breakdown__action-head">
                        <strong>
                          {action.actionIndex}. {action.name}
                        </strong>
                        {action.startNow ? <span className="an-act-goal-breakdown__badge">Start now</span> : null}
                        {action.contractReady ? (
                          <span className="an-act-goal-breakdown__badge an-act-goal-breakdown__badge--ready">
                            Contract ready
                          </span>
                        ) : null}
                      </div>
                      <p className="an-act-goal-breakdown__action-desc">{action.description}</p>
                      <dl className="an-act-goal-breakdown__meta">
                        <div>
                          <dt>Skill</dt>
                          <dd>{action.requiredSkill}</dd>
                        </div>
                        <div>
                          <dt>Scope</dt>
                          <dd>{action.executionScope}</dd>
                        </div>
                        <div>
                          <dt>Time</dt>
                          <dd>{action.estimatedDays} days</dd>
                        </div>
                        <div>
                          <dt>Value</dt>
                          <dd>${action.estimatedValue.toLocaleString()}</dd>
                        </div>
                        <div className="an-act-goal-breakdown__meta-wide">
                          <dt>Evidence</dt>
                          <dd>{action.evidenceRequired}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </details>
        ))}
      </div>
    </section>
  );
}
