import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Mail, Star, Package, TrendingUp } from 'lucide-react';
import { getFournisseurs } from '../lib/fournisseurs.service';
import type { Fournisseur } from '../lib/supabase';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';
import { DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';

const typeLabels: Record<string, { text: string; class: string }> = {
    'pieces': { text: 'Pièces', class: 'badge-info' },
    'services': { text: 'Services', class: 'badge-purple' },
    'mixte': { text: 'Mixte', class: 'badge-success' },
};

export default function Fournisseurs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getFournisseurs();
            setFournisseurs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFournisseurs = fournisseurs.filter(f =>
        f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={14}
                        fill={star <= rating ? '#f59e0b' : 'transparent'}
                        color={star <= rating ? '#f59e0b' : '#64748b'}
                    />
                ))}
                <span style={{ marginLeft: '6px', fontSize: '0.875rem' }}>{rating.toFixed(1)}</span>
            </div>
        );
    };



    const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
    const [catalogPieces, setCatalogPieces] = useState<any[]>([]);
    const [showCatalog, setShowCatalog] = useState(false);

    const handleViewCatalog = async (fournisseur: Fournisseur) => {
        setSelectedFournisseur(fournisseur);
        setLoading(true); // Reuse loading state for modal content or add local loading?
        try {
            // Dynamically import to avoid circular dependency issues if any, or just use the service
            const pieces = await import('../lib/fournisseurs.service').then(m => m.getPiecesByFournisseur(fournisseur.id));
            setCatalogPieces(pieces);
            setShowCatalog(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Catalog Modal */}
            {showCatalog && selectedFournisseur && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowCatalog(false)}>
                    <div className="glass-card" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Catalogue : {selectedFournisseur.nom}</h3>
                                <DarijaHelpBtn messageKey="help_view_catalog" dictionary={DARIJA_DICTIONARY} />
                            </div>
                            <button className="btn btn-secondary" onClick={() => setShowCatalog(false)}>Fermer</button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            {catalogPieces.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Désignation</th>
                                            <th>Stock</th>
                                            <th>Prix Unitaire</th>
                                            <th>Valeur Totale</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {catalogPieces.map(p => (
                                            <tr key={p.id}>
                                                <td><span className="badge badge-info">{p.code}</span></td>
                                                <td>{p.designation}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Package size={14} color="#64748b" />
                                                        {p.stock_actuel} {p.unite}
                                                    </div>
                                                </td>
                                                <td>{p.prix_unitaire} MAD</td>
                                                <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                                                    {(p.stock_actuel * (p.prix_unitaire || 0)).toLocaleString()} MAD
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Aucune pièce associée à ce fournisseur.
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Total Valeur Stock : <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>
                                    {catalogPieces.reduce((acc, p) => acc + (p.stock_actuel * (p.prix_unitaire || 0)), 0).toLocaleString()} MAD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h2 className="page-title">Gestion des Fournisseurs</h2>
                <p className="page-subtitle">Gérez vos fournisseurs de pièces et prestataires de services</p>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Rechercher un fournisseur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={18} />
                        Filtrer
                    </button>
                </div>
                <div className="action-bar-right">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Nouveau fournisseur
                    </button>
                    <DarijaHelpBtn messageKey="help_add_fournisseur" dictionary={DARIJA_DICTIONARY} />
                </div>
            </div>

            <div className="glass-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Nom</th>
                            <th>Type</th>
                            <th>Ville</th>
                            <th>Contact</th>
                            <th>Pièces Fournies</th>
                            <th>Valeur Stock</th>
                            <th>Évaluation</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFournisseurs.map((f) => (
                            <tr key={f.id}>
                                <td><strong>{f.code}</strong></td>
                                <td>{f.nom}</td>
                                <td>
                                    <span className={`badge ${typeLabels[f.type_fournisseur].class}`}>
                                        {typeLabels[f.type_fournisseur].text}
                                    </span>
                                </td>
                                <td>{f.ville}</td>
                                <td>
                                    <div>
                                        <div>{f.contact_principal}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.email}</div>
                                    </div>
                                </td>
                                <td>
                                    {(f as any).pieces_count > 0 ? (
                                        <div className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Package size={12} />
                                            {(f as any).pieces_count} pièces
                                        </div>
                                    ) : '-'}
                                </td>
                                <td>
                                    {(f as any).valeur_stock > 0 ? (
                                        <div style={{ fontWeight: 600, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <TrendingUp size={14} />
                                            {((f as any).valeur_stock).toLocaleString()} MAD
                                        </div>
                                    ) : '-'}
                                </td>
                                <td>{renderStars(f.evaluation || 0)}</td>
                                <td>
                                    <span className={`badge ${f.actif ? 'badge-success' : 'badge-warning'}`}>
                                        {f.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="header-icon-btn"
                                            style={{ width: '32px', height: '32px' }}
                                            onClick={() => handleViewCatalog(f)}
                                            title="Voir le catalogue"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button className="header-icon-btn" style={{ width: '32px', height: '32px' }}>
                                            <Edit size={16} />
                                        </button>
                                        <a href={`mailto:${f.email}`} className="header-icon-btn" style={{ width: '32px', height: '32px' }}>
                                            <Mail size={16} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
