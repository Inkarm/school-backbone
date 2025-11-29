import { useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

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

interface NoticeCardProps {
    notice: Announcement;
    onRead?: (id: number) => void;
}

export default function NoticeCard({ notice, onRead }: NoticeCardProps) {
    const [loading, setLoading] = useState(false);

    const handleMarkAsRead = async () => {
        if (notice.isRead || loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/announcements/${notice.id}/read`, { method: 'POST' });
            if (res.ok && onRead) {
                onRead(notice.id);
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-red-50 border-red-200 text-red-900';
            case 'WARNING':
                return 'bg-amber-50 border-amber-200 text-amber-900';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-900';
        }
    };

    const getIcon = (priority: string) => {
        switch (priority) {
            case 'URGENT': return '🚨';
            case 'WARNING': return '⚠️';
            default: return '📢';
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getPriorityStyles(notice.priority)} relative shadow-sm transition-all hover:shadow-md`}>
            {notice.isPinned && (
                <div className="absolute top-2 right-2 text-xs font-bold uppercase tracking-wider opacity-50">
                    📌 Przypięte
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className="text-2xl mt-1">{getIcon(notice.priority)}</div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 pr-16">{notice.title}</h3>
                    <div className="text-sm opacity-90 whitespace-pre-wrap mb-3">{notice.content}</div>

                    <div className="flex justify-between items-center text-xs opacity-75">
                        <div className="flex gap-2">
                            <span>👤 {notice.author.firstName ? `${notice.author.firstName} ${notice.author.lastName}` : notice.author.login}</span>
                            <span>📅 {format(new Date(notice.createdAt), 'dd MMM yyyy, HH:mm', { locale: pl })}</span>
                        </div>

                        {!notice.isRead && (
                            <button
                                onClick={handleMarkAsRead}
                                disabled={loading}
                                className="px-2 py-1 bg-white/50 hover:bg-white/80 rounded border border-current transition-colors font-medium"
                            >
                                {loading ? '...' : 'Oznacz jako przeczytane'}
                            </button>
                        )}
                        {notice.isRead && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                ✓ Przeczytano
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
