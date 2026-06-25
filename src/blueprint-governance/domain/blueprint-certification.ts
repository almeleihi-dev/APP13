import { CERTIFICATION_LEVELS } from "./registry-schema.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { validateBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import { compileExecutionBlueprint } from "../../execution-blueprint/domain/execution-compiler.js";
import { validateExecutionBlueprint } from "../../execution-blueprint/domain/execution-blueprint.js";

export type CertificationLevel = (typeof CERTIFICATION_LEVELS)[number];

export interface CertificationReport {
  level: CertificationLevel;
  score: number;
  qualityScore: number;
  tekrrScore: number;
  executionScore: number;
  blueprintValid: boolean;
  tekrrValid: boolean;
  executionValid: boolean;
  summary: string;
}

const CERTIFICATION_THRESHOLDS: Array<{ level: CertificationLevel; minScore: number }> = [
  { level: "platinum", minScore: 95 },
  { level: "gold", minScore: 85 },
  { level: "silver", minScore: 75 },
  { level: "bronze", minScore: 60 },
  { level: "unverified", minScore: 0 },
];

function resolveCertificationLevel(score: number): CertificationLevel {
  for (const threshold of CERTIFICATION_THRESHOLDS) {
    if (score >= threshold.minScore) {
      return threshold.level;
    }
  }
  return "unverified";
}

export function certifyBlueprint(blueprint: ActionBlueprint): CertificationReport {
  const blueprintValidation = validateBlueprint(blueprint);
  const tekrrProfile = synthesizeTekrrProfile({ blueprint });
  const executionBlueprint = compileExecutionBlueprint({ blueprint });
  const executionValidation = validateExecutionBlueprint(executionBlueprint);

  const blueprintScore = blueprintValidation.valid ? 100 : 50;
  const tekrrScore = tekrrProfile.executionScore.score;
  const executionScore = executionValidation.valid ? executionValidation.completenessScore : 40;

  const qualityScore = Math.round((blueprintScore + tekrrScore + executionScore) / 3);
  const score = Math.round(qualityScore * 0.4 + tekrrScore * 0.3 + executionScore * 0.3);
  const level = resolveCertificationLevel(score);

  return {
    level,
    score,
    qualityScore,
    tekrrScore,
    executionScore,
    blueprintValid: blueprintValidation.valid,
    tekrrValid: tekrrScore >= 60,
    executionValid: executionValidation.valid,
    summary: `Certification ${level} at score ${score} for ${blueprint.blueprintId}@${blueprint.version}.`,
  };
}

export function upgradeCertification(input: {
  currentLevel: CertificationLevel;
  targetLevel: CertificationLevel;
  report: CertificationReport;
}): CertificationLevel {
  const order = CERTIFICATION_LEVELS;
  const currentIndex = order.indexOf(input.currentLevel);
  const targetIndex = order.indexOf(input.targetLevel);
  const earnedIndex = order.indexOf(resolveCertificationLevel(input.report.score));

  if (targetIndex <= currentIndex) {
    return input.currentLevel;
  }
  if (targetIndex > earnedIndex) {
    throw new Error(`Cannot certify to ${input.targetLevel}: earned level is ${resolveCertificationLevel(input.report.score)}`);
  }
  return input.targetLevel;
}

export function listCertificationLevels(): CertificationLevel[] {
  return [...CERTIFICATION_LEVELS];
}
