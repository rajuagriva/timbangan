import React, { useState } from 'react';
import { 
  Truck, Clock, CheckCircle, ArrowRight, AlertCircle, MapPin, 
  GripVertical, LayoutTemplate, Map as MapIcon, Scale, Factory
} from 'lucide-react';
import { YardTruck, YardStatus } from '../../types';

interface OperasionalViewProps {
  yardTrucks: YardTruck[];
  theme: any;
  isDarkMode: boolean;
  onMoveTruck: (truckId: string, newStatus: YardStatus) => void;
  formatIndoTime: (date: Date) => string;
}

// Helper function
const getDuration = (isoTime: string) => {
  const diff = (new Date().getTime() - new Date(isoTime).getTime()) / 1000 / 60; // minutes
  if (diff > 60) return `${Math.floor(diff / 60)}j ${Math.floor(diff % 60)}m`;
  return `${Math.floor(diff)} mnt`;
};

interface TruckCardProps {
  truck: YardTruck;
  compact?: boolean;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  formatIndoTime: (date: Date) => string;
}

const TruckCard: React.FC<TruckCardProps> = ({ truck, compact = false, isDragged, onDragStart, formatIndoTime }) => (
  <div 
      draggable
      onDragStart={(e) => onDragStart(e, truck.id)}
      className={`${compact ? 'w-full md:w-[48%] lg:w-[31%]' : 'w-full'} bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${isDragged ? 'opacity-50' : ''}`}
  >
      <div className="flex justify-between items-start mb-1">
          <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{truck.nopol}</span>
          {!compact && <GripVertical size={14} className="text-slate-300" />}
      </div>
      
      <div className="text-[10px] text-slate-500 space-y-0.5">
          <div className="flex items-center gap-1">
          <MapPin size={10}/> {truck.source}
          </div>
          <div className="flex items-center gap-1">
          <Clock size={10}/> {formatIndoTime(new Date(truck.arrived_at))}
          </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getDuration(truck.updated_at).includes('j') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
          ⏱ {getDuration(truck.updated_at)}
          </span>
      </div>
  </div>
);

interface MapZoneProps {
  status: YardStatus;
  title: string;
  icon: any;
  className?: string;
  children?: React.ReactNode;
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: YardStatus) => void;
}

const MapZone: React.FC<MapZoneProps> = ({ status, title, icon: Icon, className, children, isOver, onDragOver, onDrop }) => {
  return (
      <div 
          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 p-4 flex flex-col ${className} ${isOver ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, status)}
      >
          <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase opacity-70">
              <Icon size={16} /> {title}
          </div>
          <div className="flex-1 flex flex-wrap gap-3 content-start relative z-10">
              {children}
          </div>
          {React.Children.count(children) === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-xs font-bold uppercase tracking-widest">
                  Kosong
              </div>
          )}
      </div>
  );
};

// Main Component
const OperasionalView: React.FC<OperasionalViewProps> = ({
  yardTrucks, theme, isDarkMode, onMoveTruck, formatIndoTime
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'map'>('map');
  const [draggedTruckId, setDraggedTruckId] = useState<string | null>(null);

  const columns: { id: YardStatus; title: string; color: string; icon: any }[] = [
    { id: 'queue_weigh_in', title: 'Antre Timbang', color: 'border-slate-400 bg-slate-50 dark:bg-slate-900', icon: Scale },
    { id: 'waiting_unload', title: 'Menunggu Bongkar', color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20', icon: Clock },
    { id: 'ramp_1', title: 'Loading Ramp 1', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: Factory },
    { id: 'ramp_2', title: 'Loading Ramp 2', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: Factory },
    { id: 'finished', title: 'Selesai / Keluar', color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20', icon: CheckCircle },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTruckId(id);
    e.dataTransfer.setData('truckId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: YardStatus) => {
    e.preventDefault();
    const truckId = e.dataTransfer.getData('truckId');
    if (truckId) {
      onMoveTruck(truckId, status);
    }
    setDraggedTruckId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Truck className="text-emerald-500" /> Operasional Lapangan (Smart Yard)</h2>
          <p className={`text-sm ${theme.subtext}`}>Pantau dan atur posisi truk secara real-time. Drag & Drop untuk update status.</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <MapIcon size={14} /> Denah
                </button>
                <button 
                    onClick={() => setViewMode('board')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <LayoutTemplate size={14} /> Board
                </button>
            </div>

            <div className="flex gap-2">
                <div className="px-3 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold flex items-center gap-1">
                    <AlertCircle size={12}/> Antrean: {yardTrucks.filter(t => t.status === 'waiting_unload' || t.status === 'queue_weigh_in').length}
                </div>
                <div className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Truck size={12}/> Bongkar: {yardTrucks.filter(t => t.status.includes('ramp')).length}
                </div>
            </div>
        </div>
      </div>

      {viewMode === 'map' ? (
         /* --- MAP VIEW (DENAH) --- */
         <div className="relative w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 overflow-hidden min-h-[600px] flex flex-col md:block">
            {/* Decor: Background Grid/Roads (Optional Visuals) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full relative z-10">
                
                {/* COLUMN 1: WEIGHBRIDGE (TIMBANGAN) */}
                <div className="md:col-span-1 flex flex-col gap-4">
                     <MapZone 
                        status="queue_weigh_in" 
                        title="Pos Timbangan (In)" 
                        icon={Scale} 
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-1/2"
                        isOver={draggedTruckId !== null}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                     >
                        {yardTrucks.filter(t => t.status === 'queue_weigh_in').map(t => (
                          <TruckCard 
                            key={t.id} 
                            truck={t} 
                            isDragged={draggedTruckId === t.id}
                            onDragStart={handleDragStart}
                            formatIndoTime={formatIndoTime}
                          />
                        ))}
                     </MapZone>
                     
                     <div className="flex-1 flex items-center justify-center opacity-20">
                        <ArrowRight size={48} className="text-slate-400 rotate-90 md:rotate-0" />
                     </div>
                </div>

                {/* COLUMN 2: WAITING AREA */}
                <div className="md:col-span-1">
                     <MapZone 
                        status="waiting_unload" 
                        title="Parkir Tunggu (Holding)" 
                        icon={Clock} 
                        className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 h-full min-h-[200px]"
                        isOver={draggedTruckId !== null}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                     >
                        {yardTrucks.filter(t => t.status === 'waiting_unload').map(t => (
                          <TruckCard 
                            key={t.id} 
                            truck={t} 
                            isDragged={draggedTruckId === t.id}
                            onDragStart={handleDragStart}
                            formatIndoTime={formatIndoTime}
                          />
                        ))}
                     </MapZone>
                </div>

                {/* COLUMN 3 & 4: FACTORY AREA (RAMPS) */}
                <div className="md:col-span-2 flex flex-col gap-4">
                     {/* Ramps Container */}
                     <div className="flex-1 bg-slate-200 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-300 dark:border-slate-600 relative">
                        <div className="absolute -top-3 left-4 bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            Area Loading Ramp
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-full">
                            <MapZone 
                                status="ramp_1" 
                                title="Ramp 01" 
                                icon={Factory} 
                                className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                isOver={draggedTruckId !== null}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {yardTrucks.filter(t => t.status === 'ramp_1').map(t => (
                                  <TruckCard 
                                    key={t.id} 
                                    truck={t} 
                                    compact 
                                    isDragged={draggedTruckId === t.id}
                                    onDragStart={handleDragStart}
                                    formatIndoTime={formatIndoTime}
                                  />
                                ))}
                            </MapZone>

                            <MapZone 
                                status="ramp_2" 
                                title="Ramp 02" 
                                icon={Factory} 
                                className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                                isOver={draggedTruckId !== null}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                {yardTrucks.filter(t => t.status === 'ramp_2').map(t => (
                                  <TruckCard 
                                    key={t.id} 
                                    truck={t} 
                                    compact 
                                    isDragged={draggedTruckId === t.id}
                                    onDragStart={handleDragStart}
                                    formatIndoTime={formatIndoTime}
                                  />
                                ))}
                            </MapZone>
                        </div>
                     </div>

                     {/* Exit Zone */}
                     <div className="h-32">
                        <MapZone 
                                status="finished" 
                                title="Timbang Keluar (Out)" 
                                icon={CheckCircle} 
                                className="bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 h-full flex-row items-center gap-4"
                                isOver={draggedTruckId !== null}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="flex-1 flex gap-2 overflow-x-auto">
                                    {yardTrucks.filter(t => t.status === 'finished').map(t => (
                                        <div key={t.id} className="min-w-[150px]">
                                            <TruckCard 
                                              truck={t} 
                                              isDragged={draggedTruckId === t.id}
                                              onDragStart={handleDragStart}
                                              formatIndoTime={formatIndoTime}
                                            />
                                        </div>
                                    ))}
                                </div>
                        </MapZone>
                     </div>
                </div>

            </div>
         </div>
      ) : (
        /* --- BOARD VIEW (KANBAN) --- */
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[500px]">
            {columns.map((col) => {
            const trucks = yardTrucks.filter(t => t.status === col.id);
            const Icon = col.icon;
            
            return (
                <div 
                key={col.id}
                className={`flex-1 min-w-[280px] rounded-xl border-t-4 flex flex-col ${col.color} border-slate-200 dark:border-slate-700 shadow-sm`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                >
                {/* Column Header */}
                <div className="p-3 border-b border-black/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                    <Icon size={16} /> {col.title}
                    </h3>
                    <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    {trucks.length}
                    </span>
                </div>

                {/* Column Body */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {trucks.map((truck) => (
                    <div 
                        key={truck.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, truck.id)}
                        className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${draggedTruckId === truck.id ? 'opacity-50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                        <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">{truck.nopol}</span>
                        <GripVertical size={16} className="text-slate-300" />
                        </div>
                        
                        <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1">
                            <MapPin size={12}/> {truck.source}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={12}/> Masuk: {formatIndoTime(new Date(truck.arrived_at))}
                        </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${getDuration(truck.updated_at).includes('j') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                            ⏱ {getDuration(truck.updated_at)} di sini
                        </span>
                        
                        {/* Quick Move Button (Mobile Friendly) */}
                        {col.id !== 'finished' && (
                            <button 
                                onClick={() => {
                                    const nextMap: Record<YardStatus, YardStatus> = {
                                        'queue_weigh_in': 'waiting_unload',
                                        'waiting_unload': 'ramp_1', // Default to Ramp 1
                                        'ramp_1': 'finished',
                                        'ramp_2': 'finished',
                                        'finished': 'finished'
                                    };
                                    onMoveTruck(truck.id, nextMap[col.id]);
                                }}
                                className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                                title="Lanjut ke tahap berikutnya"
                            >
                                <ArrowRight size={14} />
                            </button>
                        )}
                        </div>
                    </div>
                    ))}
                    
                    {trucks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-300/50 rounded-lg flex items-center justify-center text-slate-400 text-xs italic">
                        Kosong
                    </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default OperasionalView;