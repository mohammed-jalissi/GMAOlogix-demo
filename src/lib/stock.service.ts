import type { PieceRechange, CategoriePiece, Fournisseur } from './supabase';
import {
    mockPiecesRechange,
    mockCategoriesPiece,
    mockFournisseurs,
    generateId,
    delay
} from './mock-data';

// ============================================
// PIÈCES DE RECHANGE
// ============================================

export async function getPiecesRechange(): Promise<PieceRechange[]> {
    await delay(300);
    return [...mockPiecesRechange];
}

export async function getPiece(id: string): Promise<PieceRechange> {
    await delay(200);
    const piece = mockPiecesRechange.find(p => p.id === id);
    if (!piece) throw new Error('Pièce non trouvée');
    return piece;
}

export async function createPiece(piece: Partial<PieceRechange>): Promise<PieceRechange> {
    await delay(300);
    const newPiece: PieceRechange = {
        id: generateId('piece'),
        code: piece.code || '',
        designation: piece.designation || '',
        unite: (piece.unite || 'unite') as PieceRechange['unite'],
        stock_actuel: piece.stock_actuel || 0,
        stock_minimum: piece.stock_minimum || 0,
        emplacement: piece.emplacement || '',
        critique: piece.critique || false,
        actif: true,
        ...piece
    } as PieceRechange;

    // Ajouter la relation catégorie
    if (newPiece.categorie_id) {
        newPiece.categorie = mockCategoriesPiece.find(c => c.id === newPiece.categorie_id);
    }

    mockPiecesRechange.push(newPiece);
    return newPiece;
}

export async function updatePiece(id: string, updates: Partial<PieceRechange>): Promise<PieceRechange> {
    await delay(300);
    const index = mockPiecesRechange.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pièce non trouvée');

    mockPiecesRechange[index] = { ...mockPiecesRechange[index], ...updates };

    // Mettre à jour la relation catégorie
    if (mockPiecesRechange[index].categorie_id) {
        mockPiecesRechange[index].categorie = mockCategoriesPiece.find(c => c.id === mockPiecesRechange[index].categorie_id);
    }

    return mockPiecesRechange[index];
}

export async function deletePiece(id: string): Promise<void> {
    await delay(200);
    const index = mockPiecesRechange.findIndex(p => p.id === id);
    if (index !== -1) {
        mockPiecesRechange[index].actif = false;
    }
}

export async function getCategoriesPiece(): Promise<CategoriePiece[]> {
    await delay(150);
    return [...mockCategoriesPiece];
}

// Mouvements de stock
export async function ajouterMouvementStock(pieceId: string, type: 'entree' | 'sortie', quantite: number, _motif: string): Promise<void> {
    await delay(300);
    const piece = mockPiecesRechange.find(p => p.id === pieceId);
    if (!piece) throw new Error('Pièce non trouvée');

    if (type === 'entree') {
        piece.stock_actuel += quantite;
    } else {
        piece.stock_actuel -= quantite;
        if (piece.stock_actuel < 0) piece.stock_actuel = 0;
    }
}

// Stats stock
export async function getStockStats() {
    await delay(200);
    const critiques = mockPiecesRechange.filter(p => p.stock_actuel <= p.stock_minimum && p.actif);
    const valeurTotale = mockPiecesRechange
        .filter(p => p.actif)
        .reduce((sum, p) => sum + (p.stock_actuel * (p.prix_unitaire || 0)), 0);

    return {
        total: mockPiecesRechange.filter(p => p.actif).length,
        critique: critiques.length,
        aCommander: mockPiecesRechange.filter(p => p.stock_actuel <= (p.point_commande || p.stock_minimum) && p.actif).length,
        valeurTotale
    };
}

// ============================================
// FOURNISSEURS
// ============================================

export async function getFournisseurs(): Promise<Fournisseur[]> {
    await delay(300);
    return [...mockFournisseurs];
}

export async function getFournisseur(id: string): Promise<Fournisseur> {
    await delay(200);
    const fournisseur = mockFournisseurs.find(f => f.id === id);
    if (!fournisseur) throw new Error('Fournisseur non trouvé');
    return fournisseur;
}

export async function createFournisseur(fournisseur: Partial<Fournisseur>): Promise<Fournisseur> {
    await delay(300);
    const newFournisseur: Fournisseur = {
        id: String(mockFournisseurs.length + 1),
        code: fournisseur.code || '',
        nom: fournisseur.nom || '',
        type_fournisseur: (fournisseur.type_fournisseur || 'pieces') as Fournisseur['type_fournisseur'],
        actif: true,
        ...fournisseur
    } as Fournisseur;

    mockFournisseurs.push(newFournisseur);
    return newFournisseur;
}

export async function updateFournisseur(id: string, updates: Partial<Fournisseur>): Promise<Fournisseur> {
    await delay(300);
    const index = mockFournisseurs.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Fournisseur non trouvé');

    mockFournisseurs[index] = { ...mockFournisseurs[index], ...updates };
    return mockFournisseurs[index];
}

export async function deleteFournisseur(id: string): Promise<void> {
    await delay(200);
    const index = mockFournisseurs.findIndex(f => f.id === id);
    if (index !== -1) {
        mockFournisseurs[index].actif = false;
    }
}
