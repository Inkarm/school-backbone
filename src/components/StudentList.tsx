'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    parentName: string;
    parentPhone: string;
    status: string;
    groups: Array<{
        id: number;
        name: string;
    }>;
}

interface StudentListProps {
    refreshTrigger?: number;
}

export default function StudentList({ refreshTrigger = 0 }: StudentListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ACTIVE');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        id: number | null;
        action: 'delete' | 'suspend' | 'activate' | null;
        title: string;
        message: string;
    }>({ isOpen: false, id: null, action: null, title: '', message: '' });

    useEffect(() => {
        fetchStudents();
    }, [refreshTrigger]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/students');
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setStudents(data);
            setError('');
        } catch (err) {
            setError('Nie udało się załadować uczniów');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setConfirmModal({
            isOpen: true,
            id,
            action: 'delete',
            title: 'Usuń ucznia',
            message: 'Czy na pewno chcesz usunąć tego ucznia? Ta operacja jest nieodwracalna.'
        });
    };

    const handleStatusClick = (id: number, currentStatus: string) => {
        const isSuspended = currentStatus === 'SUSPENDED';
        setConfirmModal({
            isOpen: true,
            id,
            action: isSuspended ? 'activate' : 'suspend',
            title: isSuspended ? 'Aktywuj ucznia' : 'Zawieś ucznia',
            message: isSuspended
                ? 'Czy chcesz przywrócić tego ucznia do statusu aktywnego?'
                : 'Czy chcesz zawiesić tego ucznia? Nie będzie on widoczny w dziennikach.'
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.id || !confirmModal.action) return;

        try {
            let res;
            if (confirmModal.action === 'delete') {
                res = await fetch(`/api/students/${confirmModal.id}`, { method: 'DELETE' });
            } else {
                const newStatus = confirmModal.action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
                res = await fetch(`/api/students/${confirmModal.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
            }

            if (res.ok) {
                fetchStudents();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            } else {
                const data = await res.json();
                alert(`Błąd: ${data.error}`);
            }
        } catch (e) { console.error(e); }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'ARCHIVED') {
            return matchesSearch && student.status === 'ARCHIVED';
        }
        // Show ACTIVE and SUSPENDED when filter is ACTIVE (default view)
        // Or we can have separate filters. Let's keep it simple: Active view shows Active & Suspended? 
        // Or maybe strictly Active?
        // Let's match the previous logic: "Active" button showed everything not archived.
        return matchesSearch && student.status !== 'ARCHIVED';
    });

    if (loading) return <div className="text-center py-12 text-slate-500">Ładowanie...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                <input
                    type="text"
                    placeholder="Szukaj ucznia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 p-2 border border-gray-200 rounded-lg"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('ACTIVE')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'ACTIVE' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        Aktywni
                    </button>
                    <button
                        onClick={() => setFilterStatus('ARCHIVED')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'ARCHIVED' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        Archiwum
                    </button>
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="clean-card p-12 text-center">
                    <p className="text-slate-500">Brak uczniów w tym widoku</p>
                </div>
            ) : (
                <>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
                                            <StatusBadge status={student.status} />
                                        </div>
                                        <p className="text-sm text-slate-500">{student.parentName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/students/${student.id}/profile`} className="p-2 text-slate-400 hover:text-indigo-600">
                                            👤
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleStatusClick(student.id, student.status)}
                                        className="flex-1 text-xs font-medium text-orange-600 bg-orange-50 py-2 rounded"
                                    >
                                        {student.status === 'SUSPENDED' ? 'Aktywuj' : 'Zawieś'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(student.id)}
                                        className="flex-1 text-xs font-medium text-red-600 bg-red-50 py-2 rounded"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="px-4 py-3 font-medium">Imię i Nazwisko</th>
                                    <th className="px-4 py-3 font-medium">Rodzic</th>
                                    <th className="px-4 py-3 font-medium">Telefon</th>
                                    <th className="px-4 py-3 font-medium">Grupy</th>
                                    <th className="px-4 py-3 font-medium text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            <div className="flex items-center gap-2">
                                                {student.firstName} {student.lastName}
                                                <StatusBadge status={student.status} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{student.parentName}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-slate-500">{student.parentPhone}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 flex-wrap">
                                                {student.groups.map((group) => (
                                                    <span key={group.id} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                                                        {group.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleStatusClick(student.id, student.status)}
                                                    className="text-sm text-orange-600 hover:text-orange-800 px-2"
                                                    title={student.status === 'SUSPENDED' ? 'Aktywuj' : 'Zawieś'}
                                                >
                                                    {student.status === 'SUSPENDED' ? '▶' : '⏸'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(student.id)}
                                                    className="text-sm text-red-600 hover:text-red-800 px-2"
                                                    title="Usuń"
                                                >
                                                    🗑
                                                </button>
                                                <Link
                                                    href={`/students/${student.id}/profile`}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 px-2 font-medium"
                                                >
                                                    Szczegóły
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.action === 'activate' ? 'primary' : 'danger'}
                confirmText={confirmModal.action === 'activate' ? 'Aktywuj' : (confirmModal.action === 'suspend' ? 'Zawieś' : 'Usuń')}
            />
        </div>
    );
}
