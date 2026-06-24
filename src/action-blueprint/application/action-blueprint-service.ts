import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import { BLUEPRINT_JSON_SCHEMA } from "../domain/blueprint-schema.js";
import {
  applyValidatedStatus,
  buildBlueprintFoundationCenter,
  fromActionBlueprintView,
  toBlueprintDraftView,
  toBlueprintFoundationCenterView,
  toBlueprintRegistryEntryView,
  toValidationReportView,
  validateBlueprint,
  type ActionBlueprint,
  type ActionBlueprintView,
  type BlueprintDraftView,
  type BlueprintFoundationCenterView,
  type BlueprintRegistryEntryView,
  type BlueprintRegistryIndexView,
  type CompiledBlueprintPreview,
  type ValidationReportView,
} from "../domain/action-blueprint.js";
import { compileBlueprintPreview } from "../domain/blueprint-compiler.js";
import {
  transformProfessionBinding,
  transformProjectIntent,
  transformServiceDescription,
} from "../domain/blueprint-transform.js";
import { buildTaxonomyBridge } from "../domain/taxonomy-bridge.js";
import {
  createActionBlueprintRepository,
  type ActionBlueprintRepository,
} from "../infrastructure/action-blueprint-repository.js";

export class ActionBlueprintService {
  private readonly repository: ActionBlueprintRepository;

  constructor(repository?: ActionBlueprintRepository) {
    this.repository = repository ?? createActionBlueprintRepository();
  }

  getFoundationCenter(authContext: AuthContext): BlueprintFoundationCenterView {
    this.assertAuthenticated(authContext);
    const center = buildBlueprintFoundationCenter({
      seedRegistryCount: this.repository.getSeedRegistryCount(),
      publishedCount: this.repository.getPublishedCount(),
    });
    return toBlueprintFoundationCenterView(center);
  }

  getOverview(authContext: AuthContext): BlueprintFoundationCenterView["overview"] {
    return this.getFoundationCenter(authContext).overview;
  }

  transformService(
    authContext: AuthContext,
    input: { description: string; language?: string }
  ): BlueprintDraftView {
    this.assertAuthenticated(authContext);
    return toBlueprintDraftView(transformServiceDescription(input));
  }

  transformProfession(
    authContext: AuthContext,
    input: { profession: string; credentials?: string[]; experience_text?: string }
  ): BlueprintDraftView {
    this.assertAuthenticated(authContext);
    return toBlueprintDraftView(transformProfessionBinding(input));
  }

  transformProject(
    authContext: AuthContext,
    input: { project_name: string; goal_text: string }
  ): BlueprintDraftView {
    this.assertAuthenticated(authContext);
    return toBlueprintDraftView(transformProjectIntent(input));
  }

  validateBlueprint(authContext: AuthContext, blueprint: ActionBlueprintView): ValidationReportView {
    this.assertAuthenticated(authContext);
    const report = validateBlueprint(fromActionBlueprintView(blueprint));
    return toValidationReportView(report);
  }

  compilePreview(
    authContext: AuthContext,
    input: { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ): CompiledBlueprintPreview {
    this.assertAuthenticated(authContext);

    let blueprint: ActionBlueprint;
    if (input.blueprint) {
      blueprint = fromActionBlueprintView(input.blueprint);
    } else if (input.blueprint_id) {
      const entry = input.version
        ? this.repository.getPublishedVersion(input.blueprint_id, input.version)
        : this.repository.getLatestPublished(input.blueprint_id);
      if (!entry) {
        throw new Error(`Blueprint not found: ${input.blueprint_id}`);
      }
      blueprint = entry.blueprint;
    } else {
      throw new Error("blueprint or blueprint_id is required");
    }

    return compileBlueprintPreview(blueprint);
  }

  listRegistry(authContext: AuthContext): BlueprintRegistryIndexView {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listRegistryEntries();
    return {
      entries: entries.map((entry) => ({
        blueprint_id: entry.blueprint.blueprintId,
        version: entry.blueprint.version,
        status: entry.blueprint.status,
        primary_taxonomy_code: entry.blueprint.primaryTaxonomyCode,
        title: entry.blueprint.title,
        published_at: entry.publishedAt,
      })),
      total_count: entries.length,
      summary: `Blueprint registry index: ${entries.length} entries.`,
    };
  }

  getRegistryLatest(authContext: AuthContext, blueprintId: string): BlueprintRegistryEntryView {
    this.assertAuthenticated(authContext);
    const entry = this.repository.getLatestPublished(blueprintId);
    if (!entry) {
      throw new Error(`Published blueprint not found: ${blueprintId}`);
    }
    return toBlueprintRegistryEntryView(entry);
  }

  getRegistryVersion(
    authContext: AuthContext,
    blueprintId: string,
    version: string
  ): BlueprintRegistryEntryView {
    this.assertAuthenticated(authContext);
    const entry = this.repository.getPublishedVersion(blueprintId, version);
    if (!entry) {
      throw new Error(`Blueprint version not found: ${blueprintId}@${version}`);
    }
    return toBlueprintRegistryEntryView(entry);
  }

  getSchema(authContext: AuthContext): typeof BLUEPRINT_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return BLUEPRINT_JSON_SCHEMA;
  }

  getTaxonomyBridge(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      entries: buildTaxonomyBridge(),
      total_count: buildTaxonomyBridge().length,
      summary: "Taxonomy bridge for MVP action codes to blueprint skeletons.",
    };
  }

  publishBlueprint(authContext: AuthContext, blueprint: ActionBlueprintView): BlueprintRegistryEntryView {
    this.assertPlatformAdmin(authContext);
    const validated = applyValidatedStatus(
      fromActionBlueprintView(blueprint),
      validateBlueprint(fromActionBlueprintView(blueprint))
    );
    const entry = this.repository.publishBlueprint(validated);
    return toBlueprintRegistryEntryView(entry);
  }

  deprecateBlueprint(
    authContext: AuthContext,
    input: {
      blueprint_id: string;
      version: string;
      successor_blueprint_id?: string;
      successor_version?: string;
    }
  ): BlueprintRegistryEntryView {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.deprecateBlueprint({
      blueprintId: input.blueprint_id,
      version: input.version,
      successorBlueprintId: input.successor_blueprint_id,
      successorVersion: input.successor_version,
    });
    return toBlueprintRegistryEntryView(entry);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createActionBlueprintService(
  repository?: ActionBlueprintRepository
): ActionBlueprintService {
  return new ActionBlueprintService(repository);
}

export function createActionBlueprintModule(deps?: { rootDir?: string }) {
  const repository = createActionBlueprintRepository({ rootDir: deps?.rootDir });
  const actionBlueprint = createActionBlueprintService(repository);
  return { actionBlueprint };
}

export type ActionBlueprintModule = ReturnType<typeof createActionBlueprintModule>;
