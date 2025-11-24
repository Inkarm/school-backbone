'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentAttendance {
    id: number;
    firstName: string;
    lastName: string;
    status: string | null; // 'present', 'absent', or null
}

interface EventDetails {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    groupName: string;
}

export default function AttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
    const router = useRouter();
    const { eventId } = use(params);

    const [event, setEvent] = useState<EventDetails | null>(null);
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/attendance/${eventId}`);
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setEvent(data.event);

            // Initialize status to 'present' if null, or keep existing
            // Actually, let's keep null to show "Not checked" state if we want, 
            // but for speed, defaulting to 'present' is often better UX for small classes.
            // Let's stick to what comes from DB. If null, we can display as "Unknown" or default to something.
            // Let's default null to 'present' in the UI state for easier checking.
            const initializedStudents = data.students.map((s: StudentAttendance) => ({
                ...s,
                status: s.status || 'present' // Default to present
            }));
            setStudents(initializedStudents);
        } catch (e) {
            console.error(e);
            alert('Błąd pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, status: s.status === 'present' ? 'absent' : 'present' };
            }
            return s;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    attendance: students.map(s => ({
                        studentId: s.id,
                        status: s.status
                    }))
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            // Go back to schedule or show success
            router.push('/schedule');
        } catch (e) {
            console.error(e);
            alert('Błąd zapisywania obecności');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-12">Ładowanie...</div>;
    if (!event) return <div className="text-center py-12">Nie znaleziono zajęć</div>;

    const presentCount = students.filter(s => s.status === 'present').length;
    const totalCount = students.length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/schedule" className="text-slate-500 hover:text-slate-900">
                    ← Wróć do grafiku
                </Link>
            </div>

            <div className="clean-card p-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">{event.groupName}</h1>
                    <p className="text-slate-500">
                        {new Date(event.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {' • '}
                        {event.startTime} - {event.endTime}
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-lg">Lista Obecności</h2>
                    <div className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        Obecni: {presentCount} / {totalCount}
                    </div>
                </div>

                <div className="space-y-2">
                    {students.map(student => (
                        <div
                            key={student.id}
                            onClick={() => toggleStatus(student.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${student.status === 'present'
                                    ? 'bg-white border-gray-200 hover:border-indigo-300'
                                    : 'bg-red-50 border-red-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${student.status === 'present'
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-red-100 text-red-600'
                                    }`}>
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <span className={`font-medium ${student.status === 'absent' ? 'text-slate-500' : 'text-slate-900'}`}>
                                    {student.firstName} {student.lastName}
                                </span>
                            </div>

                            <div className={`px-3 py-1 rounded text-sm font-medium ${student.status === 'present'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {student.status === 'present' ? 'Obecny' : 'Nieobecny'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary w-full py-3 text-lg"
                    >
                        {saving ? 'Zapisywanie...' : 'Zapisz Obecność'}
                    </button>
                </div>
            </div>
        </div>
    );
}
