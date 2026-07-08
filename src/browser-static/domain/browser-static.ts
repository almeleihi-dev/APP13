export const BROWSER_STATIC_PREFIX = "/browser/";

export interface BrowserStaticAsset {
  fileName: string;
  routePath: string;
  contentType: string;
}

export const BROWSER_STATIC_ASSETS: BrowserStaticAsset[] = [
  {
    fileName: "app.css",
    routePath: "/browser/app.css",
    contentType: "text/css; charset=utf-8",
  },
  {
    fileName: "favicon.svg",
    routePath: "/browser/favicon.svg",
    contentType: "image/svg+xml",
  },
  {
    fileName: "manifest.webmanifest",
    routePath: "/browser/manifest.webmanifest",
    contentType: "application/manifest+json; charset=utf-8",
  },
];

export const BROWSER_STATIC_ROUTE_CONFIG = {
  authRequired: false,
  authenticate: false,
} as const;

export function isBrowserStaticPath(pathname: string): boolean {
  return pathname === BROWSER_STATIC_PREFIX || pathname.startsWith(BROWSER_STATIC_PREFIX);
}

export function collectBrowserStaticPaths(): string[] {
  return [
    "docs/experience/X33-Browser-Entry-And-Static-Delivery.md",
    "src/api/routes/browser-static.ts",
    "src/browser-static/module.ts",
    "public/browser/app.css",
    "public/browser/favicon.svg",
    "public/browser/manifest.webmanifest",
    "test/x33-browser-entry-static.test.ts",
    "scripts/verify-x33.sh",
    ".dependency-cruiser.cjs",
  ];
}
