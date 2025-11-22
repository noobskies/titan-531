
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

interface ChartProps {
    data: any[];
    dataKey: string;
    color: string;
    title: string;
    unit?: string;
}

export const TrendChart: React.FC<ChartProps> = ({ data, dataKey, color, title, unit }) => {
    return (
        <div className="bg-card p-4 rounded-xl border border-slate-800 h-64 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tick={{fill: '#94a3b8'}} />
                    <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px' }}
                        itemStyle={{ color: color }}
                        formatter={(value: number) => [`${value} ${unit || ''}`, 'Value']}
                    />
                    <Line 
                        type="monotone" 
                        dataKey={dataKey} 
                        stroke={color} 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: color, strokeWidth: 0 }} 
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const VolumeBarChart: React.FC<ChartProps> = ({ data, dataKey, color, title }) => {
    return (
        <div className="bg-card p-4 rounded-xl border border-slate-800 h-64 shadow-lg">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="week" stroke="#475569" fontSize={10} tick={{fill: '#94a3b8'}} />
                    <YAxis stroke="#475569" fontSize={10} tick={{fill: '#94a3b8'}} />
                    <Tooltip 
                        cursor={{fill: '#1e293b', opacity: 0.4}}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
