'use client';

import { useState, useEffect } from 'react';

interface TrainerStats {
    trainerId: number;
    trainerName: string;
    regularHours: number;
    substitutionHours: number;
    totalHours: number;
    eventCount: number;
}

export default function ReportsPage() {
    const [stats, setStats] = useState<TrainerStats[]>([]);
    const [loading, setLoading] = useState(false);

    // Default to current month
    const today = new Date();
    const [month, setMonth] = useState(today.toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        fetchStats();
    }, [month]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

            const res = await fetch(`/api/reports/trainer-stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    const totalHours = stats.reduce((sum, s) => sum + s.totalHours, 0);
    const totalSubstitutions = stats.reduce((sum, s) => sum + s.substitutionHours, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Raporty</h2>
                    <p className="text-slate-500">Statystyki i podsumowania</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Miesiąc:</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Suma Godzin</h3>
                    <div className="text-3xl font-bold text-indigo-600">{totalHours.toFixed(1)} h</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Godziny Zastępstw</h3>
                    <div className="text-3xl font-bold text-amber-600">{totalSubstitutions.toFixed(1)} h</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Aktywni Trenerzy</h3>
                    <div className="text-3xl font-bold text-emerald-600">{stats.length}</div>
                </div>
            </div>

            {/* Trainer Stats Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-slate-900">Raport Godzinowy Trenerów</h3>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Ładowanie danych...</div>
                ) : stats.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Brak danych za wybrany okres</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Trener</th>
                                    <th className="px-6 py-3 text-right">Zajęcia (szt)</th>
                                    <th className="px-6 py-3 text-right">Godziny Regularne</th>
                                    <th className="px-6 py-3 text-right">Zastępstwa</th>
                                    <th className="px-6 py-3 text-right">Suma Godzin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.sort((a, b) => b.totalHours - a.totalHours).map((stat) => (
                                    <tr key={stat.trainerId} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{stat.trainerName}</td>
                                        <td className="px-6 py-4 text-right">{stat.eventCount}</td>
                                        <td className="px-6 py-4 text-right text-slate-600">{stat.regularHours.toFixed(1)} h</td>
                                        <td className="px-6 py-4 text-right text-amber-600 font-medium">
                                            {stat.substitutionHours > 0 ? `${stat.substitutionHours.toFixed(1)} h` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600">{stat.totalHours.toFixed(1)} h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
