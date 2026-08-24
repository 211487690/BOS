import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Edit3,
} from 'lucide-react';
import { Transaction, MadrasahProfile, JuknisRulesCompliance, MainCategory } from '../types/bos';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

interface TabAutomaticReportsProps {
  profile: MadrasahProfile;
  transactions: Transaction[];
  compliance: JuknisRulesCompliance;
  saldoBku: number;
  saldoKas: number;
  saldoBank: number;
  onUpdateProfile?: (profile: MadrasahProfile) => void;
}

export const TabAutomaticReports: React.FC<TabAutomaticReportsProps> = ({
  profile,
  transactions,
  compliance,
  saldoBku,
  saldoKas,
  saldoBank,
  onUpdateProfile,
}) => {
  const [reportType, setReportType] = useState<'K7A' | 'BKU' | 'PAJAK' | 'SPTB'>('K7A');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Kop Form K-7a Customizable State
  const [customKopLine1, setCustomKopLine1] = useState('KEMENTERIAN AGAMA REPUBLIK INDONESIA');
  const [customKopLine2, setCustomKopLine2] = useState(profile.namaMadrasah.toUpperCase());
  const [customKopLine3, setCustomKopLine3] = useState(`${profile.alamat}`);
  const [isEditingKop, setIsEditingKop] = useState(false);

  // Signatories (Kepala & Bendahara) Customizable State
  const [kepalaMadrasahName, setKepalaMadrasahName] = useState(profile.kepalaMadrasah);
  const [kepalaMadrasahNip, setKepalaMadrasahNip] = useState(profile.nipKepala);
  const [bendaharaName, setBendaharaName] = useState(profile.bendahara);
  const [bendaharaNip, setBendaharaNip] = useState(profile.nipBendahara);
  const [tanggalKotaLaporan, setTanggalKotaLaporan] = useState(`${profile.kabKota}, 30 Juni 2026`);
  const [isEditingTtd, setIsEditingTtd] = useState(false);

  useEffect(() => {
    setCustomKopLine2(profile.namaMadrasah.toUpperCase());
    setCustomKopLine3(`${profile.alamat}`);
    setKepalaMadrasahName(profile.kepalaMadrasah);
    setKepalaMadrasahNip(profile.nipKepala);
    setBendaharaName(profile.bendahara);
    setBendaharaNip(profile.nipBendahara);
    setTanggalKotaLaporan(`${profile.kabKota}, 30 Juni 2026`);
  }, [profile]);

  const handleSaveSignatories = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        kepalaMadrasah: kepalaMadrasahName,
        nipKepala: kepalaMadrasahNip,
        bendahara: bendaharaName,
        nipBendahara: bendaharaNip,
      });
    }
    setIsEditingTtd(false);
  };

  // Filter transactions by month if applicable
  const reportTransactions = transactions.filter((t) => {
    if (selectedMonth === 'ALL') return true;
    return new Date(t.tanggal).getMonth() + 1 === Number(selectedMonth);
  });

  // Calculate Form K7a Component breakdown
  const honorRutinTotal = transactions
    .filter((t) => t.subCategory === 'Honor Rutin (Pendidik/Tenaga Kependidikan Non-ASN)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const honorOutputTotal = transactions
    .filter((t) => t.subCategory === 'Honor Output Kegiatan (Narasumber/Pelatih External)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const honorItTotal = transactions
    .filter((t) => t.subCategory === 'Honor Operator IT Data Madrasah')
    .reduce((acc, t) => acc + t.nominal, 0);

  const operasionalAtkTotal = transactions
    .filter((t) => t.subCategory === 'Operasional Offisial & ATK')
    .reduce((acc, t) => acc + t.nominal, 0);

  const dayaJasaTotal = transactions
    .filter((t) => t.subCategory === 'Daya & Jasa (Listrik/Air/Internet/Digital)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const pemeliharaanTotal = transactions
    .filter((t) => t.subCategory === 'Pemeliharaan Gedung & Sarpras Non-Struktural')
    .reduce((acc, t) => acc + t.nominal, 0);

  const lainnyaRutinTotal = transactions
    .filter((t) => t.subCategory === 'Lainnya (Rapat, Transport, Website, PPDB)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const fisikTotal = transactions
    .filter((t) => t.subCategory === 'Fisik (Alat/Mesin, Sanitasi/WC, Buku Agama, Genset)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const nonFisikTotal = transactions
    .filter((t) => t.subCategory === 'Non-Fisik (Pelatihan, Potential Siswa, Konsumsi)')
    .reduce((acc, t) => acc + t.nominal, 0);

  const khususMbgTotal = transactions
    .filter((t) => t.subCategory === 'Penanganan Kesehatan & MBG')
    .reduce((acc, t) => acc + t.nominal, 0);

  const admBankTotal = transactions
    .filter((t) => t.subCategory === 'Biaya Adm Bank & Ongkir Online')
    .reduce((acc, t) => acc + t.nominal, 0);

  // Total Tax Summary
  const totalPpn = transactions.reduce((acc, t) => acc + t.ppn, 0);
  const totalPph23 = transactions.reduce((acc, t) => acc + t.pph23, 0);
  const totalPph42 = transactions.reduce((acc, t) => acc + t.pph42, 0);
  const totalMeterai = transactions.reduce((acc, t) => acc + t.meterai, 0);
  const grandTotalTax = totalPpn + totalPph23 + totalPph42 + totalMeterai;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Report Selector Header (Hidden during Print) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
                PELAPORAN OTOMATIS JUKNIS 2026
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0F2D2D] mt-2">
              Pusat Pelaporan Keuangan Kemenag (Form K-7a, BKU, Pajak & SPTB)
            </h2>
            <p className="text-xs text-[#526E6E] mt-1">
              Laporan terformat otomatis sesuai Juknis BOP RA dan BOS Madrasah Tahun 2026 siap cetak atau ekspor.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0F766E] text-white font-bold text-xs sm:text-sm hover:bg-[#0D4D4D] transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#99F6E4]" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[#E2EEEE]">
          <button
            onClick={() => setReportType('K7A')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'K7A'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-[#F2F8F8] text-[#0F2D2D] hover:bg-[#CCFBF1] border border-[#D1E5E5]'
            }`}
          >
            📋 Form K-7a (Realisasi Komponen)
          </button>
          <button
            onClick={() => setReportType('BKU')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'BKU'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-[#F2F8F8] text-[#0F2D2D] hover:bg-[#CCFBF1] border border-[#D1E5E5]'
            }`}
          >
            📖 Buku Kas Umum Official
          </button>
          <button
            onClick={() => setReportType('PAJAK')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'PAJAK'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-[#F2F8F8] text-[#0F2D2D] hover:bg-[#CCFBF1] border border-[#D1E5E5]'
            }`}
          >
            💸 Buku Pembantu Pajak
          </button>
          <button
            onClick={() => setReportType('SPTB')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              reportType === 'SPTB'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-[#F2F8F8] text-[#0F2D2D] hover:bg-[#CCFBF1] border border-[#D1E5E5]'
            }`}
          >
            ✍️ Surat SPTB Belanja
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#D1E5E5] p-8 sm:p-12 text-[#0F2D2D] font-sans max-w-5xl mx-auto print:shadow-none print:border-none print:p-0">
        
        {/* Official Header Kop Madrasah */}
        <div className="relative text-center border-b-2 border-[#0F766E] pb-4 mb-6">
          <div className="absolute right-0 top-0 print:hidden">
            <button
              onClick={() => setIsEditingKop(!isEditingKop)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#E6FFFA] hover:bg-[#CCFBF1] text-[#0F766E] font-bold border border-[#99F6E4] transition shadow-sm"
              title="Edit Teks KOP Surat Laporan"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingKop ? 'Tutup Edit KOP' : 'Edit KOP Surat'}</span>
            </button>
          </div>

          {isEditingKop && (
            <div className="space-y-2 p-4 bg-[#F2F8F8] rounded-xl border border-[#D1E5E5] mb-4 text-left print:hidden">
              <div className="text-xs font-bold text-[#0F766E] flex items-center gap-1 mb-1">
                <span>Custom Editor KOP Surat Laporan</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#526E6E] uppercase">KOP Baris 1 (Instansi Internal)</label>
                <input
                  type="text"
                  value={customKopLine1}
                  onChange={(e) => setCustomKopLine1(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-bold text-center bg-white text-[#0F2D2D]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#526E6E] uppercase">KOP Baris 2 (Nama Lembaga / Madrasah)</label>
                <input
                  type="text"
                  value={customKopLine2}
                  onChange={(e) => setCustomKopLine2(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-bold text-center bg-white text-[#0F2D2D]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#526E6E] uppercase">KOP Baris 3 (Alamat & Detail)</label>
                <input
                  type="text"
                  value={customKopLine3}
                  onChange={(e) => setCustomKopLine3(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-bold text-center bg-white text-[#0F2D2D]"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Logo Madrasah on KOP Left */}
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo Madrasah" className="max-h-20 max-w-20 object-contain" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-black text-xl border-2 border-[#2DD4BF]">
                  {profile.jenjang}
                </div>
              )}
            </div>

            <div className="text-center flex-1">
              <h3 className="text-xs font-extrabold tracking-widest uppercase text-[#526E6E]">
                {customKopLine1}
              </h3>
              <h1 className="text-xl font-black text-[#0F766E] uppercase tracking-wider mt-0.5">
                {customKopLine2}
              </h1>
              <p className="text-xs font-medium text-[#0F2D2D] mt-0.5">
                {customKopLine3} | NSM: {profile.nsm} | NPSN: {profile.npsn}
              </p>
            </div>

            <div className="w-20 text-right shrink-0">
              <span className="text-[10px] font-bold text-[#0F766E] block">BOS 2026</span>
              <span className="text-[9px] font-mono text-[#526E6E] block">KEMENAG RI</span>
            </div>
          </div>
        </div>

        {/* 1. REPORT TYPE: FORM K-7A */}
        {reportType === 'K7A' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#3E3D39] uppercase tracking-wide">
                FORMULIR K-7a
              </h3>
              <h4 className="text-sm font-semibold text-[#3E3D39] uppercase">
                LAPORAN REALISASI PENGGUNAAN DANA BOS MADRASAH / BOP RA
              </h4>
              <p className="text-xs text-[#7C7A70] mt-0.5">TAHUN ANGGARAN 2026</p>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-[#E5E2D8]">
              <thead>
                <tr className="bg-[#F8F7F2] text-[#3E3D39] font-bold border-b border-[#E5E2D8]">
                  <th className="border border-[#E5E2D8] px-3 py-2 text-center w-12">NO</th>
                  <th className="border border-[#E5E2D8] px-3 py-2">KOMPONEN PENGGUNAAN DANA JUKNIS 2026</th>
                  <th className="border border-[#E5E2D8] px-3 py-2 text-right">JUMLAH REALISASI (RP)</th>
                  <th className="border border-[#E5E2D8] px-3 py-2 text-center w-24">% TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEC] font-medium">
                {/* A. HONOR */}
                <tr className="bg-[#F8F7F2] font-bold">
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">A</td>
                  <td className="border border-[#E5E2D8] px-3 py-2">KOMPONEN HONORARIUM</td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-right">
                    {formatRupiah(honorRutinTotal + honorOutputTotal + honorItTotal)}
                  </td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">
                    {((honorRutinTotal + honorOutputTotal + honorItTotal) / (compliance.totalSpentTahap1 || 1) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">A.1</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Honor Rutin Pendidik & Tenaga Kependidikan Non-ASN</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(honorRutinTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">Max 60%</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">A.2</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Honor Output Kegiatan (Narasumber/Pelatih External)</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(honorOutputTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">A.3</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Honor Operator IT Pengelola Data EMIS/Madrasah</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(honorItTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">Min 50% UMK</td>
                </tr>

                {/* B. KEGIATAN RUTIN */}
                <tr className="bg-[#F8F7F2] font-bold">
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">B</td>
                  <td className="border border-[#E5E2D8] px-3 py-2">KEGIATAN RUTIN OPERASIONAL</td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-right">
                    {formatRupiah(operasionalAtkTotal + dayaJasaTotal + pemeliharaanTotal + lainnyaRutinTotal)}
                  </td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">B.1</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Belanja Operasional Offisial & ATK Habis Pakai</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(operasionalAtkTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">B.2</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Langganan Daya & Jasa (Listrik/Air/Internet/Digital)</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(dayaJasaTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">B.3</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Pemeliharaan Ringan Sarpras & Gedung (Non-Struktural)</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(pemeliharaanTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>

                {/* C. KEGIATAN NON RUTIN */}
                <tr className="bg-[#F8F7F2] font-bold">
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">C</td>
                  <td className="border border-[#E5E2D8] px-3 py-2">KEGIATAN NON-RUTIN (FISIK & NON-FISIK)</td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-right">
                    {formatRupiah(fisikTotal + nonFisikTotal)}
                  </td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">C.1</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Pengadaan Fisik (Sanitasi/WC, Buku Agama, Genset)</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(fisikTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>
                <tr>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">C.2</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 pl-6">Non-Fisik (Pelatihan Kadin/Guru/Staf, Lomba Siswa)</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-right">{formatRupiah(nonFisikTotal)}</td>
                  <td className="border border-[#E5E2D8] px-3 py-1.5 text-center text-[#7C7A70]">-</td>
                </tr>

                {/* D. KHUSUS & MBG */}
                <tr className="bg-[#F8F7F2] font-bold">
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">D</td>
                  <td className="border border-[#E5E2D8] px-3 py-2">KEGIATAN KHUSUS & LAIN-LAIN (MBG / BANK)</td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-right">
                    {formatRupiah(khususMbgTotal + admBankTotal)}
                  </td>
                  <td className="border border-[#E5E2D8] px-3 py-2 text-center">-</td>
                </tr>

                {/* GRAND TOTAL */}
                <tr className="bg-[#E6EBE4] text-[#3E3D39] font-extrabold text-sm border-t-2 border-[#3D5337]">
                  <td colSpan={2} className="border border-[#E5E2D8] px-3 py-2.5 text-right">JUMLAH TOTAL REALISASI BELANJA</td>
                  <td className="border border-[#E5E2D8] px-3 py-2.5 text-right text-[#3D5337]">
                    {formatRupiah(transactions.filter(t => t.jenis === 'KELUAR').reduce((acc, t) => acc + t.nominal, 0))}
                  </td>
                  <td className="border border-[#E5E2D8] px-3 py-2.5 text-center">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REPORT TYPE: OFFICIAL BKU */}
        {reportType === 'BKU' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#3E3D39] uppercase">BUKU KAS UMUM (BKU)</h3>
              <p className="text-xs text-[#7C7A70]">MADRASAH: {profile.namaMadrasah.toUpperCase()} | PERIODE 2026</p>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-[#E5E2D8]">
              <thead>
                <tr className="bg-[#F8F7F2] text-[#3E3D39] font-bold border-b border-[#E5E2D8]">
                  <th className="border border-[#E5E2D8] px-2 py-2">NO BUKTI</th>
                  <th className="border border-[#E5E2D8] px-2 py-2">TANGGAL</th>
                  <th className="border border-[#E5E2D8] px-2 py-2">URAIAN TRANSAKSI</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">DEBET (MASUK)</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">KREDIT (KELUAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEC]">
                {reportTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 font-bold">{t.nomorBukti}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5">{t.tanggal}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5">{t.uraian}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right font-semibold text-[#4A6741]">
                      {t.jenis === 'MASUK' ? formatRupiah(t.nominal) : '-'}
                    </td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right font-semibold text-[#3E3D39]">
                      {t.jenis === 'KELUAR' ? formatRupiah(t.nominal) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. REPORT TYPE: BUKU PEMBANTU PAJAK */}
        {reportType === 'PAJAK' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-bold text-[#3E3D39] uppercase">BUKU PEMBANTU PAJAK</h3>
              <p className="text-xs text-[#7C7A70]">REKAPITULASI PEMOTONGAN & PENYETORAN PAJAK KEMENAG 2026</p>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-[#E5E2D8]">
              <thead>
                <tr className="bg-[#F8F7F2] text-[#3E3D39] font-bold border-b border-[#E5E2D8]">
                  <th className="border border-[#E5E2D8] px-2 py-2">NO BUKTI</th>
                  <th className="border border-[#E5E2D8] px-2 py-2">URAIAN BELANJA</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">PPN (12%)</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">PPh 23</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">PPh 4(2)</th>
                  <th className="border border-[#E5E2D8] px-2 py-2 text-right">METERAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEC]">
                {transactions.filter(t => t.ppn > 0 || t.pph23 > 0 || t.meterai > 0).map((t) => (
                  <tr key={t.id}>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 font-bold">{t.nomorBukti}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5">{t.uraian}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right">{t.ppn > 0 ? formatRupiah(t.ppn) : '-'}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right">{t.pph23 > 0 ? formatRupiah(t.pph23) : '-'}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right">{t.pph42 > 0 ? formatRupiah(t.pph42) : '-'}</td>
                    <td className="border border-[#E5E2D8] px-2 py-1.5 text-right">{t.meterai > 0 ? 'Rp 10.000' : '-'}</td>
                  </tr>
                ))}
                <tr className="bg-[#F8F7F2] font-extrabold text-[#3E3D39]">
                  <td colSpan={2} className="border border-[#E5E2D8] px-2 py-2 text-right">TOTAL PAJAK TERHUTANG / DISETOR</td>
                  <td className="border border-[#E5E2D8] px-2 py-2 text-right">{formatRupiah(totalPpn)}</td>
                  <td className="border border-[#E5E2D8] px-2 py-2 text-right">{formatRupiah(totalPph23)}</td>
                  <td className="border border-[#E5E2D8] px-2 py-2 text-right">{formatRupiah(totalPph42)}</td>
                  <td className="border border-[#E5E2D8] px-2 py-2 text-right">{formatRupiah(totalMeterai)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 4. REPORT TYPE: SPTB (Surat Pernyataan Tanggung Jawab Belanja) */}
        {reportType === 'SPTB' && (
          <div className="space-y-6 text-xs leading-relaxed">
            <div className="text-center font-bold">
              <h3 className="text-base uppercase text-[#3E3D39]">SURAT PERNYATAAN TANGGUNG JAWAB BELANJA (SPTB)</h3>
              <p className="text-xs text-[#7C7A70]">NOMOR: {profile.nsm}/SPTB-BOS/2026</p>
            </div>

            <p>Yang bertanda tangan di bawah ini:</p>
            <div className="pl-4 space-y-1 font-semibold text-[#3E3D39]">
              <p>Nama Kepala Madrasah: {profile.kepalaMadrasah} (NIP: {profile.nipKepala})</p>
              <p>Madrasah: {profile.namaMadrasah} ({profile.jenjang})</p>
              <p>Alamat: {profile.alamat}</p>
            </div>

            <p>
              Menyatakan bahwa Dana Bantuan Operasional Sekolah (BOS) Tahun 2026 sebesar{' '}
              <strong>{formatRupiah(compliance.totalSpentTahap1)}</strong> telah dipergunakan secara sah, transparan, dan mematuhi seluruh ketentuan Juknis BOP RA dan BOS Madrasah Tahun 2026.
            </p>

            <div className="p-3 bg-[#F8F7F2] border border-[#E5E2D8] rounded-xl text-[11px] space-y-1">
              <p className="font-bold text-[#3D5337]">Ringkasan Kepatuhan Belanja Juknis 2026:</p>
              <p>1. Persentase Honor Rutin Guru: {compliance.honorRutinPercent.toFixed(1)}% (Max 60%)</p>
              <p>2. Pengadaan Produk Dalam Negeri (PDN): {compliance.pdnPercent.toFixed(1)}% (Min 30%)</p>
              <p>3. Pengadaan Usaha Mikro / Koperasi: {compliance.umkmPercent.toFixed(1)}% (Min 40%)</p>
            </div>
          </div>
        )}

        {/* Official Sign-Off Footer */}
        <div className="mt-12 pt-8 border-t border-[#D1E5E5] text-xs">
          {/* Signatories Editor Control (Hidden in Print) */}
          <div className="flex justify-end mb-4 print:hidden">
            <button
              onClick={() => setIsEditingTtd(!isEditingTtd)}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#E6FFFA] hover:bg-[#CCFBF1] text-[#0F766E] font-bold border border-[#99F6E4] transition shadow-sm"
              title="Edit Nama & NIP Kepala Madrasah dan Bendahara BOS"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingTtd ? 'Tutup Edit Penandatangan' : 'Edit Penandatangan (TTD Laporan)'}</span>
            </button>
          </div>

          {/* Interactive Custom Signatories Editor Form */}
          {isEditingTtd && (
            <div className="p-4 bg-[#F2F8F8] rounded-2xl border border-[#D1E5E5] mb-6 print:hidden space-y-4">
              <div className="text-xs font-bold text-[#0F766E]">
                Custom Edit Penandatangan Laporan (Kepala Madrasah & Bendahara BOS)
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kepala Madrasah Column */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-[#D1E5E5]">
                  <div className="font-bold text-[#0F766E] text-[11px] uppercase">Pejabat Kepala Madrasah</div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={kepalaMadrasahName}
                      onChange={(e) => setKepalaMadrasahName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-semibold text-[#0F2D2D] bg-[#F2F8F8]"
                      placeholder="Drs. H. Ahmad Fauzi, M.Pd."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">NIP Kepala Madrasah</label>
                    <input
                      type="text"
                      value={kepalaMadrasahNip}
                      onChange={(e) => setKepalaMadrasahNip(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-mono text-[#0F2D2D] bg-[#F2F8F8]"
                      placeholder="197508122003121002"
                    />
                  </div>
                </div>

                {/* Bendahara BOS Column */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-[#D1E5E5]">
                  <div className="font-bold text-[#0F766E] text-[11px] uppercase">Pejabat Bendahara BOS</div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={bendaharaName}
                      onChange={(e) => setBendaharaName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-semibold text-[#0F2D2D] bg-[#F2F8F8]"
                      placeholder="Siti Rahmawati, S.E."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">NIP Bendahara BOS</label>
                    <input
                      type="text"
                      value={bendaharaNip}
                      onChange={(e) => setBendaharaNip(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-mono text-[#0F2D2D] bg-[#F2F8F8]"
                      placeholder="198204152009012008"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">Tempat & Tanggal Laporan</label>
                <input
                  type="text"
                  value={tanggalKotaLaporan}
                  onChange={(e) => setTanggalKotaLaporan(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-lg text-xs font-semibold text-[#0F2D2D] bg-white"
                  placeholder="Kabupaten Malang, 30 Juni 2026"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveSignatories}
                  className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition"
                >
                  Simpan & Terapkan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* Rendered Signatures Grid */}
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-[#526E6E]">Mengetahui,</p>
              <p className="font-bold text-[#0F2D2D]">Kepala {profile.namaMadrasah}</p>
              <div className="h-20" />
              <p className="font-black text-[#0F2D2D] underline">{kepalaMadrasahName}</p>
              <p className="text-[#526E6E] text-[10px]">NIP. {kepalaMadrasahNip}</p>
            </div>

            <div>
              <p className="text-[#526E6E]">{tanggalKotaLaporan}</p>
              <p className="font-bold text-[#0F2D2D]">Bendahara BOS Madrasah</p>
              <div className="h-20" />
              <p className="font-black text-[#0F2D2D] underline">{bendaharaName}</p>
              <p className="text-[#526E6E] text-[10px]">NIP. {bendaharaNip}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
