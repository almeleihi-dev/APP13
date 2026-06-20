-- APP13 PostgreSQL Schema v1
-- Migration 001: Extensions, schemas, and tables
-- Target: PostgreSQL 16+
-- Source: APP13 Database Architecture v1.1

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS action;
CREATE SCHEMA IF NOT EXISTS contract;
CREATE SCHEMA IF NOT EXISTS execution;
CREATE SCHEMA IF NOT EXISTS complaint;
CREATE SCHEMA IF NOT EXISTS trust;
CREATE SCHEMA IF NOT EXISTS platform;

COMMENT ON SCHEMA identity IS 'Identity Engine — users, profiles, verification, credentials';
COMMENT ON SCHEMA action IS 'Action Engine — classified work instances';
COMMENT ON SCHEMA contract IS 'Contract Engine — binding and lifecycle';
COMMENT ON SCHEMA execution IS 'Action Engine — milestones, evidence, attestations';
COMMENT ON SCHEMA complaint IS 'Complaint Engine — disputes and adjudication';
COMMENT ON SCHEMA trust IS 'Trust Engine — event-sourced trust projection';
COMMENT ON SCHEMA platform IS 'Cross-engine audit and outbox';

-- ---------------------------------------------------------------------------
-- identity
-- ---------------------------------------------------------------------------

CREATE TABLE identity.users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT NOT NULL,
    phone               TEXT,
    password_hash       TEXT,
    role                TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'active',
    email_verified_at   TIMESTAMPTZ,
    phone_verified_at   TIMESTAMPTZ,
    verification_tier   TEXT NOT NULL DEFAULT 'T0',
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE identity.companies (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name            TEXT NOT NULL,
    trading_name          TEXT,
    registration_number   TEXT,
    jurisdiction          TEXT,
    status                TEXT NOT NULL DEFAULT 'pending',
    verified_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    display_name        TEXT NOT NULL,
    legal_name          TEXT,
    avatar_storage_key  TEXT,
    company_id          UUID,
    default_location    JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.providers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    display_name        TEXT NOT NULL,
    business_name       TEXT,
    bio                 TEXT,
    primary_trade       TEXT,
    slug                TEXT,
    status              TEXT NOT NULL DEFAULT 'pending',
    avatar_storage_key  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    tier                TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending',
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ,
    reviewed_by_user_id UUID,
    expires_at          TIMESTAMPTZ,
    rejection_reason    TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.verification_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id     UUID NOT NULL,
    document_type       TEXT NOT NULL,
    storage_key         TEXT NOT NULL,
    content_hash        TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE identity.credentials (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id         UUID NOT NULL,
    verification_id     UUID,
    credential_type     TEXT NOT NULL,
    credential_name     TEXT NOT NULL,
    issuing_authority   TEXT,
    credential_number   TEXT,
    status              TEXT NOT NULL DEFAULT 'pending',
    issued_at           TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    storage_key         TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- action
-- ---------------------------------------------------------------------------

CREATE TABLE action.actions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_code             TEXT NOT NULL,
    action_name             TEXT NOT NULL,
    domain                  CHAR(1) NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'draft',
    customer_id             UUID NOT NULL,
    provider_id             UUID,
    invited_provider_email  TEXT,
    company_id              UUID,
    title                   TEXT NOT NULL,
    description             TEXT,
    tekrr_profile           JSONB NOT NULL DEFAULT '{}',
    tekrr_completeness      INT NOT NULL DEFAULT 0,
    tekrr_framework_version TEXT NOT NULL DEFAULT 'tekrr_v1',
    template_id             TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE action.action_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id       UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- contract
-- ---------------------------------------------------------------------------

CREATE TABLE contract.contracts (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id                 UUID NOT NULL,
    customer_id               UUID,
    provider_id               UUID,
    contract_number           TEXT NOT NULL,
    template_id               TEXT NOT NULL,
    template_version          TEXT NOT NULL,
    jurisdiction_pack         TEXT NOT NULL DEFAULT 'US-GENERIC-v1',
    status                    TEXT NOT NULL DEFAULT 'draft',
    tekrr_snapshot            JSONB NOT NULL DEFAULT '{}',
    commercial_terms          JSONB NOT NULL DEFAULT '{}',
    verification_snapshot     JSONB,
    document_hash             TEXT,
    pdf_storage_key           TEXT,
    payment_ready             BOOLEAN NOT NULL DEFAULT false,
    escrow_ready              BOOLEAN NOT NULL DEFAULT false,
    payment_schedule_ref      JSONB,
    escrow_policy_ref         JSONB,
    customer_accepted_at      TIMESTAMPTZ,
    provider_accepted_at      TIMESTAMPTZ,
    activated_at              TIMESTAMPTZ,
    completed_at              TIMESTAMPTZ,
    complaint_window_ends_at  TIMESTAMPTZ,
    cancellation_fault_party  TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contract.contract_parties (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id                 UUID NOT NULL,
    user_id                     UUID NOT NULL,
    party_role                  TEXT NOT NULL,
    acceptance_required         BOOLEAN NOT NULL DEFAULT true,
    accepted_at                 TIMESTAMPTZ,
    declined_at                 TIMESTAMPTZ,
    acceptance_ip               TEXT,
    acceptance_user_agent       TEXT,
    verification_tier_at_accept TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contract.contract_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id     UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- execution
-- ---------------------------------------------------------------------------

CREATE TABLE execution.milestones (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id             UUID NOT NULL,
    milestone_code          TEXT NOT NULL,
    name                    TEXT NOT NULL,
    sequence_order          INT NOT NULL,
    tekrr_dimension         TEXT,
    status                  TEXT NOT NULL DEFAULT 'pending',
    responsible_party       TEXT NOT NULL,
    due_at                  TIMESTAMPTZ,
    started_at              TIMESTAMPTZ,
    submitted_at            TIMESTAMPTZ,
    accepted_at             TIMESTAMPTZ,
    blocking                BOOLEAN NOT NULL DEFAULT true,
    session_index           INT NOT NULL DEFAULT 0,
    frozen_by_complaint_id  UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.evidence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id         UUID NOT NULL,
    milestone_id        UUID NOT NULL,
    submitted_by_user_id UUID NOT NULL,
    evidence_type       TEXT NOT NULL,
    storage_key         TEXT,
    content_hash        TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.attestations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id             UUID NOT NULL,
    tekrr_dimension         TEXT NOT NULL,
    fulfillment_rating      TEXT NOT NULL,
    attested_by_user_id     UUID NOT NULL,
    attested_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    frozen_by_complaint_id  UUID,
    source                  TEXT NOT NULL DEFAULT 'mutual',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.attestation_evidence (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attestation_id  UUID NOT NULL,
    evidence_id     UUID NOT NULL,
    contract_id     UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.attestation_milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attestation_id  UUID NOT NULL,
    milestone_id    UUID NOT NULL,
    contract_id     UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.customer_evaluations (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id                 UUID NOT NULL,
    submitted_by_user_id        UUID NOT NULL,
    eval_form_id                TEXT NOT NULL,
    dimension_scores            JSONB NOT NULL DEFAULT '{}',
    composite_score             INT NOT NULL,
    submitted_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    superseded_at               TIMESTAMPTZ,
    superseded_by_complaint_id  UUID,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE execution.milestone_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id    UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- complaint
-- ---------------------------------------------------------------------------

CREATE TABLE complaint.cases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number         TEXT NOT NULL,
    contract_id         UUID NOT NULL,
    issue_id            UUID,
    status              TEXT NOT NULL DEFAULT 'open',
    primary_dimension   TEXT,
    sla_due_at          TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.case_dimensions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID NOT NULL,
    contract_id     UUID NOT NULL,
    tekrr_dimension TEXT NOT NULL,
    parent_status   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.case_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.issues (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id         UUID NOT NULL,
    case_id             UUID,
    filed_by_user_id    UUID NOT NULL,
    status              TEXT NOT NULL DEFAULT 'raised',
    description         TEXT NOT NULL,
    risk_level          INT,
    filed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.issue_dimensions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id        UUID NOT NULL,
    contract_id     UUID NOT NULL,
    tekrr_dimension TEXT NOT NULL,
    parent_status   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.issue_milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id        UUID NOT NULL,
    milestone_id    UUID NOT NULL,
    contract_id     UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.issue_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id        UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.complaints (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id             UUID NOT NULL,
    case_id                 UUID NOT NULL,
    issue_id                UUID,
    filed_by_user_id        UUID NOT NULL,
    complaint_types         JSONB NOT NULL DEFAULT '[]',
    tekrr_dimensions        JSONB NOT NULL DEFAULT '[]',
    description             TEXT NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'filed',
    severity                TEXT,
    outcome                 TEXT,
    fault_party             TEXT,
    window_valid            BOOLEAN,
    dismissed_reason_code   TEXT,
    assigned_admin_user_id  UUID,
    filed_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    triaged_at              TIMESTAMPTZ,
    resolved_at             TIMESTAMPTZ,
    resolved_by_user_id     UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.complaint_dimensions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL,
    contract_id     UUID NOT NULL,
    tekrr_dimension TEXT NOT NULL,
    parent_status   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.complaint_evidence (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id            UUID NOT NULL,
    evidence_source         TEXT NOT NULL,
    execution_evidence_id   UUID,
    reference_entity_type   TEXT,
    reference_entity_id     UUID,
    storage_key             TEXT,
    description             TEXT,
    metadata                JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.adjudications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID NOT NULL,
    findings            TEXT NOT NULL,
    severity            TEXT NOT NULL,
    outcome             TEXT NOT NULL,
    fault_party         TEXT NOT NULL,
    dimension_outcomes  JSONB NOT NULL DEFAULT '[]',
    decided_by_user_id  UUID NOT NULL,
    decided_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.mediation_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id        UUID NOT NULL,
    proposal_text       TEXT NOT NULL,
    proposed_by_user_id UUID NOT NULL,
    customer_accepted   BOOLEAN,
    provider_accepted   BOOLEAN,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE complaint.complaint_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    actor_user_id   UUID,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- trust
-- ---------------------------------------------------------------------------

CREATE TABLE trust.trust_scores (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id             UUID NOT NULL,
    score                   INT NOT NULL DEFAULT 0,
    execution_score         INT NOT NULL DEFAULT 0,
    execution_score_version TEXT NOT NULL DEFAULT 'execution_score_v1',
    score_version           TEXT NOT NULL DEFAULT 'trust_score_v1',
    verification_component  INT NOT NULL DEFAULT 0,
    execution_component     INT NOT NULL DEFAULT 0,
    time_component          INT NOT NULL DEFAULT 0,
    complaints_component    INT NOT NULL DEFAULT 0,
    evaluation_component    INT NOT NULL DEFAULT 0,
    dimension_scores        JSONB NOT NULL DEFAULT '{}',
    contract_count          INT NOT NULL DEFAULT 0,
    completed_contract_count INT NOT NULL DEFAULT 0,
    complaint_upheld_count  INT NOT NULL DEFAULT 0,
    repeat_customer_rate    NUMERIC(5, 4),
    confidence_band         TEXT NOT NULL DEFAULT 'low',
    record_state            TEXT NOT NULL DEFAULT 'uninitialized',
    public_summary          JSONB NOT NULL DEFAULT '{}',
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trust.trust_score_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id         UUID NOT NULL,
    event_type          TEXT NOT NULL,
    source_entity_type  TEXT NOT NULL,
    source_entity_id    UUID NOT NULL,
    contract_id         UUID,
    payload             JSONB NOT NULL DEFAULT '{}',
    score_version       TEXT NOT NULL DEFAULT 'trust_score_v1',
    idempotency_key     TEXT NOT NULL,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trust.trust_score_snapshots (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id             UUID NOT NULL,
    score                   INT NOT NULL,
    score_version           TEXT NOT NULL,
    execution_score         INT NOT NULL,
    execution_score_version TEXT NOT NULL DEFAULT 'execution_score_v1',
    component_scores        JSONB NOT NULL DEFAULT '{}',
    dimension_scores        JSONB,
    record_state            TEXT NOT NULL,
    triggering_event_id     UUID,
    computed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trust.trust_score_event_corrections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_event_id   UUID NOT NULL,
    admin_user_id       UUID NOT NULL,
    correction_reason   TEXT NOT NULL,
    corrected_payload   JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- platform
-- ---------------------------------------------------------------------------

CREATE TABLE platform.audit_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id   UUID,
    action          TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    engine          TEXT NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    ip_address      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE platform.domain_outbox (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    engine_source   TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
