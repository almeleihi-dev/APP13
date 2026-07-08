import type { ActivePersonalIdentity } from "./personal-identity.js";

export interface PlatformIdentityNavChipProps {
  identity: ActivePersonalIdentity;
  className?: string;
}

export function PlatformIdentityNavChip({ identity, className = "" }: PlatformIdentityNavChipProps) {
  return (
    <div className={`an-act-identity-nav ${className}`.trim()} aria-label="Platform owner identity">
      <div className="an-act-identity-nav__avatar" aria-hidden={Boolean(identity.photoUrl)}>
        {identity.photoUrl ? (
          <img src={identity.photoUrl} alt="" className="an-act-identity-nav__photo" />
        ) : (
          identity.avatarInitials
        )}
      </div>
      <div className="an-act-identity-nav__copy">
        <p className="an-act-identity-nav__name">{identity.fullName}</p>
        <p className="an-act-identity-nav__title">{identity.professionalTitle}</p>
      </div>
      <span
        className={`an-act-identity-nav__tier an-act-identity-nav__tier--${identity.liveFrameTier.toLowerCase()} an-act-sig-live-frame an-act-sig-live-frame--${identity.liveFrameTier.toLowerCase()}`}
      >
        Live Frame · {identity.liveFrameTier}
      </span>
    </div>
  );
}
