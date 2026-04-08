-- =============================================
-- Row-Level Security (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Helper : récupérer le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper : récupérer le client_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  id = auth.uid() OR get_user_role() = 'admin'
);

-- CLIENTS
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  get_user_role() IN ('admin', 'direction')
  OR id = get_user_client_id()
);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (
  get_user_role() = 'admin'
);

-- POSTS
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  get_user_role() IN ('admin', 'direction')
  OR client_id = get_user_client_id()
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (
  get_user_role() IN ('admin', 'direction')
);

-- EVENTS
CREATE POLICY "events_select" ON events FOR SELECT USING (
  get_user_role() IN ('admin', 'direction')
  OR client_id = get_user_client_id()
);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "events_update" ON events FOR UPDATE USING (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "events_delete" ON events FOR DELETE USING (
  get_user_role() IN ('admin', 'direction')
);

-- STATS
CREATE POLICY "stats_select" ON stats FOR SELECT USING (
  get_user_role() IN ('admin', 'direction')
  OR client_id = get_user_client_id()
);
CREATE POLICY "stats_insert" ON stats FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'direction')
);

-- ASSETS
CREATE POLICY "assets_select" ON assets FOR SELECT USING (
  get_user_role() IN ('admin', 'direction')
  OR client_id = get_user_client_id()
);
CREATE POLICY "assets_insert" ON assets FOR INSERT WITH CHECK (
  get_user_role() IN ('admin', 'direction')
);
CREATE POLICY "assets_delete" ON assets FOR DELETE USING (
  get_user_role() IN ('admin', 'direction')
);
