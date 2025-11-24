'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    event: any; // Using any for simplicity, should be typed properly
}

export default function EventDetailsModal({ isOpen, onClose, onSuccess, event }: EventDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        trainerId: '',
        roomId: '',
        status: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (event) {
                setEditData({
                    trainerId: event.trainer.id.toString(),
                    roomId: event.room ? event.room.id.toString() : '',
                    status: event.status || 'SCHEDULED',
                    description: event.description || '',
                });
                setIsEditing(false);
            }
        }
    }, [isOpen, event]);

    const fetchOptions = async () => {
        try {
            const [trainersRes, roomsRes] = await Promise.all([
                fetch('/api/users?role=trainer'),
                fetch('/api/rooms')
            ]);
            if (trainersRes.ok) setTrainers(await trainersRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/schedule/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trainerId: parseInt(editData.trainerId),
                    roomId: editData.roomId ? parseInt(editData.roomId) : null,
                    status: editData.status,
                    description: editData.description,
                }),
            });

            if (!response.ok) throw new Error('Failed to update event');

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Nie udało się zapisać zmian');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClass = async () => {
        if (!confirm('Czy na pewno chcesz odwołać te zajęcia?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/schedule/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' }),
            });

            if (!response.ok) throw new Error('Failed to cancel class');

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Nie udało się odwołać zajęć');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{event.group.name}</h3>
                        <p className="text-slate-500">
                            {new Date(event.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                            <br />
                            {event.startTime} - {event.endTime}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Trener (Zastępstwo)</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={editData.trainerId}
                                onChange={e => setEditData({ ...editData, trainerId: e.target.value })}
                            >
                                {trainers.map(t => (
                                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.login})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sala</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={editData.roomId}
                                onChange={e => setEditData({ ...editData, roomId: e.target.value })}
                            >
                                <option value="">-- Wybierz salę --</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={editData.status}
                                onChange={e => setEditData({ ...editData, status: e.target.value })}
                            >
                                <option value="SCHEDULED">Zaplanowane</option>
                                <option value="CANCELLED">Odwołane</option>
                                <option value="COMPLETED">Zakończone</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notatki</label>
                            <textarea
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={editData.description}
                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                placeholder="Np. powód odwołania..."
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1">Anuluj</button>
                            <button onClick={handleSave} className="btn-primary flex-1" disabled={loading}>Zapisz</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Trener</span>
                                <span className="font-medium text-slate-900">
                                    {event.trainer.firstName ? `${event.trainer.firstName} ${event.trainer.lastName}` : event.trainer.login}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Sala</span>
                                <span className="font-medium text-slate-900">
                                    {event.room ? event.room.name : 'Brak sali'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Status</span>
                                <span className={`font-medium ${event.status === 'CANCELLED' ? 'text-red-600' :
                                        event.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-900'
                                    }`}>
                                    {event.status === 'CANCELLED' ? 'Odwołane' :
                                        event.status === 'COMPLETED' ? 'Zakończone' : 'Zaplanowane'}
                                </span>
                            </div>
                        </div>

                        {event.description && (
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                                {event.description}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Link
                                href={`/attendance/${event.id}`}
                                className="btn-primary text-center w-full"
                                onClick={onClose}
                            >
                                📋 Sprawdź Obecność
                            </Link>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-secondary flex-1"
                                >
                                    Edytuj / Zastępstwo
                                </button>
                                {event.status !== 'CANCELLED' && (
                                    <button
                                        onClick={handleCancelClass}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        Odwołaj
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
