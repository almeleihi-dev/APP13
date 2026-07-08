import type { ChangeEvent } from "react";
import { PremiumButton } from "@an-act/runtime-ui/react";
import { AnalysisProgress } from "../../launch/AnalysisProgress.js";
import { ACTION_CREATOR_STEP_LABELS } from "./types.js";
import { useActionCreatorPresentation } from "./useActionCreatorPresentation.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";

export interface ActionCreatorFlowProps {
  identity: ActivePersonalIdentity | null;
  onComplete: () => void;
  onCancel: () => void;
  onViewMarketplace?: () => void;
}

export function ActionCreatorFlow({ identity, onComplete, onCancel, onViewMarketplace }: ActionCreatorFlowProps) {
  const creator = useActionCreatorPresentation(identity);

  return (
    <div className="an-act-action-creator__flow" data-stage={creator.stage} role="region" aria-label="Action Creator">
      <CreatorProgress stage={creator.stage} stageIndex={creator.stageIndex} />

      {creator.stage === "identity" ? (
        <IdentityStep form={creator.form} onChange={creator.updateField} />
      ) : null}

      {creator.stage === "structure" ? (
        <StructureStep form={creator.form} onChange={creator.updateField} />
      ) : null}

      {creator.stage === "building" ? (
        <section className="an-act-action-creator__panel an-act-action-creator__panel--center">
          <AnalysisProgress
            step={creator.buildingStep}
            stepIndex={creator.buildingIndex}
            totalSteps={creator.buildingTotal}
          />
          <p className="an-act-action-creator__building-note">
            Transforming your expertise into a structured Professional Action Blueprint.
          </p>
        </section>
      ) : null}

      {creator.stage === "blueprint" ? (
        <BlueprintStep sections={creator.blueprintSections} actionName={creator.form.name} />
      ) : null}

      {creator.stage === "trust" ? (
        <TrustPreviewStep preview={creator.trustPreview} actionName={creator.form.name} />
      ) : null}

      {creator.stage === "marketplace" ? (
        <MarketplacePreviewStep preview={creator.marketplacePreview} form={creator.form} />
      ) : null}

      {creator.stage === "quality" ? (
        <QualityStep report={creator.quality} />
      ) : null}

      {creator.stage === "complete" ? (
        <CompleteStep
          actionName={creator.form.name}
          score={creator.quality.score}
          published={Boolean(creator.publishedActionId)}
          onPublish={creator.publishAction}
          onComplete={onComplete}
          onViewMarketplace={onViewMarketplace}
        />
      ) : null}

      {creator.stage !== "building" && creator.stage !== "complete" ? (
        <footer className="an-act-action-creator__footer">
          {creator.stage !== "identity" ? (
            <PremiumButton variant="secondary" onClick={creator.goBack}>
              Back
            </PremiumButton>
          ) : (
            <PremiumButton variant="secondary" onClick={onCancel}>
              Cancel
            </PremiumButton>
          )}
          <PremiumButton
            variant="primary"
            onClick={creator.goNext}
            disabled={
              (creator.stage === "identity" && !creator.canAdvanceIdentity) ||
              (creator.stage === "structure" && !creator.canAdvanceStructure)
            }
          >
            {creator.stage === "quality" ? "Review & publish" : "Continue"}
          </PremiumButton>
        </footer>
      ) : null}
    </div>
  );
}

function CreatorProgress({ stage, stageIndex }: { stage: string; stageIndex: number }) {
  if (stage === "building" || stage === "complete") return null;

  const labels = ["Identity", "Structure", "Blueprint", "Trust", "Marketplace", "Quality"];
  const activeIndex =
    stage === "identity"
      ? 0
      : stage === "structure"
        ? 1
        : stage === "blueprint"
          ? 2
          : stage === "trust"
            ? 3
            : stage === "marketplace"
              ? 4
              : 5;

  return (
    <div className="an-act-action-creator__progress" aria-label="Action Creator progress">
      <p className="an-act-action-creator__step-label">
        Step {stageIndex + 1} of 8 · {ACTION_CREATOR_STEP_LABELS[stage as keyof typeof ACTION_CREATOR_STEP_LABELS]}
      </p>
      <ol className="an-act-action-creator__steps">
        {labels.map((label, index) => (
          <li
            key={label}
            className={
              index < activeIndex
                ? "an-act-action-creator__step--done"
                : index === activeIndex
                  ? "an-act-action-creator__step--active"
                  : undefined
            }
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

interface FormStepProps {
  form: ReturnType<typeof useActionCreatorPresentation>["form"];
  onChange: ReturnType<typeof useActionCreatorPresentation>["updateField"];
}

function IdentityStep({ form, onChange }: FormStepProps) {
  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Action Creation · Cycle 01</span>
        <h1 className="an-act-action-creator__title">Define your Action Identity</h1>
        <p className="an-act-action-creator__lead">
          Help customers understand what you offer, who it is for, and what success looks like — before they request
          service.
        </p>
      </header>

      <div className="an-act-action-creator__fields">
        <Field
          id="action-name"
          label="Action name"
          hint="A clear, searchable name for your professional action."
          value={form.name}
          onChange={(value) => onChange("name", value)}
          placeholder="e.g. Residential Panel Safety Inspection"
        />
        <Field
          id="action-purpose"
          label="Professional purpose"
          hint="Why this action exists and what expertise you bring."
          value={form.purpose}
          onChange={(value) => onChange("purpose", value)}
          placeholder="Licensed inspection with Live Frame documentation and code-compliant reporting."
          multiline
        />
        <Field
          id="action-target"
          label="Target customer"
          hint="Who benefits most from this action?"
          value={form.targetCustomer}
          onChange={(value) => onChange("targetCustomer", value)}
          placeholder="Homeowners and property managers preparing for seasonal safety checks."
          multiline
        />
        <Field
          id="action-outcome"
          label="Expected outcome"
          hint="What the customer receives when the action is complete."
          value={form.expectedOutcome}
          onChange={(value) => onChange("expectedOutcome", value)}
          placeholder="Full inspection report, prioritized recommendations, and warranty-ready documentation."
          multiline
        />
      </div>
    </section>
  );
}

function StructureStep({ form, onChange }: FormStepProps) {
  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Action Structure</span>
        <h1 className="an-act-action-creator__title">Structure the professional action</h1>
        <p className="an-act-action-creator__lead">
          Define requirements, timing, deliverables, evidence, and success criteria so AN ACT can monitor trust
          end-to-end.
        </p>
      </header>

      <div className="an-act-action-creator__fields">
        <Field
          id="action-requirements"
          label="Requirements"
          hint="Separate items with commas or new lines."
          value={form.requirements}
          onChange={(value) => onChange("requirements", value)}
          placeholder="Access to electrical panel, property address, preferred appointment window"
          multiline
        />
        <Field
          id="action-duration"
          label="Estimated duration"
          value={form.estimatedDuration}
          onChange={(value) => onChange("estimatedDuration", value)}
          placeholder="2–3 hours on-site"
        />
        <Field
          id="action-deliverables"
          label="Deliverables"
          hint="What you hand over when complete."
          value={form.deliverables}
          onChange={(value) => onChange("deliverables", value)}
          placeholder="Inspection report, photo evidence, compliance checklist"
          multiline
        />
        <Field
          id="action-evidence"
          label="Evidence"
          hint="How trust is verified (licenses, Live Frame, documentation)."
          value={form.evidence}
          onChange={(value) => onChange("evidence", value)}
          placeholder="Government license, insurance certificate, Live Frame continuous monitoring"
          multiline
        />
        <Field
          id="action-success"
          label="Success criteria"
          value={form.successCriteria}
          onChange={(value) => onChange("successCriteria", value)}
          placeholder="All circuits tested, hazards documented, customer sign-off captured in Live Frame"
          multiline
        />
      </div>
    </section>
  );
}

function BlueprintStep({
  sections,
  actionName,
}: {
  sections: Array<{ label: string; value: string }>;
  actionName: string;
}) {
  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Professional Action Blueprint</span>
        <h1 className="an-act-action-creator__title">{actionName.trim() || "Your Action Blueprint"}</h1>
        <p className="an-act-action-creator__lead">
          This is how your structured action will appear inside AN ACT — identity, structure, and trust in one view.
        </p>
      </header>

      <div className="an-act-action-blueprint">
        <div className="an-act-action-blueprint__header">
          <span className="an-act-action-blueprint__chip">Blueprint preview</span>
          <p className="an-act-action-blueprint__subtitle">Structured professional action</p>
        </div>
        <div className="an-act-action-blueprint__grid">
          {sections.map((section) => (
            <article key={section.label} className="an-act-action-blueprint__section">
              <h2 className="an-act-action-blueprint__section-label">{section.label}</h2>
              <p className="an-act-action-blueprint__section-value">{section.value}</p>
            </article>
          ))}
        </div>
        <p className="an-act-action-blueprint__footnote" role="note">
          Presentation preview only · no backend publish in Cycle 01
        </p>
      </div>
    </section>
  );
}

function TrustPreviewStep({
  preview,
  actionName,
}: {
  preview: ReturnType<typeof useActionCreatorPresentation>["trustPreview"];
  actionName: string;
}) {
  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Trust Preview</span>
        <h1 className="an-act-action-creator__title">How this action builds trust</h1>
        <p className="an-act-action-creator__lead">
          Preview Live Frame impact, trust contribution, and estimated customer confidence for{" "}
          <strong>{actionName.trim() || "your action"}</strong>.
        </p>
      </header>

      <div className="an-act-action-trust">
        <div className="an-act-action-trust__confidence">
          <span className="an-act-action-trust__confidence-value">{preview.confidencePercent}%</span>
          <span className="an-act-action-trust__confidence-label">Estimated customer confidence</span>
          <span className="an-act-action-trust__confidence-tier">{preview.customerConfidence}</span>
        </div>
        <div className="an-act-action-trust__grid">
          <article className="an-act-action-trust__card">
            <h2>Live Frame impact</h2>
            <p>{preview.liveFrameImpact}</p>
          </article>
          <article className="an-act-action-trust__card">
            <h2>Trust contribution</h2>
            <p>{preview.trustContribution}</p>
          </article>
          <article className="an-act-action-trust__card">
            <h2>Professional category</h2>
            <p>{preview.professionalCategory}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MarketplacePreviewStep({
  preview,
  form,
}: {
  preview: ReturnType<typeof useActionCreatorPresentation>["marketplacePreview"];
  form: ReturnType<typeof useActionCreatorPresentation>["form"];
}) {
  const initials = preview.providerName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Marketplace Preview</span>
        <h1 className="an-act-action-creator__title">How customers will discover this action</h1>
        <p className="an-act-action-creator__lead">
          Exact marketplace presentation — provider passport, trust chips, and service story.
        </p>
      </header>

      <article className="an-act-action-marketplace-card">
        <div className="an-act-action-marketplace-card__banner">
          <span>Draft preview · Public beta</span>
        </div>
        <div className="an-act-action-marketplace-card__head">
          <div className="an-act-action-marketplace-card__avatar" aria-hidden="true">
            {initials || "AP"}
          </div>
          <div>
            <p className="an-act-action-marketplace-card__provider">{preview.providerName}</p>
            <h2 className="an-act-action-marketplace-card__title">{preview.serviceTitle}</h2>
          </div>
        </div>
        <p className="an-act-action-marketplace-card__summary">{preview.summary}</p>
        <div className="an-act-action-marketplace-card__meta">
          <span>{preview.liveFrameTier} Live Frame</span>
          <span>{preview.professionalLevel}</span>
          <span>{preview.responseTime}</span>
        </div>
        <ul className="an-act-action-marketplace-card__chips">
          {preview.trustChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
        <div className="an-act-action-marketplace-card__story">
          <div>
            <h3>Who needs this</h3>
            <p>{form.targetCustomer.trim() || "Define your target customer on the identity step."}</p>
          </div>
          <div>
            <h3>Expected outcome</h3>
            <p>{form.expectedOutcome.trim() || "Define the expected outcome on the identity step."}</p>
          </div>
        </div>
        <p className="an-act-action-marketplace-card__cta">Request Service →</p>
      </article>
    </section>
  );
}

function QualityStep({ report }: { report: ReturnType<typeof useActionCreatorPresentation>["quality"] }) {
  return (
    <section className="an-act-action-creator__panel">
      <header className="an-act-action-creator__header">
        <span className="an-act-action-creator__badge">Action Quality</span>
        <h1 className="an-act-action-creator__title">Review clarity before publishing</h1>
        <p className="an-act-action-creator__lead">
          Friendly guidance to strengthen your blueprint — presentation-only scoring in Cycle 01.
        </p>
      </header>

      <div className="an-act-action-quality">
        <div className="an-act-action-quality__score">
          <span className="an-act-action-quality__score-value">{report.score}</span>
          <span className="an-act-action-quality__score-label">Action quality score</span>
          <span className="an-act-action-quality__readiness">{report.readinessLabel}</span>
        </div>
        <div className="an-act-action-quality__dimensions">
          {report.dimensions.map((dimension) => (
            <div key={dimension.label} className="an-act-action-quality__dimension">
              <div className="an-act-action-quality__dimension-head">
                <span>{dimension.label}</span>
                <strong>{dimension.score}</strong>
              </div>
              <div className="an-act-action-quality__dimension-track" aria-hidden="true">
                <div className="an-act-action-quality__dimension-fill" style={{ width: `${dimension.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <aside className="an-act-action-quality__tips" aria-label="Recommendations">
          <h2>Recommendations</h2>
          <ul>
            {report.recommendations.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function CompleteStep({
  actionName,
  score,
  published,
  onPublish,
  onComplete,
  onViewMarketplace,
}: {
  actionName: string;
  score: number;
  published: boolean;
  onPublish: () => void;
  onComplete: () => void;
  onViewMarketplace?: () => void;
}) {
  return (
    <section className="an-act-action-creator__panel an-act-action-creator__panel--center">
      <span
        className={`an-act-action-creator__badge${published ? " an-act-action-creator__badge--success" : ""}`}
      >
        {published ? "Published to marketplace" : "Ready to publish"}
      </span>
      <h1 className="an-act-action-creator__title">{actionName.trim() || "Professional Action"}</h1>
      <p className="an-act-action-creator__lead">
        {published
          ? `Your action is live in the Action Marketplace with your Professional Passport attached (quality score ${score}/100).`
          : `Blueprint saved (quality score ${score}/100). Publish to attach your passport and make this action discoverable.`}
      </p>
      {!published ? (
        <PremiumButton variant="primary" onClick={onPublish}>
          Publish to marketplace
        </PremiumButton>
      ) : null}
      {published && onViewMarketplace ? (
        <PremiumButton variant="primary" onClick={onViewMarketplace}>
          View in marketplace
        </PremiumButton>
      ) : null}
      <PremiumButton variant={published ? "secondary" : "secondary"} onClick={onComplete}>
        Return to Personal Home
      </PremiumButton>
      {!published ? (
        <p className="an-act-action-blueprint__footnote" role="note">
          Public beta · actions persist locally until server sync ships
        </p>
      ) : null}
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  return (
    <label className="an-act-action-creator__field" htmlFor={id}>
      <span className="an-act-action-creator__field-label">{label}</span>
      {hint ? <span className="an-act-action-creator__field-hint">{hint}</span> : null}
      {multiline ? (
        <textarea
          id={id}
          className="an-act-action-creator__input an-act-action-creator__input--area"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          id={id}
          className="an-act-action-creator__input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}
