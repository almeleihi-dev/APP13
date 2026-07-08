import { ThemeProvider, AnActWordmark, PremiumButton } from "@an-act/runtime-ui/react";
import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";
import { PresentationError } from "../components/PresentationError.js";

export interface RegisterProviderPageProps {
  onLogin: () => void;
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

export function RegisterProviderPage({ onLogin, onSuccess, onBackToLanding }: RegisterProviderPageProps) {
  const { registerProvider, loading, error } = useRuntime();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [primaryTrade, setPrimaryTrade] = useState("electrician");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = await registerProvider({
      email: email.trim(),
      password,
      display_name: displayName.trim(),
      business_name: businessName.trim(),
      primary_trade: primaryTrade.trim(),
    });
    if (ok) {
      onSuccess();
    }
  }

  return (
    <ThemeProvider mode="action">
      <div className="premium-console an-act-login-shell">
        <div className="premium-console__ambient" aria-hidden="true" />
        <div className="premium-console an-act-login-panel">
        <div className="premium-console__ambient" aria-hidden="true" />
          <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
            <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
            <span className="an-act-product-name">{AN_ACT_BRAND.productName} — Provider</span>
          </div>
          {onBackToLanding ? (
            <PremiumButton variant="ghost" onClick={onBackToLanding}>
              Back to landing
            </PremiumButton>
          ) : null}
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Register as a provider</h1>
          <p style={{ margin: 0, color: "var(--an-act-color-text-secondary)" }}>
            Register as a professional — validation is server authoritative
          </p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--an-act-spacing-space-16)" }} aria-busy={loading}>
            <label className="an-act-field">
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Business name
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Primary trade
              <input value={primaryTrade} onChange={(e) => setPrimaryTrade(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <PremiumButton type="submit" variant="primary" disabled={loading} aria-busy={loading}>
              {loading ? "Creating account..." : "Create provider account"}
            </PremiumButton>
            {error ? <PresentationError title={error.title} detail={error.detail} code={error.code} /> : null}
          </form>
          <PremiumButton variant="ghost" onClick={onLogin}>
            Sign in instead
          </PremiumButton>
        </div>
      </div>
    </ThemeProvider>
  );
}
