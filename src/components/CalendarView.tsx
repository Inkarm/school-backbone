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
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'rooms'>('week');
    const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        fetchRooms();
        fetchEvents();
    }, [currentWeek, refreshTrigger, filterTrainerId, filterRoomId, viewMode]);

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            if (res.ok) setRooms(await res.json());
        } catch (e) { console.error(e); }
    };

    // ... existing fetchEvents ...

    // ... existing navigation ...

    // ... existing layout helpers ...

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
                <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        <button
                            onClick={() => setViewMode('rooms')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'rooms' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Widok Sal
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Dzień
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tydzień
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                        // ... Month View ...

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
                                                        {dayEvents.length}
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
                    ) : viewMode === 'rooms' ? (
                        // ... Rooms View ...
                        <div className="grid grid-cols-[auto_1fr] h-full overflow-auto">
                            {/* Time Column */}
                            <div className="col-span-1 border-r border-gray-100 bg-slate-50/50 sticky left-0 z-10 w-12 md:w-auto">
                                <div className="h-12 border-b border-gray-100 bg-slate-50/50 sticky top-0 z-20 flex items-center justify-center text-xs font-bold text-slate-400">
                                    Godz
                                </div>
                                {HOURS.map(hour => (
                                    <div key={hour} className="text-[10px] md:text-xs text-right pr-1 md:pr-3 pt-2 text-slate-400 h-16 font-mono border-b border-transparent">
                                        {hour}:00
                                    </div>
                                ))}
                            </div>

                            {/* Rooms Columns */}
                            <div className="flex" style={{ width: `${Math.max(100, rooms.length * 25)}%` }}>
                                {rooms.map((room) => {
                                    const roomEvents = events.filter(e => e.roomId === room.id);
                                    const layoutMap = calculateEventLayout(roomEvents);

                                    return (
                                        <div key={room.id} className="flex-1 min-w-[150px] border-r border-gray-100 relative">
                                            <div className="text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 text-slate-700">
                                                {room.name}
                                            </div>

                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 top-12 pointer-events-none">
                                                {HOURS.map(hour => (
                                                    <div key={hour} className="h-16 border-b border-gray-50" />
                                                ))}
                                            </div>

                                            {/* Events */}
                                            {roomEvents.map(event => {
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
                                                        <div className="font-bold truncate text-sm mb-0.5">{event.group?.name}</div>
                                                        <div className="flex items-center gap-1 opacity-90 truncate text-[11px]">
                                                            <span>👤</span>
                                                            {event.trainer ? (event.trainer.firstName ? `${event.trainer.firstName} ${event.trainer.lastName}` : event.trainer.login) : 'Brak trenera'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                                {/* No Room Column */}
                                <div className="flex-1 min-w-[150px] border-r border-gray-100 relative bg-slate-50/30">
                                    <div className="text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 text-slate-500 italic">
                                        Bez sali
                                    </div>
                                    <div className="absolute inset-0 top-12 pointer-events-none">
                                        {HOURS.map(hour => (
                                            <div key={hour} className="h-16 border-b border-gray-50" />
                                        ))}
                                    </div>
                                    {events.filter(e => !e.roomId).map(event => {
                                        const layoutMap = calculateEventLayout(events.filter(e => !e.roomId));
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
                                                <div className="font-bold truncate text-sm mb-0.5">{event.group?.name}</div>
                                                <div className="flex items-center gap-1 opacity-90 truncate text-[11px]">
                                                    <span>👤</span>
                                                    {event.trainer ? (event.trainer.firstName ? `${event.trainer.firstName} ${event.trainer.lastName}` : event.trainer.login) : 'Brak trenera'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ... Day/Week View ...
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
