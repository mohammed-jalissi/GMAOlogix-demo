import {
    BarChart3,
    TrendingUp,
    Clock,
    Wrench,
    AlertTriangle,
    CheckCircle,
    Download,
    Calendar
} from 'lucide-react';
import DarijaHelpBtn from '../components/Common/DarijaHelpBtn';
import { DARIJA_DICTIONARY } from '../hooks/useDarijaNotify';

const kpiData = [
    { label: 'MTBF', value: '245h', description: 'Mean Time Between Failures', trend: '+12%', icon: Clock, color: 'blue' },
    { label: 'MTTR', value: '2.4h', description: 'Mean Time To Repair', trend: '-8%', icon: Wrench, color: 'green' },
    { label: 'Disponibilité', value: '94.2%', description: 'Taux de disponibilité équipements', trend: '+1.5%', icon: TrendingUp, color: 'teal' },
    { label: 'OT terminés', value: '156', description: 'Ce mois', trend: '+22%', icon: CheckCircle, color: 'purple' },
    { label: 'Coût moyen OT', value: '385€', description: 'Main d\'œuvre + pièces', trend: '-5%', icon: BarChart3, color: 'orange' },
    { label: 'Pannes critiques', value: '3', description: 'Ce mois', trend: '-40%', icon: AlertTriangle, color: 'red' },
];

const recentReports = [
    { id: 1, nom: 'Rapport mensuel maintenance', type: 'Mensuel', date: '2024-12-01', statut: 'Généré' },
    { id: 2, nom: 'Analyse pannes Q4', type: 'Trimestriel', date: '2024-12-15', statut: 'Généré' },
    { id: 3, nom: 'Coûts maintenance par équipement', type: 'Personnalisé', date: '2024-12-20', statut: 'Généré' },
    { id: 4, nom: 'Performance techniciens', type: 'Mensuel', date: '2024-12-28', statut: 'En cours' },
];

export default function Rapports() {
    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Rapports & KPI</h2>
                <p className="page-subtitle">Indicateurs de performance et rapports de maintenance</p>
            </div>

            {/* KPI Grid */}
            <div className="dashboard-grid">
                {kpiData.map((kpi, idx) => (
                    <div key={idx} className="glass-card stat-card">
                        <div className={`stat-icon ${kpi.color}`}>
                            <kpi.icon size={28} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">{kpi.label}</div>
                            <div className="stat-value">{kpi.value}</div>
                            <div className={`stat-trend ${kpi.trend.startsWith('+') || kpi.trend.startsWith('-') && kpi.label !== 'Pannes critiques' ? 'up' : kpi.label === 'Pannes critiques' && kpi.trend.startsWith('-') ? 'up' : 'down'}`}>
                                {kpi.trend} {kpi.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>Évolution OT par mois</h3>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        gap: '8px',
                        paddingTop: '20px'
                    }}>
                        {[65, 45, 78, 52, 85, 72, 95, 68, 88, 75, 92, 85].map((value, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    width: '100%',
                                    height: `${value * 1.8}px`,
                                    background: idx === 11 ? 'linear-gradient(180deg, var(--primary-400), var(--primary-600))' : 'rgba(59, 130, 246, 0.3)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'all 0.3s ease'
                                }} />
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>Répartition par type</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <div style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            background: `conic-gradient(
                var(--accent-green) 0deg 180deg,
                var(--accent-orange) 180deg 270deg,
                var(--accent-purple) 270deg 324deg,
                var(--primary-500) 324deg 360deg
              )`,
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)'
                            }} />
                        </div>
                        <div style={{ marginLeft: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--accent-green)', borderRadius: '2px' }} />
                                <span style={{ fontSize: '0.875rem' }}>Préventive (50%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--accent-orange)', borderRadius: '2px' }} />
                                <span style={{ fontSize: '0.875rem' }}>Corrective (25%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--accent-purple)', borderRadius: '2px' }} />
                                <span style={{ fontSize: '0.875rem' }}>Prédictive (15%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', background: 'var(--primary-500)', borderRadius: '2px' }} />
                                <span style={{ fontSize: '0.875rem' }}>Améliorative (10%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reports */}
            <div className="glass-card" style={{ marginTop: '32px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Rapports récents</h3>
                    <button className="btn btn-primary">
                        <Calendar size={18} />
                        Générer un rapport
                    </button>
                    <DarijaHelpBtn messageKey="help_export_pdf" dictionary={DARIJA_DICTIONARY} />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nom du rapport</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentReports.map((report) => (
                            <tr key={report.id}>
                                <td><strong>{report.nom}</strong></td>
                                <td>{report.type}</td>
                                <td>{report.date}</td>
                                <td>
                                    <span className={`badge ${report.statut === 'Généré' ? 'badge-success' : 'badge-warning'}`}>
                                        {report.statut}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                                        <Download size={16} />
                                        Télécharger
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
