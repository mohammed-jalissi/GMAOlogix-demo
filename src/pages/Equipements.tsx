import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getEquipements, createEquipement, getCategoriesEquipement, getSites, generateNextEquipementCode, deleteEquipement, updateEquipement } from '../lib/equipements.service';
import type { Equipement, CategorieEquipement, Site } from '../lib/supabase';
import { useDarijaNotify, DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';

const statutLabels: Record<string, { text: string; class: string }> = {
    'en_service': { text: 'En service', class: 'badge-success' },
    'en_maintenance': { text: 'En maintenance', class: 'badge-warning' },
    'en_panne': { text: 'En panne', class: 'badge-danger' },
    'hors_service': { text: 'Hors service', class: 'badge-purple' },
};

const criticiteLabels: Record<string, { text: string; class: string }> = {
    'faible': { text: 'Faible', class: 'badge-info' },
    'moyenne': { text: 'Moyenne', class: 'badge-warning' },
    'haute': { text: 'Haute', class: 'badge-danger' },
    'critique': { text: 'Critique', class: 'badge-danger' },
};

export default function Equipements() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [equipements, setEquipements] = useState<Equipement[]>([]);
    const [categories, setCategories] = useState<CategorieEquipement[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [loadingCode, setLoadingCode] = useState(false);
    const { notify } = useDarijaNotify();

    // Form state
    const [formData, setFormData] = useState<Partial<Equipement>>({
        code: '',
        nom: '',
        categorie_id: '',
        site_id: '',
        marque: '',
        modele: '',
        numero_serie: '',
        statut: 'en_service',
        criticite: 'moyenne',
        description: '',
        actif: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (showModal) {
            generateCode();
        }
    }, [showModal]);

    async function fetchData() {
        try {
            setLoading(true);
            const [equipData, catData, sitesData] = await Promise.all([
                getEquipements(),
                getCategoriesEquipement(),
                getSites()
            ]);
            setEquipements(equipData);
            setCategories(catData);
            setSites(sitesData);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            setError('Erreur lors du chargement des données');
            notify('error_generic', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function generateCode() {
        try {
            setLoadingCode(true);
            const nextCode = await generateNextEquipementCode();
            setFormData(prev => ({ ...prev, code: nextCode }));
        } catch (error) {
            console.error('Erreur génération code:', error);
        } finally {
            setLoadingCode(false);
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

            // Check if we are updating or creating
            const isEditing = !!formData.id;

            if (isEditing && formData.id) {
                await updateEquipement(formData.id, formData);
                notify('update_success', 'success');
            } else {
                await createEquipement(formData);
                notify('equipement_cree', 'success');
            }

            setSuccessMessage(isEditing ? 'Équipement mis à jour.' : 'L\'équipement a été créé avec succès.');

            setTimeout(() => {
                setSuccessMessage('');
                setShowModal(false);
                resetForm();
                fetchData();
            }, 1000);
        } catch (error: any) {
            console.error('Erreur:', error);
            setError(error.message || 'Une erreur est survenue.');
            notify('error_generic', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            nom: '',
            categorie_id: '',
            site_id: '',
            marque: '',
            modele: '',
            numero_serie: '',
            statut: 'en_service',
            criticite: 'moyenne',
            description: '',
            actif: true
        });
    }

    const handleEdit = (equipement: Equipement) => {
        setFormData({
            ...equipement,
            categorie_id: equipement.categorie_id || '',
            site_id: equipement.site_id || ''
        } as any);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
            try {
                await deleteEquipement(id);
                notify('delete_success', 'success');
                fetchData();
            } catch (error) {
                console.error(error);
                notify('error_generic', 'error');
            }
        }
    };

    const filteredEquipements = equipements.filter(eq =>

        eq.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Gestion des Équipements</h2>
                <p className="page-subtitle">Gérez votre parc d'équipements et leurs informations</p>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Rechercher un équipement..."
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
                        Nouvel équipement
                    </button>
                    <DarijaHelpBtn messageKey="help_add_equipment" dictionary={DARIJA_DICTIONARY} />
                </div>
            </div>

            <div className="glass-card">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Chargement des données...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Site</th>
                                <th>Statut</th>
                                <th>Criticité</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipements.length > 0 ? filteredEquipements.map((eq) => (
                                <tr key={eq.id}>
                                    <td><strong>{eq.code}</strong></td>
                                    <td>{eq.nom}</td>
                                    <td>{eq.categorie?.nom || 'N/A'}</td>
                                    <td>{eq.site?.nom || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${statutLabels[eq.statut]?.class || 'badge-info'}`}>
                                            {statutLabels[eq.statut]?.text || eq.statut}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${criticiteLabels[eq.criticite]?.class || 'badge-info'}`}>
                                            {criticiteLabels[eq.criticite]?.text || eq.criticite}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="header-icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => handleEdit(eq)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="header-icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => handleEdit(eq)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="header-icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => handleDelete(eq.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Aucun équipement trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Nouvel Équipement */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{(formData as any).id ? 'Modifier Équipement' : 'Nouvel Équipement'}</h3>
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
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Code *</label>
                                                <input
                                                    name="code"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder={loadingCode ? "Génération..." : "Ex: EQ-006"}
                                                    required
                                                    value={formData.code}
                                                    onChange={handleInputChange}
                                                    disabled={loadingCode}
                                                />
                                                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                    Code généré automatiquement, modifiable
                                                </small>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Nom *</label>
                                                <input
                                                    name="nom"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Ex: Compresseur..."
                                                    required
                                                    value={formData.nom}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Catégorie</label>
                                                <select
                                                    name="categorie_id"
                                                    className="form-input form-select"
                                                    value={formData.categorie_id}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Sélectionner une catégorie</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Site</label>
                                                <select
                                                    name="site_id"
                                                    className="form-input form-select"
                                                    value={formData.site_id}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Sélectionner un site</option>
                                                    {sites.map(s => (
                                                        <option key={s.id} value={s.id}>{s.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Marque</label>
                                                <input
                                                    name="marque"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Ex: Atlas Copco"
                                                    value={formData.marque}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Modèle</label>
                                                <input
                                                    name="modele"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Ex: GA-55"
                                                    value={formData.modele}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">N° Série</label>
                                                <input
                                                    name="numero_serie"
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Ex: SN12345"
                                                    value={formData.numero_serie}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div className="form-group">
                                                <label className="form-label">Statut</label>
                                                <select
                                                    name="statut"
                                                    className="form-input form-select"
                                                    value={formData.statut}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="en_service">En service</option>
                                                    <option value="en_maintenance">En maintenance</option>
                                                    <option value="en_panne">En panne</option>
                                                    <option value="hors_service">Hors service</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Criticité</label>
                                                <select
                                                    name="criticite"
                                                    className="form-input form-select"
                                                    value={formData.criticite}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="faible">Faible</option>
                                                    <option value="moyenne">Moyenne</option>
                                                    <option value="haute">Haute</option>
                                                    <option value="critique">Critique</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                name="description"
                                                className="form-input form-textarea"
                                                placeholder="Informations complémentaires..."
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
                                        {submitting ? 'Enregistrement...' : ((formData as any).id ? 'Enregistrer modifs' : 'Créer l\'équipement')}
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
