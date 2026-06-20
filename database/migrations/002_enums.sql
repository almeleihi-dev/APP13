-- APP13 PostgreSQL Schema v1.1
-- Migration 002: Domain enum types (idempotent CREATE TYPE — P0-M2)
-- Target: PostgreSQL 16+

BEGIN;

-- identity
DO $$ BEGIN
    CREATE TYPE identity.user_role AS ENUM ('customer', 'provider', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.account_status AS ENUM ('active', 'suspended', 'deactivated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.verification_tier AS ENUM ('T0', 'T1', 'T2', 'T3', 'T4');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.provider_status AS ENUM ('pending', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.company_status AS ENUM ('pending', 'active', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.verification_status AS ENUM (
        'pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE identity.credential_status AS ENUM (
        'pending', 'verified', 'expired', 'revoked'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- action
DO $$ BEGIN
    CREATE TYPE action.action_status AS ENUM (
        'draft', 'tekrr_in_progress', 'ready_for_contract',
        'contract_pending', 'contract_active', 'completed', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- contract
DO $$ BEGIN
    CREATE TYPE contract.contract_status AS ENUM (
        'draft', 'proposed', 'accepted', 'active', 'completed',
        'issue_raised', 'disputed', 'resolved', 'closed',
        'void', 'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE contract.party_role AS ENUM ('customer', 'provider');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE contract.fault_party AS ENUM ('customer', 'provider', 'none', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- execution
DO $$ BEGIN
    CREATE TYPE execution.milestone_status AS ENUM (
        'pending', 'in_progress', 'submitted', 'accepted',
        'disputed', 'frozen', 'waived'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE execution.evidence_type AS ENUM (
        'EV-TS', 'EV-PHOTO', 'EV-DOC', 'EV-CHECK',
        'EV-TEST', 'EV-SIGN', 'EV-CRED', 'EV-NOTE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE execution.tekrr_dimension AS ENUM ('T', 'E', 'K', 'R', 'S');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE execution.fulfillment_rating AS ENUM (
        'FUL', 'SUF', 'PAR', 'UNF', 'PEN'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE execution.responsible_party AS ENUM (
        'customer', 'provider', 'system', 'both'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE execution.attestation_source AS ENUM (
        'mutual', 'auto_policy', 'complaint', 'admin'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- complaint
DO $$ BEGIN
    CREATE TYPE complaint.issue_status AS ENUM (
        'raised', 'acknowledged', 'in_discussion', 'escalated',
        'resolved_informally', 'withdrawn', 'expired'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.case_status AS ENUM (
        'open', 'informal', 'formal', 'pending_closure', 'closed', 'withdrawn'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.complaint_status AS ENUM (
        'filed', 'triage_pending', 'dismissed', 'evidence_gathering',
        'mediation', 'adjudication_pending',
        'resolved_mutual', 'resolved_upheld', 'resolved_dismissed', 'resolved_shared',
        'escalated_external', 'pending_external', 'closed'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.complaint_severity AS ENUM (
        'low', 'medium', 'high', 'critical'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.complaint_outcome AS ENUM (
        'upheld_provider_fault', 'upheld_customer_fault', 'dismissed',
        'shared_fault', 'resolved_mutual', 'external_referral'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.evidence_source AS ENUM ('party', 'auto_attached', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE complaint.dismissed_reason_code AS ENUM (
        'OUT_OF_WINDOW', 'NOT_A_PARTY', 'INVALID_DIMENSION',
        'DUPLICATE_ACTIVE', 'CONTRACT_NOT_ACTIVE',
        'INSUFFICIENT_DETAIL', 'TYPE_MISMATCH'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- trust
DO $$ BEGIN
    CREATE TYPE trust.confidence_band AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
    CREATE TYPE trust.record_state AS ENUM (
        'uninitialized', 'provisional', 'active',
        'dispute_hold', 'frozen', 'archived'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Apply enum types to columns (PostgreSQL 16)
-- Drop TEXT defaults before ALTER TYPE; restore typed defaults after (P0-M2).
-- Idempotent: skips when target column is already the enum type.

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'identity' AND c.relname = 'users' AND a.attname = 'role'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'identity.user_role' THEN
        ALTER TABLE identity.users ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE identity.users ALTER COLUMN verification_tier DROP DEFAULT;
        ALTER TABLE identity.users
            ALTER COLUMN role TYPE identity.user_role USING role::identity.user_role,
            ALTER COLUMN status TYPE identity.account_status USING status::identity.account_status,
            ALTER COLUMN verification_tier TYPE identity.verification_tier USING verification_tier::identity.verification_tier;
        ALTER TABLE identity.users ALTER COLUMN status SET DEFAULT 'active'::identity.account_status;
        ALTER TABLE identity.users ALTER COLUMN verification_tier SET DEFAULT 'T0'::identity.verification_tier;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'identity' AND c.relname = 'companies' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'identity.company_status' THEN
        ALTER TABLE identity.companies ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE identity.companies
            ALTER COLUMN status TYPE identity.company_status USING status::identity.company_status;
        ALTER TABLE identity.companies ALTER COLUMN status SET DEFAULT 'pending'::identity.company_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'identity' AND c.relname = 'providers' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'identity.provider_status' THEN
        ALTER TABLE identity.providers ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE identity.providers
            ALTER COLUMN status TYPE identity.provider_status USING status::identity.provider_status;
        ALTER TABLE identity.providers ALTER COLUMN status SET DEFAULT 'pending'::identity.provider_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'identity' AND c.relname = 'verifications' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'identity.verification_status' THEN
        ALTER TABLE identity.verifications ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE identity.verifications
            ALTER COLUMN tier TYPE identity.verification_tier USING tier::identity.verification_tier,
            ALTER COLUMN status TYPE identity.verification_status USING status::identity.verification_status;
        ALTER TABLE identity.verifications ALTER COLUMN status SET DEFAULT 'pending'::identity.verification_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'identity' AND c.relname = 'credentials' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'identity.credential_status' THEN
        ALTER TABLE identity.credentials ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE identity.credentials
            ALTER COLUMN status TYPE identity.credential_status USING status::identity.credential_status;
        ALTER TABLE identity.credentials ALTER COLUMN status SET DEFAULT 'pending'::identity.credential_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'action' AND c.relname = 'actions' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'action.action_status' THEN
        ALTER TABLE action.actions ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE action.actions
            ALTER COLUMN status TYPE action.action_status USING status::action.action_status;
        ALTER TABLE action.actions ALTER COLUMN status SET DEFAULT 'draft'::action.action_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'contract' AND c.relname = 'contracts' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'contract.contract_status' THEN
        ALTER TABLE contract.contracts ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE contract.contracts
            ALTER COLUMN status TYPE contract.contract_status USING status::contract.contract_status;
        ALTER TABLE contract.contracts ALTER COLUMN status SET DEFAULT 'draft'::contract.contract_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'contract' AND c.relname = 'contract_parties' AND a.attname = 'party_role'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'contract.party_role' THEN
        ALTER TABLE contract.contract_parties
            ALTER COLUMN party_role TYPE contract.party_role USING party_role::contract.party_role;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'execution' AND c.relname = 'milestones' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.milestone_status' THEN
        ALTER TABLE execution.milestones ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE execution.milestones
            ALTER COLUMN status TYPE execution.milestone_status USING status::execution.milestone_status,
            ALTER COLUMN tekrr_dimension TYPE execution.tekrr_dimension USING tekrr_dimension::execution.tekrr_dimension,
            ALTER COLUMN responsible_party TYPE execution.responsible_party USING responsible_party::execution.responsible_party;
        ALTER TABLE execution.milestones ALTER COLUMN status SET DEFAULT 'pending'::execution.milestone_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'execution' AND c.relname = 'evidence' AND a.attname = 'evidence_type'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.evidence_type' THEN
        ALTER TABLE execution.evidence
            ALTER COLUMN evidence_type TYPE execution.evidence_type USING evidence_type::execution.evidence_type;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'execution' AND c.relname = 'attestations' AND a.attname = 'source'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.attestation_source' THEN
        ALTER TABLE execution.attestations ALTER COLUMN source DROP DEFAULT;
        ALTER TABLE execution.attestations
            ALTER COLUMN tekrr_dimension TYPE execution.tekrr_dimension USING tekrr_dimension::execution.tekrr_dimension,
            ALTER COLUMN fulfillment_rating TYPE execution.fulfillment_rating USING fulfillment_rating::execution.fulfillment_rating,
            ALTER COLUMN source TYPE execution.attestation_source USING source::execution.attestation_source;
        ALTER TABLE execution.attestations ALTER COLUMN source SET DEFAULT 'mutual'::execution.attestation_source;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'issues' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'complaint.issue_status' THEN
        ALTER TABLE complaint.issues ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE complaint.issues
            ALTER COLUMN status TYPE complaint.issue_status USING status::complaint.issue_status;
        ALTER TABLE complaint.issues ALTER COLUMN status SET DEFAULT 'raised'::complaint.issue_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'cases' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'complaint.case_status' THEN
        ALTER TABLE complaint.cases ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE complaint.cases
            ALTER COLUMN status TYPE complaint.case_status USING status::complaint.case_status;
        ALTER TABLE complaint.cases ALTER COLUMN status SET DEFAULT 'open'::complaint.case_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'complaints' AND a.attname = 'status'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'complaint.complaint_status' THEN
        ALTER TABLE complaint.complaints ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE complaint.complaints
            ALTER COLUMN status TYPE complaint.complaint_status USING status::complaint.complaint_status,
            ALTER COLUMN severity TYPE complaint.complaint_severity USING severity::complaint.complaint_severity,
            ALTER COLUMN outcome TYPE complaint.complaint_outcome USING outcome::complaint.complaint_outcome;
        ALTER TABLE complaint.complaints ALTER COLUMN status SET DEFAULT 'filed'::complaint.complaint_status;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'complaint_evidence' AND a.attname = 'evidence_source'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'complaint.evidence_source' THEN
        ALTER TABLE complaint.complaint_evidence
            ALTER COLUMN evidence_source TYPE complaint.evidence_source USING evidence_source::complaint.evidence_source;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'adjudications' AND a.attname = 'severity'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'complaint.complaint_severity' THEN
        ALTER TABLE complaint.adjudications
            ALTER COLUMN severity TYPE complaint.complaint_severity USING severity::complaint.complaint_severity,
            ALTER COLUMN outcome TYPE complaint.complaint_outcome USING outcome::complaint.complaint_outcome;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'complaint_dimensions' AND a.attname = 'tekrr_dimension'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.tekrr_dimension' THEN
        ALTER TABLE complaint.complaint_dimensions
            ALTER COLUMN tekrr_dimension TYPE execution.tekrr_dimension USING tekrr_dimension::execution.tekrr_dimension;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'issue_dimensions' AND a.attname = 'tekrr_dimension'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.tekrr_dimension' THEN
        ALTER TABLE complaint.issue_dimensions
            ALTER COLUMN tekrr_dimension TYPE execution.tekrr_dimension USING tekrr_dimension::execution.tekrr_dimension;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'complaint' AND c.relname = 'case_dimensions' AND a.attname = 'tekrr_dimension'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'execution.tekrr_dimension' THEN
        ALTER TABLE complaint.case_dimensions
            ALTER COLUMN tekrr_dimension TYPE execution.tekrr_dimension USING tekrr_dimension::execution.tekrr_dimension;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trust' AND c.relname = 'trust_scores' AND a.attname = 'confidence_band'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'trust.confidence_band' THEN
        ALTER TABLE trust.trust_scores ALTER COLUMN confidence_band DROP DEFAULT;
        ALTER TABLE trust.trust_scores ALTER COLUMN record_state DROP DEFAULT;
        ALTER TABLE trust.trust_scores
            ALTER COLUMN confidence_band TYPE trust.confidence_band USING confidence_band::trust.confidence_band,
            ALTER COLUMN record_state TYPE trust.record_state USING record_state::trust.record_state;
        ALTER TABLE trust.trust_scores ALTER COLUMN confidence_band SET DEFAULT 'low'::trust.confidence_band;
        ALTER TABLE trust.trust_scores ALTER COLUMN record_state SET DEFAULT 'uninitialized'::trust.record_state;
    END IF;
END $$;

DO $$
BEGIN
    IF (SELECT format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trust' AND c.relname = 'trust_score_snapshots' AND a.attname = 'record_state'
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM 'trust.record_state' THEN
        ALTER TABLE trust.trust_score_snapshots
            ALTER COLUMN record_state TYPE trust.record_state USING record_state::trust.record_state;
    END IF;
END $$;

COMMIT;
