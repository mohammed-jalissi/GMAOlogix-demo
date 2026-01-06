import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/equipements': 'Équipements',
    '/ordres-travail': 'Ordres de Travail',
    '/demandes-intervention': 'Demandes d\'Intervention',
    '/maintenance-preventive': 'Maintenance Préventive',
    '/planning': 'Planning',
    '/stock': 'Stock & Pièces',
    '/techniciens': 'Techniciens',
    '/fournisseurs': 'Fournisseurs',
    '/rapports': 'Rapports & KPI',
    '/analyse': 'Analyse & Historique',
    '/parametres': 'Paramètres',
};

export default function MainLayout() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'GMAO Pro';

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Header title={title} />
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
