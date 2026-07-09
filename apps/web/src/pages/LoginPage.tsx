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
import { enableGuestMode } from "../guest/guest-session.js";
import { navigate } from "../launch/navigation.js";

export interface LoginPageProps {
  onRegister?: () => void;
  onRegisterProvider?: () => void;
  onBackToLanding?: () => void;
}

export function LoginPage({ onRegister, onRegisterProvider, onBackToLanding }: LoginPageProps) {
  const { login, loading, error, sessionExpired, client } = useRuntime();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  function continueAsGuest() {
    // Never trap a first user at auth. Guest = explore only; enable guest mode
    // and route to the guest experience. No fake identity, no demo login.
    enableGuestMode();
    navigate("/guest");
  }

  async function onRequestReset() {
    if (!email.trim()) {
      setRecovering(true);
      return;
    }
    try {
      await client.requestPasswordReset(email.trim());
    } catch {
      // Intentionally ignored — the endpoint always succeeds so we never reveal
      // whether an account exists. The confirmation message is shown regardless.
    }
    setResetSent(true);
  }

  return (
    <ThemeProvider mode="need">
      <div className="p12-auth">
        <div className="p12-auth__ambient" aria-hidden="true" />
        <PremiumGlassPanel className="p12-auth__card p12-lift-in">
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
            Sign in to your AN ACT account
          </p>

          {sessionExpired ? (
            <PresentationError
              title="Session expired"
              detail="Sign in again to continue your AN ACT journey."
            />
          ) : null}

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
            <div className="p12-auth__row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <label className="p12-auth__remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button
                type="button"
                className="launch-splash__login-link"
                style={{ margin: 0 }}
                onClick={() => void onRequestReset()}
              >
                Forgot password?
              </button>
            </div>
            <PremiumButton type="submit" variant="primary" block disabled={loading} aria-busy={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </PremiumButton>
            {resetSent ? (
              <p style={{ margin: 0, textAlign: "center", color: "var(--an-act-p12-ink-muted)", fontSize: "0.9rem" }} role="status">
                If an account exists for that email, a password reset link is on its way.
              </p>
            ) : recovering ? (
              <p style={{ margin: 0, textAlign: "center", color: "var(--an-act-p12-ink-muted)", fontSize: "0.9rem" }} role="note">
                Enter your email above, then tap “Forgot password?” to receive a reset link.
              </p>
            ) : null}
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

          <div className="p12-auth__divider">no account?</div>
          <PremiumButton variant="secondary" block onClick={continueAsGuest}>
            Continue as guest
          </PremiumButton>
          <p style={{ margin: "8px 0 0", textAlign: "center", color: "var(--an-act-p12-ink-muted)", fontSize: "0.85rem" }} role="note">
            Guest = explore only. Nothing is saved, no trust is built, and you can’t sign contracts.
          </p>
          {onBackToLanding ? (
            <PremiumButton variant="ghost" block onClick={onBackToLanding}>
              ← Back to exploration
            </PremiumButton>
          ) : null}
        </PremiumGlassPanel>
      </div>
    </ThemeProvider>
  );
}
