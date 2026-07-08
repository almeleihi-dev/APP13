import { AnActError } from "@an-act/runtime-ui/react";

export interface PresentationErrorProps {
  title: string;
  detail: string;
  code?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  retryDisabled?: boolean;
}

export function PresentationError({
  title,
  detail,
  code,
  onRetry,
  onDismiss,
  retryLabel = "Try again",
  dismissLabel = "Dismiss",
  retryDisabled = false,
}: PresentationErrorProps) {
  return (
    <div className="an-act-error-panel" role="alert">
      <AnActError
        node={{
          key: "presentation-error",
          element: "an-act-error",
          props: { title, detail, code },
        }}
      />
      {onRetry || onDismiss ? (
        <div className="an-act-error-panel__actions">
          {onRetry ? (
            <button
              type="button"
              className="an-act-button an-act-button--secondary"
              onClick={onRetry}
              disabled={retryDisabled}
              aria-busy={retryDisabled}
            >
              {retryLabel}
            </button>
          ) : null}
          {onDismiss ? (
            <button type="button" className="an-act-button an-act-button--ghost" onClick={onDismiss}>
              {dismissLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
