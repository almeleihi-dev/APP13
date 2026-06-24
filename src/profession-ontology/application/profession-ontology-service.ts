import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import { toBlueprintDraftView } from "../../action-blueprint/domain/action-blueprint.js";
import type { BlueprintDraftView } from "../../action-blueprint/domain/action-blueprint.js";
import {
  PROFESSION_ONTOLOGY_JSON_SCHEMA,
} from "../domain/profession-schema.js";
import {
  buildProfessionOntologyCenter,
  toProfessionClassificationView,
  toProfessionOntologyCenterView,
  toProfessionOntologyEntryView,
  type ProfessionClassificationView,
  type ProfessionOntologyCenterView,
  type ProfessionOntologyEntryView,
} from "../domain/profession-ontology.js";
import {
  classifyProfessionInput,
  transformProfessionInput,
} from "../domain/profession-classifier.js";
import {
  buildGlobalProfessionHierarchy,
  buildSeedProfessionRegistry,
} from "../domain/profession-registry.js";
import {
  createProfessionOntologyRepository,
  type ProfessionOntologyRepository,
} from "../infrastructure/profession-ontology-repository.js";

export class ProfessionOntologyService {
  private readonly repository: ProfessionOntologyRepository;

  constructor(repository?: ProfessionOntologyRepository) {
    this.repository = repository ?? createProfessionOntologyRepository();
  }

  getCenter(authContext: AuthContext): ProfessionOntologyCenterView {
    this.assertAuthenticated(authContext);
    const center = buildProfessionOntologyCenter({
      registryCount: this.repository.getRegistryCount(),
      publishedCount: this.repository.getPublishedCount(),
    });
    return toProfessionOntologyCenterView(center);
  }

  getOverview(authContext: AuthContext): ProfessionOntologyCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  listRegistry(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    return {
      entries: entries.map((entry) => ({
        profession_id: entry.professionId,
        label: entry.label,
        category: entry.category,
        status: entry.status,
        primary_taxonomy_domain: entry.taxonomyBinding.primaryTaxonomyDomain,
        primary_taxonomy_code: entry.taxonomyBinding.primaryTaxonomyCode,
      })),
      total_count: entries.length,
      summary: `Profession ontology registry: ${entries.length} entries.`,
    };
  }

  getHierarchy(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const entries = this.repository.listEntries();
    return {
      hierarchy_levels: [
        "domain",
        "sub_domain",
        "profession",
        "specialization",
        "skill",
        "capability",
        "action_family",
      ],
      domain_summary: buildGlobalProfessionHierarchy(),
      professions: entries.map((entry) => ({
        profession_id: entry.professionId,
        label: entry.label,
        nodes: entry.hierarchy.nodes,
      })),
      summary: `Profession hierarchy across ${entries.length} registry professions.`,
    };
  }

  listProfessions(authContext: AuthContext): { professions: ProfessionOntologyEntryView[]; total_count: number } {
    this.assertAuthenticated(authContext);
    const professions = this.repository.listEntries().map(toProfessionOntologyEntryView);
    return { professions, total_count: professions.length };
  }

  getProfession(authContext: AuthContext, professionId: string): ProfessionOntologyEntryView {
    this.assertAuthenticated(authContext);
    const entry = this.repository.getById(professionId);
    if (!entry) {
      throw new Error(`Profession not found: ${professionId}`);
    }
    return toProfessionOntologyEntryView(entry);
  }

  classify(
    authContext: AuthContext,
    input: {
      profession_name?: string;
      trade?: string;
      specialization?: string;
      license?: string;
      certification?: string;
      cv_job_title?: string;
      business_category?: string;
    }
  ): ProfessionClassificationView {
    this.assertAuthenticated(authContext);
    return toProfessionClassificationView(classifyProfessionInput(input));
  }

  transform(
    authContext: AuthContext,
    input: {
      profession_name?: string;
      trade?: string;
      specialization?: string;
      license?: string;
      certification?: string;
      cv_job_title?: string;
      business_category?: string;
    }
  ): {
    classification: ProfessionClassificationView;
    blueprint_draft: BlueprintDraftView;
  } {
    this.assertAuthenticated(authContext);
    const result = transformProfessionInput(input);
    return {
      classification: toProfessionClassificationView(result.classification),
      blueprint_draft: toBlueprintDraftView(result.blueprintDraft),
    };
  }

  getBlueprintBindings(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const bindings = this.repository.listEntries().flatMap((entry) =>
      entry.blueprintBindings.map((binding) => ({
        profession_id: entry.professionId,
        profession_label: entry.label,
        blueprint_id: binding.blueprintId,
        version: binding.version,
        label: binding.label,
      }))
    );
    return {
      bindings,
      total_count: bindings.length,
      summary: "Profession to X40 ActionBlueprint bindings.",
    };
  }

  getTaxonomyBindings(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const bindings = this.repository.listEntries().map((entry) => ({
      profession_id: entry.professionId,
      profession_label: entry.label,
      primary_taxonomy_domain: entry.taxonomyBinding.primaryTaxonomyDomain,
      primary_taxonomy_code: entry.taxonomyBinding.primaryTaxonomyCode,
      min_provider_tier: entry.taxonomyBinding.minProviderTier,
    }));
    return {
      bindings,
      total_count: bindings.length,
      summary: "Profession to APP13 taxonomy bindings.",
    };
  }

  getSchema(authContext: AuthContext): typeof PROFESSION_ONTOLOGY_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return PROFESSION_ONTOLOGY_JSON_SCHEMA;
  }

  publish(authContext: AuthContext, entry: ProfessionOntologyEntryView): ProfessionOntologyEntryView {
    this.assertPlatformAdmin(authContext);
    const published = this.repository.publishEntry({
      professionId: entry.profession_id,
      label: entry.label,
      category: entry.category,
      status: "published",
      summary: entry.summary,
      aliases: entry.aliases,
      keywords: entry.keywords,
      skills: entry.skills,
      capabilities: entry.capabilities,
      credentials: entry.credentials,
      licenses: entry.licenses,
      relationships: entry.relationships,
      taxonomyBinding: entry.taxonomy_binding,
      blueprintBindings: entry.blueprint_bindings,
      actionFamilies: entry.action_families,
      hierarchy: entry.hierarchy,
      schemaVersion: entry.schema_version,
    });
    return toProfessionOntologyEntryView(published);
  }

  deprecate(
    authContext: AuthContext,
    input: { profession_id: string; successor_profession_id?: string }
  ): ProfessionOntologyEntryView {
    this.assertPlatformAdmin(authContext);
    const deprecated = this.repository.deprecateEntry({
      professionId: input.profession_id,
      successorProfessionId: input.successor_profession_id,
    });
    return toProfessionOntologyEntryView(deprecated);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createProfessionOntologyService(
  repository?: ProfessionOntologyRepository
): ProfessionOntologyService {
  return new ProfessionOntologyService(repository);
}

export function createProfessionOntologyModule(deps?: { rootDir?: string }) {
  const repository = createProfessionOntologyRepository({ rootDir: deps?.rootDir });
  const professionOntology = createProfessionOntologyService(repository);
  return { professionOntology };
}

export type ProfessionOntologyModule = ReturnType<typeof createProfessionOntologyModule>;

export { buildSeedProfessionRegistry };
