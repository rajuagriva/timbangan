import React, { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  theme: { card: string; subtext: string };
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, icon, theme, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    red: 'text-red-500 bg-red-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${theme.card}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.subtext}`}>{title}</h4>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </span>
        <span className={`text-xs font-bold ${theme.subtext}`}>{unit}</span>
      </div>
    </div>
  );
};

export default KPICard;