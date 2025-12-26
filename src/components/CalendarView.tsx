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

    // ... (rest of helpers)

    // ...

    {/* Days Columns */ }
    {
        DAYS.map((day, dayIndex) => {
            // Calculate the specific date for this column in the current week view
            const currentWeekMonday = getMonday(currentWeek);
            const columnDate = new Date(currentWeekMonday);
            columnDate.setDate(currentWeekMonday.getDate() + dayIndex);

            // Filter events for this day AND verify they match the exact date
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getDate() === columnDate.getDate() &&
                    eventDate.getMonth() === columnDate.getMonth() &&
                    eventDate.getFullYear() === columnDate.getFullYear();
            });

            // Calculate layout for this day
            const layoutMap = calculateEventLayout(dayEvents);

            // Check if this day is today
            const today = new Date();
            const isToday = today.getDay() === (dayIndex + 1) % 7 &&
                today.getDate() === getMonday(currentWeek).getDate() + dayIndex &&
                today.getMonth() === getMonday(currentWeek).getMonth();

            // Simplified visibility for Week Mode
            const isMobileVisible = dayIndex === mobileDayIndex;

            // Week mode display
            const displayClass = isMobileVisible ? 'block col-span-1' : 'hidden md:block col-span-1';

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
        })
    }
                    </div >
                )
}
            </div >

    { selectedEvent && (
        <EditEventModal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={fetchEvents}
            event={selectedEvent}
            readOnly={readOnly}
        />
    )}
        </div >
    );
}
