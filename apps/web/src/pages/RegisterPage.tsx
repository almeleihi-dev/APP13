import {
  ThemeProvider,
  AnActWordmark,
  AnActBrandLoading,
} from "@an-act/runtime-ui/react";
import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface RegisterPageProps {
  onLogin: () => void;
  onSuccess: () => void;
}

export function RegisterPage({ onLogin, onSuccess }: RegisterPageProps) {
  const { register, loading, error } = useRuntime();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = await register({
      email: email.trim(),
      password,
      display_name: displayName.trim(),
    });
    if (ok) {
      onSuccess();
    }
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
            Create your account — validation is server authoritative
          </p>
          {loading ? <AnActBrandLoading stageText="Creating account..." compact /> : null}
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--an-act-spacing-space-16)" }}>
            <label className="an-act-field">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label className="an-act-field">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="an-act-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <button type="submit" className="an-act-button an-act-button--primary" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            {error ? (
              <p role="alert" style={{ margin: 0, color: "var(--an-act-color-status-error)" }}>
                <strong>{error.title}</strong>: {error.detail}
              </p>
            ) : null}
          </form>
          <button type="button" className="an-act-button an-act-button--ghost" onClick={onLogin}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}
