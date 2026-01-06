import type { OrdreTravail, DemandeIntervention } from './supabase';
import {
    mockOrdresTravail,
    mockDemandesIntervention,
    mockEquipements,
    mockProfils,
    mockTechniciens,
    generateId,
    delay
} from './mock-data';

// ============================================
// ORDRES DE TRAVAIL
// ============================================

export async function getOrdresTravail(): Promise<OrdreTravail[]> {
    await delay(300);
    return [...mockOrdresTravail];
}

export async function getOrdreTravail(id: string): Promise<OrdreTravail> {
    await delay(200);
    const ot = mockOrdresTravail.find(o => o.id === id);
    if (!ot) throw new Error('Ordre de travail non trouvé');
    return ot;
}

export async function createOrdreTravail(ot: Partial<OrdreTravail>): Promise<OrdreTravail> {
    await delay(300);
    const numero = `OT-2024-${String(mockOrdresTravail.length + 1).padStart(3, '0')}`;

    const newOT: OrdreTravail = {
        id: generateId('ot'),
        numero,
        type_maintenance: ot.type_maintenance || 'corrective',
        priorite: ot.priorite || 'normale',
        titre: ot.titre || '',
        description: ot.description || '',
        statut: ot.statut || 'planifie',
        created_at: new Date().toISOString(),
        ...ot
    } as OrdreTravail;

    // Ajouter les relations
    if (newOT.equipement_id) {
        newOT.equipement = mockEquipements.find(e => e.id === newOT.equipement_id);
    }
    if (newOT.technicien_id) {
        newOT.technicien = mockTechniciens.find(t => t.id === newOT.technicien_id);
    }

    mockOrdresTravail.push(newOT);
    return newOT;
}

export async function updateOrdreTravail(id: string, updates: Partial<OrdreTravail>): Promise<OrdreTravail> {
    await delay(300);
    const index = mockOrdresTravail.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Ordre de travail non trouvé');

    mockOrdresTravail[index] = { ...mockOrdresTravail[index], ...updates };

    // Mettre à jour les relations
    if (mockOrdresTravail[index].equipement_id) {
        mockOrdresTravail[index].equipement = mockEquipements.find(e => e.id === mockOrdresTravail[index].equipement_id);
    }
    if (mockOrdresTravail[index].technicien_id) {
        mockOrdresTravail[index].technicien = mockTechniciens.find(t => t.id === mockOrdresTravail[index].technicien_id);
    }

    return mockOrdresTravail[index];
}

export async function updateStatutOT(id: string, statut: OrdreTravail['statut']): Promise<OrdreTravail> {
    const updates: Partial<OrdreTravail> = { statut };

    if (statut === 'en_cours') {
        updates.date_debut_reel = new Date().toISOString();
    } else if (statut === 'termine') {
        updates.date_fin_reel = new Date().toISOString();
    }

    return updateOrdreTravail(id, updates);
}

// Stats OT
export async function getOTStats() {
    await delay(200);
    return {
        enCours: mockOrdresTravail.filter(o => ['planifie', 'en_cours', 'en_attente'].includes(o.statut)).length,
        terminesMois: mockOrdresTravail.filter(o => o.statut === 'termine').length,
    };
}

// ============================================
// DEMANDES D'INTERVENTION
// ============================================

export async function getDemandesIntervention(): Promise<DemandeIntervention[]> {
    await delay(300);
    return [...mockDemandesIntervention];
}

export async function getDemandeIntervention(id: string): Promise<DemandeIntervention> {
    await delay(200);
    const demande = mockDemandesIntervention.find(d => d.id === id);
    if (!demande) throw new Error('Demande non trouvée');
    return demande;
}

export async function createDemandeIntervention(demande: Partial<DemandeIntervention>): Promise<DemandeIntervention> {
    await delay(300);
    const numero = `DI-2024-${String(mockDemandesIntervention.length + 1).padStart(3, '0')}`;

    const newDemande: DemandeIntervention = {
        id: generateId('demande'),
        numero,
        demandeur_id: demande.demandeur_id || '1',
        priorite: demande.priorite || 'normale',
        type_demande: demande.type_demande || 'panne',
        titre: demande.titre || '',
        description: demande.description || '',
        statut: demande.statut || 'nouvelle',
        created_at: new Date().toISOString(),
        ...demande
    } as DemandeIntervention;

    // Ajouter les relations
    if (newDemande.equipement_id) {
        newDemande.equipement = mockEquipements.find(e => e.id === newDemande.equipement_id);
    }
    if (newDemande.demandeur_id) {
        newDemande.demandeur = mockProfils.find(p => p.id === newDemande.demandeur_id);
    }

    mockDemandesIntervention.push(newDemande);
    return newDemande;
}

export async function updateDemandeIntervention(id: string, updates: Partial<DemandeIntervention>): Promise<DemandeIntervention> {
    await delay(300);
    const index = mockDemandesIntervention.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Demande non trouvée');

    mockDemandesIntervention[index] = { ...mockDemandesIntervention[index], ...updates };

    // Mettre à jour les relations
    if (mockDemandesIntervention[index].equipement_id) {
        mockDemandesIntervention[index].equipement = mockEquipements.find(e => e.id === mockDemandesIntervention[index].equipement_id);
    }
    if (mockDemandesIntervention[index].demandeur_id) {
        mockDemandesIntervention[index].demandeur = mockProfils.find(p => p.id === mockDemandesIntervention[index].demandeur_id);
    }

    return mockDemandesIntervention[index];
}

export async function approuverDemande(id: string, userId: string): Promise<DemandeIntervention> {
    return updateDemandeIntervention(id, {
        statut: 'approuvee',
        validee_par: userId,
        date_validation: new Date().toISOString(),
    });
}

export async function rejeterDemande(id: string, userId: string, commentaire: string): Promise<DemandeIntervention> {
    return updateDemandeIntervention(id, {
        statut: 'rejetee',
        validee_par: userId,
        date_validation: new Date().toISOString(),
        commentaire_validation: commentaire,
    });
}

export async function convertirDemandeEnOT(demandeId: string, otData: Partial<OrdreTravail>): Promise<OrdreTravail> {
    // Créer l'OT
    const ot = await createOrdreTravail({
        ...otData,
        demande_id: demandeId,
    });

    // Mettre à jour la demande
    await updateDemandeIntervention(demandeId, {
        statut: 'convertie_ot',
        ordre_travail_id: ot.id,
    });

    return ot;
}

// Stats demandes
export async function getDemandesStats() {
    await delay(200);
    return {
        nouvelles: mockDemandesIntervention.filter(d => d.statut === 'nouvelle').length,
        enEvaluation: mockDemandesIntervention.filter(d => d.statut === 'en_evaluation').length,
        enAttente: mockDemandesIntervention.filter(d => ['nouvelle', 'en_evaluation'].includes(d.statut)).length,
    };
}
