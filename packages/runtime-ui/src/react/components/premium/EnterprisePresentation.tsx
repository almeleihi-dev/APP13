import type { HTMLAttributes } from "react";

export interface ProfessionalPassportData {
  providerName: string;
  serviceName: string;
  summary: string;
  rating: string;
  certifications: readonly string[] | string[];
  liveFrameTier: string;
  avatarInitials?: string;
  photoUrl?: string;
}

/** Static presentation copy — used when no live profile is available. */
const PASSPORT_PREVIEW_DEFAULT: ProfessionalPassportData = {
  providerName: "Your Professional Identity",
  serviceName: "Professional Title",
  summary: "Complete your passport to activate your professional operating surface.",
  rating: "—",
  certifications: ["Identity Pending", "Live Frame Pending"],
  liveFrameTier: "Silver",
};

const MARKETPLACE_STEPS = [
  { step: "Professional Requirement", body: "Customer defines the professional requirement." },
  { step: "Discovery", body: "Verified opportunities surface with Live Frame badges." },
  { step: "Request", body: "Verified Professional Passport preview before commitment." },
  { step: "Trusted Contract", body: "Authoritative contract surfaces for review." },
  { step: "Professional Action", body: "Live Frame–monitored execution to completion." },
] as const;

export type PremiumEntryBadgeKind = "live" | "demo" | "executive" | "partner";

const ENTRY_BADGE_LABELS: Record<PremiumEntryBadgeKind, string> = {
  live: "LIVE",
  demo: "DEMO",
  executive: "EXECUTIVE",
  partner: "PARTNER",
};

export interface PremiumEntryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  kind: PremiumEntryBadgeKind;
}

export function PremiumEntryBadge({ kind, className = "", ...rest }: PremiumEntryBadgeProps) {
  return (
    <span className={`p13-entry-badge p13-entry-badge--${kind} ${className}`.trim()} {...rest}>
      {ENTRY_BADGE_LABELS[kind]}
    </span>
  );
}

export interface PremiumLiveIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function PremiumLiveIndicator({
  label = "Runtime active",
  className = "",
  ...rest
}: PremiumLiveIndicatorProps) {
  return (
    <div className={`p13-live-status ${className}`.trim()} role="status" {...rest}>
      <span className="p13-live-status__dot" aria-hidden="true" />
      <span className="p13-live-status__label">{label}</span>
    </div>
  );
}

export function ProfessionalPassportMiniPreview({
  className = "",
  profile,
}: {
  className?: string;
  profile?: ProfessionalPassportData;
}) {
  const data = profile ?? PASSPORT_PREVIEW_DEFAULT;
  const initials =
    profile?.avatarInitials ??
    (data.providerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AN");

  return (
    <article
      className={`p13-passport-preview premium-card premium-card--featured ${className}`.trim()}
      aria-label="Verified professional passport preview"
    >
      <div className="p13-passport-preview__header">
        <div className="p13-passport-preview__avatar" aria-hidden={Boolean(data.photoUrl)}>
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt=""
              className="p13-passport-preview__photo"
            />
          ) : (
            initials
          )}
        </div>
        <div className="p13-passport-preview__identity">
          <p className="p13-passport-preview__eyebrow">Verified Professional Passport</p>
          <h3 className="p13-passport-preview__name">{data.providerName}</h3>
          <p className="p13-passport-preview__service">{data.serviceName}</p>
        </div>
        <span className={`p13-passport-preview__tier p13-passport-preview__tier--${data.liveFrameTier.toLowerCase()}`}>
          Live Frame · {data.liveFrameTier}
        </span>
      </div>
      <p className="p13-passport-preview__summary">{data.summary}</p>
      <div className="p13-passport-preview__footer">
        <span className="p13-passport-preview__rating" aria-label={`Rating ${data.rating}`}>
          {data.rating === "New" || data.rating === "—" ? data.rating : `★ ${data.rating}`}
        </span>
        <ul className="p13-passport-preview__certs" aria-label="Certifications">
          {data.certifications.map((cert) => (
            <li key={cert}>{cert}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function PremiumMarketplaceFlow({ className = "" }: { className?: string }) {
  return (
    <ol className={`p13-marketplace-flow ${className}`.trim()} aria-label="Marketplace journey">
      {MARKETPLACE_STEPS.map((item, index) => (
        <li key={item.step} className="p13-marketplace-flow__step">
          <div className="p13-marketplace-flow__marker" aria-hidden="true">
            <span className="p13-marketplace-flow__index">{index + 1}</span>
            {index < MARKETPLACE_STEPS.length - 1 ? (
              <span className="p13-marketplace-flow__connector" />
            ) : null}
          </div>
          <div className="p13-marketplace-flow__content">
            <h3 className="p13-marketplace-flow__title">{item.step}</h3>
            <p className="p13-marketplace-flow__body">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
