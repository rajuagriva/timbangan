import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
    value: number;
    max: number;
    label: string;
    unit: string;
    color?: string;
    thresholds?: {
        warning: number;
        danger: number;
    };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    value,
    max,
    label,
    unit,
    color = '#00f2ff', // default cyan
    thresholds
}) => {
    // Normalize value
    const normalizedValue = Math.min(Math.max(value, 0), max);

    // Determine color based on threshold if provided
    let activeColor = color;
    if (thresholds) {
        if (value >= thresholds.danger) activeColor = '#ef4444'; // Red
        else if (value >= thresholds.warning) activeColor = '#f59e0b'; // Amber
        else activeColor = '#10b981'; // Green (Safe)
    }

    // Data for the Pie (Half Donut)
    // We use angle 180 to 0 for a half circle
    const data = [
        { name: 'value', value: normalizedValue, color: activeColor },
        { name: 'rest', value: max - normalizedValue, color: '#334155' }, // Slate-700 for background
    ];

    // Logic for Needle
    // 180 degrees (left) to 0 degrees (right)
    // Needle coordinates logic can be complex with pure SVG lines inside Recharts
    // A simpler approach for Recharts is just the donut chart. 
    // But let's add a needle overlay if we can, or just stick to the donut bar which is modern standard.
    // We will stick to the donut bar + text value for cleaner sci-fi look.

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <h3 className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-2 z-10">{label}</h3>

            <div className="relative w-full aspect-[2/1] max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="70%"
                            outerRadius="90%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            <Cell key="cell-0" fill={activeColor} />
                            <Cell key="cell-1" fill="#1e293b" /> {/* Darker background */}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Value Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
                    <div className="text-4xl font-bold font-mono tracking-tighter" style={{ color: activeColor }}>
                        {value.toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs mt-1 font-mono">{unit} / {max.toLocaleString()}</div>
                </div>
            </div>

            {/* Decorative Elements for Sci-Fi feel */}
            <div className="absolute bottom-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ width: `${(normalizedValue / max) * 100}%`, backgroundColor: activeColor }}
                />
            </div>
        </div>
    );
};

export default GaugeChart;
