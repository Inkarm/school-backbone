'use client';

import { useState } from 'react';
import { AlertCircle, Download, Upload, CheckCircle, Loader2 } from 'lucide-react';

export default function BackupsPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleExport = async () => {
        setIsExporting(true);
        setStatus(null);
        try {
            const response = await fetch('/api/backup/export');
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setStatus({ type: 'success', message: 'Kopia zapasowa została pobrana pomyślnie.' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Nie udało się pobrać kopii zapasowej.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('UWAGA! Import danych CAŁKOWICIE nadpisze obecną bazę danych. Wszystkie obecne dane zostaną utracone. Czy na pewno chcesz kontynuować?')) {
            e.target.value = ''; // Reset input
            return;
        }

        setIsImporting(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/backup/import', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Import failed');
            }

            setStatus({ type: 'success', message: 'Dane zostały pomyślnie przywrócone. Strona zostanie odświeżona.' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setStatus({ type: 'error', message: (error as Error).message });
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Zarządzanie Systemem (Kopie Zapasowe)</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <Download className="text-blue-600 h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">Eksport Danych</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Pobierz pełną kopię zapasową bazy danych do pliku JSON. Zalecamy wykonywanie tego regularnie.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || isImporting}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
                        {isExporting ? 'Generowanie...' : 'Pobierz Kopię'}
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                    <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                        <Upload className="text-orange-600 h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">Import Danych</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Przywróć dane z pliku kopii zapasowej. <strong className="text-red-500">To działanie nadpisze wszystkie obecne dane!</strong>
                    </p>
                    <label className={`
                        w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 
                        hover:border-orange-500 hover:bg-orange-50 text-gray-600 px-4 py-2 rounded-lg transition-all cursor-pointer
                        ${isImporting ? 'opacity-50 pointer-events-none' : ''}
                    `}>
                        {isImporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        {isImporting ? 'Przywracanie...' : 'Wybierz plik do importu'}
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                    </label>
                </div>
            </div>

            {/* Status Messages */}
            {status && (
                <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {status.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                    <p>{status.message}</p>
                </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded text-sm text-gray-500">
                <h3 className="font-semibold text-gray-700 mb-2">Informacje Techniczne</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Kopie zapasowe są kompresowane (GZIP), aby oszczędzać miejsce.</li>
                    <li>System przechowuje automatycznie ostatnie 7 kopii w bazie danych.</li>
                    <li>Import jest transakcyjny - jeśli wystąpi błąd, żadne dane nie zostaną utracone.</li>
                </ul>
            </div>
        </div>
    );
}
