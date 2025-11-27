'use client';

import { useState, useEffect } from 'react';
import DataExportButton from './DataExportButton';

interface MonthlyStats {
    totalClasses: number;
    totalPresentVolume: number;
    uniqueStudents: number;
    avgAttendance: number;
}

interface ReportEvent {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    groupName: string;
    trainerName: string;
    roomName: string;
    status: string;
    presentCount: number;
    totalCount: number;
    percentage: number;
    attendanceTaken: boolean;
}

export default function MonthlyReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [events, setEvents] = useState<ReportEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reports/monthly-summary?month=${selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Error fetching monthly report:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareExportData = () => {
        return events.map(e => ({
            Data: new Date(e.date).toLocaleDateString('pl-PL'),
            Godzina: `${e.startTime} - ${e.endTime}`,
            Grupa: e.groupName,
            Trener: e.trainerName,
            Sala: e.roomName,
            Status: e.status === 'CANCELLED' ? 'Odwołane' : 'Odbyte',
            Obecni: e.presentCount,
            Wszyscy: e.totalCount,
            Frekwencja: `${e.percentage}%`
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Raport Miesięczny</h3>
                    <p className="text-slate-500 text-sm">Podsumowanie zajęć i frekwencji</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="month"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <DataExportButton
                        data={prepareExportData()}
                        filename={`raport_miesieczny_${selectedDate}`}
                        label="Eksportuj do Excela"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie raportu...</div>
            ) : stats ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-medium text-slate-500 mb-2">Liczba Zajęć</h4>
                            <p className="text-3xl font-bold text-slate-900">{stats.totalClasses}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-medium text-slate-500 mb-2">Suma Obecności</h4>
                            <p className="text-3xl font-bold text-indigo-600">{stats.totalPresentVolume}</p>
                            <p className="text-xs text-slate-400 mt-1">osobowejść</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-medium text-slate-500 mb-2">Unikalni Uczniowie</h4>
                            <p className="text-3xl font-bold text-green-600">{stats.uniqueStudents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-sm font-medium text-slate-500 mb-2">Średnia Frekwencja</h4>
                            <p className="text-3xl font-bold text-amber-600">{stats.avgAttendance}%</p>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Szczegóły Zajęć</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Grupa</th>
                                        <th className="px-6 py-3">Trener</th>
                                        <th className="px-6 py-3">Sala</th>
                                        <th className="px-6 py-3 text-center">Obecność</th>
                                        <th className="px-6 py-3 text-center">Frekwencja</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {events.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                                Brak zajęć w wybranym miesiącu
                                            </td>
                                        </tr>
                                    ) : (
                                        events.map((event) => (
                                            <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">
                                                        {new Date(event.date).toLocaleDateString('pl-PL')}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {event.startTime} - {event.endTime}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {event.groupName}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {event.trainerName}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {event.roomName}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {event.status === 'CANCELLED' ? '-' : (
                                                        <span className="font-mono">
                                                            {event.presentCount} / {event.totalCount}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {event.status === 'CANCELLED' ? '-' : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-sm font-medium">{event.percentage}%</span>
                                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${event.percentage >= 80 ? 'bg-green-500' :
                                                                            event.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${event.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {event.status === 'CANCELLED' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Odwołane
                                                        </span>
                                                    ) : event.attendanceTaken ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Sprawdzone
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Planowane
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
