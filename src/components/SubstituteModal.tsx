'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Trainer {
    id: number;
    firstName: string | null;
    lastName: string | null;
    login: string;
}

interface SubstituteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SubstituteModal({ isOpen, onClose, onSuccess }: SubstituteModalProps) {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [originalTrainerId, setOriginalTrainerId] = useState('');
    const [substituteTrainerId, setSubstituteTrainerId] = useState('');
    const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ updated: number; message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTrainers();
            setResult(null);
            setError('');
        }
    }, [isOpen]);

    const fetchTrainers = async () => {
        try {
            const res = await fetch('/api/trainers');
            if (res.ok) {
                const data = await res.json();
                setTrainers(data);
            }
        } catch (err) {
            console.error('Failed to fetch trainers', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalTrainerId || !substituteTrainerId) {
            setError('Wybierz obu trenerów');
            return;
        }
        if (originalTrainerId === substituteTrainerId) {
            setError('Trenerzy muszą być różni');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/schedule/substitute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalTrainerId,
                    substituteTrainerId,
                    dateFrom,
                    dateTo
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create substitution');
            }

            setResult(data);
            if (data.updated > 0) {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd');
        } finally {
            setLoading(false);
        }
    };

    const getTrainerName = (trainer: Trainer) =>
        trainer.firstName ? `${trainer.firstName} ${trainer.lastName}` : trainer.login;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">🔄 Zastępstwo</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nieobecny trener
                        </label>
                        <select
                            value={originalTrainerId}
                            onChange={e => setOriginalTrainerId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Wybierz trenera...</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{getTrainerName(t)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Zastępujący trener
                        </label>
                        <select
                            value={substituteTrainerId}
                            onChange={e => setSubstituteTrainerId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Wybierz trenera...</option>
                            {trainers.filter(t => t.id.toString() !== originalTrainerId).map(t => (
                                <option key={t.id} value={t.id}>{getTrainerName(t)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Od dnia
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Do dnia
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                min={dateFrom}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className={`px-4 py-2 rounded-lg text-sm ${result.updated > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                            {result.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-slate-700 hover:bg-gray-50"
                        >
                            Zamknij
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Zapisuję...' : 'Zapisz zastępstwo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
