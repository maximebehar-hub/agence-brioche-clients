-- Ajout soft delete sur portal_clients
ALTER TABLE portal_clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_portal_clients_deleted ON portal_clients(deleted_at);
