'use client';

import { useState, useEffect } from 'react';
import { User, ScheduleEvent, Group } from '@/types';
import Link from 'next/link';
import NoticeBoardWidget from '@/components/notices/NoticeBoardWidget';

interface TrainerDashboardProps {
    user: User;
}

export default function TrainerDashboard({ user }: TrainerDashboardProps) {
    const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([]);
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                // Fetch today's schedule for this trainer
                // Note: The API might need to be updated to filter by trainerId if not already
                // But we can filter on client side if needed, though server side is better.
                // Our API /api/schedule supports date and groupId. 
                // We should probably add trainerId support to GET /api/schedule if not present.
                // Let's assume we can filter or we fetch all and filter.
                // Actually, let's check /api/schedule. For now, I'll fetch and filter.

                const scheduleRes = await fetch(`/api/schedule?date=${today}`);
                const scheduleData = await scheduleRes.json();

                // Filter for this trainer
                const trainerEvents = scheduleData.filter((e: ScheduleEvent) => e.trainerId === user.id);
                setTodayEvents(trainerEvents);

                // Fetch groups (API handles access control)
                const groupsRes = await fetch('/api/groups');
                const groupsData = await groupsRes.json();
                setMyGroups(groupsData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Ładowanie pulpitu...</div>;
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
                    Cześć, {user.firstName || user.login} 👋
                </h2>
                <p className="text-slate-500">Twoje centrum dowodzenia.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notice Board */}
                <div className="md:col-span-1 h-full">
                    <NoticeBoardWidget />
                </div>
                {/* Today's Schedule */}
                <div className="clean-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Dzisiejsze Zajęcia</h3>
                        <span className="text-sm text-slate-500">{new Date().toLocaleDateString('pl-PL')}</span>
                    </div>

                    {todayEvents.length === 0 ? (
                        <p className="text-slate-500 text-sm">Brak zajęć na dzisiaj.</p>
                    ) : (
                        <div className="space-y-3">
                            {todayEvents.map(event => (
                                <div key={event.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-slate-900">
                                            {event.startTime.slice(0, 5)} - {event.endTime.slice(0, 5)}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            {event.group?.name}
                                        </div>
                                        {event.room && (
                                            <div className="text-xs text-slate-400">
                                                Sala: {event.room.name}
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/schedule?date=${event.date}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Sprawdź
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Groups */}
                <div className="clean-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Twoje Grupy</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {myGroups.length}
                        </span>
                    </div>

                    {myGroups.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nie przypisano do żadnych grup.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {myGroups.map(group => (
                                <div key={group.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded transition-colors">
                                    <span className="text-slate-700 font-medium">{group.name}</span>
                                    <span className="text-xs text-slate-400">
                                        {group.students?.length || 0} uczniów
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
