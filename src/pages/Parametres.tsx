import { useState } from 'react';
import {
    User,
    Building,
    Bell,
    Shield,
    Database,
    Palette,
    Save,
    Users,
    MapPin,
    Mail
} from 'lucide-react';

const settingsSections = [
    { id: 'profil', label: 'Mon Profil', icon: User },
    { id: 'entreprise', label: 'Entreprise', icon: Building },
    { id: 'sites', label: 'Sites & Localisations', icon: MapPin },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Shield },
    { id: 'donnees', label: 'Données', icon: Database },
    { id: 'apparence', label: 'Apparence', icon: Palette },
];

export default function Parametres() {
    const [activeSection, setActiveSection] = useState('profil');

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Paramètres</h2>
                <p className="page-subtitle">Configurez votre application GMAO</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
                {/* Settings Menu */}
                <div className="glass-card" style={{ padding: '16px', height: 'fit-content' }}>
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                background: activeSection === section.id ? 'linear-gradient(135deg, #1a8a9e 0%, #10505e 100%)' : 'transparent',
                                color: activeSection === section.id ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                marginBottom: '4px',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (activeSection !== section.id) {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSection !== section.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="glass-card" style={{ padding: '32px' }}>
                    {activeSection === 'profil' && (
                        <>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '600' }}>Mon Profil</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: '600'
                                }}>
                                    AD
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Admin User</h4>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Administrateur</p>
                                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                        Changer la photo
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Prénom</label>
                                    <input type="text" className="form-input" defaultValue="Admin" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nom</label>
                                    <input type="text" className="form-input" defaultValue="User" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" defaultValue="admin@company.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Téléphone</label>
                                    <input type="tel" className="form-input" defaultValue="+33 6 00 00 00 00" />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                                <button className="btn btn-primary">
                                    <Save size={18} />
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </>
                    )}

                    {activeSection === 'entreprise' && (
                        <>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '600' }}>Informations Entreprise</h3>

                            <div className="form-group">
                                <label className="form-label">Nom de l'entreprise</label>
                                <input type="text" className="form-input" defaultValue="Entreprise SARL" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">SIRET</label>
                                    <input type="text" className="form-input" defaultValue="123 456 789 00012" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Secteur d'activité</label>
                                    <select className="form-input form-select">
                                        <option>Industrie manufacturière</option>
                                        <option>Agroalimentaire</option>
                                        <option>Automobile</option>
                                        <option>Énergie</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Adresse</label>
                                <input type="text" className="form-input" defaultValue="123 Rue de l'Industrie" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Code postal</label>
                                    <input type="text" className="form-input" defaultValue="75001" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ville</label>
                                    <input type="text" className="form-input" defaultValue="Paris" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pays</label>
                                    <input type="text" className="form-input" defaultValue="France" />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                                <button className="btn btn-primary">
                                    <Save size={18} />
                                    Enregistrer
                                </button>
                            </div>
                        </>
                    )}

                    {activeSection === 'notifications' && (
                        <>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '600' }}>Préférences de Notifications</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'Nouvel ordre de travail assigné', enabled: true },
                                    { label: 'Demande d\'intervention validée', enabled: true },
                                    { label: 'Alerte stock minimum', enabled: true },
                                    { label: 'Maintenance préventive due', enabled: true },
                                    { label: 'Retard sur OT', enabled: false },
                                    { label: 'Rapport hebdomadaire', enabled: true },
                                ].map((notif, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px'
                                    }}>
                                        <span>{notif.label}</span>
                                        <label style={{
                                            position: 'relative',
                                            width: '48px',
                                            height: '24px',
                                            cursor: 'pointer'
                                        }}>
                                            <input type="checkbox" defaultChecked={notif.enabled} style={{ display: 'none' }} />
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: notif.enabled ? 'var(--primary-500)' : 'rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: notif.enabled ? '26px' : '2px',
                                                    width: '20px',
                                                    height: '20px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.2s ease'
                                                }} />
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '600' }}>Canal de notification</h4>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 16px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid var(--primary-500)',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        <input type="checkbox" defaultChecked />
                                        <Mail size={18} />
                                        Email
                                    </label>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        <input type="checkbox" defaultChecked />
                                        <Bell size={18} />
                                        In-app
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {(activeSection !== 'profil' && activeSection !== 'entreprise' && activeSection !== 'notifications') && (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                {settingsSections.find(s => s.id === activeSection)?.icon &&
                                    (() => {
                                        const Icon = settingsSections.find(s => s.id === activeSection)!.icon;
                                        return <Icon size={32} />;
                                    })()
                                }
                            </div>
                            <h3 className="empty-state-title">
                                {settingsSections.find(s => s.id === activeSection)?.label}
                            </h3>
                            <p className="empty-state-text">
                                Cette section sera bientôt disponible. Vous pourrez configurer vos paramètres ici.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
