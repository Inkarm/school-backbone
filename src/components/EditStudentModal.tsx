'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Student } from '@/types';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    student: Student | null;
}

export default function EditStudentModal({ isOpen, onClose, onSuccess, student }: EditStudentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        healthNotes: '',
    });

    const [activeTab, setActiveTab] = useState<'details' | 'payments'>('details');
    const [payments, setPayments] = useState<any[]>([]);

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.firstName,
                lastName: student.lastName,
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                parentEmail: student.parentEmail || '',
                healthNotes: student.healthNotes || '',
            });
            setActiveTab('details');
            if (isOpen) {
                fetchPayments();
            }
        }
    }, [student, isOpen]);

    const fetchPayments = async () => {
        if (!student) return;
        try {
            const res = await fetch(`/api/payments?studentId=${student.id}`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (err) {
            console.error('Failed to fetch payments', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update student');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się zaktualizować danych ucznia');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edytuj Ucznia">
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('details')}
                >
                    Dane Ucznia
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'payments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setActiveTab('payments')}
                >
                    Historia Płatności
                </button>
            </div>

            {activeTab === 'details' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data Urodzenia</label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Dane Opiekuna</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imię i Nazwisko</label>
                                <input
                                    type="text"
                                    value={formData.parentName}
                                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.parentPhone}
                                        onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Uwagi zdrowotne</label>
                        <textarea
                            value={formData.healthNotes}
                            onChange={e => setFormData({ ...formData, healthNotes: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                            Anuluj
                        </button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2">Data Wpłaty</th>
                                    <th className="px-4 py-2">Miesiąc</th>
                                    <th className="px-4 py-2">Kwota</th>
                                    <th className="px-4 py-2">Metoda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-slate-500">Brak historii płatności</td>
                                    </tr>
                                ) : (
                                    payments
                                        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                                        .map((payment) => (
                                            <tr key={payment.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2">{new Date(payment.paymentDate).toLocaleDateString('pl-PL')}</td>
                                                <td className="px-4 py-2 font-medium">{payment.monthYear}</td>
                                                <td className="px-4 py-2 font-mono text-indigo-600">{payment.amount.toFixed(2)} PLN</td>
                                                <td className="px-4 py-2 text-slate-500">
                                                    {payment.method === 'transfer' ? 'Przelew' :
                                                        payment.method === 'cash' ? 'Gotówka' : 'Karta'}
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    );
}
