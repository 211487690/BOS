import React, { useState } from 'react';
import { X, Printer, Download, FileSpreadsheet, Building2, Check, UserCheck, ShieldCheck } from 'lucide-react';
import { Transaction, MadrasahProfile } from '../types/bos';
import { formatRupiah, formatDateIndonesian, terbilang, downloadCsvFile } from '../utils/formatters';

interface KwitansiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  profile: MadrasahProfile;
  onUpdatePenerima?: (txId: string, penerimaNama: string) => void;
}

export const KwitansiModal: React.FC<KwitansiModalProps> = ({
  isOpen,
  onClose,
  transaction,
  profile,
  onUpdatePenerima,
}) => {
  if (!isOpen || !transaction) return null;

  const defaultPenerima =
    transaction.penerimaNama ||
    transaction.vendorNama ||
    (transaction.subCategory?.includes('Honor') ? 'Penerima Honorarium' : 'Penerima Uang / Toko / Penyedia');

  const [penerimaNama, setPenerimaNama] = useState(defaultPenerima);
  const [isEditingPenerima, setIsEditingPenerima] = useState(false);

  const handleSavePenerima = () => {
    setIsEditingPenerima(false);
    if (onUpdatePenerima && transaction) {
      onUpdatePenerima(transaction.id, penerimaNama);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = ['FIELD KWITANSI', 'NILAI / KETERANGAN'];
    const rows = [
      ['KWITANSI BUKTI PENGELUARAN', profile.namaMadrasah],
      ['Nomor Bukti BKU', transaction.nomorBukti],
      ['Tanggal Transaksi', formatDateIndonesian(transaction.tanggal)],
      ['Telah Terima Dari', `Bendahara BOS / Kepala ${profile.namaMadrasah}`],
      ['Uang Sejumlah (Rupiah)', formatRupiah(transaction.nominal)],
      ['Terbilang', terbilang(transaction.nominal)],
      ['Untuk Pembayaran', transaction.uraian],
      ['Kategori Utama', transaction.mainCategory || '-'],
      ['Sub-Kategori Juknis', transaction.subCategory || '-'],
      ['Metode Pembayaran', transaction.metodePembayaran],
      ['Potongan PPN (12%)', formatRupiah(transaction.ppn || 0)],
      ['Potongan PPh 21/22/23/4.2', formatRupiah((transaction.pph23 || 0) + (transaction.pph42 || 0))],
      ['Biaya Meterai', formatRupiah(transaction.meterai || 0)],
      ['Penerima Uang (Sebelah Kanan, Rata Kiri)', penerimaNama],
      ['Kepala Madrasah', `${profile.kepalaMadrasah} (NIP. ${profile.nipKepala || '-'})`],
      ['Bendahara BOS', `${profile.bendahara} (NIP. ${profile.nipBendahara || '-'})`],
      ['Lokasi & Tanggal Cetak', `${profile.kabKota}, ${formatDateIndonesian(transaction.tanggal)}`],
    ];

    downloadCsvFile(headers, rows, `Kwitansi_${transaction.nomorBukti.replace(/\//g, '_')}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#D1E5E5] overflow-hidden my-6 flex flex-col print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="bg-[#083838] text-white p-4 flex items-center justify-between shrink-0 border-b border-[#0F766E] print:hidden">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold uppercase">
              Official Receipt
            </span>
            <h2 className="text-base font-black tracking-tight text-white">
              Cetak Kwitansi Pengeluaran BOS 2026
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-[#2DD4BF] font-bold text-xs flex items-center space-x-1.5 transition border border-[#2DD4BF]/30"
              title="Export ke Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
              title="Cetak atau Simpan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#CCFBF1] hover:bg-[#0F766E] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Kwitansi Sheet */}
        <div className="p-8 space-y-6 text-[#0F2D2D] bg-white print:p-6 print:space-y-4">
          
          {/* Official KOP Header with Logo */}
          <div className="border-b-4 border-double border-[#083838] pb-4 flex items-center justify-between gap-4">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="Logo Madrasah"
                  className="max-h-20 max-w-20 object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#083838] text-white flex items-center justify-center font-black text-xl border-2 border-[#0D9488]">
                  {profile.jenjang}
                </div>
              )}
            </div>

            <div className="text-center flex-1 space-y-0.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0F766E]">
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </h4>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#083838]">
                {profile.namaMadrasah}
              </h2>
              <p className="text-[11px] font-semibold text-gray-700">
                NSM: {profile.nsm} | NPSN: {profile.npsn}
              </p>
              <p className="text-[10px] text-gray-600 italic">
                {profile.alamat}, {profile.kabKota}, {profile.provinsi}
              </p>
            </div>

            <div className="w-20 text-right shrink-0">
              <span className="text-[9px] font-mono text-gray-500 block">JUKNIS BOS 2026</span>
              <span className="text-[10px] font-bold text-[#0D9488] block">KEMENTERIAN AGAMA</span>
            </div>
          </div>

          {/* Title & Receipt Number */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black tracking-wider uppercase underline underline-offset-4 text-[#083838]">
              KWITANSI BUKTI PENGELUARAN
            </h3>
            <p className="text-xs font-mono font-bold text-gray-700">
              No. Bukti: <span className="text-[#0D9488]">{transaction.nomorBukti}</span>
            </p>
          </div>

          {/* Kwitansi Main Form Body */}
          <div className="border-2 border-[#083838] rounded-xl p-5 space-y-3.5 text-xs bg-slate-50/50 print:bg-transparent">
            <div className="grid grid-cols-12 gap-2 items-start">
              <span className="col-span-3 font-bold text-gray-700">Telah Terima Dari</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <span className="col-span-8 font-extrabold text-[#083838]">
                Kepala Madrasah / Bendahara BOS {profile.namaMadrasah}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 items-start">
              <span className="col-span-3 font-bold text-gray-700">Uang Sejumlah</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <div className="col-span-8 bg-[#CCFBF1]/40 border border-[#99F6E4] p-2 rounded-lg italic font-bold text-[#083838] print:bg-slate-100 print:border-gray-300">
                "{terbilang(transaction.nominal)}"
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 items-start">
              <span className="col-span-3 font-bold text-gray-700">Untuk Pembayaran</span>
              <span className="col-span-1 text-center font-bold">:</span>
              <div className="col-span-8 space-y-1">
                <p className="font-extrabold text-gray-900 leading-relaxed">{transaction.uraian}</p>
                {transaction.subCategory && (
                  <p className="text-[11px] text-gray-600 font-medium">
                    Sub-Kategori: <span className="font-bold text-[#0D9488]">{transaction.subCategory}</span>
                  </p>
                )}
                {transaction.metodePembayaran && (
                  <p className="text-[10px] text-gray-500 font-medium">
                    Metode Transaksi: <span className="uppercase font-bold">{transaction.metodePembayaran}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Tax Breakdown if applicable */}
            {(transaction.ppn > 0 || transaction.pph23 > 0 || transaction.pph42 > 0 || transaction.meterai > 0) && (
              <div className="pt-2 border-t border-dashed border-gray-300 grid grid-cols-12 gap-2 items-center text-[11px]">
                <span className="col-span-3 font-bold text-gray-600">Rincian Potongan Pajak</span>
                <span className="col-span-1 text-center font-bold">:</span>
                <div className="col-span-8 flex flex-wrap gap-3 font-semibold text-gray-700">
                  {transaction.ppn > 0 && <span>PPN 12%: {formatRupiah(transaction.ppn)}</span>}
                  {transaction.pph23 > 0 && <span>PPh 23/21: {formatRupiah(transaction.pph23)}</span>}
                  {transaction.pph42 > 0 && <span>PPh 4(2): {formatRupiah(transaction.pph42)}</span>}
                  {transaction.meterai > 0 && <span>Meterai: {formatRupiah(transaction.meterai)}</span>}
                </div>
              </div>
            )}

            {/* Large Amount Badge */}
            <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
              <div className="bg-[#083838] text-white px-5 py-2.5 rounded-xl font-black text-base tracking-wide border-2 border-[#0D9488] print:text-black print:bg-slate-200 print:border-black">
                Terbilang: {formatRupiah(transaction.nominal)}
              </div>
              <span className="text-[11px] text-gray-500 italic print:hidden">
                Lunas dibayar tunai/transfer
              </span>
            </div>
          </div>

          {/* SIGNATURE SECTION AS SPECIFIED BY USER:
              1. Penerima Uang di sebelah KANAN, tapi RATA KIRI di dalam kontainernya.
              2. Di bawahnya / sampingnya: Kepala Madrasah dan Bendahara BOS.
          */}
          <div className="pt-4 space-y-6">
            <div className="text-right text-xs font-semibold text-gray-700">
              {profile.kabKota}, {formatDateIndonesian(transaction.tanggal)}
            </div>

            <div className="grid grid-cols-2 gap-8 items-start text-xs">
              
              {/* Left Column: Signatures of Kepala Madrasah & Bendahara BOS */}
              <div className="space-y-8">
                {/* Kepala Madrasah */}
                <div className="space-y-12">
                  <div>
                    <p className="font-bold text-gray-700">Mengetahui/Menyetujui,</p>
                    <p className="font-black text-[#083838]">Kepala {profile.namaMadrasah}</p>
                  </div>
                  <div className="pt-2">
                    <p className="font-black text-[#083838] underline">{profile.kepalaMadrasah}</p>
                    <p className="text-[11px] font-mono text-gray-600">
                      NIP. {profile.nipKepala || '----------------------'}
                    </p>
                  </div>
                </div>

                {/* Bendahara BOS */}
                <div className="space-y-12 pt-2">
                  <div>
                    <p className="font-bold text-gray-700">Setuju Dibayar,</p>
                    <p className="font-black text-[#083838]">Bendahara BOS</p>
                  </div>
                  <div className="pt-2">
                    <p className="font-black text-[#083838] underline">{profile.bendahara}</p>
                    <p className="text-[11px] font-mono text-gray-600">
                      NIP. {profile.nipBendahara || '----------------------'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Penerima Uang (Right Side, but Text LEFT-ALIGNED inside right block) */}
              <div className="flex flex-col items-start pl-8 border-l border-gray-200 min-h-[220px] justify-between">
                <div>
                  <p className="font-bold text-gray-700">Telah Menerima Uang,</p>
                  <p className="font-black text-[#083838]">Penerima / Penyedia / Vendor</p>
                </div>

                {/* Signature space & Penerima Name */}
                <div className="w-full pt-16 space-y-1">
                  <div className="flex items-center space-x-2">
                    {isEditingPenerima ? (
                      <div className="flex items-center space-x-1 w-full print:hidden">
                        <input
                          type="text"
                          value={penerimaNama}
                          onChange={(e) => setPenerimaNama(e.target.value)}
                          className="px-2 py-1 text-xs border border-[#0D9488] rounded-lg w-full font-bold text-[#083838]"
                          placeholder="Nama Penerima Uang"
                          autoFocus
                        />
                        <button
                          onClick={handleSavePenerima}
                          className="p-1 rounded bg-[#0D9488] text-white"
                          title="Simpan"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-center space-x-2 w-full">
                        <p className="font-black text-[#083838] underline text-xs">
                          ( {penerimaNama} )
                        </p>
                        <button
                          onClick={() => setIsEditingPenerima(true)}
                          className="text-[10px] text-[#0D9488] hover:underline font-bold print:hidden"
                          title="Ubah Nama Penerima"
                        >
                          [Ubah]
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    {transaction.vendorNama ? `Vendor: ${transaction.vendorNama}` : 'Tanda tangan & Stempel Toko/Penerima'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Notes for Audit */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center print:pt-2">
            <span>Dokumen Bukti Pengeluaran Sah BOS Kemenag 2026</span>
            <span>Dicetak secara otomatis dari Aplikasi Pengelolaan BOS</span>
          </div>

        </div>

      </div>
    </div>
  );
};
