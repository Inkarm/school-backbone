'use client';

import { useState } from 'react';

interface OverdueStudent {
    id: number;
    firstName: string;
    lastName: string;
    groupNames: string;
    amountDue: number;
    month: string;
}

interface OverduePaymentsListProps {
    data: OverdueStudent[];
}

export default function OverduePaymentsList({ data }: OverduePaymentsListProps) {
    const [reminding, setReminding] = useState<number | null>(null);

    const handleRemind = async (studentId: number) => {
        setReminding(studentId);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Przypomnienie wysłane (symulacja)');
        setReminding(null);
    };

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <span className="text-2xl block mb-2">✅</span>
                Brak zaległych płatności w tym miesiącu
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Uczeń</th>
                        <th className="px-6 py-3">Grupy</th>
                        <th className="px-6 py-3 text-right">Zaległość</th>
                        <th className="px-6 py-3 text-right">Akcja</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((student) => (
                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                                {student.firstName} {student.lastName}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {student.groupNames}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-red-600">
                                {student.amountDue.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleRemind(student.id)}
                                    disabled={reminding === student.id}
                                    className="text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50"
                                >
                                    {reminding === student.id ? 'Wysyłanie...' : 'Przypomnij'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
