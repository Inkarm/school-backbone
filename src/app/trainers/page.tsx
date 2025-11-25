'use client';

import { useState, useEffect } from 'react';
import AddTrainerModal from '@/components/AddTrainerModal';
import EditTrainerModal from '@/components/EditTrainerModal';
import { User } from '@/types';

export default function TrainersPage() {
    const [trainers, setTrainers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState<User | null>(null);

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            const res = await fetch('/api/users?role=TRAINER');
            if (res.ok) setTrainers(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Czy na pewno chcesz usunąć tego trenera?')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTrainers();
            } else {
                const data = await res.json();
                alert(data.error || 'Nie udało się usunąć trenera');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Instruktorzy</h2>
                    <p className="text-slate-500">Zarządzanie kadrą trenerską</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                    + Dodaj Trenera
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainers.map(trainer => (
                        <div key={trainer.id} className="clean-card p-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingTrainer(trainer)}
                                    className="p-1 text-slate-400 hover:text-blue-600"
                                    title="Edytuj"
                                >
                                    ✎
                                </button>
                                <button
                                    onClick={() => handleDelete(trainer.id)}
                                    className="p-1 text-slate-400 hover:text-red-600"
                                    title="Usuń"
                                >
                                    🗑
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm"
                                    style={{ backgroundColor: trainer.color || '#6366f1' }}
                                >
                                    {trainer.firstName ? trainer.firstName[0] : trainer.login[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">
                                        {trainer.firstName ? `${trainer.firstName} ${trainer.lastName}` : trainer.login}
                                    </h3>
                                    <span className="text-xs uppercase tracking-wider text-slate-500 block">
                                        {trainer.login}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <span className="w-5 text-center">📞</span>
                                    <span>{trainer.phone || 'Brak telefonu'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <span className="w-5 text-center">✉</span>
                                    <span className="truncate">{trainer.email || 'Brak emaila'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddTrainerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTrainers}
            />

            <EditTrainerModal
                isOpen={!!editingTrainer}
                onClose={() => setEditingTrainer(null)}
                onSuccess={fetchTrainers}
                trainer={editingTrainer}
            />
        </div>
    );
}
