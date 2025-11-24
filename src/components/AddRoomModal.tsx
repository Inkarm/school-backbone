'use client';

import { useState } from 'react';

interface AddRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddRoomModal({ isOpen, onClose, onSuccess }: AddRoomModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create room');
            }

            // Reset form
            setFormData({
                name: '',
                capacity: '',
            });

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Error creating room:', err);
            alert(`Nie udało się dodać sali: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Dodaj Salę</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nazwa Sali</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            placeholder="np. Sala Lustrzana"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Pojemność</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            placeholder="np. 20"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                            Anuluj
                        </button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Dodawanie...' : 'Dodaj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
