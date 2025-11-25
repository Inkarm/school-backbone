'use client';

import { formatAttendanceRate, getAttendanceColor, getAttendanceLabel } from '@/lib/attendanceHelpers';

interface AttendanceStatsProps {
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
    compact?: boolean;
}

export default function AttendanceStats({
    totalClasses,
    attendedClasses,
    attendanceRate,
    compact = false
}: AttendanceStatsProps) {
    const rateColor = getAttendanceColor(attendanceRate);
    const rateLabel = getAttendanceLabel(attendanceRate);

    // Color mapping for Tailwind classes
    const colorClasses = {
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-700',
            textDark: 'text-green-900',
            progress: 'bg-green-500',
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-700',
            textDark: 'text-yellow-900',
            progress: 'bg-yellow-500',
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-700',
            textDark: 'text-orange-900',
            progress: 'bg-orange-500',
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            textDark: 'text-red-900',
            progress: 'bg-red-500',
        },
        gray: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            text: 'text-gray-700',
            textDark: 'text-gray-900',
            progress: 'bg-gray-500',
        },
    };

    const colors = colorClasses[rateColor as keyof typeof colorClasses] || colorClasses.gray;

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Frekwencja</span>
                        <span className="font-medium">{attendedClasses}/{totalClasses}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} transition-all duration-300`}
                            style={{ width: `${attendanceRate}%` }}
                        />
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.border} border`}>
                    <span className={`text-sm font-bold ${colors.textDark}`}>
                        {attendanceRate.toFixed(1)}%
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Statystyki obecności</h3>
                <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-medium border ${colors.border}`}>
                    {rateLabel}
                </span>
            </div>

            <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                        <span>Frekwencja</span>
                        <span className={`font-bold text-lg ${colors.textDark}`}>
                            {attendanceRate.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} transition-all duration-500`}
                            style={{ width: `${attendanceRate}%` }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Łącznie zajęć</p>
                        <p className="text-2xl font-bold text-slate-900">{totalClasses}</p>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Obecności</p>
                        <p className="text-2xl font-bold text-green-600">{attendedClasses}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
