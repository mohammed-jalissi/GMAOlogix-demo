import { useState, useEffect } from 'react';
import { Plus, Search, Eye, CheckCircle, XCircle, ArrowRight, X, AlertCircle, Printer } from 'lucide-react';
import { generateDemandePDF } from '../lib/pdf-generator';
import { getEquipements } from '../lib/equipements.service';
import { createDemandeIntervention, getDemandesIntervention, approuverDemande, rejeterDemande, convertirDemandeEnOT } from '../lib/ordres-travail.service';
import { getTechniciens } from '../lib/maintenance.service';
import type { Equipement, DemandeIntervention as DemandeType, Technicien } from '../lib/supabase';
import { useDarijaNotify } from '../hooks/useDarijaNotify';

const statutLabels: Record<string, { text: string; class: string }> = {
    'nouvelle': { text: 'Nouvelle', class: 'badge-info' },
    'en_evaluation': { text: 'En évaluation', class: 'badge-warning' },
    'approuvee': { text: 'Approuvée', class: 'badge-success' },
    'rejetee': { text: 'Rejetée', class: 'badge-danger' },
    'convertie_ot': { text: 'Convertie en OT', class: 'badge-purple' },
    'annulee': { text: 'Annulée', class: 'badge-danger' },
};

const prioriteLabels: Record<string, { text: string; class: string }> = {
    'basse': { text: 'Basse', class: 'badge-info' },
    'normale': { text: 'Normale', class: 'badge-success' },
    'haute': { text: 'Haute', class: 'badge-warning' },
    'urgente': { text: 'Urgente', class: 'badge-danger' },
};

const typeLabels: Record<string, string> = {
    'panne': 'Panne',
    'anomalie': 'Anomalie',
    'amelioration': 'Amélioration',
    'installation': 'Installation',
    'autre': 'Autre',
};

export default function DemandesIntervention() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [equipements, setEquipements] = useState<Equipement[]>([]);
    const [demandesData, setDemandesData] = useState<DemandeType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDemandes, setLoadingDemandes] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const { notify } = useDarijaNotify();

    // Logic State
    const [selectedDemande, setSelectedDemande] = useState<DemandeType | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Convert Modal State
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [techniciens, setTechniciens] = useState<Technicien[]>([]);
    const [convertData, setConvertData] = useState({
        technicien_id: '',
        priorite: 'normale',
        type_maintenance: 'corrective',
        date_prevue_debut: '',
        date_prevue_fin: ''
    });

    // Form state with default date
    const [formData, setFormData] = useState({
        equipement_id: '',
        type_demande: 'panne',
        priorite: 'normale',
        date_souhaitee: new Date().toISOString().split('T')[0], // Today's date
        titre: '',
        description: '',
        localisation: ''
    });

    // Load demandes on component mount
    useEffect(() => {
        fetchDemandes();
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchEquipements();
            // Reset date to today when opening modal
            setFormData(prev => ({
                ...prev,
                date_souhaitee: new Date().toISOString().split('T')[0]
            }));
        }
    }, [showModal]);

    async function fetchDemandes() {
        try {
            setLoadingDemandes(true);
            const data = await getDemandesIntervention();
            setDemandesData(data);
        } catch (error) {
            console.error('Erreur lors du chargement des demandes:', error);
            notify('error_generic', 'error');
        } finally {
            setLoadingDemandes(false);
        }
    }

    async function fetchEquipements() {
        try {
            setLoading(true);
            const equipData = await getEquipements();
            setEquipements(equipData);
        } catch (error) {
            console.error('Erreur lors du chargement des équipements:', error);
            setError('Erreur lors du chargement des équipements');
            notify('error_generic', 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(''); // Clear error on input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            setSubmitting(true);
            const demandeurId = '00000000-0000-0000-0000-000000000000';

            await createDemandeIntervention({
                ...formData,
                demandeur_id: demandeurId,
                statut: 'nouvelle'
            } as any);

            setSuccessMessage('Votre demande d\'intervention a été soumise avec succès.');
            notify('demande_envoyee', 'success');

            // Reload demandes list
            fetchDemandes();

            setTimeout(() => {
                setSuccessMessage('');
                setShowModal(false);
                setFormData({
                    equipement_id: '',
                    type_demande: 'panne',
                    priorite: 'normale',
                    date_souhaitee: new Date().toISOString().split('T')[0],
                    titre: '',
                    description: '',
                    localisation: ''
                });
            }, 2000);
        } catch (error: any) {
            console.error('Erreur lors de la soumission:', error);
            setError(error.message || 'Une erreur est survenue lors de la soumission de la demande.');
            notify('error_generic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // ACTIONS HANDLERS
    // ==========================================

    const handleApprove = async (demande: DemandeType) => {
        if (!window.confirm("Voulez-vous approuver cette demande ?")) return;
        try {
            await approuverDemande(demande.id, 'CURRENT_USER_ID');
            notify('demande_approuvee', 'success');
            fetchDemandes();
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        }
    };

    const handleRejectClick = (demande: DemandeType) => {
        setSelectedDemande(demande);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (!selectedDemande || !rejectReason.trim()) return;
        try {
            await rejeterDemande(selectedDemande.id, 'CURRENT_USER_ID', rejectReason);
            notify('demande_rejetee', 'warning');
            setShowRejectModal(false);
            fetchDemandes();
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        }
    };

    const handleConvertClick = async (demande: DemandeType) => {
        setSelectedDemande(demande);
        try {
            // Pre-fill data
            setConvertData({
                technicien_id: '',
                priorite: demande.priorite as any,
                type_maintenance: 'corrective', // default
                date_prevue_debut: new Date().toISOString().split('T')[0],
                date_prevue_fin: ''
            });

            // Load technicians if not loaded
            if (techniciens.length === 0) {
                const techs = await getTechniciens();
                setTechniciens(techs);
            }
            setShowConvertModal(true);
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        }
    };

    const confirmConvert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDemande) return;
        try {
            setSubmitting(true);
            await convertirDemandeEnOT(selectedDemande.id, {
                titre: selectedDemande.titre,
                description: selectedDemande.description,
                equipement_id: selectedDemande.equipement_id,
                technicien_id: convertData.technicien_id,
                priorite: convertData.priorite as any,
                type_maintenance: convertData.type_maintenance as any,
                date_prevue_debut: convertData.date_prevue_debut,
                // statut 'planifie' par defaut
            });

            notify('success_generic', 'success'); // "OT Créé"
            setShowConvertModal(false);
            fetchDemandes();
        } catch (error) {
            console.error(error);
            notify('error_generic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredDemandes = demandesData.filter((d: DemandeType) => {
        const matchSearch = d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.numero.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterStatut === 'all' || d.statut === filterStatut;
        return matchSearch && matchFilter;
    });

    const statsData = [
        { label: 'Nouvelles', count: demandesData.filter((d: DemandeType) => d.statut === 'nouvelle').length, color: '#3b82f6' },
        { label: 'En évaluation', count: demandesData.filter((d: DemandeType) => d.statut === 'en_evaluation').length, color: '#f59e0b' },
        { label: 'Approuvées', count: demandesData.filter((d: DemandeType) => d.statut === 'approuvee').length, color: '#22c55e' },
        { label: 'Converties', count: demandesData.filter((d: DemandeType) => d.statut === 'convertie_ot').length, color: '#8b5cf6' },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Demandes d'Intervention</h2>
                <p className="page-subtitle">Gérez les demandes d'intervention et leur traitement</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {statsData.map((stat, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.count}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Rechercher une demande..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-input form-select"
                        style={{ width: '180px' }}
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="nouvelle">Nouvelles</option>
                        <option value="en_evaluation">En évaluation</option>
                        <option value="approuvee">Approuvées</option>
                        <option value="rejetee">Rejetées</option>
                        <option value="convertie_ot">Converties en OT</option>
                    </select>
                </div>
                <div className="action-bar-right">
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Nouvelle demande
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>N° Demande</th>
                            <th>Titre</th>
                            <th>Équipement</th>
                            <th>Demandeur</th>
                            <th>Type</th>
                            <th>Priorité</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingDemandes ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTopColor: '#8b5cf6', borderRadius: '50%' }}></div>
                                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Chargement...</p>
                                </td>
                            </tr>
                        ) : filteredDemandes.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    Aucune demande trouvée
                                </td>
                            </tr>
                        ) : filteredDemandes.map((d: DemandeType) => (
                            <tr key={d.id}>
                                <td><strong>{d.numero}</strong></td>
                                <td>{d.titre}</td>
                                <td>{d.equipement?.nom || 'N/A'}</td>
                                <td>
                                    <div>
                                        <div>{d.demandeur ? `${d.demandeur.prenom} ${d.demandeur.nom}` : 'N/A'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.service_demandeur || '-'}</div>
                                    </div>
                                </td>
                                <td>{typeLabels[d.type_demande]}</td>
                                <td>
                                    <span className={`badge ${prioriteLabels[d.priorite].class}`}>
                                        {prioriteLabels[d.priorite].text}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${statutLabels[d.statut].class}`}>
                                        {statutLabels[d.statut].text}
                                    </span>
                                    {d.ordre_travail_id && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', marginTop: '4px' }}>
                                            → OT créé
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontSize: '0.875rem' }}>
                                    {new Date(d.created_at).toLocaleString('fr-FR', {
                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="header-icon-btn" style={{ width: '30px', height: '30px' }} title="Voir détails">
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            className="header-icon-btn"
                                            style={{ width: '30px', height: '30px', background: 'rgba(59, 130, 246, 0.1)' }}
                                            title="Imprimer PDF"
                                            onClick={() => generateDemandePDF(d)}
                                        >
                                            <Printer size={14} color="#3b82f6" />
                                        </button>
                                        {d.statut === 'nouvelle' && (
                                            <>
                                                <button
                                                    className="header-icon-btn"
                                                    style={{ width: '30px', height: '30px', background: 'rgba(34, 197, 94, 0.1)' }}
                                                    title="Approuver"
                                                    onClick={() => handleApprove(d)}
                                                >
                                                    <CheckCircle size={14} color="#22c55e" />
                                                </button>
                                                <button
                                                    className="header-icon-btn"
                                                    style={{ width: '30px', height: '30px', background: 'rgba(239, 68, 68, 0.1)' }}
                                                    title="Rejeter"
                                                    onClick={() => handleRejectClick(d)}
                                                >
                                                    <XCircle size={14} color="#ef4444" />
                                                </button>
                                            </>
                                        )}
                                        {d.statut === 'approuvee' && (
                                            <button
                                                className="header-icon-btn"
                                                style={{ width: '30px', height: '30px', background: 'rgba(139, 92, 246, 0.1)' }}
                                                title="Convertir en OT"
                                                onClick={() => handleConvertClick(d)}
                                            >
                                                <ArrowRight size={14} color="#8b5cf6" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Nouvelle Demande */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Nouvelle Demande d'Intervention</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && (
                                    <div style={{
                                        padding: '12px',
                                        marginBottom: '16px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <AlertCircle size={20} color="#ef4444" />
                                        <span style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</span>
                                    </div>
                                )}
                                {successMessage ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                                        <p>{successMessage}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Équipement concerné *</label>
                                            <select
                                                name="equipement_id"
                                                className="form-input form-select"
                                                required
                                                value={formData.equipement_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Sélectionner un équipement</option>
                                                {equipements.map(e => (
                                                    <option key={e.id} value={e.id}>{e.nom} ({e.code})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Type de demande *</label>
                                                <select
                                                    name="type_demande"
                                                    className="form-input form-select"
                                                    required
                                                    value={formData.type_demande}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="panne">Panne</option>
                                                    <option value="anomalie">Anomalie</option>
                                                    <option value="amelioration">Amélioration</option>
                                                    <option value="installation">Installation</option>
                                                    <option value="autre">Autre</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Priorité *</label>
                                                <select
                                                    name="priorite"
                                                    className="form-input form-select"
                                                    required
                                                    value={formData.priorite}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="basse">Basse</option>
                                                    <option value="normale">Normale</option>
                                                    <option value="haute">Haute</option>
                                                    <option value="urgente">Urgente</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Date souhaitée</label>
                                            <input
                                                name="date_souhaitee"
                                                type="date"
                                                className="form-input"
                                                value={formData.date_souhaitee}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Titre de la demande *</label>
                                            <input
                                                name="titre"
                                                type="text"
                                                className="form-input"
                                                placeholder="Ex: Vibration anormale sur le compresseur"
                                                required
                                                value={formData.titre}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description détaillée *</label>
                                            <textarea
                                                name="description"
                                                className="form-input form-textarea"
                                                placeholder="Décrivez le problème ou la demande en détail..."
                                                required
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Localisation</label>
                                            <input
                                                name="localisation"
                                                type="text"
                                                className="form-input"
                                                placeholder="Ex: Bâtiment A, Zone de production"
                                                value={formData.localisation}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                                    Annuler
                                </button>
                                {!successMessage && (
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Envoi...' : 'Soumettre la demande'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Rejeter */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Rejeter la demande</h3>
                            <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                                Veuillez indiquer la raison du rejet pour la demande <strong>{selectedDemande?.numero}</strong>.
                            </p>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Raison du rejet..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{ minHeight: '100px' }}
                            ></textarea>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Annuler</button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmReject}
                                disabled={!rejectReason.trim()}
                            >
                                Confirmer le rejet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Convertir en OT */}
            {showConvertModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowConvertModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Convertir en Ordre de Travail</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowConvertModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={confirmConvert}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Technicien assigné *</label>
                                    <select
                                        className="form-input form-select"
                                        required
                                        value={convertData.technicien_id}
                                        onChange={(e) => setConvertData({ ...convertData, technicien_id: e.target.value })}
                                    >
                                        <option value="">Choisir un technicien</option>
                                        {techniciens.map(t => (
                                            <option key={t.id} value={t.id}>{t.prenom} {t.nom} ({t.specialite})</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Priorité *</label>
                                        <select
                                            className="form-input form-select"
                                            value={convertData.priorite}
                                            onChange={(e) => setConvertData({ ...convertData, priorite: e.target.value })}
                                        >
                                            <option value="basse">Basse</option>
                                            <option value="normale">Normale</option>
                                            <option value="haute">Haute</option>
                                            <option value="urgente">Urgente</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type de maintenance *</label>
                                        <select
                                            className="form-input form-select"
                                            value={convertData.type_maintenance}
                                            onChange={(e) => setConvertData({ ...convertData, type_maintenance: e.target.value })}
                                        >
                                            <option value="corrective">Corrective</option>
                                            <option value="preventive">Préventive</option>
                                            <option value="amelioration">Amélioration</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Date prévue début *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        required
                                        value={convertData.date_prevue_debut}
                                        onChange={(e) => setConvertData({ ...convertData, date_prevue_debut: e.target.value })}
                                    />
                                </div>

                                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>Détails de la demande originale :</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedDemande?.titre}</div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal(false)} disabled={submitting}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Création...' : 'Créer l\'Ordre de Travail'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
