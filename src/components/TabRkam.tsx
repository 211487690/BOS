import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { RkamItem, MainCategory, SubCategory, SubCategoryItem, MadrasahProfile, Transaction } from '../types/bos';
import { formatRupiah, formatPercent, downloadCsvFile } from '../utils/formatters';

interface TabRkamProps {
  rkamItems: RkamItem[];
  profile: MadrasahProfile;
  transactions?: Transaction[];
  subCategories?: SubCategoryItem[];
  onAddRkamItem: (item: Omit<RkamItem, 'id'>) => void;
  onEditRkamItem?: (id: string, item: Omit<RkamItem, 'id'>) => void;
  onDeleteRkamItem: (id: string) => void;
  onOpenSubCategoryManager?: () => void;
}

export const TabRkam: React.FC<TabRkamProps> = ({
  rkamItems,
  profile,
  transactions = [],
  subCategories = [],
  onAddRkamItem,
  onEditRkamItem,
  onDeleteRkamItem,
  onOpenSubCategoryManager,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [kodeRkam, setKodeRkam] = useState('02.04.01');
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [edmKode, setEdmKode] = useState('B.1');
  const [mainCategory, setMainCategory] = useState<MainCategory>('KEGIATAN_RUTIN');
  const [subCategory, setSubCategory] = useState<SubCategory>('Operasional Offisial & ATK');
  const [anggaranTahap1, setAnggaranTahap1] = useState(5000000);
  const [anggaranTahap2, setAnggaranTahap2] = useState(5000000);

  const totalBosAnnual = profile.jumlahSiswa * profile.alokasiPerSiswa;
  const paguIndikatifTahap1 = profile.paguIndikatifTahap1 ?? (totalBosAnnual * 0.5);
  const paguIndikatifTahap2 = profile.paguIndikatifTahap2 ?? (totalBosAnnual * 0.5);
  const paguIndikatifAnnual = paguIndikatifTahap1 + paguIndikatifTahap2;

  // Realisasi Belanja Tahap 1 & Tahap 2
  let realisasiTahap1 = 0;
  let realisasiTahap2 = 0;

  transactions.forEach((t) => {
    if (t.jenis === 'KELUAR') {
      if (new Date(t.tanggal) < new Date('2026-07-01')) {
        realisasiTahap1 += t.nominal;
      } else {
        realisasiTahap2 += t.nominal;
      }
    }
  });

  const totalRealisasi = realisasiTahap1 + realisasiTahap2;
  const percentRealisasiTahap1 = paguIndikatifTahap1 > 0 ? (realisasiTahap1 / paguIndikatifTahap1) * 100 : 0;
  const percentRealisasiTahap2 = paguIndikatifTahap2 > 0 ? (realisasiTahap2 / paguIndikatifTahap2) * 100 : 0;

  const totalRkamTahap1 = rkamItems.reduce((acc, item) => acc + item.anggaranTahap1, 0);
  const totalRkamTahap2 = rkamItems.reduce((acc, item) => acc + item.anggaranTahap2, 0);
  const totalRkamAnnual = totalRkamTahap1 + totalRkamTahap2;

  // Calculate Honor Rutin % in RKAM
  const honorRutinRkamTotal = rkamItems
    .filter((i) => i.subCategory === 'Honor Rutin (Pendidik/Tenaga Kependidikan Non-ASN)')
    .reduce((acc, item) => acc + item.anggaranTahap1 + item.anggaranTahap2, 0);

  const honorRutinPercent = totalBosAnnual > 0 ? (honorRutinRkamTotal / totalBosAnnual) * 100 : 0;
  const isHonorRutinExceeded = honorRutinPercent > 60;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setKodeRkam('02.04.01');
    setNamaKegiatan('');
    setEdmKode('B.1');
    setMainCategory('KEGIATAN_RUTIN');
    setSubCategory('Operasional Offisial & ATK');
    setAnggaranTahap1(5000000);
    setAnggaranTahap2(5000000);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: RkamItem) => {
    setEditingId(item.id);
    setKodeRkam(item.kodeRkam);
    setNamaKegiatan(item.namaKegiatan);
    setEdmKode(item.edmKode);
    setMainCategory(item.mainCategory);
    setSubCategory(item.subCategory);
    setAnggaranTahap1(item.anggaranTahap1);
    setAnggaranTahap2(item.anggaranTahap2);
    setShowAddModal(true);
  };

  const handleSubmitItemForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan) return;

    const payload = {
      kodeRkam,
      namaKegiatan,
      edmKode,
      mainCategory,
      subCategory,
      anggaranTahap1: Number(anggaranTahap1),
      anggaranTahap2: Number(anggaranTahap2),
    };

    if (editingId && onEditRkamItem) {
      onEditRkamItem(editingId, payload);
    } else {
      onAddRkamItem(payload);
    }

    setNamaKegiatan('');
    setShowAddModal(false);
  };

  const handleExportExcel = () => {
    const headers = ['Kode RKAM', 'Kode EDM', 'Nama Kegiatan', 'Komponen Sub-Kategori', 'Tahap I (Rp)', 'Tahap II (Rp)', 'Total Anggaran (Rp)'];
    const rows = rkamItems.map((item) => [
      item.kodeRkam,
      item.edmKode,
      item.namaKegiatan,
      item.subCategory,
      item.anggaranTahap1,
      item.anggaranTahap2,
      item.anggaranTahap1 + item.anggaranTahap2,
    ]);
    downloadCsvFile(headers, rows, `RKAM-2026-${profile.namaMadrasah.replace(/\s+/g, '-')}.csv`);
  };

  const handleExportPdfA4 = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* RKAM Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
                PERENCANAAN RKAM & PAGU INDIKATIF 2026
              </span>
              <span className="text-xs text-[#526E6E]">Berbasis EDM (Evaluasi Diri Madrasah)</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F2D2D] mt-2">
              Perencanaan Pagu Indikatif & Realisasi Belanja Tahap 1 & 2
            </h2>
            <p className="text-xs text-[#526E6E] mt-1 max-w-2xl">
              Monitoring kesesuaian antara Perencanaan Pagu Indikatif, RKAM Definitif, dan Realisasi Belanja aktual Tahap 1 (Jan-Jun) dan Tahap 2 (Jul-Des).
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#CCFBF1] hover:bg-[#99F6E4] text-[#0F766E] font-bold text-xs border border-[#99F6E4] transition shadow-sm"
              title="Ekspor ke File Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport Excel</span>
            </button>
            <button
              onClick={handleExportPdfA4}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D4D4D] text-white font-bold text-xs transition shadow-sm"
              title="Cetak/Eksport PDF dengan format Kertas A4"
            >
              <Printer className="w-3.5 h-3.5 text-[#99F6E4]" />
              <span>Eksport PDF (A4)</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Program RKAM</span>
            </button>
          </div>
        </div>

        {/* Section: Comparison Perencanaan Pagu Indikatif vs Realisasi Belanja Tahap 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E2EEEE]">
          {/* Card Tahap 1 */}
          <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F766E] uppercase">Tahap 1 (Semester I)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E]">
                Serapan: {formatPercent(percentRealisasiTahap1)}
              </span>
            </div>
            <div className="text-xs text-[#526E6E]">
              Pagu Indikatif: <strong className="text-[#0F2D2D]">{formatRupiah(paguIndikatifTahap1)}</strong>
            </div>
            <div className="text-sm font-black text-[#0D9488]">
              Realisasi Belanja: {formatRupiah(realisasiTahap1)}
            </div>
            <div className="w-full bg-[#E2EEEE] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#0D9488] h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer"
                style={{ width: `${Math.min(100, percentRealisasiTahap1)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#526E6E]">
              Sisa Pagu Indikatif Tahap 1: <strong className="text-[#0F2D2D]">{formatRupiah(Math.max(0, paguIndikatifTahap1 - realisasiTahap1))}</strong>
            </div>
          </div>

          {/* Card Tahap 2 */}
          <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F766E] uppercase">Tahap 2 (Semester II)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3E2] text-[#E5912B]">
                Serapan: {formatPercent(percentRealisasiTahap2)}
              </span>
            </div>
            <div className="text-xs text-[#526E6E]">
              Pagu Indikatif: <strong className="text-[#0F2D2D]">{formatRupiah(paguIndikatifTahap2)}</strong>
            </div>
            <div className="text-sm font-black text-[#E5912B]">
              Realisasi Belanja: {formatRupiah(realisasiTahap2)}
            </div>
            <div className="w-full bg-[#E2EEEE] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#E5912B] h-full rounded-full transition-all duration-700 animate-progress-grow progress-shimmer"
                style={{ width: `${Math.min(100, percentRealisasiTahap2)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#526E6E]">
              Sisa Pagu Indikatif Tahap 2: <strong className="text-[#0F2D2D]">{formatRupiah(Math.max(0, paguIndikatifTahap2 - realisasiTahap2))}</strong>
            </div>
          </div>

          {/* Card Total Perencanaan & Belanja */}
          <div className="p-4 rounded-xl bg-[#083838] text-white border border-[#0F766E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#99F6E4] uppercase">Total Pagu Indikatif Tahunan</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#2DD4BF] text-[#0F2D2D]">
                2026
              </span>
            </div>
            <div className="text-xl font-black text-white">
              {formatRupiah(paguIndikatifAnnual)}
            </div>
            <div className="text-xs text-[#99F6E4]">
              Total Realisasi Belanja: <strong className="text-white">{formatRupiah(totalRealisasi)}</strong>
            </div>
            <div className="text-xs text-[#2DD4BF] pt-1 border-t border-[#0D9488]">
              Sisa Pagu Indikatif Total: <strong className="text-white">{formatRupiah(paguIndikatifAnnual - totalRealisasi)}</strong>
            </div>
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#E2EEEE]">
          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <div className="text-[11px] text-[#526E6E] font-bold uppercase">Total Target Alokasi BOS</div>
            <div className="text-lg font-black text-[#0F2D2D] mt-0.5">{formatRupiah(totalBosAnnual)}</div>
            <div className="text-[10px] text-[#526E6E] mt-0.5">{profile.jumlahSiswa} Siswa × {formatRupiah(profile.alokasiPerSiswa)}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5]">
            <div className="text-[11px] text-[#526E6E] font-bold uppercase">Total RKAM Terencana</div>
            <div className={`text-lg font-black mt-0.5 ${totalRkamAnnual > totalBosAnnual ? 'text-[#EF4444]' : 'text-[#0D9488]'}`}>
              {formatRupiah(totalRkamAnnual)}
            </div>
            <div className="text-[10px] text-[#526E6E] mt-0.5">
              RKAM Tahap 1: {formatRupiah(totalRkamTahap1)} | RKAM Tahap 2: {formatRupiah(totalRkamTahap2)}
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isHonorRutinExceeded ? 'bg-[#FEE2E2]/30 border-[#EF4444]' : 'bg-[#CCFBF1]/50 border-[#99F6E4]'}`}>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#0F2D2D] uppercase">Honor Rutin ({formatPercent(honorRutinPercent)})</span>
              {isHonorRutinExceeded ? <AlertTriangle className="w-3.5 h-3.5 text-[#991B1B]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />}
            </div>
            <div className="text-lg font-black text-[#0F2D2D] mt-0.5">{formatRupiah(honorRutinRkamTotal)}</div>
            <div className="text-[10px] text-[#526E6E] mt-0.5">
              {isHonorRutinExceeded ? '⚠️ Melebihi plafon 60%' : '✅ Di bawah batas 60% Juknis'}
            </div>
          </div>
        </div>
      </div>

      {/* RKAM Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D1E5E5] overflow-hidden">
        <div className="p-4 bg-[#F2F8F8] border-b border-[#D1E5E5] flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F2D2D] uppercase tracking-wider">
            Daftar Kegiatan RKAM 2026 ({rkamItems.length} Program)
          </span>
          <span className="text-xs text-[#526E6E]">
            EDM: Evaluasi Diri Madrasah Kemenag
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0F2D2D]">
            <thead className="bg-[#E2EEEE] text-[#526E6E] font-bold uppercase tracking-wider border-b border-[#D1E5E5]">
              <tr>
                <th className="px-4 py-3">Kode RKAM</th>
                <th className="px-4 py-3">Kode EDM</th>
                <th className="px-4 py-3">Nama Kegiatan / Program</th>
                <th className="px-4 py-3">Komponen Juknis</th>
                <th className="px-4 py-3 text-right">Tahap I (Rp)</th>
                <th className="px-4 py-3 text-right">Tahap II (Rp)</th>
                <th className="px-4 py-3 text-right">Total (Rp)</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EEEE]">
              {rkamItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#E6FFFA]/50 transition">
                  <td className="px-4 py-3 font-bold text-[#0F2D2D]">{item.kodeRkam}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] font-black border border-[#99F6E4] text-[10px]">
                      {item.edmKode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0F2D2D] max-w-xs">{item.namaKegiatan}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#526E6E] font-semibold">{item.subCategory}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F2D2D]">{formatRupiah(item.anggaranTahap1)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F2D2D]">{formatRupiah(item.anggaranTahap2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#0D9488]">
                    {formatRupiah(item.anggaranTahap1 + item.anggaranTahap2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-[#0D9488] hover:text-[#0D4D4D] rounded hover:bg-[#CCFBF1] transition"
                        title="Edit Kegiatan RKAM"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRkamItem(item.id)}
                        className="p-1.5 text-[#526E6E] hover:text-[#991B1B] rounded hover:bg-[#FEE2E2]/60 transition"
                        title="Hapus Program"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit RKAM Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#083838]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D1E5E5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EEEE]">
              <h3 className="text-base font-bold text-[#0F2D2D] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#0D9488]" />
                {editingId ? 'Ubah Program Anggaran RKAM 2026' : 'Tambah Program Anggaran RKAM 2026'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#526E6E] hover:text-[#0F2D2D] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitItemForm} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Kode RKAM</label>
                  <input
                    type="text"
                    value={kodeRkam}
                    onChange={(e) => setKodeRkam(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] font-mono text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                    placeholder="02.04.01"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Kode EDM (Evaluasi Diri)</label>
                  <input
                    type="text"
                    value={edmKode}
                    onChange={(e) => setEdmKode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                    placeholder="B.1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Nama Uraian Kegiatan</label>
                <input
                  type="text"
                  value={namaKegiatan}
                  onChange={(e) => setNamaKegiatan(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                  placeholder="Contoh: Pengadaan Modul Pembelajaran Digital Siswa"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#0F2D2D]">Komponen Sub-Kategori Juknis</label>
                  {onOpenSubCategoryManager && (
                    <button
                      type="button"
                      onClick={onOpenSubCategoryManager}
                      className="text-[11px] font-bold text-[#0D9488] hover:text-[#0F766E] flex items-center gap-1 hover:underline"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Kelola / Tambah Sub-Kategori</span>
                    </button>
                  )}
                </div>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                >
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.name}>
                      [{sc.code}] {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Anggaran Tahap I (Rp)</label>
                  <input
                    type="number"
                    value={anggaranTahap1}
                    onChange={(e) => setAnggaranTahap1(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Anggaran Tahap II (Rp)</label>
                  <input
                    type="number"
                    value={anggaranTahap2}
                    onChange={(e) => setAnggaranTahap2(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2EEEE] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#D1E5E5] text-[#526E6E] font-semibold hover:bg-[#F2F8F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-sm"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
