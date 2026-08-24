import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Download, Upload, Building2, UserCheck, Sliders, Tag, Plus } from 'lucide-react';
import { MadrasahProfile, SubCategoryItem } from '../types/bos';
import { formatRupiah } from '../utils/formatters';

interface TabSettingsProfileProps {
  profile: MadrasahProfile;
  subCategories?: SubCategoryItem[];
  onUpdateProfile: (updated: MadrasahProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onOpenSubCategoryManager?: () => void;
}

export const TabSettingsProfile: React.FC<TabSettingsProfileProps> = ({
  profile,
  subCategories = [],
  onUpdateProfile,
  onExportBackup,
  onImportBackup,
  onResetData,
  onOpenSubCategoryManager,
}) => {
  const [formData, setFormData] = useState<MadrasahProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F2D2D]">Profil Madrasah & Pengaturan Database</h2>
            <p className="text-xs text-[#526E6E] mt-0.5">
              Kelola data identitas sekolah, UMK daerah, NIP pejabat penandatangan (Kepala & Bendahara), serta backup database.
            </p>
          </div>
          {savedSuccess && (
            <span className="px-3 py-1.5 rounded-lg bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4] animate-fade-in">
              ✅ Profile & TTD Pejabat Berhasil Diperbarui!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6 text-xs">
          {/* Section 1: Logo & Identitas Madrasah */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0F2D2D] border-b border-[#D1E5E5] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F766E]" />
              Logo & Identitas Madrasah (Tampil pada KOP & Kwitansi)
            </h3>

            {/* Logo Customization Card */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Logo Preview Box */}
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#0D9488] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Madrasah" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center p-1 text-[#526E6E]">
                      <Building2 className="w-6 h-6 mx-auto text-[#0D9488]" />
                      <span className="text-[9px] font-bold block mt-0.5">Belum ada logo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Link Controls */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* File Upload from HP/Laptop */}
                    <label className="px-3 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs cursor-pointer inline-flex items-center justify-center space-x-1.5 transition shadow-sm shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Unggah Logo dari HP/Laptop</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('Ukuran file logo terlalu besar. Maksimal 2MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                setFormData({ ...formData, logoUrl: result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition shrink-0"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#526E6E] mb-1">
                      Atau Masukkan URL Link Logo (HTTP/HTTPS)
                    </label>
                    <input
                      type="url"
                      value={formData.logoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo-madrasah.png"
                      className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs bg-white text-[#0F2D2D]"
                    />
                  </div>
                  <p className="text-[10px] text-[#526E6E]">
                    Logo akan otomatis muncul pada setiap KOP Laporan, Kwitansi Pengeluaran, & Dokumen LPJ BOS 2026.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Nama Madrasah / RA (Full Custom)</label>
                <input
                  type="text"
                  value={formData.namaMadrasah}
                  onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Nomor Statistik Madrasah (NSM)</label>
                <input
                  type="text"
                  value={formData.nsm}
                  onChange={(e) => setFormData({ ...formData, nsm: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">NPSN Kemdikbud/Kemenag</label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Jenjang Pendidikan</label>
                <select
                  value={formData.jenjang}
                  onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-[#F2F8F8] text-[#0F2D2D]"
                >
                  <option value="RA">RA (Raudhatul Athfal)</option>
                  <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                  <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
                  <option value="MA">MA (Madrasah Aliyah)</option>
                  <option value="MAK">MAK (Madrasah Aliyah Kejuruan)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={formData.kabKota}
                  onChange={(e) => setFormData({ ...formData, kabKota: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">UMK Daerah Setempat (Rp)</label>
                <input
                  type="number"
                  value={formData.umkDaerah}
                  onChange={(e) => setFormData({ ...formData, umkDaerah: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Student Count & Pagu Indikatif Planning */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0F2D2D] border-b border-[#D1E5E5] pb-2 flex items-center justify-between">
              <span>Perencanaan Pagu Indikatif & Alokasi BOS 2026</span>
              <span className="text-[10px] font-normal text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#99F6E4]">
                Customizable Pagu Indikatif Tahap 1 & 2
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Jumlah Siswa Terdaftar (Orang)</label>
                <input
                  type="number"
                  value={formData.jumlahSiswa}
                  onChange={(e) => setFormData({ ...formData, jumlahSiswa: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Alokasi BOS per Siswa / Tahun (Rp)</label>
                <input
                  type="number"
                  value={formData.alokasiPerSiswa}
                  onChange={(e) => setFormData({ ...formData, alokasiPerSiswa: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>
            </div>

            {/* Pagu Indikatif Tahap 1 & Tahap 2 */}
            <div className="p-4 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F766E] text-xs">Perencanaan Pagu Indikatif Belanja (Tahap 1 & Tahap 2)</span>
                <span className="font-extrabold text-[#0F2D2D] text-xs">
                  Total Pagu Indikatif: {formatRupiah((formData.paguIndikatifTahap1 ?? 0) + (formData.paguIndikatifTahap2 ?? 0))}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Pagu Indikatif Belanja Tahap 1 (Rp)</label>
                  <input
                    type="number"
                    value={formData.paguIndikatifTahap1 ?? (formData.jumlahSiswa * formData.alokasiPerSiswa * 0.5)}
                    onChange={(e) => setFormData({ ...formData, paguIndikatifTahap1: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-white text-[#0F766E]"
                  />
                  <p className="text-[10px] text-[#526E6E] mt-1">Estimasi plafon belanja semester I (Jan-Jun)</p>
                </div>

                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Pagu Indikatif Belanja Tahap 2 (Rp)</label>
                  <input
                    type="number"
                    value={formData.paguIndikatifTahap2 ?? (formData.jumlahSiswa * formData.alokasiPerSiswa * 0.5)}
                    onChange={(e) => setFormData({ ...formData, paguIndikatifTahap2: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-bold bg-white text-[#0F766E]"
                  />
                  <p className="text-[10px] text-[#526E6E] mt-1">Estimasi plafon belanja semester II (Jul-Des)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Sign-Off Officials */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0F2D2D] border-b border-[#D1E5E5] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0F766E]" />
                Pejabat Penandatangan Laporan (Mengetahui Kepala & Bendahara BOS)
              </span>
              <span className="text-[10px] font-normal text-[#0F766E] bg-[#E6FFFA] px-2 py-0.5 rounded border border-[#99F6E4]">
                Custom Full Nama & NIP
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-[#F2F8F8] border border-[#D1E5E5] rounded-xl space-y-2">
                <label className="block font-bold text-[#0F766E]">Pejabat Mengetahui: Kepala Madrasah</label>
                <div>
                  <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">Nama Lengkap & Gelar (Full Custom)</label>
                  <input
                    type="text"
                    value={formData.kepalaMadrasah}
                    onChange={(e) => setFormData({ ...formData, kepalaMadrasah: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white text-[#0F2D2D] font-semibold"
                    placeholder="Drs. H. Ahmad Fauzi, M.Pd."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">NIP Kepala Madrasah (Full Custom)</label>
                  <input
                    type="text"
                    placeholder="197508122003121002"
                    value={formData.nipKepala}
                    onChange={(e) => setFormData({ ...formData, nipKepala: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono bg-white text-[#0F2D2D]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F2F8F8] border border-[#D1E5E5] rounded-xl space-y-2">
                <label className="block font-bold text-[#0F766E]">Pejabat Pembuat Laporan: Bendahara BOS</label>
                <div>
                  <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">Nama Lengkap & Gelar (Full Custom)</label>
                  <input
                    type="text"
                    value={formData.bendahara}
                    onChange={(e) => setFormData({ ...formData, bendahara: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white text-[#0F2D2D] font-semibold"
                    placeholder="Siti Rahmawati, S.E."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#526E6E] mb-0.5">NIP Bendahara BOS (Full Custom)</label>
                  <input
                    type="text"
                    placeholder="198204152009012008"
                    value={formData.nipBendahara}
                    onChange={(e) => setFormData({ ...formData, nipBendahara: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-mono bg-white text-[#0F2D2D]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D1E5E5] flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D4D4D] text-white font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#99F6E4]" />
              <span>Simpan Perubahan Profile & TTD</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sub-Category Management Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2EEEE] pb-3">
          <div>
            <h3 className="font-bold text-[#0F2D2D] text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0D9488]" />
              Pengaturan Komponen Sub-Kategori Juknis
            </h3>
            <p className="text-xs text-[#526E6E] mt-0.5">
              Tambah sub-kategori manual, ubah nama, atau hapus komponen belanja sesuai kebutuhan instansi.
            </p>
          </div>
          {onOpenSubCategoryManager && (
            <button
              onClick={onOpenSubCategoryManager}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kelola & Tambah Sub-Kategori</span>
            </button>
          )}
        </div>

        {/* Quick List Preview of Sub-Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {subCategories.slice(0, 9).map((sc) => (
            <div
              key={sc.id}
              className="p-2.5 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] flex items-center justify-between gap-2"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="px-1.5 py-0.5 rounded bg-[#0D9488] text-white text-[10px] font-extrabold font-mono shrink-0">
                  {sc.code}
                </span>
                <span className="font-bold text-[#0F2D2D] truncate">{sc.name}</span>
              </div>
            </div>
          ))}
          {subCategories.length > 9 && (
            <div
              onClick={onOpenSubCategoryManager}
              className="p-2.5 rounded-xl bg-[#CCFBF1]/50 border border-[#99F6E4] text-[#0F766E] font-bold text-center flex items-center justify-center cursor-pointer hover:bg-[#CCFBF1]"
            >
              +{subCategories.length - 9} Sub-Kategori Lainnya...
            </div>
          )}
        </div>
      </div>

      {/* Backup & Management Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5] space-y-4">
        <h3 className="font-bold text-[#0F2D2D] text-sm">Manajemen Cadangan Data & Database Transparan</h3>
        <p className="text-xs text-[#526E6E]">
          Ekspor seluruh data BKU, RKAM, dan profil madrasah dalam format JSON terenkripsi lokal untuk pencadangan aman.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportBackup}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0D4D4D] text-white font-bold text-xs hover:bg-[#0F766E] transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#99F6E4]" />
            <span>Unduh File Backup JSON</span>
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
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#F2F8F8] border border-[#D1E5E5] text-[#0F2D2D] font-bold text-xs hover:bg-[#CCFBF1] transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#0F766E]" />
            <span>Pulihkan / Impor Database JSON</span>
          </button>

          <button
            onClick={onResetData}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#FEE2E2]/60 border border-[#EF4444]/40 text-[#991B1B] font-bold text-xs hover:bg-[#FEE2E2] transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset ke Sample Data 2026</span>
          </button>
        </div>
      </div>
    </div>
  );
};
