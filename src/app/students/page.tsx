'use client';

import { useState } from 'react';
import StudentList from '@/components/StudentList';
import AddStudentModal from '@/components/AddStudentModal';

export default function StudentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Uczniowie</h2>
                    <p className="text-[hsl(var(--text-muted))]">Baza kontaktowa Twoich podopiecznych.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    + Dodaj Ucznia
                </button>
            </div>

            <div className="glass-panel p-6">
                <StudentList refreshTrigger={refreshTrigger} />
            </div>

            <AddStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
}
