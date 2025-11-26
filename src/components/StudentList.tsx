'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [searchTerm, refreshTrigger]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const url = searchTerm
                ? `/api/students?search=${encodeURIComponent(searchTerm)}`
                : '/api/students';

            const response = await fetch(url);
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

    const handleSuspend = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        const confirmMsg = currentStatus === 'ACTIVE'
            ? 'Czy na pewno chcesz zawiesić tego ucznia? Trafi on do archiwum.'
            : 'Czy na pewno chcesz przywrócić tego ucznia?';

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/students/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) fetchStudents();
            else alert('Błąd podczas zmiany statusu');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Czy na pewno chcesz trwale usunąć tego ucznia? Tej operacji nie można cofnąć.')) return;

        try {
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStudents();
            else alert('Błąd podczas usuwania');
        } catch (e) { console.error(e); }
    };

    const filteredStudents = students.filter(s => {
        if (showArchived) return s.status === 'SUSPENDED' || s.status === 'ARCHIVED';
        return s.status === 'ACTIVE' || !s.status; // Default to active if undefined
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Ładowanie...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="clean-card p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchStudents} className="btn-primary mt-4">
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <input
                    type="text"
                    placeholder="Szukaj ucznia lub rodzica..."
                    className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowArchived(false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showArchived ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        Aktywni
                    </button>
                    <button
                        onClick={() => setShowArchived(true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showArchived ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
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
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredStudents.map(student => (
                            <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
                                        <p className="text-sm text-slate-500">{student.parentName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSuspend(student.id, student.status)} className="text-orange-600 text-xs font-medium">
                                            {student.status === 'ACTIVE' ? 'Zawieś' : 'Przywróć'}
                                        </button>
                                        <Link href={`/students/${student.id}`} className="text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1 rounded-full">
                                            Szczegóły
                                        </Link>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <span>📞</span>
                                    <span className="font-mono">{student.parentPhone}</span>
                                </div>

                                {student.groups.length > 0 && (
                                    <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
                                        {student.groups.map((group) => (
                                            <span key={group.id} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                                                {group.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-medium">Imię i Nazwisko</th>
                                    <th className="p-4 font-medium">Opiekun</th>
                                    <th className="p-4 font-medium">Telefon</th>
                                    <th className="p-4 font-medium">Grupy</th>
                                    <th className="p-4 font-medium">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {student.firstName} {student.lastName}
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
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3 items-center">
                                                <Link href={`/students/${student.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
                                                    Szczegóły
                                                </Link>
                                                <button
                                                    onClick={() => handleSuspend(student.id, student.status)}
                                                    className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                                                >
                                                    {student.status === 'ACTIVE' ? 'Zawieś' : 'Przywróć'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    Usuń
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
