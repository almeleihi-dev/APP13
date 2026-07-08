import { LaunchScene } from "./LaunchScene.js";

/** Non-null placeholder while redirecting returning users or loading platform shell. */
export function LaunchRedirectShell() {
  return (
    <LaunchScene className="launch-redirect-shell" aria-hidden="true">
      <div className="launch-redirect-shell__pulse" />
    </LaunchScene>
  );
}
