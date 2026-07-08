/**
 * AN ACT Chapter 11 — Unified Premium Operator Console
 * Presentation-only primitives extending Phase 12/13 premium identity.
 */

import React, { type HTMLAttributes, type ReactNode } from "react";
import { AnActLogoKey } from "../../brand/AnActLogoKey.js";
import { PremiumButton, PremiumCard, type PremiumButtonProps } from "./PremiumComponents.js";

export type ReadinessSignal = "green" | "amber" | "red";

export interface PremiumConsoleRootProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Dark graphite shell with ambient glow — same language as landing/auth. */
export function PremiumConsoleRoot({ className = "", children, ...rest }: PremiumConsoleRootProps) {
  return (
    <div className={`premium-console ${className}`.trim()} {...rest}>
      <div className="premium-console__ambient" aria-hidden="true" />
      <div className="premium-console__inner">{children}</div>
    </div>
  );
}

export interface PremiumConsoleHeaderProps {
  title: string;
  subtitle?: string;
  nav?: ReactNode;
}

export function PremiumConsoleHeader({ title, subtitle, nav }: PremiumConsoleHeaderProps) {
  return (
    <header className="premium-console__header">
      <AnActLogoKey size="sm" />
      <div className="premium-console__headline">
        <h1 className="premium-console__title">{title}</h1>
        {subtitle ? <p className="premium-console__subtitle">{subtitle}</p> : null}
      </div>
      {nav ? (
        <nav className="premium-console__nav" aria-label="Console navigation">
          {nav}
        </nav>
      ) : null}
    </header>
  );
}

export interface PremiumReadinessBadgeProps {
  signal: ReadinessSignal;
  label: string;
}

export function PremiumReadinessBadge({ signal, label }: PremiumReadinessBadgeProps) {
  return <span className={`premium-console-badge premium-console-badge--${signal}`}>{label}</span>;
}

export interface PremiumScoreHeroProps {
  score: number | string;
  label: string;
  signal?: ReadinessSignal;
  trailing?: ReactNode;
}

export function PremiumScoreHero({ score, label, signal, trailing }: PremiumScoreHeroProps) {
  return (
    <PremiumCard className="premium-console-hero">
      <div>
        <p className="premium-console__score">{score}</p>
        <p className="premium-console__score-label">{label}</p>
      </div>
      {signal ? <PremiumReadinessBadge signal={signal} label={signal} /> : null}
      {trailing}
    </PremiumCard>
  );
}

export interface PremiumSectionTitleProps {
  id?: string;
  children: ReactNode;
}

export function PremiumSectionTitle({ id, children }: PremiumSectionTitleProps) {
  return (
    <h2 id={id} className="premium-console__section-title">
      {children}
    </h2>
  );
}

export function PremiumConsoleGrid({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`premium-console__grid ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function PremiumConsoleSplit({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`premium-console__split ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function PremiumConsoleHint({ children }: { children: ReactNode }) {
  return <p className="premium-console__hint">{children}</p>;
}

export function PremiumConsoleMetric({ children }: { children: ReactNode }) {
  return <p className="premium-console__metric">{children}</p>;
}

export { PremiumButton, PremiumCard };
export type { PremiumButtonProps };
