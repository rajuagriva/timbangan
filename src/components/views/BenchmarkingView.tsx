import React, { useState, useMemo } from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import {
    Trophy, Medal, Target, TrendingUp, TrendingDown, Award, Star,
    ChevronDown, ChevronUp, Minus, X, MapPin, Zap, BarChart3, Activity
} from 'lucide-react';
import type { AfdelingBenchmark, BenchmarkTrendData, GapAnalysis } from '../../types';

interface BenchmarkingViewProps {
    benchmarkData: AfdelingBenchmark[];
    trendData: BenchmarkTrendData[];
    theme: any;
    isDarkMode: boolean;
    formatNumber: (n: number) => string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

// Normalize value to 0-100 scale for radar chart
const normalizeValue = (value: number, min: number, max: number): number => {
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
};

const BenchmarkingView: React.FC<BenchmarkingViewProps> = ({
    benchmarkData,
    trendData,
    theme,
    isDarkMode,
    formatNumber
}) => {
    const [sortColumn, setSortColumn] = useState<keyof AfdelingBenchmark>('score');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedAfdeling, setSelectedAfdeling] = useState<AfdelingBenchmark | null>(null);
    const [highlightedAfdeling, setHighlightedAfdeling] = useState<string | null>(null);

    // Sort data
    const sortedData = useMemo(() => {
        return [...benchmarkData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
            }
            return 0;
        });
    }, [benchmarkData, sortColumn, sortDirection]);

    // Calculate radar chart data
    const radarData = useMemo(() => {
        if (benchmarkData.length === 0) return [];

        // Find min/max for normalization
        const metrics = ['totalNetto', 'avgBJR', 'tripCount', 'consistency', 'gradeAPercent'] as const;
        const minMax: Record<string, { min: number; max: number }> = {};

        metrics.forEach(metric => {
            const values = benchmarkData.map(d => d[metric]);
            minMax[metric] = { min: Math.min(...values), max: Math.max(...values) };
        });

        // Create radar points for each metric
        return [
            {
                metric: 'Volume', fullMetric: 'Total Netto (kg)', ...Object.fromEntries(
                    benchmarkData.map(d => [d.name, normalizeValue(d.totalNetto, minMax.totalNetto.min, minMax.totalNetto.max)])
                )
            },
            {
                metric: 'Kualitas', fullMetric: 'Rata-rata BJR', ...Object.fromEntries(
                    benchmarkData.map(d => [d.name, normalizeValue(d.avgBJR, minMax.avgBJR.min, minMax.avgBJR.max)])
                )
            },
            {
                metric: 'Aktivitas', fullMetric: 'Jumlah Trip', ...Object.fromEntries(
                    benchmarkData.map(d => [d.name, normalizeValue(d.tripCount, minMax.tripCount.min, minMax.tripCount.max)])
                )
            },
            {
                metric: 'Konsistensi', fullMetric: 'Supply Consistency', ...Object.fromEntries(
                    benchmarkData.map(d => [d.name, d.consistency])
                )
            },
            {
                metric: 'Grade A', fullMetric: 'Persentase Grade A', ...Object.fromEntries(
                    benchmarkData.map(d => [d.name, d.gradeAPercent])
                )
            },
        ];
    }, [benchmarkData]);

    // Gap analysis for selected or top afdeling
    const gapAnalysis = useMemo((): GapAnalysis[] => {
        if (benchmarkData.length === 0) return [];
        const target = selectedAfdeling || sortedData[0];
        if (!target) return [];

        const avgNetto = benchmarkData.reduce((s, d) => s + d.totalNetto, 0) / benchmarkData.length;
        const avgBJR = benchmarkData.reduce((s, d) => s + d.avgBJR, 0) / benchmarkData.length;
        const avgTrips = benchmarkData.reduce((s, d) => s + d.tripCount, 0) / benchmarkData.length;
        const avgConsistency = benchmarkData.reduce((s, d) => s + d.consistency, 0) / benchmarkData.length;

        const bestNetto = Math.max(...benchmarkData.map(d => d.totalNetto));
        const bestBJR = Math.max(...benchmarkData.map(d => d.avgBJR));
        const bestTrips = Math.max(...benchmarkData.map(d => d.tripCount));
        const bestConsistency = Math.max(...benchmarkData.map(d => d.consistency));

        return [
            {
                metric: 'Volume (Netto)',
                value: target.totalNetto,
                average: avgNetto,
                best: bestNetto,
                gapToAverage: target.totalNetto - avgNetto,
                gapToBest: target.totalNetto - bestNetto,
                percentToAverage: avgNetto > 0 ? ((target.totalNetto - avgNetto) / avgNetto) * 100 : 0,
                percentToBest: bestNetto > 0 ? ((target.totalNetto - bestNetto) / bestNetto) * 100 : 0,
            },
            {
                metric: 'Kualitas (BJR)',
                value: target.avgBJR,
                average: avgBJR,
                best: bestBJR,
                gapToAverage: target.avgBJR - avgBJR,
                gapToBest: target.avgBJR - bestBJR,
                percentToAverage: avgBJR > 0 ? ((target.avgBJR - avgBJR) / avgBJR) * 100 : 0,
                percentToBest: bestBJR > 0 ? ((target.avgBJR - bestBJR) / bestBJR) * 100 : 0,
            },
            {
                metric: 'Aktivitas (Trip)',
                value: target.tripCount,
                average: avgTrips,
                best: bestTrips,
                gapToAverage: target.tripCount - avgTrips,
                gapToBest: target.tripCount - bestTrips,
                percentToAverage: avgTrips > 0 ? ((target.tripCount - avgTrips) / avgTrips) * 100 : 0,
                percentToBest: bestTrips > 0 ? ((target.tripCount - bestTrips) / bestTrips) * 100 : 0,
            },
            {
                metric: 'Konsistensi',
                value: target.consistency,
                average: avgConsistency,
                best: bestConsistency,
                gapToAverage: target.consistency - avgConsistency,
                gapToBest: target.consistency - bestConsistency,
                percentToAverage: avgConsistency > 0 ? ((target.consistency - avgConsistency) / avgConsistency) * 100 : 0,
                percentToBest: bestConsistency > 0 ? ((target.consistency - bestConsistency) / bestConsistency) * 100 : 0,
            },
        ];
    }, [benchmarkData, selectedAfdeling, sortedData]);

    // Best performer
    const bestPerformer = sortedData[0];

    const handleSort = (column: keyof AfdelingBenchmark) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy size={16} className="text-amber-500" fill="#f59e0b" />;
        if (rank === 2) return <Medal size={16} className="text-slate-400" />;
        if (rank === 3) return <Medal size={16} className="text-amber-700" />;
        return <span className="text-xs text-slate-400">{rank}</span>;
    };

    const SortIcon = ({ column }: { column: keyof AfdelingBenchmark }) => {
        if (sortColumn !== column) return <ChevronDown size={12} className="opacity-30" />;
        return sortDirection === 'desc'
            ? <ChevronDown size={12} className="text-emerald-500" />
            : <ChevronUp size={12} className="text-emerald-500" />;
    };

    if (benchmarkData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <BarChart3 size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold mb-2">Belum Ada Data Benchmark</h3>
                <p className={`text-sm ${theme.subtext}`}>Data benchmarking akan muncul setelah ada data dari minimal 2 afdeling.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Target className="text-emerald-500" />
                        Benchmarking Afdeling
                    </h2>
                    <p className={`text-sm ${theme.subtext}`}>
                        Perbandingan performa antar afdeling secara head-to-head
                    </p>
                </div>
                {bestPerformer && (
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800`}>
                        <Trophy className="text-amber-500" size={24} fill="#f59e0b" />
                        <div>
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Best Performer</p>
                            <p className="font-bold text-amber-800 dark:text-amber-300">{bestPerformer.name}</p>
                        </div>
                        <span className="text-lg font-black text-amber-600">{bestPerformer.score.toFixed(0)}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme.card}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" />
                            Perbandingan Multi-Metrik
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {benchmarkData.slice(0, 6).map((d, i) => (
                                <button
                                    key={d.name}
                                    onClick={() => setHighlightedAfdeling(highlightedAfdeling === d.name ? null : d.name)}
                                    className={`text-[10px] px-2 py-1 rounded-full font-medium transition-all ${highlightedAfdeling === d.name
                                        ? 'ring-2 ring-offset-1 ring-slate-400'
                                        : 'opacity-70 hover:opacity-100'
                                        }`}
                                    style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}
                                >
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <PolarAngleAxis
                                    dataKey="metric"
                                    tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    tick={{ fontSize: 9, fill: isDarkMode ? '#64748b' : '#94a3b8' }}
                                />
                                {benchmarkData.slice(0, 6).map((d, i) => (
                                    <Radar
                                        key={d.name}
                                        name={d.name}
                                        dataKey={d.name}
                                        stroke={COLORS[i % COLORS.length]}
                                        fill={COLORS[i % COLORS.length]}
                                        fillOpacity={highlightedAfdeling === d.name ? 0.4 : highlightedAfdeling ? 0.05 : 0.15}
                                        strokeWidth={highlightedAfdeling === d.name ? 3 : 1}
                                    />
                                ))}
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    formatter={(value) => [`${(value as number).toFixed(0)}%`, '']}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-slate-400 mt-2">
                        Nilai dinormalisasi ke skala 0-100 untuk perbandingan yang adil antar metrik
                    </p>
                </div>

                {/* Gap Analysis Cards */}
                <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border ${theme.card}`}>
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-purple-500" />
                            Gap Analysis
                            {(selectedAfdeling || bestPerformer) && (
                                <span className="ml-auto text-xs font-normal text-slate-400">
                                    {selectedAfdeling?.name || bestPerformer?.name}
                                </span>
                            )}
                        </h3>
                        <div className="space-y-3">
                            {gapAnalysis.map((gap, idx) => (
                                <div key={idx} className={`p-3 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium">{gap.metric}</span>
                                        <span className="font-bold text-sm">{formatNumber(Math.round(gap.value))}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">vs Rata-rata</span>
                                            <span className={`font-bold flex items-center gap-0.5 ${gap.percentToAverage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {gap.percentToAverage >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {gap.percentToAverage >= 0 ? '+' : ''}{gap.percentToAverage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">vs Terbaik</span>
                                            <span className={`font-bold flex items-center gap-0.5 ${gap.percentToBest >= 0 ? 'text-emerald-500' : gap.percentToBest === 0 ? 'text-slate-400' : 'text-amber-500'}`}>
                                                {gap.percentToBest > 0 ? <TrendingUp size={10} /> : gap.percentToBest < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                                {gap.percentToBest >= 0 ? '+' : ''}{gap.percentToBest.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Best Practice Highlight */}
                    {bestPerformer && (
                        <div className={`p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10`}>
                            <h3 className="font-bold text-sm flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                                <Award size={16} />
                                Best Practice
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-emerald-600 dark:text-emerald-500">Konsistensi Supply</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{bestPerformer.consistency.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-600 dark:text-emerald-500">Grade A Rate</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{bestPerformer.gradeAPercent.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-emerald-600 dark:text-emerald-500">Avg BJR</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{bestPerformer.avgBJR.toFixed(2)} kg</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-3 leading-relaxed">
                                💡 {bestPerformer.name} menunjukkan performa terbaik dengan kombinasi volume tinggi dan kualitas konsisten.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Ranking Table */}
            <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Trophy size={18} className="text-amber-500" />
                        Ranking Afdeling
                    </h3>
                    <span className="text-xs text-slate-400">{benchmarkData.length} Afdeling</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className={`${theme.tableHeader} text-xs uppercase`}>
                            <tr>
                                <th className="px-4 py-3 text-left w-16">Rank</th>
                                <th className="px-4 py-3 text-left">Afdeling</th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('totalNetto')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Volume (kg) <SortIcon column="totalNetto" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('avgBJR')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Avg BJR <SortIcon column="avgBJR" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('tripCount')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Trip <SortIcon column="tripCount" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('consistency')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Konsistensi <SortIcon column="consistency" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('gradeAPercent')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Grade A <SortIcon column="gradeAPercent" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => handleSort('score')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Score <SortIcon column="score" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {sortedData.map((afd, idx) => (
                                <tr
                                    key={afd.name}
                                    className={`${theme.hover} transition-colors cursor-pointer ${selectedAfdeling?.name === afd.name ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                                    onClick={() => setSelectedAfdeling(selectedAfdeling?.name === afd.name ? null : afd)}
                                    onMouseEnter={() => setHighlightedAfdeling(afd.name)}
                                    onMouseLeave={() => setHighlightedAfdeling(null)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700">
                                            {getRankBadge(idx + 1)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            <div>
                                                <span className="font-bold">{afd.name}</span>
                                                {idx === 0 && <Star size={12} className="inline ml-1 text-amber-500" fill="#f59e0b" />}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">{formatNumber(afd.totalNetto)}</td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        <span className={`${afd.avgBJR >= 20 ? 'text-emerald-500' : afd.avgBJR >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                                            {afd.avgBJR.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">{afd.tripCount}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${afd.consistency}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-xs">{afd.consistency.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">{afd.gradeAPercent.toFixed(0)}%</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            idx <= 2 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                            {afd.score.toFixed(0)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3-Month Trend Chart */}
            {trendData.length > 0 && (
                <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-emerald-500" />
                        Tren Performa 3 Bulan Terakhir
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis
                                    dataKey="displayMonth"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                />
                                <RechartsTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    formatter={(value) => [formatNumber(value as number) + ' kg', '']}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                {benchmarkData.slice(0, 6).map((d, i) => (
                                    <Line
                                        key={d.name}
                                        type="monotone"
                                        dataKey={`data.${d.name}`}
                                        name={d.name}
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth={highlightedAfdeling === d.name ? 3 : 2}
                                        dot={{ r: highlightedAfdeling === d.name ? 5 : 3, fill: COLORS[i % COLORS.length] }}
                                        opacity={highlightedAfdeling && highlightedAfdeling !== d.name ? 0.3 : 1}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Drill-down Modal */}
            {selectedAfdeling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${theme.card} border ${theme.border} bg-white dark:bg-slate-800`}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <MapPin className="text-emerald-500" />
                                        {selectedAfdeling.fullName || selectedAfdeling.name}
                                    </h3>
                                    <p className={`text-sm ${theme.subtext}`}>Detail performa afdeling</p>
                                </div>
                                <button onClick={() => setSelectedAfdeling(null)} className="p-1 rounded-full hover:bg-black/10 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                    <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Total Volume</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatNumber(selectedAfdeling.totalNetto)} KG</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                    <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Rata-rata BJR</p>
                                    <p className="text-lg font-bold text-amber-600">{selectedAfdeling.avgBJR.toFixed(2)} KG</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                    <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Total Trip</p>
                                    <p className="text-lg font-bold text-blue-600">{selectedAfdeling.tripCount} Unit</p>
                                </div>
                                <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                    <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Konsistensi</p>
                                    <p className="text-lg font-bold text-purple-600">{selectedAfdeling.consistency.toFixed(0)}%</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Composite Score</span>
                                    <span className="text-2xl font-black text-emerald-600">{selectedAfdeling.score.toFixed(0)}</span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                                        style={{ width: `${selectedAfdeling.score}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setSelectedAfdeling(null)}
                                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BenchmarkingView;
