'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import UserModal from '@/components/users/UserModal';

type UserRole = 'ADMIN' | 'TRAINER' | 'PARENT';

interface User {
    id: number;
    login: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio?: string;
    color?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId: number) => {
        if (!confirm('Czy na pewno chcesz usunąć tego użytkownika? Tej operacji nie można cofnąć.')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(undefined);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Użytkownicy Systemu</h1>
                    <p className="text-gray-500 text-sm mt-1">Zarządzaj kontami administratorów i trenerów</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Dodaj Użytkownika
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Szukaj po loginie, imieniu lub nazwisku..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Użytkownik</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rola</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dane Kontaktowe</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            Ładowanie użytkowników...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Nie znaleziono użytkowników</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-500'
                                                    }`}>
                                                    {user.firstName?.[0] || user.login[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">@{user.login}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {user.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                                                {user.role === 'ADMIN' ? 'Administrator' : 'Trener'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span>{user.email || '-'}</span>
                                                <span className="text-xs text-gray-400">{user.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edytuj"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Usuń"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                    setIsModalOpen(false);
                }}
                user={selectedUser}
            />
        </div>
    );
}
