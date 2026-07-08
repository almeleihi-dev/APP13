import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnActLogoKey } from "@an-act/runtime-ui/react";
import { FINAL_ACT_NAVIGATE_MS } from "./launch-gm.js";
import { prefersReducedMotion } from "./launch-motion.js";
import { navigate } from "./navigation.js";

export interface FinalActCeremonyProps {
  active: boolean;
}

export function FinalActCeremony({ active }: FinalActCeremonyProps) {
  useEffect(() => {
    if (!active) return;

    const reduced = prefersReducedMotion();
    const navigateMs = reduced ? 120 : FINAL_ACT_NAVIGATE_MS;

    const navTimer = window.setTimeout(() => navigate("/home"), navigateMs);

    return () => {
      window.clearTimeout(navTimer);
    };
  }, [active]);

  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`launch-ceremony an-act-emotion-final-act${prefersReducedMotion() ? " launch-ceremony--reduced" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Entering AN ACT platform"
    >
      <span className="launch-gm__sr-only">Entering AN ACT platform</span>
      <div className="launch-ceremony__glow" aria-hidden="true" />
      <div className="launch-ceremony__dim" aria-hidden="true" />
      <div className="launch-ceremony__logo-wrap" aria-hidden="true">
        <AnActLogoKey className="launch-ceremony__logo" />
      </div>
    </div>,
    document.body
  );
}
