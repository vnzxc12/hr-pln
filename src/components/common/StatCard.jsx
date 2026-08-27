import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend, onClick }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    blue: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
    darkGreen: 'bg-teal-50 text-teal-800 border-teal-200 ring-teal-500/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    navy: 'bg-slate-100 text-slate-800 border-slate-200 ring-slate-500/20',
  };

  const iconBgMap = {
    emerald: 'bg-emerald-600 text-white',
    blue: 'bg-sky-600 text-white',
    darkGreen: 'bg-teal-700 text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-600 text-white',
    navy: 'bg-slate-800 text-white',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card transition-all ${
        onClick ? 'cursor-pointer hover:border-emerald-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shadow-sm ${iconBgMap[color] || 'bg-emerald-600 text-white'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
