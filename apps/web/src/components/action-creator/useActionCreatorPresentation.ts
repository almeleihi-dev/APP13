import { useCallback, useMemo, useState } from "react";
import {
  buildBlueprintSections,
  buildMarketplacePreviewView,
  buildTrustPreviewView,
  computeActionQualityReport,
} from "./action-blueprint-presentation.js";
import { clearActionBlueprintDraft, saveActionBlueprintDraft } from "./action-creator-persistence.js";
import {
  publishProfessionalAction,
  saveActionDraft,
} from "../../lib/living-platform/professional-action-store.js";
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

export function useActionCreatorPresentation(identity: ActivePersonalIdentity | null) {
  const [stage, setStage] = useState<ActionCreatorStage>("identity");
  const [form, setForm] = useState<ActionBlueprintForm>(EMPTY_ACTION_BLUEPRINT);
  const [buildingIndex, setBuildingIndex] = useState(0);
  const [publishedActionId, setPublishedActionId] = useState<string | null>(null);

  const quality = useMemo(() => computeActionQualityReport(form), [form]);
  const trustPreview = useMemo(() => buildTrustPreviewView(form, identity), [form, identity]);
  const marketplacePreview = useMemo(() => buildMarketplacePreviewView(form, identity), [form, identity]);
  const blueprintSections = useMemo(() => buildBlueprintSections(form), [form]);

  const stageIndex = ACTION_CREATOR_STAGES.indexOf(stage);
  const buildingStep = BUILDING_STEPS[buildingIndex] ?? BUILDING_STEPS[0];

  const updateField = useCallback(<K extends keyof ActionBlueprintForm>(key: K, value: ActionBlueprintForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const canAdvanceIdentity =
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
      saveActionBlueprintDraft({ ...form, savedAt: new Date().toISOString(), qualityScore: quality.score });
      if (identity) {
        saveActionDraft(form, quality.score, identity);
      }
      setStage("complete");
    }
  }

  function publishAction() {
    if (!identity || publishedActionId) return;
    const published = publishProfessionalAction(form, quality.score, identity);
    clearActionBlueprintDraft();
    setPublishedActionId(published.id);
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
    quality,
    trustPreview,
    marketplacePreview,
    blueprintSections,
    buildingStep,
    buildingIndex,
    buildingTotal: BUILDING_STEPS.length,
    publishedActionId,
    publishAction,
  };
}
