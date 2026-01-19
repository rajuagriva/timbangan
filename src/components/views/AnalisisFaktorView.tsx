import React, { useState, useMemo } from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    BrainCircuit, Filter, CloudRain, DollarSign, Scale, Clock, Calendar, MapPin, TrendingUp, Grid3X3, FastForward, Activity, AlertCircle
} from 'lucide-react';
import type { Ticket, WeatherLog, PriceHistory } from '../../types';

interface AnalisisFaktorViewProps {
    data: Ticket[];
    weatherLogs: WeatherLog[];
    priceHistory: PriceHistory[];
    theme: any;
    isDarkMode: boolean;
    formatNumber: (n: number) => string;
}

type MetricKey = 'netto' | 'janjang' | 'bjr' | 'rainfall' | 'price' | 'duration';

interface MetricOption {
    key: MetricKey;
    label: string;
    unit: string;
    icon: React.ReactNode;
    color: string;
}

const METRICS: MetricOption[] = [
    { key: 'netto', label: 'Total Netto', unit: 'kg', icon: <Scale size={14} />, color: '#10b981' }, // emerald
    { key: 'janjang', label: 'Total Janjang', unit: 'jjg', icon: <Scale size={14} />, color: '#f59e0b' }, // amber
    { key: 'bjr', label: 'Rata-rata BJR', unit: 'kg', icon: <Scale size={14} />, color: '#6366f1' }, // indigo
    { key: 'rainfall', label: 'Curah Hujan', unit: 'mm', icon: <CloudRain size={14} />, color: '#3b82f6' }, // blue
    { key: 'price', label: 'Harga TBS', unit: 'Rp', icon: <DollarSign size={14} />, color: '#8b5cf6' }, // violet
    { key: 'duration', label: 'Durasi Bongkar', unit: 'mnt', icon: <Clock size={14} />, color: '#ef4444' }, // red
];

// Locations for filter (Hardcoded for now based on typical data, could be dynamic)
const LOCATIONS = ['ALL', 'AFD A', 'AFD B', 'AFD C', 'AFD D', 'AFD E', 'AFD F', 'AFD G', 'AFD H', 'PLASMA'];

const DAY_COLORS = [
    '#ef4444', // Sun - Red
    '#3b82f6', // Mon - Blue
    '#10b981', // Tue - Green
    '#f59e0b', // Wed - Amber
    '#8b5cf6', // Thu - Violet
    '#ec4899', // Fri - Pink
    '#6366f1'  // Sat - Indigo
];

const AnalisisFaktorView: React.FC<AnalisisFaktorViewProps> = ({
    data, weatherLogs, priceHistory, theme, isDarkMode, formatNumber
}) => {
    // Current Mode State
    const [viewMode, setViewMode] = useState<'scatter' | 'matrix'>('scatter');
    const [xAxis, setXAxis] = useState<MetricKey>('rainfall');
    const [yAxis, setYAxis] = useState<MetricKey>('netto');

    // Filters & Advanced Config
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [locationFilter, setLocationFilter] = useState('ALL');
    const [lagDays, setLagDays] = useState(0);
    const [colorByDay, setColorByDay] = useState(false);
    const [showOutliersOnly, setShowOutliersOnly] = useState(false);

    // --- Helper: Calculate Correlation ---
    const calculateCorrelation = (inputData: any[], keyX: string, keyY: string) => {
        const n = inputData.length;
        if (n < 2) return 0;

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        inputData.forEach(item => {
            const x = item[keyX] || 0;
            const y = item[keyY] || 0;
            sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; sumY2 += y * y;
        });

        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
        return denominator === 0 ? 0 : numerator / denominator;
    };

    // --- DATA PREPARATION ---
    const correlationData = useMemo(() => {
        const dailyStats: Record<string, any> = {};

        // 1. Filter Base Data
        let filteredData = data;
        if (startDate) filteredData = filteredData.filter(t => t.tanggal >= startDate);
        if (endDate) filteredData = filteredData.filter(t => t.tanggal <= endDate);
        if (locationFilter !== 'ALL') filteredData = filteredData.filter(t => t.lokasi && t.lokasi.includes(locationFilter));

        // 2. Aggregate Ticket Data
        filteredData.forEach(t => {
            const date = t.tanggal;
            if (!dailyStats[date]) {
                dailyStats[date] = { date, netto: 0, janjang: 0, count: 0, durationSum: 0, rainfall: 0, price: 0 };
            }
            dailyStats[date].netto += t.netto;
            dailyStats[date].janjang += t.janjang;
            dailyStats[date].count += 1;

            // Duration Mock
            const entrance = parseInt(t.jam_masuk.replace(':', ''));
            const exit = parseInt(t.jam_keluar.replace(':', ''));
            let dur = 0;
            if (exit >= entrance) {
                const h = Math.floor((exit - entrance) / 100);
                const m = (exit - entrance) % 100;
                dur = h * 60 + m;
            }
            dailyStats[date].durationSum += dur;
        });

        // 3. Weather Data (Global, or should it be location specific? Global for now as `weatherLogs` is global)
        weatherLogs.forEach(w => {
            if (!dailyStats[w.date]) dailyStats[w.date] = { date: w.date, netto: 0, janjang: 0, count: 0, durationSum: 0, rainfall: 0, price: 0 };
            dailyStats[w.date].rainfall = w.rainfall;
        });

        // 4. Price History
        const sortedPrices = [...priceHistory].sort((a, b) => b.effective_date.localeCompare(a.effective_date));

        // 5. Finalize & Apply Lag
        let result = Object.values(dailyStats).map((stat: any) => {
            const activePrice = sortedPrices.find(p => p.effective_date <= stat.date);
            stat.price = activePrice ? activePrice.price : 0;
            stat.bjr = stat.janjang > 0 ? stat.netto / stat.janjang : 0;
            stat.duration = stat.count > 0 ? stat.durationSum / stat.count : 0;

            // Add metadata
            const d = new Date(stat.date);
            stat.dayOfWeek = d.getDay(); // 0 = Sun
            return stat;
        });

        // Remove valid operational days if filtering by tickets (already done by init)
        // But we added weather days. Let's filter again by date range if weather added output dates
        if (startDate) result = result.filter(d => d.date >= startDate);
        if (endDate) result = result.filter(d => d.date <= endDate);

        // --- APPLY TIME LAG ---
        // We shift the Independent Variable (X) by `lagDays`.
        // e.g. lag = +1. Today's Y (Harvest) corresponds to Yesterday's X (Rain).
        // X[t] maps to Y[t + lag] ? No usually: Influence of X on Y (lagged).
        // Standard: Y_today vs X_(today - lag).
        // So we want to map: Item.x = Data[date - lag].x, Item.y = Data[date].y

        if (lagDays !== 0) {
            const dateMap = new Map(result.map(i => [i.date, i]));
            const laggedResult: any[] = [];

            result.forEach(itemY => {
                const targetDate = new Date(itemY.date);
                targetDate.setDate(targetDate.getDate() - lagDays); // Look back/forward
                const dateStr = targetDate.toISOString().split('T')[0];
                const itemX = dateMap.get(dateStr);

                if (itemX) {
                    // Create composite item: All Y props from itemY, X prop from itemX
                    // But X axis is dynamic. So we simply construct a new object with X-metrics from itemX and Y-metrics from itemY
                    // WAIT: This is complex because we don't know which is X and Y until render.
                    // Solution: Create a "Lagged" version of metrics in the object?
                    // Simpler: Just reconstruct the object where ALL metrics are from Y, EXCEPT the current `xAxis` metric which comes from X.
                    // BUT `viewMode` matrix needs ALL correlations.
                    // BETTER: We only support Lag Analysis in SCATTER mode for specific X/Y.
                    // For Global Matrix, Lag is weird. Let's assume Lag applies to "Environmental/External" factors impacting "Output".

                    // Allow robust approach:
                    // If Lag != 0, we create a strict X vs Y dataset just for the scatter plot.
                    // For Matrix, we disable Lag or apply it globally (everything vs everything is messy).
                    // Let's implement specific Lag logic inside the chart rendering or just modify the `xAxis` value in the data.

                    const newItem = { ...itemY };
                    // Overwrite the X-axis metric with its lagged value
                    newItem[xAxis] = itemX[xAxis];
                    laggedResult.push(newItem);
                }
            });
            return laggedResult;
        }

        // Filter out empty rows if they have no useful data (optional)
        return result.filter(r => (r.netto > 0 || r.rainfall > 0));
    }, [data, weatherLogs, priceHistory, startDate, endDate, locationFilter, lagDays, xAxis]); // Re-calc when xAxis changes if lag is active!

    // --- ANOMALY DETECTION ---
    const { correlationInfo, processedDataWithOutliers } = useMemo(() => {
        const res = correlationData;
        const n = res.length;
        if (n < 2) return { correlationInfo: { r: 0, trend: [] }, processedDataWithOutliers: [] };

        // 1. Calc Regression
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        let minX = Infinity, maxX = -Infinity;

        res.forEach(item => {
            const x = item[xAxis] || 0;
            const y = item[yAxis] || 0;
            sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; sumY2 += y * y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
        });

        const denominatorSlope = (n * sumX2) - (sumX * sumX);
        const slope = denominatorSlope === 0 ? 0 : ((n * sumXY) - (sumX * sumY)) / denominatorSlope;
        const intercept = (sumY - slope * sumX) / n;

        // Correlation R
        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
        const r = denominator === 0 ? 0 : numerator / denominator;

        // 2. Identify Outliers (Residual > 1.5 * STD)
        // Calculate residuals
        const residuals = res.map(item => {
            const x = item[xAxis] || 0;
            const y = item[yAxis] || 0;
            const predictedY = slope * x + intercept;
            return Math.abs(y - predictedY);
        });

        // Calc STD of residuals
        const meanRes = residuals.reduce((a, b) => a + b, 0) / n;
        const variance = residuals.reduce((a, b) => a + Math.pow(b - meanRes, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        const threshold = stdDev * 1.5; // 1.5 Sigma

        const dataWithOutliers = res.map((item, idx) => {
            const residual = residuals[idx];
            const isOutlier = residual > threshold && residual > 0; // Ensure it's not just zero-zero perfectly fitting
            return { ...item, isOutlier, residual };
        });

        // Trend Line Points
        const p1 = { [xAxis]: minX, [yAxis]: slope * minX + intercept };
        const p2 = { [xAxis]: maxX, [yAxis]: slope * maxX + intercept };

        return {
            correlationInfo: { r, trendLine: [p1, p2], slope, intercept, stdDev },
            processedDataWithOutliers: dataWithOutliers
        };

    }, [correlationData, xAxis, yAxis]);

    // --- CORRELATION MATRIX DATA ---
    const matrixData = useMemo(() => {
        if (viewMode !== 'matrix') return [];
        // Calculate All vs All
        const matrix: { x: string, y: string, r: number }[] = [];
        METRICS.forEach(mX => {
            METRICS.forEach(mY => {
                const r = calculateCorrelation(correlationData, mX.key, mY.key);
                matrix.push({ x: mX.key, y: mY.key, r });
            });
        });
        return matrix;
    }, [correlationData, viewMode]);


    // --- UI HELPERS ---
    const getCorrelationStrength = (r: number) => {
        const absR = Math.abs(r);
        if (absR >= 0.7) return { text: 'Sangat Kuat', color: 'text-emerald-500', bg: 'bg-emerald-100' };
        if (absR >= 0.5) return { text: 'Kuat', color: 'text-emerald-400', bg: 'bg-emerald-50' };
        if (absR >= 0.3) return { text: 'Sedang', color: 'text-yellow-500', bg: 'bg-yellow-50' };
        return { text: 'Lemah', color: 'text-slate-400', bg: 'bg-slate-100' };
    };

    const strength = getCorrelationStrength(correlationInfo?.r || 0);
    const xOption = METRICS.find(m => m.key === xAxis);
    const yOption = METRICS.find(m => m.key === yAxis);

    const filteredChartData = showOutliersOnly
        ? processedDataWithOutliers.filter(d => d.isOutlier)
        : processedDataWithOutliers;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BrainCircuit className="text-purple-500" /> Analisis Korelasi Faktor
                    </h2>
                    <p className={`text-sm ${theme.subtext}`}>Temukan hubungan tersembunyi dengan analisis Time-Lag & Anomali.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('scatter')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'scatter' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500'}`}
                    >
                        <TrendingUp size={14} /> Scatter Plot
                    </button>
                    <button
                        onClick={() => setViewMode('matrix')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'matrix' ? 'bg-white dark:bg-slate-700 shadow text-purple-600' : 'text-slate-500'}`}
                    >
                        <Grid3X3 size={14} /> Matrix Heatmap
                    </button>
                </div>
            </div>

            {/* Filters Area */}
            <div className={`p-4 rounded-xl border ${theme.card} flex flex-wrap gap-4 items-end`}>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12} /> Start</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`px-2 py-1.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12} /> End</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`px-2 py-1.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MapPin size={12} /> Lokasi</label>
                    <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className={`px-2 py-1.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                        {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>

                {/* ADVANCED: Time Lag Slider */}
                <div className="space-y-1 flex-grow min-w-[200px] border-l pl-4 ml-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-bold text-purple-500 uppercase flex items-center gap-1"><FastForward size={12} /> Time Lag (Geser)</label>
                        <span className="text-xs font-mono font-bold">{lagDays > 0 ? `+${lagDays}` : lagDays} Hari</span>
                    </div>
                    <input
                        type="range" min="-7" max="7" step="1"
                        value={lagDays} onChange={(e) => setLagDays(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>-7</span><span>0</span><span>+7</span>
                    </div>
                </div>

                {(startDate || endDate || locationFilter !== 'ALL' || lagDays !== 0) && (
                    <button onClick={() => { setStartDate(''); setEndDate(''); setLocationFilter('ALL'); setLagDays(0); }} className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg pb-3">Reset</button>
                )}
            </div>

            {viewMode === 'scatter' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Control Panel */}
                    <div className={`col-span-1 p-5 rounded-2xl border ${theme.card} space-y-4`}>
                        <h3 className="font-bold flex items-center gap-2 text-sm"><Filter size={16} /> Axis Selection</h3>
                        {/* X Axis */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">X Axis (Sebab)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {METRICS.map(m => (
                                    <button key={`x-${m.key}`} onClick={() => setXAxis(m.key)} className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs text-left ${xAxis === m.key ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'border-transparent hover:bg-slate-50'} transition-all`}>
                                        <div className="p-1 rounded text-white" style={{ backgroundColor: m.color }}>{m.icon}</div>
                                        <span className="truncate">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Y Axis */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Y Axis (Akibat)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {METRICS.map(m => (
                                    <button key={`y-${m.key}`} onClick={() => setYAxis(m.key)} className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs text-left ${yAxis === m.key ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'border-transparent hover:bg-slate-50'} transition-all`}>
                                        <div className="p-1 rounded text-white" style={{ backgroundColor: m.color }}>{m.icon}</div>
                                        <span className="truncate">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-dashed" />

                        {/* Visual Options */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={colorByDay} onChange={e => setColorByDay(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 accent-purple-500" />
                                <span className={`text-xs ${theme.text}`}>Warnai per Hari (Senin-Minggu)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={showOutliersOnly} onChange={e => setShowOutliersOnly(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500 accent-purple-500" />
                                <span className={`text-xs ${theme.text} flex items-center gap-1`}>
                                    Tampilkan Anomali Saja <AlertCircle size={10} className="text-red-500" />
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className={`col-span-2 p-6 rounded-2xl border ${theme.card} flex flex-col relative`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">Scatter Regression</h3>
                                <p className="text-xs text-slate-500">
                                    {xAxis === 'rainfall' && lagDays > 0 ? `Curah Hujan (H-${lagDays}) vs ${yOption?.label} (Hari Ini)` : 'Titik mewakili hari operasional'}
                                </p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-right ${strength.bg}`}>
                                <h4 className={`text-xl font-black ${strength.color}`}>{correlationInfo.r.toFixed(2)}</h4>
                                <span className={`text-[10px] font-bold uppercase opacity-70 ${strength.color}`}>{strength.text}</span>
                            </div>
                        </div>

                        <div className="flex-grow min-h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                    <XAxis type="number" dataKey={xAxis} name={xOption?.label} unit={xOption?.unit} tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        label={{ value: xOption?.label + (lagDays !== 0 ? ` (Lag ${lagDays}d)` : ''), position: 'bottom', offset: 0, fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis type="number" dataKey={yAxis} name={yOption?.label} unit={yOption?.unit} tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        label={{ value: yOption?.label, angle: -90, position: 'left', fontSize: 12, fill: '#94a3b8' }} />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                if (!d.date && d[xAxis] !== undefined) return null; // Trend line skip
                                                return (
                                                    <div className={`p-3 rounded-lg shadow-xl border ${theme.card} ${theme.text} text-xs z-50`}>
                                                        <div className="flex justify-between items-center mb-2 border-b pb-1">
                                                            <span className="font-bold">{d.date}</span>
                                                            {d.isOutlier && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">ANOMALI</span>}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between gap-3"><span className="opacity-70">{xOption?.label}:</span> <span className="font-mono font-bold">{formatNumber(d[xAxis])} {xOption?.unit}</span></div>
                                                            <div className="flex justify-between gap-3"><span className="opacity-70">{yOption?.label}:</span> <span className="font-mono font-bold">{formatNumber(d[yAxis])} {yOption?.unit}</span></div>
                                                            {lagDays !== 0 && <div className="text-[10px] text-purple-500 italic mt-1 pt-1 border-t border-dashed">Data {xOption?.label} digeser {lagDays} hari</div>}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Data" data={filteredChartData} fill="#8884d8">
                                        {filteredChartData.map((entry, index) => {
                                            let finalColor = yOption?.color || '#8884d8';
                                            if (colorByDay) finalColor = DAY_COLORS[entry.dayOfWeek];
                                            if (entry.isOutlier) return <Cell key={`cell-${index}`} fill="transparent" stroke="#ef4444" strokeWidth={2} />;
                                            return <Cell key={`cell-${index}`} fill={finalColor} fillOpacity={0.6} />;
                                        })}
                                    </Scatter>
                                    <Scatter name="Trend" data={correlationInfo.trendLine} line={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }} shape={() => <g />} legendType="none" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                /* MATRIX HEATMAP VIEW */
                <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">Correlation Matrix Heatmap</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="p-2"></th>
                                    {METRICS.map(m => (
                                        <th key={m.key} className="p-2 text-center text-slate-500 uppercase">{m.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {METRICS.map(row => (
                                    <tr key={row.key}>
                                        <th className="p-2 text-right text-slate-500 uppercase font-bold">{row.label}</th>
                                        {METRICS.map(col => {
                                            const cell = matrixData.find(c => c.x === col.key && c.y === row.key);
                                            const r = cell ? cell.r : 0;
                                            const intensity = Math.abs(r);
                                            // Color Logic: Red = Negative, Green = Positive
                                            const hue = r > 0 ? 150 : 0; // 150=Green/Emerald, 0=Red
                                            const alpha = 0.1 + (intensity * 0.9);
                                            const bgColor = `hsla(${hue}, 70%, 50%, ${alpha})`;
                                            const textColor = intensity > 0.5 ? 'white' : 'black';

                                            return (
                                                <td key={`${row.key}-${col.key}`} className="p-2 text-center border dark:border-slate-700">
                                                    <div
                                                        className="w-full h-10 rounded flex items-center justify-center font-bold font-mono transition-all hover:scale-105"
                                                        style={{ backgroundColor: bgColor, color: textColor }}
                                                        title={`${row.label} vs ${col.label}: ${r.toFixed(3)}`}
                                                    >
                                                        {r.toFixed(2)}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* AI Smart Insight */}
            <div className={`p-6 rounded-2xl border border-l-4 border-l-purple-500 ${theme.card} flex items-start gap-4`}>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl mt-1">
                    <Activity size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-lg text-purple-700 dark:text-purple-400 mb-1">AI Analytical Insight</h4>
                    <p className={`${theme.subtext} text-sm leading-relaxed`}>
                        {viewMode === 'matrix' ?
                            "Mode Matriks menampilkan ringkasan korelasi antar semua variabel. Kotak Hijau pekat menunjukkan hubungan positif kuat, Merah pekat menunjukkan hubungan negatif kuat. Cari kotak dengan warna paling mencolok untuk menemukan pola penting."
                            :
                            <>
                                Korelasi <b>{xOption?.label}</b> vs <b>{yOption?.label}</b> adalah
                                <span className="font-bold lowercase"> {strength.text}</span> ({correlationInfo.r.toFixed(2)}).
                                {lagDays !== 0 && <span> Dengan <b>Time Lag {lagDays} hari</b>.</span>}
                                {Math.abs(correlationInfo.r) > 0.5 ? " Hubungan signifikan terdeteksi." : " Hubungan relatif lemah."}
                                <br />
                                <span className="text-xs opacity-70 italic flex items-center gap-1 mt-1">
                                    <AlertCircle size={10} className="text-red-500" /> Deteksi {processedDataWithOutliers.filter(d => d.isOutlier).length} titik Anomali (lingkaran merah) yang menyimpang {'>'}1.5σ dari tren normal.
                                </span>
                            </>
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalisisFaktorView;
