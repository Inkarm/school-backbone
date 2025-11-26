'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EditSeriesModal from '@/components/EditSeriesModal';
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

const DAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

export default function RecurringSchedulePage() {
    const [seriesList, setSeriesList] = useState<RecurringSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSeries, setEditingSeries] = useState<RecurringSchedule | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: number | null;
        title: string;
        message: string;
    }>({ isOpen: false, id: null, title: '', message: '' });

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/schedule/series');
            if (res.ok) {
                const data = await res.json();
                setSeriesList(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: 'Usuń serię zajęć',
            message: 'Czy na pewno chcesz usunąć tę serię? Zostaną usunięte wszystkie PRZYSZŁE zajęcia z tej serii. Historia pozostanie zachowana.'
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirmModal.id) return;

        try {
            const res = await fetch(`/api/schedule/series/${confirmModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSeries();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                alert('Nie udało się usunąć serii');
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Zajęcia Cykliczne"
                description="Zarządzaj seriami powtarzalnych zajęć"
            />

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : seriesList.length === 0 ? (
                <div className="clean-card p-12 text-center text-slate-500">
                    Brak zdefiniowanych serii zajęć.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seriesList.map(series => (
                        <div key={series.id} className="clean-card p-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingSeries(series)}
                                    className="p-1 text-slate-400 hover:text-blue-600"
                                    title="Edytuj serię"
                                >
                                    ✎
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(series.id)}
                                    className="p-1 text-slate-400 hover:text-red-600"
                                    title="Usuń serię"
                                >
                                    🗑
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-slate-900">{series.group.name}</h3>
                                <div className="text-sm text-indigo-600 font-medium">
                                    {DAYS[series.dayOfWeek]}, {series.startTime} - {series.endTime}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span>👤</span>
                                    <span>{series.trainer.firstName} {series.trainer.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{series.room ? series.room.name : 'Brak sali'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-gray-100">
                                    <span>📅</span>
                                    <span>
                                        {new Date(series.startDate).toLocaleDateString()} - {new Date(series.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EditSeriesModal
                isOpen={!!editingSeries}
                onClose={() => setEditingSeries(null)}
                onSuccess={fetchSeries}
                series={editingSeries}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                confirmText="Usuń serię"
            />
        </div>
    );
}
