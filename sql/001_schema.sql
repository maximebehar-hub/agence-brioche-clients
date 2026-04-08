-- =============================================
-- Schéma Supabase : Portail Client Agence Brioche
-- Partage la base erp-brioche, tables préfixées portal_
-- Table users de l'ERP étendue avec portal_role et portal_client_id
-- =============================================

CREATE TABLE IF NOT EXISTS portal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#5622d9',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'YouTube', 'X')),
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'en_attente', 'valide', 'publie')),
  caption TEXT,
  visual_url TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'autre' CHECK (type IN ('tournage', 'brief', 'publication', 'autre')),
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  period TEXT,
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  engagement BIGINT DEFAULT 0,
  followers BIGINT DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  category TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Colonnes portail sur la table users existante de l'ERP
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_role TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_client_id UUID REFERENCES portal_clients(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_portal_posts_client ON portal_posts(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_events_client ON portal_events(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_stats_client ON portal_stats(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_assets_client ON portal_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_clients_slug ON portal_clients(slug);
