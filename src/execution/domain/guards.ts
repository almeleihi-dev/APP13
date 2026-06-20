import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { ResponsibleParty } from "./milestone.js";
import { normalizeSha256Hash } from "./evidence.js";

/** CA-2 executable contract states — aligned with PostgreSQL is_contract_execution_allowed. */
export const CA2_EXECUTABLE_STATUSES = new Set([
  "active",
  "issue_raised",
  "disputed",
  "resolved",
  "completed",
  "closed",
]);

export function assertCa2Executable(status: string): void {
  if (!CA2_EXECUTABLE_STATUSES.has(status)) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.EXECUTION_BLOCKED,
        engine: "execution",
        detail: `Execution blocked in contract status ${status}`,
      })
    );
  }
}

/** P0-S4 — client must not supply storage_key on upload-intent. */
export function assertNoClientStorageKey(storageKey?: string | null): void {
  if (storageKey !== undefined && storageKey !== null && storageKey.trim() !== "") {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "execution",
        detail: "storage_key is server-generated and must not be supplied by client on upload-intent",
      })
    );
  }
}

export function assertContentHashFormat(contentHash?: string): void {
  if (!contentHash || !contentHash.startsWith("sha256:") || contentHash.length < 15) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "execution",
        detail: "content_hash must be sha256-prefixed",
      })
    );
  }
}

export function assertContentHashMatches(expected: string, actual: string): void {
  const normExpected = normalizeSha256Hash(expected).replace(/^sha256:/, "");
  const normActual = normalizeSha256Hash(actual).replace(/^sha256:/, "");
  if (normExpected !== normActual) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "execution",
        detail: "content_hash does not match upload intent or stored object",
      })
    );
  }
}

export function assertMilestoneUploadAuthorized(
  responsibleParty: ResponsibleParty,
  partyRoles: Set<"customer" | "provider">
): void {
  if (responsibleParty === "system") {
    throw new AppError(
      problem({
        title: "Forbidden",
        status: 403,
        code: ErrorCodes.FORBIDDEN,
        engine: "execution",
        detail: "Evidence upload not permitted for system milestones",
      })
    );
  }
  if (responsibleParty === "provider" && !partyRoles.has("provider")) {
    throw new AppError(
      problem({
        title: "Forbidden",
        status: 403,
        code: ErrorCodes.FORBIDDEN,
        engine: "execution",
        detail: "Provider party required for this milestone",
      })
    );
  }
  if (responsibleParty === "customer" && !partyRoles.has("customer")) {
    throw new AppError(
      problem({
        title: "Forbidden",
        status: 403,
        code: ErrorCodes.FORBIDDEN,
        engine: "execution",
        detail: "Customer party required for this milestone",
      })
    );
  }
  if (responsibleParty === "both" && !partyRoles.has("customer") && !partyRoles.has("provider")) {
    throw new AppError(
      problem({
        title: "Forbidden",
        status: 403,
        code: ErrorCodes.FORBIDDEN,
        engine: "execution",
        detail: "Contract party membership required",
      })
    );
  }
}
