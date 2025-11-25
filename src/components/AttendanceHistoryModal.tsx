'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { formatAttendanceRate, getAttendanceColor, getAttendanceLabel } from '@/lib/attendanceHelpers';

interface AttendanceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: number;
    studentName: string;
}

interface AttendanceRecord {
    id: number;
    present: boolean;
    event: {
        date: Date;
        startTime: string;
        group: {
            name: string;
        };
    };
}

interface AttendanceStats {
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
    monthly: Array<{
        month: string;
        total: number;
        attended: number;
        percentage: number;
    }>;
    recentAttendance: Array<{
        date: Date;
        startTime: string;
        groupName: string;
        present: boolean;
    }>;
}

export default function AttendanceHistoryModal({ isOpen, onClose, studentId, studentName }: AttendanceHistoryModalProps) {
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAttendanceHistory();
        }
    }, [isOpen, studentId, startDate, endDate]);

    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            let url = `/api/attendance/stats?studentId=${studentId}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch attendance');

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching attendance history:', error);
            alert('Nie udało się załadować historii obecności');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const rateColor = stats ? getAttendanceColor(stats.attendanceRate) : 'gray';
    const rateLabel = stats ? getAttendanceLabel(stats.attendanceRate) : '';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Historia obecności - ${studentName}`}
        >
            <div className="space-y-4">
                {/* Date Filters */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Filtruj po dacie</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Od</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-600 mb-1">Do</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={clearFilters}
                            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Wyczyść filtry
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-slate-500">Ładowanie...</div>
                    </div>
                ) : stats ? (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-medium mb-1">Zajęcia</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.totalClasses}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <p className="text-xs text-green-600 font-medium mb-1">Obecności</p>
                                <p className="text-2xl font-bold text-green-900">{stats.attendedClasses}</p>
                            </div>
                            <div className={`bg-${rateColor}-50 rounded-lg p-4 border border-${rateColor}-100`}>
                                <p className={`text-xs text-${rateColor}-600 font-medium mb-1`}>Frekwencja</p>
                                <p className={`text-2xl font-bold text-${rateColor}-900`}>
                                    {stats.attendanceRate}%
                                </p>
                                <p className={`text-xs text-${rateColor}-600 mt-1`}>{rateLabel}</p>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        {stats.monthly && stats.monthly.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Rozkład miesięczny</h4>
                                <div className="space-y-2">
                                    {stats.monthly.map((month) => (
                                        <div key={month.month} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(month.month + '-01').toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {month.attended} / {month.total} zajęć
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    {month.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Attendance */}
                        {stats.recentAttendance && stats.recentAttendance.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Ostatnie zajęcia (10)</h4>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Data</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Godzina</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Grupa</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats.recentAttendance.map((record, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm text-slate-900">
                                                        {new Date(record.date).toLocaleDateString('pl-PL')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-900">{record.startTime}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-900">{record.groupName}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {record.present ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                                                                ✓ Obecny
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200">
                                                                ✗ Nieobecny
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {stats.totalClasses === 0 && (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                <span className="text-4xl block mb-2">📅</span>
                                <p className="text-slate-600 font-medium">Brak danych o obecności</p>
                                <p className="text-sm text-slate-500 mt-1">Uczeń nie ma jeszcze zapisanej obecności</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <p>Nie udało się załadować danych</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="btn-secondary">
                        Zamknij
                    </button>
                </div>
            </div>
        </Modal>
    );
}
