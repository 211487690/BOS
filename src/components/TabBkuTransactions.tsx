import React, { useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Percent,
  Receipt,
  Download,
  Info,
  ShieldAlert,
  Printer,
  Sliders,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  MainCategory,
  SubCategory,
  SubCategoryItem,
  RkamItem,
  MadrasahProfile,
} from '../types/bos';
import { formatRupiah, downloadCsvFile } from '../utils/formatters';
import { checkProhibitedTransaction, calculateAutomaticTaxes } from '../services/complianceEngine';
import { KwitansiModal } from './KwitansiModal';

interface TabBkuTransactionsProps {
  transactions: Transaction[];
  rkamItems: RkamItem[];
  profile: MadrasahProfile;
  saldoBku: number;
  subCategories?: SubCategoryItem[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onEditTransaction?: (id: string, tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenSubCategoryManager?: () => void;
}

export const TabBkuTransactions: React.FC<TabBkuTransactionsProps> = ({
  transactions,
  rkamItems,
  profile,
  saldoBku,
  subCategories = [],
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenSubCategoryManager,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [selectedKwitansiTx, setSelectedKwitansiTx] = useState<Transaction | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL');

  // Form State for New Transaction
  const [tanggal, setTanggal] = useState('2026-04-15');
  const [nomorBukti, setNomorBukti] = useState(`BKU/2026/0${transactions.length + 1}`);
  const [uraian, setUraian] = useState('');
  const [jenis, setJenis] = useState<TransactionType>('KELUAR');
  const [mainCategory, setMainCategory] = useState<MainCategory>('KEGIATAN_RUTIN');
  const [subCategory, setSubCategory] = useState<SubCategory>('Operasional Offisial & ATK');
  const [rkamKode, setRkamKode] = useState('02.01.01');
  const [metodePembayaran, setMetodePembayaran] = useState<PaymentMethod>('SIPLAH_E_PURCHASING');
  const [nominal, setNominal] = useState<number>(2500000);

  // Vendor, Recipient & Tax Controls
  const [vendorNama, setVendorNama] = useState('');
  const [penerimaNama, setPenerimaNama] = useState('');
  const [vendorNpwp, setVendorNpwp] = useState(true);
  const [isUmkKoperasi, setIsUmkKoperasi] = useState(true);
  const [isPdn, setIsPdn] = useState(true);
  const [tkdnPercentage, setTkdnPercentage] = useState(65);
  const [statusApprovalKemenag, setStatusApprovalKemenag] = useState(false);

  const handleOpenAddModal = () => {
    setEditingTxId(null);
    setTanggal('2026-04-15');
    setNomorBukti(`BKU/2026/0${transactions.length + 1}`);
    setUraian('');
    setJenis('KELUAR');
    setMainCategory('KEGIATAN_RUTIN');
    setSubCategory('Operasional Offisial & ATK');
    setRkamKode('02.01.01');
    setMetodePembayaran('SIPLAH_E_PURCHASING');
    setNominal(2500000);
    setVendorNama('');
    setPenerimaNama('');
    setVendorNpwp(true);
    setIsUmkKoperasi(true);
    setIsPdn(true);
    setTkdnPercentage(65);
    setStatusApprovalKemenag(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setTanggal(tx.tanggal);
    setNomorBukti(tx.nomorBukti);
    setUraian(tx.uraian);
    setJenis(tx.jenis);
    setMainCategory(tx.mainCategory || 'KEGIATAN_RUTIN');
    setSubCategory(tx.subCategory || 'Operasional Offisial & ATK');
    setRkamKode(tx.rkamKode || '02.01.01');
    setMetodePembayaran(tx.metodePembayaran);
    setNominal(tx.nominal);
    setVendorNama(tx.vendorNama || '');
    setPenerimaNama(tx.penerimaNama || '');
    setVendorNpwp(tx.vendorNpwp ?? true);
    setIsUmkKoperasi(tx.isUmkKoperasi ?? true);
    setIsPdn(tx.isPdn ?? true);
    setTkdnPercentage(tx.tkdnPercentage ?? 65);
    setStatusApprovalKemenag(tx.statusApprovalKemenag ?? false);
    setShowAddModal(true);
  };

  // Live Juknis Scanner check as user types
  const prohibitedScan = useMemo(() => {
    return checkProhibitedTransaction(uraian, subCategory);
  }, [uraian, subCategory]);

  // Live Tax calculation as user inputs nominal & options
  const autoTaxes = useMemo(() => {
    const isService = subCategory.includes('Narasumber') || subCategory.includes('Internet') || subCategory.includes('Lainnya');
    const isLand = subCategory.includes('Gedung');
    return calculateAutomaticTaxes({
      nominal: Number(nominal) || 0,
      subCategory,
      hasNpwp: vendorNpwp,
      isSiplah: metodePembayaran === 'SIPLAH_E_PURCHASING',
      isLandBuildingRent: isLand,
      isServiceOrRent: isService,
    });
  }, [nominal, subCategory, vendorNpwp, metodePembayaran]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nomorBukti.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.vendorNama && t.vendorNama.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = typeFilter === 'ALL' || t.jenis === typeFilter;
      const matchMethod = methodFilter === 'ALL' || t.metodePembayaran === methodFilter;
      return matchSearch && matchType && matchMethod;
    });
  }, [transactions, searchQuery, typeFilter, methodFilter]);

  // Calculate Running Balance for Table
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
  }, [filteredTransactions]);

  // Handle Form Submit
  const handleSubmitNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraian || !nominal) return;

    const payload = {
      tanggal,
      nomorBukti,
      uraian,
      jenis,
      mainCategory: jenis === 'KELUAR' ? mainCategory : undefined,
      subCategory: jenis === 'KELUAR' ? subCategory : undefined,
      rkamKode: jenis === 'KELUAR' ? rkamKode : undefined,
      metodePembayaran,
      nominal: Number(nominal),
      ppn: jenis === 'KELUAR' ? autoTaxes.ppn : 0,
      pph23: jenis === 'KELUAR' ? autoTaxes.pph23 : 0,
      pph42: jenis === 'KELUAR' ? autoTaxes.pph42 : 0,
      meterai: jenis === 'KELUAR' ? autoTaxes.meterai : 0,
      pajakDisetor: true,
      vendorNama: vendorNama || undefined,
      penerimaNama: penerimaNama || vendorNama || undefined,
      vendorNpwp,
      isUmkKoperasi,
      isPdn,
      tkdnPercentage,
      isProhibitedWarning: prohibitedScan.isProhibited,
      prohibitedReason: prohibitedScan.matchedRule?.description,
      statusApprovalKemenag,
    };

    if (editingTxId && onEditTransaction) {
      onEditTransaction(editingTxId, payload);
    } else {
      onAddTransaction(payload);
    }

    setUraian('');
    setShowAddModal(false);
  };

  const handleExportCsv = () => {
    const headers = ['Nomor Bukti', 'Tanggal', 'Jenis', 'Uraian', 'Metode', 'Penerimaan (Rp)', 'Pengeluaran (Rp)', 'PPN', 'PPh 23', 'Vendor', 'PDN', 'UMKM'];
    const rows = sortedTransactions.map((t) => [
      t.nomorBukti,
      t.tanggal,
      t.jenis,
      t.uraian,
      t.metodePembayaran,
      t.jenis === 'MASUK' ? t.nominal : 0,
      t.jenis === 'KELUAR' ? t.nominal : 0,
      t.ppn,
      t.pph23,
      t.vendorNama || '-',
      t.isPdn ? 'Ya' : 'Tidak',
      t.isUmkKoperasi ? 'Ya' : 'Tidak',
    ]);
    downloadCsvFile(headers, rows, `BKU-BOS-${profile.namaMadrasah.replace(/\s+/g, '-')}-2026.csv`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top BKU Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4]">
                BUKU KAS UMUM (BKU) 2026
              </span>
              <span className="text-xs text-[#526E6E]">Transparansi Keuangan Real-Time</span>
            </div>
            <h2 className="text-xl font-bold text-[#0F2D2D] mt-2">
              Pencatatan Buku Kas Umum (BKU) & Transaksi BOS
            </h2>
            <p className="text-xs text-[#526E6E] mt-1 max-w-2xl">
              Setiap transaksi pengeluaran dilengkapi kalkulasi pajak otomatis (PPN 12%, PPh 23, PPh 4(2), Bea Meterai) dan pemindaian 13 aturan larangan Juknis 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#F2F8F8] hover:bg-[#CCFBF1] text-[#0F2D2D] font-bold text-xs transition border border-[#D1E5E5]"
            >
              <Download className="w-4 h-4 text-[#0D9488]" />
              <span>Ekspor CSV / Excel</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Transaksi BKU</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#E2EEEE]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#526E6E] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari uraian, nomor bukti, atau vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#D1E5E5] rounded-xl text-xs focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D]"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl text-xs focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D]"
            >
              <option value="ALL">Semua Jenis (Masuk & Keluar)</option>
              <option value="MASUK">Penerimaan (+ Dana Masuk)</option>
              <option value="KELUAR">Pengeluaran (- Belanja/Honor)</option>
            </select>
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl text-xs focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D]"
            >
              <option value="ALL">Semua Metode Pembayaran</option>
              <option value="SIPLAH_E_PURCHASING">SIPLah / E-Purchasing LKPP</option>
              <option value="TRANSFER">Transfer Bank / Non-Tunai</option>
              <option value="TUNAI">Kas Tunai Bendahara</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D1E5E5] overflow-hidden">
        <div className="p-4 bg-[#F2F8F8] border-b border-[#D1E5E5] flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F2D2D] uppercase tracking-wider">
            Buku Kas Umum ({sortedTransactions.length} Transaksi)
          </span>
          <span className="text-xs font-bold text-[#0F766E] bg-[#CCFBF1] px-3 py-1 rounded-md border border-[#99F6E4]">
            Saldo Kas Akhir: {formatRupiah(saldoBku)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#0F2D2D]">
            <thead className="bg-[#E2EEEE] text-[#526E6E] font-bold uppercase tracking-wider border-b border-[#D1E5E5]">
              <tr>
                <th className="px-3 py-3">No Bukti / Tgl</th>
                <th className="px-3 py-3">Uraian / Vendor</th>
                <th className="px-3 py-3">Komponen / RKAM</th>
                <th className="px-3 py-3 text-right">Penerimaan (Rp)</th>
                <th className="px-3 py-3 text-right">Pengeluaran (Rp)</th>
                <th className="px-3 py-3 text-right">Potongan Pajak</th>
                <th className="px-3 py-3 text-center">Aturan & Status</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EEEE]">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#526E6E]">
                    Tidak ada transaksi BKU yang ditemukan.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((t) => (
                  <tr key={t.id} className={`hover:bg-[#E6FFFA]/50 transition ${t.isProhibitedWarning ? 'bg-[#FEE2E2]/30' : ''}`}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-bold text-[#0F2D2D]">{t.nomorBukti}</div>
                      <div className="text-[11px] text-[#526E6E]">{t.tanggal}</div>
                      <div className="text-[10px] text-[#526E6E] font-mono mt-0.5">{t.metodePembayaran}</div>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      <p className="font-semibold text-[#0F2D2D] leading-snug">{t.uraian}</p>
                      {t.vendorNama && (
                        <p className="text-[11px] text-[#526E6E] mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#526E6E]" />
                          <span>{t.vendorNama}</span>
                        </p>
                      )}
                      {t.isProhibitedWarning && (
                        <div className="mt-1 p-1.5 rounded bg-[#FEE2E2] border border-[#EF4444]/50 text-[#991B1B] text-[10px] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 shrink-0" />
                          <span>Peringatan Juknis: {t.prohibitedReason || 'Potensi larangan!'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]/60">
                        {t.subCategory || 'Penerimaan Dana'}
                      </span>
                      {t.rkamKode && (
                        <div className="text-[10px] font-mono text-[#526E6E] mt-1">Kode: {t.rkamKode}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-[#0D9488] whitespace-nowrap">
                      {t.jenis === 'MASUK' ? formatRupiah(t.nominal) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-[#0F2D2D] whitespace-nowrap">
                      {t.jenis === 'KELUAR' ? formatRupiah(t.nominal) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {t.ppn > 0 && <div className="text-[10px] text-[#E5912B] font-bold">PPN: {formatRupiah(t.ppn)}</div>}
                      {t.pph23 > 0 && <div className="text-[10px] text-[#0F766E] font-bold">PPh23: {formatRupiah(t.pph23)}</div>}
                      {t.meterai > 0 && <div className="text-[10px] text-[#0D9488] font-bold">Meterai: Rp 10.000</div>}
                      {t.ppn === 0 && t.pph23 === 0 && t.meterai === 0 && <span className="text-[#526E6E] text-[11px]">-</span>}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {t.isPdn && (
                          <span className="px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] text-[9px] font-extrabold border border-[#99F6E4]">
                            PDN
                          </span>
                        )}
                        {t.isUmkKoperasi && (
                          <span className="px-1.5 py-0.5 rounded bg-[#E6FFFA] text-[#0D9488] text-[9px] font-extrabold border border-[#99F6E4]">
                            UMKM
                          </span>
                        )}
                        {t.metodePembayaran === 'SIPLAH_E_PURCHASING' && (
                          <span className="px-1.5 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] text-[9px] font-extrabold border border-[#99F6E4]">
                            SIPLah
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        {t.jenis === 'KELUAR' && (
                          <button
                            onClick={() => setSelectedKwitansiTx(t)}
                            className="p-1.5 text-[#0F766E] hover:text-[#083838] rounded hover:bg-[#CCFBF1] transition flex items-center space-x-1"
                            title="Cetak Kwitansi Pengeluaran"
                          >
                            <Printer className="w-4 h-4 text-[#0D9488]" />
                            <span className="text-[10px] font-bold text-[#0D9488] hidden sm:inline">Kwitansi</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 text-[#0D9488] hover:text-[#0D4D4D] rounded hover:bg-[#CCFBF1] transition"
                          title="Edit Transaksi BKU"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1.5 text-[#526E6E] hover:text-[#991B1B] rounded hover:bg-[#FEE2E2]/60 transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Transaction with Auto Tax & Prohibited Scanner */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#083838]/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#D1E5E5] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EEEE]">
              <h3 className="text-base font-bold text-[#0F2D2D] flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-[#0D9488]" />
                {editingTxId ? 'Ubah Transaksi BKU' : 'Catat Transaksi Baru Dalam BKU'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#526E6E] hover:text-[#0F2D2D] font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewTx} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Nomor Bukti BKU</label>
                  <input
                    type="text"
                    value={nomorBukti}
                    onChange={(e) => setNomorBukti(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0F2D2D] mb-1">Jenis Transaksi</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-bold text-[#0F2D2D] bg-[#F2F8F8]"
                  >
                    <option value="KELUAR">Pengeluaran (- Belanja/Honor)</option>
                    <option value="MASUK">Penerimaan (+ Dana Masuk)</option>
                  </select>
                </div>
              </div>

              {/* Description field with LIVE PROHIBITION SCANNER */}
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">Uraian Transaksi</label>
                <textarea
                  rows={2}
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  required
                  placeholder="Ketik uraian belanja/kegiatan... (Mesin akan otomatis memindai aturan larangan Juknis 2026)"
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                />

                {/* Prohibited Alert Banner */}
                {prohibitedScan.isProhibited && prohibitedScan.matchedRule && (
                  <div className="mt-2 p-3 rounded-xl bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] text-xs flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-[#991B1B] mt-0.5" />
                    <div>
                      <strong className="font-extrabold">⚠️ LARANGAN JUKNIS 2026 TERDETEKSI:</strong>
                      <p className="mt-0.5 text-[11px] leading-relaxed">
                        {prohibitedScan.matchedRule.title} &mdash; {prohibitedScan.matchedRule.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Conditional Expenditure Fields */}
              {jenis === 'KELUAR' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-[#0F2D2D]">Sub-Komponen Penggunaan</label>
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

                    <div>
                      <label className="block font-bold text-[#0F2D2D] mb-1">Link Program RKAM 2026</label>
                      <select
                        value={rkamKode}
                        onChange={(e) => setRkamKode(e.target.value)}
                        className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-mono bg-[#F2F8F8] text-[#0F2D2D]"
                      >
                        {rkamItems.map((item) => (
                          <option key={item.id} value={item.kodeRkam}>
                            [{item.kodeRkam}] {item.namaKegiatan.substring(0, 40)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#0F2D2D] mb-1">Metode Pembayaran</label>
                      <select
                        value={metodePembayaran}
                        onChange={(e) => setMetodePembayaran(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] text-xs font-bold bg-[#F2F8F8] text-[#0F2D2D]"
                      >
                        <option value="SIPLAH_E_PURCHASING">SIPLah / E-Purchasing LKPP</option>
                        <option value="TRANSFER">Transfer Bank (Non-Tunai)</option>
                        <option value="TUNAI">Kas Tunai Bendahara</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#0F2D2D] mb-1">Nominal Transaksi (Rp)</label>
                      <input
                        type="number"
                        value={nominal}
                        onChange={(e) => setNominal(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 border border-[#D1E5E5] rounded-lg focus:ring-2 focus:ring-[#0D9488] font-black text-[#0F2D2D] text-xs bg-[#F2F8F8]"
                      />
                    </div>
                  </div>

                  {/* Vendor & Compliance Options */}
                  <div className="p-3 bg-[#F2F8F8] rounded-xl border border-[#D1E5E5] space-y-3">
                    <div className="text-xs font-bold text-[#0F2D2D] flex items-center justify-between">
                      <span>Data Penyedia / Vendor & Kepatuhan PDN/UMKM</span>
                      <span className="text-[10px] text-[#526E6E]">Mendukung Target Kemenag 2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Vendor / Toko (Opsional)"
                        value={vendorNama}
                        onChange={(e) => setVendorNama(e.target.value)}
                        className="px-3 py-1.5 border border-[#D1E5E5] rounded-lg text-xs bg-white text-[#0F2D2D]"
                      />
                      <input
                        type="text"
                        placeholder="Nama Penerima Uang (Kwitansi)"
                        value={penerimaNama}
                        onChange={(e) => setPenerimaNama(e.target.value)}
                        className="px-3 py-1.5 border border-[#D1E5E5] rounded-lg text-xs bg-white text-[#0F2D2D]"
                      />
                    </div>
                    <div className="pt-1">
                      <label className="flex items-center space-x-2 text-xs font-semibold text-[#0F2D2D]">
                        <input
                          type="checkbox"
                          checked={vendorNpwp}
                          onChange={(e) => setVendorNpwp(e.target.checked)}
                          className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span>Vendor Memiliki NPWP (Tarif PPh 23 Normal 2%)</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#0F2D2D]">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPdn}
                          onChange={(e) => setIsPdn(e.target.checked)}
                          className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className="font-bold text-[#0F766E]">Produk Dalam Negeri (PDN)</span>
                      </label>

                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isUmkKoperasi}
                          onChange={(e) => setIsUmkKoperasi(e.target.checked)}
                          className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span className="font-bold text-[#0D9488]">Penyedia UMKM / Koperasi</span>
                      </label>
                    </div>
                  </div>

                  {/* Automatic Calculated Taxes Summary */}
                  <div className="p-3 bg-[#CCFBF1] rounded-xl border border-[#99F6E4] text-xs">
                    <div className="font-extrabold text-[#0F766E] flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-[#0F766E]" />
                      <span>Kalkulasi Otomatis Potongan Pajak & Meterai Juknis 2026:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] font-bold text-[#0F2D2D]">
                      <div>PPN 12%: <strong className="text-[#0F766E]">{formatRupiah(autoTaxes.ppn)}</strong></div>
                      <div>PPh 23 (2%/4%): <strong className="text-[#0D9488]">{formatRupiah(autoTaxes.pph23)}</strong></div>
                      <div>PPh 4(2) 10%: <strong className="text-[#0D4D4D]">{formatRupiah(autoTaxes.pph42)}</strong></div>
                      <div>Bea Meterai: <strong className="text-[#0F2D2D]">{formatRupiah(autoTaxes.meterai)}</strong></div>
                    </div>
                    <p className="text-[10px] text-[#526E6E] mt-1">
                      * PPN 12% otomatis berlaku jika transaksi barang/jasa ≥ Rp2.000.000,00. Bea meterai berlaku jika transaksi ≥ Rp5.000.000,00.
                    </p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
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
                  className="px-5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold shadow-sm"
                >
                  Simpan ke BKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kwitansi Modal */}
      {selectedKwitansiTx && (
        <KwitansiModal
          transaction={selectedKwitansiTx}
          profile={profile}
          onClose={() => setSelectedKwitansiTx(null)}
        />
      )}
    </div>
  );
};
