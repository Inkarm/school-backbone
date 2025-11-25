'use client';

interface MobileNavbarProps {
    onOpenSidebar: () => void;
}

export default function MobileNavbar({ onOpenSidebar }: MobileNavbarProps) {
    return (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-slate-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="font-bold text-lg text-slate-900">Poezja Tańca</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                A
            </div>
        </div>
    );
}
