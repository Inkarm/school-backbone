'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Group, User, Room } from '@/types';

interface RecurringSchedule {
    id: number;
    startDate: string;
    endDate: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    group: Group;
    trainer: User;
    room: Room | null;
    description: string | null;
}

interface EditSeriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    series: RecurringSchedule | null;
}

export default function EditSeriesModal({ isOpen, onClose, onSuccess, series }: EditSeriesModalProps) {
    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        trainerId: '',
        roomId: '',
        startTime: '',
        endTime: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen && series) {
            fetchData();
            setFormData({
                trainerId: series.trainer.id.toString(),
                roomId: series.room ? series.room.id.toString() : '',
                startTime: series.startTime,
                endTime: series.endTime,
                description: series.description || '',
            });
        }
    }, [isOpen, series]);

    const fetchData = async () => {
        try {
            const [trainersRes, roomsRes] = await Promise.all([
                fetch('/api/users?role=TRAINER'),
                fetch('/api/rooms')
            ]);

            if (trainersRes.ok) setTrainers(await trainersRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!series) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/schedule/series/${series.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trainerId: parseInt(formData.trainerId),
                    roomId: formData.roomId ? parseInt(formData.roomId) : null,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    description: formData.description,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update series');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Nie udało się zaktualizować serii');
        } finally {
            setLoading(false);
        }
    };

    if (!series) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edycja serii: ${series.group.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                    <strong>Uwaga:</strong> Zmiany zostaną zastosowane tylko do <u>przyszłych</u> zajęć w tej serii. Historia pozostanie bez zmian.
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Godzina Od</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Godzina Do</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trener</label>
                    <select
                        value={formData.trainerId}
                        onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
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
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                    >
                        <option value="">Wybierz salę (opcjonalnie)</option>
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (max {r.capacity})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900"
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
