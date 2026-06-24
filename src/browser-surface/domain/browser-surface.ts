export interface BrowserNavLink {
  href: string;
  label: string;
  kind: "html" | "json_api";
}

export interface OperatorExperienceLink {
  href: string;
  label: string;
  layer: string;
}

export const BROWSER_SURFACE_ROUTES = [
  "/",
  "/operator/dashboard",
  "/marketplace",
  "/login",
  "/home",
  "/contracts",
  "/marketplace/results",
  "/provider",
  "/customer",
  "/execution/dashboard",
  "/trust/center",
  "/disputes/dashboard",
  "/browse",
  "/contracts/review",
  "/requests/analysis",
  "/requests/result",
  "/escrow",
  "/escrow/history",
  "/evidence",
  "/evidence/details",
  "/evidence/attestations",
  "/execution/milestones",
  "/disputes/details",
  "/disputes/resolution",
  "/provider/profile",
  "/trust/report",
  "/trust/timeline",
] as const;

export const BROWSER_ENTRY_ROUTES = ["/marketplace", "/login"] as const;

export const BROWSER_HUB_ROUTES = [
  "/home",
  "/contracts",
  "/marketplace/results",
  "/provider",
  "/customer",
  "/execution/dashboard",
  "/trust/center",
  "/disputes/dashboard",
] as const;

export const BROWSER_DETAIL_ROUTES = [
  "/browse",
  "/contracts/review",
  "/requests/analysis",
  "/requests/result",
  "/escrow",
  "/escrow/history",
  "/evidence",
  "/evidence/details",
  "/evidence/attestations",
  "/execution/milestones",
  "/disputes/details",
  "/disputes/resolution",
  "/provider/profile",
  "/trust/report",
  "/trust/timeline",
] as const;

export const BROWSER_SURFACE_ROUTE_CONFIG = {
  authRequired: false,
  authenticate: false,
} as const;

export const BROWSER_NAV_LINKS: BrowserNavLink[] = [
  { href: "/", label: "Platform Home", kind: "html" },
  { href: "/home", label: "Home Hub", kind: "html" },
  { href: "/marketplace", label: "Marketplace", kind: "html" },
  { href: "/contracts", label: "Contracts", kind: "html" },
  { href: "/browse", label: "Browse All", kind: "html" },
  { href: "/provider", label: "Provider", kind: "html" },
  { href: "/customer", label: "Customer", kind: "html" },
  { href: "/login", label: "Sign In", kind: "html" },
  { href: "/operator/dashboard", label: "Operator Dashboard", kind: "html" },
];

export const OPERATOR_EXPERIENCE_LINKS: OperatorExperienceLink[] = [
  {
    href: "/executive-ux-readiness",
    label: "Executive UX Readiness",
    layer: "X31",
  },
  {
    href: "/business-intelligence",
    label: "Business Intelligence",
    layer: "X30",
  },
  {
    href: "/post-launch-monitoring",
    label: "Post-Launch Monitoring",
    layer: "X29",
  },
  {
    href: "/launch-control",
    label: "Launch Control",
    layer: "X28",
  },
];

export function renderBrowserNav(activePath: string): string {
  const items = BROWSER_NAV_LINKS.map((link) => {
    const active = link.href === activePath ? ' aria-current="page"' : "";
    return `<li><a href="${link.href}" data-surface="${link.kind}"${active}>${link.label}</a></li>`;
  }).join("\n");

  return [
    `<nav data-region="browser-nav">`,
    `<ul>`,
    items,
    `</ul>`,
    `</nav>`,
  ].join("\n");
}

export function renderOperatorExperienceLinks(): string {
  const items = OPERATOR_EXPERIENCE_LINKS.map(
    (link) =>
      `<li><a href="${link.href}" data-layer="${link.layer}" data-surface="json_api">${link.layer} ${link.label}</a></li>`
  ).join("\n");

  return [
    `<section data-region="operator-experience-links">`,
    `<h2>Operator Experience Centers</h2>`,
    `<p>Authenticated JSON endpoints for platform_admin operators.</p>`,
    `<ul>`,
    items,
    `</ul>`,
    `</section>`,
  ].join("\n");
}

export function renderLoginSurfacePage(): string {
  return [
    `<section data-page="login-surface">`,
    `<h1>Sign In</h1>`,
    `<p>Use your APP13 credentials to access authenticated JSON experience centers and role dashboards.</p>`,
    `<form data-action="login-surface" method="post" action="/v1/auth/login">`,
    `<label for="email">Email</label>`,
    `<input id="email" name="email" type="email" autocomplete="username" required />`,
    `<label for="password">Password</label>`,
    `<input id="password" name="password" type="password" autocomplete="current-password" required />`,
    `<button type="submit">Sign In</button>`,
    `</form>`,
    `<p><a href="/">Return to platform home</a></p>`,
    `</section>`,
  ].join("\n");
}

export function buildBrowserDocumentHtml(input: {
  title: string;
  body: string;
  activePath: string;
}): string {
  return [
    "<!DOCTYPE html>",
    `<html lang="en">`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${input.title}</title>`,
    `<link rel="stylesheet" href="/browser/app.css">`,
    `<link rel="icon" href="/browser/favicon.svg" type="image/svg+xml">`,
    `<link rel="manifest" href="/browser/manifest.webmanifest">`,
    `</head>`,
    `<body data-browser-surface="app13">`,
    `<header data-region="browser-header">`,
    `<h1>APP13</h1>`,
    renderBrowserNav(input.activePath),
    `</header>`,
    `<main data-region="browser-main">`,
    input.body,
    `</main>`,
    `</body>`,
    `</html>`,
  ].join("\n");
}

export function collectBrowserSurfacePaths(): string[] {
  return [
    "docs/experience/X32-Browser-Surface-Wiring.md",
    "docs/experience/X33-Browser-Entry-And-Static-Delivery.md",
    "docs/experience/X34-Browser-Hub-And-Journey-Routes.md",
    "docs/experience/X35-Browser-Detail-And-Workflow-Routes.md",
    "src/api/routes/browser-surface.ts",
    "src/browser-surface/module.ts",
    "test/x32-browser-surface.test.ts",
    "test/x33-browser-entry-static.test.ts",
    "test/x34-browser-hub-routes.test.ts",
    "test/x35-browser-detail-routes.test.ts",
    "scripts/verify-x32.sh",
    "scripts/verify-x33.sh",
    "scripts/verify-x34.sh",
    "scripts/verify-x35.sh",
    ".dependency-cruiser.cjs",
  ];
}

export function collectBrowserHubPaths(): string[] {
  return [
    "docs/experience/X34-Browser-Hub-And-Journey-Routes.md",
    "src/browser-surface/domain/browser-hub-fixtures.ts",
    "src/browser-surface/domain/browser-hub-pages.ts",
    "test/x34-browser-hub-routes.test.ts",
    "scripts/verify-x34.sh",
  ];
}
