import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Award,
  Wallet,
  Landmark,
  ShieldCheck,
  Edit3,
  Check,
} from 'lucide-react';
import { MadrasahProfile, JuknisRulesCompliance } from '../types/bos';
import { formatRupiah } from '../utils/formatters';

interface HeaderNavProps {
  profile: MadrasahProfile;
  compliance: JuknisRulesCompliance;
  saldoBku: number;
  saldoKas: number;
  saldoBank: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateProfile?: (profile: MadrasahProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  profile,
  compliance,
  saldoBku,
  saldoKas,
  saldoBank,
  activeTab,
  setActiveTab,
  onUpdateProfile,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editNama, setEditNama] = useState(profile.namaMadrasah);
  const [editNsm, setEditNsm] = useState(profile.nsm);
  const [editNpsn, setEditNpsn] = useState(profile.npsn);

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        namaMadrasah: editNama,
        nsm: editNsm,
        npsn: editNpsn,
      });
    }
    setShowQuickEdit(false);
  };

  const getScoreBadge = () => {
    switch (compliance.complianceStatus) {
      case 'SANGAT_BAIK':
        return { bg: 'bg-[#99F6E4] text-[#042F2E] border-[#2DD4BF]', text: 'Sangat Baik (90%+)', icon: ShieldCheck };
      case 'PATUH':
        return { bg: 'bg-[#CCFBF1] text-[#0F766E] border-[#5EEAD4]', text: 'Patuh Juknis', icon: ShieldCheck };
      case 'PERLU_PERBAIKAN':
        return { bg: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]', text: 'Perlu Perbaikan', icon: AlertTriangle };
      default:
        return { bg: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]', text: 'Ada Pelanggaran', icon: AlertTriangle };
    }
  };

  const badge = getScoreBadge();
  const BadgeIcon = badge.icon;

  return (
    <header className="bg-[#0F5B5B] text-white shadow-md border-b border-[#0D4D4D] sticky top-0 z-40">
      {/* Top Bar: Brand, School Info, and Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & School Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-[#2DD4BF] text-[#0F5B5B] p-0.5 shadow-md flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo Madrasah" className="w-full h-full object-contain bg-white rounded-[10px]" />
              ) : (
                <div className="w-full h-full bg-[#0F5B5B] text-[#2DD4BF] rounded-[10px] flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-[#2DD4BF]" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  Aplikasi Pengelolaan BOS
                </h1>
              </div>
              <div className="text-xs text-[#99F6E4] flex flex-wrap items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
                <button
                  onClick={() => {
                    setEditNama(profile.namaMadrasah);
                    setEditNsm(profile.nsm);
                    setEditNpsn(profile.npsn);
                    setShowQuickEdit(true);
                  }}
                  className="font-semibold text-white hover:text-[#5EEAD4] hover:underline flex items-center gap-1 text-left transition"
                  title="Klik untuk ubah Nama Madrasah & NSM secara penuh"
                >
                  <span>{profile.namaMadrasah}</span>
                  <Edit3 className="w-3 h-3 text-[#2DD4BF] inline-block" />
                </button>
                <span className="text-[#2DD4BF]/60">|</span>
                <button
                  onClick={() => {
                    setEditNama(profile.namaMadrasah);
                    setEditNsm(profile.nsm);
                    setEditNpsn(profile.npsn);
                    setShowQuickEdit(true);
                  }}
                  className="hover:text-[#5EEAD4] hover:underline transition"
                  title="Klik untuk ubah NSM"
                >
                  NSM: <span className="font-semibold text-white">{profile.nsm}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Balance Cards & Compliance Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Compliance Badge */}
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition hover:scale-[1.02] shadow-sm ${badge.bg}`}
              title="Klik untuk audit kepatuhan lengkap"
            >
              <BadgeIcon className="w-4 h-4" />
              <span>Skor: {compliance.overallScore}% - {badge.text}</span>
            </button>

            {/* Saldo BKU Summary */}
            <div className="hidden lg:flex items-center space-x-3 bg-[#083838] border border-[#134E4A] rounded-xl px-3.5 py-1.5">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-[#2DD4BF]" />
                <div>
                  <div className="text-[10px] text-[#99F6E4] uppercase tracking-wider font-semibold">Saldo BKU</div>
                  <div className="text-xs font-extrabold text-white">{formatRupiah(saldoBku)}</div>
                </div>
              </div>
              <div className="h-6 w-px bg-[#134E4A]" />
              <div className="flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-[#2DD4BF]" />
                <div>
                  <div className="text-[10px] text-[#99F6E4] uppercase tracking-wider font-semibold">Bank / BSI</div>
                  <div className="text-xs font-extrabold text-white">{formatRupiah(saldoBank)}</div>
                </div>
              </div>
            </div>

            {/* Data Operations */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onExportBackup}
                className="p-2 text-[#99F6E4] hover:text-white bg-[#083838] hover:bg-[#0D9488] rounded-lg border border-[#134E4A] transition"
                title="Ekspor Backup JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportBackup}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[#99F6E4] hover:text-white bg-[#083838] hover:bg-[#0D9488] rounded-lg border border-[#134E4A] transition"
                title="Impor Database JSON"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                className="p-2 text-[#99F6E4] hover:text-[#FEE2E2] bg-[#083838] hover:bg-[#0D9488] rounded-lg border border-[#134E4A] transition"
                title="Reset ke Data Sample 2026"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Edit Modal for Nama Madrasah & NSM */}
      {showQuickEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D2D]/70 backdrop-blur-sm p-4 text-[#0F2D2D]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D1E5E5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EEEE]">
              <h3 className="text-base font-bold text-[#0F2D2D] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0D9488]" />
                Ubah Identitas Madrasah (Full Customize)
              </h3>
              <button
                onClick={() => setShowQuickEdit(false)}
                className="text-[#526E6E] hover:text-[#0F2D2D] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Nama Madrasah (Full Custom)</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] font-semibold text-[#0F2D2D]"
                  placeholder="Masukkan Nama Madrasah Anda"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">NSM (Nomor Statistik)</label>
                  <input
                    type="text"
                    value={editNsm}
                    onChange={(e) => setEditNsm(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                    placeholder="1212..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">NPSN</label>
                  <input
                    type="text"
                    value={editNpsn}
                    onChange={(e) => setEditNpsn(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                    placeholder="2027..."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2EEEE] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuickEdit(false)}
                  className="px-4 py-2 rounded-lg border border-[#D1E5E5] text-[#526E6E] font-semibold hover:bg-[#F2F8F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
