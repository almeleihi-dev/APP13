import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { ActionIntelligenceService } from "../../action/intelligence/action-intelligence-service.js";
import type { RequirementIntelligenceService } from "../../action/intelligence/requirement/requirement-intelligence-service.js";
import type { ActionExtractResult } from "../../action/intelligence/types.js";
import type { RequirementExtractResult } from "../../action/intelligence/requirement/types.js";
import {
  buildDraftContract,
  buildUnknownContractResult,
  collectActionCodes,
  generateAcceptanceCriteria,
  generateMilestones,
  generateScopeOfWork,
  isUnknownIntelligence,
  normalizeWhitespace,
  resolveProfessionCategory,
} from "./contract-template-library.js";
import { buildEscrowPlan, getEscrowRule } from "./escrow-rule-library.js";
import { assessRisk } from "./risk-rule-library.js";
import type {
  ContractGenerateInput,
  ContractGenerateResult,
  ContractReadiness,
} from "./types.js";

function isEmptyRecord(value: unknown): boolean {
  return !value || typeof value !== "object" || Object.keys(value as object).length === 0;
}

function asActionExtractResult(value: Partial<ActionExtractResult>): ActionExtractResult {
  return {
    profession: value.profession ?? "unknown",
    confidence: value.confidence ?? 0,
    language_detected: value.language_detected ?? "en",
    actions: value.actions ?? [],
    skills: value.skills ?? [],
    deliverables: value.deliverables ?? [],
  };
}

function asRequirementExtractResult(
  value: Partial<RequirementExtractResult>
): RequirementExtractResult {
  return {
    language_detected: value.language_detected ?? "en",
    confidence: value.confidence ?? 0,
    suggested_actions: value.suggested_actions ?? [],
    deliverables: value.deliverables ?? [],
    milestones: value.milestones ?? [],
    missing_questions: value.missing_questions ?? [],
    contract_readiness: value.contract_readiness ?? "unknown",
  };
}

export class ContractIntelligenceService {
  constructor(
    private readonly actionIntelligence: ActionIntelligenceService,
    private readonly requirementIntelligence: RequirementIntelligenceService
  ) {}

  generate(input: ContractGenerateInput): ContractGenerateResult {
    const profession = normalizeWhitespace(input.profession ?? "");
    const requirementText = normalizeWhitespace(input.requirement_text ?? "");
    const contractValue = input.contract_value ?? 0;
    const currency = normalizeWhitespace(input.currency ?? "SAR") || "SAR";

    if (!profession && !requirementText && isEmptyRecord(input.ai1_result) && isEmptyRecord(input.ai2_result)) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "contract",
          detail:
            "At least one of profession, requirement_text, ai1_result, or ai2_result is required",
        })
      );
    }

    const ai1 = this.resolveAi1(input, profession, requirementText);
    const ai2 = this.resolveAi2(input, profession, requirementText);

    if (isUnknownIntelligence(ai1, ai2)) {
      return buildUnknownContractResult();
    }

    const resolvedProfession =
      profession ||
      (ai1.profession !== "unknown" ? ai1.profession : "") ||
      input.profession ||
      "general";
    const resolvedRequirement = requirementText || "Contract scope derived from AI extraction.";
    const category = resolveProfessionCategory(resolvedProfession, resolvedRequirement);
    const actionCodes = collectActionCodes(ai1, ai2);
    const escrowRule = getEscrowRule(category, actionCodes);

    const scope_of_work = generateScopeOfWork(ai1, ai2);
    const milestones = generateMilestones(ai2, escrowRule);
    const escrow_plan = buildEscrowPlan(escrowRule, milestones);
    const acceptance_criteria = generateAcceptanceCriteria(milestones, category);
    const contract_readiness = this.resolveContractReadiness(ai2.contract_readiness, ai2.missing_questions.length);

    const risk_profile = assessRisk({
      category,
      contractValue,
      currency,
      milestoneCount: escrowRule.milestoneCount,
      requirementText: resolvedRequirement,
      missingQuestionCount: ai2.missing_questions.length,
      ai2Confidence: ai2.confidence,
    });

    const draft_contract = buildDraftContract({
      profession: resolvedProfession,
      requirementText: resolvedRequirement,
      contractValue,
      currency,
      scope: scope_of_work,
      milestones,
      escrowPlan: escrow_plan,
      acceptanceCriteria: acceptance_criteria,
    });

    return {
      contract_readiness,
      risk_profile,
      scope_of_work,
      milestones,
      acceptance_criteria,
      escrow_plan,
      draft_contract,
    };
  }

  private resolveAi1(
    input: ContractGenerateInput,
    profession: string,
    requirementText: string
  ): ActionExtractResult {
    if (!isEmptyRecord(input.ai1_result)) {
      return asActionExtractResult(input.ai1_result as Partial<ActionExtractResult>);
    }

    if (!profession && !requirementText) {
      return asActionExtractResult({});
    }

    return this.actionIntelligence.extract({
      profession: profession || undefined,
      cv_text: requirementText || undefined,
    });
  }

  private resolveAi2(
    input: ContractGenerateInput,
    profession: string,
    requirementText: string
  ): RequirementExtractResult {
    if (!isEmptyRecord(input.ai2_result)) {
      return asRequirementExtractResult(input.ai2_result as Partial<RequirementExtractResult>);
    }

    if (!requirementText && !profession) {
      return asRequirementExtractResult({});
    }

    return this.requirementIntelligence.extract({
      requirement_text: requirementText || profession,
      profession_hint: profession || undefined,
    });
  }

  private resolveContractReadiness(
    ai2Readiness: ContractReadiness,
    missingQuestionCount: number
  ): ContractReadiness {
    if (ai2Readiness === "unknown") {
      return missingQuestionCount === 0 ? "needs_clarification" : "unknown";
    }
    return ai2Readiness;
  }
}

export function createContractIntelligenceService(
  actionIntelligence: ActionIntelligenceService,
  requirementIntelligence: RequirementIntelligenceService
): ContractIntelligenceService {
  return new ContractIntelligenceService(actionIntelligence, requirementIntelligence);
}
