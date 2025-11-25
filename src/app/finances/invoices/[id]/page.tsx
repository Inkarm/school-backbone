'use client';

import { useState, useEffect, use } from 'react';
import { Invoice } from '@/types';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoices/${id}`);
            if (res.ok) setInvoice(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!invoice) return;
        try {
            const res = await fetch(`/api/invoices/${invoice.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) fetchInvoice();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-12 text-center">Ładowanie...</div>;
    if (!invoice) return <div className="p-12 text-center">Nie znaleziono faktury</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:w-full print:max-w-none">
            {/* Actions Bar - Hidden when printing */}
            <div className="flex justify-between items-center print:hidden">
                <Link href="/finances" className="btn-secondary">
                    ← Wróć
                </Link>
                <div className="flex gap-3">
                    {invoice.status === 'ISSUED' && (
                        <button
                            onClick={() => handleStatusChange('PAID')}
                            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                        >
                            Oznacz jako Opłaconą
                        </button>
                    )}
                    {invoice.status !== 'CANCELLED' && (
                        <button
                            onClick={() => handleStatusChange('CANCELLED')}
                            className="btn-secondary text-red-600 hover:bg-red-50"
                        >
                            Anuluj
                        </button>
                    )}
                    <button onClick={handlePrint} className="btn-primary">
                        🖨 Drukuj
                    </button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="bg-white p-12 shadow-lg rounded-xl print:shadow-none print:p-0 print:rounded-none border border-gray-100 print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">FAKTURA</h1>
                        <p className="text-slate-500">Nr: {invoice.number}</p>
                        <div className="mt-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${invoice.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                    invoice.status === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-700' :
                                        'bg-blue-50 border-blue-200 text-blue-700'
                                }`}>
                                {invoice.status === 'PAID' ? 'OPŁACONA' :
                                    invoice.status === 'CANCELLED' ? 'ANULOWANA' : 'DO ZAPŁATY'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-slate-900 text-lg">Szkoła Tańca "Poezja"</h2>
                        <p className="text-slate-600">ul. Przykładowa 123</p>
                        <p className="text-slate-600">00-000 Warszawa</p>
                        <p className="text-slate-600">NIP: 123-456-78-90</p>
                    </div>
                </div>

                {/* Dates & Client */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Nabywca</h3>
                        <div className="text-slate-900">
                            <p className="font-bold text-lg">{invoice.student?.parentName || 'Brak danych opiekuna'}</p>
                            <p>Opiekun ucznia: {invoice.student?.firstName} {invoice.student?.lastName}</p>
                            {invoice.student?.parentEmail && <p>{invoice.student.parentEmail}</p>}
                            {invoice.student?.parentPhone && <p>{invoice.student.parentPhone}</p>}
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div>
                            <span className="text-slate-500 mr-4">Data wystawienia:</span>
                            <span className="font-medium text-slate-900">
                                {new Date(invoice.issueDate).toLocaleDateString('pl-PL')}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500 mr-4">Termin płatności:</span>
                            <span className="font-medium text-slate-900">
                                {new Date(invoice.dueDate).toLocaleDateString('pl-PL')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-slate-100">
                            <th className="text-left py-3 font-bold text-slate-600">Opis</th>
                            <th className="text-center py-3 font-bold text-slate-600 w-24">Ilość</th>
                            <th className="text-right py-3 font-bold text-slate-600 w-32">Cena jedn.</th>
                            <th className="text-right py-3 font-bold text-slate-600 w-32">Wartość</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {invoice.items.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="py-4 text-slate-900">{item.description}</td>
                                <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-4 text-right text-slate-600">{item.price.toFixed(2)} PLN</td>
                                <td className="py-4 text-right font-medium text-slate-900">
                                    {(item.quantity * item.price).toFixed(2)} PLN
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-100">
                            <td colSpan={3} className="pt-4 text-right font-bold text-slate-600">Razem do zapłaty:</td>
                            <td className="pt-4 text-right font-bold text-2xl text-slate-900">
                                {invoice.amount.toFixed(2)} PLN
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="border-t border-slate-100 pt-8 text-center text-slate-500 text-sm">
                    <p>Dziękujemy za terminową wpłatę.</p>
                    <p className="mt-2">Nr konta: 00 0000 0000 0000 0000 0000 0000</p>
                </div>
            </div>
        </div>
    );
}
