'use client';

import CalendarView from '@/components/CalendarView';
import AddClassModal from '@/components/AddClassModal';
import { useState } from 'react';

export default function SchedulePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Grafik Zajęć</h2>
                    <p className="text-[hsl(var(--text-muted))]">Zarządzaj planem zajęć na ten tydzień.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    + Dodaj Zajęcia
                </button>
            </div>

            <div className="glass-panel p-6 min-h-[600px]">
                <CalendarView refreshTrigger={refreshTrigger} />
            </div>

            <AddClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
}
