import type { AuthContext } from "../../shared/auth/index.js";
import type { CONNECTED_ENGINES, PIPELINE_STAGES } from "./orchestration-schema.js";
import { DEFAULT_INTENT } from "./orchestration-schema.js";

export type ConnectedEngine = (typeof CONNECTED_ENGINES)[number];
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface UnifiedRequest {
  userId: string;
  intent: string;
  listingId?: string;
  generatedAt: string;
}

export interface UnifiedContext {
  userId: string;
  roles: string[];
  tier: string;
  intent: string;
  normalizedIntent: string;
  intentCategory: string;
  requiredEngines: ConnectedEngine[];
  listingId?: string;
  generatedAt: string;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function normalizeIntent(intent: string): string {
  return intent.trim().toLowerCase().replace(/\s+/g, " ");
}

function classifyIntent(normalizedIntent: string): string {
  if (/supervisor|supervise|lead team|team lead/.test(normalizedIntent)) return "supervisor_growth";
  if (/learn|skill|training|mentor/.test(normalizedIntent)) return "learning";
  if (/earn|income|money|opportunity|marketplace/.test(normalizedIntent)) return "income";
  if (/team|build team|join team/.test(normalizedIntent)) return "team";
  if (/develop|roadmap|readiness|grow/.test(normalizedIntent)) return "development";
  return "general_guidance";
}

export function resolveRequiredEngines(intentCategory: string): ConnectedEngine[] {
  const base: ConnectedEngine[] = [
    "personal_assistant",
    "develop_me",
    "knowledge_bank",
  ];

  switch (intentCategory) {
    case "supervisor_growth":
      return [
        ...base,
        "develop_me",
        "learn_by_action",
        "expert_network",
        "team_builder",
        "marketplace_compilation",
        "intelligent_pricing",
        "governance",
      ];
    case "learning":
      return [
        ...base,
        "learn_by_action",
        "expert_network",
        "knowledge_bank",
        "develop_me",
      ];
    case "income":
      return [
        ...base,
        "personal_assistant",
        "marketplace_compilation",
        "intelligent_pricing",
        "intelligent_commission",
        "team_builder",
      ];
    case "team":
      return [
        ...base,
        "team_builder",
        "expert_network",
        "learn_by_action",
        "marketplace_compilation",
      ];
    case "development":
      return [
        ...base,
        "develop_me",
        "learn_by_action",
        "personal_assistant",
        "expert_network",
      ];
    default:
      return [
        ...base,
        "learn_by_action",
        "expert_network",
        "team_builder",
        "marketplace_compilation",
        "intelligent_pricing",
        "action_blueprint",
        "execution_blueprint",
        "tekrr_intelligence",
      ];
  }
}

export function buildUnifiedContext(input: {
  authContext: AuthContext;
  intent?: string;
  listingId?: string;
  generatedAt?: string;
}): UnifiedContext {
  const intent = input.intent?.trim() || DEFAULT_INTENT;
  const normalizedIntent = normalizeIntent(intent);
  const intentCategory = classifyIntent(normalizedIntent);
  const requiredEngines = [...new Set(resolveRequiredEngines(intentCategory))];

  return {
    userId: input.authContext.userId,
    roles: input.authContext.roles,
    tier: input.authContext.tier ?? "T1",
    intent,
    normalizedIntent,
    intentCategory,
    requiredEngines,
    listingId: input.listingId,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}

export function buildRequestFingerprint(context: UnifiedContext): string {
  return `orch://${context.userId}/${stableHash(context.normalizedIntent)}/${context.listingId ?? "default"}`;
}
