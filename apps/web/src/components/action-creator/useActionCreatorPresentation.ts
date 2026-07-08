import { useCallback, useEffect, useMemo, useState } from "react";
import { RuntimeClientError, type ActionTypeOption } from "@an-act/runtime-client";
import {
  buildBlueprintSections,
  buildMarketplacePreviewView,
  buildTrustPreviewView,
  computeActionQualityReport,
} from "./action-blueprint-presentation.js";
import { clearActionBlueprintDraft, saveActionBlueprintDraft } from "./action-creator-persistence.js";
import { saveActionDraft } from "../../lib/living-platform/professional-action-store.js";
import { useRuntime } from "../../providers/RuntimeProvider.js";
import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import {
  ACTION_CREATOR_STAGES,
  EMPTY_ACTION_BLUEPRINT,
  type ActionBlueprintForm,
  type ActionCreatorStage,
} from "./types.js";

const BUILDING_DURATION_MS = 780;
const BUILDING_STEPS = [
  { label: "Structuring identity…", fill: 40 },
  { label: "Mapping deliverables…", fill: 65 },
  { label: "Compiling Action Blueprint…", fill: 88 },
  { label: "Blueprint ready.", fill: 100 },
] as const;

const LOCATION_MODE_LABELS: Record<string, string> = {
  near_me: "Near me",
  same_city: "Same city",
  country: "Country-wide",
  worldwide: "Worldwide",
  remote: "Remote",
};

/**
 * Compose the human-readable action description sent to the backend.
 * The backend action contract only persists { action_type_code, title,
 * description }, so every structured guidance field the user provided is
 * folded into this description (the only free-text home available).
 */
function composeDescription(form: ActionBlueprintForm): string {
  const lines: string[] = [];
  if (form.purpose.trim()) lines.push(`Purpose: ${form.purpose.trim()}`);
  if (form.targetCustomer.trim()) lines.push(`For: ${form.targetCustomer.trim()}`);
  if (form.expectedOutcome.trim()) lines.push(`Expected outcome: ${form.expectedOutcome.trim()}`);
  if (form.requirements.trim()) lines.push(`Requirements: ${form.requirements.trim()}`);
  if (form.estimatedDuration.trim()) lines.push(`Estimated duration: ${form.estimatedDuration.trim()}`);
  if (form.deliverables.trim()) lines.push(`Deliverables: ${form.deliverables.trim()}`);
  if (form.evidence.trim()) lines.push(`Evidence: ${form.evidence.trim()}`);
  if (form.successCriteria.trim()) lines.push(`Success criteria: ${form.successCriteria.trim()}`);

  const guidance: string[] = [];
  if (form.locationMode) guidance.push(`Location: ${LOCATION_MODE_LABELS[form.locationMode] ?? form.locationMode}`);
  if (form.availability.trim()) guidance.push(`Availability: ${form.availability.trim()}`);
  if (form.trustRequirement.trim()) guidance.push(`Trust requirement: ${form.trustRequirement.trim()}`);
  if (guidance.length > 0) {
    lines.push(`Preferences (not yet structured fields): ${guidance.join("; ")}`);
  }
  return lines.join("\n");
}

export function useActionCreatorPresentation(identity: ActivePersonalIdentity | null) {
  const { client } = useRuntime();
  const [stage, setStage] = useState<ActionCreatorStage>("identity");
  const [form, setForm] = useState<ActionBlueprintForm>(EMPTY_ACTION_BLUEPRINT);
  const [buildingIndex, setBuildingIndex] = useState(0);
  const [publishedActionId, setPublishedActionId] = useState<string | null>(null);
  const [actionTypes, setActionTypes] = useState<ActionTypeOption[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const quality = useMemo(() => computeActionQualityReport(form), [form]);
  const trustPreview = useMemo(() => buildTrustPreviewView(form, identity), [form, identity]);
  const marketplacePreview = useMemo(() => buildMarketplacePreviewView(form, identity), [form, identity]);
  const blueprintSections = useMemo(() => buildBlueprintSections(form), [form]);

  const stageIndex = ACTION_CREATOR_STAGES.indexOf(stage);
  const buildingStep = BUILDING_STEPS[buildingIndex] ?? BUILDING_STEPS[0];

  // Load the real backend action-type catalog (category/skill/domain).
  useEffect(() => {
    let cancelled = false;
    if (!client.auth.hasSession()) return;
    client
      .listActionTypes()
      .then((types) => {
        if (!cancelled) setActionTypes(types);
      })
      .catch(() => {
        if (!cancelled) setActionTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const updateField = useCallback(<K extends keyof ActionBlueprintForm>(key: K, value: ActionBlueprintForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const canAdvanceIdentity =
    form.actionTypeCode.trim().length > 0 &&
    form.name.trim().length >= 3 &&
    form.purpose.trim().length >= 10 &&
    form.targetCustomer.trim().length >= 5 &&
    form.expectedOutcome.trim().length >= 5;

  const canAdvanceStructure =
    form.requirements.trim().length >= 5 &&
    form.estimatedDuration.trim().length >= 2 &&
    form.deliverables.trim().length >= 3 &&
    form.evidence.trim().length >= 5 &&
    form.successCriteria.trim().length >= 5;

  const canPublish = Boolean(form.actionTypeCode.trim() && form.name.trim());

  function goNext() {
    if (stage === "identity" && canAdvanceIdentity) {
      setStage("structure");
      return;
    }
    if (stage === "structure" && canAdvanceStructure) {
      startBuilding();
      return;
    }
    if (stage === "blueprint") {
      setStage("trust");
      return;
    }
    if (stage === "trust") {
      setStage("marketplace");
      return;
    }
    if (stage === "marketplace") {
      setStage("quality");
      return;
    }
    if (stage === "quality") {
      // Local draft cache only — the authoritative record is created on publish.
      saveActionBlueprintDraft({ ...form, savedAt: new Date().toISOString(), qualityScore: quality.score });
      if (identity) {
        saveActionDraft(form, quality.score, identity);
      }
      setStage("complete");
    }
  }

  /** Publish = create a REAL backend action via POST /v1/actions. */
  async function publishAction() {
    if (publishedActionId || publishing || !canPublish) return;
    setPublishing(true);
    setPublishError(null);
    setNeedsEmailVerification(false);
    try {
      const result = await client.createAction({
        action_type_code: form.actionTypeCode,
        title: form.name.trim(),
        description: composeDescription(form),
      });
      const id =
        typeof result.id === "string"
          ? result.id
          : typeof result.action_id === "string"
            ? result.action_id
            : "created";
      clearActionBlueprintDraft();
      setPublishedActionId(id);
    } catch (err) {
      if (err instanceof RuntimeClientError && err.status === 403) {
        // Most common cause: email not verified (action create requires it).
        setNeedsEmailVerification(true);
        setPublishError(err.problem?.detail ?? err.message);
      } else if (err instanceof RuntimeClientError) {
        setPublishError(err.problem?.detail ?? err.message);
      } else {
        setPublishError("Could not save your action. Please try again.");
      }
    } finally {
      setPublishing(false);
    }
  }

  /** Surface the existing backend email-verification flow (no silent failure). */
  async function requestVerification() {
    try {
      await client.requestEmailVerification();
      setVerificationSent(true);
    } catch {
      setPublishError("Could not send the verification email. Please try again.");
    }
  }

  function goBack() {
    if (stage === "structure") {
      setStage("identity");
      return;
    }
    if (stage === "blueprint") {
      setStage("structure");
      return;
    }
    if (stage === "trust") {
      setStage("blueprint");
      return;
    }
    if (stage === "marketplace") {
      setStage("trust");
      return;
    }
    if (stage === "quality") {
      setStage("marketplace");
    }
  }

  function startBuilding() {
    setStage("building");
    setBuildingIndex(0);
    BUILDING_STEPS.forEach((_, index) => {
      window.setTimeout(() => {
        setBuildingIndex(index);
        if (index === BUILDING_STEPS.length - 1) {
          window.setTimeout(() => setStage("blueprint"), 520);
        }
      }, index * BUILDING_DURATION_MS);
    });
  }

  return {
    stage,
    stageIndex,
    form,
    updateField,
    goNext,
    goBack,
    canAdvanceIdentity,
    canAdvanceStructure,
    canPublish,
    quality,
    trustPreview,
    marketplacePreview,
    blueprintSections,
    buildingStep,
    buildingIndex,
    buildingTotal: BUILDING_STEPS.length,
    publishedActionId,
    publishAction,
    actionTypes,
    publishing,
    publishError,
    needsEmailVerification,
    verificationSent,
    requestVerification,
  };
}
