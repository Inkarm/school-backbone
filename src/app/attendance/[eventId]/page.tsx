'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
    const router = useRouter();

    // Mock students for the class
    const [students, setStudents] = useState([
        { id: 1, name: 'Jan Kowalski Jr.', present: true },
        { id: 2, name: 'Anna Nowak', present: true },
        { id: 3, name: 'Zofia Wiśniewska', present: false },
        { id: 4, name: 'Tomek Zieliński', present: true },
    ]);

    const toggleAttendance = (id: number) => {
        setStudents(prev => prev.map(s =>
            s.id === id ? { ...s, present: !s.present } : s
        ));
    };

    const presentCount = students.filter(s => s.present).length;

    return (
        <div className="space-y-6 max-w-md mx-auto pb-20">
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-2xl">←</button>
                <div>
                    <h2 className="text-2xl font-bold">Balet 1</h2>
                    <p className="text-[hsl(var(--text-muted))]">17:00 • {presentCount}/{students.length} Obecnych</p>
                </div>
            </header>

            <div className="space-y-3">
                {students.map(student => (
                    <div
                        key={student.id}
                        onClick={() => toggleAttendance(student.id)}
                        className={`
              p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center select-none
              ${student.present
                                ? 'bg-[hsl(var(--primary-dark))] border-[hsl(var(--primary))] text-white'
                                : 'bg-[hsl(var(--bg-card))] border-[hsl(var(--glass-border))] text-[hsl(var(--text-muted))] opacity-70'}
            `}
                    >
                        <span className="font-medium text-lg">{student.name}</span>
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border
              ${student.present ? 'bg-white text-[hsl(var(--primary))] border-white' : 'border-[hsl(var(--text-muted))]'}
            `}>
                            {student.present && '✓'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto">
                <button className="btn-primary w-full py-4 text-lg shadow-xl">
                    Zapisz Obecność
                </button>
            </div>
        </div>
    );
}
