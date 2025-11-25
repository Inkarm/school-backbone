'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface AddTrainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddTrainerModal({ isOpen, onClose, onSuccess }: AddTrainerModalProps) {
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        color: '#4f46e5',
        accessLevel: 1,
        accessibleGroups: [] as number[],
    });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/groups').then(res => res.json()).then(data => setGroups(data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'TRAINER' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to create trainer');
            }

            setFormData({
                login: '',
                password: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                bio: '',
                color: '#4f46e5',
                accessLevel: 1,
                accessibleGroups: [],
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Nie udało się dodać trenera');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dodaj Trenera">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Login</label>
                        <input
                            type="text"
                            value={formData.login}
                            onChange={e => setFormData({ ...formData, login: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kolor w kalendarzu</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={formData.color}
                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                            className="h-10 w-20 p-1 border border-gray-200 rounded-lg"
                        />
                        <span className="text-sm text-slate-500 self-center">{formData.color}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                    <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows={3}
                    />
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Uprawnienia</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Poziom Dostępu</label>
                        <select
                            value={formData.accessLevel}
                            onChange={e => setFormData({ ...formData, accessLevel: parseInt(e.target.value) })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value={1}>Poziom 1: Tylko własne grupy (Domyślny)</option>
                            <option value={2}>Poziom 2: Manager (Wszystkie grupy)</option>
                            <option value={3}>Poziom 3: Custom (Własne + Wybrane)</option>
                        </select>
                    </div>

                    {formData.accessLevel === 3 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Dostępne Grupy (Custom)</label>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                                {groups.map(group => (
                                    <label key={group.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.accessibleGroups.includes(group.id)}
                                            onChange={e => {
                                                const newGroups = e.target.checked
                                                    ? [...formData.accessibleGroups, group.id]
                                                    : formData.accessibleGroups.filter(id => id !== group.id);
                                                setFormData({ ...formData, accessibleGroups: newGroups });
                                            }}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{group.name}</span>
                                    </label>
                                ))}
                                {groups.length === 0 && <p className="text-xs text-slate-500 p-1">Brak grup do wyboru</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                        Anuluj
                    </button>
                    <button type="submit" className="btn-primary flex-1" disabled={loading}>
                        {loading ? 'Dodawanie...' : 'Dodaj Trenera'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
