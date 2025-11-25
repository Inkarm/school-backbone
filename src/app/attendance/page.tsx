'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GroupAttendanceStats from '@/components/GroupAttendanceStats';

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
    const [activeTab, setActiveTab] = useState<'mark' | 'stats'>('mark');

    // Filters
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (activeTab === 'mark') {
            fetchClasses();
        }
    }, [selectedDate, selectedGroupId, activeTab]);

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
        <div className="space-y-6 max-w-4xl mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Obecność</h2>
                <p className="text-slate-500">Zarządzaj obecnością i przeglądaj statystyki frekwencji</p>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-6">
                <button
                    onClick={() => setActiveTab('mark')}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'mark'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        }`}
                >
                    ✓ Zaznacz obecność
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'stats'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        }`}
                >
                    📊 Statystyki grup
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-6">
                {activeTab === 'mark' ? (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="text-center py-16 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                                    <span className="text-4xl block mb-4">📅</span>
                                    <p className="font-medium">Brak zajęć dla wybranych kryteriów.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {classes.map(cls => (
                                        <Link
                                            key={cls.id}
                                            href={`/attendance/${cls.id}`}
                                            className="block bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99] group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-2xl font-bold text-slate-900">{cls.startTime}</span>
                                                <span className="px-3 py-1 rounded-full bg-indigo-50 text-xs font-medium border border-indigo-200 text-indigo-700">
                                                    {cls.group.name}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1 text-slate-800">{cls.group.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                {cls.trainer.firstName} {cls.trainer.lastName}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Statystyki frekwencji dla grup</h3>
                            <p className="text-sm text-slate-600 mb-6">
                                Przeglądaj statystyki obecności uczniów w poszczególnych grupach oraz eksportuj dane do CSV
                            </p>
                        </div>

                        {groups.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                                <span className="text-4xl block mb-4">👥</span>
                                <p className="font-medium text-slate-600">Brak grup</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groups.map(group => (
                                    <GroupAttendanceStats
                                        key={group.id}
                                        groupId={group.id}
                                        groupName={group.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
