import React from 'react';
import { Eye, ShieldCheck, Building, Users, Wallet, Award, CheckCircle, PieChart, HeartHandshake } from 'lucide-react';
import { MadrasahProfile, JuknisRulesCompliance, Transaction } from '../types/bos';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface TabPublicTransparencyProps {
  profile: MadrasahProfile;
  compliance: JuknisRulesCompliance;
  transactions: Transaction[];
  saldoBku: number;
}

export const TabPublicTransparency: React.FC<TabPublicTransparencyProps> = ({
  profile,
  compliance,
  transactions,
  saldoBku,
}) => {
  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'KELUAR')
    .reduce((acc, t) => acc + t.nominal, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Public Banner Header */}
      <div className="bg-[#083838] rounded-2xl p-8 text-white shadow-xl text-center space-y-3 relative overflow-hidden border border-[#0F766E]">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F766E] text-[#99F6E4] border border-[#2DD4BF]/30 text-xs font-semibold">
          <Eye className="w-4 h-4 text-[#2DD4BF]" />
          <span>PORTAL TRANSPARANSI PUBLIK DANA BOS/BOP 2026</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          PAPAN INFORMASI DIGITAL KEUANGAN BOS
        </h1>
        <h2 className="text-lg font-bold text-[#2DD4BF]">{profile.namaMadrasah}</h2>
        <p className="text-xs text-[#CCFBF1] max-w-2xl mx-auto leading-relaxed">
          Wujud akuntabilitas publik dan transparansi penggunaan Dana Bantuan Operasional Sekolah (BOS) & BOP RA sesuai Petunjuk Teknis Kemenag RI Tahun 2026.
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] text-center">
          <div className="text-xs font-bold text-[#526E6E] uppercase">Target Pagu BOS 2026</div>
          <div className="text-2xl font-black text-[#0F2D2D] mt-2">{formatRupiah(compliance.totalBosAnnual)}</div>
          <div className="text-xs text-[#526E6E] mt-1">{profile.jumlahSiswa} Siswa Terdaftar</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] text-center">
          <div className="text-xs font-bold text-[#526E6E] uppercase">Total Dana Direalisasikan</div>
          <div className="text-2xl font-black text-[#0F766E] mt-2">{formatRupiah(totalPengeluaran)}</div>
          <div className="text-xs text-[#526E6E] mt-1">
            Daya Serap Tahap I: {formatPercent(compliance.realisasiTahap1Percent)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] text-center">
          <div className="text-xs font-bold text-[#526E6E] uppercase">Saldo Kas Sisa</div>
          <div className="text-2xl font-black text-[#0F2D2D] mt-2">{formatRupiah(saldoBku)}</div>
          <div className="text-xs text-[#526E6E] mt-1">Tersimpan di Rekening BSI Madrasah</div>
        </div>
      </div>

      {/* Juknis Compliance Badge */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center shrink-0 border border-[#99F6E4]/50">
            <Award className="w-8 h-8 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F2D2D]">Predikat Akuntabilitas & Kepatuhan Juknis</h3>
            <p className="text-xs text-[#526E6E]">
              Pengelolaan dana dinilai oleh Engine Verifikasi Kepatuhan BOS-BERKIBAR Kemenag 2026
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-[#0F766E]">{compliance.overallScore}%</span>
          <div className="text-xs font-bold text-[#0F2D2D] uppercase">{compliance.complianceStatus}</div>
        </div>
      </div>

      {/* Public Program Support Section (e.g. MBG Program) */}
      <div className="bg-[#F2F8F8] rounded-2xl p-6 border border-[#99F6E4] text-[#0F2D2D] space-y-2">
        <div className="flex items-center space-x-2 text-[#0F766E] font-bold text-sm">
          <HeartHandshake className="w-5 h-5 text-[#0F766E]" />
          <span>Dukungan Program Makan Bergizi Gratis (MBG) & Kesehatan Siswa</span>
        </div>
        <p className="text-xs text-[#526E6E] leading-relaxed">
          Madrasah ini mengalokasikan dukungan sanitasi, sarana tempat cuci tangan, dan pendampingan kesehatan siswa secara rutin guna mensukseskan program MBG Nasional.
        </p>
      </div>
    </div>
  );
};
