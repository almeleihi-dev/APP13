import {
  ThemeProvider,
  AnActWordmark,
  AnActBrandLoading,
} from "@an-act/runtime-ui/react";
import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface RegisterProviderPageProps {
  onLogin: () => void;
  onSuccess: () => void;
}

export function RegisterProviderPage({ onLogin, onSuccess }: RegisterProviderPageProps) {
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
      <div className="an-act-login-shell">
        <div className="an-act-login-panel">
          <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
            <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
            <span className="an-act-product-name">{AN_ACT_BRAND.productName} — Provider</span>
          </div>
          <p style={{ margin: 0, color: "var(--an-act-color-text-secondary)" }}>
            Register as a professional — validation is server authoritative
          </p>
          {loading ? <AnActBrandLoading stageText="Creating provider account..." compact /> : null}
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--an-act-spacing-space-16)" }}>
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
            <button type="submit" className="an-act-button an-act-button--primary" disabled={loading}>
              {loading ? "Creating account..." : "Create provider account"}
            </button>
            {error ? (
              <p role="alert" style={{ margin: 0, color: "var(--an-act-color-status-error)" }}>
                <strong>{error.title}</strong>: {error.detail}
              </p>
            ) : null}
          </form>
          <button type="button" className="an-act-button an-act-button--ghost" onClick={onLogin}>
            Sign in instead
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}
