'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';

interface AttendanceRecord {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    groupName: string;
    trainerName: string;
    present: boolean;
    status: string;
}

interface StudentData {
    student: {
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        groups: { id: number; name: string }[];
    };
    stats: {
        totalClasses: number;
        presentCount: number;
        absentCount: number;
        attendancePercentage: number;
    };
    history: AttendanceRecord[];
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/students/${id}/attendance`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    console.error('Failed to fetch student data');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </MainLayout>
        );
    }

    if (!data) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-slate-900">Nie znaleziono ucznia</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-indigo-600 hover:text-indigo-800"
                    >
                        Wróć do listy
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {data.student.firstName} {data.student.lastName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${data.student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        data.student.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                    }`}>
                                    {data.student.status === 'ACTIVE' ? 'Aktywny' :
                                        data.student.status === 'SUSPENDED' ? 'Zawieszony' : 'Archiwum'}
                                </span>
                                <span className="text-sm text-slate-500">
                                    Grupy: {data.student.groups.map(g => g.name).join(', ') || 'Brak'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Obecność</div>
                        <div className="text-2xl font-bold text-indigo-600">{data.stats.attendancePercentage}%</div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${data.stats.attendancePercentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Wszystkie zajęcia</div>
                        <div className="text-2xl font-bold text-slate-900">{data.stats.totalClasses}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Obecny(a)</div>
                        <div className="text-2xl font-bold text-green-600">{data.stats.presentCount}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Nieobecny(a)</div>
                        <div className="text-2xl font-bold text-red-500">{data.stats.absentCount}</div>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-900">Historia Obecności</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Godzina</th>
                                    <th className="px-6 py-3">Grupa</th>
                                    <th className="px-6 py-3">Trener</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Brak historii obecności
                                        </td>
                                    </tr>
                                ) : (
                                    data.history.map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {new Date(record.date).toLocaleDateString('pl-PL')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {record.startTime} - {record.endTime}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {record.groupName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {record.trainerName}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.status === 'CANCELLED' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Odwołane
                                                    </span>
                                                ) : record.present ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Obecny
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Nieobecny
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
            </div>
        </MainLayout>
    );
}
