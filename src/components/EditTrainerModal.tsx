'use client';

import { useState, useEffect } from 'react';

interface Trainer {
    id: number;
    login: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    color: string | null;
}

interface EditTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    trainer: Trainer | null;
}

export default function EditTrainerModal({ isOpen, onClose, onSuccess, trainer }: EditTrainerModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        color: '#3b82f6',
        password: '', // Optional password change
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (trainer) {
            setFormData({
                firstName: trainer.firstName || '',
                lastName: trainer.lastName || '',
                email: trainer.email || '',
                phone: trainer.phone || '',
                color: trainer.color || '#3b82f6',
                password: '',
            });
        }
    }, [trainer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trainer) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/users/${trainer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update trainer');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !trainer) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Edytuj Trenera: {trainer.login}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                        <input
                            type="tel"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kolor w grafiku</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="color"
                                className="h-10 w-10 p-1 rounded cursor-pointer border border-gray-200"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                            />
                            <span className="text-sm text-slate-500">{formData.color}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Zmiana Hasła (opcjonalne)</h4>
                        <input
                            type="password"
                            placeholder="Nowe hasło"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Pozostaw puste, aby nie zmieniać hasła.</p>
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
