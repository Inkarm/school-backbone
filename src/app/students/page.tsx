'use client';

import { useState } from 'react';
import StudentList from '@/components/StudentList';
import AddStudentModal from '@/components/AddStudentModal';

import PageHeader from '@/components/ui/PageHeader';

export default function StudentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Uczniowie"
                description="Baza kontaktowa Twoich podopiecznych."
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary w-full md:w-auto justify-center"
                    >
                        + Dodaj Ucznia
                    </button>
                }
            />

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
