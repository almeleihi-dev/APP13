import { lazy, Suspense } from "react";
import { LaunchExperienceRouter } from "./launch/LaunchExperienceRouter.js";
import { LaunchRedirectShell } from "./launch/LaunchRedirectShell.js";
import { isLaunchPath, usePathname } from "./launch/navigation.js";

const PlatformApp = lazy(() =>
  import("./PlatformApp.js").then((module) => ({ default: module.PlatformApp }))
);

export function App() {
  const pathname = usePathname();

  if (isLaunchPath(pathname)) {
    return <LaunchExperienceRouter />;
  }

  return (
    <Suspense fallback={<LaunchRedirectShell />}>
      <PlatformApp />
    </Suspense>
  );
}
