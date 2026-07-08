import { useCallback, useEffect, useState } from "react";

function readInitialPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

export function usePathname(): string {
  const [pathname, setPathname] = useState(readInitialPathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
}

export function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateReplace(path: string): void {
  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function isLaunchPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/guest" ||
    pathname === "/guest/demo" ||
    pathname === "/start" ||
    pathname === "/preview"
  );
}

export function isHomePath(pathname: string): boolean {
  return pathname === "/home";
}

export const LAUNCH_ACT_DRAFT_KEY = "an-act-launch-act-draft";

export type LaunchInputIntent = "goal" | "profession";

export interface LaunchActDraft {
  method: "voice" | "file" | "write";
  summary: string;
  completedAt: string;
  inputIntent: LaunchInputIntent;
  fileName?: string;
  evidenceNote?: string;
}

export function saveLaunchActDraft(draft: LaunchActDraft): void {
  sessionStorage.setItem(LAUNCH_ACT_DRAFT_KEY, JSON.stringify(draft));
}

export function readLaunchActDraft(): LaunchActDraft | null {
  try {
    const raw = sessionStorage.getItem(LAUNCH_ACT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LaunchActDraft;
  } catch {
    return null;
  }
}

export function useLaunchNavigate() {
  return useCallback((path: string) => navigate(path), []);
}
