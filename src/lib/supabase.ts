// Types de base de données (conservés pour la compatibilité)
export interface Profile {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    role_id?: string;
    actif: boolean;
    avatar_url?: string;
    created_at: string;
}

export interface Equipement {
    id: string;
    code: string;
    nom: string;
    categorie_id?: string;
    marque?: string;
    modele?: string;
    numero_serie?: string;
    annee_fabrication?: number;
    date_mise_service?: string;
    site_id?: string;
    batiment_id?: string;
    zone_id?: string;
    statut: 'en_service' | 'en_panne' | 'en_maintenance' | 'hors_service' | 'en_attente';
    criticite: 'faible' | 'moyenne' | 'haute' | 'critique';
    valeur_achat?: number;
    description?: string;
    photo_url?: string;
    actif: boolean;
    created_at: string;
    // Relations
    categorie?: CategorieEquipement;
    site?: Site;
}

export interface CategorieEquipement {
    id: string;
    nom: string;
    description?: string;
    icone?: string;
}

export interface Site {
    id: string;
    nom: string;
    adresse?: string;
    ville?: string;
    code_postal?: string;
    pays?: string;
    actif: boolean;
}

export interface Technicien {
    id: string;
    profil_id?: string;
    matricule?: string;
    specialite_id?: string;
    niveau: 'junior' | 'confirme' | 'senior' | 'expert';
    taux_horaire?: number;
    disponible: boolean;
    date_embauche?: string;
    // Relations
    profil?: Profile;
    specialite?: Specialite;
}

export interface Specialite {
    id: string;
    nom: string;
    description?: string;
}

export interface DemandeIntervention {
    id: string;
    numero: string;
    equipement_id?: string;
    demandeur_id: string;
    service_demandeur?: string;
    date_souhaitee?: string;
    priorite: 'basse' | 'normale' | 'haute' | 'urgente';
    type_demande: 'panne' | 'anomalie' | 'amelioration' | 'installation' | 'autre';
    titre: string;
    description: string;
    localisation?: string;
    statut: 'nouvelle' | 'en_evaluation' | 'approuvee' | 'rejetee' | 'convertie_ot' | 'annulee';
    validee_par?: string;
    date_validation?: string;
    commentaire_validation?: string;
    ordre_travail_id?: string;
    created_at: string;
    // Relations
    equipement?: Equipement;
    demandeur?: Profile;
}

export interface OrdreTravail {
    id: string;
    numero: string;
    demande_id?: string;
    equipement_id?: string;
    type_maintenance: 'corrective' | 'preventive' | 'predictive' | 'ameliorative';
    priorite: 'basse' | 'normale' | 'haute' | 'urgente';
    titre: string;
    description: string;
    statut: 'planifie' | 'en_attente' | 'en_cours' | 'en_pause' | 'termine' | 'annule';
    date_prevue_debut?: string;
    date_prevue_fin?: string;
    date_debut_reel?: string;
    date_fin_reel?: string;
    duree_prevue_heures?: number;
    duree_reelle_heures?: number;
    technicien_id?: string;
    cree_par?: string;
    cout_main_oeuvre?: number;
    cout_pieces?: number;
    created_at: string;
    // Relations
    equipement?: Equipement;
    technicien?: Technicien;
}

export interface PlanMaintenance {
    id: string;
    equipement_id?: string;
    nom: string;
    description?: string;
    type_declenchement: 'calendrier' | 'compteur' | 'mixte';
    frequence_jours?: number;
    prochaine_date?: string;
    duree_estimee_heures?: number;
    technicien_id?: string;
    actif: boolean;
    // Relations
    equipement?: Equipement;
    technicien?: Technicien;
}

export interface PieceRechange {
    id: string;
    code: string;
    designation: string;
    categorie_id?: string;
    reference_fabricant?: string;
    unite: 'unite' | 'kg' | 'litre' | 'metre' | 'boite' | 'lot';
    stock_actuel: number;
    stock_minimum: number;
    stock_maximum?: number;
    point_commande?: number;
    emplacement_magasin?: string;
    emplacement: string;
    prix_unitaire?: number;
    critique: boolean;
    actif: boolean;
    // Relations
    categorie?: CategoriePiece;
    fournisseur_id?: string;
    fournisseur?: Fournisseur;
}

export interface CategoriePiece {
    id: string;
    nom: string;
    description?: string;
}

export interface Fournisseur {
    id: string;
    code: string;
    nom: string;
    type_fournisseur: 'pieces' | 'services' | 'mixte';
    adresse?: string;
    ville?: string;
    telephone?: string;
    email?: string;
    contact_principal?: string;
    evaluation?: number;
    actif: boolean;
}

export interface Notification {
    id: string;
    utilisateur_id: string;
    type: string;
    titre: string;
    message?: string;
    lue: boolean;
    lien_reference?: string;
    created_at: string;
}

// Pas de client Supabase - utilisation de données fictives uniquement
export default {};
