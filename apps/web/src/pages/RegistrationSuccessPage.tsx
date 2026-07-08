import { ThemeProvider, AnActWordmark, PremiumButton, PremiumCard } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface RegistrationSuccessPageProps {
  onContinue: () => void;
}

export function RegistrationSuccessPage({ onContinue }: RegistrationSuccessPageProps) {
  const { loading } = useRuntime();

  return (
    <ThemeProvider mode="need">
      <div className="premium-console an-act-login-shell">
        <div className="premium-console__ambient" aria-hidden="true" />
        <div className="premium-console an-act-login-panel">
        <div className="premium-console__ambient" aria-hidden="true" />
          <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
            <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
            <span className="an-act-product-name">{AN_ACT_BRAND.productName}</span>
          </div>
          <PremiumCard role="status">
            <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Account created</h1>
            <p className="premium-console__hint" style={{ margin: 0 }}>
              Your session is active. Continue to start your first Need experience.
            </p>
          </PremiumCard>
          <PremiumButton variant="primary" disabled={loading} onClick={onContinue}>
            {loading ? "Loading..." : "Continue to AN ACT"}
          </PremiumButton>
        </div>
      </div>
    </ThemeProvider>
  );
}
