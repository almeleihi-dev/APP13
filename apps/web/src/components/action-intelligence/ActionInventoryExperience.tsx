import { useMemo, useState } from "react";
import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import type { ActionInventoryItem, LivingPlatformState } from "../../lib/living-platform/types.js";
import {
  activateInventoryItem,
  addCustomInventoryItem,
  editInventoryItem,
  removeInventoryItem,
  syncActionInventoryForIdentity,
} from "../../lib/living-platform/intelligence/action-inventory-store.js";
import { buildActionIntelligencePresentation } from "../../lib/living-platform/intelligence/action-intelligence-presentation.js";

export interface ActionInventoryExperienceProps {
  identity: ActivePersonalIdentity;
  livingState: LivingPlatformState;
  goal?: string | null;
  onBack?: () => void;
}

function bucketLabel(bucket: ActionInventoryItem["bucket"]): string {
  if (bucket === "ready_now") return "Ready Now";
  if (bucket === "needs_verification") return "Needs Verification";
  return "Unlockable";
}

export function ActionInventoryExperience({
  identity,
  livingState,
  goal,
  onBack,
}: ActionInventoryExperienceProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customProof, setCustomProof] = useState("");

  const presentation = useMemo(
    () => buildActionIntelligencePresentation(identity, livingState, goal),
    [identity, livingState, goal],
  );

  function handleSync() {
    syncActionInventoryForIdentity(identity);
  }

  function startEdit(item: ActionInventoryItem) {
    setEditingId(item.inventoryId);
    setEditTitle(item.title);
    setEditDescription(item.description);
  }

  function saveEdit() {
    if (!editingId) return;
    editInventoryItem(editingId, { title: editTitle, description: editDescription });
    setEditingId(null);
  }

  function handleAddCustom() {
    if (!customTitle.trim()) return;
    addCustomInventoryItem(identity, {
      title: customTitle,
      description: customDescription,
      requiredProof: customProof,
    });
    setCustomTitle("");
    setCustomDescription("");
    setCustomProof("");
  }

  const grouped = {
    ready_now: presentation.inventoryItems.filter(
      (item) => item.bucket === "ready_now" && item.status !== "removed",
    ),
    needs_verification: presentation.inventoryItems.filter(
      (item) => item.bucket === "needs_verification" && item.status !== "removed",
    ),
    unlockable: presentation.inventoryItems.filter(
      (item) => item.bucket === "unlockable" && item.status !== "removed",
    ),
  };

  return (
    <div className="an-act-action-inventory">
      <header className="an-act-action-inventory__header">
        {onBack ? (
          <PremiumButton variant="ghost" size="md" onClick={onBack}>
            ← Back
          </PremiumButton>
        ) : null}
        <p className="an-act-action-inventory__eyebrow">Professional Action Discovery</p>
        <h1 className="an-act-action-inventory__title">My Action Inventory</h1>
        <p className="an-act-action-inventory__lead">
          We discovered <strong>{presentation.inventoryTotal} actions</strong> you can perform from your passport,
          skills, and experience.
        </p>
        <PremiumButton variant="secondary" size="md" onClick={handleSync}>
          Refresh from passport
        </PremiumButton>
      </header>

      {presentation.growthSummary ? (
        <PremiumCard featured className="an-act-action-inventory__growth">
          <p className="an-act-action-inventory__growth-label">Passport growth</p>
          <p>{presentation.growthSummary}</p>
        </PremiumCard>
      ) : null}

      {presentation.opportunityAlerts.length > 0 ? (
        <section className="an-act-action-inventory__opportunities" aria-label="Opportunity intelligence">
          <h2>Opportunity intelligence</h2>
          <ul>
            {presentation.opportunityAlerts.map((alert) => (
              <li key={alert.alertId}>
                <strong>{alert.actionTitle}</strong>
                <span>
                  High demand: {alert.category} requests +{alert.demandChangePercent}% · You qualify
                </span>
                <p>{alert.recommendations.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(["ready_now", "needs_verification", "unlockable"] as const).map((bucket) => (
        <section key={bucket} className="an-act-action-inventory__bucket">
          <h2>
            {bucketLabel(bucket)} ({grouped[bucket].length})
          </h2>
          {grouped[bucket].length === 0 ? (
            <p className="an-act-action-inventory__empty">No actions in this category yet.</p>
          ) : (
            <ul className="an-act-action-inventory__list">
              {grouped[bucket].map((item) => (
                <li key={item.inventoryId}>
                  <PremiumCard className="an-act-action-inventory__card">
                    {editingId === item.inventoryId ? (
                      <div className="an-act-action-inventory__edit">
                        <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          rows={3}
                        />
                        <div className="an-act-action-inventory__controls">
                          <PremiumButton variant="primary" size="md" onClick={saveEdit}>
                            Save
                          </PremiumButton>
                          <PremiumButton variant="ghost" size="md" onClick={() => setEditingId(null)}>
                            Cancel
                          </PremiumButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="an-act-action-inventory__card-head">
                          <strong>{item.title}</strong>
                          <span>{item.confidenceScore}% confidence</span>
                        </div>
                        <p>{item.description}</p>
                        <dl className="an-act-action-inventory__meta">
                          <div>
                            <dt>Proof</dt>
                            <dd>{item.requiredProof}</dd>
                          </div>
                          <div>
                            <dt>Demand</dt>
                            <dd>{item.marketDemand}</dd>
                          </div>
                          <div>
                            <dt>Value</dt>
                            <dd>${item.estimatedValue.toLocaleString()}</dd>
                          </div>
                          <div>
                            <dt>Trust</dt>
                            <dd>{item.trustRequirement}</dd>
                          </div>
                        </dl>
                        <div className="an-act-action-inventory__controls">
                          {item.status !== "active" && item.status !== "edited" ? (
                            <PremiumButton variant="primary" size="md" onClick={() => activateInventoryItem(item.inventoryId)}>
                              ✓ Activate
                            </PremiumButton>
                          ) : (
                            <span className="an-act-action-inventory__active-badge">Active</span>
                          )}
                          <PremiumButton variant="ghost" size="md" onClick={() => startEdit(item)}>
                            ✎ Edit
                          </PremiumButton>
                          <PremiumButton variant="ghost" size="md" onClick={() => removeInventoryItem(item.inventoryId)}>
                            ✕ Remove
                          </PremiumButton>
                        </div>
                      </>
                    )}
                  </PremiumCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="an-act-action-inventory__add" aria-label="Add missing ability">
        <h2>+ Add missing ability</h2>
        <input
          placeholder="Action title"
          value={customTitle}
          onChange={(event) => setCustomTitle(event.target.value)}
        />
        <textarea
          placeholder="What can you deliver?"
          value={customDescription}
          onChange={(event) => setCustomDescription(event.target.value)}
          rows={3}
        />
        <input
          placeholder="Required proof"
          value={customProof}
          onChange={(event) => setCustomProof(event.target.value)}
        />
        <PremiumButton variant="secondary" onClick={handleAddCustom} disabled={!customTitle.trim()}>
          Add to inventory
        </PremiumButton>
      </section>

      <section className="an-act-action-inventory__matching" aria-label="Matching foundation">
        <h2>Matching foundation</h2>
        <p>
          {presentation.matching.openNeeds} open needs · {presentation.matching.supplyActions} supply actions ·{" "}
          {presentation.matching.readyForContract} contract-ready matches
        </p>
        {presentation.matching.matchCandidates.length > 0 ? (
          <ul>
            {presentation.matching.matchCandidates.slice(0, 4).map((match) => (
              <li key={match.matchId}>
                Need: {match.needActionName} ↔ Supply: {match.supplyTitle} ({match.confidenceScore}% match)
              </li>
            ))}
          </ul>
        ) : (
          <p className="an-act-action-inventory__empty">
            Need ↔ Action Inventory ↔ Contract links appear as marketplace requests arrive.
          </p>
        )}
      </section>
    </div>
  );
}
