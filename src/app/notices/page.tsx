'use client';

import { useState, useEffect } from 'react';
import NoticeCard from '@/components/notices/NoticeCard';
import CreateNoticeModal from '@/components/notices/CreateNoticeModal';
import { useSession } from 'next-auth/react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: string;
    isPinned: boolean;
    createdAt: string;
    author: {
        firstName: string | null;
        lastName: string | null;
        login: string;
    };
    isRead: boolean;
}

export default function NoticesPage() {
    const { data: session } = useSession();
    const [notices, setNotices] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/announcements'); // Fetch all
            if (res.ok) {
                setNotices(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch notices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleRead = (id: number) => {
        setNotices(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) return;
        try {
            const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotices(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tablica Ogłoszeń</h1>
                    <p className="text-slate-500">Komunikaty i informacje dla zespołu</p>
                </div>
                {session?.user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium flex items-center gap-2"
                    >
                        <span>+</span> Nowe Ogłoszenie
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        <span className="text-slate-400">Ładowanie ogłoszeń...</span>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-2">📭</div>
                        <h3 className="text-lg font-medium text-slate-900">Brak ogłoszeń</h3>
                        <p className="text-slate-500">Wszystko jest na bieżąco!</p>
                    </div>
                ) : (
                    notices.map(notice => (
                        <NoticeCard
                            key={notice.id}
                            notice={notice}
                            onRead={handleRead}
                            onDelete={() => handleDelete(notice.id)}
                        // onEdit={() => handleEdit(notice)} // TODO: Implement Edit Modal
                        />
                    ))
                )}
            </div>

            <CreateNoticeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchNotices}
            />
        </div>
    );
}
