import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  fromActionBlueprintView,
  type ActionBlueprint,
  type ActionBlueprintView,
} from "../../action-blueprint/domain/action-blueprint.js";
import {
  createActionBlueprintRepository,
  type ActionBlueprintRepository,
} from "../../action-blueprint/infrastructure/action-blueprint-repository.js";
import { REGISTRY_JSON_SCHEMA } from "../domain/registry-schema.js";
import {
  buildBlueprintGovernanceCenter,
  buildRegistryStatistics,
  toBlueprintGovernanceCenterView,
  toGlobalRegistryEntryView,
  toRegistryIndexView,
  toRegistryStatisticsView,
  type BlueprintGovernanceCenterView,
} from "../domain/blueprint-governance.js";
import {
  buildLineageGraph,
  buildRegistryIndex,
  searchRegistry,
} from "../domain/blueprint-registry.js";
import { listCertificationLevels, certifyBlueprint } from "../domain/blueprint-certification.js";
import { listGovernancePolicies } from "../domain/governance-policy.js";
import { isValidSemanticVersion } from "../domain/blueprint-versioning.js";
import type { CertificationLevel } from "../domain/blueprint-certification.js";
import type { GovernanceStatus } from "../domain/blueprint-lifecycle.js";
import {
  createBlueprintGovernanceRepository,
  type BlueprintGovernanceRepository,
} from "../infrastructure/blueprint-governance-repository.js";

export class BlueprintGovernanceService {
  private readonly repository: BlueprintGovernanceRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;

  constructor(deps?: {
    repository?: BlueprintGovernanceRepository;
    blueprintRepository?: ActionBlueprintRepository;
  }) {
    this.repository = deps?.repository ?? createBlueprintGovernanceRepository();
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
  }

  getCenter(authContext: AuthContext): BlueprintGovernanceCenterView {
    this.assertAuthenticated(authContext);
    const center = buildBlueprintGovernanceCenter({
      registryCount: this.repository.getRegistryCount(),
      publishedCount: this.repository.getPublishedCount(),
      canonicalCount: this.repository.getCanonicalCount(),
    });
    return toBlueprintGovernanceCenterView(center);
  }

  getOverview(authContext: AuthContext): BlueprintGovernanceCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  getRegistry(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    return {
      entries: toRegistryIndexView(buildRegistryIndex(entries)),
      total_count: entries.length,
      summary: `Global blueprint registry: ${entries.length} entries.`,
    };
  }

  getRegistryEntry(authContext: AuthContext, blueprintId: string, version?: string) {
    this.assertAuthenticated(authContext);
    const entry = this.repository.getEntry(blueprintId, version);
    if (!entry) {
      throw new Error(`Registry entry not found: ${blueprintId}`);
    }
    return toGlobalRegistryEntryView(entry);
  }

  getVersions(authContext: AuthContext, blueprintId?: string) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    const graphs = buildLineageGraph(
      blueprintId ? entries.filter((entry) => entry.blueprintId === blueprintId) : entries
    );
    return {
      version_graphs: graphs,
      total_count: graphs.length,
      summary: `Version graphs: ${graphs.length} blueprint lineage chains.`,
    };
  }

  getCertification(authContext: AuthContext, blueprintId?: string, version?: string) {
    this.assertAuthenticated(authContext);
    const blueprint = blueprintId
      ? this.resolveBlueprint({ blueprint_id: blueprintId, version })
      : undefined;

    if (blueprint) {
      const report = certifyBlueprint(blueprint);
      return {
        certification_levels: listCertificationLevels(),
        report,
        summary: report.summary,
      };
    }

    const entries = this.repository.listEntries();
    return {
      certification_levels: listCertificationLevels(),
      entries: entries.map((entry) => ({
        registry_id: entry.registryId,
        certification_level: entry.certificationLevel,
        quality_score: entry.qualityScore,
      })),
      summary: `Certification overview for ${entries.length} registry entries.`,
    };
  }

  getGovernance(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    return {
      policies: listGovernancePolicies(),
      version_graphs: buildLineageGraph(entries),
      certification_levels: listCertificationLevels(),
      summary: "Blueprint governance policies and lineage overview.",
    };
  }

  getStatistics(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    const stats = buildRegistryStatistics({
      entries,
      duplicateGroups: this.repository.getDuplicateGroupCount(),
    });
    return toRegistryStatisticsView(stats);
  }

  search(
    authContext: AuthContext,
    input: { q?: string; domain?: string; taxonomy_code?: string; status?: GovernanceStatus }
  ) {
    this.assertAuthenticated(authContext);
    const result = searchRegistry({
      entries: this.repository.listEntries(),
      query: input.q,
      domain: input.domain,
      taxonomyCode: input.taxonomy_code,
      status: input.status,
    });
    return {
      query: result.query,
      total_count: result.totalCount,
      entries: toRegistryIndexView(result.entries),
      summary: result.summary,
    };
  }

  getSchema(authContext: AuthContext): typeof REGISTRY_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return REGISTRY_JSON_SCHEMA;
  }

  publish(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertPlatformAdmin(authContext);
    const blueprint = this.resolveBlueprint(input);
    const entry = this.repository.publish(blueprint);
    return {
      entry: toGlobalRegistryEntryView(entry),
      preview_only: true,
      summary: `Published ${entry.registryId} to global registry (preview only).`,
    };
  }

  deprecate(
    authContext: AuthContext,
    input: { blueprint_id: string; version: string; successor_registry_id?: string }
  ) {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.deprecate({
      blueprintId: input.blueprint_id,
      version: input.version,
      successorRegistryId: input.successor_registry_id,
    });
    return {
      entry: toGlobalRegistryEntryView(entry),
      preview_only: true,
      summary: `Deprecated ${entry.registryId} (preview only).`,
    };
  }

  certify(
    authContext: AuthContext,
    input: {
      blueprint_id: string;
      version: string;
      target_level: CertificationLevel;
      blueprint?: ActionBlueprintView;
    }
  ) {
    this.assertPlatformAdmin(authContext);
    const blueprint = input.blueprint
      ? fromActionBlueprintView(input.blueprint)
      : this.resolveBlueprint({
          blueprint_id: input.blueprint_id,
          version: input.version,
        });
    const entry = this.repository.certify({
      blueprint,
      blueprintId: input.blueprint_id,
      version: input.version,
      targetLevel: input.target_level,
    });
    return {
      entry: toGlobalRegistryEntryView(entry),
      preview_only: true,
      summary: `Certified ${entry.registryId} at level ${entry.certificationLevel} (preview only).`,
    };
  }

  validateSemanticVersion(authContext: AuthContext, version: string) {
    this.assertAuthenticated(authContext);
    return {
      version,
      valid: isValidSemanticVersion(version),
    };
  }

  private resolveBlueprint(input: {
    blueprint?: ActionBlueprintView;
    blueprint_id?: string;
    version?: string;
  }): ActionBlueprint {
    if (input.blueprint) {
      return fromActionBlueprintView(input.blueprint);
    }
    if (input.blueprint_id) {
      const entry = input.version
        ? this.blueprintRepository.getPublishedVersion(input.blueprint_id, input.version)
        : this.blueprintRepository.getLatestPublished(input.blueprint_id);
      if (!entry) {
        throw new Error(`Blueprint not found: ${input.blueprint_id}`);
      }
      return entry.blueprint;
    }
    throw new Error("blueprint or blueprint_id is required");
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createBlueprintGovernanceService(deps?: {
  repository?: BlueprintGovernanceRepository;
  blueprintRepository?: ActionBlueprintRepository;
}): BlueprintGovernanceService {
  return new BlueprintGovernanceService(deps);
}

export function createBlueprintGovernanceModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const repository = createBlueprintGovernanceRepository({ rootDir });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const blueprintGovernance = createBlueprintGovernanceService({
    repository,
    blueprintRepository,
  });
  return { blueprintGovernance };
}

export type BlueprintGovernanceModule = ReturnType<typeof createBlueprintGovernanceModule>;
