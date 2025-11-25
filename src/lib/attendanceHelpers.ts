// Helper functions for attendance calculations and operations

interface AttendanceRecord {
    id: number;
    studentId: number;
    eventId: number;
    present: boolean;
    createdAt: Date;
    updatedAt: Date;
    student: {
        id: number;
        firstName: string;
        lastName: string;
    };
    event: {
        id: number;
        date: Date;
        startTime: string;
        group: {
            name: string;
        };
    };
}

interface MonthlyAttendance {
    month: string; // YYYY-MM
    total: number;
    attended: number;
    percentage: number;
}

/**
 * Calculate attendance percentage
 */
export function calculateAttendanceRate(attended: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((attended / total) * 1000) / 10; // Round to 1 decimal place
}

/**
 * Group attendance records by month
 */
export function groupByMonth(records: AttendanceRecord[]): MonthlyAttendance[] {
    const monthlyMap: Record<string, { total: number; attended: number }> = {};

    records.forEach(record => {
        const month = record.event.date.toISOString().slice(0, 7); // YYYY-MM format

        if (!monthlyMap[month]) {
            monthlyMap[month] = { total: 0, attended: 0 };
        }

        monthlyMap[month].total++;
        if (record.present) {
            monthlyMap[month].attended++;
        }
    });

    return Object.entries(monthlyMap)
        .map(([month, stats]) => ({
            month,
            total: stats.total,
            attended: stats.attended,
            percentage: calculateAttendanceRate(stats.attended, stats.total),
        }))
        .sort((a, b) => b.month.localeCompare(a.month)); // Most recent first
}

/**
 * Generate CSV from attendance data
 */
export function generateAttendanceCSV(records: AttendanceRecord[]): string {
    const headers = ['Data', 'Godzina', 'Grupa', 'Ucze\u0144', 'Obecno\u015b\u0107'];
    const rows = records.map(record => [
        new Date(record.event.date).toLocaleDateString('pl-PL'),
        record.event.startTime,
        record.event.group.name,
        `${record.student.firstName} ${record.student.lastName}`,
        record.present ? 'Obecny' : 'Nieobecny',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
}

/**
 * Identify students with low attendance
 */
export interface StudentAttendanceSummary {
    studentId: number;
    studentName: string;
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
}

export function getLowAttendanceStudents(
    studentSummaries: StudentAttendanceSummary[],
    threshold: number = 75
): StudentAttendanceSummary[] {
    return studentSummaries
        .filter(student => student.attendanceRate < threshold)
        .sort((a, b) => a.attendanceRate - b.attendanceRate); // Lowest first
}

/**
 * Calculate overall class attendance rate
 */
export function calculateClassAttendanceRate(
    presentCount: number,
    totalStudents: number
): number {
    return calculateAttendanceRate(presentCount, totalStudents);
}

/**
 * Format attendance percentage for display
 */
export function formatAttendanceRate(rate: number): string {
    return `${rate.toFixed(1)}%`;
}

/**
 * Get attendance status color for UI
 */
export function getAttendanceColor(rate: number): string {
    if (rate >= 90) return 'green';
    if (rate >= 75) return 'yellow';
    if (rate >= 60) return 'orange';
    return 'red';
}

/**
 * Get attendance status label
 */
export function getAttendanceLabel(rate: number): string {
    if (rate >= 90) return 'Doskonała';
    if (rate >= 75) return 'Dobra';
    if (rate >= 60) return 'Średnia';
    return 'Niska';
}
