import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import type { TekrrExecutionProfile, TekrrProfileStatus } from "../domain/tekrr-profile.js";
import { synthesizeTekrrProfile } from "../domain/tekrr-synthesizer.js";
import { validateTekrrProfile } from "../domain/tekrr-validator.js";
import { collectTekrrIntelligencePaths } from "../domain/tekrr-profile.js";

export interface TekrrSynthesisPresetEntry {
  profile: TekrrExecutionProfile;
  status: TekrrProfileStatus;
  label: string;
  publishedAt?: string;
  deprecatedAt?: string;
  deprecatedBy?: string;
}

function presetKey(primaryTaxonomyCode: string, blueprintId: string): string {
  return `${primaryTaxonomyCode}@${blueprintId}`;
}

export class TekrrIntelligenceRepository {
  private readonly presets = new Map<string, TekrrSynthesisPresetEntry>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const blueprint of buildSeedRegistry()) {
      const profile = synthesizeTekrrProfile({ blueprint });
      const key = presetKey(blueprint.primaryTaxonomyCode, blueprint.blueprintId);
      this.presets.set(key, {
        profile,
        status: "published",
        label: blueprint.title,
        publishedAt: "2026-06-20T00:00:00.000Z",
      });
    }
  }

  listPresets(): TekrrSynthesisPresetEntry[] {
    return [...this.presets.values()].sort((left, right) =>
      left.profile.primaryTaxonomyCode.localeCompare(right.profile.primaryTaxonomyCode)
    );
  }

  getPresetCount(): number {
    return this.presets.size;
  }

  getPublishedPresetCount(): number {
    return this.listPresets().filter((entry) => entry.status === "published").length;
  }

  getPresetByTaxonomyCode(code: string): TekrrSynthesisPresetEntry | undefined {
    return this.listPresets().find((entry) => entry.profile.primaryTaxonomyCode === code);
  }

  publishPreset(input: { profile: TekrrExecutionProfile; label: string }): TekrrSynthesisPresetEntry {
    const report = validateTekrrProfile(input.profile);
    if (!report.valid) {
      throw new Error(report.summary);
    }

    const publishedProfile: TekrrExecutionProfile = {
      ...input.profile,
      status: "published",
    };
    const key = presetKey(publishedProfile.primaryTaxonomyCode, publishedProfile.blueprintId);
    if (this.presets.has(key) && this.presets.get(key)?.status === "published") {
      throw new Error(`TEKRR preset already published: ${key}`);
    }

    const entry: TekrrSynthesisPresetEntry = {
      profile: publishedProfile,
      status: "published",
      label: input.label,
      publishedAt: new Date().toISOString(),
    };
    this.presets.set(key, entry);
    return entry;
  }

  deprecatePreset(input: {
    primaryTaxonomyCode: string;
    blueprintId: string;
    successorTaxonomyCode?: string;
  }): TekrrSynthesisPresetEntry {
    const key = presetKey(input.primaryTaxonomyCode, input.blueprintId);
    const existing = this.presets.get(key);
    if (!existing) {
      throw new Error(`TEKRR preset not found: ${key}`);
    }

    const deprecated: TekrrSynthesisPresetEntry = {
      ...existing,
      status: "deprecated",
      profile: {
        ...existing.profile,
        status: "deprecated",
      },
      deprecatedAt: new Date().toISOString(),
      deprecatedBy: input.successorTaxonomyCode,
    };
    this.presets.set(key, deprecated);
    return deprecated;
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectTekrrIntelligencePaths()) {
      try {
        const { access } = await import("node:fs/promises");
        const path = await import("node:path");
        await access(path.join(this.rootDir, artifactPath));
      } catch {
        missing.push(artifactPath);
      }
    }
    return { ok: missing.length === 0, missing };
  }
}

export function createTekrrIntelligenceRepository(deps?: {
  rootDir?: string;
}): TekrrIntelligenceRepository {
  return new TekrrIntelligenceRepository(deps?.rootDir);
}

export const tekrrIntelligenceRepository = createTekrrIntelligenceRepository();
