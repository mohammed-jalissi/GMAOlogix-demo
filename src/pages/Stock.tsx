import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, AlertTriangle, Package, TrendingDown, TrendingUp, X, Save, ArrowDownLeft } from 'lucide-react';
import { createPiece, getPiecesRechange, getCategoriesPiece, ajouterMouvementStock } from '../lib/stock.service';
import { getFournisseurs } from '../lib/fournisseurs.service';
import type { PieceRechange, CategoriePiece, Fournisseur } from '../lib/supabase';
import { useDarijaNotify, DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';


export default function Stock() {
    const { notify } = useDarijaNotify();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [pieces, setPieces] = useState<PieceRechange[]>([]);
    const [categories, setCategories] = useState<CategoriePiece[]>([]);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showNewPieceModal, setShowNewPieceModal] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);

    // Forms state
    const [newPieceData, setNewPieceData] = useState({
        code: '',
        designation: '',
        categorie_id: '',
        fournisseur_id: '',
        stock_min: 5,
        stock_max: 20,
        prix_unitaire: 0,
        emplacement: '',
        critique: false
    });

    const [entryData, setEntryData] = useState({
        piece_id: '',
        quantite: 1,
        motif: 'Livraison fournisseur'
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const [piecesData, catsData, frnData] = await Promise.all([
                getPiecesRechange(),
                getCategoriesPiece(),
                getFournisseurs()
            ]);
            setPieces(piecesData);
            setCategories(catsData);
            setFournisseurs(frnData);
        } catch (error) {
            console.error('Erreur chargement stock:', error);
            notify('error_generic', 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleCreatePiece = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPiece({
                ...newPieceData,
                stock_actuel: 0,
                actif: true
            });
            notify('piece_creee_success', 'success');
            setShowNewPieceModal(false);
            setNewPieceData({
                code: '',
                designation: '',
                categorie_id: '',
                fournisseur_id: '',
                stock_min: 5,
                stock_max: 20,
                prix_unitaire: 0,
                emplacement: '',
                critique: false
            });
            fetchData();
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        }
    };

    const handleStockEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ajouterMouvementStock(
                entryData.piece_id,
                'entree',
                Number(entryData.quantite),
                entryData.motif
            );
            notify('stock_entree_success', 'success');
            setShowEntryModal(false);
            setEntryData({ piece_id: '', quantite: 1, motif: 'Livraison fournisseur' });
            fetchData();
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        }
    };

    const getStockStatus = (piece: PieceRechange) => {
        if (piece.stock_actuel <= piece.stock_minimum) return 'critique';
        if (piece.stock_actuel <= piece.stock_minimum * 1.5) return 'bas';
        return 'ok';
    };

    const filteredPieces = pieces.filter(p => {
        const matchSearch = p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTab = activeTab === 'all' ||
            (activeTab === 'critique' && getStockStatus(p) === 'critique') ||
            (activeTab === 'bas' && getStockStatus(p) === 'bas');
        return matchSearch && matchTab;
    });

    const statsData = [
        { label: 'Total pièces', value: pieces.length, icon: Package, color: 'blue' },
        { label: 'Stock critique', value: pieces.filter(p => getStockStatus(p) === 'critique').length, icon: AlertTriangle, color: 'red' },
        { label: 'À commander', value: pieces.filter(p => getStockStatus(p) !== 'ok').length, icon: TrendingDown, color: 'orange' },
        { label: 'Valeur totale', value: `${pieces.reduce((acc, p) => acc + (p.stock_actuel * (p.prix_unitaire || 0)), 0).toFixed(0)} MAD`, icon: TrendingUp, color: 'green' },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Stock & Pièces de Rechange</h2>
                <p className="page-subtitle">Gérez votre inventaire de pièces détachées</p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                {statsData.map((stat, idx) => (
                    <div key={idx} className="glass-card stat-card">
                        <div className={`stat-icon ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    Toutes les pièces
                </button>
                <button className={`tab ${activeTab === 'critique' ? 'active' : ''}`} onClick={() => setActiveTab('critique')}>
                    Stock critique
                </button>
                <button className={`tab ${activeTab === 'bas' ? 'active' : ''}`} onClick={() => setActiveTab('bas')}>
                    Stock bas
                </button>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Rechercher une pièce..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={18} />
                        Filtrer
                    </button>
                    <DarijaHelpBtn messageKey="help_filter_stock" dictionary={DARIJA_DICTIONARY} />
                </div>
                <div className="action-bar-right">
                    <button className="btn btn-secondary" onClick={() => setShowEntryModal(true)}>
                        <ArrowDownLeft size={18} />
                        Entrée stock
                    </button>
                    <DarijaHelpBtn messageKey="help_entry_stock" dictionary={DARIJA_DICTIONARY} />
                    <button className="btn btn-primary" onClick={() => setShowNewPieceModal(true)}>
                        <Plus size={18} />
                        Nouvelle pièce
                    </button>
                    <DarijaHelpBtn messageKey="help_add_piece" dictionary={DARIJA_DICTIONARY} />
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Désignation</th>
                                <th>Catégorie</th>
                                <th>Fournisseur</th>
                                <th>Stock</th>
                                <th>Min</th>
                                <th>Prix</th>
                                <th>Emplacement</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPieces.map((piece) => {
                                const status = getStockStatus(piece);
                                return (
                                    <tr key={piece.id}>
                                        <td><strong>{piece.code}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {piece.designation}
                                                {piece.critique && (
                                                    <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                                        Critique
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{(piece as any).categorie?.nom || '-'}</td>
                                        <td>
                                            {piece.fournisseur ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{piece.fournisseur.nom}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8' }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <strong style={{ color: status === 'critique' ? 'var(--accent-red)' : status === 'bas' ? 'var(--warning)' : 'var(--accent-green)' }}>
                                                {piece.stock_actuel}
                                            </strong>
                                        </td>
                                        <td>{piece.stock_minimum}</td>
                                        <td>{(piece.prix_unitaire || 0).toFixed(2)} MAD</td>
                                        <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{piece.emplacement}</code></td>
                                        <td>
                                            <span className={`badge ${status === 'critique' ? 'badge-danger' : status === 'bas' ? 'badge-warning' : 'badge-success'}`}>
                                                {status === 'critique' ? 'Critique' : status === 'bas' ? 'Bas' : 'OK'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="header-icon-btn" style={{ width: '32px', height: '32px' }}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="header-icon-btn" style={{ width: '32px', height: '32px' }}>
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* New Piece Modal */}
            {showNewPieceModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Nouvelle Pièce de Rechange</h3>
                            <button className="header-icon-btn" onClick={() => setShowNewPieceModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePiece}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Code Pièce</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        required
                                        value={newPieceData.code}
                                        onChange={e => setNewPieceData({ ...newPieceData, code: e.target.value })}
                                        placeholder="EX: REF-001"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Catégorie</label>
                                    <select
                                        className="form-input form-select"
                                        required
                                        value={newPieceData.categorie_id}
                                        onChange={e => setNewPieceData({ ...newPieceData, categorie_id: e.target.value })}
                                    >
                                        <option value="">Sélectionner</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fournisseur</label>
                                <select
                                    className="form-input form-select"
                                    value={newPieceData.fournisseur_id}
                                    onChange={e => setNewPieceData({ ...newPieceData, fournisseur_id: e.target.value })}
                                >
                                    <option value="">Sélectionner un fournisseur</option>
                                    {fournisseurs.map(f => (
                                        <option key={f.id} value={f.id}>{f.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Désignation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newPieceData.designation}
                                    onChange={e => setNewPieceData({ ...newPieceData, designation: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Stock Min</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        required
                                        min="0"
                                        value={newPieceData.stock_min}
                                        onChange={e => setNewPieceData({ ...newPieceData, stock_min: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Prix Unitaire (MAD)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        required
                                        step="0.01"
                                        value={newPieceData.prix_unitaire}
                                        onChange={e => setNewPieceData({ ...newPieceData, prix_unitaire: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Emplacement</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newPieceData.emplacement}
                                        onChange={e => setNewPieceData({ ...newPieceData, emplacement: e.target.value })}
                                        placeholder="Rayon A, Étagère 2"
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newPieceData.critique}
                                            onChange={e => setNewPieceData({ ...newPieceData, critique: e.target.checked })}
                                        />
                                        Pièce Critique ?
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewPieceModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Save size={18} />
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stock Entry Modal */}
            {showEntryModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Entrée de Stock</h3>
                            <button className="header-icon-btn" onClick={() => setShowEntryModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleStockEntry}>
                            <div className="form-group">
                                <label className="form-label">Pièce</label>
                                <select
                                    className="form-input form-select"
                                    required
                                    value={entryData.piece_id}
                                    onChange={e => setEntryData({ ...entryData, piece_id: e.target.value })}
                                >
                                    <option value="">Sélectionner une pièce</option>
                                    {pieces.map(p => (
                                        <option key={p.id} value={p.id}>{p.code} - {p.designation}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Quantité à ajouter</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    required
                                    min="1"
                                    value={entryData.quantite}
                                    onChange={e => setEntryData({ ...entryData, quantite: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Motif / Origine</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={entryData.motif}
                                    onChange={e => setEntryData({ ...entryData, motif: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEntryModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <ArrowDownLeft size={18} />
                                    Confirmer Entrée
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
