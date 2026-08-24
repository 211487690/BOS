/**
 * BOS-BERKIBAR Types
 * Standard Juknis BOP RA & BOS Madrasah Tahun 2026
 */

export type JenjangMadrasah = 'RA' | 'MI' | 'MTs' | 'MA' | 'MAK';

export type MainCategory = 'HONOR' | 'KEGIATAN_RUTIN' | 'KEGIATAN_NON_RUTIN' | 'KHUSUS';

export interface SubCategoryItem {
  id: string;
  code: string;
  name: string;
  mainCategory: MainCategory;
  description?: string;
  isDefault?: boolean;
}

export type SubCategory = string;

export type TransactionType = 'MASUK' | 'KELUAR';

export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'SIPLAH_E_PURCHASING';

export interface MadrasahProfile {
  namaMadrasah: string;
  nsm: string;
  npsn: string;
  jenjang: JenjangMadrasah;
  alamat: string;
  kabKota: string;
  provinsi: string;
  kepalaMadrasah: string;
  nipKepala: string;
  bendahara: string;
  nipBendahara: string;
  umkDaerah: number; // UMK daerah for honor min checks
  jumlahSiswa: number;
  alokasiPerSiswa: number; // e.g. Rp 1.100.000 for MTs, Rp 600.000 for RA
  paguIndikatifTahap1?: number; // Perencanaan Pagu Indikatif Tahap 1
  paguIndikatifTahap2?: number; // Perencanaan Pagu Indikatif Tahap 2
  noRekening: string;
  namaBank: string;
  logoUrl?: string; // Logo madrasah (base64 or image URL)
}

export interface RkamItem {
  id: string;
  kodeRkam: string;
  namaKegiatan: string;
  edmKode: string; // e.g., A.1, B.3
  mainCategory: MainCategory;
  subCategory: SubCategory;
  anggaranTahap1: number;
  anggaranTahap2: number;
}

export interface Transaction {
  id: string;
  tanggal: string; // YYYY-MM-DD
  nomorBukti: string; // BKU/2026/001
  uraian: string;
  jenis: TransactionType;
  mainCategory?: MainCategory;
  subCategory?: SubCategory;
  rkamKode?: string;
  metodePembayaran: PaymentMethod;
  nominal: number;
  
  // Tax & Stamp duty fields
  ppn: number; // 12% if >= 2M
  pph23: number; // 2% / 4%
  pph42: number; // 10% for land/building
  meterai: number; // Rp 10.000 if criteria met
  pajakDisetor: boolean; // Has tax been deposited to treasury
  
  // Compliance Flags
  vendorNama?: string;
  penerimaNama?: string; // Nama Penerima Uang untuk Kwitansi (e.g. Toko/Orang/Vendor)
  vendorNpwp?: boolean;
  isUmkKoperasi?: boolean; // Usaha Mikro / Koperasi (min 40% target)
  isPdn?: boolean; // Produk Dalam Negeri (min 30% target)
  tkdnPercentage?: number; // e.g. 45%
  
  // Verification flags
  isProhibitedWarning?: boolean;
  prohibitedReason?: string;
  statusApprovalKemenag?: boolean; // Needed if Honor Rutin > 60%
  attachmentName?: string;
}

export interface JuknisRulesCompliance {
  totalBosAnnual: number;
  paguIndikatifAnnual: number;
  paguIndikatifTahap1: number;
  paguIndikatifTahap2: number;
  totalReceivedTahap1: number;
  totalSpentTahap1: number;
  totalSpentTahap2: number;
  realisasiTahap1Percent: number; // Min 80% to unlock Tahap 2
  realisasiTahap2Percent: number;
  isTahap1UnlockedTahap2: boolean;

  totalHonorRutin: number;
  honorRutinPercent: number; // Max 60%
  isHonorRutinExceeded: boolean;
  hasKemenagApproval: boolean;

  operatorItHonorMonthly: number;
  operatorItPercentOfUmk: number; // Min 50% UMK
  isOperatorItValid: boolean;

  totalGoodsServicesSpent: number;
  totalPdnSpent: number;
  pdnPercent: number; // Min 30%
  isPdnValid: boolean;

  totalUmkmSpent: number;
  umkmPercent: number; // Min 40%
  isUmkmValid: boolean;

  prohibitedCount: number;
  overallScore: number; // 0 - 100%
  complianceStatus: 'SANGAT_BAIK' | 'PATUH' | 'PERLU_PERBAIKAN' | 'PELANGGARAN';
}

export interface ProhibitedRule {
  id: number;
  title: string;
  description: string;
  keywords: string[];
}
