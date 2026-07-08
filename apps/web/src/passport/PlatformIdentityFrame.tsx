import type { ReactNode } from "react";
import { usePersonalIdentity } from "../passport/usePersonalIdentity.js";
import { PlatformIdentityNavChip } from "../passport/PlatformIdentityNavChip.js";

export interface OperatorConsoleIdentityRailProps {
  className?: string;
}

/** Shared identity rail for operator / executive console headers. */
export function OperatorConsoleIdentityRail({ className = "" }: OperatorConsoleIdentityRailProps) {
  const identity = usePersonalIdentity();
  if (!identity) return null;
  return (
    <div className={`an-act-operator-identity-rail ${className}`.trim()}>
      <PlatformIdentityNavChip identity={identity} />
    </div>
  );
}

export interface PlatformIdentityFrameProps {
  children: ReactNode;
}

/** Wraps platform experiences with active identity context when passport exists. */
export function PlatformIdentityFrame({ children }: PlatformIdentityFrameProps) {
  return children;
}
