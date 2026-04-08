-- =============================================
-- Schéma Supabase : Portail Client Agence Brioche
-- =============================================

-- 1. Profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'direction', 'client')),
  client_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#5622d9',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Posts (publications réseaux sociaux)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'YouTube', 'X')),
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'en_attente', 'valide', 'publie')),
  caption TEXT,
  visual_url TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Events (tournages, briefs, etc.)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'autre' CHECK (type IN ('tournage', 'brief', 'publication', 'autre')),
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Stats (données de performance importées via CSV)
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  period TEXT, -- 'mensuel', 'hebdomadaire'
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  engagement BIGINT DEFAULT 0,
  followers BIGINT DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Assets (fichiers / ressources)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'logo', 'charte', 'photo', 'video', 'livrable'
  category TEXT, -- pour le groupement
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FK: profiles.client_id → clients
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_client
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_posts_client ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_events_client ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_stats_client ON stats(client_id);
CREATE INDEX IF NOT EXISTS idx_assets_client ON assets(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
