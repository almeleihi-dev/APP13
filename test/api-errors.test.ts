import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
  isNotFoundError,
  isUnauthorizedError,
  isValidationError,
  mapHttpStatusToError,
} from "../src/integration/api-errors.js";
import { createValidationResponse, extractErrorBody, mapFetchToApiResponse } from "../src/integration/api-response.js";

describe("R1 api errors", () => {
  it("maps validation failures from HTTP 400 and 422", () => {
    const badRequest = mapHttpStatusToError(400, {
      code: "INVALID_INPUT",
      message: "provider_id is required",
    });
    const unprocessable = mapHttpStatusToError(422, {
      detail: "Missing required field",
      code: "VALIDATION_ERROR",
    });

    assert.ok(badRequest instanceof ValidationError);
    assert.equal(badRequest.status, 400);
    assert.equal(badRequest.message, "provider_id is required");

    assert.ok(unprocessable instanceof ValidationError);
    assert.equal(unprocessable.code, "VALIDATION_ERROR");
  });

  it("maps unauthorized and forbidden responses", () => {
    const unauthorized = mapHttpStatusToError(401, {
      code: "UNAUTHORIZED",
      detail: "Authentication required",
    });
    const forbidden = mapHttpStatusToError(403, {
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    });

    assert.ok(unauthorized instanceof UnauthorizedError);
    assert.ok(isUnauthorizedError(unauthorized));
    assert.equal(unauthorized.message, "Authentication required");

    assert.ok(forbidden instanceof ForbiddenError);
    assert.equal(forbidden.status, 403);
  });

  it("maps not found and conflict responses", () => {
    const notFound = mapHttpStatusToError(404, {
      code: "NOT_FOUND",
      message: "Dispute not found",
    });
    const conflict = mapHttpStatusToError(409, {
      code: "CONFLICT",
      message: "Contract already active",
    });

    assert.ok(notFound instanceof NotFoundError);
    assert.ok(isNotFoundError(notFound));
    assert.ok(conflict instanceof ConflictError);
    assert.equal(conflict.message, "Contract already active");
  });

  it("maps unknown statuses to ApiError", () => {
    const error = mapHttpStatusToError(500, { message: "Internal server error" });

    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 500);
    assert.equal(error.message, "Internal server error");
  });

  it("extracts error bodies from common API payload shapes", () => {
    assert.deepEqual(extractErrorBody({ code: "X", message: "Failed" }), {
      code: "X",
      message: "Failed",
    });
    assert.deepEqual(extractErrorBody({ title: "Bad Request", detail: "Invalid UUID" }), {
      code: "Bad Request",
      message: "Invalid UUID",
    });
  });

  it("creates validation responses with unified shape", () => {
    const response = createValidationResponse("provider_id must be a valid UUID");

    assert.equal(response.success, false);
    assert.equal(response.error?.code, "VALIDATION_ERROR");
    assert.equal(response.error?.message, "provider_id must be a valid UUID");
  });

  it("maps fetch responses to unified success and error shapes", () => {
    const success = mapFetchToApiResponse<{ id: string }>(200, { id: "abc" });
    const failure = mapFetchToApiResponse(404, {
      code: "NOT_FOUND",
      message: "Missing resource",
    });

    assert.equal(success.success, true);
    assert.deepEqual(success.data, { id: "abc" });
    assert.equal(failure.success, false);
    assert.equal(failure.error?.code, "NOT_FOUND");
  });

  it("exposes timeout error type", () => {
    const timeout = new TimeoutError();

    assert.equal(timeout.status, 408);
    assert.equal(timeout.code, "TIMEOUT");
    assert.ok(isValidationError(new ValidationError("bad input")));
  });
});
