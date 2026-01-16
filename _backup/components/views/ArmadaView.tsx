import React from 'react';
import { Truck, Trophy, Award, ChevronRight, Crown, Shield, Medal, Flame } from 'lucide-react';
import { VehicleStat } from '../../types';

interface ArmadaViewProps {
  vehicleStats: VehicleStat[];
  theme: any;
  isDarkMode: boolean;
  setSelectedVehicle: (v: VehicleStat | null) => void;
  formatNumber: (n: number) => string;
  formatIndoDate: (d: Date) => string;
}

const ArmadaView: React.FC<ArmadaViewProps> = ({ 
  vehicleStats, theme, isDarkMode, setSelectedVehicle, formatNumber, formatIndoDate 
}) => {
  const getBadgeIcon = (level: string) => {
    switch(level) {
        case 'Legend': return <Crown size={16} className="text-yellow-500 fill-yellow-500" />;
        case 'Pro': return <Shield size={16} className="text-blue-500 fill-blue-500" />;
        default: return <Medal size={16} className="text-slate-400" />;
    }
  };

  const getBadgeColor = (level: string) => {
    switch(level) {
        case 'Legend': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Pro': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Header Armada */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Truck className="text-emerald-500" /> Analisis Performa Armada</h2>
                <p className={`text-sm ${theme.subtext}`}>Monitoring produktivitas dan efisiensi kendaraan angkut.</p>
            </div>
            <div className={`flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg gap-2 border ${theme.border}`}>
               <Truck size={16} className={theme.subtext} />
               <span className="font-bold text-lg">{vehicleStats.length}</span>
               <span className={`text-xs ${theme.subtext}`}>Unit Aktif</span>
            </div>
        </div>

        {/* TOP 3 PODIUM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-8 mb-8">
           {/* Rank 2 */}
           {vehicleStats.length > 1 && (
           <div className={`p-6 rounded-2xl border ${theme.card} relative transform hover:-translate-y-2 transition-transform duration-300 order-2 md:order-1`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                        {vehicleStats[1].nopol}
                        {getBadgeIcon(vehicleStats[1].level)}
                    </h3>
                    <p className={`text-xs mb-4 ${theme.subtext}`}>{vehicleStats[1].tripCount} Trip</p>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{formatNumber(vehicleStats[1].totalNetto)}</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-500/70">Kilogram</span>
                </div>
           </div>
           )}

           {/* Rank 1 */}
           {vehicleStats.length > 0 && (
           <div className={`p-8 rounded-2xl border-2 border-amber-400 ${isDarkMode ? 'bg-amber-900/10' : 'bg-amber-50'} relative transform hover:-translate-y-2 transition-transform duration-300 z-10 shadow-xl shadow-amber-500/10 order-1 md:order-2`}>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg text-lg">1</div>
                <div className="absolute top-4 right-4 text-amber-500 animate-pulse"><Trophy size={24}/></div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-amber-600 flex items-center justify-center gap-2">
                        {vehicleStats[0].nopol}
                        {getBadgeIcon(vehicleStats[0].level)}
                    </h3>
                    <p className="text-sm mb-4 text-amber-600/70 font-medium">{vehicleStats[0].tripCount} Trip</p>
                    <div className="text-4xl font-black text-amber-600 mb-1">{formatNumber(vehicleStats[0].totalNetto)}</div>
                    <span className="text-xs uppercase font-bold text-amber-600/70">Kilogram</span>
                </div>
           </div>
           )}

           {/* Rank 3 */}
           {vehicleStats.length > 2 && (
           <div className={`p-6 rounded-2xl border ${theme.card} relative transform hover:-translate-y-2 transition-transform duration-300 order-3`}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-800 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                        {vehicleStats[2].nopol}
                        {getBadgeIcon(vehicleStats[2].level)}
                    </h3>
                    <p className={`text-xs mb-4 ${theme.subtext}`}>{vehicleStats[2].tripCount} Trip</p>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{formatNumber(vehicleStats[2].totalNetto)}</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-500/70">Kilogram</span>
                </div>
           </div>
           )}
        </div>

        {/* RANKING TABLE */}
        <div className={`rounded-2xl border ${theme.card} overflow-hidden`}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2"><Award className="text-purple-500"/> Peringkat Armada</h3>
                <div className="flex gap-2 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Crown size={12} className="text-yellow-500"/> Legend</span>
                    <span className="flex items-center gap-1"><Shield size={12} className="text-blue-500"/> Pro</span>
                    <span className="flex items-center gap-1"><Medal size={12} className="text-slate-400"/> Rookie</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className={`${theme.tableHeader} font-bold uppercase text-xs`}>
                        <tr>
                            <th className="px-6 py-4 text-center w-16">Rank</th>
                            <th className="px-6 py-4">No. Polisi</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Loyalty Streak</th>
                            <th className="px-6 py-4 text-right">Total Tonase (KG)</th>
                            <th className="px-6 py-4 text-center">Avg Durasi</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {vehicleStats.map((v, idx) => (
                            <tr key={v.nopol} onClick={() => setSelectedVehicle(v)} className={`${theme.hover} cursor-pointer group transition-colors`}>
                                <td className="px-6 py-4 text-center font-bold text-slate-400">#{idx + 1}</td>
                                <td className="px-6 py-4 font-mono font-bold flex items-center gap-2">
                                    {v.nopol}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${getBadgeColor(v.level)}`}>
                                        {v.level === 'Legend' && <Crown size={10} />}
                                        {v.level === 'Pro' && <Shield size={10} />}
                                        {v.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {v.currentStreak > 1 ? (
                                        <div className="flex items-center justify-center gap-1 text-orange-500 font-bold" title={`${v.currentStreak} hari berturut-turut`}>
                                            <Flame size={14} className="fill-orange-500 animate-pulse"/> 
                                            {v.currentStreak} Hari
                                        </div>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatNumber(v.totalNetto)}</td>
                                <td className="px-6 py-4 text-center text-xs">
                                    <span className={`px-2 py-1 rounded-full ${v.avgDuration < 30 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {Math.round(v.avgDuration)} mnt
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs font-bold ml-auto">
                                        Detail <ChevronRight size={14}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default ArmadaView;