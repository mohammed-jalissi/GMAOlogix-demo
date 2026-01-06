import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Wrench,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Server,
    Zap
} from 'lucide-react';
import { getOTStats, getOrdresTravail, getDemandesStats, getDemandesIntervention } from '../lib/ordres-travail.service';
import { getStockStats } from '../lib/stock.service';
import { getEquipements } from '../lib/equipements.service';

interface DashboardStats {
    otEnCours: number;
    otTermines: number;
    demandesAttente: number;
    equipementsPanne: number;
    dispoMoyenne: string;
    stockCritique: number;
    valeurStock: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [otStats, demandesStats, stockStats, equipements] = await Promise.all([
                    getOTStats(),
                    getDemandesStats(),
                    getStockStats(),
                    getEquipements()
                ]);

                const pannes = equipements.filter(e => e.statut === 'en_panne').length;
                const totalEquipements = equipements.length;
                const dispo = totalEquipements > 0
                    ? ((totalEquipements - pannes) / totalEquipements * 100).toFixed(1) + '%'
                    : '100%';

                setStats({
                    otEnCours: otStats.enCours,
                    otTermines: otStats.terminesMois,
                    demandesAttente: demandesStats.enAttente,
                    equipementsPanne: pannes,
                    dispoMoyenne: dispo,
                    stockCritique: stockStats.critique,
                    valeurStock: stockStats.valeurTotale
                });

                // Simuler une activité récente combinée
                const [ots, demandes] = await Promise.all([
                    getOrdresTravail(),
                    getDemandesIntervention()
                ]);

                const combined = [
                    ...ots.slice(0, 3).map(o => ({ ...o, type_row: 'OT' })),
                    ...demandes.slice(0, 2).map(d => ({ ...d, type_row: 'DI' }))
                ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setRecentActivity(combined);
            } catch (error) {
                console.error('Erreur loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading || !stats) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="premium-stat-icon blue" style={{ margin: '0 auto 16px', animation: 'float 2s ease-in-out infinite' }}>
                        <Activity size={32} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Chargement de l'intelligence opérationnelle...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="premium-stat-icon blue" style={{ width: '40px', height: '40px' }}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <h2 className="page-title">Tableau de bord Premium</h2>
                        <p className="page-subtitle">Intelligence opérationnelle et performance en temps réel</p>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-card premium-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="premium-stat-icon blue"><Wrench size={24} /></div>
                        <div className="trend-badge up"><ArrowUpRight size={14} /> +12%</div>
                    </div>
                    <div>
                        <div className="stat-label-luxe">Ordres de Travail Active</div>
                        <div className="stat-value-luxe">{stats.otEnCours}</div>
                    </div>
                    <div className="luxe-progress-container">
                        <div className="luxe-progress-bar" style={{ width: '65%', background: '#3b82f6' }}></div>
                    </div>
                </div>

                <div className="glass-card premium-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="premium-stat-icon green"><CheckCircle size={24} /></div>
                        <div className="trend-badge up"><ArrowUpRight size={14} /> +5%</div>
                    </div>
                    <div>
                        <div className="stat-label-luxe">Interventions Terminées</div>
                        <div className="stat-value-luxe">{stats.otTermines}</div>
                    </div>
                    <div className="luxe-progress-container">
                        <div className="luxe-progress-bar" style={{ width: '82%', background: '#22c55e' }}></div>
                    </div>
                </div>

                <div className="glass-card premium-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="premium-stat-icon red"><AlertTriangle size={24} /></div>
                        <div className="trend-badge down"><ArrowDownRight size={14} /> Critical</div>
                    </div>
                    <div>
                        <div className="stat-label-luxe">Équipements en Panne</div>
                        <div className="stat-value-luxe">{stats.equipementsPanne}</div>
                    </div>
                    <div className="luxe-progress-container">
                        <div className="luxe-progress-bar" style={{ width: `${(stats.equipementsPanne / 10) * 100}%`, background: '#ef4444' }}></div>
                    </div>
                </div>

                <div className="glass-card premium-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="premium-stat-icon teal"><TrendingUp size={24} /></div>
                        <div className="trend-badge up"><ArrowUpRight size={14} /> Stable</div>
                    </div>
                    <div>
                        <div className="stat-label-luxe">Disponibilité Globale</div>
                        <div className="stat-value-luxe">{stats.dispoMoyenne}</div>
                    </div>
                    <div className="luxe-progress-container">
                        <div className="luxe-progress-bar" style={{ width: stats.dispoMoyenne, background: '#14b8a6' }}></div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
                {/* Visual Analytics Section */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Performance Analytique</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge badge-info">Hebdomadaire</span>
                        </div>
                    </div>

                    {/* Professional Chart Visualization */}
                    <div style={{ height: '260px', width: '100%', position: 'relative', paddingLeft: '40px', paddingBottom: '30px' }}>
                        {/* Grid Lines & Y-Axis */}
                        {[100, 75, 50, 25, 0].map((val, i) => (
                            <div key={i} style={{ position: 'absolute', left: 0, top: `${i * 25}%`, width: '100%', height: '1px', borderTop: val === 0 ? '1px solid #e2e8f0' : '1px dashed #e2e8f080' }}>
                                <span style={{ position: 'absolute', left: '-35px', top: '-8px', fontSize: '0.75rem', color: '#94a3b8' }}>{val}%</span>
                            </div>
                        ))}

                        {/* Bars Container */}
                        <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
                            {[45, 60, 40, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} style={{ width: '8%', height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                                    {/* Bar */}
                                    <div className="bar-animate" style={{
                                        width: '100%',
                                        background: 'linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.3) 100%)',
                                        height: `${h}%`,
                                        borderRadius: '6px 6px 0 0',
                                        position: 'relative',
                                        boxShadow: '0 -4px 12px rgba(59, 130, 246, 0.2)'
                                    }}>
                                        {/* Value Label */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-24px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#1e293b',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            opacity: 0.9
                                        }}>
                                            {h}%
                                        </div>
                                    </div>
                                    {/* X-Axis Label */}
                                    <div style={{ position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>
                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stock & Resources Luxe Card */}
                <div className="glass-card luxe-stock-card" style={{ background: 'var(--accent-luxury)', color: 'white', border: 'none' }}>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div className="premium-stat-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                <Package size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Ressources & Stock</h3>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Valeur Totale Inventaire</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.valeurStock.toLocaleString()} MAD</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Pièces Critiques</span>
                                <span className={`badge ${stats.stockCritique > 0 ? 'badge-danger' : 'badge-success'}`} style={{ color: 'white', background: stats.stockCritique > 0 ? '#ef4444' : '#22c55e' }}>
                                    {stats.stockCritique}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Taux de Rotation</span>
                                <span style={{ fontWeight: '600' }}>14.2%</span>
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '32px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Optimiser le Stock
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Sophistiquée */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Journal d'Exécution Récent</h3>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Voir l'historique complet</button>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Entité</th>
                                <th>Titre / Description</th>
                                <th>Localisation</th>
                                <th>Priorité</th>
                                <th>Statut</th>
                                <th>Temps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((item, idx) => (
                                <tr key={idx} style={{ transition: 'all 0.2s ease' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {item.type_row === 'OT' ? <Server size={14} color="#3b82f6" /> : <Activity size={14} color="#f97316" />}
                                            <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>{item.numero}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                                            {item.titre}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {item.equipement?.nom || item.localisation || 'Atelier Principal'}
                                    </td>
                                    <td>
                                        <span className={`badge ${item.priorite === 'urgente' || item.priorite === 'critique' ? 'badge-danger' :
                                            item.priorite === 'haute' ? 'badge-warning' : 'badge-info'
                                            }`}>
                                            {item.priorite}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${item.statut === 'termine' ? 'badge-success' :
                                            item.statut === 'en_cours' ? 'badge-purple' : 'badge-warning'
                                            }`} style={{ borderRadius: '6px' }}>
                                            {item.statut.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

