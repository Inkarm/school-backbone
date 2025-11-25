'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    TooltipProps
} from 'recharts';

interface PaymentMethodPieChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-lg text-sm">
                <span className="font-medium text-slate-900">{payload[0].name}: </span>
                <span className="text-slate-600">
                    {payload[0].value?.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </span>
            </div>
        );
    }
    return null;
};

export default function PaymentMethodPieChart({ data }: PaymentMethodPieChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-slate-600 text-sm ml-1">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
