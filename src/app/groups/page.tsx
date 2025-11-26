'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddGroupModal from '@/components/AddGroupModal';
import EditGroupModal from '@/components/EditGroupModal';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Group } from '@/types';

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: number | null;
        title: string;
        message: string;
    }>({ isOpen: false, id: null, title: '', message: '' });

    useEffect(() => {
        fetchGroups();
    }, [refreshTrigger]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/groups');
            if (!response.ok) throw new Error('Failed to fetch groups');
            const data = await response.json();
            setGroups(data);
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: 'Usuń grupę',
            message: 'Czy na pewno chcesz usunąć tę grupę? Ta operacja jest nieodwracalna.'
        });
    };

    const handleConfirmDelete = async () => {
        if (!confirmModal.id) return;

        try {
            const res = await fetch(`/api/groups/${confirmModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchGroups();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                const data = await res.json();
                alert(`Błąd: ${data.error}`);
            }
        } catch (e) { console.error(e); }
    };

    const handleEdit = (group: Group) => {
        setSelectedGroup(group);
        setIsEditModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Grupy"
                description="Zarządzaj grupami zajęciowymi."
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary w-full md:w-auto justify-center"
                    >
                        + Dodaj Grupę
                    </button>
                }
            />

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : groups.length === 0 ? (
                <div className="clean-card p-12 text-center">
                    <p className="text-slate-500">Brak grup. Dodaj pierwszą grupę!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <div key={group.id} className="clean-card p-6 hover:shadow-md transition-shadow group relative">
                            <button
                                onClick={() => handleDeleteClick(group.id)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Usuń grupę"
                            >
                                🗑
                            </button>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{group.name}</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                {group.students?.length || 0} uczniów
                            </p>
                            <div className="flex gap-2">
                                <button
                                    className="btn-secondary text-xs py-1 px-3"
                                    onClick={() => handleEdit(group)}
                                >
                                    Edytuj
                                </button>
                                <Link
                                    href={`/groups/${group.id}`}
                                    className="btn-secondary text-xs py-1 px-3"
                                >
                                    Szczegóły
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />

            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                group={selectedGroup}
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
