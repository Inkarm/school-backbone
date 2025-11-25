'use client';

import { useState, useEffect } from 'react';
import AdvancedReportsDashboard from '@/components/reports/AdvancedReportsDashboard';

interface TrainerStats {
    trainerId: number;
    trainerName: string;
    regularHours: number;
    substitutionHours: number;
    totalHours: number;
    eventCount: number;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'trainer' | 'advanced'>('trainer');
    const [stats, setStats] = useState<TrainerStats[]>([]);
    const [loading, setLoading] = useState(false);

    // Default to current month
    const today = new Date();
    const [month, setMonth] = useState(today.toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        if (activeTab === 'trainer') {
            fetchStats();
        }
    }, [month, activeTab]);

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
                {activeTab === 'trainer' && (
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Miesiąc:</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('trainer')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'trainer'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                        `}
                    >
                        Raport Godzinowy
                    </button>
                    <button
                        onClick={() => setActiveTab('advanced')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'advanced'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                        `}
                    >
                        Zaawansowana Analityka
                        <span className="ml-2 bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">Nowość</span>
                    </button>
                </nav>
            </div>

            {activeTab === 'trainer' ? (
                <div className="space-y-6">
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

                    {/* Attendance Statistics Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900">Statystyki Obecności</h3>
                                <p className="text-sm text-slate-500 mt-1">Frekwencja uczniów w grupach</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-dashed border-indigo-200">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                                        <span className="text-3xl">📊</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Szczegółowe statystyki obecności</h4>
                                    <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                                        Zobacz frekwencję uczniów w poszczególnych grupach oraz eksportuj dane do CSV
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                        <a
                                            href="/attendance"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                        >
                                            <span>👥</span>
                                            <span className="font-medium">Zobacz obecność</span>
                                        </a>
                                        <p className="text-sm text-slate-500">
                                            Sprawdź statystyki dla poszczególnych grup
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <AdvancedReportsDashboard />
            )}
        </div>
    );
}
