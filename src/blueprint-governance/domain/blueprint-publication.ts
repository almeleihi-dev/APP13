import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { validateBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { evaluatePolicyCompliance } from "./governance-policy.js";
import type { CertificationLevel, CertificationReport } from "./blueprint-certification.js";
import { certifyBlueprint } from "./blueprint-certification.js";
import type { GovernanceStatus } from "./blueprint-lifecycle.js";
import { resolveMaturityLevel } from "./blueprint-lifecycle.js";
import { validateVersionForPublish } from "./blueprint-versioning.js";
import type { GlobalRegistryEntry } from "./blueprint-registry.js";
import { buildRegistryEntry, buildMarketplaceReadiness } from "./blueprint-registry.js";

export interface PublishResult {
  entry: GlobalRegistryEntry;
  certification: CertificationReport;
  preview_only: true;
  summary: string;
}

export interface DeprecateResult {
  entry: GlobalRegistryEntry;
  successorRegistryId?: string;
  preview_only: true;
  summary: string;
}

export function publishToRegistry(input: {
  blueprint: ActionBlueprint;
  existingEntries: GlobalRegistryEntry[];
  publishedAt?: string;
}): PublishResult {
  const validation = validateBlueprint(input.blueprint);
  if (!validation.valid) {
    throw new Error(validation.summary);
  }

  const versionCheck = validateVersionForPublish(input.blueprint.version);
  if (!versionCheck.valid) {
    throw new Error(versionCheck.errors.join("; "));
  }

  const duplicate = input.existingEntries.find(
    (entry) =>
      entry.blueprintId === input.blueprint.blueprintId &&
      entry.version === input.blueprint.version &&
      entry.status === "published"
  );
  if (duplicate) {
    throw new Error(`Blueprint already published: ${input.blueprint.blueprintId}@${input.blueprint.version}`);
  }

  const certification = certifyBlueprint(input.blueprint);
  const maturityLevel = resolveMaturityLevel({
    status: "published",
    qualityScore: certification.qualityScore,
    certificationScore: certification.score,
  });

  const policyCheck = evaluatePolicyCompliance({
    certificationLevel: certification.level,
    maturityLevel,
    policyId: "gov://publish/default",
  });
  if (!policyCheck.compliant) {
    throw new Error(policyCheck.gaps.join("; "));
  }

  const entry = buildRegistryEntry({
    blueprint: input.blueprint,
    status: "published",
    certificationLevel: certification.level,
    maturityLevel,
    qualityScore: certification.qualityScore,
    canonical: true,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
  });

  return {
    entry,
    certification,
    preview_only: true,
    summary: `Published ${entry.registryId} to global registry — preview only, no runtime records created.`,
  };
}

export function deprecateFromRegistry(input: {
  entry: GlobalRegistryEntry;
  successorRegistryId?: string;
  deprecatedAt?: string;
}): DeprecateResult {
  if (input.entry.status !== "published") {
    throw new Error(`Cannot deprecate entry in status ${input.entry.status}`);
  }

  const deprecatedEntry: GlobalRegistryEntry = {
    ...input.entry,
    status: "deprecated",
    maturityLevel: "deprecated",
    canonical: false,
    deprecatedAt: input.deprecatedAt ?? new Date().toISOString(),
    lineage: {
      ...input.entry.lineage,
      supersededBy: input.successorRegistryId,
    },
    marketplaceReadiness: {
      ...input.entry.marketplaceReadiness,
      ready: false,
      blockers: ["Blueprint deprecated"],
    },
  };

  return {
    entry: deprecatedEntry,
    successorRegistryId: input.successorRegistryId,
    preview_only: true,
    summary: `Deprecated ${deprecatedEntry.registryId} — preview only.`,
  };
}

export function certifyRegistryEntry(input: {
  blueprint: ActionBlueprint;
  entry: GlobalRegistryEntry;
  targetLevel: CertificationLevel;
}): GlobalRegistryEntry {
  const report = certifyBlueprint(input.blueprint);
  const newLevel = report.level;
  const order = ["unverified", "bronze", "silver", "gold", "platinum"];
  if (order.indexOf(input.targetLevel) > order.indexOf(newLevel)) {
    throw new Error(`Certification score insufficient for ${input.targetLevel}`);
  }

  const maturityLevel = resolveMaturityLevel({
    status: input.entry.status as GovernanceStatus,
    qualityScore: report.qualityScore,
    certificationScore: report.score,
  });

  return {
    ...input.entry,
    certificationLevel: input.targetLevel,
    maturityLevel,
    qualityScore: report.qualityScore,
    certificationReport: report,
    marketplaceReadiness: buildMarketplaceReadiness({
      certificationLevel: input.targetLevel,
      maturityLevel,
      countries: input.entry.compatibility.countries,
      languages: input.entry.compatibility.languages,
    }),
  };
}
