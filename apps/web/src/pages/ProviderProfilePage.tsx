import { useEffect, useState, type FormEvent } from "react";
import { ThemeProvider, AnActWordmark, AnActBrandLoading } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface ProviderProfilePageProps {
  onComplete: () => void;
}

export function ProviderProfilePage({ onComplete }: ProviderProfilePageProps) {
  const { client, updateProviderProfile, loading, error } = useRuntime();
  const [providerId, setProviderId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [passportLevel, setPassportLevel] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    void (async () => {
      setBusy(true);
      try {
        const me = await client.getMe();
        setProviderId(String(me.provider_id ?? ""));
        setDisplayName(String(me.display_name ?? ""));
        const passport = await client.getProfessionalPassport();
        setPassportLevel(String((passport as { level?: { label?: string } }).level?.label ?? "Professional"));
      } finally {
        setBusy(false);
      }
    })();
  }, [client]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!providerId) {
      return;
    }
    const ok = await updateProviderProfile(providerId, {
      display_name: displayName.trim(),
      business_name: businessName.trim(),
      bio: bio.trim(),
    });
    if (ok) {
      onComplete();
    }
  }

  return (
    <ThemeProvider mode="action">
      <div className="an-act-login-shell">
        <div className="an-act-login-panel">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Complete your profile</h1>
          <div className="an-act-card" role="region" aria-label="Professional passport">
            <strong>Professional passport</strong>
            <p style={{ margin: "8px 0 0" }}>{passportLevel}</p>
          </div>
          {busy || loading ? <AnActBrandLoading stageText="Loading profile..." compact /> : null}
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "var(--an-act-spacing-space-12)" }}>
            <label className="an-act-field">
              Display name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Business name
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </label>
            <label className="an-act-field">
              Bio
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </label>
            <button type="submit" className="an-act-button an-act-button--primary" disabled={loading || busy}>
              Save and continue
            </button>
            {error ? (
              <p role="alert" style={{ margin: 0, color: "var(--an-act-color-status-error)" }}>
                <strong>{error.title}</strong>: {error.detail}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
}
