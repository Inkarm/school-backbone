import React from 'react';

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    let colorClass = 'bg-gray-100 text-gray-800';
    let label = status;

    switch (status) {
        case 'ACTIVE':
            colorClass = 'bg-green-100 text-green-800';
            label = 'Aktywny';
            break;
        case 'SUSPENDED':
            colorClass = 'bg-orange-100 text-orange-800';
            label = 'Zawieszony';
            break;
        case 'ARCHIVED':
            colorClass = 'bg-gray-100 text-gray-800';
            label = 'Zarchiwizowany';
            break;
        default:
            break;
    }

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
}
