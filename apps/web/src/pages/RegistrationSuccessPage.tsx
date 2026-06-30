import { ThemeProvider, AnActWordmark } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface RegistrationSuccessPageProps {
  onContinue: () => void;
}

export function RegistrationSuccessPage({ onContinue }: RegistrationSuccessPageProps) {
  const { loading } = useRuntime();

  return (
    <ThemeProvider mode="need">
      <div className="an-act-login-shell">
        <div className="an-act-login-panel">
          <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
            <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
            <span className="an-act-product-name">{AN_ACT_BRAND.productName}</span>
          </div>
          <div className="an-act-card" role="status" style={{ display: "grid", gap: "var(--an-act-spacing-space-12)" }}>
            <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Account created</h1>
            <p style={{ margin: 0, color: "var(--an-act-color-text-secondary)" }}>
              Your session is active. Continue to start your first Need experience.
            </p>
          </div>
          <button
            type="button"
            className="an-act-button an-act-button--primary"
            disabled={loading}
            onClick={onContinue}
          >
            {loading ? "Loading..." : "Continue to AN ACT"}
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}
