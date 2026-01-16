import React from 'react';
import { Download } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, formatNumber, formatDate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden relative print:shadow-none">
        {/* Header Tiket */}
        <div className="bg-emerald-600 p-4 text-white text-center">
          <h3 className="font-bold text-lg uppercase tracking-widest border-b border-emerald-400/50 pb-2 mb-2">Tiket Timbangan</h3>
          <p className="text-xs opacity-80">PT. SAWIT MAKMUR ABADI</p>
          <p className="text-[10px] opacity-70">Jl. Perkebunan No. 1, Bengkulu</p>
        </div>

        {/* Isi Tiket */}
        <div className="p-6 text-slate-700 font-mono text-sm space-y-3 bg-white">
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
            <span className="text-slate-500">No. Tiket</span>
            <span className="font-bold">{ticket.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal</span>
            <span>{formatDate(new Date(ticket.tanggal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jam Masuk</span>
            <span>{ticket.jam_masuk}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
            <span className="text-slate-500">Jam Keluar</span>
            <span>{ticket.jam_keluar}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">No. Polisi</span>
            <span className="font-bold">{ticket.nopol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Afdeling</span>
            <span>{ticket.lokasi}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Janjang</span>
            <span>{ticket.janjang}</span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t-2 border-slate-800 mt-2">
            <span className="font-bold">NETTO</span>
            <span className="font-bold text-emerald-600">{formatNumber(ticket.netto)} KG</span>
          </div>
        </div>

        {/* Footer Tiket */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 mb-4">*Struk ini sah sebagai bukti serah terima buah.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">Tutup</button>
            <button className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
              <Download size={14} /> Simpan
            </button>
          </div>
        </div>

        {/* Hiasan Gerigi Kertas */}
        <div className="absolute top-full left-0 w-full h-4 bg-white" style={{ background: 'radial-gradient(circle, transparent 50%, white 50%) -5px -5px / 10px 10px repeat-x' }}></div>
      </div>
    </div>
  );
};

export default TicketModal;