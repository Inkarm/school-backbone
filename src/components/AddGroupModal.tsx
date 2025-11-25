'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface AddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddGroupModal({ isOpen, onClose, onSuccess }: AddGroupModalProps) {
    const [name, setName] = useState('');
    const [ratePerClass, setRatePerClass] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    ratePerClass: parseFloat(ratePerClass) || 0,
                    monthlyFee: parseFloat(monthlyFee) || 0
                }),
            });

            if (!response.ok) throw new Error('Failed to create group');

            setName('');
            setRatePerClass('');
            setMonthlyFee('');
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się dodać grupy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Grupę">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa Grupy</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="np. Balet 4-6 lat"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stawka za zajęcia (PLN)</label>
                    <input
                        type="number"
                        value={ratePerClass}
                        onChange={e => setRatePerClass(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="np. 40"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opłata Miesięczna (PLN)</label>
                    <input
                        type="number"
                        value={monthlyFee}
                        onChange={e => setMonthlyFee(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="np. 150 (0 = brak)"
                        min="0"
                        step="0.01"
                    />
                    <p className="text-xs text-slate-500 mt-1">Używane do automatycznego rozliczania wpłat.</p>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Dodawanie...' : 'Dodaj Grupę'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
