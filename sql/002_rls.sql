-- RLS — Tables portal_* (base erp-brioche, table users avec id = auth.uid())

ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_assets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_portal_role() RETURNS TEXT AS $$
  SELECT portal_role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_portal_client_id() RETURNS UUID AS $$
  SELECT portal_client_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- portal_clients
CREATE POLICY "portal_clients_select" ON portal_clients FOR SELECT USING (get_portal_role() IN ('admin','direction') OR id = get_portal_client_id());
CREATE POLICY "portal_clients_insert" ON portal_clients FOR INSERT WITH CHECK (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_clients_update" ON portal_clients FOR UPDATE USING (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_clients_delete" ON portal_clients FOR DELETE USING (get_portal_role() = 'admin');

-- portal_posts
CREATE POLICY "portal_posts_select" ON portal_posts FOR SELECT USING (get_portal_role() IN ('admin','direction') OR client_id = get_portal_client_id());
CREATE POLICY "portal_posts_insert" ON portal_posts FOR INSERT WITH CHECK (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_posts_update" ON portal_posts FOR UPDATE USING (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_posts_delete" ON portal_posts FOR DELETE USING (get_portal_role() IN ('admin','direction'));

-- portal_events
CREATE POLICY "portal_events_select" ON portal_events FOR SELECT USING (get_portal_role() IN ('admin','direction') OR client_id = get_portal_client_id());
CREATE POLICY "portal_events_insert" ON portal_events FOR INSERT WITH CHECK (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_events_update" ON portal_events FOR UPDATE USING (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_events_delete" ON portal_events FOR DELETE USING (get_portal_role() IN ('admin','direction'));

-- portal_stats
CREATE POLICY "portal_stats_select" ON portal_stats FOR SELECT USING (get_portal_role() IN ('admin','direction') OR client_id = get_portal_client_id());
CREATE POLICY "portal_stats_insert" ON portal_stats FOR INSERT WITH CHECK (get_portal_role() IN ('admin','direction'));

-- portal_assets
CREATE POLICY "portal_assets_select" ON portal_assets FOR SELECT USING (get_portal_role() IN ('admin','direction') OR client_id = get_portal_client_id());
CREATE POLICY "portal_assets_insert" ON portal_assets FOR INSERT WITH CHECK (get_portal_role() IN ('admin','direction'));
CREATE POLICY "portal_assets_delete" ON portal_assets FOR DELETE USING (get_portal_role() IN ('admin','direction'));
