import React, { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import {
  AN_ACT_TRANSITION_DURATION_MS,
  buildThemeCssVariables,
  resolveTheme,
  type ExperienceMode,
} from "@an-act/tokens";

export interface ThemeContextValue {
  mode: ExperienceMode;
  cssVariables: Record<string, string>;
  transitionDurationMs: number;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  mode: ExperienceMode;
  children: ReactNode;
  transitioning?: boolean;
}

export function ThemeProvider({ mode, children, transitioning = false }: ThemeProviderProps) {
  const resolvedMode = mode === "transition" ? "need" : mode;
  const cssVariables = buildThemeCssVariables(resolvedMode);
  const value: ThemeContextValue = {
    mode: resolvedMode,
    cssVariables,
    transitionDurationMs: AN_ACT_TRANSITION_DURATION_MS,
  };

  const style: CSSProperties = {
    ...value.cssVariables,
    backgroundColor: value.cssVariables["--an-act-color-background-primary"],
    color: value.cssVariables["--an-act-color-text-primary"],
    minHeight: "100vh",
    transition: transitioning
      ? `background-color ${AN_ACT_TRANSITION_DURATION_MS}ms var(--an-act-motion-emphasized-easing), color ${AN_ACT_TRANSITION_DURATION_MS}ms var(--an-act-motion-emphasized-easing)`
      : undefined,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="an-act-theme-root"
        data-an-act-mode={resolvedMode}
        data-an-act-transitioning={transitioning || undefined}
        style={style}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAnActTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAnActTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function useResolvedTheme(mode: ExperienceMode) {
  return resolveTheme(mode === "transition" ? "need" : mode);
}
