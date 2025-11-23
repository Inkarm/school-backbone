'use client';

import { useState, useEffect } from 'react';

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    group: { id: number; name: string } | null;
}

export default function EditGroupModal({ isOpen, onClose, onSuccess, group }: EditGroupModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        if (group) setName(group.name);
    }, [group]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!group) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error('Failed to update group');
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error updating group:', err);
            alert('Nie udało się zaktualizować grupy');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Edytuj Grupę</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nazwa Grupy</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
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
            </div>
        </div>
    );
}
