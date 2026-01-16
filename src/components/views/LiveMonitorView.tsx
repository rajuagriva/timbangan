import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Truck, Scale, Clock, Database, Radio, Wrench, MapPin, Factory } from 'lucide-react';
import './LiveMonitor.css';
import GaugeChart from '../GaugeChart';
import { fetchTickets } from '../../services/dataService';
import type { Ticket, FleetVehicle, FleetStatus } from '../../types';

const LiveMonitorView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveFleet, setLiveFleet] = useState<FleetVehicle[]>([]);

    // Simulated Live Metrics
    const [queueCount, setQueueCount] = useState(5);
    const [processingSpeed, setProcessingSpeed] = useState(15); // mins/truck

    // --- MOCK FLEET DATA GENERATOR ---
    const initFleetData = () => {
        const vehicles = [
            'BD 8259 W', 'B 9870 SAM', 'BD 9127 EX', 'BD 9462 NB', 'BD 9737 AR',
            'BD 1234 XY', 'B 5678 AB', 'BD 8888 ZZ'
        ];
        return vehicles.map((nopol, idx) => ({
            id: `V-${idx}`,
            nopol,
            status: ['to_mill', 'loading', 'to_estate', 'weighing', 'workshop'][Math.floor(Math.random() * 5)] as FleetStatus,
            location: 'Unknown',
            lastUpdate: new Date(),
            speed: Math.floor(Math.random() * 60)
        }));
    };

    useEffect(() => {
        // 1. Initial Load
        loadData();
        setLiveFleet(initFleetData());

        // 2. Timer for Clock
        const timerInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        // 3. Data Refresh Interval (10s)
        const dataInterval = setInterval(() => {
            loadData();
            // Simulate changing random metrics for "Life" feel
            setQueueCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
            setProcessingSpeed(prev => Math.max(5, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));

            // Simulate Fleet Movement
            setLiveFleet(prevFleet => prevFleet.map(v => {
                // Randomly change status for some vehicles
                if (Math.random() > 0.7) {
                    const statuses: FleetStatus[] = ['to_mill', 'to_estate', 'loading', 'weighing', 'workshop'];
                    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    let newLoc = v.location;
                    if (newStatus === 'to_mill') newLoc = `KM ${Math.floor(Math.random() * 20)}`;
                    if (newStatus === 'loading') newLoc = [`AFD A`, `AFD B`, `PLASMA`][Math.floor(Math.random() * 3)];
                    if (newStatus === 'weighing') newLoc = 'WEIGHBRIDGE';
                    if (newStatus === 'workshop') newLoc = 'WORKSHOP';
                    if (newStatus === 'to_estate') newLoc = 'MAIN ROAD';

                    return {
                        ...v,
                        status: newStatus,
                        location: newLoc,
                        lastUpdate: new Date(),
                        speed: newStatus === 'loading' || newStatus === 'weighing' ? 0 : Math.floor(Math.random() * 40 + 20)
                    };
                }
                return v;
            }));

        }, 5000); // Faster update for fleet (5s)

        return () => {
            clearInterval(timerInterval);
            clearInterval(dataInterval);
        };
    }, []);

    const loadData = async () => {
        try {
            // In a real scenario, we might use a lighter payload API
            const data = await fetchTickets();
            setTickets(data);
            setLoading(false);
        } catch (e) {
            console.error("Failed to load live data", e);
        }
    };

    const metrics = useMemo(() => {
        const now = new Date();
        // Filter for TODAY only
        const todayStr = now.toISOString().split('T')[0];
        const todaysTickets = tickets.filter(t => t.tanggal === todayStr);

        const totalNetto = todaysTickets.reduce((acc, curr) => acc + curr.netto, 0);
        const targetDaily = 40000; // 40 Ton base target
        const achievement = (totalNetto / targetDaily) * 100;

        // Calculate simple hourly rate (tickets this hour)
        const currentHour = now.getHours();
        const ticketsThisHour = todaysTickets.filter(t => {
            const h = parseInt(t.jam_masuk.split(':')[0]);
            return h === currentHour;
        }).length;

        return {
            totalNetto,
            count: todaysTickets.length,
            achievement,
            targetDaily,
            ticketsThisHour
        };
    }, [tickets, currentTime]); // Update when time changes (hour change)

    // Status Indicators
    const systemStatus = metrics.achievement >= 80 ? 'OPTIMAL' : metrics.achievement >= 50 ? 'NORMAL' : 'DELAY';
    const systemColor = systemStatus === 'OPTIMAL' ? 'text-green-500' : systemStatus === 'NORMAL' ? 'text-yellow-500' : 'text-red-500';

    // Helper for Fleet Icon & Color
    const getFleetStatusInfo = (status: FleetStatus) => {
        switch (status) {
            case 'to_mill': return { icon: <Factory size={14} />, color: 'text-blue-400', label: 'TO MILL' };
            case 'to_estate': return { icon: <Truck size={14} className="scale-x-[-1]" />, color: 'text-cyan-400', label: 'TO ESTATE' };
            case 'loading': return { icon: <Activity size={14} />, color: 'text-yellow-400', label: 'LOADING' };
            case 'weighing': return { icon: <Scale size={14} />, color: 'text-green-400', label: 'WEIGHING' };
            case 'workshop': return { icon: <Wrench size={14} />, color: 'text-red-500', label: 'REPAIR' };
            default: return { icon: <Radio size={14} />, color: 'text-slate-400', label: 'IDLE' };
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="live-monitor-container flex items-center justify-center">
                <div className="text-2xl neon-text animate-pulse">INITIALIZING SYSTEM...</div>
            </div>
        );
    }

    return (
        <div className="live-monitor-container p-6 flex flex-col h-screen overflow-hidden">
            {/* HEADER */}
            <header className="live-header flex justify-between items-center p-4 mb-4 shrink-0 rounded-lg shadow-lg border border-blue-900/30">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-blue-400">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-widest uppercase text-white shadow-blue-500/50 drop-shadow-lg">
                            LIVE OPERATION <span className="neon-text">COCKPIT</span>
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-blue-300 font-mono mt-1">
                            <Activity size={14} className="animate-pulse text-green-400" />
                            <span>SYSTEM ONLINE</span>
                            <span className="text-slate-600">|</span>
                            <span>DATA STREAM ACTIVE</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-mono uppercase">System Status</div>
                        <div className={`text-xl font-bold font-mono tracking-widest ${systemColor} flex items-center justify-end gap-2`}>
                            {systemStatus} <span className={`blink-dot bg-${systemStatus === 'OPTIMAL' ? 'green' : systemStatus === 'NORMAL' ? 'yellow' : 'red'}-500`}></span>
                        </div>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-8">
                        <div className="text-xs text-slate-400 font-mono">LOCAL TIME</div>
                        <div className="text-4xl font-mono text-white font-bold">
                            {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                        </div>
                        <div className="text-sm text-slate-400 font-mono">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div className="live-grid flex-1 min-h-0 overflow-y-auto pb-4">

                {/* CARD 1: DAILY TARGET (GAUGE) */}
                <div className="live-card rounded-xl p-4 flex flex-col h-[280px]">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                            <Scale className="text-blue-400" /> Daily Achievement
                        </h2>
                        <span className="text-xs font-mono text-slate-400">TODAY</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <GaugeChart
                            value={metrics.totalNetto}
                            max={metrics.targetDaily}
                            label="TONNAGE (KG)"
                            unit="KG"
                            color="#3b82f6"
                            thresholds={{ warning: metrics.targetDaily * 0.5, danger: metrics.targetDaily * 0.2 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 px-4 py-2 bg-slate-900/50 rounded border border-slate-800">
                        <div className="text-center">
                            <div className="text-xs text-slate-500">TARGET</div>
                            <div className="font-mono text-blue-300">{metrics.targetDaily.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-slate-500">REMAINING</div>
                            <div className="font-mono text-yellow-300">{(Math.max(0, metrics.targetDaily - metrics.totalNetto)).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: SPEEDOMETER (Avg Duration) */}
                <div className="live-card rounded-xl p-4 flex flex-col h-[280px]">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                            <Clock className="text-purple-400" /> Processing Speed
                        </h2>
                        <span className="text-xs font-mono text-slate-400">AVG TIME</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <GaugeChart
                            value={processingSpeed}
                            max={60}
                            label="MINUTES / TRUCK"
                            unit="MIN"
                            color="#8b5cf6"
                            thresholds={{ warning: 30, danger: 45 }}
                        />
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-green-500 w-1/2 h-full opacity-50" title="Ideal"></div>
                            <div className="bg-yellow-500 w-1/4 h-full opacity-50" title="Slow"></div>
                            <div className="bg-red-500 w-1/4 h-full opacity-50" title="Critical"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                            <span>0m</span>
                            <span>30m</span>
                            <span>60m</span>
                        </div>
                    </div>
                </div>

                {/* CARD 3: QUEUE STATUS */}
                <div className="live-card rounded-xl p-6 flex flex-col justify-center items-center relative h-[280px]">
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Truck className="text-yellow-400" />
                        <span className="text-lg font-bold text-slate-200">Current Queue</span>
                    </div>

                    <div className={`text-8xl font-black font-mono tracking-tighter my-4 ${queueCount > 8 ? 'neon-red animate-pulse' : queueCount > 4 ? 'neon-amber' : 'neon-text'}`}>
                        {String(queueCount).padStart(2, '0')}
                    </div>
                    <div className="text-sm font-mono text-slate-400 uppercase tracking-widest">Vehicles Waiting</div>

                    <div className="w-full mt-6 grid grid-cols-3 gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`h-2 rounded-sm ${i < queueCount / 3 ? (queueCount > 8 ? 'bg-red-500' : 'bg-green-500') : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                </div>

                {/* CARD 4: HOURLY THROUGHPUT */}
                <div className="live-card rounded-xl p-6 flex flex-col h-[280px]">
                    <div className="flex items-center gap-2 mb-6">
                        <Database className="text-pink-400" />
                        <span className="text-lg font-bold text-slate-200">Hourly Throughput</span>
                    </div>

                    <div className="flex items-end gap-4 mb-4">
                        <span className="text-6xl font-bold text-white font-mono">{metrics.ticketsThisHour}</span>
                        <span className="text-xl text-slate-500 font-mono mb-2">/ TRUCKS</span>
                    </div>

                    <div className="text-sm text-slate-400 mb-2">Trend vs Last Hour</div>
                    <div className="flex items-center gap-2 text-green-400 font-mono text-lg">
                        <span>▲ 12%</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-800">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Active Gate</span>
                            <span className="text-white font-mono">GATE-01</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-500">Weighbridge Status</span>
                            <span className="text-green-400 font-mono">ONLINE</span>
                        </div>
                    </div>
                </div>

                {/* CARD 5: LIVE FLEET TRACKING (Wide Card) */}
                <div className="live-card rounded-xl p-6 flex flex-col col-span-1 lg:col-span-2 xl:col-span-2 h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                            <Radio className="text-cyan-400 animate-pulse" /> LIVE FLEET TRACKING
                        </h2>
                        <div className="flex gap-4 text-xs font-mono text-slate-400">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> ACTIVE</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> BUSY</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> ISSUE</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                        <table className="w-full text-left text-sm font-mono">
                            <thead className="bg-[#0f172a] text-slate-500 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3">VEHICLE ID</th>
                                    <th className="p-3">STATUS</th>
                                    <th className="p-3">LOCATION</th>
                                    <th className="p-3">SPEED</th>
                                    <th className="p-3">ETA</th>
                                    <th className="p-3">UPDATED</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {liveFleet.map((vehicle) => {
                                    const { icon, color, label } = getFleetStatusInfo(vehicle.status);
                                    return (
                                        <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-bold text-white">{vehicle.nopol}</td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 ${color} text-xs font-bold`}>
                                                    {icon}
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-300 flex items-center gap-2">
                                                <MapPin size={12} className="text-slate-500" />
                                                {vehicle.location}
                                            </td>
                                            <td className="p-3 text-slate-400">
                                                {(vehicle.speed ?? 0) > 0 ? `${vehicle.speed} km/h` : '-'}
                                            </td>
                                            <td className="p-3">
                                                {vehicle.status === 'to_mill' ? (
                                                    <span className="text-green-400 font-bold">~{Math.round(Math.random() * 20 + 5)} mnt</span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {vehicle.lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CARD 6: WEATHER & NOTIFICATIONS (Placeholder) */}
                {/* Can add another card here to fill grid if needed, or leave fleet as wide */}

            </div>

            {/* FOOTER TICKER */}
            <footer className="shrink-0 mt-4 border-t border-slate-800 bg-slate-900/50 p-2 overflow-hidden flex items-center">
                <div className="bg-blue-900/50 px-3 py-1 rounded text-xs font-bold text-blue-200 mr-4 whitespace-nowrap flex items-center gap-2">
                    <Radio size={12} className="animate-pulse" /> LIVE FEED
                </div>
                <div className="text-xs font-mono text-blue-300 animate-marquee whitespace-nowrap">
                    Creating secure connection to Weighbridge System... OK. | Fetching Afdeling Benchmark... DONE. | Weather Sensor: 24°C, Humidity 80%. | Latest Ticket: #{tickets[0]?.id || 'N/A'} - {tickets[0]?.nopol || 'Waiting...'} ({tickets[0]?.netto?.toLocaleString() || 0} kg) | SYSTEM OPTIMAL.
                </div>
            </footer>
        </div>
    );
};

export default LiveMonitorView;
