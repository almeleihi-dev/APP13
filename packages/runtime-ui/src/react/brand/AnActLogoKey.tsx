import React, { type CSSProperties } from "react";

export interface AnActLogoKeyProps {
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/**
 * Official AN ACT identity mark — 3D keyboard key with illuminated wordmark.
 * Presentation only; CSS-driven material and hover motion.
 */
export function AnActLogoKey({
  size = "md",
  className = "",
  style,
  label = "an act",
}: AnActLogoKeyProps) {
  return (
    <span
      className={`an-act-logo-key an-act-logo-key--${size} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={label}
      tabIndex={0}
    >
      <span className="an-act-logo-key__cap">
        <span className="an-act-logo-key__label">{label}</span>
      </span>
    </span>
  );
}
