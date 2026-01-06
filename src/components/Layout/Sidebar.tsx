import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Wrench,
  ClipboardList,
  CalendarCheck,
  CalendarDays,
  Package,
  Users,
  Truck,
  BarChart3,
  TrendingUp,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Cog,
  FileText
} from 'lucide-react';

const menuItems = [
  {
    section: 'Principal',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    section: 'Maintenance',
    items: [
      { path: '/equipements', icon: Settings, label: 'Équipements' },
      { path: '/ordres-travail', icon: Wrench, label: 'Ordres de travail' },
      { path: '/demandes-intervention', icon: FileText, label: 'Demandes d\'intervention' },
      { path: '/maintenance-preventive', icon: CalendarCheck, label: 'Maintenance préventive' },
      { path: '/planning', icon: CalendarDays, label: 'Planning' },
    ]
  },
  {
    section: 'Ressources',
    items: [
      { path: '/stock', icon: Package, label: 'Stock & Pièces' },
      { path: '/techniciens', icon: Users, label: 'Techniciens' },
      { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
    ]
  },
  {
    section: 'Analyse',
    items: [
      { path: '/rapports', icon: BarChart3, label: 'Rapports & KPI' },
      { path: '/analyse', icon: TrendingUp, label: 'Analyse & Historique' },
    ]
  },
  {
    section: 'Configuration',
    items: [
      { path: '/parametres', icon: Settings2, label: 'Paramètres' },
    ]
  }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Cog />
        </div>
        <span className="sidebar-title">GMAOlogix</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="nav-item-icon" />
                <span className="nav-item-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
