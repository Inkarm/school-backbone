'use client';

import { useState, useEffect } from 'react';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    student: {
        id: number;
        firstName: string;
        lastName: string;
        dateOfBirth: string | null;
        parentName: string;
        parentPhone: string;
        parentEmail: string;
        healthNotes: string | null;
    } | null;
}

export default function EditStudentModal({ isOpen, onClose, onSuccess, student }: EditStudentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        healthNotes: '',
    });

    useEffect(() => {
        if (student) {
            setFormData({
                firstName: student.firstName || '',
                lastName: student.lastName || '',
                dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                parentEmail: student.parentEmail || '',
                healthNotes: student.healthNotes || '',
            });
        }
    }, [student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/students/${student.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update student');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Nie udało się zaktualizować danych ucznia');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Edytuj Ucznia</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data Urodzenia</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={formData.dateOfBirth}
                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-medium text-slate-900 mb-4">Dane Opiekuna</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imię i Nazwisko Opiekuna</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.parentName}
                                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                <input
                                    type="tel"
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.parentPhone}
                                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                    value={formData.parentEmail}
                                    onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notatki o zdrowiu</label>
                        <textarea
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            rows={3}
                            value={formData.healthNotes}
                            onChange={e => setFormData({ ...formData, healthNotes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Anuluj</button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
