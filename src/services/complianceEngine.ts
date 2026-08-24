import {
  Transaction,
  MadrasahProfile,
  RkamItem,
  JuknisRulesCompliance,
  ProhibitedRule,
} from '../types/bos';

export const PROHIBITED_RULES_2026: ProhibitedRule[] = [
  {
    id: 1,
    title: 'Operasional Yayasan',
    description: 'Dilarang membiayai operasional/kegiatan milik yayasan penyelenggara.',
    keywords: ['yayasan', 'pembina yayasan', 'sewa kantor yayasan', 'iuran yayasan'],
  },
  {
    id: 2,
    title: 'Deposito / Bunga Bank',
    description: 'Dilarang menyimpan dana BOS/BOP dengan maksud dibungakan (deposito dll).',
    keywords: ['deposito', 'investasi bunga', 'bunga bank', 'reksa dana'],
  },
  {
    id: 3,
    title: 'Rekening Pribadi',
    description: 'Dilarang menyimpan dana BOS/BOP dalam rekening pribadi siapapun.',
    keywords: ['rek pribadi', 'rekening perorangan', 'transfer pribadi'],
  },
  {
    id: 4,
    title: 'Pinjaman Pihak Lain',
    description: 'Dilarang meminjamkan dana BOS/BOP kepada pihak lain.',
    keywords: ['pinjaman', 'piutang', 'kasbon yayasan', 'pinjam dana'],
  },
  {
    id: 5,
    title: 'Pembelian Software Pelaporan BOS',
    description: 'Dilarang membeli software untuk pelaporan keuangan BOP/BOS.',
    keywords: ['aplikasi bos', 'software bos', 'aplikasi bku', 'lisensi software keuangan'],
  },
  {
    id: 6,
    title: 'Kegiatan Non-Prioritas (Studi Banding / Wisata)',
    description: 'Dilarang untuk kegiatan non-prioritas seperti studi banding atau karya wisata.',
    keywords: ['studi banding', 'karya wisata', 'tour', 'rekreasi', 'piknik'],
  },
  {
    id: 7,
    title: 'Seragam / Sepatu Pribadi',
    description: 'Dilarang membeli pakaian/seragam/sepatu untuk kepentingan pribadi guru/siswa.',
    keywords: ['seragam guru', 'baju batik pribadi', 'sepatu guru', 'pakaian dinas perorangan'],
  },
  {
    id: 8,
    title: 'Rehab Rusak Sedang / Berat',
    description: 'Dilarang meretrofiting atau rehab sarpras kategori rusak sedang dan berat (hanya pemeliharaan ringan).',
    keywords: ['rehab berat', 'rehab sedang', 'pembangunan atap roboh', 'renovasi total'],
  },
  {
    id: 9,
    title: 'Pembangunan Gedung Baru',
    description: 'Dilarang membangun gedung atau ruangan baru (kecuali toilet/WC sanitasi).',
    keywords: ['pembangunan ruang kelas', 'gedung baru', 'fondasi RKB', 'pembangunan lab baru'],
  },
  {
    id: 10,
    title: 'Pembelian Saham / Surat Berharga',
    description: 'Dilarang membeli saham, obligasi, atau investasi modal.',
    keywords: ['saham', 'investasi modal', 'crypto', 'surat berharga'],
  },
  {
    id: 11,
    title: 'Acara Peringatan Hari Besar Non-Edukasi',
    description: 'Dilarang untuk upacara peringatan hari besar nasional atau acara keagamaan non-mutu.',
    keywords: ['panggung hiburan PHBN', 'sewa tenda peringatan hari besar', 'konsumsi wisuda umum'],
  },
  {
    id: 12,
    title: 'Wisuda & Perpisahan Mewah',
    description: 'Dilarang untuk acara perpisahan/wisuda siswa atau hadiah yang tidak mendukung mutu.',
    keywords: ['wisuda', 'pesta perpisahan', 'souvenir wisuda', 'sewa panggung wisuda'],
  },
  {
    id: 13,
    title: 'Double Accounting (Penganggaran Ganda)',
    description: 'Dilarang membiayai kegiatan yang sudah dibiayai penuh oleh sumber lain (APBD/Kemenag Pusat).',
    keywords: ['ganda', 'dibiayai apbd', 'double accounting', 'klaim ganda'],
  },
];

/**
 * Scan a transaction for potential Juknis prohibition violations
 */
export function checkProhibitedTransaction(uraian: string, subCategory?: string): { isProhibited: boolean; matchedRule?: ProhibitedRule } {
  const lowerText = (uraian + ' ' + (subCategory || '')).toLowerCase();

  // Allow toilet/sanitasi building explicit exception
  if (lowerText.includes('toilet') || lowerText.includes('sanitasi') || lowerText.includes('wc')) {
    if (lowerText.includes('gedung baru') || lowerText.includes('pembangunan')) {
      return { isProhibited: false };
    }
  }

  for (const rule of PROHIBITED_RULES_2026) {
    for (const kw of rule.keywords) {
      if (lowerText.includes(kw)) {
        return { isProhibited: true, matchedRule: rule };
      }
    }
  }

  return { isProhibited: false };
}

/**
 * Automatic Tax Calculator based on Juknis 2026 rules
 */
export function calculateAutomaticTaxes(params: {
  nominal: number;
  subCategory?: string;
  hasNpwp?: boolean;
  isSiplah?: boolean;
  isLandBuildingRent?: boolean;
  isServiceOrRent?: boolean;
}) {
  const { nominal, subCategory = '', hasNpwp = true, isLandBuildingRent = false, isServiceOrRent = false } = params;

  let ppn = 0;
  let pph23 = 0;
  let pph42 = 0;
  let meterai = 0;

  // 1. Bea Meterai Rp 10.000 for transactions >= Rp 5.000.000
  if (nominal >= 5000000) {
    meterai = 10000;
  }

  // 2. PPN 12%: No PPN under Rp 2.000.000
  // Applies to procurement of goods/services >= Rp 2.000.000
  const isHonor = subCategory.toLowerCase().includes('honor');
  if (!isHonor && nominal >= 2000000) {
    // 12% PPN from DPP (assuming price includes PPN or calculate DPP)
    // DPP = nominal / 1.12
    ppn = Math.round((nominal / 1.12) * 0.12);
  }

  // 3. PPh 4(2) 10% for land / building rental
  if (isLandBuildingRent || subCategory.toLowerCase().includes('sewa tanah') || subCategory.toLowerCase().includes('sewa gedung')) {
    pph42 = Math.round(nominal * 0.1);
  }

  // 4. PPh 23 for non-land rental and services (2% with NPWP, 4% without NPWP)
  if (isServiceOrRent && !isLandBuildingRent && !isHonor) {
    const rate = hasNpwp ? 0.02 : 0.04;
    pph23 = Math.round(nominal * rate);
  }

  return { ppn, pph23, pph42, meterai, totalTax: ppn + pph23 + pph42 + meterai };
}

/**
 * Calculate Juknis 2026 Compliance Metrics
 */
export function calculateComplianceMetrics(
  transactions: Transaction[],
  profile: MadrasahProfile,
  rkamItems: RkamItem[]
): JuknisRulesCompliance {
  const totalBosAnnual = profile.jumlahSiswa * profile.alokasiPerSiswa;
  const defaultHalf = totalBosAnnual * 0.5;

  const paguIndikatifTahap1 = profile.paguIndikatifTahap1 ?? defaultHalf;
  const paguIndikatifTahap2 = profile.paguIndikatifTahap2 ?? defaultHalf;
  const paguIndikatifAnnual = paguIndikatifTahap1 + paguIndikatifTahap2;

  const totalReceivedTahap1 = totalBosAnnual * 0.5;

  let totalSpentTahap1 = 0;
  let totalSpentTahap2 = 0;
  let totalSpentAnnual = 0;
  let totalHonorRutin = 0;
  let totalGoodsServicesSpent = 0;
  let totalPdnSpent = 0;
  let totalUmkmSpent = 0;
  let prohibitedCount = 0;
  let operatorItHonorSum = 0;
  let operatorItCount = 0;

  transactions.forEach((t) => {
    if (t.jenis === 'KELUAR') {
      totalSpentAnnual += t.nominal;
      
      // Tahap 1 is transactions before July 1st 2026; Tahap 2 is on/after July 1st 2026
      if (new Date(t.tanggal) < new Date('2026-07-01')) {
        totalSpentTahap1 += t.nominal;
      } else {
        totalSpentTahap2 += t.nominal;
      }

      if (t.subCategory === 'Honor Rutin (Pendidik/Tenaga Kependidikan Non-ASN)') {
        totalHonorRutin += t.nominal;
      }

      if (t.subCategory === 'Honor Operator IT Data Madrasah') {
        operatorItHonorSum += t.nominal;
        operatorItCount += 1;
      }

      // Goods & Services spending
      if (t.mainCategory === 'KEGIATAN_RUTIN' || t.mainCategory === 'KEGIATAN_NON_RUTIN') {
        totalGoodsServicesSpent += t.nominal;
        if (t.isPdn) totalPdnSpent += t.nominal;
        if (t.isUmkKoperasi) totalUmkmSpent += t.nominal;
      }

      if (t.isProhibitedWarning) {
        prohibitedCount += 1;
      }
    }
  });

  // Percentages calculations
  const honorRutinPercent = totalBosAnnual > 0 ? (totalHonorRutin / totalBosAnnual) * 100 : 0;
  const isHonorRutinExceeded = honorRutinPercent > 60;

  const realisasiTahap1Percent = paguIndikatifTahap1 > 0 ? (totalSpentTahap1 / paguIndikatifTahap1) * 100 : 0;
  const realisasiTahap2Percent = paguIndikatifTahap2 > 0 ? (totalSpentTahap2 / paguIndikatifTahap2) * 100 : 0;
  const isTahap1UnlockedTahap2 = realisasiTahap1Percent >= 80;

  const avgOperatorItMonthly = operatorItCount > 0 ? operatorItHonorSum / operatorItCount : 0;
  const operatorItPercentOfUmk = profile.umkDaerah > 0 ? (avgOperatorItMonthly / profile.umkDaerah) * 100 : 0;
  const isOperatorItValid = operatorItPercentOfUmk >= 50;

  const pdnPercent = totalGoodsServicesSpent > 0 ? (totalPdnSpent / totalGoodsServicesSpent) * 100 : 0;
  const isPdnValid = pdnPercent >= 30;

  const umkmPercent = totalGoodsServicesSpent > 0 ? (totalUmkmSpent / totalGoodsServicesSpent) * 100 : 0;
  const isUmkmValid = umkmPercent >= 40;

  // Compliance Scoring (0-100)
  let score = 100;
  if (isHonorRutinExceeded && !transactions.some((t) => t.statusApprovalKemenag)) score -= 25;
  if (!isTahap1UnlockedTahap2) score -= 15;
  if (!isOperatorItValid) score -= 10;
  if (!isPdnValid) score -= 15;
  if (!isUmkmValid) score -= 15;
  if (prohibitedCount > 0) score -= prohibitedCount * 20;

  score = Math.max(0, Math.min(100, score));

  let complianceStatus: JuknisRulesCompliance['complianceStatus'] = 'PATUH';
  if (score >= 90) complianceStatus = 'SANGAT_BAIK';
  else if (score >= 75) complianceStatus = 'PATUH';
  else if (score >= 50) complianceStatus = 'PERLU_PERBAIKAN';
  else complianceStatus = 'PELANGGARAN';

  return {
    totalBosAnnual,
    paguIndikatifAnnual,
    paguIndikatifTahap1,
    paguIndikatifTahap2,
    totalReceivedTahap1,
    totalSpentTahap1,
    totalSpentTahap2,
    realisasiTahap1Percent,
    realisasiTahap2Percent,
    isTahap1UnlockedTahap2,
    totalHonorRutin,
    honorRutinPercent,
    isHonorRutinExceeded,
    hasKemenagApproval: transactions.some((t) => t.statusApprovalKemenag),
    operatorItHonorMonthly: avgOperatorItMonthly,
    operatorItPercentOfUmk,
    isOperatorItValid,
    totalGoodsServicesSpent,
    totalPdnSpent,
    pdnPercent,
    isPdnValid,
    totalUmkmSpent,
    umkmPercent,
    isUmkmValid,
    prohibitedCount,
    overallScore: score,
    complianceStatus,
  };
}
