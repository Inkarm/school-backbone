'use client';

import { useState, useEffect } from 'react';
import AddRoomModal from '@/components/AddRoomModal';
import EditRoomModal from '@/components/EditRoomModal';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Room {
    id: number;
    name: string;
    capacity: number;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: number | null;
        title: string;
        message: string;
    }>({ isOpen: false, id: null, title: '', message: '' });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms');
            if (res.ok) setRooms(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDeleteClick = (id: number) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: 'Usuń salę',
            message: 'Czy na pewno chcesz usunąć tę salę? Ta operacja jest nieodwracalna.'
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirmModal.id) return;

        try {
            const res = await fetch(`/api/rooms/${confirmModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchRooms();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                const data = await res.json();
                alert(`Błąd: ${data.error}`);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Sale"
                description="Zarządzanie salami zajęciowymi"
                action={
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary"
                    >
                        + Dodaj Salę
                    </button>
                }
            />

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : rooms.length === 0 ? (
                <div className="clean-card p-12 text-center">
                    <span className="text-4xl block mb-4">🏫</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Brak sal</h3>
                    <p className="text-slate-500 mb-6">Nie dodano jeszcze żadnych sal.</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn-primary"
                    >
                        Dodaj pierwszą salę
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <div key={room.id} className="clean-card p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                                        {room.capacity} os.
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setEditingRoom(room)}
                                    className="flex-1 text-sm text-slate-600 hover:text-indigo-600 font-medium py-2"
                                >
                                    Edytuj
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(room.id)}
                                    className="flex-1 text-sm text-slate-600 hover:text-red-600 font-medium py-2"
                                >
                                    Usuń
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddRoomModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchRooms}
            />

            <EditRoomModal
                isOpen={!!editingRoom}
                onClose={() => setEditingRoom(null)}
                onSuccess={fetchRooms}
                room={editingRoom}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                confirmText="Usuń"
            />
        </div>
    );
}
