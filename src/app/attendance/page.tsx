'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TodayClass {
    id: number;
    startTime: string;
    group: {
        id: number;
        name: string;
    };
    trainer: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export default function AttendancePage() {
    const [classes, setClasses] = useState<TodayClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);

    // Filters
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [selectedDate, selectedGroupId]);

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/groups');
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const start = new Date(selectedDate);
            const end = new Date(selectedDate);
            end.setDate(end.getDate() + 1);

            let url = `/api/schedule?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
            if (selectedGroupId) {
                url += `&groupId=${selectedGroupId}`;
            }

            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch schedule');

            const data = await response.json();
            setClasses(data);
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date(selectedDate).toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Obecność</h2>
                <p className="text-slate-500">Wybierz grupę i datę, aby sprawdzić obecność.</p>
            </header>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grupa (opcjonalne)</label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                        <option value="">Wszystkie grupy</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 capitalize">{formattedDate}</h3>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-slate-500">Ładowanie...</div>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 clean-card bg-slate-50 border-dashed">
                        <span className="text-4xl block mb-4">📅</span>
                        <p className="font-medium">Brak zajęć dla wybranych kryteriów.</p>
                    </div>
                ) : (
                    classes.map(cls => (
                        <Link
                            key={cls.id}
                            href={`/attendance/${cls.id}`}
                            className="block clean-card p-6 hover:border-slate-300 transition-all active:scale-[0.99] group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-2xl font-bold text-slate-900">{cls.startTime}</span>
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium border border-slate-200 text-slate-600">
                                    {cls.group.name}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-1 text-slate-800">{cls.group.name}</h3>
                            <p className="text-sm text-slate-500">
                                {cls.trainer.firstName} {cls.trainer.lastName}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
