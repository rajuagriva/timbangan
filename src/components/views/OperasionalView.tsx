import React, { useState } from 'react';
import {
  Truck, Clock, CheckCircle, ArrowRight, AlertCircle, MapPin,
  GripVertical, LayoutTemplate, Map as MapIcon, Scale, Factory
} from 'lucide-react';
import type { YardTruck, YardStatus } from '../../types';
import YardCanvas3D from '../YardCanvas3D';

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

// Main Component
const OperasionalView: React.FC<OperasionalViewProps> = ({
  yardTrucks, theme, onMoveTruck, formatIndoTime
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
              <AlertCircle size={12} /> Antrean: {yardTrucks.filter(t => t.status === 'waiting_unload' || t.status === 'queue_weigh_in').length}
            </div>
            <div className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Truck size={12} /> Bongkar: {yardTrucks.filter(t => t.status.includes('ramp')).length}
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        /* --- 3D ISOMETRIC MAP VIEW --- */
        <YardCanvas3D
          yardTrucks={yardTrucks}
          onMoveTruck={onMoveTruck}
          draggedTruckId={draggedTruckId}
          onDragStart={handleDragStart}
          formatIndoTime={formatIndoTime}
        />
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
                          <MapPin size={12} /> {truck.source}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} /> Masuk: {formatIndoTime(new Date(truck.arrived_at))}
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