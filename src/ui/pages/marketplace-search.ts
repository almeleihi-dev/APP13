import { createMarketplaceClient } from "../marketplace/marketplace-client.js";
import { buildMarketplaceWorkflowPayload, MVP_DEMO_PROVIDERS } from "../marketplace/marketplace-payload.js";
import { buildMarketplaceResultsView } from "./marketplace-results.js";
import type {
  AnalyzeMarketplaceResult,
  MarketplaceClientOptions,
  MarketplaceSearchInput,
  MarketplaceSearchPageModel,
  MarketplaceSearchValidationResult,
} from "../marketplace/types.js";

export function createMarketplaceSearchPageModel(): MarketplaceSearchPageModel {
  return {
    page_id: "marketplace-search",
    title: "Marketplace Search",
    description: "Describe your need and discover matched providers with pricing, trust, and contract readiness.",
    submit_label: "Analyze & Find Providers",
    fields: [
      {
        name: "request_text",
        label: "Request Text",
        required: true,
        type: "text",
        placeholder: "Describe the work you need completed",
      },
      {
        name: "budget",
        label: "Budget (SAR)",
        required: false,
        type: "number",
        placeholder: "Optional budget",
      },
      {
        name: "preferred_days",
        label: "Preferred Days",
        required: false,
        type: "number",
        placeholder: "Optional timeline in days",
      },
      {
        name: "category",
        label: "Category",
        required: false,
        type: "text",
        placeholder: "e.g. software_developer",
      },
    ],
  };
}

export function validateMarketplaceSearch(
  input: MarketplaceSearchInput
): MarketplaceSearchValidationResult {
  const errors: MarketplaceSearchValidationResult["errors"] = [];

  if (typeof input.request_text !== "string" || input.request_text.trim().length === 0) {
    errors.push({ field: "request_text", message: "Request text is required" });
  }

  if (input.budget !== undefined) {
    if (typeof input.budget !== "number" || !Number.isFinite(input.budget) || input.budget < 0) {
      errors.push({ field: "budget", message: "Budget must be a non-negative number" });
    }
  }

  if (input.preferred_days !== undefined) {
    if (
      typeof input.preferred_days !== "number" ||
      !Number.isFinite(input.preferred_days) ||
      input.preferred_days <= 0
    ) {
      errors.push({
        field: "preferred_days",
        message: "Preferred days must be a positive number",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function analyzeMarketplaceSearch(
  input: MarketplaceSearchInput,
  clientOptions: MarketplaceClientOptions,
  providers = MVP_DEMO_PROVIDERS
): Promise<AnalyzeMarketplaceResult> {
  const validation = validateMarketplaceSearch(input);
  if (!validation.valid) {
    throw new Error(validation.errors.map((error) => error.message).join("; "));
  }

  const client = createMarketplaceClient(clientOptions);
  const workflow = await client.analyzeAndFindProviders(input);

  const normalizedRequest: MarketplaceSearchInput = {
    request_text: input.request_text.trim(),
    budget: input.budget,
    preferred_days: input.preferred_days,
    category: input.category?.trim() || undefined,
  };

  return {
    request: normalizedRequest,
    workflow,
    view: buildMarketplaceResultsView(workflow, normalizedRequest, providers),
  };
}

export function renderMarketplaceSearchPage(model: MarketplaceSearchPageModel): string {
  const fields = model.fields
    .map(
      (field) =>
        `<label for="${field.name}">${field.label}${field.required ? " *" : ""}</label>` +
        `<input id="${field.name}" name="${field.name}" type="${field.type === "number" ? "number" : "text"}"` +
        `${field.placeholder ? ` placeholder="${field.placeholder}"` : ""}` +
        `${field.required ? " required" : ""} />`
    )
    .join("");

  return [
    `<section data-page="${model.page_id}">`,
    `<h1>${model.title}</h1>`,
    `<p>${model.description}</p>`,
    `<form data-action="analyze-marketplace">`,
    fields,
    `<button type="submit">${model.submit_label}</button>`,
    `</form>`,
    `</section>`,
  ].join("\n");
}

export { buildMarketplaceWorkflowPayload };
