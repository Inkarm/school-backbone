'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { User, Room, ScheduleEvent } from '@/types';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    event: ScheduleEvent;
    readOnly?: boolean;
}

export default function EditEventModal({ isOpen, onClose, onSuccess, event, readOnly = false }: EditEventModalProps) {
    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        trainerId: '',
        roomId: '',
        status: 'SCHEDULED',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchFilters();
        }
    }, [isOpen]);

    useEffect(() => {
        if (event) {
            setFormData({
                date: new Date(event.date).toISOString().slice(0, 10),
                startTime: event.startTime,
                endTime: event.endTime,
                trainerId: event.trainerId.toString(),
                roomId: event.roomId ? event.roomId.toString() : '',
                status: event.status || 'SCHEDULED',
                description: event.description || '',
            });
        }
    }, [event]);

    const fetchFilters = async () => {
        try {
            const [trainersRes, roomsRes] = await Promise.all([
                fetch('/api/users?role=TRAINER'),
                fetch('/api/rooms')
            ]);
            if (trainersRes.ok) setTrainers(await trainersRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
        } catch (e) {
            console.error('Failed to fetch filters', e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;
        setLoading(true);

        try {
            const body = {
                ...formData,
                trainerId: parseInt(formData.trainerId),
                roomId: formData.roomId ? parseInt(formData.roomId) : null,
                date: new Date(formData.date).toISOString(),
            };

            const response = await fetch(`/api/schedule/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Failed to update event');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się zaktualizować zajęć');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/schedule/${event.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete event');
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się usunąć zajęć');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!event) return null;

    const isSubstitution = event.group?.defaultTrainerId && parseInt(formData.trainerId) !== event.group.defaultTrainerId;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={readOnly ? `Szczegóły Zajęć: ${event.group?.name || ''}` : `Edycja Zajęć: ${event.group?.name || ''}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                disabled={readOnly}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Od</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    disabled={readOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Do</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trener</label>
                            <select
                                value={formData.trainerId}
                                onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                                className={`w-full p-2 border rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isSubstitution ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}
                                required
                                disabled={readOnly}
                            >
                                {trainers.map(t => (
                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                ))}
                            </select>
                            {isSubstitution && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ Zastępstwo (Domyślny: {event.group?.defaultTrainer?.firstName} {event.group?.defaultTrainer?.lastName})</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sala</label>
                            <select
                                value={formData.roomId}
                                onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={readOnly}
                            >
                                <option value="">Brak sali</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={readOnly}
                        >
                            <option value="SCHEDULED">Zaplanowane</option>
                            <option value="CANCELLED">Odwołane</option>
                            <option value="COMPLETED">Zakończone</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Opis / Notatka</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={2}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors mr-auto"
                                disabled={loading}
                            >
                                Usuń
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                            {readOnly ? 'Zamknij' : 'Anuluj'}
                        </button>
                        {!readOnly && (
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                            </button>
                        )}
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Usuń zajęcia"
                message="Czy na pewno chcesz usunąć te zajęcia? Tej operacji nie można cofnąć."
                variant="danger"
                confirmText="Usuń"
            />
        </>
    );
}
