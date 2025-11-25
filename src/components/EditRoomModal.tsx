'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Room } from '@/types';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    room: Room | null;
}

export default function EditRoomModal({ isOpen, onClose, onSuccess, room }: EditRoomModalProps) {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (room) {
            setName(room.name);
            setCapacity(room.capacity.toString());
        }
    }, [room]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!room) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/rooms/${room.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    capacity: parseInt(capacity) || 0
                }),
            });

            if (!response.ok) throw new Error('Failed to update room');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się zaktualizować sali');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edytuj Salę">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa Sali</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pojemność</label>
                    <input
                        type="number"
                        value={capacity}
                        onChange={e => setCapacity(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min="1"
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
