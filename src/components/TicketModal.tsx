import React from 'react';
import jsPDF from 'jspdf';
import { Download, FileText } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, formatNumber, formatDate }) => {

  const generateBeritaAcara = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to center text
    const centerText = (text: string, y: number) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    centerText("BERITA ACARA KETIDAKSESUAIAN HASIL SORTASI TBS", 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    centerText(`Nomor: BA/SORT/${new Date().toISOString().split('T')[0].replace(/-/g, '')}/${ticket.id}`, 26);

    // Line
    doc.line(20, 30, pageWidth - 20, 30);

    // Body
    doc.setFontSize(11);
    let y = 40;

    doc.text(`Pada hari ini ${formatDate(new Date())}, bertempat di PKS PT. Sawit Makmur Abadi, kami yang bertanda tangan di bawah ini:`, 20, y);

    y += 10;
    doc.text("1. Pihak Pertama (Pengirim):", 20, y);
    doc.text(`   Nama Supir: [Nama Supir - Manual]`, 25, y + 6);
    doc.text(`   Nopol: ${ticket.nopol}`, 25, y + 12);
    doc.text(`   Mewakili: ${ticket.lokasi}`, 25, y + 18);

    y += 24;
    doc.text("2. Pihak Kedua (Penerima):", 20, y);
    doc.text(`   Nama: Petugas Sortasi`, 25, y + 6);
    doc.text(`   Jabatan: Grader`, 25, y + 12);

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("POKOK PERMASALAHAN:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Menyatakan bahwa telah terjadi ketidaksepakatan terhadap hasil sortasi TBS dengan rincian tiket penimbangan nomor ${ticket.id} sebagai berikut:`, 20, y, { maxWidth: pageWidth - 40 });

    y += 12;
    doc.text(`- Hasil Sortasi Awal: Potongan Sampah & Air > Standar`, 25, y);
    doc.text(`- Keberatan Pihak Pertama: Kualitas buah diklaim sesuai standar.`, 25, y + 6);

    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("HASIL KESEPAKATAN (RE-SORTING):", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text("Atas ketidaksepakatan tersebut, telah dilakukan pemeriksaan ulang (Resorting) secara bersama-sama, dengan hasil akhir yang disepakati sebagai berikut:", 20, y, { maxWidth: pageWidth - 40 });

    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 4, pageWidth - 40, 10, 'FD');
    centerText(`FINAL AGREEMENT: POTONGAN DISEPAKATI = ____________ %`, y + 2);

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.text("Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.", 20, y, { maxWidth: pageWidth - 40 });

    // Signatures
    y += 20;
    const colWidth = (pageWidth - 40) / 3;

    centerText("Pihak Pertama", y);
    doc.text("Pihak Kedua", 20 + colWidth * 1.5 - 10, y);
    doc.text("Mengetahui", 20 + colWidth * 2.5 - 10, y);

    y += 5;
    doc.text("(Supir)", 20 + 15, y);
    doc.text("(Grader)", 20 + colWidth * 1.5 - 5, y);
    doc.text("(Security/Saksi)", 20 + colWidth * 2.5 - 12, y);

    y += 25;
    doc.text("( ....................... )", 20 + 5, y);
    doc.text("( ....................... )", 20 + colWidth * 1.5 - 10, y);
    doc.text("( ....................... )", 20 + colWidth * 2.5 - 15, y);

    // Save
    doc.save(`BA_Sortasi_${ticket.id}.pdf`);
  };

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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">Tutup</button>
              <button className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                <Download size={14} /> Simpan
              </button>
            </div>
            {/* Feature #44: Berita Acara Button */}
            <button
              onClick={generateBeritaAcara}
              className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <FileText size={14} /> BUAT BERITA ACARA SENGKETA
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