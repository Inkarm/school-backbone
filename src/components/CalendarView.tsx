'use client';

import { useState, useEffect } from 'react';
import EditEventModal from '@/components/EditEventModal';
import { ScheduleEvent } from '@/types';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00

interface CalendarViewProps {
    refreshTrigger?: number;
    filterTrainerId?: number;
    filterRoomId?: number;
    readOnly?: boolean;
}

export default function CalendarView({ refreshTrigger = 0, filterTrainerId, filterRoomId, readOnly = false }: CalendarViewProps) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [mobileDayIndex, setMobileDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

    useEffect(() => {
        fetchEvents();
    }, [currentWeek, refreshTrigger, filterTrainerId, filterRoomId, viewMode]);

    const getMonday = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0); // Reset time to start of day
        return d;
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            let startDate: Date, endDate: Date;

            if (viewMode === 'month') {
                const date = new Date(currentWeek);
                startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                // Adjust to full weeks for grid visualization if needed later
                // For now, just fetching the month's events
                const day = startDate.getDay();
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
                startDate.setDate(diff);

                const endDay = endDate.getDay();
                const endDiff = endDate.getDate() + (7 - endDay);
                endDate.setDate(endDiff);
            } else if (viewMode === 'day') {
                startDate = new Date(currentWeek);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
            } else {
                // Week mode
                startDate = getMonday(currentWeek);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
            }

            let url = `/api/schedule?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch schedule');

            let data = await response.json();

            // Client-side filtering
            if (filterTrainerId) {
                data = data.filter((e: ScheduleEvent) => e.trainerId === filterTrainerId);
            }
            if (filterRoomId) {
                data = data.filter((e: ScheduleEvent) => e.roomId === filterRoomId);
            }

            setEvents(data);
        } catch (err) {
            console.error('Error fetching schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
        setMobileDayIndex(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    };

    const navigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeek);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        } else {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        }
        setCurrentWeek(newDate);
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
            'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
            'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
            'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
            'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',
            'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
            'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
        ];
        return colors[(event.group?.id || 0) % colors.length];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 h-full">
                <div className="text-slate-500">Ładowanie grafiku...</div>
            </div>
        );
    }

    const mondayDate = getMonday(currentWeek);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    const monthName = currentWeek.toLocaleDateString('pl-PL', { month: 'long' });
    const year = currentWeek.getFullYear();

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm gap-4 md:gap-0">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                        Dzisiaj
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('prev')}
                            className="p-1 rounded-full hover:bg-gray-100 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => navigate('next')}
                            className="p-1 rounded-full hover:bg-gray-100 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <span className="font-semibold text-slate-900 capitalize hidden md:inline-block">
                        {monthName} {year}
                    </span>
                </div>

                {/* View Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Dzień
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tydzień
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Miesiąc
                    </button>
                </div>

                <div className="flex items-center gap-2 text-sm md:hidden">
                    <span className="font-semibold text-slate-900 capitalize">
                        {monthName} {year}
                    </span>
                </div>

                <div className="hidden md:block">
                    <a href="/schedule/recurring" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <span>🔄</span> Zarządzaj seriami
                    </a>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-auto bg-white relative">
                {viewMode === 'month' ? (
                    <div className="grid grid-cols-7 h-full min-h-[600px] auto-rows-fr border-l border-t border-gray-200">
                        {/* Month View Header */}
                        {DAYS.map(day => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-slate-500 border-b border-r border-gray-200 bg-slate-50">
                                <span className="hidden md:inline">{day}</span>
                                <span className="md:hidden">{day.slice(0, 3)}</span>
                            </div>
                        ))}

                        {/* Month Days */}
                        {(() => {
                            const days = [];
                            const startDate = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
                            const startDay = startDate.getDay(); // 0 is Sunday
                            const daysInMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0).getDate();

                            // Adjust for Monday start (0=Mon, 6=Sun)
                            const startOffset = startDay === 0 ? 6 : startDay - 1;

                            // Previous month padding
                            for (let i = 0; i < startOffset; i++) {
                                days.push(<div key={`prev-${i}`} className="bg-slate-50/50 border-b border-r border-gray-200" />);
                            }

                            // Current month days
                            for (let i = 1; i <= daysInMonth; i++) {
                                const date = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), i);
                                const dayEvents = events.filter(e => {
                                    const eDate = new Date(e.date);
                                    return eDate.getDate() === i && eDate.getMonth() === currentWeek.getMonth();
                                });

                                const isToday = new Date().toDateString() === date.toDateString();

                                days.push(
                                    <div
                                        key={`day-${i}`}
                                        className={`min-h-[100px] p-2 border-b border-r border-gray-200 hover:bg-slate-50 transition-colors cursor-pointer group ${isToday ? 'bg-indigo-50/30' : ''}`}
                                        onClick={() => {
                                            setCurrentWeek(date);
                                            setViewMode('day');
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 group-hover:bg-slate-200'}`}>
                                                {i}
                                            </span>
                                            {dayEvents.length > 0 && (
                                                <span className="text-xs font-medium text-slate-400">
                                                    {dayEvents.length} zajęć
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div key={event.id} className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {event.startTime} {event.group?.name}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[10px] text-slate-400 pl-1">
                                                    + {dayEvents.length - 3} więcej
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return days;
                        })()}
                    </div>
                ) : (
                    <div className={`grid ${viewMode === 'day' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_1fr] md:grid-cols-8'} h-full`}>
                        {/* Time Column */}
                        <div className="col-span-1 border-r border-gray-100 bg-slate-50/50 sticky left-0 z-10 w-12 md:w-auto">
                            <div className="h-12 border-b border-gray-100 bg-slate-50/50 sticky top-0 z-20"></div>
                            {HOURS.map(hour => (
                                <div key={hour} className="text-[10px] md:text-xs text-right pr-1 md:pr-3 pt-2 text-slate-400 h-16 font-mono border-b border-transparent">
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

                            // Check if this day is today
                            const today = new Date();
                            const isToday = today.getDay() === (dayIndex + 1) % 7 &&
                                today.getDate() === getMonday(currentWeek).getDate() + dayIndex &&
                                today.getMonth() === getMonday(currentWeek).getMonth();

                            // Visibility logic
                            let isVisible = true;
                            if (viewMode === 'day') {
                                // In day mode, only show the current selected day
                                const currentDayIndex = (currentWeek.getDay() + 6) % 7;
                                isVisible = dayIndex === currentDayIndex;
                            } else {
                                // In week mode (mobile), use mobileDayIndex
                                const isVisibleOnMobile = dayIndex === mobileDayIndex;
                                // On desktop show all, on mobile show selected
                                // But we are inside a conditional that handles desktop grid-cols-8 vs day grid-cols-[auto_1fr]
                                // So we need to be careful with classes
                            }

                            // Simplified visibility for Week Mode
                            const isMobileVisible = dayIndex === mobileDayIndex;

                            // Determine display class based on viewMode and device
                            let displayClass = '';
                            if (viewMode === 'day') {
                                const currentDayIndex = (currentWeek.getDay() + 6) % 7;
                                if (dayIndex !== currentDayIndex) return null;
                                displayClass = 'col-span-1';
                            } else {
                                // Week mode
                                displayClass = isMobileVisible ? 'block col-span-1' : 'hidden md:block col-span-1';
                            }

                            return (
                                <div key={day} className={`relative min-w-[140px] md:min-w-0 border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-indigo-50/10' : ''} ${displayClass}`}>
                                    <div className={`text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 ${isToday ? 'text-indigo-600 bg-indigo-50/20' : 'text-slate-600'}`}>
                                        <span className="md:hidden">{day}</span>
                                        <span className="hidden md:inline">{day}</span>
                                        {isToday && <span className="ml-1 text-[10px] font-bold text-indigo-500 uppercase">Dziś</span>}
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
                                                className={`absolute rounded-lg p-2 text-xs cursor-pointer shadow-sm hover:shadow-md transition-all border ${getEventColor(event)} z-10 hover:z-20 group overflow-hidden`}
                                                style={{
                                                    top: pos.top,
                                                    height: pos.height,
                                                    width: pos.width,
                                                    left: pos.left,
                                                }}
                                            >
                                                <div className="font-bold truncate text-sm mb-0.5">{event.group?.name || 'Brak grupy'}</div>
                                                <div className="flex items-center gap-1 opacity-90 truncate text-[11px]">
                                                    <span>👤</span>
                                                    {event.trainer ? (event.trainer.firstName ? `${event.trainer.firstName} ${event.trainer.lastName}` : event.trainer.login) : 'Brak trenera'}
                                                </div>
                                                {event.room && (
                                                    <div className="flex items-center gap-1 opacity-75 truncate text-[10px] mt-0.5">
                                                        <span>📍</span>
                                                        {event.room.name}
                                                    </div>
                                                )}
                                                {event.status === 'CANCELLED' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-lg">
                                                        <span className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-1 rounded shadow-sm transform -rotate-12">ODWOŁANE</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedEvent && (
                <EditEventModal
                    isOpen={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onSuccess={fetchEvents}
                    event={selectedEvent}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
}
