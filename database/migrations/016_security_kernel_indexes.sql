BEGIN;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON identity.sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON identity.sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON identity.sessions (expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON identity.refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id ON identity.refresh_tokens (session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON identity.refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON identity.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON identity.user_roles (role);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON identity.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON identity.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON identity.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON identity.audit_logs (created_at DESC);

COMMIT;
