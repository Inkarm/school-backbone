'use client';

import CalendarView from '@/components/CalendarView';
import AddClassModal from '@/components/AddClassModal';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SchedulePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    // Filters
    const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [trainers, setTrainers] = useState<{ id: number; firstName: string; lastName: string }[]>([]);
    const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
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
        fetchData();
    }, []);

    return (
        <div className="space-y-4 md:space-y-6 h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 gap-4 md:gap-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Grafik Zajęć</h2>
                    <p className="text-sm md:text-base text-slate-500">
                        {isAdmin ? 'Zarządzaj planem zajęć.' : 'Przeglądaj plan zajęć.'}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="input-field flex-1 md:min-w-[150px]"
                            value={selectedTrainerId}
                            onChange={(e) => setSelectedTrainerId(e.target.value)}
                        >
                            <option value="">Wszyscy trenerzy</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                        <select
                            className="input-field flex-1 md:min-w-[150px]"
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                        >
                            <option value="">Wszystkie sale</option>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary w-full md:w-auto justify-center"
                        >
                            + Dodaj Zajęcia
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <CalendarView
                    refreshTrigger={refreshTrigger}
                    filterTrainerId={selectedTrainerId ? parseInt(selectedTrainerId) : undefined}
                    filterRoomId={selectedRoomId ? parseInt(selectedRoomId) : undefined}
                    readOnly={!isAdmin}
                />
            </div>

            {isAdmin && (
                <AddClassModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
    );
}
