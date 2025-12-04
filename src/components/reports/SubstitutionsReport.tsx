'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Substitution {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    group: string;
    room: string;
    originalTrainer: string;
    substituteTrainer: string;
    substitutedAt: string;
}

interface Summary {
    total: number;
    bySubstitute: Record<string, number>;
    byOriginal: Record<string, number>;
}

export default function SubstitutionsReport() {
    const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ dateFrom, dateTo });
            const res = await fetch(`/api/reports/substitutions?${params}`);
            if (res.ok) {
                const data = await res.json();
                setSubstitutions(data.substitutions);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error('Failed to fetch substitutions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateFrom, dateTo]);

    const exportCSV = () => {
        const headers = ['Data', 'Godzina', 'Grupa', 'Sala', 'Nieobecny trener', 'Zastępujący'];
        const rows = substitutions.map(s => [
            format(new Date(s.date), 'dd.MM.yyyy'),
            `${s.startTime}-${s.endTime}`,
            s.group,
            s.room,
            s.originalTrainer,
            s.substituteTrainer
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zastepstwa_${dateFrom}_${dateTo}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-slate-700">Od:</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <label className="text-sm font-medium text-slate-700">Do:</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        min={dateFrom}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <button
                    onClick={exportCSV}
                    disabled={substitutions.length === 0}
                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                    📥 Eksport CSV
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 rounded-xl p-4">
                        <div className="text-3xl font-bold text-indigo-600">{summary.total}</div>
                        <div className="text-sm text-indigo-700">Łączna liczba zastępstw</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <div className="text-lg font-semibold text-amber-700 mb-2">Najwięcej nieobecności</div>
                        {Object.entries(summary.byOriginal).slice(0, 3).map(([name, count]) => (
                            <div key={name} className="flex justify-between text-sm">
                                <span>{name}</span>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                        {Object.keys(summary.byOriginal).length === 0 && (
                            <div className="text-sm text-amber-600">Brak danych</div>
                        )}
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="text-lg font-semibold text-green-700 mb-2">Najwięcej zastępstw</div>
                        {Object.entries(summary.bySubstitute).slice(0, 3).map(([name, count]) => (
                            <div key={name} className="flex justify-between text-sm">
                                <span>{name}</span>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                        {Object.keys(summary.bySubstitute).length === 0 && (
                            <div className="text-sm text-green-600">Brak danych</div>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <span className="text-slate-400">Ładowanie...</span>
                </div>
            ) : substitutions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="text-lg font-medium text-slate-900">Brak zastępstw</h3>
                    <p className="text-slate-500">W wybranym okresie nie było zastępstw</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Godzina</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Grupa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nieobecny</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zastępujący</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {substitutions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">
                                        {format(new Date(sub.date), 'dd.MM.yyyy', { locale: pl })}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {sub.startTime} - {sub.endTime}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium">{sub.group}</td>
                                    <td className="px-4 py-3 text-sm text-red-600">{sub.originalTrainer}</td>
                                    <td className="px-4 py-3 text-sm text-green-600">{sub.substituteTrainer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
