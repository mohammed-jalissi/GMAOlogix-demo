import type { Equipement, CategorieEquipement, Site } from './supabase';
import {
    mockEquipements,
    mockCategoriesEquipement,
    mockSites,
    generateId,
    delay
} from './mock-data';

// ============================================
// ÉQUIPEMENTS
// ============================================

export async function getEquipements(): Promise<Equipement[]> {
    await delay(300); // Simuler le délai réseau
    return [...mockEquipements];
}

export async function generateNextEquipementCode(): Promise<string> {
    await delay(100);
    const lastCode = mockEquipements[mockEquipements.length - 1]?.code || 'EQ-000';
    const match = lastCode.match(/EQ-(\d+)/);
    if (match) {
        const nextNumber = parseInt(match[1], 10) + 1;
        return `EQ-${String(nextNumber).padStart(3, '0')}`;
    }
    return 'EQ-001';
}

export async function getEquipement(id: string): Promise<Equipement> {
    await delay(200);
    const equipement = mockEquipements.find(e => e.id === id);
    if (!equipement) throw new Error('Équipement non trouvé');
    return equipement;
}

export async function createEquipement(equipement: Partial<Equipement>): Promise<Equipement> {
    await delay(300);
    const newEquipement: Equipement = {
        id: generateId('equipement'),
        code: equipement.code || '',
        nom: equipement.nom || '',
        statut: (equipement.statut || 'en_service') as Equipement['statut'],
        criticite: (equipement.criticite || 'moyenne') as Equipement['criticite'],
        actif: true,
        created_at: new Date().toISOString(),
        ...equipement
    } as Equipement;

    // Ajouter les relations
    if (newEquipement.categorie_id) {
        newEquipement.categorie = mockCategoriesEquipement.find(c => c.id === newEquipement.categorie_id);
    }
    if (newEquipement.site_id) {
        newEquipement.site = mockSites.find(s => s.id === newEquipement.site_id);
    }

    mockEquipements.push(newEquipement);
    return newEquipement;
}

export async function updateEquipement(id: string, updates: Partial<Equipement>): Promise<Equipement> {
    await delay(300);
    const index = mockEquipements.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Équipement non trouvé');

    mockEquipements[index] = { ...mockEquipements[index], ...updates };

    // Mettre à jour les relations
    if (mockEquipements[index].categorie_id) {
        mockEquipements[index].categorie = mockCategoriesEquipement.find(c => c.id === mockEquipements[index].categorie_id);
    }
    if (mockEquipements[index].site_id) {
        mockEquipements[index].site = mockSites.find(s => s.id === mockEquipements[index].site_id);
    }

    return mockEquipements[index];
}

export async function deleteEquipement(id: string): Promise<void> {
    await delay(200);
    const index = mockEquipements.findIndex(e => e.id === id);
    if (index !== -1) {
        mockEquipements[index].actif = false;
    }
}

export async function getCategoriesEquipement(): Promise<CategorieEquipement[]> {
    await delay(150);
    return [...mockCategoriesEquipement];
}

export async function getSites(): Promise<Site[]> {
    await delay(150);
    return [...mockSites];
}

// Stats équipements
export async function getEquipementStats() {
    await delay(200);
    return {
        total: mockEquipements.filter(e => e.actif).length,
        enPanne: mockEquipements.filter(e => e.statut === 'en_panne' && e.actif).length,
        enMaintenance: mockEquipements.filter(e => e.statut === 'en_maintenance' && e.actif).length,
    };
}
