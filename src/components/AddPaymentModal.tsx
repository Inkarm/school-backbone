'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Student } from '@/types';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    studentId?: number; // Optional: pre-select student
}

export default function AddPaymentModal({ isOpen, onClose, onSuccess, studentId }: AddPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM
        paymentDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        method: 'transfer',
    });

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            if (studentId) {
                setFormData(prev => ({ ...prev, studentId: studentId.toString() }));
            }
        }
    }, [isOpen, studentId]);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students');
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: parseInt(formData.studentId),
                    amount: parseFloat(formData.amount),
                    monthYear: formData.monthYear,
                    paymentDate: new Date(formData.paymentDate).toISOString(),
                    method: formData.method,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add payment');
            }

            onSuccess?.();
            onClose();
            // Reset form
            setFormData({
                studentId: '',
                amount: '',
                monthYear: new Date().toISOString().slice(0, 7),
                paymentDate: new Date().toISOString().slice(0, 10),
                method: 'transfer',
            });
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Nie udało się dodać płatności');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Wpłatę">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Uczeń</label>
                    <select
                        value={formData.studentId}
                        onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        required
                        disabled={!!studentId}
                    >
                        <option value="">Wybierz ucznia</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kwota (PLN)</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Za miesiąc</label>
                        <input
                            type="month"
                            value={formData.monthYear}
                            onChange={e => setFormData({ ...formData, monthYear: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data wpłaty</label>
                        <input
                            type="date"
                            value={formData.paymentDate}
                            onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Metoda</label>
                        <select
                            value={formData.method}
                            onChange={e => setFormData({ ...formData, method: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="transfer">Przelew</option>
                            <option value="cash">Gotówka</option>
                            <option value="card">Karta</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Dodawanie...' : 'Dodaj Wpłatę'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
