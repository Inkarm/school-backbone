'use client';

import { useState, useEffect } from 'react';

interface Group {
    id: number;
    name: string;
}

interface AssignGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    studentId: number;
    currentGroupIds: number[];
}

export default function AssignGroupModal({ isOpen, onClose, onSuccess, studentId, currentGroupIds }: AssignGroupModalProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
            setSelectedGroupId('');
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const allGroups: Group[] = await res.json();
                // Filter out groups the student is already in
                setGroups(allGroups.filter(g => !currentGroupIds.includes(g.id)));
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroupId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/students/${studentId}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: parseInt(selectedGroupId) }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to assign group');
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`Nie udało się przypisać do grupy: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Przypisz do Grupy</h3>

                {groups.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-slate-500 mb-4">Brak dostępnych grup do przypisania.</p>
                        <button onClick={onClose} className="btn-secondary">Zamknij</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz Grupę</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg bg-white text-slate-900"
                                value={selectedGroupId}
                                onChange={e => setSelectedGroupId(e.target.value)}
                                required
                            >
                                <option value="">-- Wybierz grupę --</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">Anuluj</button>
                            <button type="submit" className="btn-primary flex-1" disabled={loading || !selectedGroupId}>
                                {loading ? 'Zapisywanie...' : 'Przypisz'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
