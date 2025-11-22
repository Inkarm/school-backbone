'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Pulpit', href: '/', icon: '⊞' }, // Using unicode for now, can be replaced with icons
        { label: 'Uczniowie', href: '/students', icon: '👥' },
        { label: 'Kursy', href: '/courses', icon: '📖' }, // Added to match reference
        { label: 'Sale', href: '/rooms', icon: '🏢' }, // Added to match reference
        { label: 'Trenerzy', href: '/trainers', icon: '👨‍🏫' }, // Added to match reference
        { label: 'Grafik', href: '/schedule', icon: '📅' },
        { label: 'Obecność', href: '/attendance', icon: '✅' },
        { label: 'Płatności', href: '/finances', icon: '💳' },
        { label: 'Raporty', href: '/finances/reports', icon: '📄' },
    ];

    return (
        <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-slate-900">Poezja Tańca</h1>
                <p className="text-xs text-slate-500 mt-1">Panel zarządzania</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
              `}
                        >
                            <span className="text-lg opacity-80">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <span>↪</span>
                    <span>Wyloguj</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
