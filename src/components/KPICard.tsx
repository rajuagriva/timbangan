import React, { type ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  theme: { card: string; subtext: string };
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan';
  trendData?: number[]; // Feature #31: Sparklines
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, icon, theme, color, trendData }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    red: 'text-red-500 bg-red-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
  };

  const chartColors = {
    blue: '#3b82f6',
    emerald: '#10b981',
    amber: '#f59e0b',
    purple: '#8b5cf6',
    red: '#ef4444',
    cyan: '#06b6d4',
  };

  // Transform simple array to object array for Recharts
  const chartData = trendData?.map((val, i) => ({ i, val }));

  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${theme.card} relative overflow-hidden group`}>
      {/* Sparkline Background */}
      {trendData && trendData.length > 0 && (
        <div className="absolute -bottom-4 -right-4 w-[60%] h-[60%] opacity-10 group-hover:opacity-20 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="val"
                stroke={chartColors[color]}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.subtext}`}>{title}</h4>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </span>
        <span className={`text-xs font-bold ${theme.subtext}`}>{unit}</span>
      </div>
    </div>
  );
};

export default KPICard;