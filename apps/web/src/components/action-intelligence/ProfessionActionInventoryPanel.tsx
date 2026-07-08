import { useMemo, useState } from "react";
import { PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import type { ActionInventoryItem, LivingPlatformState } from "../../lib/living-platform/types.js";
import {
  activateInventoryItem,
  addCustomInventoryItemFromSource,
  editInventoryItem,
  listVisibleInventory,
  removeInventoryItem,
} from "../../lib/living-platform/intelligence/action-inventory-store.js";
import {
  activateGuestInventoryItem,
  addGuestCustomInventoryItem,
  editGuestInventoryItem,
  removeGuestInventoryItem,
} from "../../guest/guest-inventory-store.js";
import { GuestConversionPrompt } from "../guest/GuestConversionPrompt.js";
import { countInventoryByBucket } from "../../lib/living-platform/intelligence/professional-action-inventory-engine.js";

export interface ProfessionActionInventoryPanelProps {
  professionText: string;
  livingState: LivingPlatformState;
  compact?: boolean;
  guestMode?: boolean;
}

function bucketLabel(bucket: ActionInventoryItem["bucket"]): string {
  if (bucket === "ready_now") return "Ready Now";
  if (bucket === "needs_verification") return "Needs Verification";
  return "Unlockable";
}

export function ProfessionActionInventoryPanel({
  professionText,
  livingState,
  compact = false,
  guestMode = false,
}: ProfessionActionInventoryPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customProof, setCustomProof] = useState("");
  const [showActivatePrompt, setShowActivatePrompt] = useState(false);

  const inventoryItems = useMemo(() => listVisibleInventory(livingState), [livingState]);
  const buckets = useMemo(() => countInventoryByBucket(inventoryItems), [inventoryItems]);

  const grouped = {
    ready_now: inventoryItems.filter((item) => item.bucket === "ready_now"),
    needs_verification: inventoryItems.filter((item) => item.bucket === "needs_verification"),
    unlockable: inventoryItems.filter((item) => item.bucket === "unlockable"),
  };

  function startEdit(item: ActionInventoryItem) {
    setEditingId(item.inventoryId);
    setEditTitle(item.title);
    setEditDescription(item.description);
  }

  function saveEdit() {
    if (!editingId) return;
    if (guestMode) editGuestInventoryItem(editingId, { title: editTitle, description: editDescription });
    else editInventoryItem(editingId, { title: editTitle, description: editDescription });
    setEditingId(null);
  }

  function handleAddCustom() {
    if (!customTitle.trim()) return;
    const input = {
      title: customTitle,
      description: customDescription,
      requiredProof: customProof,
    };
    if (guestMode) addGuestCustomInventoryItem(professionText, input);
    else addCustomInventoryItemFromSource(professionText, input);
    setCustomTitle("");
    setCustomDescription("");
    setCustomProof("");
  }

  function handleActivate(inventoryId: string) {
    if (guestMode) {
      setShowActivatePrompt(true);
      return;
    }
    activateInventoryItem(inventoryId);
  }

  function handleRemove(inventoryId: string) {
    if (guestMode) removeGuestInventoryItem(inventoryId);
    else removeInventoryItem(inventoryId);
  }

  return (
    <section className="an-act-profession-inventory" aria-label="Action Inventory">
      <header className="an-act-profession-inventory__header">
        <p className="an-act-profession-inventory__eyebrow">
          {guestMode ? "Guest Preview · Professional Action Discovery" : "Professional Action Discovery"}
        </p>
        <h2 className="an-act-profession-inventory__title">
          We discovered <strong>{inventoryItems.length} actions</strong> you can perform
        </h2>
        <p className="an-act-profession-inventory__profession">{professionText}</p>
        <p className="an-act-profession-inventory__buckets">
          {buckets.ready_now} ready now · {buckets.needs_verification} need verification · {buckets.unlockable}{" "}
          unlockable
        </p>
      </header>

      {showActivatePrompt ? (
        <GuestConversionPrompt action="activate_permanent" onDismiss={() => setShowActivatePrompt(false)} />
      ) : null}

      {(["ready_now", "needs_verification", "unlockable"] as const).map((bucket) => (
        <div key={bucket} className="an-act-profession-inventory__bucket">
          <h3>
            {bucketLabel(bucket)} ({grouped[bucket].length})
          </h3>
          {grouped[bucket].length === 0 ? (
            <p className="an-act-profession-inventory__empty">No actions in this category.</p>
          ) : (
            <ul className="an-act-profession-inventory__list">
              {grouped[bucket].map((item) => (
                <li key={item.inventoryId}>
                  <PremiumCard className="an-act-profession-inventory__card">
                    {editingId === item.inventoryId ? (
                      <div className="an-act-profession-inventory__edit">
                        <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
                        <textarea
                          value={editDescription}
                          onChange={(event) => setEditDescription(event.target.value)}
                          rows={3}
                        />
                        <div className="an-act-profession-inventory__controls">
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
                        <div className="an-act-profession-inventory__card-head">
                          <strong>{item.title}</strong>
                          <span>{item.confidenceScore}% confidence</span>
                        </div>
                        <p>{item.description}</p>
                        <dl className="an-act-profession-inventory__meta">
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
                        </dl>
                        {!compact ? (
                          <div className="an-act-profession-inventory__controls">
                            {item.status !== "active" && item.status !== "edited" ? (
                              <PremiumButton variant="primary" size="md" onClick={() => handleActivate(item.inventoryId)}>
                                ✓ Activate
                              </PremiumButton>
                            ) : (
                              <span className="an-act-profession-inventory__active">
                                {guestMode ? "Preview active" : "Active"}
                              </span>
                            )}
                            <PremiumButton variant="ghost" size="md" onClick={() => startEdit(item)}>
                              ✎ Edit
                            </PremiumButton>
                            <PremiumButton variant="ghost" size="md" onClick={() => handleRemove(item.inventoryId)}>
                              ✕ Remove
                            </PremiumButton>
                          </div>
                        ) : null}
                      </>
                    )}
                  </PremiumCard>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {!compact ? (
        <section className="an-act-profession-inventory__add" aria-label="Add missing ability">
          <h3>+ Add missing ability</h3>
          <input placeholder="Action title" value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} />
          <textarea
            placeholder="What can you deliver?"
            value={customDescription}
            onChange={(event) => setCustomDescription(event.target.value)}
            rows={3}
          />
          <input placeholder="Required proof" value={customProof} onChange={(event) => setCustomProof(event.target.value)} />
          <PremiumButton variant="secondary" onClick={handleAddCustom} disabled={!customTitle.trim()}>
            Add to inventory
          </PremiumButton>
        </section>
      ) : null}
    </section>
  );
}
