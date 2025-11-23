'use client';

import { useState, useEffect } from 'react';

interface Trainer {
    id: number;
    login: string;
    role: string;
}

export default function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            const res = await fetch('/api/trainers');
            if (res.ok) setTrainers(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Instruktorzy</h2>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Ładowanie...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {trainers.map(trainer => (
                        <div key={trainer.id} className="clean-card p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                    {trainer.login[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{trainer.login}</h3>
                                    <span className="text-xs uppercase tracking-wider text-slate-500">{trainer.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
