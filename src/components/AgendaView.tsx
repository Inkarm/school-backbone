'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface ScheduleEvent {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    isSubstitution: boolean;
    group: { id: number; name: string };
    room: { id: number; name: string } | null;
    trainer: { id: number; firstName: string | null; lastName: string | null; login: string; color: string | null };
    originalTrainer?: { id: number; firstName: string | null; lastName: string | null; login: string } | null;
}

interface GroupedEvents {
    [date: string]: ScheduleEvent[];
}

export default function AgendaView() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [grouped, setGrouped] = useState<GroupedEvents>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'today' | 'week' | 'custom'>('week');
    const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

    const fetchAgenda = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter === 'today') {
                params.set('dateFrom', format(new Date(), 'yyyy-MM-dd'));
                params.set('dateTo', format(new Date(), 'yyyy-MM-dd'));
            } else if (filter === 'week') {
                params.set('dateFrom', format(new Date(), 'yyyy-MM-dd'));
                params.set('dateTo', format(addDays(new Date(), 7), 'yyyy-MM-dd'));
            } else {
                params.set('dateFrom', dateFrom);
                params.set('dateTo', dateTo);
            }

            const res = await fetch(`/api/schedule/agenda?${params}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
                setGrouped(data.grouped);
            }
        } catch (error) {
            console.error('Failed to fetch agenda', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgenda();
    }, [filter, dateFrom, dateTo]);

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Dziś';
        if (isTomorrow(date)) return 'Jutro';
        return format(date, 'EEEE, d MMMM', { locale: pl });
    };

    const getTrainerName = (trainer: { firstName: string | null; lastName: string | null; login: string }) =>
        trainer.firstName ? `${trainer.firstName} ${trainer.lastName}` : trainer.login;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Zakończone</span>;
            case 'CANCELLED':
                return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Odwołane</span>;
            default:
                return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Zaplanowane</span>;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">📅 Agenda</h1>
                    <p className="text-slate-500">Lista nadchodzących zajęć</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setFilter('today')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'today'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                            }`}
                    >
                        Dziś
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'week'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                            }`}
                    >
                        Tydzień
                    </button>
                    <button
                        onClick={() => setFilter('custom')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'custom'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                            }`}
                    >
                        Własny zakres
                    </button>

                    {filter === 'custom' && (
                        <div className="flex gap-2 ml-4">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <span className="text-slate-400 self-center">—</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                min={dateFrom}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Events list */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <span className="text-slate-400">Ładowanie...</span>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-2">📭</div>
                    <h3 className="text-lg font-medium text-slate-900">Brak zajęć</h3>
                    <p className="text-slate-500">W wybranym okresie nie ma zaplanowanych zajęć</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, dayEvents]) => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold text-slate-900 mb-3 capitalize">
                                {getDateLabel(date)}
                            </h2>
                            <div className="space-y-2">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                        style={{
                                            borderLeftWidth: '4px',
                                            borderLeftColor: event.trainer.color || '#6366f1'
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900">
                                                        {event.startTime} - {event.endTime}
                                                    </span>
                                                    {getStatusBadge(event.status)}
                                                    {event.isSubstitution && (
                                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                                            🔄 Zastępstwo
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-lg text-slate-800">{event.group.name}</h3>
                                                <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-3">
                                                    <span>👤 {getTrainerName(event.trainer)}</span>
                                                    {event.room && <span>📍 {event.room.name}</span>}
                                                    {event.isSubstitution && event.originalTrainer && (
                                                        <span className="text-amber-600">
                                                            (za: {getTrainerName(event.originalTrainer)})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <a
                                                href={`/attendance/${event.id}`}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                                            >
                                                Obecność →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
