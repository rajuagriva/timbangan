import React from 'react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, Activity, Lightbulb, Sparkles, CloudRain, Sun, Cloud, Droplets, AlertOctagon, CheckCircle
} from 'lucide-react';
import { WeatherLog } from '../../types';

interface PrediksiViewProps {
  forecastData: any;
  weatherLogs: WeatherLog[];
  theme: any;
  isDarkMode: boolean;
  formatNumber: (n: number) => string;
  forecastInsight: string;
  setForecastInsight: (val: string) => void;
  handleGenerateForecastInsight: () => void;
  isGeneratingInsight: boolean;
}

const PrediksiView: React.FC<PrediksiViewProps> = ({
  forecastData, weatherLogs, theme, isDarkMode, formatNumber,
  forecastInsight, setForecastInsight, handleGenerateForecastInsight, isGeneratingInsight
}) => {
  
  // Merge Weather Data
  const mixedChartData = forecastData.chart.map((item: any) => {
    const weather = weatherLogs.find(w => w.date === item.date);
    return {
        ...item,
        rainfall: weather ? weather.rainfall : 0,
        condition: weather ? weather.condition : 'Cerah'
    };
  });

  // Today's Weather Widget Data
  const today = new Date().toISOString().split('T')[0];
  const todayWeather = weatherLogs.find(w => w.date === today) || { condition: 'Cerah', rainfall: 0 };
  const getWeatherIcon = (cond: string) => {
    if (cond.includes('Hujan')) return <CloudRain size={32} className="text-blue-500"/>;
    if (cond === 'Berawan') return <Cloud size={32} className="text-slate-500"/>;
    return <Sun size={32} className="text-yellow-500"/>;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
         {/* Header Prediksi */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="text-emerald-500" /> Prediksi Supply Cerdas</h2>
                <p className={`text-sm ${theme.subtext}`}>Analisis tren dan proyeksi penerimaan buah 7 hari kedepan.</p>
            </div>
            <div className="flex gap-4">
                {/* Weather Widget */}
                <div className={`hidden md:flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-lg gap-3 border ${theme.border} shadow-sm`}>
                    {getWeatherIcon(todayWeather.condition)}
                    <div>
                        <p className="text-xs font-bold opacity-60">Cuaca Hari Ini</p>
                        <p className="font-bold text-sm">{todayWeather.condition} <span className="text-xs font-normal opacity-70">({todayWeather.rainfall}mm)</span></p>
                    </div>
                </div>

                <div className={`flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg gap-2 border ${theme.border}`}>
                    <TrendingUp size={16} className={theme.subtext} />
                    <span className="font-bold text-lg">{formatNumber(forecastData.totalProjected)}</span>
                    <span className={`text-xs ${theme.subtext}`}>Kg (Est. 7 Hari)</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORECAST CHART (Overlay Weather) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme.card}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2">
                        <Activity size={18} className="text-blue-500"/>
                        Tren Supply vs Curah Hujan
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Supply (Kg)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-300"></span> Hujan (mm)</span>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {mixedChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={mixedChartData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10}} />
                                
                                {/* Left Axis: Supply */}
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10}} tickFormatter={(v) => `${(v/1000).toFixed(0)}T`} />
                                
                                {/* Right Axis: Rain */}
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#93c5fd', fontSize: 10}} tickFormatter={(v) => `${v}`} />

                                <RechartsTooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}}
                                    labelStyle={{fontWeight: 'bold', marginBottom: '4px'}}
                                    formatter={(value: any, name: any, props: any) => {
                                        if (name === "Curah Hujan") return [`${value} mm`, name];
                                        return [`${value.toLocaleString()} kg`, name];
                                    }}
                                />
                                
                                {/* Bar for Rainfall (Back Layer) */}
                                <Bar yAxisId="right" dataKey="rainfall" name="Curah Hujan" fill="#bfdbfe" opacity={0.5} barSize={20} radius={[4, 4, 0, 0]} />

                                {/* Area for Actual Data */}
                                <Area yAxisId="left" type="monotone" dataKey="actual" name="Aktual Supply" stroke="#059669" strokeWidth={2} fill="url(#colorActual)" />
                                
                                {/* Line for Prediction (Dashed) */}
                                <Line yAxisId="left" type="monotone" dataKey="predicted" name="Prediksi Supply" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, strokeWidth: 2}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">Belum cukup data untuk prediksi</div>
                    )}
                </div>
            </div>

            {/* AI RECOMMENDATION PANEL */}
            <div className="space-y-6">
                {/* Weather Impact Summary */}
                <div className={`p-6 rounded-2xl border ${theme.card} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900`}>
                    <h4 className="font-bold text-sm uppercase text-blue-600 mb-2 flex items-center gap-2"><Droplets size={14}/> Dampak Cuaca</h4>
                    
                    {todayWeather.rainfall > 20 ? (
                        <div className="flex items-start gap-3 mt-3">
                            <AlertOctagon className="text-red-500 shrink-0 mt-1" size={20}/>
                            <div>
                                <p className="font-bold text-red-600 text-sm">Peringatan Supply!</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Hujan deras hari ini ({todayWeather.rainfall}mm) berpotensi menurunkan penerimaan buah besok hingga 20-30%.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 mt-3">
                            <CheckCircle className="text-emerald-500 shrink-0 mt-1" size={20}/>
                            <div>
                                <p className="font-bold text-emerald-600 text-sm">Kondisi Optimal</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Cuaca cerah mendukung panen & pengiriman. Optimalkan slot loading ramp.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gemini Action */}
                <div className={`p-6 rounded-2xl border ${theme.card} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit size={100} />
                    </div>
                    <h3 className="font-bold flex items-center gap-2 mb-3 relative z-10">
                        <Lightbulb className="text-yellow-500 fill-yellow-500" /> Rekomendasi AI
                    </h3>
                    
                    {!forecastInsight ? (
                        <div className="text-center py-6 relative z-10">
                            <p className="text-sm text-slate-500 mb-4">Analisis dampak cuaca historis terhadap tren supply saat ini.</p>
                            <button 
                                onClick={handleGenerateForecastInsight} 
                                disabled={isGeneratingInsight}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isGeneratingInsight ? <Sparkles className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                                Analisa Korelasi
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2">
                            <div className="text-sm leading-relaxed opacity-90 mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                {forecastInsight}
                            </div>
                            <button 
                                onClick={() => setForecastInsight('')} 
                                className="text-xs text-slate-400 hover:text-slate-600 underline"
                            >
                                Reset Analisis
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default PrediksiView;