import { createWorkflowClient } from "../workflow/workflow-client.js";
import { buildWorkflowResultView } from "./request-result.js";
import type {
  AnalyzeRequestResult,
  CustomerRequestInput,
  CustomerRequestValidationResult,
  RequestAnalysisPageModel,
  WorkflowClientOptions,
} from "../workflow/types.js";

export function createRequestAnalysisPageModel(): RequestAnalysisPageModel {
  return {
    page_id: "request-analysis",
    title: "Customer Request",
    description: "Describe your requirement and analyze matches, pricing, and contract readiness.",
    submit_label: "Analyze Request",
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
    ],
  };
}

export function validateCustomerRequest(input: CustomerRequestInput): CustomerRequestValidationResult {
  const errors: CustomerRequestValidationResult["errors"] = [];

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

export async function analyzeCustomerRequest(
  input: CustomerRequestInput,
  clientOptions: WorkflowClientOptions
): Promise<AnalyzeRequestResult> {
  const validation = validateCustomerRequest(input);
  if (!validation.valid) {
    throw new Error(validation.errors.map((error) => error.message).join("; "));
  }

  const client = createWorkflowClient(clientOptions);
  const workflow = await client.analyzeRequest(input);

  return {
    request: {
      request_text: input.request_text.trim(),
      budget: input.budget,
      preferred_days: input.preferred_days,
    },
    workflow,
    view: buildWorkflowResultView(workflow, input),
  };
}

export function renderRequestAnalysisPage(model: RequestAnalysisPageModel): string {
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
    `<form data-action="analyze-request">`,
    fields,
    `<button type="submit">${model.submit_label}</button>`,
    `</form>`,
    `</section>`,
  ].join("\n");
}
