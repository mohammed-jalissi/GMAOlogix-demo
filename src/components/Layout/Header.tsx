import { Search, Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="search-box">
                    <Search size={18} color="#64748b" />
                    <input type="text" placeholder="Rechercher..." />
                </div>

                <button className="header-icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                <div className="user-menu">
                    <div className="user-avatar">AD</div>
                    <div className="user-info">
                        <span className="user-name">Admin User</span>
                        <span className="user-role">Administrateur</span>
                    </div>
                    <ChevronDown size={16} color="#64748b" />
                </div>
            </div>
        </header>
    );
}
