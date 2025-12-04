'use client';

import { useState, useEffect } from 'react';
import AddStudentModal from '@/components/AddStudentModal';
import AddPaymentModal from '@/components/AddPaymentModal';
import NoticeBoardWidget from '@/components/notices/NoticeBoardWidget';
import SubstituteModal from '@/components/SubstituteModal';

interface DashboardStats {
    todayClasses: number;
    totalStudents: number;
    monthlyRevenue: number;
    totalGroups: number;
    totalTrainers: number;
}

export default function AdminDashboard() {
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        todayClasses: 0,
        totalStudents: 0,
        monthlyRevenue: 0,
        totalGroups: 0,
        totalTrainers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}k`;
        }
        return amount.toFixed(0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Ładowanie pulpitu...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">Witaj, Admin 👋</h2>
                <p className="text-slate-500">Oto co się dzieje dzisiaj w Twojej szkole.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="clean-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-6xl text-slate-900">📅</span>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Dzisiejsze zajęcia</h3>
                    <p className="text-4xl font-bold text-slate-900">{stats.todayClasses}</p>
                </div>

                <div className="clean-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-6xl text-slate-900">👥</span>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Uczniowie</h3>
                    <p className="text-4xl font-bold text-slate-900">{stats.totalStudents}</p>
                </div>

                <div className="clean-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-6xl text-slate-900">💰</span>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Wpłaty (Msc)</h3>
                    <p className="text-4xl font-bold text-emerald-600">{formatCurrency(stats.monthlyRevenue)} PLN</p>
                </div>

                <div className="clean-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="text-6xl text-slate-900">🎓</span>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Grupy</h3>
                    <p className="text-4xl font-bold text-indigo-600">{stats.totalGroups}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 clean-card p-8">
                    <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900">Szybkie akcje</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsStudentModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <span>+</span> Dodaj Ucznia
                        </button>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="btn-secondary"
                        >
                            Nowa Wpłata
                        </button>
                        <button
                            onClick={() => setIsSubstituteModalOpen(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            🔄 Zastępstwo
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 h-full">
                    <NoticeBoardWidget />
                </div>
            </div>

            <AddStudentModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                onSuccess={fetchStats}
            />

            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />

            <SubstituteModal
                isOpen={isSubstituteModalOpen}
                onClose={() => setIsSubstituteModalOpen(false)}
                onSuccess={() => { }}
            />
        </div>
    );
}
