import React, { type CSSProperties } from "react";
import { AN_ACT_WORDMARK } from "@an-act/tokens";

export interface AnActWordmarkProps {
  /** When set, renders an image instead of the typographic wordmark. */
  logoUrl?: string | null;
  logoAlt?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Official AN ACT wordmark — typographic fallback until a logo asset is supplied.
 * Set logoUrl (e.g. via VITE_AN_ACT_LOGO_URL) to swap without code changes.
 */
export function AnActWordmark({
  logoUrl,
  logoAlt = "an act",
  className = "",
  style,
}: AnActWordmarkProps) {
  const withLogo = Boolean(logoUrl);
  return (
    <span
      className={`an-act-wordmark${withLogo ? " an-act-wordmark--with-logo" : ""} ${className}`.trim()}
      style={style}
      aria-label={logoAlt}
      role="img"
    >
      {logoUrl ? <img className="an-act-wordmark__image" src={logoUrl} alt={logoAlt} /> : null}
      <span className="an-act-wordmark__text">{AN_ACT_WORDMARK}</span>
    </span>
  );
}
