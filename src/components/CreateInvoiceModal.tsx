'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Student } from '@/types';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    studentId?: number;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess, studentId }: CreateInvoiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [formData, setFormData] = useState({
        studentId: '',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // +14 days
    });
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: 'Czesne za zajęcia', quantity: 1, price: 0 }
    ]);

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
            if (res.ok) setStudents(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: parseInt(formData.studentId),
                    issueDate: new Date(formData.issueDate).toISOString(),
                    dueDate: new Date(formData.dueDate).toISOString(),
                    items: items.map(item => ({
                        ...item,
                        quantity: Number(item.quantity),
                        price: Number(item.price)
                    })),
                }),
            });

            if (!response.ok) throw new Error('Failed to create invoice');

            onSuccess?.();
            onClose();
            // Reset form
            setItems([{ description: 'Czesne za zajęcia', quantity: 1, price: 0 }]);
        } catch (err) {
            console.error(err);
            alert('Nie udało się wystawić faktury');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Wystaw Fakturę">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data wystawienia</label>
                        <input
                            type="date"
                            value={formData.issueDate}
                            onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Termin płatności</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Pozycje na fakturze</label>
                        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800">
                            + Dodaj pozycję
                        </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <input
                                    type="text"
                                    placeholder="Opis"
                                    value={item.description}
                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                    className="flex-grow p-2 border border-gray-200 rounded-lg text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Ilość"
                                    value={item.quantity}
                                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                    className="w-16 p-2 border border-gray-200 rounded-lg text-sm"
                                    min="1"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Cena"
                                    value={item.price}
                                    onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                    className="w-24 p-2 border border-gray-200 rounded-lg text-sm"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <div className="text-right">
                        <span className="text-sm text-slate-500">Razem:</span>
                        <span className="ml-2 text-xl font-bold text-slate-900">{calculateTotal()} PLN</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Wystawianie...' : 'Wystaw Fakturę'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
