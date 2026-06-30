import { useEffect, useState, type FormEvent } from "react";
import { ThemeProvider, AnActWordmark, AnActBrandLoading } from "@an-act/runtime-ui/react";
import { useRuntime } from "../providers/RuntimeProvider.js";
import { AN_ACT_BRAND } from "../brand/config.js";

export interface ProviderOnboardingPageProps {
  onComplete: () => void;
}

interface OnboardingStep {
  step_id: string;
  label: string;
  purpose: string;
  status: string;
}

export function ProviderOnboardingPage({ onComplete }: ProviderOnboardingPageProps) {
  const { client, loading, error, clearError } = useRuntime();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [currentStep, setCurrentStep] = useState("welcome");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(true);
  const [stepError, setStepError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    void (async () => {
      setBusy(true);
      try {
        const overview = await client.getOnboardingOverview();
        setCurrentStep(String(overview.current_step ?? "welcome"));
        setProgress(Number(overview.progress_percent ?? 0));
        if (overview.onboarding_complete === true) {
          onComplete();
          return;
        }
        const stepList = await client.getOnboardingSteps();
        setSteps((stepList.steps as OnboardingStep[]) ?? []);
      } finally {
        setBusy(false);
      }
    })();
  }, [client, onComplete]);

  async function submitCurrentStep(event: FormEvent) {
    event.preventDefault();
    setStepError(null);
    clearError();
    setBusy(true);
    try {
      const payload = buildStepPayload(currentStep, form);
      const result = await client.submitOnboardingStep(currentStep, payload);
      if (result.accepted !== true) {
        const validation = result.validation as { errors?: string[]; summary?: string } | undefined;
        setStepError(validation?.errors?.join("; ") ?? validation?.summary ?? "Step validation failed");
        return;
      }
      const journey = result.journey as { currentStep?: string; progressPercent?: number; onboardingComplete?: boolean };
      setCurrentStep(String(journey.currentStep ?? currentStep));
      setProgress(Number(journey.progressPercent ?? progress));
      if (journey.onboardingComplete === true) {
        await client.completeOnboarding();
        onComplete();
        return;
      }
      const stepList = await client.getOnboardingSteps();
      setSteps((stepList.steps as OnboardingStep[]) ?? []);
      setForm({});
    } catch (err) {
      setStepError(err instanceof Error ? err.message : "Onboarding step failed");
    } finally {
      setBusy(false);
    }
  }

  const active = steps.find((s) => s.step_id === currentStep);

  return (
    <ThemeProvider mode="action">
      <div className="an-act-login-shell">
        <div className="an-act-login-panel an-act-onboarding-panel">
          <AnActWordmark logoUrl={AN_ACT_BRAND.logoUrl} />
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Provider onboarding</h1>
          <div className="an-act-progress-inline" role="progressbar" aria-valuenow={progress}>
            <div className="an-act-progress-inline__bar" style={{ width: `${progress}%` }} />
            <span>{progress}% complete</span>
          </div>
          {busy || loading ? <AnActBrandLoading stageText="Loading onboarding..." compact /> : null}
          {active ? (
            <div className="an-act-card">
              <h2 style={{ margin: 0 }}>{active.label}</h2>
              <p style={{ margin: "8px 0 0", color: "var(--an-act-color-text-secondary)" }}>{active.purpose}</p>
            </div>
          ) : null}
          <form onSubmit={submitCurrentStep} style={{ display: "grid", gap: "var(--an-act-spacing-space-12)" }}>
            {renderStepFields(currentStep, form, setForm)}
            <button type="submit" className="an-act-button an-act-button--primary" disabled={busy || loading}>
              Continue
            </button>
          </form>
          {(stepError ?? error?.detail) ? (
            <p role="alert" style={{ margin: 0, color: "var(--an-act-color-status-error)" }}>
              {stepError ?? error?.detail}
            </p>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
}

function renderStepFields(
  stepId: string,
  form: Record<string, string>,
  setForm: (next: Record<string, string>) => void
) {
  const field = (name: string, label: string, type = "text") => (
    <label key={name} className="an-act-field">
      {label}
      <input
        type={type}
        value={form[name] ?? ""}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        required
      />
    </label>
  );

  switch (stepId) {
    case "account":
      return (
        <>
          {field("display_name", "Display name")}
          {field("email", "Email", "email")}
        </>
      );
    case "iron_verification":
      return (
        <label className="an-act-field">
          <input
            type="checkbox"
            checked={form.identity_confirmed === "true"}
            onChange={(e) => setForm({ ...form, identity_confirmed: e.target.checked ? "true" : "false" })}
          />{" "}
          I confirm my identity
        </label>
      );
    case "geographic_intelligence":
      return (
        <>
          {field("country", "Country")}
          {field("city", "City")}
          {field("preferred_work_region", "Preferred work region")}
          {field("currency", "Currency")}
          {field("legal_environment", "Legal environment")}
          {field("languages", "Languages (comma-separated)")}
        </>
      );
    case "professional_background":
      return (
        <>
          {field("primary_trade", "Primary trade")}
          {field("years_experience", "Years of experience", "number")}
          {field("skills", "Skills (comma-separated)")}
        </>
      );
    case "professional_story":
      return field("story", "Your professional story");
    default:
      return null;
  }
}

function buildStepPayload(stepId: string, form: Record<string, string>): Record<string, unknown> {
  switch (stepId) {
    case "account":
      return { display_name: form.display_name, email: form.email };
    case "iron_verification":
      return { identity_confirmed: form.identity_confirmed === "true", email_verified: true };
    case "geographic_intelligence":
      return {
        country: form.country,
        city: form.city,
        preferred_work_region: form.preferred_work_region,
        currency: form.currency,
        legal_environment: form.legal_environment,
        languages: (form.languages ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      };
    case "professional_background":
      return {
        primary_trade: form.primary_trade,
        years_experience: Number(form.years_experience ?? 0),
        skills: (form.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      };
    case "professional_story":
      return { story: form.story };
    default:
      return { acknowledged: true };
  }
}
