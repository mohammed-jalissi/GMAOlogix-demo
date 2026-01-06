import { useState } from 'react';
import { Search, Filter, Calendar, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const historiquePannes = [
    { id: 1, date: '2024-12-28', equipement: 'Pompe hydraulique Bosch', type: 'Fuite', dureeArret: 4.5, cout: 850, impact: 'eleve' },
    { id: 2, date: '2024-12-25', equipement: 'Compresseur Atlas Copco', type: 'Surchauffe', dureeArret: 2.0, cout: 320, impact: 'moyen' },
    { id: 3, date: '2024-12-20', equipement: 'Convoyeur à bande', type: 'Blocage roulement', dureeArret: 3.5, cout: 450, impact: 'eleve' },
    { id: 4, date: '2024-12-15', equipement: 'CNC Mazak', type: 'Erreur servo', dureeArret: 1.5, cout: 280, impact: 'faible' },
    { id: 5, date: '2024-12-10', equipement: 'Transformateur 400kVA', type: 'Court-circuit', dureeArret: 8.0, cout: 2500, impact: 'critique' },
];

const impactLabels: Record<string, { text: string; class: string }> = {
    'faible': { text: 'Faible', class: 'badge-info' },
    'moyen': { text: 'Moyen', class: 'badge-warning' },
    'eleve': { text: 'Élevé', class: 'badge-danger' },
    'critique': { text: 'Critique', class: 'badge-danger' },
};

const statsAnalyse = [
    { label: 'Total pannes (année)', value: 47, change: '-12%', up: true },
    { label: 'Temps arrêt total', value: '186h', change: '-8%', up: true },
    { label: 'Coût total pannes', value: '28 450€', change: '-15%', up: true },
    { label: 'Équipement + défaillant', value: 'Pompe hydraulique', change: '8 pannes', up: false },
];

export default function Analyse() {
    const [periode, setPeriode] = useState('mois');

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Analyse & Historique</h2>
                <p className="page-subtitle">Analysez l'historique des pannes et tendances de maintenance</p>
            </div>

            {/* Period Filter */}
            <div className="tabs" style={{ marginBottom: '24px' }}>
                <button className={`tab ${periode === 'semaine' ? 'active' : ''}`} onClick={() => setPeriode('semaine')}>
                    7 derniers jours
                </button>
                <button className={`tab ${periode === 'mois' ? 'active' : ''}`} onClick={() => setPeriode('mois')}>
                    30 derniers jours
                </button>
                <button className={`tab ${periode === 'trimestre' ? 'active' : ''}`} onClick={() => setPeriode('trimestre')}>
                    Trimestre
                </button>
                <button className={`tab ${periode === 'annee' ? 'active' : ''}`} onClick={() => setPeriode('annee')}>
                    Année
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {statsAnalyse.map((stat, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            color: stat.up ? 'var(--accent-green)' : 'var(--accent-orange)'
                        }}>
                            {stat.up ? <TrendingDown size={14} /> : <AlertTriangle size={14} />}
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            {/* Trends Chart */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Évolution des pannes</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '4px' }}>
                    {[
                        { month: 'Jan', preventive: 12, corrective: 5 },
                        { month: 'Fév', preventive: 15, corrective: 4 },
                        { month: 'Mar', preventive: 18, corrective: 6 },
                        { month: 'Avr', preventive: 14, corrective: 3 },
                        { month: 'Mai', preventive: 20, corrective: 4 },
                        { month: 'Juin', preventive: 22, corrective: 5 },
                        { month: 'Juil', preventive: 19, corrective: 3 },
                        { month: 'Août', preventive: 16, corrective: 2 },
                        { month: 'Sep', preventive: 21, corrective: 4 },
                        { month: 'Oct', preventive: 25, corrective: 3 },
                        { month: 'Nov', preventive: 23, corrective: 4 },
                        { month: 'Déc', preventive: 20, corrective: 3 },
                    ].map((data, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                                <div style={{
                                    height: `${data.corrective * 8}px`,
                                    background: 'linear-gradient(180deg, var(--accent-orange), #c2410c)',
                                    borderRadius: '4px 4px 0 0'
                                }} />
                                <div style={{
                                    height: `${data.preventive * 6}px`,
                                    background: 'linear-gradient(180deg, var(--accent-green), #15803d)',
                                    borderRadius: '4px 4px 0 0'
                                }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>{data.month}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--accent-green)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.875rem' }}>Préventive</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--accent-orange)', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.875rem' }}>Corrective</span>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="glass-card">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Historique des pannes</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Équipement</th>
                            <th>Type de panne</th>
                            <th>Durée arrêt</th>
                            <th>Coût</th>
                            <th>Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historiquePannes.map((panne) => (
                            <tr key={panne.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} color="#64748b" />
                                        {panne.date}
                                    </div>
                                </td>
                                <td><strong>{panne.equipement}</strong></td>
                                <td>{panne.type}</td>
                                <td>{panne.dureeArret}h</td>
                                <td style={{ fontWeight: '600' }}>{panne.cout.toLocaleString()}€</td>
                                <td>
                                    <span className={`badge ${impactLabels[panne.impact].class}`}>
                                        {impactLabels[panne.impact].text}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
