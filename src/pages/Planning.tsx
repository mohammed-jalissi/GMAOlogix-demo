import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getOrdresTravail } from '../lib/ordres-travail.service';
import { getPlansMaintenance } from '../lib/maintenance.service';
import type { OrdreTravail, PlanMaintenance } from '../lib/supabase';

interface CalendarEvent {
    id: string;
    title: string;
    type: 'preventive' | 'corrective' | 'predictive';
    date: string;
    technicien: string;
}

const typeColors: Record<string, string> = {
    'preventive': 'linear-gradient(135deg, #14b8a6, #0d9488)',
    'corrective': 'linear-gradient(135deg, #f97316, #c2410c)',
    'predictive': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
};

export default function Planning() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ots, plans] = await Promise.all([
                    getOrdresTravail(),
                    getPlansMaintenance()
                ]);

                const formattedEvents: CalendarEvent[] = [
                    ...ots.map(ot => ({
                        id: ot.id,
                        title: ot.titre,
                        type: (ot.type_maintenance === 'corrective' ? 'corrective' :
                            ot.type_maintenance === 'preventive' ? 'preventive' : 'predictive') as any,
                        date: ot.date_prevue_debut?.split('T')[0] || '',
                        technicien: ot.technicien?.profil ? `${ot.technicien.profil.prenom} ${ot.technicien.profil.nom}` : 'N/A'
                    })),
                    ...plans.map(plan => ({
                        id: plan.id,
                        title: plan.nom,
                        type: 'preventive' as const,
                        date: plan.prochaine_date || '',
                        technicien: plan.technicien?.profil ? `${plan.technicien.profil.prenom} ${plan.technicien.profil.nom}` : 'N/A'
                    }))
                ];

                setCalendarEvents(formattedEvents);
            } catch (error) {
                console.error('Erreur lors du chargement du planning:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return calendarEvents.filter(e => e.date === dateStr);
    };

    const today = new Date();
    const isToday = (day: number) => {
        return today.getDate() === day &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear();
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Planning</h2>
                <p className="page-subtitle">Calendrier des interventions et maintenances planifiées</p>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="header-icon-btn" onClick={prevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <button className="header-icon-btn" onClick={nextMonth}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <div className="action-bar-right">
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Planifier intervention
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
                {loading ? (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Chargement du planning...
                    </div>
                ) : (
                    <>
                        {/* Days header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                            {dayNames.map(day => (
                                <div key={day} style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} style={{ minHeight: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />
                            ))}

                            {/* Days of month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = getEventsForDay(day);

                                return (
                                    <div
                                        key={day}
                                        style={{
                                            minHeight: '100px',
                                            background: isToday(day) ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                                            border: isToday(day) ? '1px solid var(--primary-500)' : '1px solid transparent',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: isToday(day) ? '600' : '500',
                                            color: isToday(day) ? 'var(--primary-400)' : 'var(--text-primary)',
                                            marginBottom: '4px'
                                        }}>
                                            {day}
                                        </div>
                                        {dayEvents.slice(0, 2).map(event => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    background: typeColors[event.type],
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    marginBottom: '4px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    color: 'white'
                                                }}
                                                title={`${event.title} - ${event.technicien}`}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                +{dayEvents.length - 2} autre(s)
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', background: typeColors.preventive, borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Préventive</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', background: typeColors.corrective, borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Corrective</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', background: typeColors.predictive, borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Prédictive</span>
                </div>
            </div>
        </div>
    );
}
