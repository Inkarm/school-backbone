'use client';

import { useState, useEffect } from 'react';
import RevenueChart from './RevenueChart';
import PaymentMethodPieChart from './PaymentMethodPieChart';
import StudentGrowthChart from './StudentGrowthChart';
import RoomUtilizationChart from './RoomUtilizationChart';
import TrainerPerformanceChart from './TrainerPerformanceChart';
import OverduePaymentsList from './OverduePaymentsList';
import DataExportButton from './DataExportButton';
import MonthlyReport from './MonthlyReport';

export default function AdvancedReportsDashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [paymentMethodData, setPaymentMethodData] = useState([]);
    const [groupRevenueData, setGroupRevenueData] = useState([]);
    const [studentGrowthData, setStudentGrowthData] = useState([]);
    const [roomUtilizationData, setRoomUtilizationData] = useState([]);
    const [trainerStatsData, setTrainerStatsData] = useState([]);
    const [overdueData, setOverdueData] = useState([]);
    const [retentionData, setRetentionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Calculate date range for trainer stats (last 30 days)
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);

                const [revenueRes, methodsRes, groupRes, growthRes, roomRes, trainerRes, overdueRes, retentionRes] = await Promise.all([
                    fetch('/api/reports/financial/revenue'),
                    fetch('/api/reports/financial/payment-methods'),
                    fetch('/api/reports/financial/by-group'),
                    fetch('/api/reports/students/growth'),
                    fetch('/api/reports/operations/room-utilization'),
                    fetch(`/api/reports/trainer-stats?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
                    fetch('/api/reports/financial/overdue'),
                    fetch('/api/reports/students/retention')
                ]);

                if (revenueRes.ok) setRevenueData(await revenueRes.json());
                if (methodsRes.ok) setPaymentMethodData(await methodsRes.json());
                if (groupRes.ok) setGroupRevenueData(await groupRes.json());
                if (growthRes.ok) setStudentGrowthData(await growthRes.json());
                if (roomRes.ok) setRoomUtilizationData(await roomRes.json());
                if (trainerRes.ok) setTrainerStatsData(await trainerRes.json());
                if (overdueRes.ok) setOverdueData(await overdueRes.json());
                if (retentionRes.ok) setRetentionData(await retentionRes.json());
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Ładowanie analityki...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Monthly Report Summary */}
            <MonthlyReport />

            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Przychody (Ostatnie 12 m-cy)</h3>
                        <DataExportButton data={revenueData} filename="przychody_roczne" label="CSV" />
                    </div>
                    <RevenueChart data={revenueData} />
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Metody Płatności</h3>
                        <DataExportButton data={paymentMethodData} filename="metody_platnosci" label="CSV" />
                    </div>
                    <PaymentMethodPieChart data={paymentMethodData} />
                </div>
            </div>

            {/* Overdue Payments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Zaległe Płatności (Bieżący miesiąc)</h3>
                    <DataExportButton data={overdueData} filename="zalegle_platnosci" label="Eksportuj listę" />
                </div>
                <OverduePaymentsList data={overdueData} />
            </div>

            {/* Trainer Performance */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Efektywność Trenerów (Ostatnie 30 dni)</h3>
                    <DataExportButton data={trainerStatsData} filename="efektywnosc_trenerow" label="CSV" />
                </div>
                <TrainerPerformanceChart data={trainerStatsData} />
            </div>

            {/* Retention Metrics */}
            {retentionData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Wskaźnik Retencji</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-indigo-600">{retentionData.retentionRate}%</span>
                            <span className="text-sm text-slate-400 mb-1">utrzymanych</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Wskaźnik Odejść (Churn)</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-red-500">{retentionData.churnRate}%</span>
                            <span className="text-sm text-slate-400 mb-1">odeszło</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Nowi Uczniowie (30 dni)</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-green-600">+{retentionData.newStudents}</span>
                            <span className="text-sm text-slate-400 mb-1">dołączyło</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Operational & Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Wzrost Liczby Uczniów</h3>
                        <DataExportButton data={studentGrowthData} filename="wzrost_uczniow" label="CSV" />
                    </div>
                    <StudentGrowthChart data={studentGrowthData} />
                </div>

                {/* Room Utilization Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Wykorzystanie Sal (Godziny)</h3>
                        <DataExportButton data={roomUtilizationData} filename="wykorzystanie_sal" label="CSV" />
                    </div>
                    <RoomUtilizationChart data={roomUtilizationData} />
                </div>
            </div>

            {/* Revenue by Group Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Przychody wg Grup</h3>
                    <DataExportButton data={groupRevenueData} filename="przychody_grupy" label="CSV" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Grupa</th>
                                <th className="px-6 py-3 text-right">Przychód</th>
                                <th className="px-6 py-3 text-right">Udział</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupRevenueData.map((group: any, index) => {
                                const totalRevenue = groupRevenueData.reduce((acc: number, curr: any) => acc + curr.value, 0);
                                const share = totalRevenue > 0 ? (group.value / totalRevenue) * 100 : 0;

                                return (
                                    <tr key={index} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{group.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            {group.value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-slate-600">{share.toFixed(1)}%</span>
                                                <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-indigo-600 h-1.5 rounded-full"
                                                        style={{ width: `${share}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
