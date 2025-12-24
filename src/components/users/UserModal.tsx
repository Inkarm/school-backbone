'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';

type UserRole = 'ADMIN' | 'TRAINER' | 'PARENT';

interface User {
    id?: number;
    login: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio?: string;
    color?: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User; // If present, we are in Edit mode
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
    const isEditMode = !!user;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        role: 'TRAINER' as UserRole,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        color: '#3b82f6',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                login: user.login,
                password: '', // Password empty on edit
                role: user.role,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                color: user.color || '#3b82f6',
            });
        } else {
            // Reset for create
            setFormData({
                login: '',
                password: '',
                role: 'TRAINER',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                bio: '',
                color: '#3b82f6',
            });
        }
        setError(null);
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const url = isEditMode ? `/api/users/${user.id}` : '/api/users';
            const method = isEditMode ? 'PUT' : 'POST';

            const payload = { ...formData };
            // If editing and password is empty, remove it from payload to not overwrite with empty string
            if (isEditMode && !payload.password) {
                delete (payload as any).password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Operation failed');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        {isEditMode ? 'Edytuj Użytkownika' : 'Dodaj Nowego Użytkownika'}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Account Info */}
                                    <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Dane Logowania</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.login}
                                                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    disabled={isEditMode} // Optional: allow editing login?
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {isEditMode ? 'Nowe Hasło (opcjonalne)' : 'Hasło'}
                                                </label>
                                                <input
                                                    required={!isEditMode}
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder={isEditMode ? 'Pozostaw puste aby nie zmieniać' : ''}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="TRAINER">Trener</option>
                                                    <option value="ADMIN">Administrator</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="md:col-span-2">
                                        <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide mt-2">Dane Osobowe</h4>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 mt-4 flex justify-end gap-3 border-t pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                                            {isEditMode ? 'Zapisz Zmiany' : 'Utwórz Użytkownika'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
