'use client';

import { useState, useEffect } from 'react';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
}

interface AttendanceRecord {
    id: number;
    studentId: number;
    present: boolean;
    student: Student;
}

interface AttendanceMarkerProps {
    eventId: number;
    groupId: number;
    onSave?: () => void;
}

export default function AttendanceMarker({ eventId, groupId, onSave }: AttendanceMarkerProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<number, boolean>>({});
    const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [eventId, groupId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch group students
            const groupRes = await fetch(`/api/groups/${groupId}`);
            if (!groupRes.ok) throw new Error('Failed to fetch group');
            const groupData = await groupRes.json();
            setStudents(groupData.students || []);

            // Fetch existing attendance
            const attendanceRes = await fetch(`/api/attendance?eventId=${eventId}`);
            if (attendanceRes.ok) {
                const attendanceData: AttendanceRecord[] = await attendanceRes.json();
                setExistingAttendance(attendanceData);

                // Pre-fill attendance state
                const attendanceMap: Record<number, boolean> = {};
                attendanceData.forEach(record => {
                    attendanceMap[record.studentId] = record.present;
                });

                // Default all students to absent if no record exists
                groupData.students.forEach((student: Student) => {
                    if (!(student.id in attendanceMap)) {
                        attendanceMap[student.id] = false;
                    }
                });

                setAttendance(attendanceMap);
            } else {
                // Initialize all as absent
                const attendanceMap: Record<number, boolean> = {};
                groupData.students.forEach((student: Student) => {
                    attendanceMap[student.id] = false;
                });
                setAttendance(attendanceMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Nie udało się załadować danych');
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId: number) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    const markAllPresent = () => {
        const newAttendance: Record<number, boolean> = {};
        students.forEach(student => {
            newAttendance[student.id] = true;
        });
        setAttendance(newAttendance);
    };

    const markAllAbsent = () => {
        const newAttendance: Record<number, boolean> = {};
        students.forEach(student => {
            newAttendance[student.id] = false;
        });
        setAttendance(newAttendance);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const attendanceArray = Object.entries(attendance).map(([studentId, present]) => ({
                studentId: parseInt(studentId),
                present,
            }));

            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    attendance: attendanceArray,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save attendance');
            }

            alert('Obecność zapisana pomyślnie!');
            onSave?.();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert(error instanceof Error ? error.message : 'Nie udało się zapisać obecności');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Ładowanie listy uczniów...</div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <span className="text-4xl block mb-2">👥</span>
                <p className="text-slate-600 font-medium">Brak uczniów w tej grupie</p>
            </div>
        );
    }

    const presentCount = Object.values(attendance).filter(p => p).length;
    const totalCount = students.length;

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-indigo-600 font-medium">Obecni</p>
                        <p className="text-2xl font-bold text-indigo-900">
                            {presentCount} / {totalCount}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-indigo-600 font-medium">Frekwencja</p>
                        <p className="text-2xl font-bold text-indigo-900">
                            {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
                <button
                    onClick={markAllPresent}
                    className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm border border-green-200"
                    disabled={saving}
                >
                    ✓ Wszyscy obecni
                </button>
                <button
                    onClick={markAllAbsent}
                    className="flex-1 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm border border-slate-200"
                    disabled={saving}
                >
                    ✗ Wszyscy nieobecni
                </button>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                {students.map(student => (
                    <label
                        key={student.id}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <input
                            type="checkbox"
                            checked={attendance[student.id] || false}
                            onChange={() => toggleAttendance(student.id)}
                            className="w-6 h-6 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            disabled={saving}
                        />
                        <div className="flex-1">
                            <p className="font-medium text-slate-900">
                                {student.firstName} {student.lastName}
                            </p>
                        </div>
                        <div>
                            {attendance[student.id] ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                                    Obecny
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                    Nieobecny
                                </span>
                            )}
                        </div>
                    </label>
                ))}
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? 'Zapisywanie...' : 'Zapisz obecność'}
            </button>
        </div>
    );
}
