import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
    id: string;
    message: string;
    type: NotificationType;
    timestamp: number;
    read: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    addNotification: (message: string, type: NotificationType) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const addNotification = (message: string, type: NotificationType) => {
        const newNotification: AppNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

        // Also trigger Sonner toast
        switch (type) {
            case 'success': toast.success(message); break;
            case 'error': toast.error(message); break;
            case 'warning': toast.warning(message); break;
            case 'info': toast.info(message); break;
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
