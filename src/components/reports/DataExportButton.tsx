'use client';

interface DataExportButtonProps {
    data: any[];
    filename: string;
    label?: string;
}

export default function DataExportButton({ data, filename, label = 'Eksportuj CSV' }: DataExportButtonProps) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert('Brak danych do eksportu');
            return;
        }

        // 1. Get headers from first object
        const headers = Object.keys(data[0]);

        // 2. Create CSV content
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Handle strings with commas or quotes
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');

        // 3. Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Pobierz dane jako CSV"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {label}
        </button>
    );
}
