import React from 'react';
import { 
  PieChart, Pie, Legend, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Star, AlertOctagon, TrendingUp, Ribbon, MapPin, X
} from 'lucide-react';

interface KualitasViewProps {
  qualityAnalytics: any;
  theme: any;
  isDarkMode: boolean;
  formatNumber: (n: number) => string;
  setSelectedLocation: (loc: string | null) => void;
}

const GRADE_COLORS = { A: '#10b981', B: '#f59e0b', C: '#ef4444' };

const KualitasView: React.FC<KualitasViewProps> = ({
  qualityAnalytics, theme, isDarkMode, formatNumber, setSelectedLocation
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header Kualitas */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Star className="text-emerald-500" fill="#10b981" /> Matriks Kualitas Sawit</h2>
                <p className={`text-sm ${theme.subtext}`}>Analisis korelasi Kuantitas (Berat) vs Kualitas (BJR).</p>
            </div>
             <div className="flex gap-4">
                <div className={`flex items-center bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg gap-2 border border-emerald-200 dark:border-emerald-800`}>
                   <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">A (Super)</span>
                   <span className="font-bold text-lg">{qualityAnalytics.gradeCounts.A}</span>
                </div>
                <div className={`flex items-center bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-lg gap-2 border border-orange-200 dark:border-orange-800`}>
                   <span className="font-bold text-orange-700 dark:text-orange-400 text-xs">B (Normal)</span>
                   <span className="font-bold text-lg">{qualityAnalytics.gradeCounts.B}</span>
                </div>
                <div className={`flex items-center bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg gap-2 border border-red-200 dark:border-red-800`}>
                   <span className="font-bold text-red-700 dark:text-red-400 text-xs">C (Low)</span>
                   <span className="font-bold text-lg">{qualityAnalytics.gradeCounts.C}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. SCATTER PLOT (THE MATRIX) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme.card}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2">
                        <AlertOctagon size={18} className="text-purple-500"/>
                        Peta Kualitas (Berat vs BJR)
                    </h3>
                    <div className="text-[10px] text-slate-400 flex gap-2">
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Grade A</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Grade B</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Grade C</span>
                    </div>
                </div>
                
                <div className="h-[350px] w-full relative">
                     {/* Quadrant Backgrounds (Visual Guide) */}
                     <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-5">
                        <div className="bg-red-500 border-r border-b border-slate-900/10"></div> {/* Low Netto, High BJR */}
                        <div className="bg-emerald-500 border-b border-slate-900/10"></div> {/* High Netto, High BJR */}
                        <div className="bg-red-900 border-r border-slate-900/10"></div> {/* Low Netto, Low BJR */}
                        <div className="bg-orange-500"></div> {/* High Netto, Low BJR */}
                     </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                            <XAxis type="number" dataKey="x" name="Netto" unit=" kg" tick={{fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                            <YAxis type="number" dataKey="y" name="BJR" unit=" kg" tick={{fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b'}} domain={[0, 'auto']} />
                            <ZAxis type="number" dataKey="z" range={[50, 50]} /> {/* Fixed dot size */}
                            <RechartsTooltip 
                                cursor={{strokeDasharray: '3 3'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className={`p-3 rounded-lg shadow-lg border ${theme.card} ${theme.text} text-xs`}>
                                                <p className="font-bold mb-1">{data.nopol}</p>
                                                <p className="opacity-70 mb-2">{data.lokasi}</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between gap-4"><span>Netto:</span> <span className="font-mono">{formatNumber(data.x)} kg</span></div>
                                                    <div className="flex justify-between gap-4"><span>BJR:</span> <span className={`font-mono font-bold ${data.y >= 20 ? 'text-emerald-500' : data.y >= 10 ? 'text-orange-500' : 'text-red-500'}`}>{data.y} kg</span></div>
                                                    <div className="flex justify-between gap-4"><span>Grade:</span> 
                                                        <span className={`px-1.5 rounded text-[10px] font-bold ${data.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : data.grade === 'B' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                            {data.grade}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Tiket" data={qualityAnalytics.scatterData}>
                                {qualityAnalytics.scatterData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as 'A'|'B'|'C']} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                 <p className="text-xs text-center text-slate-400 mt-2">Sumbu X: Berat Netto (Kuantitas) • Sumbu Y: Berat Janjang Rata-rata (Kualitas)</p>
            </div>

            {/* 2. PIE CHART & LEADERBOARD (RIGHT COL) */}
            <div className="space-y-6">
                {/* Pie Chart */}
                 <div className={`p-6 rounded-2xl border ${theme.card}`}>
                    <h3 className="font-bold mb-4 text-sm flex items-center gap-2">Distribusi Grade Hari Ini</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={qualityAnalytics.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {qualityAnalytics.pieData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Leaderboard Table */}
                 <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
                     <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                         <h3 className="font-bold text-sm flex items-center gap-2">
                            <Ribbon size={16} className="text-amber-500"/> Top Kualitas Lokasi
                         </h3>
                     </div>
                     <div className="divide-y divide-slate-100 dark:divide-slate-700">
                         {qualityAnalytics.locationLeaderboard.map((loc: any, idx: number) => (
                             <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                 <div className="flex items-center gap-3">
                                     <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
                                     <span className="text-xs font-medium">{loc.name}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className={`text-xs font-mono font-bold ${loc.avgBJR >= 20 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                        {loc.avgBJR.toFixed(2)}
                                     </span>
                                     <span className="text-[9px] text-slate-400 ml-1">BJR</span>
                                 </div>
                             </div>
                         ))}
                         {qualityAnalytics.locationLeaderboard.length === 0 && (
                             <div className="p-4 text-center text-xs text-slate-400">Belum ada data</div>
                         )}
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default KualitasView;