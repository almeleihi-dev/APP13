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
    /"(\/(?:v1|ai|health|escrow|execution|evidence|disputes|trust|platform)[^"]+)"/g
  );
  return [...matches].map((match) => match[1]);
}

describe("S1 system verification", () => {
  it("indexes all bounded-context domain layers", () => {
    const domains = [
      "action/domain",
      "identity/domain",
      "contract/domain",
      "execution/domain",
      "financial/domain",
      "complaint/domain",
      "trust/domain",
    ];

    for (const domain of domains) {
      assert.ok(existsSync(join(SRC, domain)), `missing domain layer: ${domain}`);
    }
  });

  it("indexes P1–P10 UI clients and R1–R5 integration transports", () => {
    const uiClients = [
      "src/ui/workflow/workflow-client.ts",
      "src/ui/provider/provider-client.ts",
      "src/ui/marketplace/marketplace-client.ts",
      "src/ui/contract/contract-client.ts",
      "src/ui/escrow/escrow-client.ts",
      "src/ui/execution/execution-client.ts",
      "src/ui/evidence/evidence-client.ts",
      "src/ui/dispute/dispute-client.ts",
      "src/ui/trust/trust-client.ts",
      "src/ui/platform/platform-client.ts",
    ];

    const transports = [
      "src/ui/shared/workflow-api-transport.ts",
      "src/ui/shared/provider-api-transport.ts",
      "src/ui/shared/escrow-api-transport.ts",
      "src/ui/shared/execution-api-transport.ts",
      "src/ui/shared/evidence-api-transport.ts",
      "src/ui/shared/dispute-api-transport.ts",
      "src/ui/shared/trust-api-transport.ts",
      "src/ui/shared/platform-api-transport.ts",
    ];

    const integrationCore = [
      "src/integration/api-client.ts",
      "src/integration/request-executor.ts",
      "src/integration/api-response.ts",
      "src/integration/api-errors.ts",
      "src/integration/api-config.ts",
    ];

    for (const file of [...uiClients, ...transports, ...integrationCore]) {
      assert.ok(existsSync(join(ROOT, file)), `missing architecture file: ${file}`);
    }
  });

  it("registers AI-1 through AI-8 and workflow orchestrator routes in server bootstrap", () => {
    const server = readSource("src/api/server.ts");

    const aiRoutes = [
      "registerAiActionRoutes",
      "registerAiRequirementRoutes",
      "registerAiContractRoutes",
      "registerAiTrustRoutes",
      "registerAiMatchingRoutes",
      "registerAiPricingRoutes",
      "registerAiNegotiationRoutes",
      "registerAiWorkflowRoutes",
      "registerAiProviderRoutes",
    ];

    for (const registration of aiRoutes) {
      assert.match(server, new RegExp(registration));
    }
  });

  it("maps R2/R3 UI transports to implemented server AI endpoints", () => {
    const routeSources = readdirSync(join(SRC, "api/routes"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readSource(`src/api/routes/${file}`));

    const registeredPaths = routeSources.flatMap(collectRoutePaths);

    assert.ok(registeredPaths.includes("/ai/workflow/analyze"));
    assert.ok(registeredPaths.includes("/ai/providers/profile"));
  });

  it("implements all R4/R5 experience read endpoints on the server", () => {
    const routeSources = readdirSync(join(SRC, "api/routes"))
      .filter((file) => file.endsWith(".ts"))
      .map((file) => readSource(`src/api/routes/${file}`));

    const registeredPaths = routeSources.flatMap(collectRoutePaths);

    const uiExperienceReadPaths = [
      "/escrow/:id",
      "/escrow/:id/history",
      "/execution/:id/dashboard",
      "/execution/milestone/:id",
      "/evidence/:id",
      "/evidence/item/:id",
      "/evidence/:id/timeline",
      "/disputes/:id",
      "/disputes/:id/details",
      "/disputes/:id/timeline",
      "/trust/:id",
      "/trust/provider/:id",
      "/trust/:id/timeline",
      "/platform/home",
      "/platform/overview",
    ];

    for (const uiPath of uiExperienceReadPaths) {
      assert.ok(registeredPaths.includes(uiPath), `missing experience route ${uiPath}`);
    }
  });

  it("requires typed ApiResult methods on operational and governance UI clients", () => {
    const withApiResultClients: Array<{ file: string; methods: string[] }> = [
      {
        file: "src/ui/escrow/escrow-client.ts",
        methods: ["getEscrowOverviewWithApiResult", "getEscrowHistoryWithApiResult"],
      },
      {
        file: "src/ui/execution/execution-client.ts",
        methods: ["getExecutionDashboardWithApiResult", "getMilestoneDetailsWithApiResult"],
      },
      {
        file: "src/ui/evidence/evidence-client.ts",
        methods: [
          "getEvidenceOverviewWithApiResult",
          "getEvidenceDetailsWithApiResult",
          "getAttestationTimelineWithApiResult",
        ],
      },
      {
        file: "src/ui/dispute/dispute-client.ts",
        methods: [
          "getDisputeDashboardWithApiResult",
          "getDisputeDetailsWithApiResult",
          "getResolutionTimelineWithApiResult",
        ],
      },
      {
        file: "src/ui/trust/trust-client.ts",
        methods: [
          "getTrustCenterWithApiResult",
          "getProviderTrustReportWithApiResult",
          "getTrustTimelineWithApiResult",
        ],
      },
      {
        file: "src/ui/platform/platform-client.ts",
        methods: ["getPlatformHomeWithApiResult", "getPlatformOverviewWithApiResult"],
      },
    ];

    for (const client of withApiResultClients) {
      const source = readSource(client.file);
      for (const method of client.methods) {
        assert.match(source, new RegExp(`async ${method}\\(`));
      }
    }
  });

  it("preserves dependency boundary rules via dependency-cruiser", () => {
    const output = execSync("npm run lint:imports", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    assert.match(output, /no dependency violations found/);
  });

  it("reports no circular dependencies in the module graph", () => {
    const json = execSync(
      "npx dependency-cruiser src --config .dependency-cruiser.cjs --output-type json",
      { cwd: ROOT, encoding: "utf8" }
    );

    const graph = JSON.parse(json) as {
      summary: { error: number; violations: Array<{ rule?: { name?: string } }> };
      modules?: Array<{ dependencies?: Array<{ circular?: boolean }> }>;
    };

    assert.equal(graph.summary.error, 0);

    const circularModules =
      graph.modules?.filter((module) => module.dependencies?.some((dep) => dep.circular)) ?? [];

    assert.equal(circularModules.length, 0);
  });

  it("tracks duplicated UI presentation types across modules", () => {
    const uiTypeFiles = readdirSync(join(SRC, "ui"))
      .filter((entry) => existsSync(join(SRC, "ui", entry, "types.ts")))
      .map((entry) => readSource(`src/ui/${entry}/types.ts`));

    const cardFieldCount = uiTypeFiles.filter((source) =>
      /export interface CardField/.test(source)
    ).length;

    const responseCardCount = uiTypeFiles.filter((source) =>
      /export interface ResponseCard/.test(source)
    ).length;

    assert.equal(cardFieldCount, 10);
    assert.equal(responseCardCount, 10);
  });
});
