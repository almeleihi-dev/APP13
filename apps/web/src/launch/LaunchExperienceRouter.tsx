import { useEffect } from "react";
import { LaunchSplashPage } from "./LaunchSplashPage.js";
import { GuestEntryPage } from "./GuestEntryPage.js";
import { GuestDemoPage } from "./GuestDemoPage.js";
import { ActBuilderPage } from "./ActBuilderPage.js";
import { ActPreviewPage } from "./ActPreviewPage.js";
import { isLaunchOnboardingActive } from "./launch-persistence.js";
import { isGuestMode } from "../guest/guest-session.js";
import { navigateReplace, usePathname } from "./navigation.js";

export function isGuestExperiencePath(pathname: string): boolean {
  return (
    pathname === "/guest" ||
    pathname === "/guest/demo" ||
    pathname === "/start" ||
    pathname === "/preview"
  );
}

function useLaunchOnboardingGuard(pathname: string): void {
  useEffect(() => {
    if (pathname === "/") return;
    if (isGuestMode() && isGuestExperiencePath(pathname)) return;
    if (isLaunchOnboardingActive()) return;
    navigateReplace("/");
  }, [pathname]);
}

export function LaunchExperienceRouter() {
  const pathname = usePathname();
  useLaunchOnboardingGuard(pathname);

  let page = <LaunchSplashPage />;
  if (pathname === "/guest") page = <GuestEntryPage />;
  if (pathname === "/guest/demo") page = <GuestDemoPage />;
  if (pathname === "/start") page = <ActBuilderPage />;
  if (pathname === "/preview") page = <ActPreviewPage />;

  return (
    <div className="launch-router an-act-excellence-s1 an-act-signature-s2">
      <div key={pathname} className="launch-router__page">
        {page}
      </div>
    </div>
  );
}
