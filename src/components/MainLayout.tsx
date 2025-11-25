'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNavbar from '@/components/MobileNavbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Navbar - visible only on small screens */}
            <MobileNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />

            {/* Sidebar - hidden on mobile unless open, always visible on desktop */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content */}
            <main className={`flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
}
