import { useState, useEffect } from 'react';
import NoticeCard from './NoticeCard';
import CreateNoticeModal from './CreateNoticeModal';
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

export default function NoticeBoardWidget() {
    const { data: session } = useSession();
    const [notices, setNotices] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/announcements?limit=3');
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

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    📢 Ogłoszenia
                </h2>
                <div className="flex gap-2">
                    {session?.user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-medium px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                        >
                            + Nowe
                        </button>
                    )}
                    <a href="/notices" className="text-xs font-medium px-2 py-1 text-slate-600 hover:bg-slate-200 rounded transition-colors">
                        Zobacz wszystkie
                    </a>
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                {loading ? (
                    <div className="text-center py-8 text-slate-400">Ładowanie...</div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 italic">
                        Brak nowych ogłoszeń
                    </div>
                ) : (
                    notices.map(notice => (
                        <NoticeCard key={notice.id} notice={notice} onRead={handleRead} />
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
