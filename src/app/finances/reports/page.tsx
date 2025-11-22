export default function ReportsPage() {
    // Mock data
    const trainers = [
        { id: 1, name: 'Anna Nowak', hours: 24, rate: 50, total: 1200 },
        { id: 2, name: 'Piotr Kowalski', hours: 16, rate: 60, total: 960 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Raport Trenerów</h2>
                    <p className="text-[hsl(var(--text-muted))]">Rozliczenie za Listopad 2023.</p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--glass-bg))]">
                    Eksportuj PDF
                </button>
            </div>

            <div className="glass-panel p-6">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[hsl(var(--text-muted))] border-b border-[hsl(var(--glass-border))]">
                            <th className="p-4">Trener</th>
                            <th className="p-4">Liczba Godzin</th>
                            <th className="p-4">Stawka</th>
                            <th className="p-4">Do Wypłaty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainers.map(trainer => (
                            <tr key={trainer.id} className="border-b border-[hsl(var(--glass-border))] hover:bg-[hsl(var(--glass-bg))]">
                                <td className="p-4 font-medium">{trainer.name}</td>
                                <td className="p-4">{trainer.hours}h</td>
                                <td className="p-4">{trainer.rate} PLN/h</td>
                                <td className="p-4 font-bold text-[hsl(var(--primary))]">{trainer.total} PLN</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold text-lg">
                            <td className="p-4" colSpan={3}>Suma</td>
                            <td className="p-4">{trainers.reduce((acc, t) => acc + t.total, 0)} PLN</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
