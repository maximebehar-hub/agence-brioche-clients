-- =============================================
-- Pas de trigger nécessaire : on réutilise le trigger
-- existant de l'ERP qui crée déjà les profils.
-- Il suffit de mettre à jour portal_role et portal_client_id
-- manuellement pour les utilisateurs du portail.
-- =============================================

-- Exemple : donner l'accès admin au portail à un utilisateur existant
-- UPDATE profiles SET portal_role = 'admin' WHERE email = 'maxime.behar@agencebrioche.fr';

-- Exemple : lier un utilisateur client à son espace
-- UPDATE profiles SET portal_role = 'client', portal_client_id = '<uuid-du-client>' WHERE email = 'contact@skoda.fr';
