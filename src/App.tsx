import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SimpleAuthProvider, useAuth } from './contexts/SimpleAuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import SubpageLayout from './components/Layout/SubpageLayout';
import Dashboard from './pages/Dashboard';
import Equipements from './pages/Equipements';
import OrdresTravail from './pages/OrdresTravail';
import DemandesIntervention from './pages/DemandesIntervention';
import MaintenancePreventive from './pages/MaintenancePreventive';
import Planning from './pages/Planning';
import Stock from './pages/Stock';
import Techniciens from './pages/Techniciens';
import Fournisseurs from './pages/Fournisseurs';
import Rapports from './pages/Rapports';
import Analyse from './pages/Analyse';
import Parametres from './pages/Parametres';
import PrevisionsIA from './pages/PrevisionsIA';
import './index.css';
import { Toaster } from 'sonner';

function PrivateRoute() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
    return (
        <SimpleAuthProvider>
            <Toaster position="top-right" richColors closeButton />
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<PrivateRoute />}>
                    {/* Home page with module grid */}
                    <Route path="/" element={<Home />} />

                    {/* Subpages with sidebar layout */}
                    <Route element={<SubpageLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/equipements" element={<Equipements />} />
                        <Route path="/ordres-travail" element={<OrdresTravail />} />
                        <Route path="/demandes-intervention" element={<DemandesIntervention />} />
                        <Route path="/maintenance-preventive" element={<MaintenancePreventive />} />
                        <Route path="/planning" element={<Planning />} />
                        <Route path="/stock" element={<Stock />} />
                        <Route path="/techniciens" element={<Techniciens />} />
                        <Route path="/fournisseurs" element={<Fournisseurs />} />
                        <Route path="/rapports" element={<Rapports />} />
                        <Route path="/analyse" element={<Analyse />} />
                        <Route path="/parametres" element={<Parametres />} />
                        <Route path="/previsions" element={<PrevisionsIA />} />
                    </Route>
                </Route>
            </Routes>
        </SimpleAuthProvider>
    );
}

export default App;
