'use client';

import { useState, useEffect } from 'react';
import RevenueChart from './RevenueChart';
import PaymentMethodPieChart from './PaymentMethodPieChart';
import StudentGrowthChart from './StudentGrowthChart';
import RoomUtilizationChart from './RoomUtilizationChart';

export default function AdvancedReportsDashboard() {
    const [revenueData, setRevenueData] = useState([]);
    const [paymentMethodData, setPaymentMethodData] = useState([]);
    const [groupRevenueData, setGroupRevenueData] = useState([]);
    const [studentGrowthData, setStudentGrowthData] = useState([]);
    const [roomUtilizationData, setRoomUtilizationData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [revenueRes, methodsRes, groupRes, growthRes, roomRes] = await Promise.all([
                    fetch('/api/reports/financial/revenue'),
                    fetch('/api/reports/financial/payment-methods'),
                    fetch('/api/reports/financial/by-group'),
                    fetch('/api/reports/students/growth'),
                    fetch('/api/reports/operations/room-utilization')
                ]);

                if (revenueRes.ok) setRevenueData(await revenueRes.json());
                if (methodsRes.ok) setPaymentMethodData(await methodsRes.json());
                if (groupRes.ok) setGroupRevenueData(await groupRes.json());
                if (growthRes.ok) setStudentGrowthData(await growthRes.json());
                if (roomRes.ok) setRoomUtilizationData(await roomRes.json());
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
            {/* Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Przychody (Ostatnie 12 m-cy)</h3>
                    <RevenueChart data={revenueData} />
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Metody Płatności</h3>
                    <PaymentMethodPieChart data={paymentMethodData} />
                </div>
            </div>

            {/* Operational & Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Growth Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Wzrost Liczby Uczniów</h3>
                    <StudentGrowthChart data={studentGrowthData} />
                </div>

                {/* Room Utilization Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Wykorzystanie Sal (Godziny)</h3>
                    <RoomUtilizationChart data={roomUtilizationData} />
                </div>
            </div>

            {/* Revenue by Group Table */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Przychody wg Grup</h3>
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
