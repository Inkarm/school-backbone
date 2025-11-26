import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h2>
                {description && (
                    <p className="text-sm md:text-base text-slate-500">{description}</p>
                )}
            </div>
            {action && (
                <div className="w-full md:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
}
