import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function collectRoutePaths(source: string): string[] {
  const matches = source.matchAll(
    /"(\/(?:v1|ai|auth|health|escrow|execution|evidence|disputes|trust|platform|internal)[^"]+)"/g
  );
  return [...matches].map((match) => match[1]);
}

describe("S2 integration verification", () => {
  it("maps lifecycle AI endpoints for request → contract chain", () => {
    const routeSources = readdirSync(join(SRC, "api/routes"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readSource(`src/api/routes/${file}`));
    const paths = routeSources.flatMap(collectRoutePaths);

    const lifecycleAiPaths = [
      "/ai/workflow/analyze",
      "/ai/requirements/extract",
      "/ai/matching/rank",
      "/ai/pricing/calculate",
      "/ai/negotiation/analyze",
      "/ai/contracts/generate",
      "/ai/trust/calculate",
    ];

    for (const path of lifecycleAiPaths) {
      assert.ok(paths.includes(path), `missing lifecycle AI route ${path}`);
    }
  });

  it("maps operational write routes for contract, escrow, execution, and complaints", () => {
    const routeSources = readdirSync(join(SRC, "api/routes"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readSource(`src/api/routes/${file}`));
    const paths = routeSources.flatMap(collectRoutePaths);

    const operationalPaths = [
      "/v1/actions",
      "/v1/actions/:actionId/contract/generate",
      "/v1/contracts/:contractId/transitions",
      "/v1/contracts/:contractId/milestones/:milestoneId/transitions",
      "/v1/issues",
    ];

    for (const path of operationalPaths) {
      assert.ok(paths.includes(path), `missing operational route ${path}`);
    }
  });

  it("maps B7 experience read routes used by R4/R5 clients", () => {
    const routeSources = readdirSync(join(SRC, "api/routes"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readSource(`src/api/routes/${file}`));
    const paths = routeSources.flatMap(collectRoutePaths);

    const experiencePaths = [
      "/escrow/:id",
      "/execution/:id/dashboard",
      "/evidence/:id",
      "/disputes/:id",
      "/trust/:id",
      "/platform/home",
    ];

    for (const path of experiencePaths) {
      assert.ok(paths.includes(path), `missing experience route ${path}`);
    }
  });

  it("maps B8 security auth routes", () => {
    const authRoutes = readSource("src/api/routes/security-auth.ts");
    const paths = collectRoutePaths(authRoutes);

    for (const path of ["/auth/register", "/auth/login", "/auth/refresh", "/auth/logout", "/auth/me"]) {
      assert.ok(paths.includes(path), `missing auth route ${path}`);
    }
  });

  it("aligns R4/R5 client transport paths with server experience routes", () => {
    const escrowTransport = readSource("src/ui/shared/escrow-api-transport.ts");
    const disputeTransport = readSource("src/ui/shared/dispute-api-transport.ts");
    const platformTransport = readSource("src/ui/shared/platform-api-transport.ts");

    assert.match(escrowTransport, /`\/escrow\/\$\{escrowId\}`/);
    assert.match(disputeTransport, /`\/disputes\/\$\{disputeId\}`/);
    assert.match(platformTransport, /const path = "\/platform\/home"/);
  });

  it("indexes reusable security guards and ownership registry", () => {
    const securityIndex = readSource("src/security/index.ts");
    assert.match(securityIndex, /requireAuth/);
    assert.match(securityIndex, /requireRole/);
    assert.match(securityIndex, /requireOwnership/);
    assert.match(securityIndex, /createDefaultOwnershipRegistry/);
    assert.match(securityIndex, /createAuditActionMiddleware/);
  });

  it("indexes S2 lifecycle harness for end-to-end simulation", () => {
    assert.ok(existsSync(join(ROOT, "test/helpers/s2-lifecycle-harness.ts")));
    const harness = readSource("test/helpers/s2-lifecycle-harness.ts");
    assert.match(harness, /runS2IntelligencePipeline/);
    assert.match(harness, /runS2HappyPathOperational/);
    assert.match(harness, /runS2DisputePathOperational/);
  });

  it("preserves dependency boundary rules via dependency-cruiser", () => {
    const output = execSync("npm run lint:imports", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    assert.match(output, /no dependency violations found/);
  });
});
