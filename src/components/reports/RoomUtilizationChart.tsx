'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface RoomUtilizationChartProps {
    data: {
        name: string;
        hours: number;
        capacity: number;
        eventsCount: number;
    }[];
}

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                <p className="font-bold text-slate-900 mb-1">{label}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-slate-600">
                        Godziny zajęć: <span className="font-medium text-indigo-600">{data.hours}h</span>
                    </p>
                    <p className="text-slate-600">
                        Liczba zajęć: <span className="font-medium text-slate-900">{data.eventsCount}</span>
                    </p>
                    <p className="text-slate-600">
                        Pojemność sali: <span className="font-medium text-slate-500">{data.capacity} os.</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function RoomUtilizationChart({ data }: RoomUtilizationChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
