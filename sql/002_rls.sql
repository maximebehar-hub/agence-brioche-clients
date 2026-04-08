-- =============================================
-- Row-Level Security (RLS) — Tables portal_*
-- =============================================

ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_assets ENABLE ROW LEVEL SECURITY;

-- Helper : récupérer le portal_role de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_portal_role()
RETURNS TEXT AS $$
  SELECT portal_role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper : récupérer le portal_client_id de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_portal_client_id()
RETURNS UUID AS $$
  SELECT portal_client_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PORTAL_CLIENTS
CREATE POLICY "portal_clients_select" ON portal_clients FOR SELECT USING (
  get_portal_role() IN ('admin', 'direction')
  OR id = get_portal_client_id()
);
CREATE POLICY "portal_clients_insert" ON portal_clients FOR INSERT WITH CHECK (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_clients_update" ON portal_clients FOR UPDATE USING (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_clients_delete" ON portal_clients FOR DELETE USING (
  get_portal_role() = 'admin'
);

-- PORTAL_POSTS
CREATE POLICY "portal_posts_select" ON portal_posts FOR SELECT USING (
  get_portal_role() IN ('admin', 'direction')
  OR client_id = get_portal_client_id()
);
CREATE POLICY "portal_posts_insert" ON portal_posts FOR INSERT WITH CHECK (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_posts_update" ON portal_posts FOR UPDATE USING (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_posts_delete" ON portal_posts FOR DELETE USING (
  get_portal_role() IN ('admin', 'direction')
);

-- PORTAL_EVENTS
CREATE POLICY "portal_events_select" ON portal_events FOR SELECT USING (
  get_portal_role() IN ('admin', 'direction')
  OR client_id = get_portal_client_id()
);
CREATE POLICY "portal_events_insert" ON portal_events FOR INSERT WITH CHECK (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_events_update" ON portal_events FOR UPDATE USING (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_events_delete" ON portal_events FOR DELETE USING (
  get_portal_role() IN ('admin', 'direction')
);

-- PORTAL_STATS
CREATE POLICY "portal_stats_select" ON portal_stats FOR SELECT USING (
  get_portal_role() IN ('admin', 'direction')
  OR client_id = get_portal_client_id()
);
CREATE POLICY "portal_stats_insert" ON portal_stats FOR INSERT WITH CHECK (
  get_portal_role() IN ('admin', 'direction')
);

-- PORTAL_ASSETS
CREATE POLICY "portal_assets_select" ON portal_assets FOR SELECT USING (
  get_portal_role() IN ('admin', 'direction')
  OR client_id = get_portal_client_id()
);
CREATE POLICY "portal_assets_insert" ON portal_assets FOR INSERT WITH CHECK (
  get_portal_role() IN ('admin', 'direction')
);
CREATE POLICY "portal_assets_delete" ON portal_assets FOR DELETE USING (
  get_portal_role() IN ('admin', 'direction')
);
