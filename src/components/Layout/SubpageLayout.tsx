import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Wrench,
    FileText,
    CalendarCheck,
    CalendarDays,
    Package,
    Users,
    Building2,
    BarChart3,
    TrendingUp,
    Brain,
    Settings2,
    ArrowLeft,
    Cog,
    Search,
    Bell,
    ChevronDown
} from 'lucide-react';
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext';
import { useState } from 'react';

const menuItems = [
    {
        section: 'Principal',
        items: [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
            { path: '/fournisseurs', icon: Building2, label: 'Fournisseurs' },
        ]
    },
    {
        section: 'Analyse',
        items: [
            { path: '/rapports', icon: BarChart3, label: 'Rapports & KPI' },
            { path: '/analyse', icon: TrendingUp, label: 'Analyse & Historique' },
            { path: '/previsions', icon: Brain, label: 'Prévisions IA' },
        ]
    },
    {
        section: 'Configuration',
        items: [
            { path: '/parametres', icon: Settings2, label: 'Paramètres' },
        ]
    }
];

function SubpageContent() {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="subpage-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Cog />
                    </div>
                    <span className="sidebar-title">GMAO Pro</span>
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
                                    <item.icon />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="back-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} />
                        <span>Retour aux modules</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="subpage-content">
                <header className="subpage-header">
                    <h1 className="subpage-title">GMAO Pro</h1>
                    <div className="header-actions">
                        <div className="search-box">
                            <Search size={16} color="#9ca3af" />
                            <input type="text" placeholder="Rechercher..." />
                        </div>

                        {/* Notification Bell with Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="icon-btn"
                                style={{ position: 'relative' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="glass-card" style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: '0',
                                    width: '320px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    zIndex: 100,
                                    padding: '0',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Notifications</h3>
                                        <button
                                            onClick={markAllAsRead}
                                            style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer' }}
                                        >
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                Aucune notification
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => markAsRead(notification.id)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom: '1px solid rgba(226, 232, 240, 0.4)',
                                                        background: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <div style={{ marginTop: '2px' }}>
                                                        {notification.type === 'success' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />}
                                                        {notification.type === 'error' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />}
                                                        {notification.type === 'warning' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />}
                                                        {notification.type === 'info' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '2px' }}>{notification.message}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-menu">
                            <div className="user-avatar">AD</div>
                            <div className="user-info">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Administrateur</span>
                            </div>
                            <ChevronDown size={14} color="#9ca3af" />
                        </div>
                    </div>
                </header>

                <div className="page-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default function SubpageLayout() {
    return (
        <NotificationProvider>
            <SubpageContent />
        </NotificationProvider>
    );
}
