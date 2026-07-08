import type { ReactNode } from "react";

export interface LaunchSceneProps {
  children: ReactNode;
  className?: string;
}

/** Unified GM lighting stack — graphite, carbon depth, ambient green, vignette. */
export function LaunchScene({ children, className = "" }: LaunchSceneProps) {
  return (
    <div className={`launch-gm launch-v1 an-act-signature-s2${className ? ` ${className}` : ""}`}>
      <div className="launch-gm__carbon" aria-hidden="true" />
      <div className="launch-gm__graphite" aria-hidden="true" />
      <div className="launch-gm__ambient-green" aria-hidden="true" />
      <div className="launch-gm__reflection" aria-hidden="true" />
      <div className="launch-gm__vignette" aria-hidden="true" />
      <div className="an-act-sig-meridian-sweep" aria-hidden="true" />
      {children}
    </div>
  );
}
