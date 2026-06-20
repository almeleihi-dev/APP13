-- APP13 PostgreSQL Schema v1.1
-- Migration 003: Foreign keys, uniqueness, and check constraints
-- Target: PostgreSQL 16+
-- ADR-001, ADR-002, ADR-003, Database Architecture v1.1

BEGIN;

-- ---------------------------------------------------------------------------
-- identity foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE identity.customers
    ADD CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_customers_company
        FOREIGN KEY (company_id) REFERENCES identity.companies (id) ON DELETE SET NULL;

ALTER TABLE identity.providers
    ADD CONSTRAINT fk_providers_user
        FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE RESTRICT;

ALTER TABLE identity.verifications
    ADD CONSTRAINT fk_verifications_user
        FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_verifications_reviewer
        FOREIGN KEY (reviewed_by_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

ALTER TABLE identity.verification_documents
    ADD CONSTRAINT fk_verification_documents_verification
        FOREIGN KEY (verification_id) REFERENCES identity.verifications (id) ON DELETE RESTRICT;

ALTER TABLE identity.credentials
    ADD CONSTRAINT fk_credentials_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_credentials_verification
        FOREIGN KEY (verification_id) REFERENCES identity.verifications (id) ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- action foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE action.actions
    ADD CONSTRAINT fk_actions_customer
        FOREIGN KEY (customer_id) REFERENCES identity.customers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_actions_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_actions_company
        FOREIGN KEY (company_id) REFERENCES identity.companies (id) ON DELETE SET NULL,
    ADD CONSTRAINT ck_actions_domain
        CHECK (domain IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H')),
    ADD CONSTRAINT ck_actions_tekrr_completeness
        CHECK (tekrr_completeness BETWEEN 0 AND 100);

ALTER TABLE action.action_status_history
    ADD CONSTRAINT fk_action_status_history_action
        FOREIGN KEY (action_id) REFERENCES action.actions (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_action_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- contract foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE contract.contracts
    ADD CONSTRAINT fk_contracts_action
        FOREIGN KEY (action_id) REFERENCES action.actions (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_contracts_customer
        FOREIGN KEY (customer_id) REFERENCES identity.customers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_contracts_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_contracts_action_id UNIQUE (action_id),
    ADD CONSTRAINT uq_contracts_contract_number UNIQUE (contract_number),
    ADD CONSTRAINT ck_contracts_active_parties_required
        CHECK (
            status <> 'active'
            OR (customer_id IS NOT NULL AND provider_id IS NOT NULL)
        );

ALTER TABLE contract.contract_parties
    ADD CONSTRAINT fk_contract_parties_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_contract_parties_user
        FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_contract_parties_contract_user_role UNIQUE (contract_id, user_id, party_role);

ALTER TABLE contract.contract_status_history
    ADD CONSTRAINT fk_contract_status_history_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_contract_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- execution foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE execution.milestones
    ADD CONSTRAINT fk_milestones_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_milestones_contract_sequence_session
        UNIQUE (contract_id, sequence_order, session_index);

ALTER TABLE execution.evidence
    ADD CONSTRAINT fk_evidence_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_evidence_milestone
        FOREIGN KEY (milestone_id) REFERENCES execution.milestones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_evidence_submitted_by
        FOREIGN KEY (submitted_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT;

ALTER TABLE execution.attestations
    ADD CONSTRAINT fk_attestations_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_attestations_attested_by
        FOREIGN KEY (attested_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_attestations_contract_dimension
        UNIQUE (contract_id, tekrr_dimension);

ALTER TABLE execution.attestation_evidence
    ADD CONSTRAINT fk_attestation_evidence_attestation
        FOREIGN KEY (attestation_id) REFERENCES execution.attestations (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_attestation_evidence_evidence
        FOREIGN KEY (evidence_id) REFERENCES execution.evidence (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_attestation_evidence_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_attestation_evidence_pair UNIQUE (attestation_id, evidence_id);

ALTER TABLE execution.attestation_milestones
    ADD CONSTRAINT fk_attestation_milestones_attestation
        FOREIGN KEY (attestation_id) REFERENCES execution.attestations (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_attestation_milestones_milestone
        FOREIGN KEY (milestone_id) REFERENCES execution.milestones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_attestation_milestones_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_attestation_milestones_pair UNIQUE (attestation_id, milestone_id);

ALTER TABLE execution.customer_evaluations
    ADD CONSTRAINT fk_customer_evaluations_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_customer_evaluations_submitted_by
        FOREIGN KEY (submitted_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_customer_evaluations_contract_id UNIQUE (contract_id),
    ADD CONSTRAINT ck_customer_evaluations_composite_score
        CHECK (composite_score BETWEEN 0 AND 1000);

ALTER TABLE execution.milestone_status_history
    ADD CONSTRAINT fk_milestone_status_history_milestone
        FOREIGN KEY (milestone_id) REFERENCES execution.milestones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_milestone_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- complaint foreign keys (core — before deferred M7b)
-- ---------------------------------------------------------------------------

ALTER TABLE complaint.cases
    ADD CONSTRAINT fk_cases_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_cases_case_number UNIQUE (case_number);

ALTER TABLE complaint.case_dimensions
    ADD CONSTRAINT fk_case_dimensions_case
        FOREIGN KEY (case_id) REFERENCES complaint.cases (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_case_dimensions_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_case_dimensions_case_dimension UNIQUE (case_id, tekrr_dimension);

ALTER TABLE complaint.case_status_history
    ADD CONSTRAINT fk_case_status_history_case
        FOREIGN KEY (case_id) REFERENCES complaint.cases (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_case_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

ALTER TABLE complaint.issues
    ADD CONSTRAINT fk_issues_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_issues_filed_by
        FOREIGN KEY (filed_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT;

ALTER TABLE complaint.issue_dimensions
    ADD CONSTRAINT fk_issue_dimensions_issue
        FOREIGN KEY (issue_id) REFERENCES complaint.issues (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_issue_dimensions_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_issue_dimensions_issue_dimension UNIQUE (issue_id, tekrr_dimension);

ALTER TABLE complaint.issue_milestones
    ADD CONSTRAINT fk_issue_milestones_issue
        FOREIGN KEY (issue_id) REFERENCES complaint.issues (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_issue_milestones_milestone
        FOREIGN KEY (milestone_id) REFERENCES execution.milestones (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_issue_milestones_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_issue_milestones_issue_milestone UNIQUE (issue_id, milestone_id);

ALTER TABLE complaint.issue_status_history
    ADD CONSTRAINT fk_issue_status_history_issue
        FOREIGN KEY (issue_id) REFERENCES complaint.issues (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_issue_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

ALTER TABLE complaint.complaints
    ADD CONSTRAINT fk_complaints_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaints_case
        FOREIGN KEY (case_id) REFERENCES complaint.cases (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaints_issue
        FOREIGN KEY (issue_id) REFERENCES complaint.issues (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_complaints_filed_by
        FOREIGN KEY (filed_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaints_assigned_admin
        FOREIGN KEY (assigned_admin_user_id) REFERENCES identity.users (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_complaints_resolved_by
        FOREIGN KEY (resolved_by_user_id) REFERENCES identity.users (id) ON DELETE SET NULL,
    ADD CONSTRAINT ck_complaints_contract_required
        CHECK (contract_id IS NOT NULL);

ALTER TABLE complaint.complaint_dimensions
    ADD CONSTRAINT fk_complaint_dimensions_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaint.complaints (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaint_dimensions_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_complaint_dimensions_complaint_dimension
        UNIQUE (complaint_id, tekrr_dimension);

ALTER TABLE complaint.complaint_evidence
    ADD CONSTRAINT fk_complaint_evidence_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaint.complaints (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaint_evidence_execution_evidence
        FOREIGN KEY (execution_evidence_id) REFERENCES execution.evidence (id) ON DELETE SET NULL,
    ADD CONSTRAINT ck_complaint_evidence_auto_attached
        CHECK (
            (evidence_source = 'auto_attached' AND execution_evidence_id IS NOT NULL AND storage_key IS NULL)
            OR (evidence_source = 'party' AND storage_key IS NOT NULL AND execution_evidence_id IS NULL)
            OR (evidence_source = 'admin')
        );

ALTER TABLE complaint.adjudications
    ADD CONSTRAINT fk_adjudications_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaint.complaints (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_adjudications_decided_by
        FOREIGN KEY (decided_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_adjudications_complaint_id UNIQUE (complaint_id),
    ADD CONSTRAINT ck_adjudications_fault_party
        CHECK (fault_party IN ('customer', 'provider', 'shared', 'none'));

ALTER TABLE complaint.mediation_records
    ADD CONSTRAINT fk_mediation_records_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaint.complaints (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_mediation_records_proposed_by
        FOREIGN KEY (proposed_by_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT;

ALTER TABLE complaint.complaint_status_history
    ADD CONSTRAINT fk_complaint_status_history_complaint
        FOREIGN KEY (complaint_id) REFERENCES complaint.complaints (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_complaint_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

-- Deferred circular FKs: cases.issue_id, issues.case_id (after both exist)
ALTER TABLE complaint.cases
    ADD CONSTRAINT fk_cases_issue
        FOREIGN KEY (issue_id) REFERENCES complaint.issues (id) ON DELETE SET NULL;

ALTER TABLE complaint.issues
    ADD CONSTRAINT fk_issues_case
        FOREIGN KEY (case_id) REFERENCES complaint.cases (id) ON DELETE SET NULL;

-- M7b: execution ↔ complaint deferred foreign keys (ADR-002)
ALTER TABLE execution.milestones
    ADD CONSTRAINT fk_milestones_frozen_by_complaint
        FOREIGN KEY (frozen_by_complaint_id) REFERENCES complaint.complaints (id) ON DELETE SET NULL;

ALTER TABLE execution.attestations
    ADD CONSTRAINT fk_attestations_frozen_by_complaint
        FOREIGN KEY (frozen_by_complaint_id) REFERENCES complaint.complaints (id) ON DELETE SET NULL;

ALTER TABLE execution.customer_evaluations
    ADD CONSTRAINT fk_customer_evaluations_superseded_by_complaint
        FOREIGN KEY (superseded_by_complaint_id) REFERENCES complaint.complaints (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- trust foreign keys (ADR-003)
-- ---------------------------------------------------------------------------

ALTER TABLE trust.trust_scores
    ADD CONSTRAINT fk_trust_scores_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_trust_scores_provider_id UNIQUE (provider_id),
    ADD CONSTRAINT ck_trust_scores_score
        CHECK (score BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_execution_score
        CHECK (execution_score BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_verification_component
        CHECK (verification_component BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_execution_component
        CHECK (execution_component BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_time_component
        CHECK (time_component BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_complaints_component
        CHECK (complaints_component BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_scores_evaluation_component
        CHECK (evaluation_component BETWEEN 0 AND 1000);

ALTER TABLE trust.trust_score_events
    ADD CONSTRAINT fk_trust_score_events_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_trust_score_events_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    ADD CONSTRAINT uq_trust_score_events_idempotency_key UNIQUE (idempotency_key);

ALTER TABLE trust.trust_score_snapshots
    ADD CONSTRAINT fk_trust_score_snapshots_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_trust_score_snapshots_triggering_event
        FOREIGN KEY (triggering_event_id) REFERENCES trust.trust_score_events (id) ON DELETE SET NULL,
    ADD CONSTRAINT ck_trust_score_snapshots_score
        CHECK (score BETWEEN 0 AND 1000),
    ADD CONSTRAINT ck_trust_score_snapshots_execution_score
        CHECK (execution_score BETWEEN 0 AND 1000);

ALTER TABLE trust.trust_score_event_corrections
    ADD CONSTRAINT fk_trust_score_event_corrections_original
        FOREIGN KEY (original_event_id) REFERENCES trust.trust_score_events (id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_trust_score_event_corrections_admin
        FOREIGN KEY (admin_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- platform foreign keys
-- ---------------------------------------------------------------------------

ALTER TABLE platform.audit_events
    ADD CONSTRAINT fk_audit_events_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL;

ALTER TABLE platform.domain_outbox
    ADD CONSTRAINT uq_domain_outbox_idempotency_key UNIQUE (idempotency_key);

-- ---------------------------------------------------------------------------
-- identity uniqueness
-- ---------------------------------------------------------------------------

ALTER TABLE identity.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);

ALTER TABLE identity.customers
    ADD CONSTRAINT uq_customers_user_id UNIQUE (user_id);

ALTER TABLE identity.providers
    ADD CONSTRAINT uq_providers_user_id UNIQUE (user_id);

CREATE UNIQUE INDEX uq_providers_slug ON identity.providers (slug) WHERE slug IS NOT NULL;

COMMIT;
