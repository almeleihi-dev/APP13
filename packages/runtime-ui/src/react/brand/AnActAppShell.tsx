import React, { type ReactNode } from "react";
import { AN_ACT_PRODUCT_NAME } from "@an-act/tokens";
import { AnActWordmark } from "./AnActWordmark.js";

export interface AnActAppShellProps {
  children: ReactNode;
  logoUrl?: string | null;
  modeLabel?: string;
  footer?: ReactNode;
}

export function AnActAppShell({ children, logoUrl, modeLabel, footer }: AnActAppShellProps) {
  return (
    <div className="an-act-app-shell">
      <header className="an-act-app-shell__header" role="banner">
        <AnActWordmark logoUrl={logoUrl} />
        {modeLabel ? <span className="an-act-product-name">{modeLabel}</span> : null}
      </header>
      <main className="an-act-app-shell__main">{children}</main>
      <footer className="an-act-app-shell__footer" role="contentinfo">
        {footer ?? AN_ACT_PRODUCT_NAME}
      </footer>
    </div>
  );
}
