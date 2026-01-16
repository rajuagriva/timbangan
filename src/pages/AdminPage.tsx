import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload, Download, Database, Megaphone, Plus, Trash2,
    CheckCircle, AlertTriangle, ArrowLeft, Sun, Moon,
    RefreshCw, BarChart3, Truck, Scale, FileSpreadsheet
} from 'lucide-react';
import type { Ticket, Announcement } from '../types';
import {
    fetchTickets,
    fetchAnnouncements,
    addAnnouncement,
    deleteAnnouncement,
    uploadTicketsBulk
} from '../services/dataService';
import { isSupabaseConfigured } from '../supabaseClient';

const AdminPage: React.FC = () => {
    // State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [data, setData] = useState<Ticket[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

    // Theme
    const theme = {
        bg: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
        text: isDarkMode ? 'text-white' : 'text-slate-800',
        card: isDarkMode ? 'bg-slate-800' : 'bg-white',
        border: isDarkMode ? 'border-slate-700' : 'border-slate-200',
        subtext: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    };

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setIsSupabaseConnected(isSupabaseConfigured());

            try {
                const [ticketsData, announcementsData] = await Promise.all([
                    fetchTickets(),
                    fetchAnnouncements()
                ]);
                setData(ticketsData);
                setAnnouncements(announcementsData);
            } catch (error) {
                console.error('Error loading data:', error);
            }

            setIsLoading(false);
        };

        loadData();
    }, []);

    // Stats
    const stats = useMemo(() => {
        const totalNetto = data.reduce((acc, curr) => acc + curr.netto, 0);
        const totalJanjang = data.reduce((acc, curr) => acc + curr.janjang, 0);
        const totalTruk = data.length;
        const uniqueDates = new Set(data.map(d => d.tanggal)).size;
        return { totalNetto, totalJanjang, totalTruk, uniqueDates };
    }, [data]);

    // Handlers
    const handleAddAnnouncement = async () => {
        if (!newAnnouncementContent.trim()) return;
        try {
            const newAnn = await addAnnouncement(newAnnouncementContent);
            if (newAnn) {
                setAnnouncements(prev => [newAnn, ...prev]);
                setNewAnnouncementContent('');
            }
        } catch (error: any) {
            alert('Gagal menambah pengumuman: ' + error.message);
        }
    };

    const handleDeleteAnnouncement = async (id: number) => {
        try {
            await deleteAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            alert('Gagal menghapus pengumuman: ' + error.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus('processing');
        setUploadMessage('Membaca file CSV...');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length < 2) {
                    throw new Error('File CSV kosong atau tidak valid');
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const tickets: Ticket[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length < headers.length) continue;

                    const row: any = {};
                    headers.forEach((h, idx) => {
                        row[h] = values[idx];
                    });

                    // Map to Ticket structure
                    tickets.push({
                        id: row.id || row.no_tiket || `Tiket.${String(i).padStart(4, '0')}`,
                        tanggal: row.tanggal || row.date || '',
                        jam_masuk: row.jam_masuk || row.waktu_masuk || '',
                        jam_keluar: row.jam_keluar || row.waktu_keluar || '',
                        nopol: row.nopol || row.no_polisi || '',
                        netto: parseFloat(row.netto || row.berat_netto || '0'),
                        janjang: parseInt(row.janjang || row.jumlah_janjang || '0', 10),
                        lokasi: row.lokasi || row.asal || row.afdeling || ''
                    });
                }

                setUploadMessage(`Mengupload ${tickets.length} tiket...`);
                const count = await uploadTicketsBulk(tickets);

                setUploadStatus('success');
                setUploadMessage(`Berhasil upload ${count} tiket!`);

                // Refresh data
                const newData = await fetchTickets();
                setData(newData);

                setTimeout(() => {
                    setUploadStatus('idle');
                    setUploadMessage('');
                }, 3000);

            } catch (error: any) {
                setUploadStatus('error');
                setUploadMessage(error.message || 'Gagal memproses file');
                setTimeout(() => {
                    setUploadStatus('idle');
                }, 5000);
            }
        };

        reader.readAsText(file);
        e.target.value = '';
    };

    const handleBackupData = () => {
        if (data.length === 0) {
            alert('Tidak ada data untuk di-backup');
            return;
        }

        const headers = ['id', 'tanggal', 'jam_masuk', 'jam_keluar', 'nopol', 'netto', 'janjang', 'lokasi'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => (row as any)[h]).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_timbangan_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRefreshData = async () => {
        setIsLoading(true);
        try {
            const [ticketsData, announcementsData] = await Promise.all([
                fetchTickets(),
                fetchAnnouncements()
            ]);
            setData(ticketsData);
            setAnnouncements(announcementsData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
        setIsLoading(false);
    };

    const formatNumber = (n: number) => n.toLocaleString('id-ID');

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${theme.bg} ${theme.text}`}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/"
                                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span className="text-sm font-medium">Kembali</span>
                            </Link>
                            <div className="h-6 w-px bg-white/30" />
                            <div className="flex items-center gap-2">
                                <Database className="text-white" size={24} />
                                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Connection Status */}
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isSupabaseConnected
                                    ? 'bg-emerald-500/20 text-emerald-100'
                                    : 'bg-red-500/20 text-red-100'
                                }`}>
                                {isSupabaseConnected ? '✅ Database Connected' : '⚠️ Demo Mode'}
                            </div>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {isDarkMode ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-white" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                <Scale className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className={`text-xs ${theme.subtext}`}>Total Netto</p>
                                <p className="text-lg font-bold">{formatNumber(stats.totalNetto)} KG</p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className={`text-xs ${theme.subtext}`}>Total Janjang</p>
                                <p className="text-lg font-bold">{formatNumber(stats.totalJanjang)}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                                <Truck className="text-purple-600 dark:text-purple-400" size={20} />
                            </div>
                            <div>
                                <p className={`text-xs ${theme.subtext}`}>Total Record</p>
                                <p className="text-lg font-bold">{formatNumber(stats.totalTruk)}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                <BarChart3 className="text-amber-600 dark:text-amber-400" size={20} />
                            </div>
                            <div>
                                <p className={`text-xs ${theme.subtext}`}>Unique Days</p>
                                <p className="text-lg font-bold">{stats.uniqueDates}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className={`p-6 rounded-2xl ${theme.card} border ${theme.border}`}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Database size={20} className="text-emerald-500" />
                        Manajemen Data
                    </h2>

                    <div className="flex flex-wrap gap-4 items-center">
                        <label className="cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium">
                            <Upload size={18} />
                            Upload CSV
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={!isSupabaseConnected}
                            />
                        </label>

                        <button
                            onClick={handleBackupData}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border ${theme.border} ${theme.card} hover:opacity-80`}
                        >
                            <Download size={18} />
                            Backup Data
                        </button>

                        <button
                            onClick={handleRefreshData}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border ${theme.border} ${theme.card} hover:opacity-80`}
                            disabled={isLoading}
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>

                        {uploadStatus === 'processing' && (
                            <span className="text-blue-500 text-sm flex items-center gap-1">
                                <RefreshCw size={14} className="animate-spin" />
                                {uploadMessage || 'Memproses...'}
                            </span>
                        )}
                        {uploadStatus === 'success' && (
                            <span className="text-emerald-500 text-sm flex items-center gap-1">
                                <CheckCircle size={14} />
                                {uploadMessage || 'Upload Berhasil!'}
                            </span>
                        )}
                        {uploadStatus === 'error' && (
                            <span className="text-red-500 text-sm flex items-center gap-1">
                                <AlertTriangle size={14} />
                                {uploadMessage || 'Gagal!'}
                            </span>
                        )}
                    </div>

                    {!isSupabaseConnected && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                <strong>Demo Mode:</strong> Upload CSV tidak tersedia. Tambahkan konfigurasi Supabase di .env untuk mengaktifkan.
                            </p>
                        </div>
                    )}
                </div>

                {/* Announcement Management */}
                <div className={`p-6 rounded-2xl ${theme.card} border ${theme.border}`}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Megaphone size={20} className="text-blue-500" />
                        Manajemen Running Text
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newAnnouncementContent}
                            onChange={(e) => setNewAnnouncementContent(e.target.value)}
                            className={`flex-1 p-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}
                            placeholder="Tulis pesan pengumuman baru..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddAnnouncement()}
                            disabled={!isSupabaseConnected}
                        />
                        <button
                            onClick={handleAddAnnouncement}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            disabled={!isSupabaseConnected || !newAnnouncementContent.trim()}
                        >
                            <Plus size={18} />
                            Tambah
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                            <div className="text-center py-4 text-slate-400">Memuat pengumuman...</div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">Belum ada pengumuman</div>
                        ) : (
                            announcements.map((ann) => (
                                <div
                                    key={ann.id}
                                    className={`flex justify-between items-center p-3 rounded-xl border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}
                                >
                                    <span className="flex-1">{ann.content}</span>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(ann.id)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        disabled={!isSupabaseConnected}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Data Preview */}
                <div className={`p-6 rounded-2xl ${theme.card} border ${theme.border}`}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-purple-500" />
                        Preview Data Terbaru
                    </h2>

                    <div className="overflow-x-auto max-h-[400px]">
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-400">Memuat data...</div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">Belum ada data tiket</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} sticky top-0`}>
                                    <tr>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">No. Tiket</th>
                                        <th className="px-4 py-3 text-left">Nopol</th>
                                        <th className="px-4 py-3 text-left">Lokasi</th>
                                        <th className="px-4 py-3 text-right">Netto (KG)</th>
                                        <th className="px-4 py-3 text-right">Janjang</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {data.slice(0, 20).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">{row.tanggal}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                                            <td className="px-4 py-3">{row.nopol}</td>
                                            <td className={`px-4 py-3 ${theme.subtext}`}>{row.lokasi}</td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-500">{formatNumber(row.netto)}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(row.janjang)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {data.length > 20 && (
                        <p className={`text-center mt-4 text-sm ${theme.subtext}`}>
                            Menampilkan 20 dari {formatNumber(data.length)} record
                        </p>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className={`border-t ${theme.border} py-4 mt-8`}>
                <div className="container mx-auto px-4 text-center">
                    <p className={`text-sm ${theme.subtext}`}>
                        Admin Panel - DataCBS Dashboard
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default AdminPage;
