'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/lib/actions';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

const Sidebar = ({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Pulpit', href: '/', icon: '⊞' },
        { label: 'Uczniowie', href: '/students', icon: '👥' },
        { label: 'Grupy', href: '/groups', icon: '👥' },
        { label: 'Sale', href: '/rooms', icon: '🏢' },
        { label: 'Trenerzy', href: '/trainers', icon: '👨‍🏫' },
        { label: 'Grafik', href: '/schedule', icon: '📅' },
        { label: 'Obecność', href: '/attendance', icon: '✅' },
        { label: 'Płatności', href: '/finances', icon: '💳' },
        { label: 'Raporty', href: '/reports', icon: '📄' },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
                flex flex-col z-50 transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Poezja Tańca</h1>
                            <p className="text-xs text-slate-500 mt-1">Panel zarządzania</p>
                        </div>
                    )}
                    {isCollapsed && (
                        <span className="text-2xl font-bold text-indigo-600">PT</span>
                    )}

                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded-md hover:bg-gray-100 text-slate-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => onClose?.()} // Close sidebar on navigation on mobile
                                className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className="text-xl opacity-80 shrink-0">{item.icon}</span>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    {/* Collapse Toggle (Desktop only) */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden md:flex items-center justify-center w-full p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    <form action={logout}>
                        <button className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                            <span className="shrink-0">↪</span>
                            {!isCollapsed && <span>Wyloguj</span>}
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
