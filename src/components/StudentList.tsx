'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    parentName: string;
    parentPhone: string;
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
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Szukaj ucznia lub rodzica..."
                    className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {students.length === 0 ? (
                <div className="clean-card p-12 text-center">
                    <p className="text-slate-500">Brak uczniów do wyświetlenia</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
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
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 font-medium text-slate-900">
                                        {student.firstName} {student.lastName}
                                    </td>
                                    <td className="p-4 text-slate-500">{student.parentName}</td>
                                    <td className="p-4 font-mono text-sm text-slate-500">{student.parentPhone}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {student.groups.map((group) => (
                                                <span key={group.id} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                                                    {group.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/students/${student.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
                                            Szczegóły
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
