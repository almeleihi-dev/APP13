import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import { MVP_CONTRACT_WORKFLOW_INPUT, buildContractWorkflowPayload } from "../src/ui/contract/contract-payload.js";
import { MVP_MILESTONE_ESCROW_SOURCE } from "../src/ui/escrow/escrow-payload.js";
import { ExecutionClient, ExecutionClientError } from "../src/ui/execution/execution-client.js";
import {
  MVP_ACTIVE_EXECUTION_SOURCE,
  MVP_COMPLETED_EXECUTION_SOURCE,
  MVP_DISPUTED_EXECUTION_SOURCE,
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
  buildExecutionSourceFromWorkflowAndEscrow,
  validateExecutionDashboardRequest,
} from "../src/ui/execution/execution-payload.js";
import {
  buildExecutionDashboardView,
  createExecutionDashboardPageModel,
  renderExecutionDashboardPage,
  renderResponseCard,
} from "../src/ui/pages/execution-dashboard.js";

describe("P6 execution dashboard page", () => {
  it("validates execution dashboard request", () => {
    const valid = validateExecutionDashboardRequest({ contract_id: MVP_EXECUTION_CONTRACT_ID });
    assert.equal(valid.valid, true);

    const invalid = validateExecutionDashboardRequest({ contract_id: "invalid" });
    assert.equal(invalid.valid, false);
  });

  it("projects active execution into dashboard cards", () => {
    const view = buildExecutionDashboardView(MVP_ACTIVE_EXECUTION_SOURCE);

    assert.equal(view.contract_status, "active");
    assert.equal(view.project_status.id, "project-status");
    assert.equal(view.progress.summary, "25%");
    assert.equal(view.active_milestones.summary, "1");
    assert.equal(view.evidence_summary.fields[0]?.value, "3");
    assert.equal(view.acceptance_status.fields[2]?.value, "3");
    assert.equal(view.escrow_status.fields[1]?.value, "held");
    assert.ok(view.timeline.fields.length >= 1);
    assert.match(view.risk_indicators.fields[5]?.value ?? "", /Pending attestations/);
    assert.equal(view.final_evaluation.fields[0]?.value, "pending");
  });

  it("projects completed execution with final evaluation", () => {
    const view = buildExecutionDashboardView(MVP_COMPLETED_EXECUTION_SOURCE);

    assert.equal(view.contract_status, "completed");
    assert.equal(view.progress.summary, "100%");
    assert.equal(view.final_evaluation.summary, "5");
    assert.equal(view.risk_indicators.summary, "No active risks");
  });

  it("projects disputed execution risk indicators", () => {
    const view = buildExecutionDashboardView(MVP_DISPUTED_EXECUTION_SOURCE);

    assert.equal(view.contract_status, "disputed");
    assert.equal(view.escrow_status.fields[1]?.value, "frozen");
    assert.equal(view.risk_indicators.fields[1]?.value, "1");
    assert.match(view.risk_indicators.fields[5]?.value ?? "", /Disputed milestone/);
  });

  it("loads dashboard through execution client executor", async () => {
    const client = new ExecutionClient({
      dashboardExecutor: async () => MVP_ACTIVE_EXECUTION_SOURCE,
    });

    const result = await client.getExecutionDashboard({ contract_id: MVP_EXECUTION_CONTRACT_ID });
    assert.equal(result.view.progress.fields[1]?.value, "1/4");
  });

  it("returns 404 when execution fixture is missing without executor", async () => {
    const client = new ExecutionClient();

    await assert.rejects(
      () => client.getExecutionDashboard({ contract_id: "990e8400-e29b-41d4-a716-446655440099" }),
      (error) => error instanceof ExecutionClientError && error.status === 404
    );
  });

  it("renders execution dashboard page markup", () => {
    const html = renderExecutionDashboardPage(createExecutionDashboardPageModel(MVP_ACTIVE_EXECUTION_SOURCE));

    assert.match(html, /data-page="execution-dashboard"/);
    assert.match(html, /data-card="project-status"/);
    assert.match(html, /data-card="progress"/);
    assert.match(html, /data-card="active-milestones"/);
    assert.match(html, /data-card="evidence-summary"/);
    assert.match(html, /data-card="acceptance-status"/);
    assert.match(html, /data-card="escrow-status"/);
    assert.match(html, /data-card="timeline"/);
    assert.match(html, /data-card="risk-indicators"/);
    assert.match(html, /data-card="final-evaluation"/);
  });

  it("renders reusable response card markup", () => {
    const view = buildExecutionDashboardView(MVP_ACTIVE_EXECUTION_SOURCE);
    const html = renderResponseCard(view.progress);

    assert.match(html, /data-card="progress"/);
    assert.match(html, /Percent Complete/);
  });
});

describe("P6 execution dashboard integration", () => {
  it("combines workflow, contract, and escrow snapshots without business rule duplication", () => {
    const workflow = createWorkflowIntelligenceService().analyze(
      buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
    );

    const source = buildExecutionSourceFromWorkflowAndEscrow(workflow, MVP_MILESTONE_ESCROW_SOURCE, {
      ...MVP_ACTIVE_EXECUTION_SOURCE,
      contract: {
        ...MVP_ACTIVE_EXECUTION_SOURCE.contract,
        title: workflow.contract?.draft_contract.title ?? MVP_ACTIVE_EXECUTION_SOURCE.contract.title,
      },
    });

    const view = buildExecutionDashboardView(source);

    assert.equal(source.escrow.status, "held");
    assert.equal(view.escrow_status.fields[1]?.value, "held");
    assert.ok(view.project_status.fields[2]?.value.length >= 1);
  });

  it("preserves milestone card data from execution snapshot override", () => {
    const workflow = createWorkflowIntelligenceService().analyze(
      buildContractWorkflowPayload(MVP_CONTRACT_WORKFLOW_INPUT)
    );

    const source = buildExecutionSourceFromWorkflowAndEscrow(
      workflow,
      MVP_MILESTONE_ESCROW_SOURCE,
      MVP_ACTIVE_EXECUTION_SOURCE
    );
    const view = buildExecutionDashboardView(source);

    assert.equal(view.active_milestones.summary, "1");
    assert.ok(
      source.milestones.some((milestone) => milestone.id === MVP_MILESTONE_ACCESS_ID)
    );
  });
});
