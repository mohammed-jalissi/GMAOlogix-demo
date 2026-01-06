-- ============================================
-- GMAO Pro - Complete Supabase Database Schema
-- Version: 1.0
-- Description: Multi-user GMAO SaaS Database
-- ============================================

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABLES DE BASE (Référentiels)
-- ============================================

-- Rôles utilisateurs
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (nom, description) VALUES
('admin', 'Administrateur système avec tous les droits'),
('responsable_maintenance', 'Responsable de la maintenance'),
('technicien', 'Technicien de maintenance'),
('demandeur', 'Utilisateur pouvant créer des demandes');

-- Profils utilisateurs (DÉCOUPLÉ de auth.users)
CREATE TABLE public.profils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    role_id UUID REFERENCES public.roles(id),
    actif BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites / Usines
CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Maroc',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spécialités techniciens
CREATE TABLE public.specialites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.specialites (nom) VALUES
('Mécanique'), ('Électricité'), ('Hydraulique'), ('Pneumatique'), ('Automatisme'), ('Instrumentation');

-- Catégories équipements
CREATE TABLE public.categories_equipement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    icone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.categories_equipement (nom, icone) VALUES
('Compresseurs', 'wind'), ('Pompes', 'droplet'), ('Moteurs', 'zap'), 
('Convoyeurs', 'move-horizontal'), ('Machines-outils', 'tool'), ('HVAC', 'thermometer');

-- Catégories pièces de rechange
CREATE TABLE public.categories_piece (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.categories_piece (nom) VALUES
('Filtres'), ('Courroies'), ('Roulements'), ('Joints'), ('Huiles'), ('Électronique');

-- ============================================
-- 3. TABLES PRINCIPALES
-- ============================================

-- Techniciens
CREATE TABLE public.techniciens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profil_id UUID REFERENCES public.profils(id) ON DELETE SET NULL,
    matricule VARCHAR(20) UNIQUE,
    specialite_id UUID REFERENCES public.specialites(id),
    niveau VARCHAR(20) CHECK (niveau IN ('junior', 'confirme', 'senior', 'expert')) DEFAULT 'junior',
    taux_horaire DECIMAL(10,2),
    disponible BOOLEAN DEFAULT TRUE,
    date_embauche DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Équipements
CREATE TABLE public.equipements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    categorie_id UUID REFERENCES public.categories_equipement(id),
    marque VARCHAR(100),
    modele VARCHAR(100),
    numero_serie VARCHAR(100),
    annee_fabrication INTEGER,
    date_mise_service DATE,
    site_id UUID REFERENCES public.sites(id),
    statut VARCHAR(20) CHECK (statut IN ('en_service', 'en_panne', 'en_maintenance', 'hors_service', 'en_attente')) DEFAULT 'en_service',
    criticite VARCHAR(20) CHECK (criticite IN ('faible', 'moyenne', 'haute', 'critique')) DEFAULT 'moyenne',
    valeur_achat DECIMAL(15,2),
    description TEXT,
    photo_url TEXT,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pièces de rechange
CREATE TABLE public.pieces_rechange (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(200) NOT NULL,
    categorie_id UUID REFERENCES public.categories_piece(id),
    reference_fabricant VARCHAR(100),
    unite VARCHAR(20) CHECK (unite IN ('unite', 'kg', 'litre', 'metre', 'boite', 'lot')) DEFAULT 'unite',
    stock_actuel INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 0,
    stock_maximum INTEGER,
    point_commande INTEGER,
    emplacement_magasin VARCHAR(100),
    emplacement VARCHAR(100),
    prix_unitaire DECIMAL(10,2),
    critique BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demandes d'intervention
CREATE TABLE public.demandes_intervention (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    equipement_id UUID REFERENCES public.equipements(id),
    demandeur_id UUID REFERENCES public.profils(id),
    service_demandeur VARCHAR(100),
    date_souhaitee DATE,
    priorite VARCHAR(20) CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')) DEFAULT 'normale',
    type_demande VARCHAR(30) CHECK (type_demande IN ('panne', 'anomalie', 'amelioration', 'installation', 'autre')) DEFAULT 'panne',
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    localisation VARCHAR(200),
    statut VARCHAR(30) CHECK (statut IN ('nouvelle', 'en_evaluation', 'approuvee', 'rejetee', 'convertie_ot', 'annulee')) DEFAULT 'nouvelle',
    validee_par UUID REFERENCES public.profils(id),
    date_validation TIMESTAMP WITH TIME ZONE,
    commentaire_validation TEXT,
    ordre_travail_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ordres de travail
CREATE TABLE public.ordres_travail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    demande_id UUID REFERENCES public.demandes_intervention(id),
    equipement_id UUID REFERENCES public.equipements(id),
    type_maintenance VARCHAR(30) CHECK (type_maintenance IN ('corrective', 'preventive', 'predictive', 'ameliorative')) DEFAULT 'corrective',
    priorite VARCHAR(20) CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')) DEFAULT 'normale',
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    statut VARCHAR(20) CHECK (statut IN ('planifie', 'en_attente', 'en_cours', 'en_pause', 'termine', 'annule')) DEFAULT 'planifie',
    date_prevue_debut DATE,
    date_prevue_fin DATE,
    date_debut_reel TIMESTAMP WITH TIME ZONE,
    date_fin_reel TIMESTAMP WITH TIME ZONE,
    duree_prevue_heures DECIMAL(8,2),
    duree_reelle_heures DECIMAL(8,2),
    technicien_id UUID REFERENCES public.techniciens(id),
    cree_par UUID REFERENCES public.profils(id),
    cout_main_oeuvre DECIMAL(10,2),
    cout_pieces DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans de maintenance préventive
CREATE TABLE public.plans_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipement_id UUID REFERENCES public.equipements(id),
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    type_declenchement VARCHAR(20) CHECK (type_declenchement IN ('calendrier', 'compteur', 'mixte')) DEFAULT 'calendrier',
    frequence_jours INTEGER,
    prochaine_date DATE,
    duree_estimee_heures DECIMAL(8,2),
    technicien_id UUID REFERENCES public.techniciens(id),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mouvements de stock
CREATE TABLE public.mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    piece_id UUID REFERENCES public.pieces_rechange(id) NOT NULL,
    type_mouvement VARCHAR(20) CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement')) NOT NULL,
    quantite INTEGER NOT NULL,
    ordre_travail_id UUID REFERENCES public.ordres_travail(id),
    motif TEXT,
    effectue_par UUID REFERENCES public.profils(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id UUID REFERENCES public.profils(id) NOT NULL,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT,
    lue BOOLEAN DEFAULT FALSE,
    lien_reference TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) - PUBLIC ACCESS
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.techniciens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_intervention ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordres_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pieces_rechange ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies: Allow PUBLIC (anon) access to all data
CREATE POLICY "Public access to all profiles" ON public.profils FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all sites" ON public.sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all equipements" ON public.equipements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all techniciens" ON public.techniciens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all demandes" ON public.demandes_intervention FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all ordres" ON public.ordres_travail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all plans" ON public.plans_maintenance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all pieces" ON public.pieces_rechange FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all mouvements" ON public.mouvements_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to all notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Removed auth trigger since we handle users manually or via direct insert

-- Function to generate sequential numbers
CREATE OR REPLACE FUNCTION public.generate_numero(prefix TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    result TEXT;
BEGIN
    EXECUTE format('SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM ''[0-9]+$'') AS INTEGER)), 0) + 1 FROM public.%I', table_name)
    INTO next_num;
    result := prefix || LPAD(next_num::TEXT, 5, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. SAMPLE DATA (Optional)
-- ============================================

-- Insert sample site
INSERT INTO public.sites (nom, ville, pays) VALUES
('Usine Principale', 'Casablanca', 'Maroc'),
('Site Nord', 'Tanger', 'Maroc');

-- Insert sample equipment (will work after a user signs up)
-- You can run these after creating your first user

-- ============================================
-- END OF SCHEMA
-- ============================================
