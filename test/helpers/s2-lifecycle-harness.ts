import { randomUUID } from "node:crypto";
import { createActionService } from "../../src/action/application/action-service.js";
import { createActionIntelligenceService } from "../../src/action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "../../src/action/intelligence/requirement/requirement-intelligence-service.js";
import { createContractEngineService } from "../../src/contract/application/contract-engine.service.js";
import { createContractIntelligenceService } from "../../src/contract/intelligence/contract-intelligence-service.js";
import { contractRepository } from "../../src/contract/infrastructure/contract-repository.js";
import { createIssueService } from "../../src/complaint/application/issue-service.js";
import { createExecutionService } from "../../src/execution/application/execution-service.js";
import { createEscrowService } from "../../src/financial/application/escrow-service.js";
import { createLedgerService } from "../../src/financial/application/ledger-service.js";
import { identityRepository } from "../../src/identity/infrastructure/identity-repository.js";
import { createMatchingIntelligenceService } from "../../src/matching/intelligence/matching-intelligence-service.js";
import { createNegotiationIntelligenceService } from "../../src/negotiation/intelligence/negotiation-intelligence-service.js";
import { createWorkflowIntelligenceService } from "../../src/orchestrator/intelligence/workflow-intelligence-service.js";
import { createPricingIntelligenceService } from "../../src/pricing/intelligence/pricing-intelligence-service.js";
import { createTrustIntelligenceService } from "../../src/trust/intelligence/trust-intelligence-service.js";
import { S3ObjectStorage } from "../../src/platform/storage/index.js";
import type { DbPool } from "../../src/shared/db/index.js";
import type { MatchingProvider } from "../../src/matching/intelligence/types.js";
import type { TrustBehaviorMetrics } from "../../src/trust/intelligence/types.js";
import {
  FULL_TEKRR_PROFILE,
  resetContractEngineData,
  seedPartyUsers,
  type SeedUsers,
} from "./postgres-integration.js";
import { DEFAULT_S3_CONFIG, putObjectViaPresignedUrl, sha256ContentHash } from "./minio-integration.js";

export const S2_REQUIREMENT_TEXT =
  "Build a React TypeScript software application website with backend API integration, admin dashboard, mobile app delivery in 3 weeks by month end sprint deadline.";

export const S2_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440001";

export const S2_TRUST_METRICS: TrustBehaviorMetrics = {
  completed_contracts: 52,
  completion_rate: 0.96,
  average_rating: 4.8,
  refund_rate: 0.01,
  issue_rate: 0.03,
  evidence_quality_score: 0.9,
  identity_verification_level: "iron",
};

export interface S2IntelligenceResult {
  workflowStatus: string;
  selectedProviderId: string;
  contractMilestones: number;
  escrowStrategy: string;
  trustScore: number;
  negotiationState: string;
}

export function runS2IntelligencePipeline(): S2IntelligenceResult {
  const requirementIntelligence = createRequirementIntelligenceService();
  const matchingIntelligence = createMatchingIntelligenceService();
  const pricingIntelligence = createPricingIntelligenceService();
  const negotiationIntelligence = createNegotiationIntelligenceService();
  const contractIntelligence = createContractIntelligenceService(
    createActionIntelligenceService(),
    requirementIntelligence
  );
  const trustIntelligence = createTrustIntelligenceService();
  const workflowIntelligence = createWorkflowIntelligenceService();

  const ai2 = requirementIntelligence.extract({
    requirement_text: S2_REQUIREMENT_TEXT,
    profession_hint: "software_developer",
  });

  const providers: MatchingProvider[] = [
    {
      provider_id: S2_PROVIDER_ID,
      action_codes: ["E.3.1", "B.3.3"],
      skills: ["frontend", "backend", "deployment"],
      price_estimate: 12000,
      trust_score: 92,
      average_rating: 4.8,
      available_now: true,
    },
    {
      provider_id: "550e8400-e29b-41d4-a716-446655440002",
      action_codes: ["A.4.2"],
      skills: ["cleaning"],
      price_estimate: 400,
      trust_score: 60,
      average_rating: 3.5,
      available_now: true,
    },
  ];

  const ai5 = matchingIntelligence.rank({
    requirement: {
      required_action_codes: ai2.suggested_actions.map((action) => action.action_code),
      required_skills: ["frontend", "backend"],
      budget: 15000,
      currency: "SAR",
      urgent: false,
    },
    providers,
  });

  const selected = ai5.ranked_matches[0]!;

  const ai6 = pricingIntelligence.calculate({
    profession: "software_developer",
    action_codes: ai2.suggested_actions.map((action) => action.action_code),
    trust_score: selected.component_scores.trust,
    complexity: "medium",
    estimated_days: 14,
    urgent: false,
    location_tier: "metro",
  });

  const ai7 = negotiationIntelligence.analyze({
    customer_offer: 400,
    provider_offer: 500,
    customer_days: 3,
    provider_days: 2,
    trust_score: selected.component_scores.trust,
    contract_value: ai6.price_range.recommended,
  });

  const ai3 = contractIntelligence.generate({
    profession: "software_developer",
    requirement_text: S2_REQUIREMENT_TEXT,
    contract_value: ai6.price_range.recommended,
    currency: "SAR",
    ai2_result: ai2,
  });

  const workflow = workflowIntelligence.analyze({
    profession: "software_developer",
    requirement_text: S2_REQUIREMENT_TEXT,
    customer_budget: 15000,
    customer_days: 14,
    providers: [
      {
        provider_id: S2_PROVIDER_ID,
        action_codes: ["E.3.1", "B.3.3"],
        skills: ["frontend", "backend"],
        trust_score: 92,
        rating: 4.8,
        price_offer: 12000,
        estimated_days: 14,
      },
    ],
  });

  const ai4 = trustIntelligence.calculate({
    provider_id: S2_PROVIDER_ID,
    metrics: S2_TRUST_METRICS,
  });

  return {
    workflowStatus: workflow.workflow_status,
    selectedProviderId: workflow.matching.selected_provider_id,
    contractMilestones: ai3.milestones.length,
    escrowStrategy: ai3.escrow_plan.release_strategy,
    trustScore: ai4.trust_score,
    negotiationState: ai7.negotiation_state,
  };
}

export async function resetS2FinancialData(db: DbPool): Promise<void> {
  await db.query(`
    TRUNCATE TABLE
      financial.processor_webhook_log,
      financial.settlement_instructions,
      financial.payment_intents,
      financial.escrow_status_history,
      financial.ledger_entries,
      financial.journals,
      financial.escrow_agreements,
      financial.accounts
    RESTART IDENTITY CASCADE
  `);
  await resetContractEngineData(db);
}

export async function activateS2Contract(db: DbPool, parties: SeedUsers) {
  const actions = createActionService(db, identityRepository);
  const contracts = createContractEngineService(db, identityRepository);

  const created = await actions.createAction(parties.customerUserId, {
    action_type_code: "A.2.1",
    title: "S2 lifecycle contract",
  });
  await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
  for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
    await actions.updateTekrrDimension(
      created.id,
      parties.customerUserId,
      dimension as keyof typeof FULL_TEKRR_PROFILE,
      data
    );
  }

  const { contract } = await contracts.generateContract(
    created.id,
    parties.customerUserId,
    `s2-generate-${randomUUID()}`
  );
  const documentHash = contract.document_hash;

  await contracts.transitionContract(contract.id, parties.customerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });
  await contracts.transitionContract(contract.id, parties.providerUserId, {
    transition: "accept",
    document_hash_ack: documentHash,
  });

  return { contract, actions, contracts };
}

function createExecution(db: DbPool) {
  return createExecutionService(db, contractRepository, new S3ObjectStorage(DEFAULT_S3_CONFIG));
}

function createFinancial(db: DbPool) {
  const ledger = createLedgerService(db);
  const escrow = createEscrowService(db, ledger);
  const issues = createIssueService(db, contractRepository, undefined, escrow);
  return { ledger, escrow, issues };
}

export interface S2HappyPathOperationalResult {
  contractId: string;
  customerUserId: string;
  escrowStatus: string;
  milestoneStatus: string;
  disputeCount: number;
  trustScore: number;
  intelligence: S2IntelligenceResult;
}

export async function runS2HappyPathOperational(
  db: DbPool
): Promise<S2HappyPathOperationalResult> {
  await resetS2FinancialData(db);
  const parties = await seedPartyUsers(db);
  const intelligence = runS2IntelligencePipeline();
  const { contract } = await activateS2Contract(db, parties);
  const { escrow } = createFinancial(db);
  const execution = createExecution(db);

  await escrow.createForContract({
    contractId: contract.id,
    grossAmountMinor: 80_000,
    platformFeeMinor: 8_000,
    currencyCode: "USD",
    idempotencyKey: `s2-escrow-create-${randomUUID()}`,
  });
  await escrow.markFunded({
    contractId: contract.id,
    idempotencyKey: `s2-escrow-funded-${randomUUID()}`,
  });
  await escrow.holdFunds({
    contractId: contract.id,
    idempotencyKey: `s2-escrow-hold-${randomUUID()}`,
  });

  const milestones = await db.query<{ id: string; milestone_code: string }>(
    `SELECT id, milestone_code FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order`,
    [contract.id]
  );
  const access = milestones.rows.find((m) => m.milestone_code === "M-ACCESS")!;

  const body = Buffer.from("s2-happy-path-evidence");
  const contentHash = sha256ContentHash(body);
  const intent = await execution.createEvidenceUploadIntent(
    contract.id,
    access.id,
    parties.providerUserId,
    {
      evidence_type: "EV-PHOTO",
      content_hash: contentHash,
      idempotency_key: `s2-upload-${randomUUID()}`,
    }
  );
  await putObjectViaPresignedUrl(intent.upload_url, body, "image/jpeg");
  await execution.confirmEvidence(contract.id, access.id, parties.providerUserId, {
    intent_id: intent.intent_id,
    storage_key: intent.storage_key,
    content_hash: contentHash,
    evidence_type: "EV-PHOTO",
    idempotency_key: `s2-confirm-${randomUUID()}`,
  });

  await execution.transitionMilestone(contract.id, access.id, parties.providerUserId, "start");
  await execution.transitionMilestone(contract.id, access.id, parties.providerUserId, "submit");
  await execution.transitionMilestone(contract.id, access.id, parties.customerUserId, "accept");

  await db.query(
    `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
    [contract.id]
  );
  await escrow.releaseAfterAcceptance({
    contractId: contract.id,
    idempotencyKey: `s2-escrow-release-${randomUUID()}`,
  });

  const trust = createTrustIntelligenceService().calculate({
    provider_id: parties.providerId,
    metrics: S2_TRUST_METRICS,
  });

  const disputeCount = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM complaint.issues WHERE contract_id = $1`,
    [contract.id]
  );

  const escrowRow = await escrow.getByContractId(contract.id);
  const milestone = await db.query<{ status: string }>(
    `SELECT status FROM execution.milestones WHERE id = $1`,
    [access.id]
  );

  return {
    contractId: contract.id,
    customerUserId: parties.customerUserId,
    escrowStatus: escrowRow!.status,
    milestoneStatus: milestone.rows[0]!.status,
    disputeCount: Number(disputeCount.rows[0]!.count),
    trustScore: trust.trust_score,
    intelligence,
  };
}

export interface S2DisputePathOperationalResult {
  contractId: string;
  customerUserId: string;
  issueId: string;
  escrowStatus: string;
  milestoneStatus: string;
  resolutionStatus: string;
  trustScore: number;
}

export async function runS2DisputePathOperational(
  db: DbPool
): Promise<S2DisputePathOperationalResult> {
  await resetS2FinancialData(db);
  const parties = await seedPartyUsers(db);
  runS2IntelligencePipeline();
  const { contract } = await activateS2Contract(db, parties);
  const { escrow, issues } = createFinancial(db);
  const execution = createExecution(db);

  await escrow.createForContract({
    contractId: contract.id,
    grossAmountMinor: 90_000,
    platformFeeMinor: 9_000,
    currencyCode: "USD",
    idempotencyKey: `s2-dispute-create-${randomUUID()}`,
  });
  await escrow.markFunded({
    contractId: contract.id,
    idempotencyKey: `s2-dispute-funded-${randomUUID()}`,
  });
  await escrow.holdFunds({
    contractId: contract.id,
    idempotencyKey: `s2-dispute-hold-${randomUUID()}`,
  });

  const milestone = await db.query<{ id: string }>(
    `SELECT id FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order LIMIT 1`,
    [contract.id]
  );
  const milestoneId = milestone.rows[0]!.id;

  await execution.transitionMilestone(contract.id, milestoneId, parties.providerUserId, "start");
  await execution.transitionMilestone(contract.id, milestoneId, parties.providerUserId, "submit");
  await execution.transitionMilestone(contract.id, milestoneId, parties.customerUserId, "dispute");

  const issue = await issues.createIssue(parties.customerUserId, {
    contract_id: contract.id,
    description: "S2 dispute path — milestone delivery rejected by customer",
    dimensions: [{ tekrr_dimension: "S" }],
    milestone_ids: [milestoneId],
    idempotency_key: `s2-issue-${randomUUID()}`,
  });

  await contractRepository.transition(db.pool, contract.id, "disputed", parties.customerUserId, "issue_raised");
  await contractRepository.transition(db.pool, contract.id, "resolved", parties.customerUserId, "disputed");

  await escrow.unfreezeAfterIssueResolved({
    contractId: contract.id,
    actorUserId: parties.customerUserId,
  });

  await db.query(
    `UPDATE financial.escrow_agreements SET status = 'awaiting_acceptance' WHERE contract_id = $1`,
    [contract.id]
  );
  await escrow.releaseAfterAcceptance({
    contractId: contract.id,
    idempotencyKey: `s2-dispute-release-${randomUUID()}`,
  });

  const trust = createTrustIntelligenceService().calculate({
    provider_id: parties.providerId,
    metrics: {
      ...S2_TRUST_METRICS,
      issue_rate: 0.12,
      refund_rate: 0.08,
    },
  });

  const escrowRow = await escrow.getByContractId(contract.id);
  const milestoneRow = await db.query<{ status: string }>(
    `SELECT status FROM execution.milestones WHERE id = $1`,
    [milestoneId]
  );
  const contractRow = await db.query<{ status: string }>(
    `SELECT status FROM contract.contracts WHERE id = $1`,
    [contract.id]
  );

  return {
    contractId: contract.id,
    customerUserId: parties.customerUserId,
    issueId: issue.id,
    escrowStatus: escrowRow!.status,
    milestoneStatus: milestoneRow.rows[0]!.status,
    resolutionStatus: contractRow.rows[0]!.status,
    trustScore: trust.trust_score,
  };
}
