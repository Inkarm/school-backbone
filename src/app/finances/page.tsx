'use client';

import { useState, useEffect } from 'react';
import AddPaymentModal from '@/components/AddPaymentModal';
import Link from 'next/link';

interface Payment {
    id: number;
    amount: number;
    paymentDate: string;
    method: string;
    student: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export default function FinancesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/payments');
            if (!response.ok) throw new Error('Failed to fetch payments');

            const data = await response.json();
            setPayments(data);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentAdded = () => {
        setIsModalOpen(false);
        fetchPayments(); // Refresh the list
    };

    // Calculate summaries
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = payments
        .filter(p => p.paymentDate.startsWith(currentMonth))
        .reduce((sum, p) => sum + p.amount, 0);

    const recentPayments = payments.slice(0, 10);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Ładowanie...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Finanse</h2>
                    <p className="text-slate-500">Rejestr wpłat i rozliczenia.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/finances/reports" className="btn-secondary flex items-center">
                        📊 Raporty
                    </Link>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        + Dodaj Wpłatę
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="clean-card p-6">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                        Przychód ({new Date().toLocaleDateString('pl-PL', { month: 'long' })})
                    </h3>
                    <p className="text-3xl font-bold text-emerald-600">{monthlyRevenue.toLocaleString('pl-PL')} PLN</p>
                </div>
                <div className="clean-card p-6">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Wszystkie wpłaty</h3>
                    <p className="text-3xl font-bold text-slate-900">{payments.length}</p>
                </div>
                <div className="clean-card p-6">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Średnia wpłata</h3>
                    <p className="text-3xl font-bold text-slate-900">
                        {payments.length > 0
                            ? Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length)
                            : 0} PLN
                    </p>
                </div>
            </div>

            <div className="clean-card p-6">
                <h3 className="text-lg font-bold mb-6 tracking-tight text-slate-900">Ostatnie Wpłaty</h3>
                {recentPayments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Brak wpłat do wyświetlenia</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-medium">Data</th>
                                    <th className="p-4 font-medium">Uczeń</th>
                                    <th className="p-4 font-medium">Kwota</th>
                                    <th className="p-4 font-medium">Metoda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-slate-500">
                                            {new Date(payment.paymentDate).toLocaleDateString('pl-PL')}
                                        </td>
                                        <td className="p-4 font-medium text-slate-900">
                                            {payment.student.firstName} {payment.student.lastName}
                                        </td>
                                        <td className="p-4 font-bold text-emerald-600">{payment.amount} PLN</td>
                                        <td className="p-4 text-sm text-slate-500">{payment.method}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handlePaymentAdded}
            />
        </div>
    );
}
