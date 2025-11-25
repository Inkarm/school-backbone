'use client';

import { useState } from 'react';
import AttendanceStats from '@/components/AttendanceStats';

interface GroupAttendanceStatsProps {
    groupId: number;
    groupName: string;
}

interface StudentAttendance {
    studentId: number;
    name: string;
    total: number;
    attended: number;
    attendanceRate: number;
}

interface GroupStats {
    groupId: number;
    totalEvents: number;
    overallAttendanceRate: number;
    students: StudentAttendance[];
}

export default function GroupAttendanceStats({ groupId, groupName }: GroupAttendanceStatsProps) {
    const [stats, setStats] = useState<GroupStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            let url = `/api/attendance/stats?groupId=${groupId}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setIsExpanded(true);
            }
        } catch (err) {
            console.error('Failed to fetch attendance stats', err);
            alert('Nie udało się pobrać statystyk obecności');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        let url = `/api/attendance/export?groupId=${groupId}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        window.open(url, '_blank');
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{groupName}</h4>
                {!isExpanded && (
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        {loading ? 'Ładowanie...' : 'Pokaż statystyki'}
                    </button>
                )}
            </div>

            {isExpanded && stats && (
                <div className="space-y-4">
                    {/* Date Filters */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="block text-xs text-slate-600 mb-1">Od</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-slate-600 mb-1">Do</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                            />
                        </div>
                        <button
                            onClick={fetchStats}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                            Filtruj
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            📥 Eksport CSV
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                            <p className="text-xs text-indigo-600 font-medium">Zajęcia</p>
                            <p className="text-2xl font-bold text-indigo-900">{stats.totalEvents}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-600 font-medium">Średnia frekwencja</p>
                            <p className="text-2xl font-bold text-green-900">{stats.overallAttendanceRate}%</p>
                        </div>
                    </div>

                    {/* Students Table */}
                    {stats.students.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-y border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Uczeń</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600">Zajęcia</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600">Obecności</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-600">Frekwencja</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.students.map((student) => (
                                        <tr key={student.studentId} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 text-slate-900">{student.name}</td>
                                            <td className="px-3 py-2 text-center text-slate-600">{student.total}</td>
                                            <td className="px-3 py-2 text-center text-slate-600">{student.attended}</td>
                                            <td className="px-3 py-2 text-right">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${student.attendanceRate >= 90 ? 'bg-green-100 text-green-700' :
                                                        student.attendanceRate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                                            student.attendanceRate >= 60 ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    {student.attendanceRate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-sm text-slate-500 hover:text-slate-700"
                    >
                        Zwiń ↑
                    </button>
                </div>
            )}
        </div>
    );
}
