import {
  ThemeProvider,
  AnActLogoKey,
  PremiumButton,
  PremiumGlassPanel,
} from "@an-act/runtime-ui/react";
import { useState, type FormEvent } from "react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";
import { PresentationError } from "../components/PresentationError.js";

export interface LoginPageProps {
  onRegister?: () => void;
  onRegisterProvider?: () => void;
  onBackToLanding?: () => void;
}

export function LoginPage({ onRegister, onRegisterProvider, onBackToLanding }: LoginPageProps) {
  const { login, loading, error, sessionExpired } = useRuntime();
  const [email, setEmail] = useState("customer.demo@anact.local");
  const [password, setPassword] = useState("demo-password-123");
  const [remember, setRemember] = useState(true);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  return (
    <ThemeProvider mode="need">
      <div className="p12-auth">
        <div className="p12-auth__ambient" aria-hidden="true" />
        <PremiumGlassPanel className="p12-auth__card p12-lift-in">
          {onBackToLanding ? (
            <PremiumButton variant="ghost" block onClick={onBackToLanding}>
              Back to landing
            </PremiumButton>
          ) : null}
          <div style={{ display: "grid", gap: 12, justifyItems: "center", textAlign: "center" }}>
            <AnActLogoKey size="sm" />
            <h1 className="p12-landing__section-title" style={{ margin: 0, fontSize: "1.5rem" }}>
              Sign in
            </h1>
            <p className="ds-eyebrow" style={{ margin: 0, color: "var(--an-act-p12-ink-muted)" }}>
              {AN_ACT_BRAND.productName}
            </p>
          </div>
          <p style={{ margin: 0, textAlign: "center", color: "var(--an-act-p12-ink-muted)", fontSize: "0.9375rem" }}>
            Premium access to the authoritative runtime
          </p>

          {sessionExpired ? (
            <PresentationError
              title="Session expired"
              detail="Sign in again to continue your AN ACT journey."
            />
          ) : null}

          <div className="p12-auth__providers" aria-label="Social sign-in (presentation)">
            <button type="button" className="p12-auth__provider" disabled title="Presentation only">
              Continue with Apple
            </button>
            <button type="button" className="p12-auth__provider" disabled title="Presentation only">
              Continue with Google
            </button>
          </div>

          <div className="p12-auth__divider">or email</div>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }} aria-busy={loading}>
            <label className="p12-field">
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </label>
            <label className="p12-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="p12-auth__remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <PremiumButton type="submit" variant="primary" block disabled={loading} aria-busy={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </PremiumButton>
            {error ? (
              <PresentationError title={error.title} detail={error.detail} code={error.code} />
            ) : null}
          </form>
          {onRegister ? (
            <PremiumButton variant="ghost" block onClick={onRegister}>
              Create a customer account
            </PremiumButton>
          ) : null}
          {onRegisterProvider ? (
            <PremiumButton variant="ghost" block onClick={onRegisterProvider}>
              Register as a provider
            </PremiumButton>
          ) : null}
        </PremiumGlassPanel>
      </div>
    </ThemeProvider>
  );
}
