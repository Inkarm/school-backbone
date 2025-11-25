'use client';

import { useState } from 'react';
import StudentList from '@/components/StudentList';
import AddStudentModal from '@/components/AddStudentModal';

export default function StudentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Uczniowie</h2>
                    <p className="text-sm md:text-base text-slate-500">Baza kontaktowa Twoich podopiecznych.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary w-full md:w-auto justify-center"
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
