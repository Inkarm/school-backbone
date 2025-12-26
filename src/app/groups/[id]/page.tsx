'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import AssignStudentModal from '@/components/AssignStudentModal';
import { Group } from '@/types';

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
                    <h3 className="text-lg font-semibold text-slate-900">Lista Uczniów ({group.students?.length || 0})</h3>
                    <button
                        className="btn-primary text-sm"
                        onClick={() => setIsAssignStudentModalOpen(true)}
                    >
                        + Dodaj Ucznia
                    </button>
                </div>

                {!group.students || group.students.length === 0 ? (
                    <p className="text-slate-500">Brak uczniów w tej grupie.</p>
                ) : (
                    <ul className="space-y-2">
                        {group.students.map((student) => (
                            <li key={student.id} className="p-3 bg-slate-50 rounded-lg border border-gray-200 text-slate-700 flex justify-between items-center group">
                                <span>{student.firstName} {student.lastName}</span>
                                <div className="flex items-center gap-3">
                                    <Link href={`/students/${student.id}`} className="text-sm text-blue-600 hover:underline">
                                        Zobacz profil
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Czy na pewno chcesz usunąć tego ucznia z grupy?')) return;
                                            try {
                                                const res = await fetch(`/api/groups/${group.id}/students?studentId=${student.id}`, {
                                                    method: 'DELETE'
                                                });
                                                if (res.ok) fetchGroup();
                                                else alert('Nie udało się usunąć ucznia');
                                            } catch (e) {
                                                console.error(e);
                                                alert('Wystąpił błąd');
                                            }
                                        }}
                                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                        title="Usuń z grupy"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
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
            />
        </div>
    );
}
