import React, { useEffect, useState } from "react";
import { AN_ACT_TRANSITION_DURATION_MS } from "@an-act/tokens";
import { AnActWordmark } from "./AnActWordmark.js";

export interface AnActSplashProps {
  /** Experience mode the splash transitions into after exit. */
  targetMode?: "need" | "action";
  logoUrl?: string | null;
  onComplete?: () => void;
}

/**
 * Official AN ACT splash — matte black, terminal wordmark, 640ms exit into Runtime.
 */
export function AnActSplash({ targetMode = "need", logoUrl, onComplete }: AnActSplashProps) {
  const [phase, setPhase] = useState<"visible" | "exit">("visible");

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setPhase("exit"), AN_ACT_TRANSITION_DURATION_MS);
    return () => window.clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase !== "exit") {
      return;
    }
    const completeTimer = window.setTimeout(() => onComplete?.(), AN_ACT_TRANSITION_DURATION_MS);
    return () => window.clearTimeout(completeTimer);
  }, [phase, onComplete]);

  return (
    <div
      className={`an-act-splash${phase === "exit" ? " an-act-splash--exit" : ""}`}
      data-target-mode={targetMode}
      data-an-act-splash-phase={phase}
      role="status"
      aria-live="polite"
      aria-busy={phase === "visible"}
      aria-label="AN ACT is loading"
    >
      <div className="an-act-splash__content">
        <AnActWordmark logoUrl={logoUrl} className="an-act-splash__wordmark" />
        <div className="an-act-splash__indicator" aria-hidden="true">
          <span className="an-act-splash__indicator-track">
            <span className={`an-act-splash__indicator-fill${phase === "exit" ? " an-act-splash__indicator-fill--complete" : ""}`} />
          </span>
        </div>
        <p className="an-act-splash__stage">Preparing...</p>
      </div>
    </div>
  );
}

export { AN_ACT_TRANSITION_DURATION_MS };
