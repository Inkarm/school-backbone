'use client';

import { useState, useEffect } from 'react';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Student {
    id: number;
    firstName: string;
    lastName: string;
}

export default function AddPaymentModal({ isOpen, onClose, onSuccess }: AddPaymentModalProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'Gotówka',
        monthYear: new Date().toISOString().slice(0, 7),
    });

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/students');
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create payment');

            // Reset form
            setFormData({
                studentId: '',
                amount: '',
                paymentDate: new Date().toISOString().split('T')[0],
                method: 'Gotówka',
                monthYear: new Date().toISOString().slice(0, 7),
            });

            onSuccess?.();
        } catch (err) {
            console.error('Error creating payment:', err);
            alert('Nie udało się dodać wpłaty');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Dodaj Wpłatę</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Uczeń</label>
                        <select
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
                        >
                            <option value="">Wybierz ucznia...</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.firstName} {student.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kwota (PLN)</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                        <input
                            type="date"
                            value={formData.paymentDate}
                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Metoda</label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                        >
                            <option>Gotówka</option>
                            <option>Przelew</option>
                            <option>Karta</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Miesiąc</label>
                        <input
                            type="month"
                            value={formData.monthYear}
                            onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                        />
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
            </div>
        </div>
    );
}
