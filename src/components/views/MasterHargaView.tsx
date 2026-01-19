import React, { useState } from 'react';
import {
    DollarSign, History, Plus, Trash2, Calendar, Percent, Scale, AlertCircle
} from 'lucide-react';
import type { PriceHistory, DeductionRule } from '../../types';

interface MasterHargaViewProps {
    priceHistory: PriceHistory[];
    deductionRules: DeductionRule[];
    onAddPrice: (price: PriceHistory) => void;
    onAddRule: (rule: DeductionRule) => void;
    onDeleteRule: (id: string) => void;
    theme: any;
    formatCurrency: (n: number) => string;
}

const MasterHargaView: React.FC<MasterHargaViewProps> = ({
    priceHistory, deductionRules, onAddPrice, onAddRule, onDeleteRule,
    theme, formatCurrency
}) => {
    // Local state for forms
    const [activeTab, setActiveTab] = useState<'prices' | 'rules'>('prices');
    const [showPriceForm, setShowPriceForm] = useState(false);
    const [showRuleForm, setShowRuleForm] = useState(false);

    // New Price Form State
    const [newPrice, setNewPrice] = useState<Partial<PriceHistory>>({
        effective_date: new Date().toISOString().split('T')[0],
        price: 0,
        notes: ''
    });

    // New Rule Form State
    const [newRule, setNewRule] = useState<Partial<DeductionRule>>({
        name: '',
        type: 'percentage',
        value: 0,
        is_active: true,
        notes: ''
    });

    const handleSubmitPrice = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPrice.price && newPrice.effective_date) {
            onAddPrice({
                id: `PRC-${Date.now()}`,
                effective_date: newPrice.effective_date,
                price: Number(newPrice.price),
                notes: newPrice.notes,
                created_by: 'Admin' // Hardcoded for now
            });
            setShowPriceForm(false);
            setNewPrice({ effective_date: new Date().toISOString().split('T')[0], price: 0, notes: '' });
        }
    };

    const handleSubmitRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRule.name && newRule.value !== undefined) {
            onAddRule({
                id: `RULE-${Date.now()}`,
                name: newRule.name,
                type: newRule.type as 'percentage' | 'fixed_value',
                value: Number(newRule.value),
                is_active: newRule.is_active || true,
                notes: newRule.notes
            } as DeductionRule);
            setShowRuleForm(false);
            setNewRule({ name: '', type: 'percentage', value: 0, is_active: true, notes: '' });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="text-emerald-500" /> Master Harga & Potongan
                    </h2>
                    <p className={`text-sm ${theme.subtext}`}>Kelola harga dasar TBS dan aturan potongan (refaksi).</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'prices'
                            ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Riwayat Harga
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'rules'
                            ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Aturan Potongan
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: PRICES */}
            {activeTab === 'prices' && (
                <div className="space-y-4">
                    {/* Active Price Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-emerald-100 font-medium mb-1">Harga Berlaku Saat Ini</p>
                                <h3 className="text-4xl font-bold">{formatCurrency(priceHistory[0]?.price || 0)} <span className="text-lg font-normal opacity-80">/kg</span></h3>
                                <div className="flex items-center gap-2 mt-4 text-sm opacity-90">
                                    <Calendar size={16} />
                                    <span>Efektif sejak: {priceHistory[0]?.effective_date || '-'}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                <DollarSign size={32} />
                            </div>
                        </div>
                    </div>

                    {/* Price History Table */}
                    <div className={`rounded-xl border ${theme.card} overflow-hidden`}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <History size={18} className="text-slate-400" /> Riwayat Perubahan Harga
                            </h3>
                            <button
                                onClick={() => setShowPriceForm(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus size={16} /> Tambah Harga
                            </button>
                        </div>

                        {/* ADD PRICE FORM */}
                        {showPriceForm && (
                            <form onSubmit={handleSubmitPrice} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Efektif</label>
                                        <input
                                            type="date"
                                            required
                                            value={newPrice.effective_date}
                                            onChange={e => setNewPrice({ ...newPrice, effective_date: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${theme.input} ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Harga Baru (Rp/kg)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newPrice.price}
                                            onChange={e => setNewPrice({ ...newPrice, price: Number(e.target.value) })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${theme.input} ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Catatan (Opsional)</label>
                                        <input
                                            type="text"
                                            value={newPrice.notes}
                                            onChange={e => setNewPrice({ ...newPrice, notes: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none ${theme.input} ${theme.text}`}
                                            placeholder="Cth: Kenaikan harga CPO global"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPriceForm(false)}
                                        className="px-4 py-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-500/20"
                                    >
                                        Simpan Harga
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3">Tanggal Efektif</th>
                                        <th className="px-6 py-3 text-right">Harga (Rp)</th>
                                        <th className="px-6 py-3">Dibuat Oleh</th>
                                        <th className="px-6 py-3">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {priceHistory.map((ph, idx) => (
                                        <tr key={ph.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                                {idx === 0 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded font-bold uppercase">Aktif</span>}
                                                {ph.effective_date}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(ph.price)}</td>
                                            <td className="px-6 py-4 text-slate-500">{ph.created_by || '-'}</td>
                                            <td className="px-6 py-4 text-slate-500 italic">{ph.notes || '-'}</td>
                                        </tr>
                                    ))}
                                    {priceHistory.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada riwayat harga.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: RULES */}
            {activeTab === 'rules' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 w-full flex gap-4 items-start">
                            <AlertCircle className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-800 dark:text-blue-300">Konfigurasi Potongan (Refaksi)</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                    Aturan ini akan muncul sebagai opsi saat Grader melakukan input kualitas di aplikasi mobile.
                                    Potongan bertipe <b>Percentage</b> akan memotong dari Netto, sedangkan <b>Fixed Value</b> akan memotong sejumlah Kilogram tetap.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl border ${theme.card} overflow-hidden`}>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Scale size={18} className="text-slate-400" /> Daftar Aturan Potongan
                            </h3>
                            <button
                                onClick={() => setShowRuleForm(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus size={16} /> Tambah Aturan
                            </button>
                        </div>

                        {/* ADD RULE FORM */}
                        {showRuleForm && (
                            <form onSubmit={handleSubmitRule} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nama Potongan</label>
                                        <input
                                            type="text"
                                            required
                                            value={newRule.name}
                                            onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme.input} ${theme.text}`}
                                            placeholder="Contoh: Potongan Air, Sampah, Tangkai"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipe</label>
                                        <select
                                            value={newRule.type}
                                            onChange={e => setNewRule({ ...newRule, type: e.target.value as any })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme.input} ${theme.text}`}
                                        >
                                            <option value="percentage">Persentase (%)</option>
                                            <option value="fixed_value">Berat Tetap (KG)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nilai</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            value={newRule.value}
                                            onChange={e => setNewRule({ ...newRule, value: Number(e.target.value) })}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme.input} ${theme.text}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan</label>
                                    <input
                                        type="text"
                                        value={newRule.notes}
                                        onChange={e => setNewRule({ ...newRule, notes: e.target.value })}
                                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${theme.input} ${theme.text}`}
                                        placeholder="Penjelasan kapan potongan ini berlaku..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRuleForm(false)}
                                        className="px-4 py-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20"
                                    >
                                        Simpan Aturan
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {deductionRules.map((rule) => (
                                <div key={rule.id} className={`p-4 rounded-xl border flex flex-col justify-between group ${theme.card} hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`p-2 rounded-lg ${rule.type === 'percentage' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {rule.type === 'percentage' ? <Percent size={18} /> : <Scale size={18} />}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={() => onDeleteRule(rule.id)} className="p-1.5 hover:bg-red-100 text-red-500 rounded"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">{rule.name}</h4>
                                        <div className="text-2xl font-black text-slate-700 dark:text-slate-200 mb-2">
                                            {rule.value}
                                            <span className="text-sm font-normal text-slate-400 ml-1">
                                                {rule.type === 'percentage' ? '%' : 'KG'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2">{rule.notes || 'Tidak ada keterangan tambahan.'}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {rule.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterHargaView;
