'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Group } from '@/types';

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    group: Group | null;
}

export default function EditGroupModal({ isOpen, onClose, onSuccess, group }: EditGroupModalProps) {
    const [name, setName] = useState('');
    const [ratePerClass, setRatePerClass] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (group) {
            setName(group.name);
            setRatePerClass(group.ratePerClass.toString());
        }
    }, [group]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!group) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    ratePerClass: parseFloat(ratePerClass) || 0
                }),
            });

            if (!response.ok) throw new Error('Failed to update group');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się zaktualizować grupy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edytuj Grupę">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa Grupy</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        min="0"
                        step="0.01"
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
        </Modal>
    );
}
