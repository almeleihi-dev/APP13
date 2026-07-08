import type { ActivePersonalIdentity } from "../../passport/personal-identity.js";
import type { ActionBlueprintForm } from "./types.js";

export interface ActionQualityDimension {
  label: string;
  score: number;
  hint?: string;
}

export interface ActionQualityReport {
  score: number;
  dimensions: ActionQualityDimension[];
  recommendations: string[];
  readinessLabel: string;
}

export interface TrustPreviewView {
  liveFrameImpact: string;
  trustContribution: string;
  professionalCategory: string;
  customerConfidence: string;
  confidencePercent: number;
}

export interface MarketplacePreviewView {
  providerName: string;
  serviceTitle: string;
  summary: string;
  liveFrameTier: string;
  rating: string;
  responseTime: string;
  professionalLevel: string;
  trustChips: string[];
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function listItems(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeActionQualityReport(form: ActionBlueprintForm): ActionQualityReport {
  const identityClarity = clampScore(
    (form.name.trim().length >= 5 ? 30 : form.name.trim().length * 6) +
      (wordCount(form.purpose) >= 12 ? 35 : wordCount(form.purpose) * 3) +
      (form.targetCustomer.trim().length >= 10 ? 20 : form.targetCustomer.trim().length * 1.5) +
      (form.expectedOutcome.trim().length >= 15 ? 15 : form.expectedOutcome.trim().length),
  );

  const structureCompleteness = clampScore(
    (listItems(form.requirements).length >= 2 ? 25 : listItems(form.requirements).length * 12) +
      (form.estimatedDuration.trim().length >= 3 ? 20 : 0) +
      (listItems(form.deliverables).length >= 1 ? 20 : 0) +
      (form.evidence.trim().length >= 10 ? 20 : form.evidence.trim().length) +
      (form.successCriteria.trim().length >= 10 ? 15 : form.successCriteria.trim().length),
  );

  const outcomeSpecificity = clampScore(
    (wordCount(form.expectedOutcome) >= 8 ? 50 : wordCount(form.expectedOutcome) * 6) +
      (wordCount(form.successCriteria) >= 6 ? 50 : wordCount(form.successCriteria) * 7),
  );

  const trustSignals = clampScore(
    (form.evidence.trim().length >= 20 ? 45 : form.evidence.trim().length * 2) +
      (listItems(form.deliverables).length >= 2 ? 35 : listItems(form.deliverables).length * 15) +
      (form.estimatedDuration.trim().length >= 5 ? 20 : 0),
  );

  const marketplaceReadiness = clampScore(
    (form.name.trim().length >= 8 ? 30 : 0) +
      (form.purpose.trim().length >= 40 ? 35 : form.purpose.trim().length * 0.7) +
      (form.targetCustomer.trim().length >= 15 ? 20 : 0) +
      (listItems(form.requirements).length >= 2 ? 15 : 0),
  );

  const score = clampScore(
    identityClarity * 0.28 +
      structureCompleteness * 0.26 +
      outcomeSpecificity * 0.18 +
      trustSignals * 0.16 +
      marketplaceReadiness * 0.12,
  );

  const recommendations: string[] = [];

  if (form.name.trim().length < 8) {
    recommendations.push("Give your action a specific, memorable name customers can search for.");
  }
  if (wordCount(form.purpose) < 12) {
    recommendations.push("Expand the professional purpose — explain what problem you solve and why you're qualified.");
  }
  if (form.targetCustomer.trim().length < 15) {
    recommendations.push("Describe your target customer more precisely (role, situation, or industry).");
  }
  if (listItems(form.requirements).length < 2) {
    recommendations.push("Add at least two clear requirements so customers know what to prepare.");
  }
  if (form.evidence.trim().length < 20) {
    recommendations.push("Strengthen evidence — mention licenses, Live Frame monitoring, or proof of delivery.");
  }
  if (form.successCriteria.trim().length < 15) {
    recommendations.push("Define success criteria customers can verify when the action is complete.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your blueprint is clear and ready — publish when you're comfortable with the preview.");
  }

  const readinessLabel =
    score >= 85 ? "Publication ready" : score >= 70 ? "Strong draft" : score >= 55 ? "Needs clarity" : "Early draft";

  return {
    score,
    dimensions: [
      { label: "Identity clarity", score: identityClarity },
      { label: "Structure completeness", score: structureCompleteness },
      { label: "Outcome specificity", score: outcomeSpecificity },
      { label: "Trust signals", score: trustSignals },
      { label: "Marketplace readiness", score: marketplaceReadiness },
    ],
    recommendations,
    readinessLabel,
  };
}

export function buildTrustPreviewView(
  form: ActionBlueprintForm,
  identity: ActivePersonalIdentity | null,
): TrustPreviewView {
  const tier = identity?.liveFrameTier ?? "Silver";
  const category = identity?.mainSkill?.trim() || inferCategory(form);
  const confidenceBase = 62;
  const nameBoost = form.name.trim().length >= 8 ? 8 : 0;
  const purposeBoost = wordCount(form.purpose) >= 10 ? 10 : 0;
  const evidenceBoost = form.evidence.trim().length >= 15 ? 8 : 0;
  const tierBoost = tier === "Platinum" ? 10 : tier === "Gold" ? 6 : 3;
  const confidencePercent = clampScore(confidenceBase + nameBoost + purposeBoost + evidenceBoost + tierBoost);

  return {
    liveFrameImpact: `Completing this action adds verified delivery evidence to your ${tier} Live Frame.`,
    trustContribution: `Estimated +${Math.max(2, Math.round(confidencePercent / 18))} trust points on first verified completion.`,
    professionalCategory: category,
    customerConfidence: confidencePercent >= 80 ? "High confidence" : confidencePercent >= 65 ? "Moderate confidence" : "Building confidence",
    confidencePercent,
  };
}

function inferCategory(form: ActionBlueprintForm): string {
  const text = `${form.name} ${form.purpose}`.toLowerCase();
  if (/electric|panel|wiring/.test(text)) return "Electrical Services";
  if (/consult|advisory|strategy/.test(text)) return "Business Advisory";
  if (/market|campaign|brand/.test(text)) return "Marketing & Growth";
  if (/hvac|cooling|heating/.test(text)) return "HVAC & Maintenance";
  return "Professional Services";
}

export function buildMarketplacePreviewView(
  form: ActionBlueprintForm,
  identity: ActivePersonalIdentity | null,
): MarketplacePreviewView {
  const providerName = identity?.fullName?.trim() || "Your Professional Passport";
  const tier = identity?.liveFrameTier ?? "Silver";
  const level =
    tier === "Platinum" ? "Elite Operator" : tier === "Gold" ? "Established Professional" : "Active Professional";

  return {
    providerName,
    serviceTitle: form.name.trim() || "Untitled Professional Action",
    summary: form.purpose.trim() || "Describe your professional purpose to preview marketplace copy.",
    liveFrameTier: tier,
    rating: "New action",
    responseTime: form.estimatedDuration.trim() ? `Est. ${form.estimatedDuration}` : "Set duration",
    professionalLevel: level,
    trustChips: buildTrustChips(form, identity),
  };
}

function buildTrustChips(form: ActionBlueprintForm, identity: ActivePersonalIdentity | null): string[] {
  const chips: string[] = [];
  if (identity?.liveFrameTier) chips.push(`${identity.liveFrameTier} Live Frame`);
  if (form.evidence.trim()) chips.push("Evidence defined");
  if (listItems(form.deliverables).length > 0) chips.push("Deliverables listed");
  if (identity?.trustIndicators?.length) chips.push("Passport verified");
  if (chips.length === 0) chips.push("Public beta · draft preview");
  return chips.slice(0, 4);
}

export function buildBlueprintSections(form: ActionBlueprintForm) {
  return [
    { label: "Action name", value: form.name.trim() || "—" },
    { label: "Professional purpose", value: form.purpose.trim() || "—" },
    { label: "Target customer", value: form.targetCustomer.trim() || "—" },
    { label: "Expected outcome", value: form.expectedOutcome.trim() || "—" },
    { label: "Requirements", value: listItems(form.requirements).join(" · ") || "—" },
    { label: "Estimated duration", value: form.estimatedDuration.trim() || "—" },
    { label: "Deliverables", value: listItems(form.deliverables).join(" · ") || "—" },
    { label: "Evidence", value: form.evidence.trim() || "—" },
    { label: "Success criteria", value: form.successCriteria.trim() || "—" },
  ];
}
