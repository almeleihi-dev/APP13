-- S12 Notification & Event Inbox — user-scoped lifecycle notifications

CREATE TABLE IF NOT EXISTS experience.event_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'unread',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    source_entity_type TEXT,
    source_entity_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    idempotency_key TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_event_inbox_user
        FOREIGN KEY (user_id) REFERENCES identity.users (id),
    CONSTRAINT uq_event_inbox_idempotency
        UNIQUE (idempotency_key),
    CONSTRAINT chk_event_inbox_status
        CHECK (status IN ('unread', 'read')),
    CONSTRAINT chk_event_inbox_priority
        CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    CONSTRAINT chk_event_inbox_category
        CHECK (category IN (
            'request',
            'offer',
            'contract',
            'escrow',
            'execution',
            'evidence',
            'issue',
            'trust',
            'payment',
            'platform'
        ))
);

CREATE INDEX IF NOT EXISTS idx_event_inbox_user_status_created
    ON experience.event_inbox (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_inbox_user_created
    ON experience.event_inbox (user_id, created_at DESC);

COMMENT ON TABLE experience.event_inbox IS
    'S12 user-scoped notification inbox derived from platform lifecycle events.';
