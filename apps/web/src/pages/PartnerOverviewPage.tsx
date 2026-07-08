import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface PartnerOverviewPageProps {
  onExit: () => void;
  onEnterPlatform: () => void;
}

const PARTNER_SECTIONS = [
  {
    title: "Technical overview",
    summary:
      "Modular monolith with Runtime JSON experiences, Render Layer web shell, and 50+ intelligence engines. TypeScript throughout; Fastify API; PostgreSQL persistence.",
    doc: "docs/partner/Technical-Overview.md",
  },
  {
    title: "Deployment overview",
    summary:
      "Platform kernel builds via npm; web shell via Vite; verification gates per release candidate. PWA-ready with service worker caching.",
    doc: "docs/partner/Deployment-Overview.md",
  },
  {
    title: "Security overview",
    summary:
      "JWT authentication, refresh rotation, server-authoritative validation, audit logging, and role-based access across experience APIs.",
    doc: "docs/partner/Security-Overview.md",
  },
  {
    title: "Architecture summary",
    summary:
      "Render Layer consumes Runtime JSON. Runtime Client handles transport only. Backend business logic remains in experience services.",
    doc: "docs/partner/Architecture-Summary.md",
  },
  {
    title: "Business model summary",
    summary:
      "Marketplace connecting professional need with trusted action. Provider onboarding, contract lifecycle, and intelligence-driven matching.",
    doc: "docs/partner/Business-Model-Summary.md",
  },
];

export function PartnerOverviewPage({ onExit, onEnterPlatform }: PartnerOverviewPageProps) {
  return (
    <ThemeProvider mode="need">
      <div className="premium-console an-act-partner-overview">
        <div className="premium-console__ambient" aria-hidden="true" />
        <header className="an-act-partner-landing__hero">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <h1>Partner package</h1>
          <p className="an-act-partner-landing__lead">
            Technical, security, and business materials for strategic partner evaluation.
          </p>
          <div className="premium-console an-act-partner-cta">
        <div className="premium-console__ambient" aria-hidden="true" />
            <PremiumButton variant="primary" onClick={onEnterPlatform}>
              Enter live platform
            </PremiumButton>
            <PremiumButton variant="ghost" onClick={onExit}>
              Back to landing
            </PremiumButton>
          </div>
        </header>

        {PARTNER_SECTIONS.map((section) => (
          <article key={section.title} className="an-act-card an-act-partner-section">
            <h2>{section.title}</h2>
            <p>{section.summary}</p>
            <p className="an-act-partner-doc-ref">
              Full document: <code>{section.doc}</code>
            </p>
          </article>
        ))}
      </div>
    </ThemeProvider>
  );
}
