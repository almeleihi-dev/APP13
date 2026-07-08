import React, { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

export interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "md" | "lg";
  block?: boolean;
}

export function PremiumButton({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  children,
  ...rest
}: PremiumButtonProps) {
  return (
    <button
      type={type}
      className={`premium-btn premium-btn--${variant}${size === "lg" ? " premium-btn--lg" : ""}${block ? " premium-btn--block" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface PremiumCardProps extends HTMLAttributes<HTMLElement> {
  interactive?: boolean;
  featured?: boolean;
  as?: "article" | "div" | "section" | "li";
}

export function PremiumCard({
  interactive = false,
  featured = false,
  as: Tag = "article",
  className = "",
  children,
  ...rest
}: PremiumCardProps) {
  return (
    <Tag
      className={`premium-card${interactive ? " premium-card--interactive" : ""}${featured ? " premium-card--featured" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export interface PremiumHeroProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function PremiumHero({ className = "", children, ...rest }: PremiumHeroProps) {
  return (
    <header className={`premium-hero ${className}`.trim()} {...rest}>
      <div className="premium-hero__glow" aria-hidden="true" />
      {children}
    </header>
  );
}

export interface PremiumStatProps {
  value: string;
  label: string;
  /** Subtle alive indicator — presentation only, deterministic values. */
  live?: boolean;
}

export function PremiumStat({ value, label, live = false }: PremiumStatProps) {
  return (
    <div className={`premium-stat${live ? " premium-stat--live" : ""}`}>
      {live ? <span className="premium-stat__pulse" aria-hidden="true" /> : null}
      <span className="premium-stat__value">{value}</span>
      <span className="premium-stat__label">{label}</span>
    </div>
  );
}

export interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  verified?: boolean;
}

export function PremiumBadge({ verified = false, className = "", children, ...rest }: PremiumBadgeProps) {
  return (
    <span className={`premium-badge${verified ? " premium-badge--verified" : ""} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

export function PremiumSurface({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`premium-surface ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function PremiumGlassPanel({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`premium-glass-panel ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
