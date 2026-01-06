import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Play, Pause, Calendar, X, CheckCircle } from 'lucide-react';
import { getEquipements } from '../lib/equipements.service';
import { getTechniciens, getPlansMaintenance, createPlanMaintenance } from '../lib/maintenance.service';
import type { Equipement, Technicien, PlanMaintenance } from '../lib/supabase';
import { useDarijaNotify, DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';

export default function MaintenancePreventive() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [equipements, setEquipements] = useState<Equipement[]>([]);
    const [techniciens, setTechniciens] = useState<Technicien[]>([]);
    const [plans, setPlans] = useState<PlanMaintenance[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { notify } = useDarijaNotify();

    // Form state for new plan
    const [formData, setFormData] = useState({
        equipement_id: '',
        nom: '',
        description: '',
        type_declenchement: 'calendrier',
        frequence_jours: 30,
        technicien_id: '',
        actif: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            const [equipData, techData, plansData] = await Promise.all([
                getEquipements(),
                getTechniciens(),
                getPlansMaintenance()
            ]);
            setEquipements(equipData);
            setTechniciens(techData);
            setPlans(plansData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const handleSubmitPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await createPlanMaintenance(formData as any);
            setSuccessMessage('Le plan de maintenance a été créé avec succès.');
            notify('plan_maintenance_cree', 'success');

            setTimeout(() => {
                setSuccessMessage('');
                setShowModal(false);
                setFormData({
                    equipement_id: '',
                    nom: '',
                    description: '',
                    type_declenchement: 'calendrier',
                    frequence_jours: 30,
                    technicien_id: '',
                    actif: true
                });
                fetchData();
            }, 2000);
        } catch (error) {
            console.error('Erreur lors de la création du plan:', error);
            notify('error_generic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPlans = plans.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.equipement?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Maintenance Préventive</h2>
                <p className="page-subtitle">Planifiez et gérez vos plans de maintenance préventive</p>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Rechercher un plan..."
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
                        Nouveau plan
                    </button>
                    <DarijaHelpBtn messageKey="help_create_pmp" dictionary={DARIJA_DICTIONARY} />
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Chargement des données...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nom du plan</th>
                                <th>Équipement</th>
                                <th>Type</th>
                                <th>Fréquence</th>
                                <th>Prochaine échéance</th>
                                <th>Technicien</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlans.length > 0 ? filteredPlans.map((plan) => (
                                <tr key={plan.id}>
                                    <td><strong>{plan.nom}</strong></td>
                                    <td>{plan.equipement?.nom || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${plan.type_declenchement === 'calendrier' ? 'badge-info' : 'badge-purple'}`}>
                                            {plan.type_declenchement === 'calendrier' ? 'Calendrier' : 'Compteur'}
                                        </span>
                                    </td>
                                    <td>{plan.frequence_jours ? `${plan.frequence_jours} jours` : 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} color="#64748b" />
                                            {plan.prochaine_date ? new Date(plan.prochaine_date).toLocaleDateString() : 'Non définie'}
                                        </div>
                                    </td>
                                    <td>{plan.technicien?.profil ? `${plan.technicien.profil.nom} ${plan.technicien.profil.prenom}` : 'Non assigné'}</td>
                                    <td>
                                        <span className={`badge ${plan.actif ? 'badge-success' : 'badge-warning'}`}>
                                            {plan.actif ? 'Actif' : 'Suspendu'}
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
                                            <button className="header-icon-btn" style={{ width: '32px', height: '32px' }}>
                                                {plan.actif ? <Pause size={16} /> : <Play size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Aucun plan de maintenance trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Nouveau Plan */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Nouveau Plan de Maintenance</h3>
                            <button className="modal-close" onClick={() => !submitting && setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitPlan}>
                            <div className="modal-body">
                                {successMessage ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                                        <p>{successMessage}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Nom du plan *</label>
                                            <input
                                                name="nom"
                                                type="text"
                                                className="form-input"
                                                placeholder="Ex: Maintenance mensuelle compresseur"
                                                required
                                                value={formData.nom}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Équipement *</label>
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
                                                <label className="form-label">Type de déclenchement</label>
                                                <select
                                                    name="type_declenchement"
                                                    className="form-input form-select"
                                                    value={formData.type_declenchement}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="calendrier">Calendrier</option>
                                                    <option value="compteur">Compteur</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Fréquence (jours)</label>
                                                <input
                                                    name="frequence_jours"
                                                    type="number"
                                                    className="form-input"
                                                    value={formData.frequence_jours}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Technicien responsable</label>
                                            <select
                                                name="technicien_id"
                                                className="form-input form-select"
                                                value={formData.technicien_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Sélectionner un technicien</option>
                                                {techniciens.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.profil?.nom} {t.profil?.prenom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                name="description"
                                                className="form-input form-textarea"
                                                placeholder="Instructions de maintenance..."
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
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
                                        {submitting ? 'Création...' : 'Créer le plan'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
