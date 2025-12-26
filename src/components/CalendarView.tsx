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
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'rooms'>('rooms');
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

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let startDate = new Date(currentWeek);
            let endDate = new Date(currentWeek);

            if (viewMode === 'week') {
                const day = startDate.getDay();
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
                startDate.setDate(diff);
                startDate.setHours(0, 0, 0, 0);

                const endDay = endDate.getDay();
                const endDiff = endDate.getDate() + (7 - endDay) + (endDay === 0 ? -7 : 0); // Adjust to Sunday? No, logic was flawed.
                // Simpler: Just set endDate to startDate + 7 days
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7); // Next Monday 00:00
                endDate.setHours(0, 0, 0, 0);
            } else if (viewMode === 'rooms') {
                startDate = new Date(currentWeek);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);
            } else {
                // Month view
                startDate = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
                endDate = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0);
            }

            const queryParams = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            });

            if (filterTrainerId) queryParams.append('trainerId', filterTrainerId.toString());
            if (filterRoomId) queryParams.append('roomId', filterRoomId.toString());

            const response = await fetch(`/api/schedule?${queryParams}`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
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
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else {
            // Rooms view (single day)
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentWeek(newDate);
    };

    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const monthName = currentWeek.toLocaleString('pl-PL', { month: 'long' });
    const year = currentWeek.getFullYear();

    // Helper to calculate overlapping events layout
    const calculateEventLayout = (dayEvents: ScheduleEvent[]) => {
        // ... (layout logic remains same)
        const sortedEvents = [...dayEvents].sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });

        const layoutMap = new Map<number, { width: string, left: string }>();
        const columns: ScheduleEvent[][] = [];

        sortedEvents.forEach(event => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                const lastEventInColumn = column[column.length - 1];
                if (event.startTime >= lastEventInColumn.endTime) {
                    column.push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([event]);
            }
        });

        columns.forEach((column, colIndex) => {
            column.forEach(event => {
                layoutMap.set(event.id, {
                    width: `${100 / columns.length}%`,
                    left: `${(colIndex * 100) / columns.length}%`
                });
            });
        });

        return layoutMap;
    };

    const getEventPosition = (event: ScheduleEvent, layout: { width: string, left: string }) => {
        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const [endHour, endMinute] = event.endTime.split(':').map(Number);

        const startMinutes = (startHour - 8) * 60 + startMinute;
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        return {
            top: `${(startMinutes / 60) * 64 + 48}px`, // 64px per hour + 48px header offset
            height: `${(durationMinutes / 60) * 64}px`,
            width: layout.width,
            left: layout.left
        };
    };

    const getEventStyle = (event: ScheduleEvent) => {
        if (event.status === 'CANCELLED') return {};
        if (event.trainer?.color) {
            return {
                backgroundColor: `${event.trainer.color}33`, // ~20% opacity
                borderColor: event.trainer.color,
                color: '#1e293b' // slate-800 for readability
            };
        }
        return {};
    };

    const getEventColor = (event: ScheduleEvent) => {
        if (event.status === 'CANCELLED') return 'bg-red-100 border-red-200 text-red-800 opacity-75';
        if (event.trainer?.color) return 'border'; // Base border class

        const colors = [
            'bg-blue-100 border-blue-200 text-blue-800',
            'bg-green-100 border-green-200 text-green-800',
            'bg-purple-100 border-purple-200 text-purple-800',
            'bg-amber-100 border-amber-200 text-amber-800',
            'bg-rose-100 border-rose-200 text-rose-800',
            'bg-cyan-100 border-cyan-200 text-cyan-800',
        ];

        if (!event.group) return 'bg-gray-100 border-gray-200 text-gray-800';
        return colors[event.group.id % colors.length];
    };

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

                        <div className="relative">
                            <input
                                type="date"
                                value={currentWeek.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const newDate = new Date(e.target.value);
                                        setCurrentWeek(newDate);
                                        setMobileDayIndex(newDate.getDay() === 0 ? 6 : newDate.getDay() - 1);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                                <span className="font-semibold text-slate-900 capitalize hidden md:inline-block">
                                    {(viewMode === 'rooms')
                                        ? currentWeek.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : `${monthName} ${year}`
                                    }
                                </span>
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('next')}
                            className="p-1 rounded-full hover:bg-gray-100 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    <button
                        onClick={() => setViewMode('rooms')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${viewMode === 'rooms' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Widok Sal
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
                        {DAYS.map(day => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-slate-500 border-b border-r border-gray-200 bg-slate-50">
                                <span className="hidden md:inline">{day}</span>
                                <span className="md:hidden">{day.slice(0, 3)}</span>
                            </div>
                        ))}
                        {(() => {
                            const days = [];
                            const startDate = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1);
                            const startDay = startDate.getDay();
                            const daysInMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0).getDate();
                            const startOffset = startDay === 0 ? 6 : startDay - 1;

                            for (let i = 0; i < startOffset; i++) {
                                days.push(<div key={`prev-${i}`} className="bg-slate-50/50 border-b border-r border-gray-200" />);
                            }

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
                                            setViewMode('rooms'); // Switch to Rooms view instead of Day
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
                                                <div
                                                    key={event.id}
                                                    className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${getEventColor(event)}`}
                                                    style={getEventStyle(event)}
                                                >
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
                                const roomEvents = events.filter(e => {
                                    const eDate = new Date(e.date);
                                    return e.roomId === room.id &&
                                        eDate.getDate() === currentWeek.getDate() &&
                                        eDate.getMonth() === currentWeek.getMonth() &&
                                        eDate.getFullYear() === currentWeek.getFullYear();
                                });
                                const layoutMap = calculateEventLayout(roomEvents);

                                return (
                                    <div key={room.id} className="flex-1 min-w-[150px] border-r border-gray-100 relative">
                                        <div className="text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 text-slate-700">
                                            {room.name}
                                        </div>
                                        <div className="absolute inset-0 top-12 pointer-events-none">
                                            {HOURS.map(hour => (
                                                <div key={hour} className="h-16 border-b border-gray-50" />
                                            ))}
                                        </div>
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
                                                        ...getEventStyle(event)
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
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-[auto_1fr] md:grid-cols-8 h-full">
                        <div className="col-span-1 border-r border-gray-100 bg-slate-50/50 sticky left-0 z-10 w-12 md:w-auto">
                            <div className="h-12 border-b border-gray-100 bg-slate-50/50 sticky top-0 z-20"></div>
                            {HOURS.map(hour => (
                                <div key={hour} className="text-[10px] md:text-xs text-right pr-1 md:pr-3 pt-2 text-slate-400 h-16 font-mono border-b border-transparent">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {DAYS.map((day, dayIndex) => {
                            const currentWeekMonday = getMonday(currentWeek);
                            const columnDate = new Date(currentWeekMonday);
                            columnDate.setDate(currentWeekMonday.getDate() + dayIndex);

                            const dayEvents = events.filter(event => {
                                const eventDate = new Date(event.date);
                                return eventDate.getDate() === columnDate.getDate() &&
                                    eventDate.getMonth() === columnDate.getMonth() &&
                                    eventDate.getFullYear() === columnDate.getFullYear();
                            });

                            const layoutMap = calculateEventLayout(dayEvents);
                            const today = new Date();
                            const isToday = today.getDay() === (dayIndex + 1) % 7 &&
                                today.getDate() === getMonday(currentWeek).getDate() + dayIndex &&
                                today.getMonth() === getMonday(currentWeek).getMonth();
                            const isMobileVisible = dayIndex === mobileDayIndex;
                            const displayClass = isMobileVisible ? 'block col-span-1' : 'hidden md:block col-span-1';

                            return (
                                <div key={day} className={`relative min-w-[140px] md:min-w-0 border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-indigo-50/10' : ''} ${displayClass}`}>
                                    <div className={`text-center text-sm font-medium py-3 border-b border-gray-100 bg-white sticky top-0 z-10 ${isToday ? 'text-indigo-600 bg-indigo-50/20' : 'text-slate-600'}`}>
                                        <span className="md:hidden">{day}</span>
                                        <span className="hidden md:inline">{day}</span>
                                        {isToday && <span className="ml-1 text-[10px] font-bold text-indigo-500 uppercase">Dziś</span>}
                                    </div>
                                    <div className="absolute inset-0 top-12 pointer-events-none">
                                        {HOURS.map(hour => (
                                            <div key={hour} className="h-16 border-b border-gray-50" />
                                        ))}
                                    </div>
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
                                                    ...getEventStyle(event)
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
