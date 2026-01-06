import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, X, FileText, CheckCircle } from 'lucide-react';
import { getEquipements } from '../lib/equipements.service';
import { createDemandeIntervention, getOrdresTravail } from '../lib/ordres-travail.service';
import type { Equipement, OrdreTravail } from '../lib/supabase';
import { useDarijaNotify, DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';

const statutLabels: Record<string, { text: string; class: string }> = {
    'planifie': { text: 'Planifié', class: 'badge-info' },
    'en_attente': { text: 'En attente', class: 'badge-warning' },
    'en_cours': { text: 'En cours', class: 'badge-purple' },
    'termine': { text: 'Terminé', class: 'badge-success' },
    'annule': { text: 'Annulé', class: 'badge-danger' },
};

const prioriteLabels: Record<string, { text: string; class: string }> = {
    'basse': { text: 'Basse', class: 'badge-info' },
    'normale': { text: 'Normale', class: 'badge-success' },
    'haute': { text: 'Haute', class: 'badge-warning' },
    'urgente': { text: 'Urgente', class: 'badge-danger' },
};

const typeLabels: Record<string, string> = {
    'corrective': 'Corrective',
    'preventive': 'Préventive',
    'predictive': 'Prédictive',
    'ameliorative': 'Améliorative',
};

export default function OrdresTravail() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ordres');
    const [showModal, setShowModal] = useState(false);
    const [equipements, setEquipements] = useState<Equipement[]>([]);
    const [ots, setOts] = useState<OrdreTravail[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { notify } = useDarijaNotify();

    // Form state for new intervention request
    const [formData, setFormData] = useState({
        equipement_id: '',
        type_demande: 'panne',
        priorite: 'normale',
        date_souhaitee: '',
        titre: '',
        description: '',
        localisation: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const [equipData, otData] = await Promise.all([
                getEquipements(),
                getOrdresTravail()
            ]);
            setEquipements(equipData);
            setOts(otData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSubmitDemande = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            // Pour l'instant on utilise un ID de demandeur fictif si non authentifié
            // Dans une vraie app, on récupèrerait l'ID de l'utilisateur connecté
            const demandeurId = '00000000-0000-0000-0000-000000000000';

            await createDemandeIntervention({
                ...formData,
                demandeur_id: demandeurId,
                statut: 'nouvelle'
            } as any);

            setSuccessMessage('Votre demande d\'intervention a été soumise avec succès.');
            notify('demande_envoyee', 'success');
            setFormData({
                equipement_id: '',
                type_demande: 'panne',
                priorite: 'normale',
                date_souhaitee: '',
                titre: '',
                description: '',
                localisation: ''
            });

            setTimeout(() => {
                setSuccessMessage('');
                setActiveTab('ordres');
                fetchData();
            }, 3000);
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            notify('error_generic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredOT = ots.filter(ot =>
        ot.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ot.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ot.equipement?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Ordres de Travail</h2>
                <p className="page-subtitle">Gérez vos ordres de travail et créez des demandes d'intervention</p>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'ordres' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ordres')}
                >
                    Ordres de travail
                </button>
                <button
                    className={`tab ${activeTab === 'nouvelle-demande' ? 'active' : ''}`}
                    onClick={() => setActiveTab('nouvelle-demande')}
                >
                    <FileText size={16} style={{ marginRight: '8px' }} />
                    Nouvelle demande d'intervention
                </button>
            </div>

            {activeTab === 'ordres' && (
                <>
                    <div className="action-bar">
                        <div className="action-bar-left">
                            <div className="search-box">
                                <Search size={18} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un OT..."
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
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} />
                                Nouvel OT
                            </button>
                            <DarijaHelpBtn messageKey="help_create_ot" dictionary={DARIJA_DICTIONARY} />
                        </div>
                    </div>

                    <div className="glass-card">
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>Chargement des données...</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>N° OT</th>
                                        <th>Titre</th>
                                        <th>Équipement</th>
                                        <th>Type</th>
                                        <th>Priorité</th>
                                        <th>Statut</th>
                                        <th>Technicien</th>
                                        <th>Date prévue</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOT.length > 0 ? filteredOT.map((ot) => (
                                        <tr key={ot.id}>
                                            <td><strong>{ot.numero}</strong></td>
                                            <td>{ot.titre}</td>
                                            <td>{ot.equipement?.nom || 'N/A'}</td>
                                            <td>{typeLabels[ot.type_maintenance] || ot.type_maintenance}</td>
                                            <td>
                                                <span className={`badge ${prioriteLabels[ot.priorite]?.class || 'badge-info'}`}>
                                                    {prioriteLabels[ot.priorite]?.text || ot.priorite}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${statutLabels[ot.statut]?.class || 'badge-info'}`}>
                                                    {statutLabels[ot.statut]?.text || ot.statut}
                                                </span>
                                            </td>
                                            <td>{ot.technicien?.profil ? `${ot.technicien.profil.nom} ${ot.technicien.profil.prenom}` : 'Non assigné'}</td>
                                            <td>{ot.date_prevue_debut ? new Date(ot.date_prevue_debut).toLocaleDateString() : 'N/A'}</td>
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
                                    )) : (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Aucun ordre de travail trouvé</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'nouvelle-demande' && (
                <div className="glass-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                    {successMessage ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Merci !</h3>
                            <p>{successMessage}</p>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '600' }}>
                                Créer une nouvelle demande d'intervention
                            </h3>

                            <form onSubmit={handleSubmitDemande}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Envoi...' : <><Plus size={18} /> Soumettre la demande</>}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('ordres')} disabled={submitting}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* Modal pour nouvel OT */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Nouvel Ordre de Travail</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Titre *</label>
                                <input type="text" className="form-input" placeholder="Titre de l'OT" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Équipement *</label>
                                    <select className="form-input form-select">
                                        <option value="">Sélectionner</option>
                                        <option value="1">Compresseur Atlas Copco</option>
                                        <option value="2">Pompe hydraulique Bosch</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type de maintenance *</label>
                                    <select className="form-input form-select">
                                        <option value="corrective">Corrective</option>
                                        <option value="preventive">Préventive</option>
                                        <option value="predictive">Prédictive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input form-textarea" placeholder="Description..."></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                            <button className="btn btn-primary">Créer l'OT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
