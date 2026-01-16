import React, { useState, useEffect, useMemo } from 'react';
import {
    MapPin, Plus, Edit2, Trash2, Search,
    CheckCircle, XCircle, Phone, User, Ruler, Navigation
} from 'lucide-react';
import type { Location } from '../../types';
import {
    fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus
} from '../../services/dataService';

interface MasterLokasiViewProps {
    isDarkMode: boolean;
}

const MasterLokasiView: React.FC<MasterLokasiViewProps> = ({ isDarkMode }) => {
    // State
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'internal' | 'plasma' | 'external'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        full_name: '',
        category: 'internal' as 'internal' | 'plasma' | 'external',
        latitude: '',
        longitude: '',
        area_hectares: '',
        distance_to_factory_km: '',
        pic_mandor_name: '',
        pic_contact: '',
        is_active: true,
        notes: ''
    });

    // Theme
    const theme = {
        bg: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
        card: isDarkMode ? 'bg-slate-800' : 'bg-white',
        border: isDarkMode ? 'border-slate-700' : 'border-slate-200',
        text: isDarkMode ? 'text-white' : 'text-slate-900',
        subtext: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    };

    // Load data
    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        setLoading(true);
        try {
            const data = await fetchLocations();
            setLocations(data);
        } catch (error: any) {
            console.error('Error loading locations:', error);
            alert('Gagal memuat data lokasi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtered locations
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch =
                loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                loc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

            const matchesCategory = categoryFilter === 'all' || loc.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && loc.is_active) ||
                (statusFilter === 'inactive' && !loc.is_active);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [locations, searchQuery, categoryFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = locations.length;
        const active = locations.filter(l => l.is_active).length;
        const internal = locations.filter(l => l.category === 'internal').length;
        const plasma = locations.filter(l => l.category === 'plasma').length;
        const external = locations.filter(l => l.category === 'external').length;
        return { total, active, internal, plasma, external };
    }, [locations]);

    // Handlers
    const handleAdd = () => {
        setModalMode('add');
        setFormData({
            code: '',
            name: '',
            full_name: '',
            category: 'internal',
            latitude: '',
            longitude: '',
            area_hectares: '',
            distance_to_factory_km: '',
            pic_mandor_name: '',
            pic_contact: '',
            is_active: true,
            notes: ''
        });
        setShowModal(true);
    };

    const handleEdit = (location: Location) => {
        setModalMode('edit');
        setSelectedLocation(location);
        setFormData({
            code: location.code,
            name: location.name,
            full_name: location.full_name || '',
            category: location.category,
            latitude: location.latitude?.toString() || '',
            longitude: location.longitude?.toString() || '',
            area_hectares: location.area_hectares?.toString() || '',
            distance_to_factory_km: location.distance_to_factory_km?.toString() || '',
            pic_mandor_name: location.pic_mandor_name || '',
            pic_contact: location.pic_contact || '',
            is_active: location.is_active,
            notes: location.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (modalMode === 'add') {
                await addLocation(formData);
                alert('Lokasi berhasil ditambahkan!');
            } else if (selectedLocation) {
                await updateLocation(selectedLocation.id, formData);
                alert('Lokasi berhasil diupdate!');
            }

            await loadLocations();
            setShowModal(false);
        } catch (error: any) {
            alert('Gagal menyimpan lokasi: ' + error.message);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Yakin ingin menghapus lokasi "${name}"?`)) return;

        try {
            await deleteLocation(id);
            alert('Lokasi berhasil dihapus!');
            await loadLocations();
        } catch (error: any) {
            alert('Gagal menghapus lokasi: ' + error.message);
        }
    };

    const handleToggleStatus = async (location: Location) => {
        try {
            await toggleLocationStatus(location.id, !location.is_active);
            await loadLocations();
        } catch (error: any) {
            alert('Gagal mengubah status: ' + error.message);
        }
    };

    const formatNumber = (n: number | undefined) => n ? n.toLocaleString('id-ID') : '-';

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="text-emerald-500" />
                            Master Lokasi & Afdeling
                        </h2>
                        <p className={`text-sm ${theme.subtext} mt-1`}>
                            Manajemen data lokasi supply (Afdeling, Plasma, Third-Party)
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        Tambah Lokasi
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <p className={`text-xs ${theme.subtext}`}>Total Lokasi</p>
                        <p className="text-2xl font-bold text-emerald-500">{stats.total}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <p className={`text-xs ${theme.subtext}`}>Aktif</p>
                        <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <p className={`text-xs ${theme.subtext}`}>Internal</p>
                        <p className="text-2xl font-bold text-blue-500">{stats.internal}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <p className={`text-xs ${theme.subtext}`}>Plasma</p>
                        <p className="text-2xl font-bold text-purple-500">{stats.plasma}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${theme.card} border ${theme.border}`}>
                        <p className={`text-xs ${theme.subtext}`}>External</p>
                        <p className="text-2xl font-bold text-amber-500">{stats.external}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.subtext}`} size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kode, nama lokasi..."
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                            />
                        </div>
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className={`px-4 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none cursor-pointer`}
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="internal">Internal</option>
                        <option value="plasma">Plasma</option>
                        <option value="external">External</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className={`px-4 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none cursor-pointer`}
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-2xl ${theme.card} border ${theme.border} overflow-hidden`}>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            <p className={`mt-2 ${theme.subtext}`}>Memuat data...</p>
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPin size={48} className={`mx-auto ${theme.subtext} mb-2`} />
                            <p className={theme.subtext}>Tidak ada lokasi ditemukan</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Kode</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Nama Lokasi</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Kategori</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">PIC/Mandor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold">Koordinat GPS</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold">Luas (Ha)</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold">Jarak (Km)</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredLocations.map((location) => (
                                    <tr key={location.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {location.code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{location.name}</div>
                                                {location.full_name && (
                                                    <div className={`text-xs ${theme.subtext}`}>{location.full_name}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${location.category === 'internal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                location.category === 'plasma' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                }`}>
                                                {location.category === 'internal' ? 'Internal' : location.category === 'plasma' ? 'Plasma' : 'External'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {location.pic_mandor_name ? (
                                                <div>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User size={14} />
                                                        {location.pic_mandor_name}
                                                    </div>
                                                    {location.pic_contact && (
                                                        <div className={`flex items-center gap-1 text-xs ${theme.subtext}`}>
                                                            <Phone size={12} />
                                                            {location.pic_contact}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={theme.subtext}>-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {location.latitude && location.longitude ? (
                                                <div className="flex items-center gap-1 text-xs font-mono">
                                                    <Navigation size={12} className="text-emerald-500" />
                                                    <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                                                </div>
                                            ) : (
                                                <span className={theme.subtext}>-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {location.area_hectares ? (
                                                <span className="flex items-center justify-end gap-1">
                                                    <Ruler size={14} className={theme.subtext} />
                                                    {formatNumber(location.area_hectares)}
                                                </span>
                                            ) : (
                                                <span className={theme.subtext}>-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatNumber(location.distance_to_factory_km)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(location)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 mx-auto ${location.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}
                                            >
                                                {location.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {location.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(location)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(location.id, location.name)}
                                                    className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {filteredLocations.length > 0 && (
                    <div className={`px-4 py-3 border-t ${theme.border} ${theme.subtext} text-sm`}>
                        Menampilkan {filteredLocations.length} dari {locations.length} lokasi
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className={`${theme.card} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                        <div className="p-6 border-b ${theme.border}">
                            <h3 className="text-xl font-bold">
                                {modalMode === 'add' ? 'Tambah Lokasi Baru' : 'Edit Lokasi'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kode Lokasi *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="AFD-A"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Lokasi *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="AFD A"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="AFD A NASAL"
                                    className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer`}
                                >
                                    <option value="internal">Internal</option>
                                    <option value="plasma">Plasma</option>
                                    <option value="external">External / Third-Party</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        placeholder="-6.123456"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        placeholder="106.789012"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Luas Area (Hektar)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.area_hectares}
                                        onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                                        placeholder="125.50"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jarak ke Pabrik (Km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.distance_to_factory_km}
                                        onChange={(e) => setFormData({ ...formData, distance_to_factory_km: e.target.value })}
                                        placeholder="5.2"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama PIC/Mandor</label>
                                    <input
                                        type="text"
                                        value={formData.pic_mandor_name}
                                        onChange={(e) => setFormData({ ...formData, pic_mandor_name: e.target.value })}
                                        placeholder="Budi Santoso"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kontak PIC</label>
                                    <input
                                        type="text"
                                        value={formData.pic_contact}
                                        onChange={(e) => setFormData({ ...formData, pic_contact: e.target.value })}
                                        placeholder="081234567890"
                                        className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Catatan tambahan..."
                                    className={`w-full px-3 py-2 rounded-lg border ${theme.border} ${isDarkMode ? 'bg-slate-700' : 'bg-white'} outline-none focus:ring-2 focus:ring-emerald-500`}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="is_active" className="text-sm">Aktif</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t ${theme.border}">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg border ${theme.border} hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    {modalMode === 'add' ? 'Tambah Lokasi' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterLokasiView;
