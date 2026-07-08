import type {
  ActionCapability,
  ActionProfile,
  ActionProfileSourceType,
  TaskDecomposition,
} from "../domain/action-profile.js";
import {
  calculateActionConfidence,
  calculateExperienceWeight,
  toMatchingSignals,
} from "../domain/action-profile.js";
import {
  ACTION_CATALOG,
  TASK_DECOMPOSITION_RULES,
  getCatalogActionByCode,
  keywordMatchStrength,
  normalizeSearchText,
  resolveDecompositionActions,
  type CatalogAction,
} from "../domain/action-catalog.js";

export interface ProviderProfileExtractionInput {
  providerId: string;
  sourceReference: string;
  profession?: string;
  skills?: string[];
  certifications?: string[];
  yearsExperience?: number;
  completedContracts?: number;
  previousActionCodes?: string[];
  profileText?: string;
}

export interface ExperienceExtractionInput {
  providerId: string;
  sourceReference: string;
  experienceText: string;
  roleTitle?: string;
  yearsExperience?: number;
  completedContracts?: number;
  certifications?: string[];
  previousActionCodes?: string[];
}

export interface BuildActionProfileInput {
  providerId: string;
  sourceType: ActionProfileSourceType;
  sourceReference: string;
  actions: ActionCapability[];
  generatedAt?: Date;
}

function buildCorpus(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function scoreCatalogAction(
  action: CatalogAction,
  corpus: string,
  input: {
    yearsExperience?: number;
    completedContracts?: number;
    certifications?: string[];
    previousActionCodes?: string[];
  }
): ActionCapability | null {
  const matchStrength = keywordMatchStrength(corpus, action.keywords);
  if (matchStrength <= 0) return null;

  const confidence = calculateActionConfidence({
    keywordMatchStrength: matchStrength,
    yearsExperience: input.yearsExperience,
    completedContracts: input.completedContracts,
    certifications: input.certifications,
    previousActionCodes: input.previousActionCodes,
    actionCode: action.actionCode,
  });

  return {
    actionCode: action.actionCode,
    actionName: action.actionName,
    confidence,
    experienceWeight: calculateExperienceWeight(confidence, input.yearsExperience),
  };
}

function extractActionsFromCorpus(
  corpus: string,
  input: {
    yearsExperience?: number;
    completedContracts?: number;
    certifications?: string[];
    previousActionCodes?: string[];
  }
): ActionCapability[] {
  const actions = ACTION_CATALOG.map((action) => scoreCatalogAction(action, corpus, input)).filter(
    (action): action is ActionCapability => action !== null
  );

  return actions.sort((left, right) => {
    if (right.confidence !== left.confidence) {
      return right.confidence - left.confidence;
    }
    return left.actionCode.localeCompare(right.actionCode);
  });
}

export class ActionIntelligenceService {
  extractActionsFromProviderProfile(
    input: ProviderProfileExtractionInput
  ): ActionCapability[] {
    const corpus = buildCorpus([
      input.profession,
      input.profileText,
      ...(input.skills ?? []),
      ...(input.certifications ?? []),
    ]);

    return extractActionsFromCorpus(corpus, {
      yearsExperience: input.yearsExperience,
      completedContracts: input.completedContracts,
      certifications: input.certifications,
      previousActionCodes: input.previousActionCodes,
    });
  }

  extractActionsFromExperience(input: ExperienceExtractionInput): ActionCapability[] {
    const corpus = buildCorpus([input.roleTitle, input.experienceText]);

    return extractActionsFromCorpus(corpus, {
      yearsExperience: input.yearsExperience,
      completedContracts: input.completedContracts,
      certifications: input.certifications,
      previousActionCodes: input.previousActionCodes,
    });
  }

  buildActionProfile(input: BuildActionProfileInput): ActionProfile {
    return {
      providerId: input.providerId,
      sourceType: input.sourceType,
      sourceReference: input.sourceReference,
      actions: [...input.actions].sort((left, right) => {
        if (right.confidence !== left.confidence) {
          return right.confidence - left.confidence;
        }
        return left.actionCode.localeCompare(right.actionCode);
      }),
      generatedAt: input.generatedAt ?? new Date(),
    };
  }

  decomposeTask(taskDescription: string): TaskDecomposition {
    const normalizedTask = normalizeSearchText(taskDescription);
    const rule = TASK_DECOMPOSITION_RULES.find((candidate) =>
      candidate.taskKeywords.some((keyword) => normalizedTask.includes(normalizeSearchText(keyword)))
    );

    if (!rule) {
      return { taskDescription, actions: [] };
    }

    const catalogActions = resolveDecompositionActions(rule.actionSlugs, rule.preferredCategories);

    return {
      taskDescription,
      actions: catalogActions.map((action, index) => ({
        actionCode: action.actionCode,
        actionName: action.actionName,
        sequenceOrder: index + 1,
      })),
    };
  }

  toMatchingSignals(profile: ActionProfile) {
    return toMatchingSignals(profile);
  }

  lookupCatalogAction(actionCode: string) {
    return getCatalogActionByCode(actionCode);
  }
}

export function createActionIntelligenceService(): ActionIntelligenceService {
  return new ActionIntelligenceService();
}

export {
  calculateActionConfidence,
  calculateExperienceWeight,
  toMatchingSignals,
} from "../domain/action-profile.js";
export {
  ACTION_CATALOG,
  TASK_DECOMPOSITION_RULES,
  getCatalogActionByCode,
  getCatalogActionBySlug,
  listCatalogActionsByCategory,
  keywordMatchStrength,
} from "../domain/action-catalog.js";
