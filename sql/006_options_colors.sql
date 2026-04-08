ALTER TABLE portal_clients ADD COLUMN IF NOT EXISTS options_colors JSONB DEFAULT '{}';
