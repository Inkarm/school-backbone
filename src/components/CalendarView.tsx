'use client';

import { useState, useEffect } from 'react';
import EventDetailsModal from '@/components/EventDetailsModal';
import { ScheduleEvent } from '@/types';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

interface CalendarViewProps {
    refreshTrigger?: number;
}

export default function CalendarView({ refreshTrigger = 0 }: CalendarViewProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

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
        d.setDate(diff);
        d.setHours(0, 0, 0, 0); // Reset time to start of day
        return d;
    };

    // Helper to calculate layout for overlapping events
    const calculateEventLayout = (dayEvents: ScheduleEvent[]) => {
        // Sort by start time
        const sorted = [...dayEvents].sort((a, b) => {
            const startA = a.startTime.split(':').map(Number);
            const startB = b.startTime.split(':').map(Number);
            return (startA[0] * 60 + startA[1]) - (startB[0] * 60 + startB[1]);
        });

        const columns: ScheduleEvent[][] = [];

        sorted.forEach(event => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const lastInCol = columns[i][columns[i].length - 1];
                // Check if overlaps
                const [lastEndH, lastEndM] = lastInCol.endTime.split(':').map(Number);
                const [currStartH, currStartM] = event.startTime.split(':').map(Number);

                const lastEnd = lastEndH * 60 + lastEndM;
                const currStart = currStartH * 60 + currStartM;

                if (currStart >= lastEnd) {
                    columns[i].push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([event]);
            }
        });

        // Map event ID to layout props
        const layoutMap = new Map();
        columns.forEach((col, colIndex) => {
            col.forEach(event => {
                layoutMap.set(event.id, {
                    width: `${90 / columns.length}%`,
                    left: `${5 + (colIndex * (90 / columns.length))}%`
                });
            });
        });

        return layoutMap;
    };

    const getEventPosition = (event: ScheduleEvent, layout: { width: string, left: string }) => {
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const startInHours = startHour + startMinute / 60;
        const endInHours = endHour + endMinute / 60;
        const duration = endInHours - startInHours;

        return {
            top: `${(startInHours - 8) * 4 + 3}rem`,
            height: `${duration * 4}rem`,
            width: layout.width,
            left: layout.left
        };
    };

    const getEventColor = (event: ScheduleEvent) => {
        if (event.status === 'CANCELLED') {
            return 'bg-gray-100 border-gray-300 text-gray-500 line-through opacity-70';
        }
        if (event.status === 'COMPLETED') {
            return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        }

        const colors = [
            'bg-indigo-50 border-indigo-200 text-indigo-700',
            'bg-blue-50 border-blue-200 text-blue-700',
            'bg-amber-50 border-amber-200 text-amber-700',
            'bg-rose-50 border-rose-200 text-rose-700',
            'bg-purple-50 border-purple-200 text-purple-700',
            'bg-teal-50 border-teal-200 text-teal-700',
        ];
        return colors[(event.group?.id || 0) % colors.length];
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
                {DAYS.map((day, dayIndex) => {
                    // Filter events for this day
                    const dayEvents = events.filter(event => {
                        const eventDate = new Date(event.date);
                        const eventDayIndex = (eventDate.getDay() + 6) % 7;
                        return eventDayIndex === dayIndex;
                    });

                    // Calculate layout for this day
                    const layoutMap = calculateEventLayout(dayEvents);

                    return (
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
                            {dayEvents.map(event => {
                                const layout = layoutMap.get(event.id) || { width: '90%', left: '5%' };
                                const pos = getEventPosition(event, layout);
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`absolute rounded-md p-2 text-xs font-medium cursor-pointer hover:shadow-md transition-all border ${getEventColor(event)} z-10 hover:z-20`}
                                        style={{
                                            top: pos.top,
                                            height: pos.height,
                                            width: pos.width,
                                            left: pos.left,
                                        }}
                                    >
                                        <div className="font-bold truncate">{event.group?.name || 'Brak grupy'}</div>
                                        <div className="opacity-80 truncate">
                                            {event.trainer ? (event.trainer.firstName ? `${event.trainer.firstName} ${event.trainer.lastName}` : event.trainer.login) : 'Brak trenera'}
                                        </div>
                                        {event.room && <div className="text-[10px] opacity-60 truncate">{event.room.name}</div>}
                                        {event.status === 'CANCELLED' && (
                                            <div className="text-[10px] font-bold text-red-500 mt-1">ODWOŁANE</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <EventDetailsModal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onDelete={fetchEvents}
                event={selectedEvent}
            />
        </div>
    );
}
