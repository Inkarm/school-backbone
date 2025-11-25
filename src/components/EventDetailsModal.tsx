'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { ScheduleEvent } from '@/types';

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: ScheduleEvent | null;
    onDelete: () => void;
}

export default function EventDetailsModal({ isOpen, onClose, event, onDelete }: EventDetailsModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const handleDelete = async () => {
        if (!confirm('Czy na pewno chcesz usunąć te zajęcia?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/schedule/${event.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete event');
            onDelete();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się usunąć zajęć');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAttendance = () => {
        router.push(`/attendance/${event.id}`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Szczegóły Zajęć">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Grupa</h4>
                        <p className="text-lg font-semibold text-slate-900">{event.group?.name || 'Nieznana grupa'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Trener</h4>
                        <p className="text-lg font-semibold text-slate-900">
                            {event.trainer ? `${event.trainer.firstName} ${event.trainer.lastName}` : 'Nieznany trener'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Data</h4>
                        <p className="text-slate-900">{event.date.split('T')[0]}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Godzina</h4>
                        <p className="text-slate-900">{event.startTime} - {event.endTime}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-500">Sala</h4>
                    <p className="text-slate-900">{event.room?.name || 'Brak przypisanej sali'}</p>
                </div>

                {event.description && (
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Opis</h4>
                        <p className="text-slate-900">{event.description}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleCheckAttendance}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Sprawdź Obecność
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        {loading ? 'Usuwanie...' : 'Usuń Zajęcia'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
