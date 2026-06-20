import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";

export const PASSWORD_MIN_LENGTH = 12;

export function validatePassword(password: string): void {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "identity",
        detail: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      })
    );
  }
}
