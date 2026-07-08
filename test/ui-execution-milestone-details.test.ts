import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutionClient, ExecutionClientError } from "../src/ui/execution/execution-client.js";
import {
  MVP_ACTIVE_EXECUTION_SOURCE,
  MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE,
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
  MVP_MILESTONE_WIP_ID,
  validateMilestoneDetailsRequest,
} from "../src/ui/execution/execution-payload.js";
import {
  buildMilestoneDetailsView,
  createMilestoneDetailsPageModel,
  renderMilestoneDetailsPage,
} from "../src/ui/pages/milestone-details.js";

describe("P6 milestone details page", () => {
  it("validates milestone details request", () => {
    const valid = validateMilestoneDetailsRequest({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });
    assert.equal(valid.valid, true);

    const invalid = validateMilestoneDetailsRequest({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
      milestone_id: "bad-id",
    });
    assert.equal(invalid.valid, false);
  });

  it("projects milestone details with evidence items", () => {
    const view = buildMilestoneDetailsView(MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_ACCESS_ID);

    assert.ok(view);
    assert.equal(view?.milestone.name, "Access / Kickoff");
    assert.equal(view?.milestone.status, "accepted");
    assert.equal(view?.evidence.length, 2);
    assert.equal(view?.escrow_status, "held");
  });

  it("projects in-progress milestone details", () => {
    const view = buildMilestoneDetailsView(MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_WIP_ID);

    assert.ok(view);
    assert.equal(view?.milestone.status, "in_progress");
    assert.equal(view?.evidence.length, 1);
    assert.equal(view?.evidence[0]?.evidenceType, "EV-NOTE");
  });

  it("handles milestone with empty evidence", () => {
    const milestoneId = MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE.milestones[0]!.id;
    const view = buildMilestoneDetailsView(MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE, milestoneId);

    assert.ok(view);
    assert.equal(view?.evidence.length, 0);

    const model = createMilestoneDetailsPageModel(MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE, milestoneId);
    assert.ok(model);
    const html = renderMilestoneDetailsPage(model!);
    assert.match(html, /No evidence submitted for this milestone/);
  });

  it("returns null for unknown milestone", () => {
    const view = buildMilestoneDetailsView(MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_WIP_ID.slice(0, -1) + "9");
    assert.equal(view, null);
  });

  it("loads milestone details through execution client", async () => {
    const client = new ExecutionClient({
      dashboardExecutor: async () => MVP_ACTIVE_EXECUTION_SOURCE,
    });

    const result = await client.getMilestoneDetails({
      contract_id: MVP_EXECUTION_CONTRACT_ID,
      milestone_id: MVP_MILESTONE_ACCESS_ID,
    });

    assert.equal(result.view.milestone.milestoneCode, "M-ACCESS");
    assert.equal(result.view.evidence.length, 2);
  });

  it("returns 404 for missing milestone via client", async () => {
    const client = new ExecutionClient({
      dashboardExecutor: async () => MVP_ACTIVE_EXECUTION_SOURCE,
    });

    await assert.rejects(
      () =>
        client.getMilestoneDetails({
          contract_id: MVP_EXECUTION_CONTRACT_ID,
          milestone_id: "990e8400-e29b-41d4-a716-446655440099",
        }),
      (error) => error instanceof ExecutionClientError && error.status === 404
    );
  });

  it("renders milestone details page markup", () => {
    const model = createMilestoneDetailsPageModel(MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_WIP_ID);
    assert.ok(model);

    const html = renderMilestoneDetailsPage(model!);

    assert.match(html, /data-page="milestone-details"/);
    assert.match(html, /data-milestone-id="990e8400-e29b-41d4-a716-446655440002"/);
    assert.match(html, /data-section="milestone-summary"/);
    assert.match(html, /data-section="milestone-evidence"/);
    assert.match(html, /data-evidence-id="aa0e8400-e29b-41d4-a716-446655440003"/);
    assert.match(html, /Escrow Status/);
  });
});
