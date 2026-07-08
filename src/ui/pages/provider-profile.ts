import { createProviderClient } from "../provider/provider-client.js";
import { buildProviderDashboardView } from "./provider-dashboard.js";
import type {
  AnalyzeProviderResult,
  ProviderClientOptions,
  ProviderProfileFormInput,
  ProviderProfilePageModel,
  ProviderProfileValidationResult,
} from "../provider/types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOCATION_TIERS = ["metro", "city", "rural"] as const;

export function createProviderProfilePageModel(): ProviderProfilePageModel {
  return {
    page_id: "provider-profile",
    title: "Provider Profile",
    description: "Submit provider credentials and analyze capability, trust, pricing, and risk.",
    submit_label: "Analyze Provider",
    fields: [
      {
        name: "provider_id",
        label: "Provider ID",
        required: true,
        type: "text",
        placeholder: "UUID",
      },
      {
        name: "profession",
        label: "Profession",
        required: false,
        type: "text",
        placeholder: "e.g. software_developer",
      },
      {
        name: "profile_text",
        label: "Profile Text",
        required: false,
        type: "text",
        placeholder: "Describe skills, experience, and services",
      },
      {
        name: "years_experience",
        label: "Years Experience",
        required: false,
        type: "number",
      },
      {
        name: "certifications",
        label: "Certifications",
        required: false,
        type: "text",
        placeholder: "Comma-separated values",
      },
      {
        name: "licenses",
        label: "Licenses",
        required: false,
        type: "text",
        placeholder: "Comma-separated values",
      },
      {
        name: "completed_contracts",
        label: "Completed Contracts",
        required: false,
        type: "number",
      },
      {
        name: "completion_rate",
        label: "Completion Rate",
        required: false,
        type: "number",
        placeholder: "0 to 1",
      },
      {
        name: "issue_rate",
        label: "Issue Rate",
        required: false,
        type: "number",
        placeholder: "0 to 1",
      },
      {
        name: "refund_rate",
        label: "Refund Rate",
        required: false,
        type: "number",
        placeholder: "0 to 1",
      },
      {
        name: "rating",
        label: "Rating",
        required: false,
        type: "number",
        placeholder: "0 to 5",
      },
      {
        name: "availability_hours_per_week",
        label: "Availability Hours Per Week",
        required: false,
        type: "number",
      },
      {
        name: "active_contracts",
        label: "Active Contracts",
        required: false,
        type: "number",
      },
      {
        name: "average_price",
        label: "Average Price (SAR)",
        required: false,
        type: "number",
      },
      {
        name: "location_tier",
        label: "Location Tier",
        required: false,
        type: "text",
        placeholder: "metro, city, or rural",
      },
    ],
  };
}

export function validateProviderProfile(input: ProviderProfileFormInput): ProviderProfileValidationResult {
  const errors: ProviderProfileValidationResult["errors"] = [];
  const providerId = input.provider_id?.trim() ?? "";

  if (providerId.length === 0) {
    errors.push({ field: "provider_id", message: "Provider ID is required" });
  } else if (!UUID_PATTERN.test(providerId)) {
    errors.push({ field: "provider_id", message: "Provider ID must be a valid UUID" });
  }

  const numericFields: Array<keyof ProviderProfileFormInput> = [
    "years_experience",
    "completed_contracts",
    "completion_rate",
    "issue_rate",
    "refund_rate",
    "rating",
    "availability_hours_per_week",
    "active_contracts",
    "average_price",
  ];

  for (const field of numericFields) {
    const value = input[field];
    if (value === undefined) continue;

    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      errors.push({ field, message: `${field} must be a non-negative number` });
    }
  }

  if (input.rating !== undefined && input.rating > 5) {
    errors.push({ field: "rating", message: "Rating must be between 0 and 5" });
  }

  for (const field of ["completion_rate", "issue_rate", "refund_rate"] as const) {
    const value = input[field];
    if (value !== undefined && value > 1) {
      errors.push({ field, message: `${field} must be between 0 and 1` });
    }
  }

  if (input.location_tier !== undefined && !LOCATION_TIERS.includes(input.location_tier)) {
    errors.push({
      field: "location_tier",
      message: "Location tier must be one of: metro, city, rural",
    });
  }

  return { valid: errors.length === 0, errors };
}

export async function analyzeProviderProfile(
  input: ProviderProfileFormInput,
  clientOptions: ProviderClientOptions
): Promise<AnalyzeProviderResult> {
  const validation = validateProviderProfile(input);
  if (!validation.valid) {
    throw new Error(validation.errors.map((error) => error.message).join("; "));
  }

  const client = createProviderClient(clientOptions);
  const profile = await client.analyzeProvider(input);

  return {
    request: {
      ...input,
      provider_id: input.provider_id.trim(),
      profession: input.profession?.trim() || undefined,
      profile_text: input.profile_text?.trim() || undefined,
    },
    profile,
    view: buildProviderDashboardView(profile),
  };
}

export function renderProviderProfilePage(model: ProviderProfilePageModel): string {
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
    `<form data-action="analyze-provider">`,
    fields,
    `<button type="submit">${model.submit_label}</button>`,
    `</form>`,
    `</section>`,
  ].join("\n");
}
