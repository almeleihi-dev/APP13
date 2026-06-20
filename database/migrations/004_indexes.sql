-- APP13 PostgreSQL Schema v1.1
-- Migration 004: Indexes (including EL-6 partial uniques)
-- Target: PostgreSQL 16+

BEGIN;

-- Dismissed reason code validation (Complaint Lifecycle EL codes)
ALTER TABLE complaint.complaints
    ADD CONSTRAINT ck_complaints_dismissed_reason_code
        CHECK (
            dismissed_reason_code IS NULL
            OR dismissed_reason_code IN (
                'OUT_OF_WINDOW', 'NOT_A_PARTY', 'INVALID_DIMENSION',
                'DUPLICATE_ACTIVE', 'CONTRACT_NOT_ACTIVE',
                'INSUFFICIENT_DETAIL', 'TYPE_MISMATCH'
            )
        );

-- ---------------------------------------------------------------------------
-- identity
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_status ON identity.users (status);
CREATE INDEX idx_users_role ON identity.users (role);
CREATE UNIQUE INDEX idx_users_email_lower ON identity.users (lower(email));
CREATE INDEX idx_customers_company_id ON identity.customers (company_id);
CREATE INDEX idx_providers_status ON identity.providers (status);
CREATE INDEX idx_verifications_user_id_status ON identity.verifications (user_id, status);
CREATE INDEX idx_verifications_expires_at ON identity.verifications (expires_at)
    WHERE expires_at IS NOT NULL;
CREATE INDEX idx_credentials_provider_id_status ON identity.credentials (provider_id, status);

-- ---------------------------------------------------------------------------
-- action & contract
-- ---------------------------------------------------------------------------

CREATE INDEX idx_actions_customer_id ON action.actions (customer_id);
CREATE INDEX idx_actions_provider_id ON action.actions (provider_id);
CREATE INDEX idx_actions_status ON action.actions (status);
CREATE INDEX idx_actions_action_code ON action.actions (action_code);
CREATE INDEX idx_actions_provider_customer_created ON action.actions (provider_id, customer_id, created_at DESC);

CREATE INDEX idx_contracts_status ON contract.contracts (status);
CREATE INDEX idx_contracts_customer_id ON contract.contracts (customer_id);
CREATE INDEX idx_contracts_provider_id ON contract.contracts (provider_id);
CREATE INDEX idx_contract_parties_contract_id ON contract.contract_parties (contract_id);

CREATE INDEX idx_contract_status_history_contract_created
    ON contract.contract_status_history (contract_id, created_at DESC);

CREATE INDEX idx_action_status_history_action_created
    ON action.action_status_history (action_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- execution
-- ---------------------------------------------------------------------------

CREATE INDEX idx_milestones_contract_id_sequence
    ON execution.milestones (contract_id, sequence_order);
CREATE INDEX idx_milestones_contract_status
    ON execution.milestones (contract_id, status);
CREATE INDEX idx_milestones_frozen_by_complaint
    ON execution.milestones (frozen_by_complaint_id)
    WHERE frozen_by_complaint_id IS NOT NULL;

CREATE INDEX idx_evidence_milestone_id ON execution.evidence (milestone_id);
CREATE INDEX idx_evidence_contract_id ON execution.evidence (contract_id);
CREATE UNIQUE INDEX uq_evidence_contract_content_hash
    ON execution.evidence (contract_id, content_hash)
    WHERE content_hash IS NOT NULL;

CREATE INDEX idx_attestations_contract_id ON execution.attestations (contract_id);
CREATE INDEX idx_attestation_milestones_attestation_id
    ON execution.attestation_milestones (attestation_id);

CREATE INDEX idx_milestone_status_history_milestone_created
    ON execution.milestone_status_history (milestone_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- complaint
-- ---------------------------------------------------------------------------

CREATE INDEX idx_cases_contract_id ON complaint.cases (contract_id);
CREATE INDEX idx_cases_status ON complaint.cases (status);

CREATE INDEX idx_case_dimensions_contract_dimension
    ON complaint.case_dimensions (contract_id, tekrr_dimension);
CREATE UNIQUE INDEX uq_case_dimensions_active
    ON complaint.case_dimensions (contract_id, tekrr_dimension)
    WHERE parent_status NOT IN ('closed', 'withdrawn');

CREATE INDEX idx_case_status_history_case_created
    ON complaint.case_status_history (case_id, created_at DESC);

CREATE INDEX idx_issues_contract_id ON complaint.issues (contract_id);
CREATE INDEX idx_issues_status ON complaint.issues (status);

CREATE INDEX idx_issue_dimensions_contract_dimension
    ON complaint.issue_dimensions (contract_id, tekrr_dimension);
CREATE UNIQUE INDEX uq_issue_dimensions_active
    ON complaint.issue_dimensions (contract_id, tekrr_dimension)
    WHERE parent_status NOT IN (
        'resolved_informally', 'withdrawn', 'expired', 'escalated'
    );

CREATE INDEX idx_issue_status_history_issue_created
    ON complaint.issue_status_history (issue_id, created_at DESC);

CREATE INDEX idx_complaints_contract_id ON complaint.complaints (contract_id);
CREATE INDEX idx_complaints_status_filed_at ON complaint.complaints (status, filed_at DESC);
CREATE INDEX idx_complaints_filed_by ON complaint.complaints (filed_by_user_id);
CREATE INDEX idx_complaints_issue_id ON complaint.complaints (issue_id)
    WHERE issue_id IS NOT NULL;
CREATE INDEX idx_complaints_active_queue ON complaint.complaints (status, filed_at DESC)
    WHERE status IN ('triage_pending', 'evidence_gathering', 'adjudication_pending');

CREATE INDEX idx_complaint_dimensions_contract_dimension
    ON complaint.complaint_dimensions (contract_id, tekrr_dimension);
CREATE UNIQUE INDEX uq_complaint_dimensions_active
    ON complaint.complaint_dimensions (contract_id, tekrr_dimension)
    WHERE parent_status NOT IN ('dismissed', 'closed');

CREATE INDEX idx_complaint_dimensions_active_lookup
    ON complaint.complaint_dimensions (contract_id, tekrr_dimension, parent_status);

CREATE INDEX idx_complaint_status_history_complaint_created
    ON complaint.complaint_status_history (complaint_id, created_at DESC);

CREATE INDEX idx_complaint_evidence_complaint_id ON complaint.complaint_evidence (complaint_id);
CREATE INDEX idx_mediation_records_complaint_id ON complaint.mediation_records (complaint_id);

-- ---------------------------------------------------------------------------
-- trust
-- ---------------------------------------------------------------------------

CREATE INDEX idx_trust_score_events_provider_occurred
    ON trust.trust_score_events (provider_id, occurred_at DESC);
CREATE INDEX idx_trust_score_events_source
    ON trust.trust_score_events (source_entity_type, source_entity_id);
CREATE INDEX idx_trust_score_events_event_type ON trust.trust_score_events (event_type);
CREATE INDEX idx_trust_score_events_contract_id
    ON trust.trust_score_events (contract_id)
    WHERE contract_id IS NOT NULL;

CREATE INDEX idx_trust_score_snapshots_provider_computed
    ON trust.trust_score_snapshots (provider_id, computed_at DESC);

CREATE INDEX idx_trust_score_event_corrections_original
    ON trust.trust_score_event_corrections (original_event_id);

-- ---------------------------------------------------------------------------
-- platform
-- ---------------------------------------------------------------------------

CREATE INDEX idx_audit_events_entity ON platform.audit_events (entity_type, entity_id);
CREATE INDEX idx_audit_events_created_at ON platform.audit_events (created_at DESC);
CREATE INDEX idx_audit_events_engine ON platform.audit_events (engine, created_at DESC);

CREATE INDEX idx_domain_outbox_unpublished
    ON platform.domain_outbox (created_at)
    WHERE published_at IS NULL;
CREATE INDEX idx_domain_outbox_engine_source_created
    ON platform.domain_outbox (engine_source, created_at DESC);

COMMIT;
