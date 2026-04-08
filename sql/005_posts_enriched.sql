-- Migration: enrichir portal_posts avec les 30 colonnes du tableau de pilotage
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS sujet TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS wording TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS categorie TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS avec TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS content_type TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS sponso BOOLEAN DEFAULT false;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS qui_edito TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS statut_edito TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS temps_edito INT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS qui_graph TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS statut_graph TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS temps_graph INT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS qui_publi TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS statut_rs TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS heure_publi TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS lien_publi TEXT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS impressions BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS impressions_payees BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS couverture BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS interactions BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS coms BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS follows BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS partage BIGINT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS duree_video FLOAT;
ALTER TABLE portal_posts ADD COLUMN IF NOT EXISTS duree_moyenne FLOAT;

-- Options par client (catégories, avec, équipe)
ALTER TABLE portal_clients ADD COLUMN IF NOT EXISTS options_categories JSONB DEFAULT '[]';
ALTER TABLE portal_clients ADD COLUMN IF NOT EXISTS options_avec JSONB DEFAULT '[]';
ALTER TABLE portal_clients ADD COLUMN IF NOT EXISTS options_team JSONB DEFAULT '[]';
