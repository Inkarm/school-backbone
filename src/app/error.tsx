'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled app error:', error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
            <div className="w-full max-w-md text-center p-8">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Wystąpił nieoczekiwany błąd
                </h2>
                <p className="text-gray-500 mb-8">
                    Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub wróć później.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Spróbuj ponownie
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded text-left overflow-auto max-h-48 text-xs text-gray-700 font-mono">
                        <p className="font-bold border-b border-gray-200 pb-2 mb-2">Developer info:</p>
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}
