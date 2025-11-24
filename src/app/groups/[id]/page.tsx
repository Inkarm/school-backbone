'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import AssignStudentModal from '@/components/AssignStudentModal';

interface Group {
    id: number;
    name: string;
    students: Array<{
        id: number;
        firstName: string;
        lastName: string;
    }>;
}

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAssignStudentModalOpen, setIsAssignStudentModalOpen] = useState(false);

    useEffect(() => {
        fetchGroup();
    }, [id]);

    const fetchGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${id}`);
            if (res.ok) setGroup(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Ładowanie...</div>;
    if (!group) return <div className="text-center py-12">Nie znaleziono grupy</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{group.name}</h2>
                    <p className="text-slate-500">Szczegóły grupy</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/groups" className="btn-secondary">
                        Wróć
                    </Link>
                </div>
            </div>

            <div className="clean-card p-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Lista Uczniów ({group.students.length})</h3>
                    <button
                        className="btn-primary text-sm"
                        onClick={() => setIsAssignStudentModalOpen(true)}
                    >
                        + Dodaj Ucznia
                    </button>
                </div>

                {group.students.length === 0 ? (
                    <p className="text-slate-500">Brak uczniów w tej grupie.</p>
                ) : (
                    <ul className="space-y-2">
                        {group.students.map((student) => (
                            <li key={student.id} className="p-3 bg-slate-50 rounded-lg border border-gray-200 text-slate-700 flex justify-between items-center">
                                <span>{student.firstName} {student.lastName}</span>
                                <Link href={`/students/${student.id}`} className="text-sm text-blue-600 hover:underline">
                                    Zobacz profil
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <AssignStudentModal
                isOpen={isAssignStudentModalOpen}
                onClose={() => setIsAssignStudentModalOpen(false)}
                onSuccess={() => {
                    fetchGroup();
                    setIsAssignStudentModalOpen(false);
                }}
                groupId={group.id}
                currentStudentIds={group.students.map(s => s.id)}
            />
        </div>
    );
}
