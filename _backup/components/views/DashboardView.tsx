import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { 
  Upload, Download, Truck, Scale, FileSpreadsheet, Database, 
  CheckCircle, Sparkles, X, Search, Trophy, Activity, AlertTriangle, 
  Megaphone, Timer, Plus, Trash2, ChevronDown, TrendingUp, Calendar
} from 'lucide-react';
import KPICard from '../KPICard';
import { Ticket, DashboardStats, Announcement } from '../../types';

interface DashboardViewProps {
  stats: DashboardStats;
  chartData: any;
  filteredData: Ticket[];
  announcements: Announcement[];
  loadingData: boolean;
  theme: any;
  isDarkMode: boolean;
  isAdmin: boolean;
  isKioskMode: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchCategory: string;
  setSearchCategory: (val: any) => void;
  tbsPrice: number;
  setTbsPrice: (val: number) => void;
  aiInsight: string;
  setAiInsight: (val: string) => void;
  newAnnouncementContent: string;
  setNewAnnouncementContent: (val: string) => void;
  // Actions
  handleGenerateInsight: () => void;
  isGeneratingInsight: boolean;
  handleAddAnnouncementAction: () => void;
  handleDeleteAnnouncementAction: (id: number) => void;
  handleFileUpload: (e: any) => void;
  handleBackupData: () => void;
  uploadStatus: string;
  uploadMessage: string;
  // Selection
  setSelectedTicket: (t: Ticket | null) => void;
  setSelectedLocation: (loc: string | null) => void;
  // Formatters
  formatNumber: (n: number) => string;
  formatCurrency: (n: number) => string;
  formatIndoDate: (d: Date) => string;
  // Date Filters
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  timeFilter: string;
  setTimeFilter: (f: any) => void;
}

const ChartSkeleton = () => (
  <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse flex items-center justify-center border border-slate-100 dark:border-slate-700">
    <div className="flex flex-col items-center gap-3 opacity-60">
       <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-600 border-t-emerald-500 rounded-full animate-spin"></div>
       <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Memuat Data...</span>
    </div>
  </div>
);

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const DashboardView: React.FC<DashboardViewProps> = ({
  stats, chartData, filteredData, announcements, loadingData, theme, isDarkMode, isAdmin, isKioskMode,
  searchQuery, setSearchQuery, searchCategory, setSearchCategory, tbsPrice, setTbsPrice,
  aiInsight, setAiInsight, newAnnouncementContent, setNewAnnouncementContent,
  handleGenerateInsight, isGeneratingInsight, handleAddAnnouncementAction, handleDeleteAnnouncementAction,
  handleFileUpload, handleBackupData, uploadStatus, uploadMessage,
  setSelectedTicket, setSelectedLocation,
  formatNumber, formatCurrency, formatIndoDate,
  customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, timeFilter, setTimeFilter
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Meter & Financials */}
        <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${theme.card}`}>
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
            <div className="flex-1">
                <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${theme.subtext}`}>
                <Activity size={16} /> Target Logistik
                </h3>
                <div className="text-2xl md:text-3xl font-bold mt-1 flex items-baseline gap-2">
                {formatNumber(stats.totalNetto)} <span className="text-xs md:text-sm font-normal text-slate-400">/ {formatNumber(stats.currentTarget || 0)} KG</span>
                </div>
            </div>
            
            {/* Financial Estimator */}
            <div className={`p-3 rounded-xl border ${theme.border} ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} flex flex-col items-end min-w-[200px]`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase ${theme.subtext}`}>Harga TBS/Kg</span>
                    {/* Hide Input in Kiosk Mode */}
                    {isKioskMode ? (
                        <span className="text-xs font-bold">{formatCurrency(tbsPrice)}</span>
                    ) : (
                    <input 
                    type="number" 
                    value={tbsPrice} 
                    onChange={(e) => setTbsPrice(Number(e.target.value))}
                    className={`w-20 text-right text-xs font-bold bg-transparent border-b ${theme.border} outline-none focus:border-emerald-500`}
                    />
                    )}
                </div>
                <div className="text-emerald-500 font-bold text-lg md:text-xl">
                    {formatCurrency(stats.totalNetto * tbsPrice)}
                </div>
                <p className="text-[10px] text-slate-400">Estimasi Pendapatan</p>
            </div>

            <div className={`text-right ${stats.targetPercent >= 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
                <span className="text-xl md:text-2xl font-bold">{stats.targetPercent.toFixed(1)}%</span>
            </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
            <div className={`h-full rounded-full transition-all duration-1000 ${stats.targetPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${stats.targetPercent}%` }}></div>
            </div>
            <p className="text-xs mt-3 text-slate-400">
            {stats.targetPercent >= 100 ? "🎉 Target tercapai!" : "⚡ Tingkatkan supply buah masuk."}
            </p>
        </div>

        {/* Top Supplier (Clickable for Analytics) */}
        <div className={`p-6 rounded-2xl shadow-sm border ${theme.card}`}>
            <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${theme.subtext}`}>
            <Trophy size={16} className="text-amber-500" /> Top Supplier
            </h3>
            <div className="space-y-4 max-h-[140px] overflow-y-auto">
            {chartData.locations.slice(0, 3).map((loc: any, idx: number) => (
                <div 
                    key={idx} 
                    onClick={() => setSelectedLocation(loc.fullName)}
                    className="flex items-center gap-3 cursor-pointer group p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    title="Klik untuk analisis detail"
                >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm truncate group-hover:text-emerald-500 transition-colors">{loc.fullName}</p>
                    <p className={`text-xs ${theme.subtext}`}>{formatNumber(loc.value)} KG</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp size={14} className="text-emerald-500" />
                </div>
                </div>
            ))}
            {chartData.locations.length === 0 && <p className="text-sm text-slate-400 italic">Belum ada data</p>}
            </div>
        </div>
        </div>

        {/* AI INSIGHT */}
        {aiInsight && !isKioskMode && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-4 items-start relative z-10">
            <div className="bg-white/20 p-2 rounded-lg"><Sparkles size={24} /></div>
            <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Analisis Gemini AI</h3>
                <p className="opacity-90 text-sm leading-relaxed">{aiInsight}</p>
            </div>
            <button onClick={() => setAiInsight('')} className="hover:bg-white/20 p-1 rounded"><X size={18} /></button>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32" />
        </div>
        )}

        {/* KPI STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Netto" value={stats.totalNetto} unit="KG" icon={<Scale />} theme={theme} color="blue" />
        <KPICard title="Total Janjang" value={stats.totalJanjang} unit="JJG" icon={<FileSpreadsheet />} theme={theme} color="emerald" />
        <KPICard title="Rata-rata BJR" value={stats.avgBJR} unit="KG" icon={<Activity />} theme={theme} color="amber" />
        <KPICard title="Truk Masuk" value={stats.totalTruk} unit="Unit" icon={<Truck />} theme={theme} color="purple" />
        <KPICard title="Avg Bongkar" value={stats.avgDuration} unit="Mnt" icon={<Timer />} theme={theme} color={stats.avgDuration > 60 ? "red" : "cyan"} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 Cols) */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme.card}`}>
            <h3 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2"><span className="w-1 h-6 bg-emerald-500 rounded-full"></span> Tren Penerimaan</h3>
            <div className="h-[250px] md:h-[300px]">
            {loadingData ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.trend}>
                <defs>
                    <linearGradient id="colorNetto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} tickFormatter={(v) => `${v/1000}k`} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}} />
                <Area type="monotone" dataKey="total" stroke="#059669" fillOpacity={1} fill="url(#colorNetto)" />
                </AreaChart>
            </ResponsiveContainer>
            )}
            </div>
        </div>

        {/* Jam Sibuk (1 Col) - VERTICAL */}
        <div className={`lg:col-span-1 p-6 rounded-2xl border ${theme.card}`}>
            <h3 className="text-base md:text-lg font-bold mb-2">Jam Sibuk</h3>
            <p className={`text-xs mb-6 ${theme.subtext}`}>07:00 - 22:00</p>
            <div className="h-[250px] md:h-[300px]">
            {loadingData ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.peakHours} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10}} 
                    interval={2} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {chartData.peakHours.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`rgba(139, 92, 246, ${0.4 + (entry.count / 10)})`} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            )}
            </div>
        </div>

        {/* Distribusi Wilayah (Clickable for Analytics) */}
        <div className={`lg:col-span-3 p-6 rounded-2xl border ${theme.card}`}>
            <h3 className="text-base md:text-lg font-bold mb-2">Distribusi Wilayah</h3>
            <p className={`text-xs mb-6 ${theme.subtext}`}>Proporsi Netto per Lokasi (Klik chart untuk detail)</p>
            <div className="h-[250px] md:h-[300px]">
            {loadingData ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={chartData.locations} 
                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                    onClick={(data: any) => {
                        if (data && data.activePayload && data.activePayload.length > 0) {
                            setSelectedLocation(data.activePayload[0].payload.fullName);
                        }
                    }}
                    className="cursor-pointer"
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b'}} tickFormatter={(v) => `${(v/1000).toFixed(0)}T`} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.locations.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            )}
            </div>
        </div>
        </div>

        {/* DATA TABLE */}
        <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
            <h3 className="text-base md:text-lg font-bold">Data Tiket Masuk</h3>
            <p className={`text-xs mt-1 ${theme.subtext}`}>Klik baris untuk lihat Tiket Digital</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto">
             {/* DATE RANGE FILTER IN TABLE HEADER */}
             <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme.border} ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} w-full md:w-auto`}>
                 <Calendar size={14} className="text-slate-400 shrink-0"/>
                 <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => {
                        setTimeFilter('custom');
                        setCustomStartDate(e.target.value);
                    }}
                    className="bg-transparent text-xs font-bold outline-none w-full md:w-auto"
                 />
                 <span className="text-slate-400">-</span>
                 <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => {
                        setTimeFilter('custom');
                        setCustomEndDate(e.target.value);
                    }}
                    className="bg-transparent text-xs font-bold outline-none w-full md:w-auto"
                 />
             </div>

            <div className={`relative flex items-center w-full md:w-80 rounded-xl border ${theme.border} ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="relative border-r border-gray-200 dark:border-gray-700">
                <select 
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value as any)}
                    className={`appearance-none bg-transparent pl-4 pr-8 py-2.5 text-xs font-bold uppercase outline-none cursor-pointer ${theme.text} hover:bg-black/5 rounded-l-xl`}
                >
                    <option value="all">Semua</option>
                    <option value="ticket">Tiket</option>
                    <option value="nopol">Nopol</option>
                    <option value="location">Lokasi</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
                <input 
                type="text" 
                placeholder="Cari data..."
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-3 pr-4 py-2.5 bg-transparent outline-none text-xs md:text-sm" 
                />
                <div className="pr-3 text-slate-400">
                <Search size={18} />
                </div>
            </div>
            </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
            {loadingData ? (
                <div className="p-8 text-center text-slate-500">Memuat data dari Supabase...</div>
            ) : (
            <table className="w-full text-xs md:text-sm text-left relative">
            <thead className={`${theme.tableHeader} font-bold uppercase text-[10px] md:text-xs sticky top-0 z-10`}>
                <tr>
                <th className="px-4 md:px-6 py-4">Waktu (In - Out)</th>
                <th className="px-4 md:px-6 py-4">No. Tiket</th>
                <th className="px-4 md:px-6 py-4">No. Polisi</th>
                <th className="px-4 md:px-6 py-4">Lokasi</th>
                <th className="px-4 md:px-6 py-4 text-right">Janjang</th>
                <th className="px-4 md:px-6 py-4 text-right">Netto (KG)</th>
                <th className="px-4 md:px-6 py-4 text-center">BJR / Grade</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredData.map((row, idx) => {
                const bjr = row.janjang > 0 ? (row.netto / row.janjang) : 0;
                
                // Grading System
                let grade = "C";
                let gradeColor = "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
                if (bjr >= 10 && bjr < 20) {
                    grade = "B";
                    gradeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300";
                } else if (bjr >= 20) {
                    grade = "A";
                    gradeColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
                }

                return (
                    <tr key={idx} onClick={() => setSelectedTicket(row)} className={`${theme.hover} transition-colors cursor-pointer group`}>
                    <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                        <span className="font-bold">{row.jam_masuk}</span>
                        <span className="text-slate-400 text-xs">➜</span>
                        <span className="font-bold text-slate-500">{row.jam_keluar}</span>
                        </div>
                        <span className={`text-xs ${theme.subtext}`}>{formatIndoDate(new Date(row.tanggal))}</span>
                    </td>
                    <td className={`px-4 md:px-6 py-4 font-mono text-xs ${theme.subtext} group-hover:text-emerald-500 transition-colors`}>{row.id}</td>
                    <td className="px-4 md:px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>{row.nopol}</span></td>
                    <td className={`px-4 md:px-6 py-4 ${theme.subtext}`}>{row.lokasi}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-mono text-slate-500">{formatNumber(row.janjang)}</td>
                    <td className="px-4 md:px-6 py-4 text-right font-bold text-emerald-500" title={`Janjang: ${formatNumber(row.janjang)}`}>{formatNumber(row.netto)}</td>
                    <td className="px-4 md:px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-mono">{bjr.toFixed(2)}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${gradeColor}`}>
                                Grade {grade}
                            </span>
                        </div>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
            )}
        </div>
        </div>

        {/* ADMIN SECTION (Hidden in Kiosk) */}
        {isAdmin && !isKioskMode && (
        <div className={`p-6 rounded-2xl border border-dashed border-emerald-500/30 ${isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-50'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-600"><Database size={20} /> Area Admin</h2>
            <div className="flex flex-col gap-6">
            
            {/* Manajemen Pengumuman */}
            <div className={`p-4 rounded-xl border ${theme.border} bg-opacity-50`}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Megaphone size={16}/> Manajemen Running Text</h3>
                <div className="flex gap-2 mb-3">
                    <input 
                    type="text" 
                    value={newAnnouncementContent} 
                    onChange={(e) => setNewAnnouncementContent(e.target.value)} 
                    className={`flex-1 p-2 rounded-lg border outline-none ${theme.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} 
                    placeholder="Tulis pesan pengumuman baru..." 
                    />
                    <button onClick={handleAddAnnouncementAction} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Plus size={16}/> Tambah
                    </button>
                </div>
                <div className="space-y-2">
                    {announcements.map((ann) => (
                    <div key={ann.id} className={`flex justify-between items-center p-2 rounded border text-sm ${theme.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <span>{ann.content}</span>
                        <button onClick={() => handleDeleteAnnouncementAction(ann.id)} className="text-red-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                    ))}
                </div>
            </div>

            {/* Data Management */}
            <div className="flex flex-wrap gap-4">
                <label className="cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium">
                    <Upload size={18} /> Upload CSV
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button onClick={handleBackupData} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border ${theme.border} ${theme.card} hover:opacity-80`}>
                    <Download size={18} /> Backup Data
                </button>
                {uploadStatus === 'processing' && <span className="text-blue-500 text-sm flex items-center gap-1">{uploadMessage || 'Memproses...'}</span>}
                {uploadStatus === 'success' && <span className="text-emerald-500 text-sm flex items-center gap-1"><CheckCircle size={14}/> {uploadMessage || 'Upload Berhasil!'}</span>}
                {uploadStatus === 'error' && <span className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={14}/> {uploadMessage || 'Gagal!'}</span>}
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default DashboardView;