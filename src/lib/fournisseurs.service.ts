import { mockFournisseurs, mockPiecesRechange, delay } from './mock-data';
import type { Fournisseur } from './supabase';

export const getFournisseurs = async () => {
    await delay(500);
    return mockFournisseurs.map(f => {
        // Calculer les métriques dynamiques
        const piecesFournies = mockPiecesRechange.filter(p => p.fournisseur_id === f.id);
        const valeurStock = piecesFournies.reduce((acc, p) => acc + (p.stock_actuel * (p.prix_unitaire || 0)), 0);

        return {
            ...f,
            pieces_count: piecesFournies.length,
            valeur_stock: valeurStock
        } as unknown as Fournisseur;
    });
};

export const getPiecesByFournisseur = async (fournisseurId: string) => {
    await delay(300);
    return mockPiecesRechange.filter(p => p.fournisseur_id === fournisseurId);
};

export const getFournisseurById = async (id: string) => {
    await delay(300);
    return mockFournisseurs.find(f => f.id === id);
};
