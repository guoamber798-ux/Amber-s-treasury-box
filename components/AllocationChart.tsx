import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDataPoint } from '../types';

interface AllocationChartProps {
  data: ChartDataPoint[];
}

// Cool Tech Palette: Indigo, Blue, Cyan, Violet, Fuchsia, Teal
const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#8b5cf6', '#d946ef', '#2dd4bf'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 shadow-xl rounded-xl">
        <p className="font-bold text-slate-800 text-sm mb-1">{data.name}</p>
        <p className="text-indigo-600 font-semibold text-lg">
          ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="mt-2 text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">
          {(data.percent * 100).toFixed(1)}% of portfolio
        </div>
      </div>
    );
  }
  return null;
};

export const AllocationChart: React.FC<AllocationChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <p>No assets to display</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};