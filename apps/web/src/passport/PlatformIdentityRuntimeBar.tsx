import type { ActivePersonalIdentity } from "./personal-identity.js";
import { personalRuntimeOwnerLabel } from "./personal-identity.js";

export interface PlatformIdentityRuntimeBarProps {
  identity: ActivePersonalIdentity;
}

export function PlatformIdentityRuntimeBar({ identity }: PlatformIdentityRuntimeBarProps) {
  return (
    <div className="an-act-identity-runtime-bar" role="status" aria-label="Platform owner">
      <div className="an-act-identity-runtime-bar__avatar" aria-hidden={Boolean(identity.photoUrl)}>
        {identity.photoUrl ? (
          <img src={identity.photoUrl} alt="" className="an-act-identity-runtime-bar__photo" />
        ) : (
          identity.avatarInitials
        )}
      </div>
      <div className="an-act-identity-runtime-bar__copy">
        <p className="an-act-identity-runtime-bar__owner">{personalRuntimeOwnerLabel(identity)}</p>
        <p className="an-act-identity-runtime-bar__meta">
          {identity.professionalTitle} · Live Frame · {identity.liveFrameTier}
        </p>
      </div>
    </div>
  );
}
