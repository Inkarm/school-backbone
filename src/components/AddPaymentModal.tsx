'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Student } from '@/types';

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    studentId?: number; // Optional: pre-select student
    initialAmount?: number;
    initialMonth?: string;
}

export default function AddPaymentModal({ isOpen, onClose, onSuccess, studentId, initialAmount, initialMonth }: AddPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [monthlyFee, setMonthlyFee] = useState(0);
    const [allocation, setAllocation] = useState<any[]>([]);
    const [existingPayments, setExistingPayments] = useState<Record<string, number>>({});
    const [rawPayments, setRawPayments] = useState<any[]>([]);
    const [showHistoryDetails, setShowHistoryDetails] = useState(false);

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
            setFormData(prev => ({
                ...prev,
                studentId: studentId ? studentId.toString() : '',
                amount: initialAmount ? initialAmount.toString() : '',
                monthYear: initialMonth || new Date().toISOString().slice(0, 7)
            }));
            setShowHistoryDetails(false);
        }
    }, [isOpen, studentId, initialAmount, initialMonth]);

    // Update monthly fee and fetch payments when student changes
    useEffect(() => {
        if (formData.studentId && students.length > 0) {
            const student = students.find(s => s.id === parseInt(formData.studentId));
            if (student && student.groups) {
                const totalFee = student.groups.reduce((sum, g) => sum + (g.monthlyFee || 0), 0);
                setMonthlyFee(totalFee);
            }
            fetchStudentPayments(formData.studentId);
        }
    }, [formData.studentId, students]);

    const fetchStudentPayments = async (id: string) => {
        try {
            const res = await fetch(`/api/payments?studentId=${id}`);
            if (res.ok) {
                const payments = await res.json();
                setRawPayments(payments);
                // Group by monthYear
                const map: Record<string, number> = {};
                payments.forEach((p: any) => {
                    map[p.monthYear] = (map[p.monthYear] || 0) + p.amount;
                });
                setExistingPayments(map);
            }
        } catch (err) {
            console.error('Failed to fetch payments', err);
        }
    };

    // Calculate allocation when amount or fee changes
    useEffect(() => {
        if (!formData.amount || !monthlyFee) {
            setAllocation([]);
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) return;

        const newAllocation = [];
        let remaining = amount;
        let currentMonth = new Date(`${formData.monthYear}-01`);

        // Safety break to prevent infinite loops
        let iterations = 0;

        while (remaining > 0 && iterations < 24) {
            iterations++;
            const monthStr = currentMonth.toISOString().slice(0, 7);
            const alreadyPaid = existingPayments[monthStr] || 0;

            const neededForMonth = Math.max(0, monthlyFee - alreadyPaid);

            let allocatedAmount = 0;

            if (neededForMonth > 0) {
                allocatedAmount = Math.min(remaining, neededForMonth);
            } else {
                // Month is fully paid. Skip to next month.
                allocatedAmount = 0;
            }

            // If we allocated something, add it to list
            if (allocatedAmount > 0) {
                newAllocation.push({
                    monthYear: monthStr,
                    amount: allocatedAmount,
                    status: (alreadyPaid + allocatedAmount) >= monthlyFee ? 'Opłacony' : 'Częściowo',
                    isFull: (alreadyPaid + allocatedAmount) >= monthlyFee,
                    alreadyPaid
                });
                remaining -= allocatedAmount;
            }

            // Move to next month
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        // If we still have remaining amount after checking 24 months, 
        // add it to the last allocated month (overpayment) or the first month
        if (remaining > 0) {
            if (newAllocation.length > 0) {
                const last = newAllocation[newAllocation.length - 1];
                last.amount += remaining;
                last.status = 'Nadpłata'; // Overpayment
                last.isFull = true;
            } else {
                // Nothing was allocated (e.g. all next 24 months are paid)
                // Just put it in the selected month
                const m = formData.monthYear;
                newAllocation.push({
                    monthYear: m,
                    amount: remaining,
                    status: 'Nadpłata',
                    isFull: true,
                    alreadyPaid: existingPayments[m] || 0
                });
            }
        }

        setAllocation(newAllocation);

    }, [formData.amount, formData.monthYear, monthlyFee, existingPayments]);

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
            let body;

            // If we have a smart allocation, send it as an array
            if (allocation.length > 0) {
                body = allocation.map(item => ({
                    studentId: parseInt(formData.studentId),
                    amount: item.amount,
                    monthYear: item.monthYear,
                    paymentDate: new Date(formData.paymentDate).toISOString(),
                    method: formData.method,
                }));
            } else {
                // Fallback to single payment
                body = {
                    studentId: parseInt(formData.studentId),
                    amount: parseFloat(formData.amount),
                    monthYear: formData.monthYear,
                    paymentDate: new Date(formData.paymentDate).toISOString(),
                    method: formData.method,
                };
            }

            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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
            setAllocation([]);
            setExistingPayments({});
            setRawPayments([]);
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
                    {monthlyFee > 0 && (
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                            Miesięczna opłata: {monthlyFee} PLN
                        </p>
                    )}
                </div>

                {/* Payment History Preview */}
                {monthlyFee > 0 && Object.keys(existingPayments).length > 0 && (
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-indigo-900">Status płatności ucznia:</p>
                            <button
                                type="button"
                                onClick={() => setShowHistoryDetails(!showHistoryDetails)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                            >
                                {showHistoryDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {Object.entries(existingPayments)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .slice(-6) // Show last 6 active months
                                .map(([month, amount]) => {
                                    const isPaid = amount >= monthlyFee;
                                    return (
                                        <div key={month} className={`px-2 py-1 rounded text-xs border ${isPaid
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            <span className="font-bold block">{month}</span>
                                            <span>{amount} / {monthlyFee}</span>
                                        </div>
                                    );
                                })}
                        </div>

                        {showHistoryDetails && (
                            <div className="mt-3 pt-3 border-t border-indigo-200 max-h-40 overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-indigo-800 font-medium">
                                        <tr>
                                            <th className="pb-1">Data</th>
                                            <th className="pb-1">Za miesiąc</th>
                                            <th className="pb-1 text-right">Kwota</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-indigo-700">
                                        {rawPayments
                                            .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                                            .map((p) => (
                                                <tr key={p.id} className="border-b border-indigo-100 last:border-0">
                                                    <td className="py-1">{new Date(p.paymentDate).toLocaleDateString('pl-PL')}</td>
                                                    <td className="py-1">{p.monthYear}</td>
                                                    <td className="py-1 text-right font-mono">{p.amount}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Od miesiąca</label>
                        <input
                            type="month"
                            value={formData.monthYear}
                            onChange={e => setFormData({ ...formData, monthYear: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                {/* Smart Allocation Preview */}
                {allocation.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                        <p className="font-medium text-slate-700 mb-2">Rozliczenie wpłaty:</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {allocation.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-slate-600">
                                    <span>{item.monthYear}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">{item.amount.toFixed(2)} PLN</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${item.isFull ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
