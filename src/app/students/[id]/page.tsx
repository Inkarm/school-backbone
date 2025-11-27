'use client';

import { useState, useEffect, use } from 'react';
import EditStudentModal from '@/components/EditStudentModal';
import AssignGroupModal from '@/components/AssignGroupModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import { Student } from '@/types';

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

interface AttendanceData {
    stats: {
        totalClasses: number;
        presentCount: number;
        absentCount: number;
        attendancePercentage: number;
    };
    history: AttendanceRecord[];
}

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [student, setStudent] = useState<Student | null>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [studentRes, attendanceRes] = await Promise.all([
                fetch(`/api/students/${id}`),
                fetch(`/api/students/${id}/attendance`)
            ]);

            if (!studentRes.ok) throw new Error('Failed to fetch student');

            const studentData = await studentRes.json();
            setStudent(studentData);

            if (attendanceRes.ok) {
                const attData = await attendanceRes.json();
                setAttendanceData(attData);
            }

            setError('');
        } catch (err) {
            setError('Nie udało się załadować danych ucznia');
            console.error(err);
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

    if (error || !student) {
        return (
            <div className="clean-card p-6 text-center">
                <p className="text-red-600">{error || 'Nie znaleziono ucznia'}</p>
                <button onClick={fetchAllData} className="btn-primary mt-4">
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    // Check payment status (paid in current month)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const lastPayment = student.payments?.[0];
    const isPaid = lastPayment && new Date(lastPayment.paymentDate).toISOString().slice(0, 7) === currentMonth;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        {student.firstName} {student.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                student.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                            }`}>
                            {student.status === 'ACTIVE' ? 'Aktywny' :
                                student.status === 'SUSPENDED' ? 'Zawieszony' : 'Archiwum'}
                        </span>
                        <p className="text-slate-500 text-sm">Karta ucznia</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        className="btn-secondary"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edytuj
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setIsPaymentModalOpen(true)}
                    >
                        Dodaj Wpłatę
                    </button>
                </div>
            </div>

            {/* Attendance Stats Cards */}
            {attendanceData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Obecność</div>
                        <div className="text-2xl font-bold text-indigo-600">{attendanceData.stats.attendancePercentage}%</div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${attendanceData.stats.attendancePercentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Wszystkie zajęcia</div>
                        <div className="text-2xl font-bold text-slate-900">{attendanceData.stats.totalClasses}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Obecny(a)</div>
                        <div className="text-2xl font-bold text-green-600">{attendanceData.stats.presentCount}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-sm text-slate-500 mb-1">Nieobecny(a)</div>
                        <div className="text-2xl font-bold text-red-500">{attendanceData.stats.absentCount}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="clean-card p-6 space-y-6">
                    <h3 className="text-lg font-semibold border-b border-gray-100 pb-4 text-slate-900">Dane Osobowe</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Data Urodzenia</label>
                            <p className="font-medium text-slate-900">
                                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('pl-PL') : 'Brak'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Opiekun</label>
                            <p className="font-medium text-slate-900">{student.parentName}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Telefon</label>
                            <p className="font-mono text-slate-900">{student.parentPhone}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Email</label>
                            <p className="font-medium text-slate-900">{student.parentEmail}</p>
                        </div>
                    </div>
                    {student.healthNotes && (
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Notatki o zdrowiu</label>
                            <div className="bg-amber-50 p-3 rounded-lg mt-1 text-sm text-amber-800 border border-amber-200 flex items-start gap-2">
                                <span>⚠</span> {student.healthNotes}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Status */}
                <div className="clean-card p-6 space-y-6">
                    <h3 className="text-lg font-semibold border-b border-gray-100 pb-4 text-slate-900">Finanse</h3>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-gray-200">
                        <div className={`w-3 h-3 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-lg font-medium text-slate-900">
                            {isPaid ? 'Opłacono bieżący miesiąc' : 'Brak wpłaty'}
                        </span>
                    </div>
                    {lastPayment && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-slate-50 border border-gray-200">
                                <span className="text-xs text-slate-500 block mb-1">Ostatnia wpłata</span>
                                <span className="font-mono text-slate-900">
                                    {new Date(lastPayment.paymentDate).toLocaleDateString('pl-PL')}
                                </span>
                            </div>
                            <div className="p-4 rounded-lg bg-slate-50 border border-gray-200">
                                <span className="text-xs text-slate-500 block mb-1">Kwota</span>
                                <span className="font-mono font-bold text-slate-900">{lastPayment.amount} PLN</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Groups Assignment */}
                <div className="clean-card p-6 space-y-6 md:col-span-2">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Przypisane Grupy</h3>
                        <button
                            className="btn-secondary text-xs"
                            onClick={() => setIsAssignGroupModalOpen(true)}
                        >
                            + Przypisz do grupy
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {!student.groups || student.groups.length === 0 ? (
                            <p className="text-slate-500 col-span-3">Uczeń nie jest przypisany do żadnej grupy</p>
                        ) : (
                            student.groups.map((group) => (
                                <div key={group.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-slate-50">
                                    <span className="font-medium text-slate-700">{group.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Attendance History */}
                {attendanceData && (
                    <div className="clean-card p-0 md:col-span-2 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Historia Obecności</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Godzina</th>
                                        <th className="px-6 py-3">Grupa</th>
                                        <th className="px-6 py-3">Trener</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {attendanceData.history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                Brak historii obecności
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceData.history.map((record) => (
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
                )}
            </div>

            <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    fetchAllData();
                    setIsEditModalOpen(false);
                }}
                student={student}
            />

            <AssignGroupModal
                isOpen={isAssignGroupModalOpen}
                onClose={() => setIsAssignGroupModalOpen(false)}
                onSuccess={() => {
                    fetchAllData();
                    setIsAssignGroupModalOpen(false);
                }}
                studentId={student.id}
            />

            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    fetchAllData();
                    setIsPaymentModalOpen(false);
                }}
                studentId={student.id}
            />
        </div>
    );
}
