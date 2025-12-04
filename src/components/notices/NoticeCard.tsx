import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
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

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: {
        firstName: string | null;
        lastName: string | null;
        login: string;
        role: string;
    };
}

interface NoticeCardProps {
    notice: Announcement;
    onRead?: (id: number) => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

export default function NoticeCard({ notice, onRead, onDelete, onEdit }: NoticeCardProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [reactions, setReactions] = useState<Record<string, number>>({});
    const [userReactions, setUserReactions] = useState<string[]>([]);

    const isAdmin = session?.user?.role === 'ADMIN';

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

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/announcements/${notice.id}/comments`);
            if (res.ok) setComments(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`/api/announcements/${notice.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                const comment = await res.json();
                setComments([...comments, comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReaction = async (emoji: string) => {
        // Optimistic update
        const isAdded = !userReactions.includes(emoji);
        setUserReactions(prev => isAdded ? [...prev, emoji] : prev.filter(e => e !== emoji));
        setReactions(prev => ({
            ...prev,
            [emoji]: (prev[emoji] || 0) + (isAdded ? 1 : -1)
        }));

        try {
            await fetch(`/api/announcements/${notice.id}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji })
            });
        } catch (error) {
            console.error(error);
            // Revert on error? For now, ignore.
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-50 border-red-200 text-red-900';
            case 'WARNING': return 'bg-amber-50 border-amber-200 text-amber-900';
            default: return 'bg-blue-50 border-blue-200 text-blue-900';
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
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-1 pr-16">{notice.title}</h3>
                        {isAdmin && (
                            <div className="flex gap-2 text-xs">
                                {onEdit && <button onClick={onEdit} className="text-blue-600 hover:underline">Edytuj</button>}
                                {onDelete && <button onClick={onDelete} className="text-red-600 hover:underline">Usuń</button>}
                            </div>
                        )}
                    </div>

                    <div className="text-sm opacity-90 whitespace-pre-wrap mb-3">{notice.content}</div>

                    {/* Reactions */}
                    <div className="flex gap-2 mb-3">
                        {['👍', '❤️', '🎉', '😮'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${userReactions.includes(emoji)
                                        ? 'bg-white border-current font-bold shadow-sm'
                                        : 'bg-transparent border-transparent hover:bg-white/50'
                                    }`}
                            >
                                {emoji} {reactions[emoji] > 0 && reactions[emoji]}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-xs opacity-75 border-t border-current/10 pt-2">
                        <div className="flex gap-2">
                            <span>👤 {notice.author.firstName ? `${notice.author.firstName} ${notice.author.lastName}` : notice.author.login}</span>
                            <span>📅 {format(new Date(notice.createdAt), 'dd MMM yyyy, HH:mm', { locale: pl })}</span>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => {
                                    setShowComments(!showComments);
                                    if (!showComments && comments.length === 0) fetchComments();
                                }}
                                className="hover:underline font-medium flex items-center gap-1"
                            >
                                💬 Komentarze
                            </button>

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

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-3 pt-3 border-t border-current/10">
                            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                {comments.length === 0 ? (
                                    <p className="text-xs italic opacity-60">Brak komentarzy. Bądź pierwszy!</p>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="bg-white/50 p-2 rounded text-sm">
                                            <div className="flex justify-between text-xs opacity-70 mb-1">
                                                <span className="font-bold">
                                                    {comment.author.firstName} {comment.author.lastName}
                                                </span>
                                                <span>{format(new Date(comment.createdAt), 'HH:mm', { locale: pl })}</span>
                                            </div>
                                            <div>{comment.content}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={handlePostComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Napisz komentarz..."
                                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Wyślij
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
