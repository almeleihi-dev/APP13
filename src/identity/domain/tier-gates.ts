import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { User } from "./user.js";
import { isEmailVerified } from "./user.js";

export class TierGateError extends AppError {
  constructor(detail: string, code = ErrorCodes.TIER_INSUFFICIENT) {
    super(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code,
        engine: "identity",
        detail,
      })
    );
  }
}

/** B2.9 / MVP Scope — action create requires verified email at T0 */
export function requireEmailVerifiedForActionCreate(user: User): void {
  if (!isEmailVerified(user)) {
    throw new TierGateError(
      "Email verification required before creating actions",
      ErrorCodes.TIER_INSUFFICIENT
    );
  }
}
