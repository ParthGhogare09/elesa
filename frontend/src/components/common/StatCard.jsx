import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'blue', // blue, green, amber, purple, slate
  onClick,
}) {
  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h4>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${iconBgs[color] || iconBgs.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
