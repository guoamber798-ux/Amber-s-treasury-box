import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subValue, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80 flex items-start justify-between transition-all hover:shadow-md hover:border-indigo-100 group">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subValue && <p className="text-sm text-slate-400 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className={`p-3.5 rounded-xl bg-slate-50 text-indigo-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors`}>
        {icon}
      </div>
    </div>
  );
};