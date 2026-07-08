import React from "react";
import { AN_ACT_BRAND_LINE } from "@an-act/tokens";

export interface AnActBrandLoadingProps {
  stageText?: string;
  progress?: number;
  compact?: boolean;
}

/**
 * Official AN ACT loading experience — terminal typography and brand line animation.
 */
export function AnActBrandLoading({ stageText, progress, compact = false }: AnActBrandLoadingProps) {
  const brandBase = AN_ACT_BRAND_LINE.replace(/\.+$/, "");

  return (
    <div
      className="an-act-brand-loading"
      role="status"
      aria-live="polite"
      aria-label={stageText ? `${brandBase} ${stageText}` : brandBase}
      data-compact={compact || undefined}
    >
      <div className="an-act-brand-loading__line">
        {brandBase}
        <span className="an-act-brand-loading__dots" aria-hidden="true" />
      </div>
      {stageText ? <div className="an-act-brand-loading__stage">{stageText}</div> : null}
      {typeof progress === "number" ? (
        <div className="an-act-brand-loading__bar" aria-hidden="true">
          <div className="an-act-brand-loading__bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      ) : null}
    </div>
  );
}
