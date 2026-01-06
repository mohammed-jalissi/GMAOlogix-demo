-- ============================================
-- GMAO SUPABASE DATABASE SCHEMA
-- Compatible PostgreSQL pour Supabase
-- ============================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. GESTION DES UTILISATEURS ET DROITS
-- ============================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom_role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profils (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(20),
    role_id UUID REFERENCES roles(id),
    actif BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. GESTION DES SITES ET LOCALISATIONS
-- ============================================

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    pays VARCHAR(50) DEFAULT 'France',
    telephone VARCHAR(20),
    responsable_id UUID REFERENCES profils(id),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batiment_id UUID REFERENCES batiments(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. GESTION DES ÉQUIPEMENTS
-- ============================================

CREATE TABLE categories_equipement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icone VARCHAR(50)
);

CREATE TABLE equipements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    categorie_id UUID REFERENCES categories_equipement(id),
    marque VARCHAR(100),
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    annee_fabrication INTEGER,
    date_mise_service DATE,
    site_id UUID REFERENCES sites(id),
    batiment_id UUID REFERENCES batiments(id),
    zone_id UUID REFERENCES zones(id),
    statut VARCHAR(20) DEFAULT 'en_service' CHECK (statut IN ('en_service', 'en_panne', 'en_maintenance', 'hors_service', 'en_attente')),
    criticite VARCHAR(20) DEFAULT 'moyenne' CHECK (criticite IN ('faible', 'moyenne', 'haute', 'critique')),
    valeur_achat DECIMAL(10,2),
    cout_horaire DECIMAL(10,2),
    description TEXT,
    specifications_techniques TEXT,
    photo_url TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. GESTION DES TECHNICIENS
-- ============================================

CREATE TABLE specialites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE techniciens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profil_id UUID UNIQUE REFERENCES profils(id),
    matricule VARCHAR(50) UNIQUE,
    specialite_id UUID REFERENCES specialites(id),
    niveau VARCHAR(20) DEFAULT 'confirme' CHECK (niveau IN ('junior', 'confirme', 'senior', 'expert')),
    taux_horaire DECIMAL(10,2),
    disponible BOOLEAN DEFAULT TRUE,
    date_embauche DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. GESTION DES DEMANDES D'INTERVENTION
-- ============================================

CREATE TABLE demandes_intervention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    equipement_id UUID REFERENCES equipements(id),
    demandeur_id UUID REFERENCES profils(id) NOT NULL,
    service_demandeur VARCHAR(100),
    date_souhaitee DATE,
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    type_demande VARCHAR(20) NOT NULL CHECK (type_demande IN ('panne', 'anomalie', 'amelioration', 'installation', 'autre')),
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    localisation TEXT,
    statut VARCHAR(20) DEFAULT 'nouvelle' CHECK (statut IN ('nouvelle', 'en_evaluation', 'approuvee', 'rejetee', 'convertie_ot', 'annulee')),
    validee_par UUID REFERENCES profils(id),
    date_validation TIMESTAMPTZ,
    commentaire_validation TEXT,
    ordre_travail_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. GESTION DES ORDRES DE TRAVAIL
-- ============================================

CREATE TABLE ordres_travail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    demande_id UUID REFERENCES demandes_intervention(id),
    equipement_id UUID REFERENCES equipements(id),
    type_maintenance VARCHAR(20) NOT NULL CHECK (type_maintenance IN ('corrective', 'preventive', 'predictive', 'ameliorative')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_attente', 'en_cours', 'en_pause', 'termine', 'annule')),
    date_prevue_debut TIMESTAMPTZ,
    date_prevue_fin TIMESTAMPTZ,
    date_debut_reel TIMESTAMPTZ,
    date_fin_reel TIMESTAMPTZ,
    duree_prevue_heures DECIMAL(5,2),
    duree_reelle_heures DECIMAL(5,2),
    technicien_id UUID REFERENCES techniciens(id),
    cree_par UUID REFERENCES profils(id),
    approuve_par UUID REFERENCES profils(id),
    cout_main_oeuvre DECIMAL(10,2) DEFAULT 0,
    cout_pieces DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mettre à jour la référence dans demandes_intervention
ALTER TABLE demandes_intervention 
ADD CONSTRAINT fk_ordre_travail 
FOREIGN KEY (ordre_travail_id) REFERENCES ordres_travail(id);

-- ============================================
-- 7. GESTION DE LA MAINTENANCE PRÉVENTIVE
-- ============================================

CREATE TABLE plans_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipement_id UUID REFERENCES equipements(id),
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    type_declenchement VARCHAR(20) NOT NULL CHECK (type_declenchement IN ('calendrier', 'compteur', 'mixte')),
    frequence_jours INTEGER,
    frequence_compteur DECIMAL(10,2),
    unite_compteur VARCHAR(50),
    prochaine_date DATE,
    prochain_compteur DECIMAL(10,2),
    duree_estimee_heures DECIMAL(5,2),
    technicien_id UUID REFERENCES techniciens(id),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE taches_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans_maintenance(id) ON DELETE CASCADE,
    numero_ordre INTEGER,
    description TEXT NOT NULL,
    instructions TEXT,
    duree_estimee_minutes INTEGER,
    obligatoire BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 8. GESTION DES STOCKS ET PIÈCES
-- ============================================

CREATE TABLE categories_piece (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE pieces_rechange (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    categorie_id UUID REFERENCES categories_piece(id),
    reference_fabricant VARCHAR(100),
    unite VARCHAR(20) DEFAULT 'unite' CHECK (unite IN ('unite', 'kg', 'litre', 'metre', 'boite', 'lot')),
    stock_actuel DECIMAL(10,2) DEFAULT 0,
    stock_minimum DECIMAL(10,2) DEFAULT 0,
    stock_maximum DECIMAL(10,2),
    point_commande DECIMAL(10,2),
    emplacement_magasin VARCHAR(100),
    prix_unitaire DECIMAL(10,2),
    delai_livraison_jours INTEGER,
    critique BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    piece_id UUID REFERENCES pieces_rechange(id),
    type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement', 'retour')),
    quantite DECIMAL(10,2) NOT NULL,
    stock_avant DECIMAL(10,2),
    stock_apres DECIMAL(10,2),
    ordre_travail_id UUID REFERENCES ordres_travail(id),
    utilisateur_id UUID REFERENCES profils(id),
    motif TEXT,
    cout_unitaire DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. GESTION DES FOURNISSEURS
-- ============================================

CREATE TABLE fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    type_fournisseur VARCHAR(20) NOT NULL CHECK (type_fournisseur IN ('pieces', 'services', 'mixte')),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    pays VARCHAR(50),
    telephone VARCHAR(20),
    email VARCHAR(150),
    site_web VARCHAR(200),
    contact_principal VARCHAR(100),
    conditions_paiement VARCHAR(100),
    delai_livraison_moyen INTEGER,
    evaluation DECIMAL(3,2),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID REFERENCES profils(id),
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT,
    lue BOOLEAN DEFAULT FALSE,
    lien_reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profils ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE batiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_equipement ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipements ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialites ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniciens ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandes_intervention ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordres_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE taches_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_piece ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces_rechange ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour utilisateurs authentifiés (lecture)
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON profils FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON batiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON categories_equipement FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON equipements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON specialites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON techniciens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON demandes_intervention FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON ordres_travail FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON plans_maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON taches_maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON categories_piece FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON pieces_rechange FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON mouvements_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture pour utilisateurs authentifiés" ON fournisseurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Notifications propres" ON notifications FOR SELECT TO authenticated USING (utilisateur_id = auth.uid());

-- Politiques d'écriture pour utilisateurs authentifiés
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON demandes_intervention FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON ordres_travail FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON equipements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON pieces_rechange FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON mouvements_stock FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Écriture pour utilisateurs authentifiés" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- 12. FONCTIONS POUR GÉNÉRATION DE NUMÉROS
-- ============================================

CREATE OR REPLACE FUNCTION generate_numero_demande()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'DI-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('demande_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS demande_seq START 1;

CREATE TRIGGER trigger_numero_demande
    BEFORE INSERT ON demandes_intervention
    FOR EACH ROW
    WHEN (NEW.numero IS NULL)
    EXECUTE FUNCTION generate_numero_demande();

CREATE OR REPLACE FUNCTION generate_numero_ot()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero := 'OT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('ot_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ot_seq START 1;

CREATE TRIGGER trigger_numero_ot
    BEFORE INSERT ON ordres_travail
    FOR EACH ROW
    WHEN (NEW.numero IS NULL)
    EXECUTE FUNCTION generate_numero_ot();

-- ============================================
-- 13. DONNÉES INITIALES
-- ============================================

-- Rôles
INSERT INTO roles (nom_role, description) VALUES
('administrateur', 'Accès complet au système'),
('responsable_maintenance', 'Gestion des OT et équipes'),
('technicien', 'Exécution des interventions'),
('demandeur', 'Création de demandes d''intervention');

-- Catégories d'équipement
INSERT INTO categories_equipement (nom, description, icone) VALUES
('Mécanique', 'Équipements mécaniques', 'cog'),
('Électrique', 'Équipements électriques', 'zap'),
('Hydraulique', 'Systèmes hydrauliques', 'droplet'),
('Pneumatique', 'Systèmes pneumatiques', 'wind'),
('Usinage', 'Machines-outils', 'settings'),
('Convoyage', 'Systèmes de convoyage', 'arrow-right');

-- Spécialités
INSERT INTO specialites (nom, description) VALUES
('Mécanique', 'Maintenance mécanique'),
('Électricité', 'Maintenance électrique'),
('Hydraulique', 'Maintenance hydraulique'),
('Pneumatique', 'Maintenance pneumatique'),
('Automatisme', 'Maintenance automatismes'),
('Soudure', 'Travaux de soudure');

-- Catégories de pièces
INSERT INTO categories_piece (nom, description) VALUES
('Roulements', 'Roulements et paliers'),
('Courroies', 'Courroies et transmissions'),
('Filtres', 'Filtres divers'),
('Joints', 'Joints et étanchéité'),
('Lubrifiants', 'Huiles et graisses'),
('Électrique', 'Composants électriques');

-- Site exemple
INSERT INTO sites (nom, adresse, ville, code_postal, pays) VALUES
('Site Principal', '123 Rue de l''Industrie', 'Paris', '75001', 'France');

-- ============================================
-- 14. ACTIVER REALTIME
-- ============================================

-- Dans Supabase Dashboard > Database > Replication
-- Activer la publication pour ces tables:
-- ordres_travail, demandes_intervention, notifications, equipements

ALTER PUBLICATION supabase_realtime ADD TABLE ordres_travail;
ALTER PUBLICATION supabase_realtime ADD TABLE demandes_intervention;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE equipements;
