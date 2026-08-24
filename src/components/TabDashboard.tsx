import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  PlusCircle,
  FileSpreadsheet,
  Building,
  TrendingUp,
  Calendar,
  BarChart2,
  Activity,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  Area,
} from 'recharts';
import { Transaction, MadrasahProfile, JuknisRulesCompliance, MainCategory } from '../types/bos';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface TabDashboardProps {
  profile: MadrasahProfile;
  compliance: JuknisRulesCompliance;
  transactions: Transaction[];
  saldoBku: number;
  saldoKas: number;
  saldoBank: number;
  onOpenNewTransactionModal: () => void;
  setActiveTab: (tab: string) => void;
}

const CATEGORY_COLORS: Record<MainCategory, string> = {
  HONOR: '#0D9488', // Teal 600
  KEGIATAN_RUTIN: '#14B8A6', // Teal 500
  KEGIATAN_NON_RUTIN: '#D97706', // Warm Amber
  KHUSUS: '#0F766E', // Deep Teal
};

const CATEGORY_NAMES: Record<MainCategory, string> = {
  HONOR: 'A. Honorarium',
  KEGIATAN_RUTIN: 'B. Kegiatan Rutin',
  KEGIATAN_NON_RUTIN: 'C. Kegiatan Non-Rutin',
  KHUSUS: 'D. Khusus & MBG',
};

const MONTH_METADATA = [
  { key: '01', name: 'Jan', fullName: 'Januari', semester: 'Tahap I' },
  { key: '02', name: 'Feb', fullName: 'Februari', semester: 'Tahap I' },
  { key: '03', name: 'Mar', fullName: 'Maret', semester: 'Tahap I' },
  { key: '04', name: 'Apr', fullName: 'April', semester: 'Tahap I' },
  { key: '05', name: 'Mei', fullName: 'Mei', semester: 'Tahap I' },
  { key: '06', name: 'Jun', fullName: 'Juni', semester: 'Tahap I' },
  { key: '07', name: 'Jul', fullName: 'Juli', semester: 'Tahap II' },
  { key: '08', name: 'Ags', fullName: 'Agustus', semester: 'Tahap II' },
  { key: '09', name: 'Sep', fullName: 'September', semester: 'Tahap II' },
  { key: '10', name: 'Okt', fullName: 'Oktober', semester: 'Tahap II' },
  { key: '11', name: 'Nov', fullName: 'November', semester: 'Tahap II' },
  { key: '12', name: 'Des', fullName: 'Desember', semester: 'Tahap II' },
];

export const TabDashboard: React.FC<TabDashboardProps> = ({
  profile,
  compliance,
  transactions,
  saldoBku,
  saldoKas,
  saldoBank,
  onOpenNewTransactionModal,
  setActiveTab,
}) => {
  const [chartType, setChartType] = useState<'BAR' | 'COMPOSED'>('COMPOSED');

  // Aggregate category spending
  const categoryTotals: Record<MainCategory, number> = {
    HONOR: 0,
    KEGIATAN_RUTIN: 0,
    KEGIATAN_NON_RUTIN: 0,
    KHUSUS: 0,
  };

  let totalPengeluaran = 0;
  let totalPenerimaan = 0;

  transactions.forEach((t) => {
    if (t.jenis === 'MASUK') {
      totalPenerimaan += t.nominal;
    } else if (t.jenis === 'KELUAR') {
      totalPengeluaran += t.nominal;
      if (t.mainCategory && categoryTotals[t.mainCategory] !== undefined) {
        categoryTotals[t.mainCategory] += t.nominal;
      }
    }
  });

  const pieData = (Object.keys(categoryTotals) as MainCategory[]).map((cat) => ({
    name: CATEGORY_NAMES[cat],
    value: categoryTotals[cat],
    color: CATEGORY_COLORS[cat],
  }));

  const barData = [
    {
      name: 'Tahap I (Jan-Jun)',
      'Pagu Indikatif': compliance.paguIndikatifTahap1,
      'Realisasi Belanja': compliance.totalSpentTahap1,
    },
    {
      name: 'Tahap II (Jul-Des)',
      'Pagu Indikatif': compliance.paguIndikatifTahap2,
      'Realisasi Belanja': compliance.totalSpentTahap2,
    },
  ];

  // Calculate monthly comparison data (Pagu Indikatif vs Realisasi Belanja)
  const monthlyComparisonData = MONTH_METADATA.map((m, index) => {
    // Pagu Indikatif per month:
    // Jan-Jun (Tahap I): paguIndikatifTahap1 / 6
    // Jul-Des (Tahap II): paguIndikatifTahap2 / 6
    const paguIndikatif = index < 6
      ? Math.round(compliance.paguIndikatifTahap1 / 6)
      : Math.round(compliance.paguIndikatifTahap2 / 6);

    // Sum transactions with jenis === 'KELUAR' in this month
    const realisasiBelanja = transactions
      .filter((t) => {
        if (t.jenis !== 'KELUAR') return false;
        // Parse transaction month
        const txDate = new Date(t.tanggal);
        return txDate.getMonth() === index;
      })
      .reduce((sum, t) => sum + t.nominal, 0);

    const persentase = paguIndikatif > 0 ? (realisasiBelanja / paguIndikatif) * 100 : 0;
    const selisih = paguIndikatif - realisasiBelanja;

    return {
      month: m.name,
      fullName: m.fullName,
      semester: m.semester,
      'Pagu Indikatif': paguIndikatif,
      'Realisasi Belanja': realisasiBelanja,
      'Serapan (%)': Number(persentase.toFixed(1)),
      selisih,
    };
  });

  // Calculate monthly metrics
  const activeMonthsWithSpending = monthlyComparisonData.filter((m) => m['Realisasi Belanja'] > 0);
  const avgMonthlySpending = activeMonthsWithSpending.length > 0
    ? Math.round(totalPengeluaran / activeMonthsWithSpending.length)
    : 0;

  const highestSpendingMonth = [...monthlyComparisonData].sort(
    (a, b) => b['Realisasi Belanja'] - a['Realisasi Belanja']
  )[0];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert / Action Callout */}
      <div className="bg-[#0F5B5B] rounded-2xl p-6 text-white shadow-md border border-[#0D4D4D] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2DD4BF] text-[#0F2D2D] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-[#0F2D2D]" />
              <span>Verifikasi Otomatis Juknis BOP RA & BOS Madrasah 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sistem Pengelolaan Keuangan <span className="text-[#5EEAD4]">{profile.namaMadrasah}</span>
            </h2>
            <p className="text-[#99F6E4] text-sm max-w-2xl leading-relaxed">
              Target Anggaran BOS 2026: <strong className="text-white">{formatRupiah(compliance.totalBosAnnual)}</strong> ({profile.jumlahSiswa} siswa × {formatRupiah(profile.alokasiPerSiswa)}). Status kepatuhan aturan main Juknis terkini: <strong className="text-[#5EEAD4]">{compliance.overallScore}% ({compliance.complianceStatus})</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewTransactionModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm border border-[#5EEAD4]/40 shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ Catat Transaksi Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-[#083838] hover:bg-[#0D4D4D] text-white border border-[#0D9488] text-sm font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2DD4BF]" />
              <span>Cetak Form K-7a</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Anggaran */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D1E5E5] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#526E6E] uppercase tracking-wider">Total Anggaran BOS 2026</span>
            <div className="p-2.5 rounded-xl bg-[#CCFBF1] text-[#0F766E]">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0F2D2D]">{formatRupiah(compliance.totalBosAnnual)}</div>
            <div className="text-xs text-[#526E6E] mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>{profile.jumlahSiswa} Siswa Terdaftar</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Penerimaan */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D1E5E5] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#526E6E] uppercase tracking-wider">Penerimaan Tahap I</span>
            <div className="p-2.5 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0F2D2D]">{formatRupiah(totalPenerimaan)}</div>
            <div className="text-xs text-[#0D9488] font-bold mt-1">
              50% Alokasi Disalurkan ke BSI
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D1E5E5] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#526E6E] uppercase tracking-wider">Total Belanja Realisasi</span>
            <div className="p-2.5 rounded-xl bg-[#FEF3E2] text-[#E5912B]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0F2D2D]">{formatRupiah(totalPengeluaran)}</div>
            <div className="text-xs text-[#526E6E] mt-1">
              Sisa Kas + Bank: <strong className="text-[#0D9488]">{formatRupiah(saldoBku)}</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Syarat Pencairan Tahap II */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D1E5E5] hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#526E6E] uppercase tracking-wider">Realisasi Tahap I (Min 80%)</span>
            <div className={`p-2.5 rounded-xl ${compliance.isTahap1UnlockedTahap2 ? 'bg-[#CCFBF1] text-[#0D9488]' : 'bg-[#FEF3E2] text-[#E5912B]'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#0F2D2D]">
              {formatPercent(compliance.realisasiTahap1Percent)}
            </div>
            <div className="text-xs mt-1 font-bold flex items-center gap-1">
              {compliance.isTahap1UnlockedTahap2 ? (
                <span className="text-[#0D9488] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tahap II Siap Dicairkan
                </span>
              ) : (
                <span className="text-[#E5912B] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Butuh Min. 80%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Gauges Row */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] space-y-6">
        {/* Dynamic Budget vs Realization Progress Tracker Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2EEEE] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold uppercase border border-[#99F6E4] animate-soft-pulse">
                  Progres Realisasi Dinamis
                </span>
              </div>
              <h3 className="text-base font-bold text-[#0F2D2D] mt-1 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#0D9488]" />
                Visualisasi Progres Realisasi Anggaran vs Pagu Indikatif (BOS 2026)
              </h3>
              <p className="text-xs text-[#526E6E] mt-0.5">
                Monitoring persentase serapan belanja riil terhadap pagu per komponen Juknis secara animated & real-time
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-[#526E6E] block font-medium">Total Serapan Tahunan</span>
              <span className="text-lg font-black text-[#0D9488]">
                {formatPercent((totalPengeluaran / compliance.totalBosAnnual) * 100)}
              </span>
            </div>
          </div>

          {/* Budget vs Realization Category Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Component A: Honorarium */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F2D2D] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]"></span>
                  A. Honorarium Guru & Tendik (Pagu Max 60%)
                </span>
                <span className="font-black text-[#0D9488]">
                  {formatRupiah(categoryTotals.HONOR)} / {formatRupiah(compliance.totalBosAnnual * 0.6)}
                </span>
              </div>
              <div className="relative w-full bg-[#E2EEEE] h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] rounded-full transition-all duration-700 animate-progress-grow progress-shimmer progress-striped"
                  style={{
                    width: `${Math.min(100, Math.max(0, (categoryTotals.HONOR / (compliance.totalBosAnnual * 0.6)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#526E6E]">
                <span>Serapan Komponen: {formatPercent((categoryTotals.HONOR / (compliance.totalBosAnnual * 0.6)) * 100)}</span>
                <span className="font-semibold text-[#0F766E]">Batas Juknis: Max 60%</span>
              </div>
            </div>

            {/* Component B: Kegiatan Rutin */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F2D2D] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]"></span>
                  B. Kegiatan Rutin & Operasional (Pagu ~25%)
                </span>
                <span className="font-black text-[#0F766E]">
                  {formatRupiah(categoryTotals.KEGIATAN_RUTIN)} / {formatRupiah(compliance.totalBosAnnual * 0.25)}
                </span>
              </div>
              <div className="relative w-full bg-[#E2EEEE] h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full transition-all duration-700 animate-progress-grow progress-shimmer"
                  style={{
                    width: `${Math.min(100, Math.max(0, (categoryTotals.KEGIATAN_RUTIN / (compliance.totalBosAnnual * 0.25)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#526E6E]">
                <span>Serapan Komponen: {formatPercent((categoryTotals.KEGIATAN_RUTIN / (compliance.totalBosAnnual * 0.25)) * 100)}</span>
                <span className="font-semibold text-[#0F766E]">Operasional Harian</span>
              </div>
            </div>

            {/* Component C: Kegiatan Non-Rutin */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F2D2D] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                  C. Kegiatan Non-Rutin / Pengembangan (Pagu ~10%)
                </span>
                <span className="font-black text-[#D97706]">
                  {formatRupiah(categoryTotals.KEGIATAN_NON_RUTIN)} / {formatRupiah(compliance.totalBosAnnual * 0.1)}
                </span>
              </div>
              <div className="relative w-full bg-[#E2EEEE] h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#B45309] to-[#D97706] rounded-full transition-all duration-700 animate-progress-grow progress-shimmer"
                  style={{
                    width: `${Math.min(100, Math.max(0, (categoryTotals.KEGIATAN_NON_RUTIN / (compliance.totalBosAnnual * 0.1)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#526E6E]">
                <span>Serapan Komponen: {formatPercent((categoryTotals.KEGIATAN_NON_RUTIN / (compliance.totalBosAnnual * 0.1)) * 100)}</span>
                <span className="font-semibold text-[#D97706]">Kegiatan Tahunan</span>
              </div>
            </div>

            {/* Component D: Khusus & MBG */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F2D2D] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F5B5B]"></span>
                  D. Program Khusus & MBG (Pagu ~5%)
                </span>
                <span className="font-black text-[#0F5B5B]">
                  {formatRupiah(categoryTotals.KHUSUS)} / {formatRupiah(compliance.totalBosAnnual * 0.05)}
                </span>
              </div>
              <div className="relative w-full bg-[#E2EEEE] h-3.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#083838] to-[#0F5B5B] rounded-full transition-all duration-700 animate-progress-grow progress-shimmer"
                  style={{
                    width: `${Math.min(100, Math.max(0, (categoryTotals.KHUSUS / (compliance.totalBosAnnual * 0.05)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#526E6E]">
                <span>Serapan Komponen: {formatPercent((categoryTotals.KHUSUS / (compliance.totalBosAnnual * 0.05)) * 100)}</span>
                <span className="font-semibold text-[#0F5B5B]">Makan Bergizi Gratis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indikator Aturan Juknis */}
        <div className="border-t border-[#E2EEEE] pt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F2D2D] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                Indikator Kepatuhan Alokasi Juknis 2026
              </h3>
              <p className="text-xs text-[#526E6E]">
                Verifikasi aturan batas honorarium, operator IT, TKDN/PDN, dan pengadaan UMKM
              </p>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] underline"
            >
              Lihat Detail Audit &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Honor Rutin Limit Card */}
            <div className={`p-4 rounded-xl border ${compliance.isHonorRutinExceeded ? 'bg-[#FEE2E2]/30 border-[#EF4444]' : 'bg-[#F2F8F8] border-[#D1E5E5]'}`}>
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F2D2D]">
                <span>Honor Rutin Guru (Max 60%)</span>
                <span className={`font-bold ${compliance.isHonorRutinExceeded ? 'text-[#991B1B]' : 'text-[#0D9488]'}`}>
                  {formatPercent(compliance.honorRutinPercent)}
                </span>
              </div>
              <div className="w-full bg-[#E2EEEE] h-3 rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer ${
                    compliance.isHonorRutinExceeded ? 'bg-[#EF4444] progress-striped' : 'bg-[#0D9488]'
                  }`}
                  style={{ width: `${Math.min(100, compliance.honorRutinPercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#526E6E] mt-2">
                {compliance.isHonorRutinExceeded
                  ? '⚠️ Melebihi 60%! Wajib ada persetujuan Kemenag Kab/Kota.'
                  : '✅ Sesuai batasan Juknis 2026.'}
              </p>
            </div>

            {/* Honor Operator IT Card */}
            <div className={`p-4 rounded-xl border ${compliance.isOperatorItValid ? 'bg-[#F2F8F8] border-[#D1E5E5]' : 'bg-[#FEF3E2] border-[#E5912B]'}`}>
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F2D2D]">
                <span>Honor Operator IT (Min 50% UMK)</span>
                <span className={`font-bold ${compliance.isOperatorItValid ? 'text-[#0D9488]' : 'text-[#E5912B]'}`}>
                  {formatPercent(compliance.operatorItPercentOfUmk)}
                </span>
              </div>
              <div className="w-full bg-[#E2EEEE] h-3 rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer ${
                    compliance.isOperatorItValid ? 'bg-[#0D9488]' : 'bg-[#E5912B]'
                  }`}
                  style={{ width: `${Math.min(100, compliance.operatorItPercentOfUmk)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#526E6E] mt-2">
                Nominal Rata-rata: {formatRupiah(compliance.operatorItHonorMonthly)} / bln
              </p>
            </div>

            {/* PDN / TKDN Card */}
            <div className={`p-4 rounded-xl border ${compliance.isPdnValid ? 'bg-[#F2F8F8] border-[#D1E5E5]' : 'bg-[#FEF3E2] border-[#E5912B]'}`}>
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F2D2D]">
                <span>Produk Dalam Negeri (Min 30%)</span>
                <span className={`font-bold ${compliance.isPdnValid ? 'text-[#0D9488]' : 'text-[#E5912B]'}`}>
                  {formatPercent(compliance.pdnPercent)}
                </span>
              </div>
              <div className="w-full bg-[#E2EEEE] h-3 rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer ${
                    compliance.isPdnValid ? 'bg-[#2DD4BF]' : 'bg-[#E5912B]'
                  }`}
                  style={{ width: `${Math.min(100, compliance.pdnPercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#526E6E] mt-2">
                Belanja PDN: {formatRupiah(compliance.totalPdnSpent)}
              </p>
            </div>

            {/* UMKM & Koperasi Card */}
            <div className={`p-4 rounded-xl border ${compliance.isUmkmValid ? 'bg-[#F2F8F8] border-[#D1E5E5]' : 'bg-[#FEF3E2] border-[#E5912B]'}`}>
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F2D2D]">
                <span>Usaha Mikro / Koperasi (Min 40%)</span>
                <span className={`font-bold ${compliance.isUmkmValid ? 'text-[#0D9488]' : 'text-[#E5912B]'}`}>
                  {formatPercent(compliance.umkmPercent)}
                </span>
              </div>
              <div className="w-full bg-[#E2EEEE] h-3 rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer ${
                    compliance.isUmkmValid ? 'bg-[#0D9488]' : 'bg-[#E5912B]'
                  }`}
                  style={{ width: `${Math.min(100, compliance.umkmPercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#526E6E] mt-2">
                Belanja UMKM: {formatRupiah(compliance.totalUmkmSpent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Chart: Monthly Comparison (Pagu Indikatif vs Realisasi Belanja Bulanan) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2EEEE] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] text-[10px] font-extrabold uppercase border border-[#99F6E4]">
                Visualisasi Bulanan Recharts
              </span>
            </div>
            <h3 className="text-lg font-black text-[#0F2D2D] mt-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0D9488]" />
              Perbandingan Pagu Indikatif vs Realisasi Belanja Bulanan (Januari – Desember 2026)
            </h3>
            <p className="text-xs text-[#526E6E] mt-0.5">
              Pantau daya serap anggaran rutin dan terencana setiap bulan secara real-time
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={() => setChartType('COMPOSED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartType === 'COMPOSED'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'bg-[#F2F8F8] text-[#526E6E] hover:bg-[#E2EEEE]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Garis & Batang</span>
            </button>
            <button
              onClick={() => setChartType('BAR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartType === 'BAR'
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'bg-[#F2F8F8] text-[#526E6E] hover:bg-[#E2EEEE]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Batang Sejajar</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Summary Cards for Monthly Tracking */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <span className="text-[#526E6E] text-[11px] font-medium block">Total Realisasi Belanja</span>
            <strong className="text-sm font-black text-[#0F2D2D] mt-0.5 block">{formatRupiah(totalPengeluaran)}</strong>
            <span className="text-[10px] text-[#0D9488]">Terbuku di BKU</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <span className="text-[#526E6E] text-[11px] font-medium block">Rata-rata Belanja / Bulan</span>
            <strong className="text-sm font-black text-[#0F2D2D] mt-0.5 block">{formatRupiah(avgMonthlySpending)}</strong>
            <span className="text-[10px] text-[#526E6E]">{activeMonthsWithSpending.length} Bulan Aktif Transaksi</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <span className="text-[#526E6E] text-[11px] font-medium block">Bulan Puncak Penyerapan</span>
            <strong className="text-sm font-black text-[#0D9488] mt-0.5 block">
              {highestSpendingMonth ? `${highestSpendingMonth.fullName}` : '-'}
            </strong>
            <span className="text-[10px] text-[#0D9488]">
              {highestSpendingMonth ? formatRupiah(highestSpendingMonth['Realisasi Belanja']) : 'Rp 0'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <span className="text-[#526E6E] text-[11px] font-medium block">Capaian Pagu Tahunan</span>
            <strong className="text-sm font-black text-[#0F2D2D] mt-0.5 block">
              {formatPercent((totalPengeluaran / compliance.totalBosAnnual) * 100)}
            </strong>
            <span className="text-[10px] text-[#526E6E]">Dari Rp {formatRupiah(compliance.totalBosAnnual)}</span>
          </div>
        </div>

        {/* Recharts Monthly Comparison Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'COMPOSED' ? (
              <ComposedChart data={monthlyComparisonData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EEEE" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#0F2D2D', fontWeight: 600 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}Jt`}
                  tick={{ fontSize: 11, fill: '#526E6E' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 120]}
                  tick={{ fontSize: 11, fill: '#D97706' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#083838] text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-[#0F766E] max-w-xs">
                          <p className="font-bold text-[#2DD4BF] text-sm border-b border-[#0F766E] pb-1">
                            Bulan {data.fullName} ({data.semester})
                          </p>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#CCFBF1]">Pagu Indikatif:</span>
                            <span className="font-bold">{formatRupiah(data['Pagu Indikatif'])}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#2DD4BF]">Realisasi Belanja:</span>
                            <span className="font-bold text-[#2DD4BF]">{formatRupiah(data['Realisasi Belanja'])}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[#FDE047]">Serapan Pagu:</span>
                            <span className="font-bold text-[#FDE047]">{data['Serapan (%)']}%</span>
                          </div>
                          <div className="flex justify-between gap-4 pt-1 border-t border-[#0F766E]/60 text-[11px]">
                            <span className="text-[#CCFBF1]">Sisa Pagu Bulan Ini:</span>
                            <span className={data.selisih < 0 ? 'text-[#FCA5A5] font-bold' : 'text-white'}>
                              {formatRupiah(data.selisih)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="Pagu Indikatif"
                  fill="#99F6E4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  yAxisId="left"
                  dataKey="Realisasi Belanja"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Serapan (%)"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#D97706' }}
                />
              </ComposedChart>
            ) : (
              <BarChart data={monthlyComparisonData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EEEE" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#0F2D2D', fontWeight: 600 }} />
                <YAxis
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}Jt`}
                  tick={{ fontSize: 11, fill: '#526E6E' }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatRupiah(value), name]}
                  labelFormatter={(label) => {
                    const found = monthlyComparisonData.find((m) => m.month === label);
                    return found ? `Bulan ${found.fullName} (${found.semester})` : label;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                <Bar dataKey="Pagu Indikatif" fill="#99F6E4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi Belanja" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Component Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2D2D] flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#0D9488]" />
              Komposisi Pengeluaran Per Komponen Utama
            </h3>
            <p className="text-xs text-[#526E6E]">
              Distribusi 4 komponen penggunaan dana Juknis BOP/BOS 2026
            </p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#E2EEEE] pt-3">
            <div className="text-[#526E6E]">A. Honor: <strong className="text-[#0F2D2D]">{formatRupiah(categoryTotals.HONOR)}</strong></div>
            <div className="text-[#526E6E]">B. Rutin: <strong className="text-[#0F2D2D]">{formatRupiah(categoryTotals.KEGIATAN_RUTIN)}</strong></div>
            <div className="text-[#526E6E]">C. Non-Rutin: <strong className="text-[#0F2D2D]">{formatRupiah(categoryTotals.KEGIATAN_NON_RUTIN)}</strong></div>
            <div className="text-[#526E6E]">D. Khusus: <strong className="text-[#0F2D2D]">{formatRupiah(categoryTotals.KHUSUS)}</strong></div>
          </div>
        </div>

        {/* Chart 2: Realisasi Per Tahap Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2D2D] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0D9488]" />
              Perbandingan Anggaran vs Realisasi Tahap I & II
            </h3>
            <p className="text-xs text-[#526E6E]">
              Monitoring capaian daya serap anggaran semesteran
            </p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1E5E5" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#526E6E' }} />
                <YAxis tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`} tick={{ fontSize: 11, fill: '#526E6E' }} />
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Legend />
                <Bar dataKey="Pagu Indikatif" fill="#99F6E4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi Belanja" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-[#E2EEEE] pt-3 text-xs text-[#526E6E] flex items-center justify-between">
            <span>Syarat Pencairan Tahap II: Minimal 80% Realisasi Tahap I</span>
            <span className="font-bold text-[#0D9488]">Tercapai: {formatPercent(compliance.realisasiTahap1Percent)}</span>
          </div>
        </div>
      </div>

      {/* Recent BKU Transactions Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D1E5E5] overflow-hidden">
        <div className="p-5 border-b border-[#E2EEEE] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2D2D]">Transaksi Terakhir dalam Buku Kas Umum (BKU)</h3>
            <p className="text-xs text-[#526E6E]">5 transaksi keuangan teratas dari pembukuan</p>
          </div>
          <button
            onClick={() => setActiveTab('bku')}
            className="text-xs font-bold text-[#0F766E] hover:text-[#0D4D4D] bg-[#CCFBF1] hover:bg-[#99F6E4]/70 px-3.5 py-1.5 rounded-lg border border-[#99F6E4] transition"
          >
            Buka BKU Lengkap &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0F2D2D]">
            <thead className="bg-[#F2F8F8] text-[#526E6E] font-bold uppercase tracking-wider border-b border-[#D1E5E5]">
              <tr>
                <th className="px-4 py-3">Tanggal / No Bukti</th>
                <th className="px-4 py-3">Uraian Transaksi</th>
                <th className="px-4 py-3">Sub-Komponen</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-center">Status Juknis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EEEE]">
              {recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#E6FFFA]/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-[#0F2D2D]">{t.nomorBukti}</div>
                    <div className="text-[11px] text-[#526E6E]">{t.tanggal}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-[#0F2D2D] line-clamp-1">{t.uraian}</p>
                    {t.vendorNama && <span className="text-[10px] text-[#526E6E]">Vendor: {t.vendorNama}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]">
                      {t.subCategory || 'Penerimaan / Non-Belanja'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className={`font-bold ${t.jenis === 'MASUK' ? 'text-[#0D9488]' : 'text-[#0F2D2D]'}`}>
                      {t.jenis === 'MASUK' ? '+ ' : '- '}{formatRupiah(t.nominal)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      {t.isPdn && <span className="px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] text-[9px] font-extrabold border border-[#99F6E4]">PDN</span>}
                      {t.isUmkKoperasi && <span className="px-1.5 py-0.5 rounded bg-[#E6FFFA] text-[#0D9488] text-[9px] font-extrabold border border-[#99F6E4]">UMKM</span>}
                      {t.ppn > 0 && <span className="px-1.5 py-0.5 rounded bg-[#FEF3E2] text-[#E5912B] text-[9px] font-extrabold border border-[#E5912B]/40">PPN 12%</span>}
                      {t.isProhibitedWarning && <span className="px-1.5 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] text-[9px] font-extrabold border border-[#EF4444]/40">Warning</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
