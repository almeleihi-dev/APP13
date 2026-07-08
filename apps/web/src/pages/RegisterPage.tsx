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

export interface RegisterPageProps {
  onLogin: () => void;
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

export function RegisterPage({ onLogin, onSuccess, onBackToLanding }: RegisterPageProps) {
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
              Create account
            </h1>
            <p className="ds-eyebrow" style={{ margin: 0, color: "var(--an-act-p12-ink-muted)" }}>
              {AN_ACT_BRAND.productName}
            </p>
          </div>
          <p style={{ margin: 0, textAlign: "center", color: "var(--an-act-p12-ink-muted)", fontSize: "0.9375rem" }}>
            Your account is created securely on AN ACT’s servers. You’ll verify your email before publishing actions.
          </p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }} aria-busy={loading}>
            <label className="p12-field">
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
            </label>
            <label className="p12-field">
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label className="p12-field">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <PremiumButton type="submit" variant="primary" block disabled={loading} aria-busy={loading}>
              {loading ? "Creating..." : "Create account"}
            </PremiumButton>
            {error ? (
              <PresentationError title={error.title} detail={error.detail} code={error.code} />
            ) : null}
          </form>
          <PremiumButton variant="ghost" block onClick={onLogin}>
            Back to sign in
          </PremiumButton>
        </PremiumGlassPanel>
      </div>
    </ThemeProvider>
  );
}
