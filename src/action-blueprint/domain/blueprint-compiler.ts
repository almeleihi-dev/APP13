import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import type {
  ActionBlueprint,
  CompiledBlueprintPreview,
  CompiledMilestonePreview,
  CompiledTekrrPreview,
} from "./action-blueprint.js";
import { validateBlueprint } from "./action-blueprint.js";

export function compileBlueprintPreview(blueprint: ActionBlueprint): CompiledBlueprintPreview {
  const validation = validateBlueprint(blueprint);
  if (!validation.compilable) {
    throw new Error(validation.summary);
  }

  const template = getTemplateByActionCode(blueprint.primaryTaxonomyCode);
  const templateId = template?.templateId ?? blueprint.tekrrBinding.templateId;

  const tekrrPreview: CompiledTekrrPreview = {
    template_id: templateId,
    dimensions: blueprint.tekrrBinding.dimensions,
    required_fields: blueprint.tekrrBinding.requiredFields,
    field_checklist: blueprint.tekrrBinding.requiredFields.map((field) => ({
      dimension: field.dimension,
      field: field.field,
      populated: false,
    })),
  };

  const milestones: CompiledMilestonePreview[] = blueprint.milestonePattern.map((milestone) => ({
    sequence_order: milestone.sequenceOrder,
    milestone_code: milestone.milestoneCode,
    blocking: milestone.blocking,
    evidence_requirements: blueprint.evidenceRequirements.filter(
      (evidence) => evidence.milestoneCode === milestone.milestoneCode
    ),
  }));

  return {
    blueprint_id: blueprint.blueprintId,
    version: blueprint.version,
    primary_taxonomy_code: blueprint.primaryTaxonomyCode,
    template_id: templateId,
    tekrr_preview: tekrrPreview,
    milestones,
    evidence_matrix: blueprint.evidenceRequirements,
    preview_only: true,
    summary: `Compile preview for ${blueprint.blueprintId}@${blueprint.version} — no runtime records created.`,
  };
}
