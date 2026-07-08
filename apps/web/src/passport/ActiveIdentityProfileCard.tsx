import type { ActivePersonalIdentity } from "./personal-identity.js";

export interface ActiveIdentityProfileCardProps {
  identity: ActivePersonalIdentity;
  className?: string;
  compact?: boolean;
}

export function ActiveIdentityProfileCard({
  identity,
  className = "",
  compact = false,
}: ActiveIdentityProfileCardProps) {
  return (
    <article
      className={`an-act-identity-card ${compact ? "an-act-identity-card--compact" : ""} ${className}`.trim()}
      aria-label="Active professional identity"
    >
      <div className="an-act-identity-card__avatar" aria-hidden={Boolean(identity.photoUrl)}>
        {identity.photoUrl ? (
          <img src={identity.photoUrl} alt="" className="an-act-identity-card__photo" />
        ) : (
          identity.avatarInitials
        )}
      </div>
      <div className="an-act-identity-card__body">
        <p className="an-act-identity-card__eyebrow">Active identity</p>
        <h3 className="an-act-identity-card__name">{identity.fullName}</h3>
        <p className="an-act-identity-card__title">{identity.professionalTitle}</p>
        {!compact ? (
          <p className="an-act-identity-card__meta">
            {identity.classification} · {identity.mainSkill || "General domain"}
          </p>
        ) : null}
      </div>
      <span
        className={`an-act-identity-card__live-frame an-act-identity-card__live-frame--${identity.liveFrameTier.toLowerCase()} an-act-sig-live-frame an-act-sig-live-frame--${identity.liveFrameTier.toLowerCase()}`}
      >
        Live Frame · {identity.liveFrameTier}
      </span>
    </article>
  );
}
