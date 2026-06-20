import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { User } from "../../identity/domain/user.js";
import { isEmailVerified, meetsTier } from "../../identity/domain/user.js";
import type { ContractTemplate } from "../templates/types.js";
import type { Action } from "../../action/domain/index.js";
import { isTekrrComplete } from "../../action/domain/index.js";

/** Constitutional + Contract Engine guards (CA-1, CA-8, P0-CE1, VR-001/002) */

export function assertActionReadyForContract(action: Action): void {
  if (action.status !== "ready_for_contract") {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "contract",
        detail: `Action must be ready_for_contract (current: ${action.status})`,
      })
    );
  }
  if (!isTekrrComplete(action.tekrrCompleteness)) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.TEKRR_INCOMPLETE,
        engine: "contract",
        detail: "TEKRR profile must be 100% complete before contract generation",
      })
    );
  }
}

export function assertTierGates(
  customer: User,
  provider: User | null,
  template: ContractTemplate
): void {
  if (!isEmailVerified(customer)) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.TIER_INSUFFICIENT,
        engine: "contract",
        detail: "Customer email must be verified",
      })
    );
  }
  if (!meetsTier(customer, template.minCustomerTier)) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.TIER_INSUFFICIENT,
        engine: "contract",
        detail: `Customer tier must be at least ${template.minCustomerTier}`,
      })
    );
  }
  if (provider && !meetsTier(provider, template.minProviderTier)) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.TIER_INSUFFICIENT,
        engine: "contract",
        detail: `Provider tier must be at least ${template.minProviderTier}`,
      })
    );
  }
}

export function assertDocumentHashAck(
  documentHash: string | null,
  documentHashAck?: string
): void {
  if (!documentHashAck || !documentHashAck.startsWith("sha256:")) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "contract",
        detail: "document_hash_ack required on accept (CL-5)",
      })
    );
  }
  const ack = documentHashAck.replace(/^sha256:/, "");
  const stored = documentHash?.replace(/^sha256:/, "") ?? "";
  if (ack !== stored) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "contract",
        detail: "document_hash_ack does not match contract document_hash",
      })
    );
  }
}

export function assertContractActive(status: string): void {
  if (status !== "active") {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.EXECUTION_BLOCKED,
        engine: "execution",
        detail: `Execution requires contract status active (current: ${status})`,
      })
    );
  }
}

/** CA-2 executable states for execution (MVP subset) */
export const CA2_EXECUTABLE_STATUSES = new Set([
  "active",
  "issue_raised",
  "disputed",
  "resolved",
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
