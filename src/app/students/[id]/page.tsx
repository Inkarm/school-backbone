'use client';

import { useState, useEffect, use } from 'react';
import EditStudentModal from '@/components/EditStudentModal';
import AssignGroupModal from '@/components/AssignGroupModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import { Student } from '@/types';

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/students/${id}`);
            if (!response.ok) throw new Error('Failed to fetch student');

            const data = await response.json();
            setStudent(data);
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
                <button onClick={fetchStudent} className="btn-primary mt-4">
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-slate-500">Karta ucznia</p>
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
            </div>

            <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    fetchStudent();
                    setIsEditModalOpen(false);
                }}
                student={student}
            />

            <AssignGroupModal
                isOpen={isAssignGroupModalOpen}
                onClose={() => setIsAssignGroupModalOpen(false)}
                onSuccess={() => {
                    fetchStudent();
                    setIsAssignGroupModalOpen(false);
                }}
                studentId={student.id}
            />

            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    fetchStudent();
                    setIsPaymentModalOpen(false);
                }}
                studentId={student.id}
            />
        </div>
    );
}
