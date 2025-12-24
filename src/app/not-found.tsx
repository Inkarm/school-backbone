import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
            <div className="w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center">
                        <FileQuestion className="h-12 w-12 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                    Strona nie została znaleziona
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Strona, której szukasz, nie istnieje lub została przeniesiona.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Powrót do pulpitu
                </Link>
            </div>
        </div>
    );
}
