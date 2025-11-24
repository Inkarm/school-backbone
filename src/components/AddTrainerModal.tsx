'use client';

import { useState } from 'react';

interface AddTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddTrainerModal({ isOpen, onClose, onSuccess }: AddTrainerModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        login: '',
        password: '',
        email: '',
        phone: '',
        color: '#3b82f6', // Default blue
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'trainer',
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create trainer');
            }

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                login: '',
                password: '',
                email: '',
                phone: '',
                color: '#3b82f6',
            });
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="clean-card p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-900">Dodaj Nowego Trenera</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Login</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formData.login}
                            onChange={e => setFormData({ ...formData, login: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
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

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Anuluj</button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? 'Zapisywanie...' : 'Dodaj Trenera'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
