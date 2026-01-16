import React, { useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Calendar, TrendingUp, TrendingDown, ArrowLeftRight, Sparkles, X,
    Scale, FileSpreadsheet, Truck, Activity, Timer, Minus, ChevronRight
} from 'lucide-react';
import type {
    Ticket, ComparisonKPI, ComparisonChartData, LocationComparisonData, PeriodStats
} from '../../types';

interface PerbandinganViewProps {
    allData: Ticket[];
    theme: any;
    isDarkMode: boolean;
    formatNumber: (n: number) => string;
    formatCurrency: (n: number) => string;
    isGeneratingInsight: boolean;
    comparisonInsight: string;
    setComparisonInsight: (val: string) => void;
    onGenerateComparisonInsight: (periodAStats: PeriodStats, periodBStats: PeriodStats, periodALabel: string, periodBLabel: string) => void;
}

const COLORS = {
    periodA: '#3b82f6', // Blue
    periodB: '#10b981', // Green
};

// ChartSkeleton component for future loading state
const ChartSkeleton = () => (
    <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse flex items-center justify-center border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col items-center gap-3 opacity-60">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Memuat Data...</span>
        </div>
    </div>
);
void ChartSkeleton; // Suppress unused warning - for future use

// Helper to get week start/end dates
const getWeekRange = (weeksAgo: number = 0): { start: string; end: string } => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1 - (weeksAgo * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
    };
};

// Helper to get month start/end dates
const getMonthRange = (monthsAgo: number = 0): { start: string; end: string } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() - monthsAgo;
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
    };
};

const PerbandinganView: React.FC<PerbandinganViewProps> = ({
    allData,
    theme,
    isDarkMode,
    formatNumber,
    formatCurrency,
    isGeneratingInsight,
    comparisonInsight,
    setComparisonInsight,
    onGenerateComparisonInsight
}) => {
    // Suppress unused prop warning - formatCurrency reserved for future financial calculations
    void formatCurrency;
    // Period A (Current / newer)
    const [periodAStart, setPeriodAStart] = useState(getWeekRange(0).start);
    const [periodAEnd, setPeriodAEnd] = useState(getWeekRange(0).end);

    // Period B (Previous / older)
    const [periodBStart, setPeriodBStart] = useState(getWeekRange(1).start);
    const [periodBEnd, setPeriodBEnd] = useState(getWeekRange(1).end);

    // Calculate stats for a given date range
    const calculatePeriodStats = (startDate: string, endDate: string): PeriodStats => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);

        const periodData = allData.filter(item => {
            const itemDate = new Date(item.tanggal);
            return itemDate >= start && itemDate <= end;
        });

        const totalNetto = periodData.reduce((acc, curr) => acc + curr.netto, 0);
        const totalJanjang = periodData.reduce((acc, curr) => acc + curr.janjang, 0);
        const totalTruk = periodData.length;
        const avgBJR = totalJanjang > 0 ? totalNetto / totalJanjang : 0;

        // Avg Duration
        let totalMinutes = 0;
        let validCount = 0;
        periodData.forEach(item => {
            if (item.jam_masuk && item.jam_keluar) {
                const [h1, m1] = item.jam_masuk.split(':').map(Number);
                const [h2, m2] = item.jam_keluar.split(':').map(Number);
                const d1 = new Date(2000, 0, 1, h1, m1);
                const d2 = new Date(2000, 0, 1, h2, m2);
                let diff = (d2.getTime() - d1.getTime()) / 60000;
                if (diff < 0) diff += 1440;
                if (diff > 0 && diff < 300) {
                    totalMinutes += diff;
                    validCount++;
                }
            }
        });
        const avgDuration = validCount > 0 ? Math.round(totalMinutes / validCount) : 0;

        return { totalNetto, totalJanjang, totalTruk, avgBJR, avgDuration };
    };

    // Get stats for both periods
    const periodAStats = calculatePeriodStats(periodAStart, periodAEnd);
    const periodBStats = calculatePeriodStats(periodBStart, periodBEnd);

    // Calculate KPI comparisons
    const comparisonKPIs: ComparisonKPI[] = [
        {
            name: 'Total Netto',
            periodA: periodAStats.totalNetto,
            periodB: periodBStats.totalNetto,
            delta: periodAStats.totalNetto - periodBStats.totalNetto,
            percentage: periodBStats.totalNetto > 0 ? ((periodAStats.totalNetto - periodBStats.totalNetto) / periodBStats.totalNetto) * 100 : 0,
            unit: 'KG',
            isPositiveGood: true
        },
        {
            name: 'Total Janjang',
            periodA: periodAStats.totalJanjang,
            periodB: periodBStats.totalJanjang,
            delta: periodAStats.totalJanjang - periodBStats.totalJanjang,
            percentage: periodBStats.totalJanjang > 0 ? ((periodAStats.totalJanjang - periodBStats.totalJanjang) / periodBStats.totalJanjang) * 100 : 0,
            unit: 'JJG',
            isPositiveGood: true
        },
        {
            name: 'Rata-rata BJR',
            periodA: periodAStats.avgBJR,
            periodB: periodBStats.avgBJR,
            delta: periodAStats.avgBJR - periodBStats.avgBJR,
            percentage: periodBStats.avgBJR > 0 ? ((periodAStats.avgBJR - periodBStats.avgBJR) / periodBStats.avgBJR) * 100 : 0,
            unit: 'KG',
            isPositiveGood: true
        },
        {
            name: 'Truk Masuk',
            periodA: periodAStats.totalTruk,
            periodB: periodBStats.totalTruk,
            delta: periodAStats.totalTruk - periodBStats.totalTruk,
            percentage: periodBStats.totalTruk > 0 ? ((periodAStats.totalTruk - periodBStats.totalTruk) / periodBStats.totalTruk) * 100 : 0,
            unit: 'Unit',
            isPositiveGood: true
        },
        {
            name: 'Avg Bongkar',
            periodA: periodAStats.avgDuration,
            periodB: periodBStats.avgDuration,
            delta: periodAStats.avgDuration - periodBStats.avgDuration,
            percentage: periodBStats.avgDuration > 0 ? ((periodAStats.avgDuration - periodBStats.avgDuration) / periodBStats.avgDuration) * 100 : 0,
            unit: 'Menit',
            isPositiveGood: false // Lower is better
        }
    ];

    // Generate trend chart data
    const generateTrendChartData = (): ComparisonChartData[] => {
        const startA = new Date(periodAStart);
        const endA = new Date(periodAEnd);
        const startB = new Date(periodBStart);
        const endB = new Date(periodBEnd);

        // Calculate number of days in each period
        const daysA = Math.ceil((endA.getTime() - startA.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const daysB = Math.ceil((endB.getTime() - startB.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const maxDays = Math.max(daysA, daysB);

        // Group data by date for both periods
        const periodAMap: Record<string, number> = {};
        const periodBMap: Record<string, number> = {};

        allData.forEach(item => {
            const itemDate = new Date(item.tanggal);
            if (itemDate >= startA && itemDate <= endA) {
                periodAMap[item.tanggal] = (periodAMap[item.tanggal] || 0) + item.netto;
            }
            if (itemDate >= startB && itemDate <= endB) {
                periodBMap[item.tanggal] = (periodBMap[item.tanggal] || 0) + item.netto;
            }
        });

        // Create chart data aligned by day index (Day 1, Day 2, etc.)
        const chartData: ComparisonChartData[] = [];
        for (let i = 0; i < maxDays; i++) {
            const dateA = new Date(startA);
            dateA.setDate(startA.getDate() + i);
            const dateB = new Date(startB);
            dateB.setDate(startB.getDate() + i);

            const dateAStr = dateA.toISOString().split('T')[0];
            const dateBStr = dateB.toISOString().split('T')[0];

            chartData.push({
                date: `Hari ${i + 1}`,
                displayDate: dateA.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                periodA: i < daysA ? (periodAMap[dateAStr] || 0) : null,
                periodB: i < daysB ? (periodBMap[dateBStr] || 0) : null
            });
        }

        return chartData;
    };

    // Generate location comparison data
    const generateLocationData = (): LocationComparisonData[] => {
        const startA = new Date(periodAStart);
        const endA = new Date(periodAEnd);
        endA.setHours(23, 59, 59);
        const startB = new Date(periodBStart);
        const endB = new Date(periodBEnd);
        endB.setHours(23, 59, 59);

        const locMapA: Record<string, number> = {};
        const locMapB: Record<string, number> = {};

        allData.forEach(item => {
            const itemDate = new Date(item.tanggal);
            const loc = item.lokasi || 'Unknown';

            if (itemDate >= startA && itemDate <= endA) {
                locMapA[loc] = (locMapA[loc] || 0) + item.netto;
            }
            if (itemDate >= startB && itemDate <= endB) {
                locMapB[loc] = (locMapB[loc] || 0) + item.netto;
            }
        });

        // Combine all locations
        const allLocations = new Set([...Object.keys(locMapA), ...Object.keys(locMapB)]);
        const locationData: LocationComparisonData[] = [];

        allLocations.forEach(loc => {
            const match = loc.match(/AFD\s+([A-Z0-9]+)/i);
            const shortName = match ? match[1] : loc.substring(0, 6);
            locationData.push({
                name: shortName,
                fullName: loc,
                periodA: locMapA[loc] || 0,
                periodB: locMapB[loc] || 0,
                delta: (locMapA[loc] || 0) - (locMapB[loc] || 0)
            });
        });

        return locationData.sort((a, b) => (b.periodA + b.periodB) - (a.periodA + a.periodB)).slice(0, 8);
    };

    const trendChartData = generateTrendChartData();
    const locationData = generateLocationData();

    // Preset handlers
    const setWeekPreset = () => {
        const thisWeek = getWeekRange(0);
        const lastWeek = getWeekRange(1);
        setPeriodAStart(thisWeek.start);
        setPeriodAEnd(thisWeek.end);
        setPeriodBStart(lastWeek.start);
        setPeriodBEnd(lastWeek.end);
    };

    const setMonthPreset = () => {
        const thisMonth = getMonthRange(0);
        const lastMonth = getMonthRange(1);
        setPeriodAStart(thisMonth.start);
        setPeriodAEnd(thisMonth.end);
        setPeriodBStart(lastMonth.start);
        setPeriodBEnd(lastMonth.end);
    };

    const getKPIIcon = (name: string) => {
        switch (name) {
            case 'Total Netto': return <Scale size={16} />;
            case 'Total Janjang': return <FileSpreadsheet size={16} />;
            case 'Rata-rata BJR': return <Activity size={16} />;
            case 'Truk Masuk': return <Truck size={16} />;
            case 'Avg Bongkar': return <Timer size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const formatPeriodLabel = (start: string, end: string) => {
        const s = new Date(start).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const e = new Date(end).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        return `${s} - ${e}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER & DATE PICKERS */}
            <div className={`p-6 rounded-2xl shadow-sm border ${theme.card}`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ArrowLeftRight className="text-blue-500" size={24} />
                            Perbandingan Periode
                        </h2>
                        <p className={`text-sm mt-1 ${theme.subtext}`}>
                            Bandingkan performa antara dua periode waktu yang berbeda
                        </p>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={setWeekPreset}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${theme.border} ${theme.card} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                        >
                            Minggu ini vs Minggu lalu
                        </button>
                        <button
                            onClick={setMonthPreset}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border ${theme.border} ${theme.card} hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors`}
                        >
                            Bulan ini vs Bulan lalu
                        </button>
                    </div>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Period A */}
                    <div className={`p-4 rounded-xl border-2 border-blue-500/30 ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50/50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Periode A (Baru)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={periodAStart}
                                onChange={(e) => setPeriodAStart(e.target.value)}
                                className={`bg-transparent text-sm font-bold outline-none flex-1 ${theme.text}`}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={periodAEnd}
                                onChange={(e) => setPeriodAEnd(e.target.value)}
                                className={`bg-transparent text-sm font-bold outline-none flex-1 ${theme.text}`}
                            />
                        </div>
                    </div>

                    {/* Period B */}
                    <div className={`p-4 rounded-xl border-2 border-emerald-500/30 ${isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-50/50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Periode B (Lama)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={periodBStart}
                                onChange={(e) => setPeriodBStart(e.target.value)}
                                className={`bg-transparent text-sm font-bold outline-none flex-1 ${theme.text}`}
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={periodBEnd}
                                onChange={(e) => setPeriodBEnd(e.target.value)}
                                className={`bg-transparent text-sm font-bold outline-none flex-1 ${theme.text}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI INSIGHT */}
            {comparisonInsight && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4 items-start relative z-10">
                        <div className="bg-white/20 p-2 rounded-lg"><Sparkles size={24} /></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">Analisis Perbandingan AI</h3>
                            <p className="opacity-90 text-sm leading-relaxed whitespace-pre-line">{comparisonInsight}</p>
                        </div>
                        <button onClick={() => setComparisonInsight('')} className="hover:bg-white/20 p-1 rounded"><X size={18} /></button>
                    </div>
                    <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32" />
                </div>
            )}

            {/* KPI COMPARISON CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {comparisonKPIs.map((kpi, idx) => {
                    const isPositive = kpi.delta > 0;
                    const isGood = kpi.isPositiveGood ? isPositive : !isPositive;
                    const colorClass = kpi.delta === 0 ? 'text-slate-500' : (isGood ? 'text-emerald-500' : 'text-red-500');
                    const bgClass = kpi.delta === 0 ? 'bg-slate-100 dark:bg-slate-800' : (isGood ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20');

                    return (
                        <div key={idx} className={`p-4 rounded-2xl border ${theme.card} ${bgClass}`}>
                            <div className={`flex items-center gap-2 mb-2 ${theme.subtext}`}>
                                {getKPIIcon(kpi.name)}
                                <span className="text-xs font-bold uppercase tracking-wide">{kpi.name}</span>
                            </div>

                            {/* Period Values */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-bold">{kpi.name === 'Rata-rata BJR' ? kpi.periodA.toFixed(2) : formatNumber(kpi.periodA)}</span>
                                </div>
                                <ChevronRight size={12} className="text-slate-400" />
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-bold">{kpi.name === 'Rata-rata BJR' ? kpi.periodB.toFixed(2) : formatNumber(kpi.periodB)}</span>
                                </div>
                            </div>

                            {/* Delta */}
                            <div className={`flex items-center gap-1 ${colorClass} font-bold`}>
                                {kpi.delta === 0 ? (
                                    <Minus size={14} />
                                ) : isPositive ? (
                                    <TrendingUp size={14} />
                                ) : (
                                    <TrendingDown size={14} />
                                )}
                                <span className="text-sm">
                                    {isPositive ? '+' : ''}{kpi.name === 'Rata-rata BJR' ? kpi.delta.toFixed(2) : formatNumber(kpi.delta)} {kpi.unit}
                                </span>
                                <span className="text-xs opacity-70">
                                    ({isPositive ? '+' : ''}{kpi.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Overlay Chart */}
                <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        Tren Penerimaan Harian
                    </h3>
                    <p className={`text-xs mb-4 ${theme.subtext}`}>Perbandingan netto harian kedua periode</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
                                    formatter={(value: any, name?: string) => [formatNumber(value) + ' KG', name === 'periodA' ? 'Periode A' : 'Periode B']}
                                />
                                <Legend
                                    formatter={(value) => value === 'periodA' ? `Periode A (${formatPeriodLabel(periodAStart, periodAEnd)})` : `Periode B (${formatPeriodLabel(periodBStart, periodBEnd)})`}
                                />
                                <Line type="monotone" dataKey="periodA" stroke={COLORS.periodA} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                                <Line type="monotone" dataKey="periodB" stroke={COLORS.periodB} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Location Comparison Bar Chart */}
                <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        Perbandingan per Lokasi
                    </h3>
                    <p className={`text-xs mb-4 ${theme.subtext}`}>Total netto per afdeling/lokasi</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={locationData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} width={50} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}
                                    formatter={(value: any, name?: string) => [formatNumber(value) + ' KG', name === 'periodA' ? 'Periode A' : 'Periode B']}
                                />
                                <Legend formatter={(value) => value === 'periodA' ? 'Periode A' : 'Periode B'} />
                                <Bar dataKey="periodA" fill={COLORS.periodA} radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="periodB" fill={COLORS.periodB} radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* AI ANALYSIS BUTTON */}
            <div className={`p-6 rounded-2xl border ${theme.card} flex flex-col md:flex-row justify-between items-center gap-4`}>
                <div>
                    <h3 className="font-bold flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={18} />
                        Analisis AI
                    </h3>
                    <p className={`text-sm ${theme.subtext}`}>
                        Dapatkan insight mendalam tentang perubahan performa antar periode
                    </p>
                </div>
                <button
                    onClick={() => onGenerateComparisonInsight(
                        periodAStats,
                        periodBStats,
                        formatPeriodLabel(periodAStart, periodAEnd),
                        formatPeriodLabel(periodBStart, periodBEnd)
                    )}
                    disabled={isGeneratingInsight}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingInsight ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Menganalisis...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            Analisis Perbandingan
                        </>
                    )}
                </button>
            </div>

            {/* DELTA TABLE */}
            <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-base md:text-lg font-bold">Ringkasan Perubahan KPI</h3>
                    <p className={`text-xs mt-1 ${theme.subtext}`}>Detail perbandingan semua metrik</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className={`${theme.tableHeader} font-bold uppercase text-xs`}>
                            <tr>
                                <th className="px-6 py-4 text-left">Metrik</th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Periode A
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        Periode B
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Delta</th>
                                <th className="px-6 py-4 text-right">Perubahan</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {comparisonKPIs.map((kpi, idx) => {
                                const isPositive = kpi.delta > 0;
                                const isGood = kpi.isPositiveGood ? isPositive : !isPositive;
                                const isNeutral = kpi.delta === 0;

                                return (
                                    <tr key={idx} className={theme.hover}>
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            {getKPIIcon(kpi.name)}
                                            {kpi.name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {kpi.name === 'Rata-rata BJR' ? kpi.periodA.toFixed(2) : formatNumber(kpi.periodA)} {kpi.unit}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {kpi.name === 'Rata-rata BJR' ? kpi.periodB.toFixed(2) : formatNumber(kpi.periodB)} {kpi.unit}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${isNeutral ? 'text-slate-500' : (isPositive ? 'text-blue-500' : 'text-orange-500')}`}>
                                            {isPositive ? '+' : ''}{kpi.name === 'Rata-rata BJR' ? kpi.delta.toFixed(2) : formatNumber(kpi.delta)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${isNeutral ? 'text-slate-500' : (isPositive ? 'text-blue-500' : 'text-orange-500')}`}>
                                            {isPositive ? '+' : ''}{kpi.percentage.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isNeutral
                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                : (isGood
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300')
                                                }`}>
                                                {isNeutral ? (
                                                    <><Minus size={12} /> Stabil</>
                                                ) : isGood ? (
                                                    <><TrendingUp size={12} /> Membaik</>
                                                ) : (
                                                    <><TrendingDown size={12} /> Menurun</>
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PerbandinganView;
