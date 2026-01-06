import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Wrench,
    CalendarCheck,
    CalendarDays,
    Package,
    Users,
    Building2,
    BarChart3,
    Brain,
    TrendingUp,
    Settings2,
    Minus,
    Square,
    X,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/SimpleAuthContext';

const modules = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'dashboard' },
    { path: '/equipements', icon: Settings, label: 'Équipements', color: 'equipements' },
    { path: '/ordres-travail', icon: Wrench, label: 'Ordres de travail', color: 'ordres' },
    { path: '/maintenance-preventive', icon: CalendarCheck, label: 'Maintenance\npréventive', color: 'maintenance' },
    { path: '/planning', icon: CalendarDays, label: 'Planning', color: 'planning' },
    { path: '/stock', icon: Package, label: 'Stock & Pièces', color: 'stock' },
    { path: '/techniciens', icon: Users, label: 'Techniciens', color: 'techniciens' },
    { path: '/fournisseurs', icon: Building2, label: 'Fournisseurs', color: 'fournisseurs' },
    { path: '/rapports', icon: BarChart3, label: 'Rapports & KPI', color: 'rapports' },
    { path: '/previsions', icon: Brain, label: 'Prévisions IA', color: 'previsions' },
    { path: '/analyse', icon: TrendingUp, label: 'Analyse &\nHistorique', color: 'analyse' },
    { path: '/parametres', icon: Settings2, label: 'Paramètres', color: 'parametres' },
];

export default function Home() {
    const { logout } = useAuth();
    return (
        <div className="app-container">
            {/* Header Bar */}
            <header className="app-header">
                <div className="app-header-title">
                    <Settings size={20} />
                    GMAOlogix - Gestion de Maintenance Assistée par Ordinateur
                </div>
                <div className="app-header-controls">
                    <button className="app-header-btn"><Minus size={14} /></button>
                    <button className="app-header-btn"><Square size={12} /></button>
                    <button className="app-header-btn" onClick={logout} title="Déconnexion" style={{ color: '#ef4444' }}>
                        <LogOut size={14} />
                    </button>
                    <button className="app-header-btn"><X size={14} /></button>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <h1 className="page-main-title">Modules GMAO</h1>

                <div className="modules-grid">
                    {modules.map((module, idx) => (
                        <Link key={idx} to={module.path} className="module-card">
                            <div className={`module-icon ${module.color}`}>
                                <module.icon />
                            </div>
                            <span className="module-name" style={{ whiteSpace: 'pre-line' }}>
                                {module.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <div className="app-footer-left">
                    GMAOlogix v2.0.0 | Maintenance 4.0
                </div>
                <div className="app-footer-right">
                    © 2025 Industrial Solutions
                </div>
            </footer>
        </div>
    );
}
