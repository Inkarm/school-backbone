'use client';

import { useState, useEffect } from 'react';

interface Group {
    id: number;
    name: string;
    students: Array<{
        student: {
            id: number;
            firstName: string;
            lastName: string;
        }
    }>;
}

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroup();
    }, [params.id]);

    const fetchGroup = async () => {
        try {
            const res = await fetch(`/api/groups/${params.id}`);
            if (res.ok) setGroup(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Ładowanie...</div>;
    if (!group) return <div className="p-12 text-center text-red-500">Nie znaleziono grupy</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">{group.name}</h2>
            <div className="clean-card p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-900">Uczniowie w grupie</h3>
                {group.students.length === 0 ? (
                    <p className="text-slate-500">Brak uczniów w tej grupie.</p>
                ) : (
                    <ul className="space-y-2">
                        {group.students.map(({ student }) => (
                            <li key={student.id} className="p-3 bg-slate-50 rounded-lg border border-gray-200 text-slate-700">
                                {student.firstName} {student.lastName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
