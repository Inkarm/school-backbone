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
    const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodayClasses();
    }, []);

    const fetchTodayClasses = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const response = await fetch(
                `/api/schedule?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`
            );

            if (!response.ok) throw new Error('Failed to fetch schedule');

            const data = await response.json();
            setTodayClasses(data);
        } catch (err) {
            console.error('Error fetching today classes:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Ładowanie...</div>
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className="space-y-8 max-w-lg mx-auto">
            <header>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Obecność</h2>
                <p className="text-slate-500">Twoje zajęcia na dzisiaj ({currentDate}).</p>
            </header>

            <div className="space-y-4">
                {todayClasses.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 clean-card bg-slate-50 border-dashed">
                        <span className="text-4xl block mb-4">☕</span>
                        <p className="font-medium">Brak zajęć na dzisiaj. Odpocznij!</p>
                    </div>
                ) : (
                    todayClasses.map(cls => (
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
