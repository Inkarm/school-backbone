'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import { Invoice } from '@/types';

export default function FinancesPage() {
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

    // Invoices State
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Payments State
    const [payments, setPayments] = useState<any[]>([]); // For global history
    const [groupSummary, setGroupSummary] = useState<any>(null); // For group view
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Add Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | undefined>(undefined);
    const [initialPaymentMonth, setInitialPaymentMonth] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchInvoices();
        fetchGroups();
    }, []);

    useEffect(() => {
        if (activeTab === 'payments') {
            if (selectedGroupId) {
                fetchGroupSummary();
            } else {
                fetchPayments();
            }
        }
    }, [activeTab, selectedGroupId, selectedMonth]);

    const fetchInvoices = async () => {
        try {
            setInvoicesLoading(true);
            const res = await fetch('/api/invoices');
            if (res.ok) setInvoices(await res.json());
        } catch (err) { console.error(err); }
        finally { setInvoicesLoading(false); }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) setGroups(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchPayments = async () => {
        try {
            setPaymentsLoading(true);
            setGroupSummary(null);

            const startDate = new Date(`${selectedMonth}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            const url = `/api/payments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

            const res = await fetch(url);
            if (res.ok) setPayments(await res.json());
        } catch (err) { console.error(err); }
        finally { setPaymentsLoading(false); }
    };

    const fetchGroupSummary = async () => {
        try {
            setPaymentsLoading(true);
            setPayments([]);

            const res = await fetch(`/api/finances/group-summary?groupId=${selectedGroupId}&month=${selectedMonth}`);
            if (res.ok) setGroupSummary(await res.json());
        } catch (err) { console.error(err); }
        finally { setPaymentsLoading(false); }
    };

    const handleAddPayment = (studentId: number, amount?: number, month?: string) => {
        setSelectedStudentId(studentId);
        setInitialPaymentAmount(amount);
        setInitialPaymentMonth(month);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        if (selectedGroupId) fetchGroupSummary();
        else fetchPayments();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-100 text-emerald-800';
            case 'PARTIAL': return 'bg-amber-100 text-amber-800';
            case 'UNPAID': return 'bg-red-100 text-red-800';
            case 'ISSUED': return 'bg-blue-100 text-blue-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID': return 'Opłacone';
            case 'PARTIAL': return 'Częściowo';
            case 'UNPAID': return 'Brak wpłaty';
            case 'ISSUED': return 'Wystawiona';
            case 'DRAFT': return 'Szkic';
            case 'CANCELLED': return 'Anulowana';
            default: return status;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Finanse</h2>
                    <p className="text-slate-500">Faktury i płatności</p>
                </div>
                {activeTab === 'invoices' && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        + Wystaw Fakturę
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoices'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                            }`}
                    >
                        Faktury
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'
                            }`}
                    >
                        Płatności i Zaległości
                    </button>
                </nav>
            </div>

            {activeTab === 'invoices' ? (
                /* Invoices View */
                <div className="clean-card overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900">Ostatnie Faktury</h3>
                    </div>

                    {invoicesLoading ? (
                        <div className="p-12 text-center text-slate-500">Ładowanie...</div>
                    ) : invoices.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">Brak wystawionych faktur.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Numer</th>
                                        <th className="px-6 py-3 font-medium">Data</th>
                                        <th className="px-6 py-3 font-medium">Uczeń</th>
                                        <th className="px-6 py-3 font-medium">Kwota</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{invoice.number}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(invoice.issueDate).toLocaleDateString('pl-PL')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {invoice.student ? `${invoice.student.firstName} ${invoice.student.lastName}` : 'Usunięty uczeń'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-900">
                                                {invoice.amount.toFixed(2)} PLN
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                    {getStatusLabel(invoice.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/finances/invoices/${invoice.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Podgląd
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Payments View */
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz Grupę (Wymagane dla podsumowania)</label>
                            <select
                                value={selectedGroupId}
                                onChange={e => setSelectedGroupId(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            >
                                <option value="">-- Wybierz grupę --</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Miesiąc</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="clean-card overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {selectedGroupId ? `Podsumowanie: ${groupSummary?.groupName || 'Ładowanie...'}` : 'Historia Wpłat (Wybierz grupę aby zobaczyć listę uczniów)'}
                                </h3>
                                {selectedGroupId && groupSummary?.monthlyFee > 0 && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        Miesięczna opłata: <span className="font-medium text-slate-900">{groupSummary.monthlyFee} PLN</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {paymentsLoading ? (
                            <div className="p-12 text-center text-slate-500">Ładowanie...</div>
                        ) : selectedGroupId && groupSummary ? (
                            /* Group Summary Table */
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Uczeń</th>
                                            <th className="px-6 py-3 font-medium">Status</th>
                                            <th className="px-6 py-3 font-medium">Wpłacono</th>
                                            <th className="px-6 py-3 font-medium">Ostatnia wpłata</th>
                                            <th className="px-6 py-3 font-medium text-right">Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupSummary.summary.map((item: any) => (
                                            <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{item.student.firstName} {item.student.lastName}</div>
                                                    <div className="text-xs text-slate-500">{item.student.parentName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                                    {item.totalPaid.toFixed(2)} PLN
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {item.payments.length > 0
                                                        ? new Date(item.payments[0].paymentDate).toLocaleDateString('pl-PL')
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    {item.status !== 'PAID' && (
                                                        <button
                                                            onClick={() => handleAddPayment(
                                                                item.student.id,
                                                                item.monthlyFee ? (item.monthlyFee - item.totalPaid) : undefined,
                                                                selectedMonth
                                                            )}
                                                            className="text-xs py-1 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium transition-colors"
                                                        >
                                                            Oznacz jako opłacone
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleAddPayment(item.student.id)}
                                                        className="btn-secondary text-xs py-1 px-3"
                                                    >
                                                        + Wpłata
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Fallback / Empty State */
                            <div className="p-12 text-center text-slate-500">
                                {selectedGroupId ? 'Brak danych.' : 'Wybierz grupę z listy powyżej, aby zobaczyć listę uczniów i status płatności.'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchInvoices}
            />

            {selectedStudentId && (
                <AddPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={handlePaymentSuccess}
                    studentId={selectedStudentId}
                    initialAmount={initialPaymentAmount}
                    initialMonth={initialPaymentMonth}
                />
            )}
        </div>
    );
}
