import type { WorkflowAnalyzeInput } from "../../orchestrator/intelligence/types.js";
import type { CustomerRequestInput } from "./types.js";

/** MVP demo provider catalog for customer request flow (integration data only). */
export const MVP_DEMO_PROVIDERS: WorkflowAnalyzeInput["providers"] = [
  {
    provider_id: "550e8400-e29b-41d4-a716-446655440001",
    action_codes: ["E.3.1", "B.3.3"],
    skills: ["frontend", "backend", "deployment"],
    trust_score: 92,
    rating: 4.8,
    price_offer: 12000,
    estimated_days: 14,
    latitude: 24.7,
    longitude: 46.68,
  },
  {
    provider_id: "550e8400-e29b-41d4-a716-446655440002",
    action_codes: ["A.4.2"],
    skills: ["cleaning", "sanitization"],
    trust_score: 80,
    rating: 4.5,
    price_offer: 400,
  },
];

export function buildWorkflowAnalyzePayload(
  input: CustomerRequestInput,
  providers: WorkflowAnalyzeInput["providers"] = MVP_DEMO_PROVIDERS
): WorkflowAnalyzeInput {
  return {
    requirement_text: input.request_text.trim(),
    customer_budget: input.budget,
    customer_days: input.preferred_days,
    providers,
  };
}
