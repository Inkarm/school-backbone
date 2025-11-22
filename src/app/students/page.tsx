import StudentList from '@/components/StudentList';

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Uczniowie</h2>
                    <p className="text-[hsl(var(--text-muted))]">Baza kontaktowa Twoich podopiecznych.</p>
                </div>
                <button className="btn-primary">
                    + Dodaj Ucznia
                </button>
            </div>

            <div className="glass-panel p-6">
                <StudentList />
            </div>
        </div>
    );
}
