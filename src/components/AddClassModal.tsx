'use client';

import { useState, useEffect } from 'react';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Group {
    id: number;
    name: string;
}

interface Trainer {
    id: number;
    login: string;
}

export default function AddClassModal({ isOpen, onClose, onSuccess }: AddClassModalProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        groupId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '17:00',
        endTime: '18:00',
        trainerId: '',
        roomId: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
            fetchTrainers();
            fetchRooms();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            if (res.ok) setGroups(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchTrainers = async () => {
        try {
            const res = await fetch('/api/trainers');
            if (res.ok) setTrainers(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            if (res.ok) setRooms(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create class');
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Nie udało się dodać zajęć');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-panel w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[hsl(var(--text-muted))] hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-6">Dodaj Zajęcia</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Grupa</label>
                        <select
                            value={formData.groupId}
                            onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                            className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                            required
                        >
                            <option value="">Wybierz grupę...</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Data</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Start</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Koniec</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Instruktor</label>
                        <select
                            value={formData.trainerId}
                            onChange={e => setFormData({ ...formData, trainerId: e.target.value })}
                            className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                            required
                        >
                            <option value="">Wybierz instruktora...</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.login}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Sala</label>
                        <select
                            value={formData.roomId}
                            onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                            className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                        >
                            <option value="">Wybierz salę (opcjonalnie)...</option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                        {loading ? 'Zapisywanie...' : 'Zapisz do Grafiku'}
                    </button>
                </form>
            </div>
        </div>
    );
}
