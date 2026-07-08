import { useState } from "react";

export interface MarketplaceActionsBarProps {
  screenId: string;
  onDecline: () => Promise<void>;
  onCancel: () => Promise<void>;
  relaying: boolean;
}

const DECLINE_SCREENS = new Set(["request", "contract-preview", "action-home"]);
const CANCEL_SCREENS = new Set(["active-action", "progress-screen"]);

export function MarketplaceActionsBar({ screenId, onDecline, onCancel, relaying }: MarketplaceActionsBarProps) {
  const [busy, setBusy] = useState(false);
  const showDecline = DECLINE_SCREENS.has(screenId);
  const showCancel = CANCEL_SCREENS.has(screenId);

  if (!showDecline && !showCancel) {
    return null;
  }

  async function handleDecline() {
    setBusy(true);
    try {
      await onDecline();
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setBusy(true);
    try {
      await onCancel();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="an-act-marketplace-bar" role="toolbar" aria-label="Marketplace actions">
      {showDecline ? (
        <button
          type="button"
          className="an-act-button an-act-button--secondary"
          disabled={busy || relaying}
          onClick={() => void handleDecline()}
        >
          Decline request
        </button>
      ) : null}
      {showCancel ? (
        <button
          type="button"
          className="an-act-button an-act-button--ghost"
          disabled={busy || relaying}
          onClick={() => void handleCancel()}
        >
          Cancel action
        </button>
      ) : null}
    </div>
  );
}
