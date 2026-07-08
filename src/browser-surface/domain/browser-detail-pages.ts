export interface BrowserSurfaceCatalogEntry {
  href: string;
  label: string;
  group: "catalog" | "contract" | "request" | "escrow" | "evidence" | "execution" | "dispute" | "provider" | "trust";
}

export const BROWSER_SURFACE_CATALOG: BrowserSurfaceCatalogEntry[] = [
  { href: "/browse", label: "Browser Surface Catalog", group: "catalog" },
  { href: "/contracts/review", label: "Contract Review", group: "contract" },
  { href: "/requests/analysis", label: "Request Analysis", group: "request" },
  { href: "/requests/result", label: "Workflow Result", group: "request" },
  { href: "/escrow", label: "Escrow Overview", group: "escrow" },
  { href: "/escrow/history", label: "Escrow History", group: "escrow" },
  { href: "/evidence", label: "Evidence Overview", group: "evidence" },
  { href: "/evidence/details", label: "Evidence Details", group: "evidence" },
  { href: "/evidence/attestations", label: "Attestation Timeline", group: "evidence" },
  { href: "/execution/milestones", label: "Milestone Details", group: "execution" },
  { href: "/disputes/details", label: "Dispute Details", group: "dispute" },
  { href: "/disputes/resolution", label: "Resolution Timeline", group: "dispute" },
  { href: "/provider/profile", label: "Provider Profile", group: "provider" },
  { href: "/trust/report", label: "Provider Trust Report", group: "trust" },
  { href: "/trust/timeline", label: "Trust Timeline", group: "trust" },
];

export function renderBrowserSurfaceCatalog(): string {
  const groups = [...new Set(BROWSER_SURFACE_CATALOG.map((entry) => entry.group))];
  const sections = groups
    .map((group) => {
      const items = BROWSER_SURFACE_CATALOG.filter((entry) => entry.group === group)
        .map((entry) => `<li><a href="${entry.href}" data-surface="html">${entry.label}</a></li>`)
        .join("\n");

      return [
        `<section data-region="browser-catalog-${group}">`,
        `<h2>${group.replace("_", " ")}</h2>`,
        `<ul>`,
        items,
        `</ul>`,
        `</section>`,
      ].join("\n");
    })
    .join("\n");

  return [
    `<section data-page="browser-surface-catalog">`,
    `<h1>Browser Surface Catalog</h1>`,
    `<p>Complete APP13 browser HTML route index for workflow detail and drill-down pages.</p>`,
    sections,
    `</section>`,
  ].join("\n");
}

export function renderDetailCrossLinks(): string {
  return [
    `<nav data-region="browser-detail-links">`,
    `<ul>`,
    `<li><a href="/browse" data-surface="html">Full browser catalog</a></li>`,
    `<li><a href="/contracts/review" data-surface="html">Contract review</a></li>`,
    `<li><a href="/escrow" data-surface="html">Escrow overview</a></li>`,
    `<li><a href="/evidence" data-surface="html">Evidence overview</a></li>`,
    `</ul>`,
    `</nav>`,
  ].join("\n");
}

export function collectBrowserDetailPaths(): string[] {
  return [
    "docs/experience/X35-Browser-Detail-And-Workflow-Routes.md",
    "src/browser-surface/domain/browser-detail-fixtures.ts",
    "src/browser-surface/domain/browser-detail-pages.ts",
    "test/x35-browser-detail-routes.test.ts",
    "scripts/verify-x35.sh",
  ];
}
