'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddGroupModal from '@/components/AddGroupModal';

interface Group {
    id: number;
    name: string;
    students: any[];
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Grupy</h2>
                    <p className="text-[hsl(var(--text-muted))]">Zarządzaj grupami zajęciowymi.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    + Dodaj Grupę
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : groups.length === 0 ? (
                <div className="clean-card p-12 text-center">
                    <p className="text-slate-500">Brak grup. Dodaj pierwszą grupę!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <div key={group.id} className="clean-card p-6 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{group.name}</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                {group.students.length} uczniów
                            </p>
                            <div className="flex gap-2">
                                <button
                                    className="btn-secondary text-xs py-1 px-3"
                                    onClick={() => alert('Edycja grupy wkrótce')}
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
        </div>
    );
}
