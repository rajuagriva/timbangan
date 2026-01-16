import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Download, Truck, Scale, FileSpreadsheet, LayoutDashboard, Database, 
  CheckCircle, Clock, Sparkles, FileText, X, Search, Moon, Sun, 
  Trophy, Activity, AlertTriangle, Megaphone, Timer, Plus, Trash2, ChevronDown,
  Calendar, DollarSign, Tag, Monitor, XCircle, TrendingUp, MapPin, Trees, ChevronRight, Award,
  BrainCircuit, Lightbulb, TrendingDown, Star, Ribbon, AlertOctagon, Layout, Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Ticket, Announcement, DashboardStats, VehicleStat, YardTruck, YardStatus, WeatherLog } from './types';
import { generateGeminiInsight } from './services/geminiService';
import { fetchTickets, fetchAnnouncements, addAnnouncement, deleteAnnouncement, uploadTicketsBulk, fetchWeatherLogs } from './services/dataService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import KPICard from './components/KPICard';
import TicketModal from './components/TicketModal';
import ExecutiveReportTemplate from './components/ExecutiveReportTemplate';

// Views
import DashboardView from './components/views/DashboardView';
import ArmadaView from './components/views/ArmadaView';
import PrediksiView from './components/views/PrediksiView';
import KualitasView from './components/views/KualitasView';
import OperasionalView from './components/views/OperasionalView';

const BASE_DAILY_TARGET_KG = 40000; // 40 Ton
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const GRADE_COLORS = { A: '#10b981', B: '#f59e0b', C: '#ef4444' };

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // UI State
  const [activeView, setActiveView] = useState<'dashboard' | 'armada' | 'prediksi' | 'kualitas' | 'operasional'>('dashboard');
  const [loadingData, setLoadingData] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStat | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // New Features State
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null); // Feature: Analisis Afdeling
  const [isKioskMode, setIsKioskMode] = useState(false); // Feature: Kiosk Mode
  const [yardTrucks, setYardTrucks] = useState<YardTruck[]>([]); // Feature: Smart Yard
  const [weatherLogs, setWeatherLogs] = useState<WeatherLog[]>([]); // Feature: Weather Correlation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Feature: PDF Report
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'ticket' | 'nopol' | 'location'>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [tbsPrice, setTbsPrice] = useState<number>(2550);

  // AI State
  const [aiInsight, setAiInsight] = useState('');
  const [forecastInsight, setForecastInsight] = useState('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  
  // --- LOAD DATA ---
  const loadInitialData = async () => {
    setLoadingData(true); // Always show loading state on fetch
    
    try {
      const tickets = await fetchTickets();
      setData(tickets);
      const ann = await fetchAnnouncements();
      setAnnouncements(ann);
      
      // Feature: Weather Data
      const uniqueDates = Array.from(new Set(tickets.map(t => t.tanggal))).sort();
      // Ensure we have weather for future dates in forecast too (simple simulation)
      const futureDates: string[] = [];
      const today = new Date();
      for(let i=1; i<=7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        futureDates.push(d.toISOString().split('T')[0]);
      }
      const weather = await fetchWeatherLogs([...uniqueDates, ...futureDates]);
      setWeatherLogs(weather);

      // Init Mock Yard Data (Simulation)
      if (yardTrucks.length === 0) {
        setYardTrucks([
            { id: 'Y001', nopol: 'BD 8259 W', status: 'queue_weigh_in', arrived_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), updated_at: new Date().toISOString(), source: 'AFD A' },
            { id: 'Y002', nopol: 'B 9870 SAM', status: 'waiting_unload', arrived_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), updated_at: new Date().toISOString(), source: 'AFD B' },
            { id: 'Y003', nopol: 'BD 9127 EX', status: 'ramp_1', arrived_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), updated_at: new Date().toISOString(), source: 'PLASMA' },
            { id: 'Y004', nopol: 'BD 9462 NB', status: 'ramp_2', arrived_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(), updated_at: new Date().toISOString(), source: 'AFD C' },
            { id: 'Y005', nopol: 'BD 9737 AR', status: 'finished', arrived_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), updated_at: new Date().toISOString(), source: 'AFD D' },
        ]);
      }

      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Failed to load data:", error.message || error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Feature: Kiosk Mode Auto Refresh (30s)
    let kioskInterval: ReturnType<typeof setInterval>;
    if (isKioskMode) {
        kioskInterval = setInterval(() => {
            console.log("Kiosk Mode: Auto refreshing data...");
            loadInitialData();
        }, 30000);
    }

    // --- REALTIME SUBSCRIPTION ---
    // Mengaktifkan update otomatis jika database berubah
    if (isSupabaseConfigured() && !isKioskMode) { // Hindari double sub jika kiosk mode aktif
      const channel = supabase
        .channel('dashboard-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tickets' },
          (payload) => {
            console.log('Realtime update (tickets):', payload);
            loadInitialData(); // Refresh data saat ada perubahan
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'announcements' },
          (payload) => {
            console.log('Realtime update (announcements):', payload);
            loadInitialData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        if (kioskInterval) clearInterval(kioskInterval);
      };
    }
    
    return () => {
        if (kioskInterval) clearInterval(kioskInterval);
    }
  }, [isKioskMode]);

  // --- HELPER: FORMAT ---
  const formatIndoDate = (dateObj: Date) => dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const formatIndoTime = (dateObj: Date) => dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const formatCurrency = (num: number) => "Rp " + num.toLocaleString('id-ID');

  // --- LOGIC FILTERING ---
  const filteredData = useMemo(() => {
    const now = new Date();
    const toDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = toDateString(now);

    return data.filter(item => {
      const itemDateStr = item.tanggal; 
      const itemDateObj = new Date(item.tanggal);
      let timeMatch = true;

      if (timeFilter === 'today') timeMatch = itemDateStr === todayStr;
      else if (timeFilter === 'week') {
        const dayOfWeek = now.getDay() || 7; 
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        timeMatch = itemDateObj >= startOfWeek;
      }
      else if (timeFilter === 'month') {
        timeMatch = itemDateObj.getMonth() === now.getMonth() && itemDateObj.getFullYear() === now.getFullYear();
      }
      else if (timeFilter === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59); // Include full end day
        timeMatch = itemDateObj >= start && itemDateObj <= end;
      }

      const searchLower = searchQuery.toLowerCase();
      let searchMatch = true;

      if (searchQuery) {
        if (searchCategory === 'all') {
          searchMatch = 
            item.id.toLowerCase().includes(searchLower) || 
            item.nopol.toLowerCase().includes(searchLower) ||
            item.lokasi.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'ticket') {
          searchMatch = item.id.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'nopol') {
          searchMatch = item.nopol.toLowerCase().includes(searchLower);
        } else if (searchCategory === 'location') {
          searchMatch = item.lokasi.toLowerCase().includes(searchLower);
        }
      }

      return timeMatch && searchMatch;
    });
  }, [data, timeFilter, searchQuery, searchCategory, customStartDate, customEndDate]);

  // --- REPORT DATA DERIVATION ---
  const reportData = useMemo(() => {
      // Top 5 Suppliers from ChartData already calculated, but let's be robust
      const locMap: Record<string, number> = {};
      filteredData.forEach(item => {
          const loc = item.lokasi || 'Unknown';
          if (!locMap[loc]) locMap[loc] = 0;
          locMap[loc] += item.netto;
      });
      const topSuppliers = Object.keys(locMap)
          .map(loc => ({ name: loc, value: locMap[loc] }))
          .sort((a, b) => b.value - a.value);

      // Grade C Issues (BJR < 10)
      const gradeCIssues = filteredData
          .filter(t => t.janjang > 0 && (t.netto / t.janjang) < 10)
          .sort((a, b) => (a.netto/a.janjang) - (b.netto/b.janjang)); // Lowest BJR first

      return { topSuppliers, gradeCIssues };
  }, [filteredData]);

  // --- LOCATION ANALYTICS DATA ---
  const locationAnalytics = useMemo(() => {
    if (!selectedLocation) return null;
    const locData = data.filter(t => t.lokasi === selectedLocation);
    
    // Stats
    const totalNetto = locData.reduce((acc, curr) => acc + curr.netto, 0);
    const totalJanjang = locData.reduce((acc, curr) => acc + curr.janjang, 0);
    const totalTrips = locData.length;
    const avgBJR = totalJanjang > 0 ? totalNetto / totalJanjang : 0;
    
    // Trend
    const trendMap: Record<string, number> = {};
    locData.forEach(item => {
        if (!trendMap[item.tanggal]) trendMap[item.tanggal] = 0;
        trendMap[item.tanggal] += item.netto;
    });
    
    const trend = Object.keys(trendMap).sort().map(date => ({
        date,
        shortDate: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        value: trendMap[date]
    })).slice(-14); // Last 14 days activity

    return { name: selectedLocation, totalNetto, totalJanjang, totalTrips, avgBJR, trend };
  }, [selectedLocation, data]);

  // --- VEHICLE ANALYTICS DATA (Enriched with Global Streak/Badge) ---
  const vehicleStats: VehicleStat[] = useMemo(() => {
    // 1. Calculate GLOBAL Stats (Streak & Badge) using full `data`
    const globalStats: Record<string, { streak: number, totalTrips: number, level: 'Rookie'|'Pro'|'Legend' }> = {};
    const vehicleGroups: Record<string, Ticket[]> = {};
    
    data.forEach(t => {
        if(!vehicleGroups[t.nopol]) vehicleGroups[t.nopol] = [];
        vehicleGroups[t.nopol].push(t);
    });

    Object.keys(vehicleGroups).forEach(nopol => {
        const tickets = vehicleGroups[nopol];
        const uniqueDates = Array.from(new Set(tickets.map(t => t.tanggal))).sort().reverse();
        
        let streak = 0;
        if (uniqueDates.length > 0) {
            streak = 1;
            let currentDate = new Date(uniqueDates[0]);
            for (let i = 1; i < uniqueDates.length; i++) {
                const prevDate = new Date(uniqueDates[i]);
                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays === 1) { streak++; currentDate = prevDate; } else { break; }
            }
        }
        
        const totalTrips = tickets.length;
        let level: 'Rookie' | 'Pro' | 'Legend' = 'Rookie';
        if (totalTrips >= 20) level = 'Legend';
        else if (totalTrips >= 8) level = 'Pro';

        globalStats[nopol] = { streak, totalTrips, level };
    });

    // 2. Build Result based on FILTERED data
    const map: Record<string, VehicleStat> = {};
    filteredData.forEach(ticket => {
        if (!map[ticket.nopol]) {
            const global = globalStats[ticket.nopol] || { streak: 0, level: 'Rookie' };
            map[ticket.nopol] = {
                nopol: ticket.nopol,
                tripCount: 0,
                totalNetto: 0,
                avgDuration: 0,
                lastVisit: ticket.tanggal,
                tickets: [],
                currentStreak: global.streak,
                level: global.level,
            };
        }
        
        const v = map[ticket.nopol];
        v.tripCount++;
        v.totalNetto += ticket.netto;
        v.tickets.push(ticket);
        if (new Date(ticket.tanggal) > new Date(v.lastVisit)) {
            v.lastVisit = ticket.tanggal;
        }

        // Duration Calc
        const [h1, m1] = ticket.jam_masuk.split(':').map(Number);
        const [h2, m2] = ticket.jam_keluar.split(':').map(Number);
        const d1 = new Date(2000, 0, 1, h1, m1);
        const d2 = new Date(2000, 0, 1, h2, m2);
        let diff = (d2.getTime() - d1.getTime()) / 60000;
        if (diff < 0) diff += 1440; // Over midnight
        if (diff > 0 && diff < 300) { 
            // Running average approximation for performance
            v.avgDuration = ((v.avgDuration * (v.tripCount - 1)) + diff) / v.tripCount;
        }
    });

    return Object.values(map).sort((a, b) => b.totalNetto - a.totalNetto);
  }, [data, filteredData]);

  // --- FORECAST DATA CALCULATION ---
  const forecastData = useMemo(() => {
    if (data.length === 0) return { chart: [], totalProjected: 0 };

    // 1. Group Data Daily (All Time) to get trend
    const dailyMap: Record<string, number> = {};
    data.forEach(t => {
      if (!dailyMap[t.tanggal]) dailyMap[t.tanggal] = 0;
      dailyMap[t.tanggal] += t.netto;
    });

    // 2. Sort dates
    const sortedDates = Object.keys(dailyMap).sort();
    
    // 3. Take last 14 days for visualization context
    const recentDates = sortedDates.slice(-14);
    
    const chartData = recentDates.map(date => ({
      date,
      displayDate: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      actual: dailyMap[date],
      predicted: null as number | null
    }));

    // 4. Forecast Logic (Simple Weighted Moving Average of last 7 days)
    const last7Values = recentDates.slice(-7).map(d => dailyMap[d]);
    if (last7Values.length === 0) return { chart: [], totalProjected: 0 };

    const avg = last7Values.reduce((a, b) => a + b, 0) / last7Values.length;
    
    // Generate next 7 days
    const lastDateObj = new Date(recentDates[recentDates.length - 1]);
    let totalProjected = 0;

    // Add connecting point
    chartData[chartData.length - 1].predicted = dailyMap[recentDates[recentDates.length - 1]];

    for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(lastDateObj);
        nextDate.setDate(lastDateObj.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];
        const displayDate = nextDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        
        // Simple variations to make chart look realistic (not flat line)
        // Weekend modifier (assuming Sunday dip)
        let modifier = 1;
        if (nextDate.getDay() === 0) modifier = 0.5; // Sunday
        
        const predVal = Math.round(avg * modifier * (0.9 + Math.random() * 0.2)); // +/- 10% variation
        totalProjected += predVal;

        chartData.push({
            date: dateStr,
            displayDate,
            actual: null as any,
            predicted: predVal
        });
    }

    return { chart: chartData, totalProjected };
  }, [data]);

  // --- QUALITY MATRIX DATA ---
  const qualityAnalytics = useMemo(() => {
    const scatterData: any[] = [];
    const gradeCounts = { A: 0, B: 0, C: 0 };
    const locationQuality: Record<string, { totalBJR: number, count: number, name: string }> = {};

    filteredData.forEach(t => {
        const bjr = t.janjang > 0 ? (t.netto / t.janjang) : 0;
        
        // 1. Grading
        let grade: 'A' | 'B' | 'C' = 'C';
        if (bjr >= 20) grade = 'A';
        else if (bjr >= 10) grade = 'B';
        
        gradeCounts[grade]++;

        // 2. Scatter Data
        scatterData.push({
            x: t.netto,
            y: parseFloat(bjr.toFixed(2)),
            z: 1, // for zAxis if needed
            grade,
            nopol: t.nopol,
            lokasi: t.lokasi,
            id: t.id
        });

        // 3. Location Stats
        if (!locationQuality[t.lokasi]) locationQuality[t.lokasi] = { totalBJR: 0, count: 0, name: t.lokasi };
        locationQuality[t.lokasi].totalBJR += bjr;
        locationQuality[t.lokasi].count++;
    });

    // Format Pie Data
    const pieData = [
        { name: 'Grade A (Super)', value: gradeCounts.A, color: GRADE_COLORS.A },
        { name: 'Grade B (Normal)', value: gradeCounts.B, color: GRADE_COLORS.B },
        { name: 'Grade C (Low)', value: gradeCounts.C, color: GRADE_COLORS.C },
    ].filter(d => d.value > 0);

    // Format Location Leaderboard
    const locationLeaderboard = Object.values(locationQuality)
        .map(l => ({
            name: l.name,
            avgBJR: l.totalBJR / l.count
        }))
        .sort((a, b) => b.avgBJR - a.avgBJR)
        .slice(0, 5); // Top 5

    return { scatterData, pieData, locationLeaderboard, gradeCounts };
  }, [filteredData]);


  // --- STATISTIK & TARGET ---
  const stats: DashboardStats = useMemo(() => {
    const totalNetto = filteredData.reduce((acc, curr) => acc + curr.netto, 0);
    const totalJanjang = filteredData.reduce((acc, curr) => acc + curr.janjang, 0);
    const totalTruk = filteredData.length;
    const avgBJR = totalJanjang > 0 ? (totalNetto / totalJanjang).toFixed(2) : 0;

    // Hitung Target Dinamis
    let currentTarget = BASE_DAILY_TARGET_KG;
    const now = new Date();

    if (timeFilter === 'week') {
        // Asumsi 6 hari kerja
        currentTarget = BASE_DAILY_TARGET_KG * 6;
    } else if (timeFilter === 'month') {
        // Jumlah hari dalam bulan ini
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        currentTarget = BASE_DAILY_TARGET_KG * daysInMonth;
    } else if (timeFilter === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        // Hitung selisih hari (termasuk hari terakhir)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        currentTarget = BASE_DAILY_TARGET_KG * (diffDays > 0 ? diffDays : 1);
    }

    const targetPercent = Math.min((totalNetto / currentTarget) * 100, 100);

    // Durasi (Dwell Time)
    let totalMinutes = 0;
    let validDurationCount = 0;
    
    filteredData.forEach(item => {
      if (item.jam_masuk && item.jam_keluar) {
        const [h1, m1] = item.jam_masuk.split(':').map(Number);
        const [h2, m2] = item.jam_keluar.split(':').map(Number);
        const dateBase = new Date(2000, 0, 1);
        const d1 = new Date(dateBase.setHours(h1, m1));
        const d2 = new Date(dateBase.setHours(h2, m2));
        let diff = (d2.getTime() - d1.getTime()) / 1000 / 60; 
        if (diff < 0) diff += 24 * 60; 
        if (diff > 0 && diff < 300) { 
           totalMinutes += diff;
           validDurationCount++;
        }
      }
    });
    
    const avgDuration = validDurationCount > 0 ? Math.round(totalMinutes / validDurationCount) : 0;

    // Passing currentTarget back for display
    return { totalNetto, totalJanjang, totalTruk, avgBJR, targetPercent, avgDuration, currentTarget };
  }, [filteredData, timeFilter, customStartDate, customEndDate]);

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    const trendMap: Record<string, number> = {};
    const locMap: Record<string, number> = {};
    const hourMap = Array(24).fill(0);

    filteredData.forEach(item => {
      // Trend
      if (!trendMap[item.tanggal]) trendMap[item.tanggal] = 0;
      trendMap[item.tanggal] += item.netto;

      // Location
      const loc = item.lokasi || 'Unknown';
      if (!locMap[loc]) locMap[loc] = 0;
      locMap[loc] += item.netto;

      // Peak Hour
      const hour = parseInt(item.jam_masuk.split(':')[0]);
      if (!isNaN(hour) && hour >= 0 && hour < 24) hourMap[hour]++;
    });

    const trend = Object.keys(trendMap).sort().map(date => ({
      date,
      displayDate: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      total: trendMap[date]
    }));

    const locations = Object.keys(locMap)
      .map(loc => {
        const match = loc.match(/AFD\s+([A-Z0-9]+)/i);
        const shortName = match ? match[1] : loc.substring(0, 6); 
        return { name: shortName, fullName: loc, value: locMap[loc] };
      })
      .sort((a, b) => b.value - a.value);

    // Peak Hours: Fixed Range 07:00 - 22:00
    const fixedHoursRange = Array.from({length: 16}, (_, i) => i + 7); // 7 to 22
    const peakHours = fixedHoursRange.map(h => ({
        hour: `${String(h).padStart(2, '0')}:00`,
        count: hourMap[h] || 0
    }));

    return { trend, locations, peakHours };
  }, [filteredData]);

  // --- ACTIONS ---
  const handleGenerateInsight = async () => {
    setIsGeneratingInsight(true);
    const prompt = `Analisa data sawit: Netto ${stats.totalNetto}kg, Rata-rata bongkar ${stats.avgDuration} menit, BJR ${stats.avgBJR}. Target ${stats.currentTarget || 'N/A'}kg. Berikan komentar singkat tentang efisiensi logistik dan supply chain. Gunakan bahasa Indonesia formal dan ringkas.`;
    const result = await generateGeminiInsight(prompt);
    setAiInsight(result);
    setIsGeneratingInsight(false);
  };

  const handleGenerateForecastInsight = async () => {
    setIsGeneratingInsight(true);
    // Prepare recent data summary for Gemini
    const recentDataStr = forecastData.chart
        .filter(d => d.actual) // only past data
        .slice(-7)
        .map(d => `${d.displayDate}: ${d.actual}kg`)
        .join(', ');

    // Prepare weather summary for last 7 days + next 3 days
    const today = new Date();
    const weatherSummary = weatherLogs
        .filter(w => {
            const d = new Date(w.date);
            const diff = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
            return diff >= -7 && diff <= 3;
        })
        .map(w => `${w.date}: ${w.condition} (${w.rainfall}mm)`)
        .join(', ');

    const prompt = `Data penerimaan sawit 7 hari terakhir: [${recentDataStr}]. 
    Data Cuaca Historis & Prediksi: [${weatherSummary}].
    Prediksi Supply System untuk 7 hari ke depan total sekitar ${formatNumber(forecastData.totalProjected)}kg.
    
    Sebagai AI Logistik Sawit, berikan analisis korelatif:
    1. Apakah ada indikasi penurunan supply akibat cuaca hujan deras di hari-hari sebelumnya?
    2. Berikan 3 rekomendasi operasional spesifik mengingat kondisi cuaca tersebut (misal: kondisi jalan kebun, antrean truk, shift loading ramp).
    Gunakan Bahasa Indonesia formal.`;
    
    const result = await generateGeminiInsight(prompt);
    setForecastInsight(result);
    setIsGeneratingInsight(false);
  };

  const handleAddAnnouncementAction = async () => {
    if (!newAnnouncementContent.trim()) return;
    try {
        const newAnn = await addAnnouncement(newAnnouncementContent);
        if (newAnn) {
            setAnnouncements([newAnn, ...announcements]);
            setNewAnnouncementContent("");
        } else {
            setAnnouncements([{ id: Date.now(), content: newAnnouncementContent }, ...announcements]);
            setNewAnnouncementContent("");
        }
    } catch (e) {
        console.error(e);
        alert("Gagal menambah pengumuman");
    }
  };

  const handleDeleteAnnouncementAction = async (id: number) => {
    try {
        await deleteAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (e) {
        console.error(e);
        setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleMoveTruck = (truckId: string, newStatus: YardStatus) => {
    setYardTrucks(prev => prev.map(t => 
        t.id === truckId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    ));
    // In real app, call Supabase update here
  };

  // --- PDF REPORT GENERATION ---
  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    // Give time for the hidden component to render fully if needed
    setTimeout(async () => {
      try {
        const input = document.getElementById('executive-report');
        if (!input) throw new Error("Report template not found");

        const canvas = await html2canvas(input, {
          scale: 2, // Higher quality
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Margin top

        // Calculate height based on A4 width ratio
        const finalH = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalH);
        pdf.save(`Laporan_Harian_Sawit_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (err) {
        console.error("Failed to generate PDF", err);
        alert("Gagal membuat laporan PDF.");
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 500);
  };

  // Helper untuk parsing CSV yang menghandle tanda kutip dengan benar
  const parseCSVLine = (line: string): string[] => {
    const row: string[] = [];
    let current = '';
    let inQuote = false;
    for(let i = 0; i < line.length; i++) {
       const char = line[i];
       if(char === '"') { 
          inQuote = !inQuote; 
       } else if(char === ',' && !inQuote) {
          row.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          current = '';
          continue;
       }
       current += char;
    }
    // Push sisa buffer
    row.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return row;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadStatus('processing');
    setUploadMessage('Membaca file...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const newData: Ticket[] = [];
        
        console.log(`Processing CSV: ${lines.length} baris.`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; 

          // Gunakan parser yang lebih aman (bukan split biasa)
          const row = parseCSVLine(line);

          // Skip header jika kolom pertama adalah 'ID' atau 'No Tiket'
          if (i === 0) {
             const firstCol = row[0].toLowerCase();
             if (firstCol === 'id' || firstCol === 'no tiket' || firstCol.includes('tiket')) {
                console.log("Skipping header row:", row);
                continue; 
             }
          }

          // Minimal 8 kolom
          if (row.length < 8) continue;

          const [id, tanggal, jam_masuk, jam_keluar, nopol, nettoRaw, janjangRaw, lokasi] = row;

          // Validasi wajib ada ID dan Tanggal
          if (!id || !tanggal) continue;

          // Parse Date 
          let cleanDate = tanggal;
          if (tanggal.includes('/')) {
             const parts = tanggal.split('/');
             if (parts.length === 3) {
                const D = parts[0].padStart(2, '0');
                const M = parts[1].padStart(2, '0');
                const Y = parts[2];
                cleanDate = `${Y}-${M}-${D}`;
             }
          }
          
          if (isNaN(Date.parse(cleanDate))) {
             console.warn(`Baris ${i+1}: Tanggal invalid (${tanggal})`);
             continue;
          }

          newData.push({
            id: id, // ID ini kunci agar tidak duplikat di DB (upsert)
            tanggal: cleanDate,
            jam_masuk: jam_masuk || '00:00',
            jam_keluar: jam_keluar || '00:00',
            nopol: nopol || '',
            netto: parseFloat(nettoRaw) || 0,
            janjang: parseFloat(janjangRaw) || 0,
            lokasi: lokasi || 'N/A'
          });
        }
        
        if (newData.length === 0) {
            throw new Error("Tidak ada data valid. Pastikan format CSV sesuai (ID, Tanggal, ...)");
        }
        
        setUploadMessage(`Mengupload ${newData.length} data ke Supabase...`);
        const insertedCount = await uploadTicketsBulk(newData);
        
        setUploadStatus('success');
        setUploadMessage(`Berhasil menyimpan ${insertedCount} tiket!`);
        
        loadInitialData(); 
        event.target.value = '';
        
        setTimeout(() => {
            setUploadStatus('idle');
            setUploadMessage('');
        }, 5000);

      } catch (err: any) { 
        console.error("Upload error details:", err);
        setUploadStatus('error'); 
        setUploadMessage(err.message || 'Gagal menyimpan data.');
      }
    };
    reader.readAsText(file);
  };

  const handleBackupData = async () => {
    try {
      setUploadStatus('processing');
      setUploadMessage('Menyiapkan file backup...');

      const latestTickets = await fetchTickets();
      
      if (!latestTickets || latestTickets.length === 0) {
        setUploadStatus('error');
        setUploadMessage('Tidak ada data untuk di-backup.');
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }

      // Header dengan 'ID' di kolom pertama agar jelas
      const headers = ['ID', 'Tanggal', 'Jam Masuk', 'Jam Keluar', 'No Polisi', 'Netto', 'Janjang', 'Lokasi'];
      
      const csvRows = latestTickets.map(t => {
        // Bungkus dengan quote jika mengandung koma atau quote
        const safeVal = (val: any) => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        return [
          t.id, // Kolom ID (Primary Key)
          t.tanggal,
          t.jam_masuk,
          t.jam_keluar,
          t.nopol,
          t.netto,
          t.janjang,
          t.lokasi
        ].map(safeVal).join(',');
      });

      const csvString = [headers.join(','), ...csvRows].join('\n');
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DataCBS_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setUploadStatus('success');
      setUploadMessage(`Berhasil backup ${latestTickets.length} data!`);
      
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    } catch (error: any) {
      console.error("Backup failed:", error);
      setUploadStatus('error');
      setUploadMessage('Gagal membuat backup.');
    }
  };

  // --- THEME ---
  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    border: isDarkMode ? 'border-slate-700' : 'border-slate-200',
    nav: isDarkMode ? 'bg-slate-950' : 'bg-emerald-800',
    tableHeader: isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500',
    hover: isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme.bg} ${theme.text} relative`}>
      
      {/* HIDDEN REPORT TEMPLATE (Absolute positioned off-screen) */}
      <div style={{ position: 'absolute', top: 0, left: '-2000px', width: '800px', zIndex: -50 }}>
          <ExecutiveReportTemplate 
              stats={stats}
              chartData={chartData}
              topSuppliers={reportData.topSuppliers}
              gradeCIssues={reportData.gradeCIssues}
              aiInsight={aiInsight}
              generatedAt={new Date().toLocaleString('id-ID')}
          />
      </div>
      
      {/* FEATURE: Kiosk Exit Button */}
      {isKioskMode && (
          <button 
            onClick={() => setIsKioskMode(false)}
            className="fixed bottom-6 right-6 z-[60] bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-all group"
            title="Keluar Mode TV"
          >
              <XCircle size={24} />
              <span className="absolute right-full mr-2 bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Keluar Mode TV</span>
          </button>
      )}

      {/* CHECK SUPABASE CONFIG */}
      {!isSupabaseConfigured() && !isKioskMode && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1 sticky top-0 z-[60]">
          Demo Mode: Supabase credentials not found. Using mock data.
        </div>
      )}

      {/* STICKY HEADER CONTAINER (Navbar -> Running Text -> Filter) */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 shadow-slate-800' : 'bg-slate-50 shadow-slate-200'} shadow-md`}>
        
        {/* 1. NAVBAR (Hidden in Kiosk Mode) */}
        {!isKioskMode && (
        <nav className={`${theme.nav} text-white transition-colors duration-300`}>
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                <Trees className="text-white w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight">DataCBS Dashboard</h1>
                <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-80">
                    <Clock size={10} /> Update: {formatIndoTime(lastUpdated)}
                    {isSupabaseConfigured() && <span className="flex items-center gap-1 text-emerald-300"><Activity size={10}/> Live</span>}
                </div>
                </div>
            </div>
            
            {/* NEW NAVIGATION TABS */}
            <div className="hidden md:flex bg-black/20 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveView('dashboard')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeView === 'dashboard' ? 'bg-white text-emerald-800 shadow' : 'text-white/70 hover:text-white'}`}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveView('armada')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'armada' ? 'bg-white text-emerald-800 shadow' : 'text-white/70 hover:text-white'}`}
                >
                    <Truck size={14} /> Armada
                </button>
                <button 
                    onClick={() => setActiveView('prediksi')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'prediksi' ? 'bg-white text-emerald-800 shadow' : 'text-white/70 hover:text-white'}`}
                >
                    <BrainCircuit size={14} /> Prediksi
                </button>
                <button 
                    onClick={() => setActiveView('kualitas')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'kualitas' ? 'bg-white text-emerald-800 shadow' : 'text-white/70 hover:text-white'}`}
                >
                    <Star size={14} /> Kualitas
                </button>
                <button 
                    onClick={() => setActiveView('operasional')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'operasional' ? 'bg-white text-emerald-800 shadow' : 'text-white/70 hover:text-white'}`}
                >
                    <Layout size={14} /> Operasional
                </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* FEATURE: Kiosk Button */}
                <button onClick={() => setIsKioskMode(true)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Mode Presentasi TV">
                <Monitor size={18} />
                </button>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={() => setIsAdmin(!isAdmin)} className={`flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {isAdmin ? 'EXIT ADMIN' : 'ADMIN MODE'}
                </button>
            </div>
            </div>
        </nav>
        )}

        {/* 2. RUNNING TEXT */}
        <div className="bg-slate-900 text-white text-xs md:text-sm py-1.5 overflow-hidden relative">
            <div className="whitespace-nowrap flex items-center gap-12 animate-marquee">
            {(announcements.length > 0 ? announcements : [{id:0, content: "Menunggu data pengumuman..."}]).map((ann, idx) => (
                <span key={idx} className="flex items-center gap-2">
                <Megaphone size={14} className="text-yellow-400"/> {ann.content}
                </span>
            ))}
            </div>
        </div>

        {/* 3. FILTER CONTROLS (Buttons Moved to Footer) */}
        {!isKioskMode && (
        <div className="container mx-auto px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                <div className={`p-1.5 rounded-xl border ${theme.border} ${isDarkMode ? 'bg-slate-800' : 'bg-white'} flex flex-wrap gap-1 items-center shadow-sm w-full md:w-fit`}>
                    {['today', 'week', 'month'].map((type: any) => (
                    <button 
                        key={type} 
                        onClick={() => { setTimeFilter(type); }} // Clicking these disables custom mode visual
                        className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all ${timeFilter === type ? 'bg-emerald-600 text-white shadow-md' : `${theme.text} hover:bg-slate-100 dark:hover:bg-slate-700`}`}
                    >
                        {type === 'today' && 'Hari Ini'}
                        {type === 'week' && 'Minggu Ini'}
                        {type === 'month' && 'Bulan Ini'}
                    </button>
                    ))}

                    {/* Custom Button triggers input visibility */}
                    <button 
                        onClick={() => setTimeFilter('custom')} 
                        className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all ${timeFilter === 'custom' ? 'bg-emerald-600 text-white shadow-md' : `${theme.text} hover:bg-slate-100 dark:hover:bg-slate-700`}`}
                    >
                        Custom
                    </button>
                    
                    {/* Custom Date Range Inputs (Only show if Custom is selected) */}
                    {timeFilter === 'custom' && (
                        <div className={`flex items-center gap-2 px-2 border-l ${theme.border} ml-1 animate-in fade-in slide-in-from-left-2 duration-300`}>
                            <Calendar size={14} className={theme.subtext} />
                            <input 
                                type="date" 
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className={`bg-transparent text-[10px] md:text-xs ${theme.text} outline-none w-24`} 
                            />
                            <span className="text-xs text-slate-400">-</span>
                            <input 
                                type="date" 
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className={`bg-transparent text-[10px] md:text-xs ${theme.text} outline-none w-24`} 
                            />
                        </div>
                    )}
                </div>
                
                {/* Mobile Tab Switcher (Only visible on small screens) */}
                <div className="flex md:hidden bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-full overflow-x-auto">
                    <button 
                        onClick={() => setActiveView('dashboard')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold whitespace-nowrap ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                    >Dashboard</button>
                    <button 
                        onClick={() => setActiveView('armada')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold whitespace-nowrap ${activeView === 'armada' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                    >Armada</button>
                    <button 
                        onClick={() => setActiveView('prediksi')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold whitespace-nowrap ${activeView === 'prediksi' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                    >Prediksi</button>
                    <button 
                        onClick={() => setActiveView('kualitas')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold whitespace-nowrap ${activeView === 'kualitas' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                    >Kualitas</button>
                    <button 
                        onClick={() => setActiveView('operasional')}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold whitespace-nowrap ${activeView === 'operasional' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                    >Operasional</button>
                </div>
            </div>
        </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        
        {/* --- VIEW: DASHBOARD --- */}
        {activeView === 'dashboard' && (
            <DashboardView 
                stats={stats}
                chartData={chartData}
                filteredData={filteredData}
                announcements={announcements}
                loadingData={loadingData}
                theme={theme}
                isDarkMode={isDarkMode}
                isAdmin={isAdmin}
                isKioskMode={isKioskMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchCategory={searchCategory}
                setSearchCategory={setSearchCategory}
                tbsPrice={tbsPrice}
                setTbsPrice={setTbsPrice}
                aiInsight={aiInsight}
                setAiInsight={setAiInsight}
                newAnnouncementContent={newAnnouncementContent}
                setNewAnnouncementContent={setNewAnnouncementContent}
                handleGenerateInsight={handleGenerateInsight}
                isGeneratingInsight={isGeneratingInsight}
                handleAddAnnouncementAction={handleAddAnnouncementAction}
                handleDeleteAnnouncementAction={handleDeleteAnnouncementAction}
                handleFileUpload={handleFileUpload}
                handleBackupData={handleBackupData}
                uploadStatus={uploadStatus}
                uploadMessage={uploadMessage}
                setSelectedTicket={setSelectedTicket}
                setSelectedLocation={setSelectedLocation}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                formatIndoDate={formatIndoDate}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
            />
        )}

        {/* --- VIEW: ANALISIS ARMADA --- */}
        {activeView === 'armada' && (
            <ArmadaView 
                vehicleStats={vehicleStats}
                theme={theme}
                isDarkMode={isDarkMode}
                setSelectedVehicle={setSelectedVehicle}
                formatNumber={formatNumber}
                formatIndoDate={formatIndoDate}
            />
        )}

        {/* --- VIEW: PREDIKSI SUPPLY (NEW) --- */}
        {activeView === 'prediksi' && (
            <PrediksiView 
                forecastData={forecastData}
                weatherLogs={weatherLogs} // Pass Weather Data
                theme={theme}
                isDarkMode={isDarkMode}
                formatNumber={formatNumber}
                forecastInsight={forecastInsight}
                setForecastInsight={setForecastInsight}
                handleGenerateForecastInsight={handleGenerateForecastInsight}
                isGeneratingInsight={isGeneratingInsight}
            />
        )}

        {/* --- VIEW: KUALITAS MATRIX (NEW) --- */}
        {activeView === 'kualitas' && (
            <KualitasView 
                qualityAnalytics={qualityAnalytics}
                theme={theme}
                isDarkMode={isDarkMode}
                formatNumber={formatNumber}
                setSelectedLocation={setSelectedLocation}
            />
        )}

        {/* --- VIEW: OPERASIONAL SMART YARD (NEW) --- */}
        {activeView === 'operasional' && (
            <OperasionalView 
                yardTrucks={yardTrucks}
                theme={theme}
                isDarkMode={isDarkMode}
                onMoveTruck={handleMoveTruck}
                formatIndoTime={(d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            />
        )}

      </main>

      {/* FEATURE: Location Analytics Modal */}
      {selectedLocation && locationAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${theme.card} border ${theme.border} bg-white dark:bg-slate-800`}>
              <div className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="text-emerald-500" /> 
                            {locationAnalytics.name}
                        </h3>
                        <p className={`text-sm ${theme.subtext}`}>Analisis performa pengiriman sawit</p>
                    </div>
                    <button onClick={() => setSelectedLocation(null)} className="p-1 rounded-full hover:bg-black/10 transition-colors"><X size={20}/></button>
                 </div>

                 {/* Key Stats Row */}
                 <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                        <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Total Netto</p>
                        <p className="text-lg font-bold text-emerald-600">{formatNumber(locationAnalytics.totalNetto)} KG</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                        <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Rata-rata BJR</p>
                        <p className="text-lg font-bold text-amber-600">{locationAnalytics.avgBJR.toFixed(2)} KG</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${theme.border} bg-slate-50 dark:bg-slate-900/50`}>
                        <p className={`text-xs uppercase font-bold mb-1 ${theme.subtext}`}>Total Trip</p>
                        <p className="text-lg font-bold text-blue-600">{locationAnalytics.totalTrips} Unit</p>
                    </div>
                 </div>

                 {/* Trend Chart */}
                 <div className="mb-4">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><TrendingUp size={14}/> Tren 14 Hari Terakhir</h4>
                    <div className="h-[200px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={locationAnalytics.trend}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                              <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDarkMode ? '#94a3b8' : '#64748b'}} />
                              <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000'}} />
                              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="text-center">
                    <button onClick={() => setSelectedLocation(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                        Tutup Analisis
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          formatNumber={formatNumber}
          formatDate={formatIndoDate}
        />
      )}

      {/* VEHICLE DETAIL MODAL (NEW) */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.card} border ${theme.border} bg-white dark:bg-slate-800`}>
              <div className="sticky top-0 p-6 border-b border-gray-100 dark:border-gray-700 bg-inherit z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black font-mono flex items-center gap-2 text-slate-700 dark:text-white">
                            {selectedVehicle.nopol}
                        </h3>
                        <p className={`text-sm ${theme.subtext}`}>Riwayat Aktivitas Kendaraan</p>
                    </div>
                    <button onClick={() => setSelectedVehicle(null)} className="p-2 rounded-full hover:bg-black/10 transition-colors"><X size={20}/></button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Mini Stats */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <span className="text-xs font-bold text-emerald-600 uppercase">Total Angkut</span>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatNumber(selectedVehicle.totalNetto)} KG</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <span className="text-xs font-bold text-blue-600 uppercase">Jumlah Trip</span>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{selectedVehicle.tripCount} Trip</div>
                    </div>
                 </div>

                 {/* History Table */}
                 <div>
                    <h4 className="font-bold mb-3 text-sm">5 Tiket Terakhir</h4>
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Lokasi</th>
                                    <th className="px-4 py-3 text-right">Netto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {selectedVehicle.tickets.slice(0, 5).map((t, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3">{formatIndoDate(new Date(t.tanggal))}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{t.lokasi}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatNumber(t.netto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 pt-0 text-center">
                    <button onClick={() => setSelectedVehicle(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-sm font-bold transition-colors">
                        Tutup
                    </button>
              </div>
           </div>
        </div>
      )}

      {!isKioskMode && (
        <footer className={`mt-12 py-8 text-center text-sm ${theme.border} border-t`}>
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={handleGenerateInsight} disabled={isGeneratingInsight} className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all disabled:opacity-70 hover:-translate-y-1">
                <Sparkles size={16} className={isGeneratingInsight ? "animate-spin" : ""} /> AI Insight
            </button>
             {/* PDF REPORT BUTTON */}
            <button 
                onClick={handleDownloadReport} 
                disabled={isGeneratingPDF}
                className={`flex items-center justify-center gap-2 px-6 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-full shadow-lg text-sm font-bold transition-all disabled:opacity-70 hover:-translate-y-1`}
            >
                {isGeneratingPDF ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Printer size={16} />}
                {isGeneratingPDF ? 'Generating...' : 'Laporan Harian (PDF)'}
            </button>
            <button onClick={loadInitialData} className={`flex items-center justify-center gap-2 px-6 py-2 border ${theme.border} ${theme.card} hover:opacity-80 rounded-full shadow-sm text-sm font-bold transition-all hover:-translate-y-1`}>
                <CheckCircle size={16} /> Refresh Data
            </button>
          </div>
          <p className="opacity-50">&copy; {new Date().getFullYear()} DataCBS System. Powered by Supabase & Gemini.</p>
        </footer>
      )}
    </div>
  );
}