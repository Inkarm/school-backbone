'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Group, User, Room } from '@/types';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    selectedDate?: Date;
}

export default function AddClassModal({ isOpen, onClose, onSuccess, selectedDate }: AddClassModalProps) {
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [trainers, setTrainers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: '',
        startTime: '16:00',
        endTime: '17:00',
        groupId: '',
        trainerId: '',
        roomId: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (selectedDate) {
                setFormData(prev => ({
                    ...prev,
                    date: selectedDate.toISOString().split('T')[0]
                }));
            }
        }
    }, [isOpen, selectedDate]);

    const fetchData = async () => {
        try {
            const [groupsRes, trainersRes, roomsRes] = await Promise.all([
                fetch('/api/groups'),
                fetch('/api/users?role=trainer'),
                fetch('/api/rooms')
            ]);

            if (groupsRes.ok) setGroups(await groupsRes.json());
            if (trainersRes.ok) setTrainers(await trainersRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    groupId: parseInt(formData.groupId),
                    trainerId: parseInt(formData.trainerId),
                    roomId: formData.roomId ? parseInt(formData.roomId) : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create class');
            }

            onSuccess?.();
            onClose();
            // Reset form (keep date if selected)
            setFormData(prev => ({
                ...prev,
                startTime: '16:00',
                endTime: '17:00',
                groupId: '',
                trainerId: '',
                roomId: '',
                description: '',
            }));
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Nie udało się dodać zajęć');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Zajęcia">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Godzina Od</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Godzina Do</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grupa</label>
                    <select
                        value={formData.groupId}
                        onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">Wybierz grupę</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trener</label>
                    <select
                        value={formData.trainerId}
                        onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">Wybierz trenera</option>
                        {trainers.map(t => (
                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sala</label>
                    <select
                        value={formData.roomId}
                        onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="">Wybierz salę (opcjonalnie)</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (max {r.capacity})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opis (opcjonalnie)</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Dodawanie...' : 'Dodaj Zajęcia'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
