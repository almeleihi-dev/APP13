import {
  ThemeProvider,
  AnActWordmark,
  AnActBrandLoading,
} from "@an-act/runtime-ui/react";
import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface LoginPageProps {
  onRegister?: () => void;
  onRegisterProvider?: () => void;
}

export function LoginPage({ onRegister, onRegisterProvider }: LoginPageProps) {
  const { login, loading, error } = useRuntime();
  const [email, setEmail] = useState("customer.demo@anact.local");
  const [password, setPassword] = useState("demo-password-123");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  return (
    <ThemeProvider mode="need">
      <div className="an-act-login-shell">
        <div className="an-act-login-panel">
          <div style={{ display: "grid", gap: "8px", justifyItems: "start" }}>
            <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
            <span className="an-act-product-name">{AN_ACT_BRAND.productName}</span>
          </div>
          <p style={{ margin: 0, color: "var(--an-act-color-text-secondary)" }}>
            Runtime JSON login — server authoritative
          </p>
          {loading ? <AnActBrandLoading stageText="Signing in..." compact /> : null}
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--an-act-spacing-space-16)" }}>
            <label className="an-act-field">
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </label>
            <label className="an-act-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="an-act-button an-act-button--primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            {error ? (
              <p role="alert" style={{ margin: 0, color: "var(--an-act-color-status-error)" }}>
                <strong>{error.title}</strong>: {error.detail}
              </p>
            ) : null}
          </form>
          {onRegister ? (
            <button type="button" className="an-act-button an-act-button--ghost" onClick={onRegister}>
              Create a customer account
            </button>
          ) : null}
          {onRegisterProvider ? (
            <button type="button" className="an-act-button an-act-button--ghost" onClick={onRegisterProvider}>
              Register as a provider
            </button>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
}
