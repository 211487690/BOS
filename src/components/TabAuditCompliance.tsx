import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
  HelpCircle,
  Building,
  Award,
  Layers,
} from 'lucide-react';
import { JuknisRulesCompliance, MadrasahProfile, Transaction } from '../types/bos';
import { PROHIBITED_RULES_2026 } from '../services/complianceEngine';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface TabAuditComplianceProps {
  compliance: JuknisRulesCompliance;
  profile: MadrasahProfile;
  transactions: Transaction[];
  onToggleKemenagApproval: () => void;
}

export const TabAuditCompliance: React.FC<TabAuditComplianceProps> = ({
  compliance,
  profile,
  transactions,
  onToggleKemenagApproval,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIMITS' | 'PROHIBITED' | 'LETTER'>('LIMITS');

  const prohibitedViolations = transactions.filter((t) => t.isProhibitedWarning);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Audit Banner */}
      <div className="bg-[#083838] rounded-2xl p-6 shadow-xl border border-[#0F766E] text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0F766E] text-[#99F6E4] border border-[#2DD4BF]/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
              <span>Audit Kepatuhan Juknis BOP RA & BOS Madrasah 2026</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Pemeriksaan Kepatuhan Keuangan & Resiko Audit
            </h2>
            <p className="text-[#CCFBF1] text-xs max-w-2xl leading-relaxed">
              Verifikasi otomatis terhadap 10 rasio persentase wajib dan 13 poin larangan penggunaan dana BOS/BOP Kemenag 2026.
            </p>
          </div>

          {/* Compliance Score Widget */}
          <div className="flex items-center space-x-4 bg-[#0F766E]/90 border border-[#2DD4BF]/40 rounded-2xl p-4 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#083838" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={compliance.overallScore >= 80 ? '#2DD4BF' : compliance.overallScore >= 60 ? '#f59e0b' : '#f43f5e'}
                  strokeWidth="6"
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * compliance.overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-base font-black text-white">{compliance.overallScore}%</span>
            </div>
            <div>
              <div className="text-xs text-[#CCFBF1] uppercase font-semibold">Skor Audit Kepatuhan</div>
              <div className="text-sm font-bold text-[#2DD4BF]">{compliance.complianceStatus}</div>
              <div className="text-[10px] text-[#CCFBF1]/80 mt-0.5">
                {prohibitedViolations.length > 0 ? `${prohibitedViolations.length} potensi pelanggaran` : 'Bebas temuan larangan'}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex space-x-2 mt-6 pt-6 border-t border-[#0F766E] text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('LIMITS')}
            className={`px-4 py-2 rounded-xl transition ${
              activeSubTab === 'LIMITS'
                ? 'bg-[#2DD4BF] text-[#0F2D2D] font-black'
                : 'bg-[#0F766E] text-[#CCFBF1] hover:bg-[#0D9488]'
            }`}
          >
            📊 Rasio & Plafon Aturan (60%, 50%, 30%, 40%)
          </button>
          <button
            onClick={() => setActiveSubTab('PROHIBITED')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeSubTab === 'PROHIBITED'
                ? 'bg-[#2DD4BF] text-[#0F2D2D] font-black'
                : 'bg-[#0F766E] text-[#CCFBF1] hover:bg-[#0D9488]'
            }`}
          >
            🚫 13 Poin Larangan
            {prohibitedViolations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px]">
                {prohibitedViolations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('LETTER')}
            className={`px-4 py-2 rounded-xl transition ${
              activeSubTab === 'LETTER'
                ? 'bg-[#2DD4BF] text-[#0F2D2D] font-black'
                : 'bg-[#0F766E] text-[#CCFBF1] hover:bg-[#0D9488]'
            }`}
          >
            ✉️ Template Permohonan Kemenag
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PERCENTAGE RULES */}
      {activeSubTab === 'LIMITS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rule 1: Plafon Honor Rutin 60% */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase border border-[#99F6E4]/50">
                  Aturan 1 [Juknis Hal 12]
                </span>
                <h3 className="text-base font-bold text-[#0F2D2D] mt-1">Batas Maksimal Honor Rutin Non-ASN (60%)</h3>
                <p className="text-xs text-[#526E6E] mt-0.5">
                  Maksimal 60% dari total anggaran tahunan. Jika melebihi, wajib ada perizinan Kemenag Kab/Kota.
                </p>
              </div>
              {compliance.isHonorRutinExceeded ? (
                <XCircle className="w-6 h-6 text-[#991B1B] shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#0D9488] shrink-0" />
              )}
            </div>

            <div className="mt-4 p-4 bg-[#F2F8F8] rounded-xl space-y-2 text-xs border border-[#D1E5E5]">
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Total Belanja Honor Rutin:</span>
                <strong className="text-[#0F2D2D]">{formatRupiah(compliance.totalHonorRutin)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Persentase Terhadap Total Dana BOS:</span>
                <strong className={compliance.isHonorRutinExceeded ? 'text-[#991B1B] font-black' : 'text-[#0F766E] font-black'}>
                  {formatPercent(compliance.honorRutinPercent)} / Max 60.0%
                </strong>
              </div>
              {compliance.isHonorRutinExceeded && (
                <div className="pt-2 border-t border-[#D1E5E5] flex items-center justify-between">
                  <span className="text-[11px] text-[#991B1B]">Izin Kemenag Kab/Kota:</span>
                  <button
                    onClick={onToggleKemenagApproval}
                    className={`px-3 py-1 rounded text-[11px] font-bold ${
                      compliance.hasKemenagApproval ? 'bg-[#CCFBF1] text-[#0F766E]' : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2]/80'
                    }`}
                  >
                    {compliance.hasKemenagApproval ? '✅ Sudah Ada Surat Izin' : '⚠️ Klik Tandai Surat Izin Terbit'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rule 2: Standar Honor Operator IT (Min 50% UMK) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase border border-[#99F6E4]/50">
                  Aturan 2 [Juknis Hal 5]
                </span>
                <h3 className="text-base font-bold text-[#0F2D2D] mt-1">Standar Minimal Operator IT (50% UMK)</h3>
                <p className="text-xs text-[#526E6E] mt-0.5">
                  Honorarium operator data/EMIS sekurang-kurangnya 50% dari UMK daerah setempat.
                </p>
              </div>
              {compliance.isOperatorItValid ? (
                <CheckCircle2 className="w-6 h-6 text-[#0D9488] shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#E5912B] shrink-0" />
              )}
            </div>

            <div className="mt-4 p-4 bg-[#F2F8F8] rounded-xl space-y-2 text-xs border border-[#D1E5E5]">
              <div className="flex justify-between">
                <span className="text-[#526E6E]">UMK Daerah ({profile.kabKota}):</span>
                <strong className="text-[#0F2D2D]">{formatRupiah(profile.umkDaerah)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Rata-rata Honor Operator IT per Bulan:</span>
                <strong className="text-[#0F2D2D]">{formatRupiah(compliance.operatorItHonorMonthly)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Rasio Terhadap UMK:</span>
                <strong className={compliance.isOperatorItValid ? 'text-[#0F766E] font-black' : 'text-[#E5912B] font-black'}>
                  {formatPercent(compliance.operatorItPercentOfUmk)} (Syarat Min 50.0%)
                </strong>
              </div>
            </div>
          </div>

          {/* Rule 3: Produk Dalam Negeri (Min 30% PDN) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase border border-[#99F6E4]/50">
                  Aturan 3 [Juknis Hal 13]
                </span>
                <h3 className="text-base font-bold text-[#0F2D2D] mt-1">Belanja Produk Dalam Negeri (Min 30%)</h3>
                <p className="text-xs text-[#526E6E] mt-0.5">
                  Minimal 30% dari total belanja barang/jasa berasal dari Produk Dalam Negeri (PDN / TKDN).
                </p>
              </div>
              {compliance.isPdnValid ? (
                <CheckCircle2 className="w-6 h-6 text-[#0D9488] shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#E5912B] shrink-0" />
              )}
            </div>

            <div className="mt-4 p-4 bg-[#F2F8F8] rounded-xl space-y-2 text-xs border border-[#D1E5E5]">
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Total Belanja Goods & Services:</span>
                <strong className="text-[#0F2D2D]">{formatRupiah(compliance.totalGoodsServicesSpent)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Realised PDN Spending:</span>
                <strong className="text-[#0F766E]">{formatRupiah(compliance.totalPdnSpent)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Capaian Persentase PDN:</span>
                <strong className={compliance.isPdnValid ? 'text-[#0F766E] font-black' : 'text-[#E5912B] font-black'}>
                  {formatPercent(compliance.pdnPercent)} (Target Min 30.0%)
                </strong>
              </div>
            </div>
          </div>

          {/* Rule 4: UMKM & Koperasi (Min 40%) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase border border-[#99F6E4]/50">
                  Aturan 4 [Juknis Hal 13]
                </span>
                <h3 className="text-base font-bold text-[#0F2D2D] mt-1">Pengadaan UMKM / Koperasi (Min 40%)</h3>
                <p className="text-xs text-[#526E6E] mt-0.5">
                  Minimal 40% dari total belanja diprioritaskan untuk Usaha Mikro, Kecil, dan Koperasi lokal.
                </p>
              </div>
              {compliance.isUmkmValid ? (
                <CheckCircle2 className="w-6 h-6 text-[#0D9488] shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#E5912B] shrink-0" />
              )}
            </div>

            <div className="mt-4 p-4 bg-[#F2F8F8] rounded-xl space-y-2 text-xs border border-[#D1E5E5]">
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Realised UMKM Spending:</span>
                <strong className="text-[#0D9488]">{formatRupiah(compliance.totalUmkmSpent)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526E6E]">Capaian Persentase UMKM:</span>
                <strong className={compliance.isUmkmValid ? 'text-[#0F766E] font-black' : 'text-[#E5912B] font-black'}>
                  {formatPercent(compliance.umkmPercent)} (Target Min 40.0%)
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 13 PROHIBITED ITEMS REFERENCE */}
      {activeSubTab === 'PROHIBITED' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2D2D]">13 Poin Larangan Penggunaan Dana BOS & BOP 2026</h3>
            <p className="text-xs text-[#526E6E]">
              Berikut adalah daftar transaksi yang dilarang keras dibiayai menggunakan dana bantuan Kemenag [Juknis Hal 17]:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROHIBITED_RULES_2026.map((rule) => {
              const isViolated = transactions.some((t) => t.isProhibitedWarning && t.prohibitedReason?.includes(rule.title));
              return (
                <div
                  key={rule.id}
                  className={`p-3.5 rounded-xl border text-xs ${
                    isViolated ? 'bg-[#FEE2E2] border-[#EF4444]' : 'bg-[#F2F8F8] border-[#D1E5E5]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={isViolated ? 'text-[#991B1B]' : 'text-[#0F2D2D]'}>
                      {rule.id}. {rule.title}
                    </span>
                    {isViolated && (
                      <span className="px-2 py-0.5 rounded bg-[#991B1B] text-white text-[10px]">Terdeteksi!</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#526E6E] mt-1 leading-relaxed">{rule.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LETTER TEMPLATE */}
      {activeSubTab === 'LETTER' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#D1E5E5] max-w-3xl mx-auto space-y-4 text-xs leading-relaxed text-[#0F2D2D]">
          <div className="flex items-center justify-between pb-3 border-b border-[#D1E5E5] gap-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo Madrasah" className="max-h-14 max-w-14 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-black text-lg">
                  {profile.jenjang}
                </div>
              )}
            </div>
            <div className="text-center flex-1 font-bold">
              <p className="text-[#0F766E] uppercase font-black text-sm">SURAT PERMOHONAN DISPENSASI PERSETUJUAN PLAFON HONORARIUM RUTIN</p>
              <p className="text-[11px] text-[#526E6E]">Nomor: {profile.nsm}/PERMOHONAN-HONOR/2026</p>
            </div>
            <div className="w-14 shrink-0 text-right text-[10px] text-gray-400">
              BOS 2026
            </div>
          </div>

          <p>Kepada Yth.<br /><strong>Kepala Kantor Kementerian Agama {profile.kabKota}</strong><br />Up. Kasi Pendidikan Madrasah (Penmad)</p>

          <p>
            Dengan hormat,<br />
            Sehubungan dengan pelaksanaan pengelolaan Dana BOS/BOP Tahun 2026 pada <strong>{profile.namaMadrasah}</strong>, dengan ini kami mengajukan permohonan dispensasi persetujuan pengalokasian Honorarium Rutin Pendidik & Tenaga Kependidikan Non-ASN sebesar <strong>{formatPercent(compliance.honorRutinPercent)}</strong> ({formatRupiah(compliance.totalHonorRutin)}).
          </p>

          <p>
            Adapun pertimbangan pengalokasian melebihi plafon 60% disebabkan oleh keterbatasan jumlah guru ASN dan tingginya jam mengajar guru non-ASN demi kelancaran proses belajar mengajar.
          </p>

          <div className="pt-8 grid grid-cols-2 text-center">
            <div></div>
            <div>
              <p>{profile.kabKota}, 15 April 2026</p>
              <p className="font-bold">Kepala Madrasah</p>
              <div className="h-16" />
              <p className="font-bold underline">{profile.kepalaMadrasah}</p>
              <p className="text-[10px] text-[#526E6E]">NIP. {profile.nipKepala}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
