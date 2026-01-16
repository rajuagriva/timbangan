import React, { useState, useMemo } from 'react';
import { Truck, Send, History, MapPin, Info } from 'lucide-react';
import type { HarvestEntry } from '../../types';

interface HarvestEntryViewProps {
    locations: { name: string; fullName: string; value: number }[];
    onSubmit: (entry: Omit<HarvestEntry, 'id' | 'status' | 'submitted_at'>) => void;
    recentEntries: HarvestEntry[];
    avgBJRMap: Record<string, number>; // Map Location -> Avg BJR
}

export default function HarvestEntryView({ locations, onSubmit, recentEntries, avgBJRMap }: HarvestEntryViewProps) {
    const [selectedLocation, setSelectedLocation] = useState('');
    const [block, setBlock] = useState(''); // Optional detailed block
    const [janjang, setJanjang] = useState<number | ''>('');
    const [mandorName] = useState('Mandor 1'); // Mock logged in user

    // Logic: Auto-calculate Estimate
    const currentLocationBJR = useMemo(() => {
        if (!selectedLocation) return 0;
        // Try to find exact match or default to global avg if not found (using 15 as fallback safe number)
        return avgBJRMap[selectedLocation] || 20; // Default 20kg if unknown? Making it adjustable visually is better.
    }, [selectedLocation, avgBJRMap]);

    const estNetto = useMemo(() => {
        if (!janjang || typeof janjang !== 'number') return 0;
        return Math.round(janjang * currentLocationBJR);
    }, [janjang, currentLocationBJR]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation || !janjang) return;

        onSubmit({
            location: selectedLocation,
            block: block || selectedLocation,
            janjang: Number(janjang),
            est_bjr: currentLocationBJR,
            est_netto: estNetto,
            mandor_name: mandorName
        });

        // Reset Form
        setJanjang('');
        setBlock('');
        // Keep location selected for continuous input
    };

    return (
        <div className="p-4 max-w-md mx-auto min-h-screen pb-20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Truck className="w-6 h-6 text-blue-600" />
                        Mandor Tally
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Input Data Panen Harian</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-medium">
                    {mandorName}
                </div>
            </div>

            {/* INPUT CARD */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h2 className="text-white font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" /> Input Panen Baru
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Location Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Afdeling / Lokasi
                        </label>
                        <div className="relative">
                            <select
                                required
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">Pilih Lokasi...</option>
                                {locations.map(loc => (
                                    <option key={loc.name} value={loc.name}>{loc.fullName}</option>
                                ))}
                            </select>
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Block Input (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Blok (Opsional)
                        </label>
                        <input
                            type="text"
                            value={block}
                            onChange={(e) => setBlock(e.target.value)}
                            placeholder="Contoh: A05"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Janjang Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jumlah Janjang
                        </label>
                        <div className="relative">
                            <input
                                required
                                type="number"
                                min="1"
                                value={janjang}
                                onChange={(e) => setJanjang(e.target.valueAsNumber || '')}
                                placeholder="0"
                                className="w-full pl-4 pr-12 py-3 text-lg font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">JJG</span>
                        </div>
                    </div>

                    {/* Estimation Card (Dynamic) */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Info className="w-3 h-3" /> Avg BJR: {currentLocationBJR > 0 ? currentLocationBJR.toFixed(2) : '-'} kg
                            </span>
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Estimasi</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                {estNetto > 0 ? estNetto.toLocaleString() : '-'}
                            </span>
                            <span className="text-sm text-gray-500">kg</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!selectedLocation || !janjang}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" /> Submit Tiket
                    </button>
                </form>
            </div>

            {/* RECENT ENTRIES LIST */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <History className="w-5 h-5" /> Antrian Masuk ({recentEntries.length})
                </h3>

                <div className="space-y-3">
                    {recentEntries.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            Belum ada input panen hari ini.
                        </div>
                    ) : (
                        recentEntries.map(entry => (
                            <div key={entry.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 font-bold text-sm">
                                        {entry.block.substring(0, 3)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">{entry.janjang} Janjang</div>
                                        <div className="text-xs text-gray-500">{entry.location} • {new Date(entry.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">~{(entry.est_netto / 1000).toFixed(1)} Ton</div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
