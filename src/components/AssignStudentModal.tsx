'use client';

import { useState, useEffect } from 'react';

interface Student {
    id: number;
    firstName: string;
    lastName: string;
}

interface AssignStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    groupId: number;
    currentStudentIds: number[];
}

export default function AssignStudentModal({ isOpen, onClose, onSuccess, groupId, currentStudentIds }: AssignStudentModalProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            setSelectedStudentId('');
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students');
            if (res.ok) {
                const allStudents: Student[] = await res.json();
                // Filter out students already in the group
                setStudents(allStudents.filter(s => !currentStudentIds.includes(s.id)));
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/groups/${groupId}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: parseInt(selectedStudentId) }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to assign student');
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`Nie udało się przypisać ucznia: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Dodaj Ucznia do Grupy</h3>

                {students.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-slate-500 mb-4">Brak dostępnych uczniów do dodania.</p>
                        <button onClick={onClose} className="btn-secondary">Zamknij</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Wyszukaj Ucznia</label>
                            <input
                                type="text"
                                placeholder="Wpisz imię lub nazwisko..."
                                className="w-full p-2 border border-gray-200 rounded-lg mb-2"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz z listy</label>
                            <select
                                className="w-full p-2 border border-gray-200 rounded-lg bg-white text-slate-900"
                                value={selectedStudentId}
                                onChange={e => setSelectedStudentId(e.target.value)}
                                required
                                size={5}
                            >
                                {filteredStudents.map(student => (
                                    <option key={student.id} value={student.id} className="p-2">
                                        {student.firstName} {student.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">Anuluj</button>
                            <button type="submit" className="btn-primary flex-1" disabled={loading || !selectedStudentId}>
                                {loading ? 'Zapisywanie...' : 'Dodaj'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
