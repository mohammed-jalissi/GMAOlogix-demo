import type { Technicien, Specialite, PlanMaintenance } from './supabase';
import {
    mockTechniciens,
    mockSpecialites,
    mockPlansMaintenance,
    mockEquipements,
    mockProfils,
    generateId,
    delay
} from './mock-data';

// ============================================
// TECHNICIENS
// ============================================

export async function getTechniciens(): Promise<Technicien[]> {
    await delay(300);
    return [...mockTechniciens];
}

export async function getTechnicien(id: string): Promise<Technicien> {
    await delay(200);
    const technicien = mockTechniciens.find(t => t.id === id);
    if (!technicien) throw new Error('Technicien non trouvé');
    return technicien;
}

export async function createTechnicien(technicien: Partial<Technicien>): Promise<Technicien> {
    await delay(300);
    const newTechnicien: Technicien = {
        id: generateId('technicien'),
        niveau: technicien.niveau || 'junior',
        disponible: true,
        ...technicien
    } as Technicien;

    // Ajouter les relations
    if (newTechnicien.profil_id) {
        newTechnicien.profil = mockProfils.find(p => p.id === newTechnicien.profil_id);
    }
    if (newTechnicien.specialite_id) {
        newTechnicien.specialite = mockSpecialites.find(s => s.id === newTechnicien.specialite_id);
    }

    mockTechniciens.push(newTechnicien);
    return newTechnicien;
}

export async function updateTechnicien(id: string, updates: Partial<Technicien>): Promise<Technicien> {
    await delay(300);
    const index = mockTechniciens.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Technicien non trouvé');

    mockTechniciens[index] = { ...mockTechniciens[index], ...updates };

    // Mettre à jour les relations
    if (mockTechniciens[index].profil_id) {
        mockTechniciens[index].profil = mockProfils.find(p => p.id === mockTechniciens[index].profil_id);
    }
    if (mockTechniciens[index].specialite_id) {
        mockTechniciens[index].specialite = mockSpecialites.find(s => s.id === mockTechniciens[index].specialite_id);
    }

    return mockTechniciens[index];
}

export async function deleteTechnicien(id: string): Promise<void> {
    await delay(200);
    const index = mockTechniciens.findIndex(t => t.id === id);
    if (index > -1) {
        mockTechniciens.splice(index, 1);
    }
}

export async function getSpecialites(): Promise<Specialite[]> {
    await delay(150);
    return [...mockSpecialites];
}

// ============================================
// PLANS DE MAINTENANCE
// ============================================

export async function getPlansMaintenance(): Promise<PlanMaintenance[]> {
    await delay(300);
    return [...mockPlansMaintenance];
}

export async function getPlanMaintenance(id: string): Promise<PlanMaintenance> {
    await delay(200);
    const plan = mockPlansMaintenance.find(p => p.id === id);
    if (!plan) throw new Error('Plan non trouvé');
    return plan;
}

export async function createPlanMaintenance(plan: Partial<PlanMaintenance>): Promise<PlanMaintenance> {
    await delay(300);
    const newPlan: PlanMaintenance = {
        id: generateId('plan'),
        nom: plan.nom || '',
        type_declenchement: plan.type_declenchement || 'calendrier',
        actif: true,
        ...plan
    } as PlanMaintenance;

    // Ajouter les relations
    if (newPlan.equipement_id) {
        newPlan.equipement = mockEquipements.find(e => e.id === newPlan.equipement_id);
    }
    if (newPlan.technicien_id) {
        newPlan.technicien = mockTechniciens.find(t => t.id === newPlan.technicien_id);
    }

    mockPlansMaintenance.push(newPlan);
    return newPlan;
}

export async function updatePlanMaintenance(id: string, updates: Partial<PlanMaintenance>): Promise<PlanMaintenance> {
    await delay(300);
    const index = mockPlansMaintenance.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Plan non trouvé');

    mockPlansMaintenance[index] = { ...mockPlansMaintenance[index], ...updates };

    // Mettre à jour les relations
    if (mockPlansMaintenance[index].equipement_id) {
        mockPlansMaintenance[index].equipement = mockEquipements.find(e => e.id === mockPlansMaintenance[index].equipement_id);
    }
    if (mockPlansMaintenance[index].technicien_id) {
        mockPlansMaintenance[index].technicien = mockTechniciens.find(t => t.id === mockPlansMaintenance[index].technicien_id);
    }

    return mockPlansMaintenance[index];
}

export async function deletePlanMaintenance(id: string): Promise<void> {
    await delay(200);
    const index = mockPlansMaintenance.findIndex(p => p.id === id);
    if (index !== -1) {
        mockPlansMaintenance[index].actif = false;
    }
}

// Stats
export async function getMaintenanceStats() {
    await delay(200);
    return {
        plansActifs: mockPlansMaintenance.filter(p => p.actif).length,
        techniciensDisponibles: mockTechniciens.filter(t => t.disponible).length,
    };
}
