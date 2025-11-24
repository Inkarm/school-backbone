'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

interface ScheduleEvent {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    room: {
        id: number;
        name: string;
    } | null;
    group: {
        id: number;
        name: string;
    };
    trainer: {
        id: number;
        login: string;
    };
}

interface CalendarViewProps {
    refreshTrigger?: number;
}

export default function CalendarView({ refreshTrigger = 0 }: CalendarViewProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [currentWeek, refreshTrigger]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const startDate = getMonday(currentWeek);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);

            const response = await fetch(
                `/api/schedule?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (!response.ok) throw new Error('Failed to fetch schedule');

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const getEventPosition = (event: ScheduleEvent) => {
        const eventDate = new Date(event.date);
        const dayIndex = (eventDate.getDay() + 6) % 7; // Convert to Monday=0

        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const startInHours = startHour + startMinute / 60;
        const endInHours = endHour + endMinute / 60;
        const duration = endInHours - startInHours;

        return {
            dayIndex,
            top: `${(startInHours - 8) * 4 + 3}rem`,
            height: `${duration * 4}rem`,
        };
    };

    const getEventColor = (groupId: number) => {
        const colors = [
            'bg-indigo-50 border-indigo-200 text-indigo-700',
            'bg-emerald-50 border-emerald-200 text-emerald-700',
            'bg-amber-50 border-amber-200 text-amber-700',
            'bg-rose-50 border-rose-200 text-rose-700',
        ];
        return colors[groupId % colors.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Ładowanie...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Week Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
                <button
                    onClick={() => {
                        const newDate = new Date(currentWeek);
                        newDate.setDate(newDate.getDate() - 7);
                        setCurrentWeek(newDate);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    ← Poprzedni
                </button>
                <span className="font-semibold text-lg tracking-tight text-slate-900">
                    {getMonday(currentWeek).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <button
                    onClick={() => {
                        const newDate = new Date(currentWeek);
                        newDate.setDate(newDate.getDate() + 7);
                        setCurrentWeek(newDate);
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    Następny →
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-8 overflow-auto bg-white">
                {/* Time Column */}
                <div className="col-span-1 border-r border-gray-100 bg-slate-50/50">
                    <div className="h-12 border-b border-gray-100"></div>
                    {HOURS.map(hour => (
                        <div key={hour} className="text-xs text-right pr-3 pt-2 text-slate-400 h-16 font-mono">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {DAYS.map((day, dayIndex) => (
                    <div key={day} className="col-span-1 relative min-w-[120px] border-r border-gray-100 last:border-r-0">
                        <div className="text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 text-slate-600">
                            {day}
                        </div>

                        {/* Grid Lines */}
                        <div className="absolute inset-0 top-12 pointer-events-none">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-16 border-b border-gray-50" />
                            ))}
                        </div>

                        {/* Events */}
                        {events
                            .filter(event => getEventPosition(event).dayIndex === dayIndex)
                            .map(event => {
                                const pos = getEventPosition(event);
                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute w-[90%] left-[5%] rounded-md p-2 text-xs font-medium cursor-pointer hover:shadow-md transition-all border ${getEventColor(event.group.id)}`}
                                        style={{
                                            top: pos.top,
                                            height: pos.height,
                                        }}
                                    >
                                        <div className="font-bold">{event.group.name}</div>
                                        <div className="opacity-80">{event.trainer.login}</div>
                                        {event.room && <div className="text-[10px] opacity-60">{event.room.name}</div>}
                                    </div>
                                );
                            })}
                    </div>
                ))}
            </div>
        </div>
    );
}
