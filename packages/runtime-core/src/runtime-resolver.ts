import { SEMANTIC_COLOR_TOKEN_PATHS } from "@an-act/tokens";
import type {
  AnActRuntimeScreenView,
  RuntimeComponentInstance,
  RuntimeValidationIssue,
  RuntimeValidationResult,
} from "./types.js";
import { CORE_UI_COMPONENT_IDS } from "./types.js";

const REQUIRED_STRING_FIELDS: (keyof AnActRuntimeScreenView)[] = [
  "screenId",
  "prototypeId",
  "route",
  "layoutId",
  "generatedAt",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushIssue(
  issues: RuntimeValidationIssue[],
  path: string,
  code: string,
  message: string
): void {
  issues.push({ path, code, message });
}

function validateComponent(
  component: unknown,
  path: string,
  issues: RuntimeValidationIssue[]
): component is RuntimeComponentInstance {
  if (!isRecord(component)) {
    pushIssue(issues, path, "invalid_type", "Component must be an object");
    return false;
  }
  if (typeof component.id !== "string" || !component.id) {
    pushIssue(issues, `${path}.id`, "required", "Component id is required");
  }
  if (typeof component.componentId !== "string" || !component.componentId) {
    pushIssue(issues, `${path}.componentId`, "required", "Component componentId is required");
  } else if (!CORE_UI_COMPONENT_IDS.includes(component.componentId as (typeof CORE_UI_COMPONENT_IDS)[number])) {
    pushIssue(
      issues,
      `${path}.componentId`,
      "unknown_component",
      `Unknown componentId: ${component.componentId}`
    );
  }
  if (!isRecord(component.props)) {
    pushIssue(issues, `${path}.props`, "required", "Component props must be an object");
  }
  return issues.every((i) => !i.path.startsWith(path));
}

export function validateRuntimeScreenView(input: unknown): RuntimeValidationResult {
  const issues: RuntimeValidationIssue[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      issues: [{ path: "$", code: "invalid_type", message: "Screen view must be an object" }],
    };
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof input[field] !== "string" || !input[field]) {
      pushIssue(issues, field, "required", `${field} is required`);
    }
  }

  if (input.mode !== "need" && input.mode !== "action" && input.mode !== "transition") {
    pushIssue(issues, "mode", "invalid_enum", "mode must be need, action, or transition");
  }

  if (!Array.isArray(input.regions)) {
    pushIssue(issues, "regions", "invalid_type", "regions must be an array");
  }

  if (!Array.isArray(input.sections)) {
    pushIssue(issues, "sections", "invalid_type", "sections must be an array");
  } else {
    input.sections.forEach((section, index) => {
      const sectionPath = `sections[${index}]`;
      if (!isRecord(section)) {
        pushIssue(issues, sectionPath, "invalid_type", "Section must be an object");
        return;
      }
      if (typeof section.id !== "string") {
        pushIssue(issues, `${sectionPath}.id`, "required", "Section id is required");
      }
      if (!Array.isArray(section.components)) {
        pushIssue(issues, `${sectionPath}.components`, "invalid_type", "Section components must be an array");
      } else {
        section.components.forEach((component, cIndex) => {
          validateComponent(component, `${sectionPath}.components[${cIndex}]`, issues);
        });
      }
    });
  }

  if (Array.isArray(input.designTokens)) {
    for (const token of input.designTokens) {
      if (
        typeof token !== "string" ||
        !SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])
      ) {
        pushIssue(issues, "designTokens", "invalid_token", `Invalid design token path: ${String(token)}`);
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function assertRuntimeScreenView(input: unknown): AnActRuntimeScreenView {
  const result = validateRuntimeScreenView(input);
  if (!result.valid) {
    const summary = result.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
    throw new Error(`Invalid runtime screen view: ${summary}`);
  }
  return input as AnActRuntimeScreenView;
}

export function isRuntimeScreenView(input: unknown): input is AnActRuntimeScreenView {
  return validateRuntimeScreenView(input).valid;
}
