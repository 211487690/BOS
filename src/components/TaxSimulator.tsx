import React, { useState } from 'react';
import { Percent, Calculator, ArrowRight, Building, CheckCircle, Info } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const TabTaxSimulator: React.FC = () => {
  const [nominalGross, setNominalGross] = useState<number>(3500000);
  const [itemType, setItemType] = useState<'GOODS' | 'SERVICE' | 'LAND_BUILDING'>('GOODS');
  const [hasNpwp, setHasNpwp] = useState<boolean>(true);
  const [isPriceIncludesPpn, setIsPriceIncludesPpn] = useState<boolean>(true);

  // Tax Logic Calculations according to Juknis 2026:
  // PPN 12%: Exempt if gross < 2.000.000
  const isPpnApplicable = nominalGross >= 2000000 && itemType !== 'LAND_BUILDING';
  
  let dpp = nominalGross;
  let ppn = 0;

  if (isPpnApplicable) {
    if (isPriceIncludesPpn) {
      dpp = Math.round(nominalGross / 1.12);
      ppn = Math.round(dpp * 0.12);
    } else {
      dpp = nominalGross;
      ppn = Math.round(nominalGross * 0.12);
    }
  }

  // PPh 23: 2% (with NPWP) / 4% (without NPWP) on Services/Rent non-land
  let pph23 = 0;
  if (itemType === 'SERVICE') {
    const rate = hasNpwp ? 0.02 : 0.04;
    pph23 = Math.round(dpp * rate);
  }

  // PPh 4(2): 10% on Land / Building Rent
  let pph42 = 0;
  if (itemType === 'LAND_BUILDING') {
    pph42 = Math.round(nominalGross * 0.1);
  }

  // Bea Meterai: Rp 10.000 for gross >= 5.000.000
  const meterai = nominalGross >= 5000000 ? 10000 : 0;

  const totalPajak = ppn + pph23 + pph42 + meterai;
  const netPaidToVendor = isPriceIncludesPpn ? nominalGross - pph23 - pph42 : nominalGross + ppn - pph23 - pph42;

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D1E5E5]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md bg-[#CCFBF1] text-[#0F766E] text-xs font-bold border border-[#99F6E4]/50 uppercase tracking-wider">
              KALKULATOR SIMULASI PAJAK 2026
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0F2D2D] mt-2">Simulator & Hitung Otomatis Pajak Pengadaan</h2>
          <p className="text-xs text-[#526E6E] mt-1">
            Hitung DPP, PPN 12%, PPh 23, PPh 4(2), dan Bea Meterai transaksi SIPLah / Vendor Toko secara akurat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Inputs Column */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#0F2D2D] mb-1">Nominal Nilai Transaksi / Tagihan (Rp)</label>
              <input
                type="number"
                value={nominalGross}
                onChange={(e) => setNominalGross(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-[#D1E5E5] rounded-xl text-base font-extrabold text-[#0F2D2D] focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0F2D2D] mb-1">Jenis Objek Belanja / Pengadaan</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] font-semibold text-[#0F2D2D] bg-[#F2F8F8]"
              >
                <option value="GOODS">Barang Habis Pakai / ATK / Alat / Mesin (PPN 12% if ≥ 2 Jt)</option>
                <option value="SERVICE">Jasa / Servis / Cetak / Konsumsi / Transport (PPh 23 2%/4%)</option>
                <option value="LAND_BUILDING">Sewa Tanah / Gedung / Ruangan (PPh 4(2) 10%)</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNpwp}
                  onChange={(e) => setHasNpwp(e.target.checked)}
                  className="rounded text-[#0D9488] focus:ring-[#0D9488] accent-[#0D9488]"
                />
                <span className="font-semibold text-[#0F2D2D]">Vendor Memiliki NPWP (Tarif PPh23 2% vs 4%)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPriceIncludesPpn}
                  onChange={(e) => setIsPriceIncludesPpn(e.target.checked)}
                  className="rounded text-[#0D9488] focus:ring-[#0D9488] accent-[#0D9488]"
                />
                <span className="font-semibold text-[#0F2D2D]">Harga Kwitansi Sudah Termasuk PPN (Include PPN)</span>
              </label>
            </div>
          </div>

          {/* Results Display Card */}
          <div className="bg-[#083838] text-white rounded-2xl p-6 shadow-xl space-y-4 border border-[#0F766E]">
            <div className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Rincian Potongan Pajak & Net Bayar
            </div>

            <div className="space-y-2 border-b border-[#0F766E] pb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-[#CCFBF1]/80">Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-bold">{formatRupiah(dpp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#CCFBF1]/80">PPN (12%):</span>
                <span className="font-bold text-[#2DD4BF]">{formatRupiah(ppn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#CCFBF1]/80">PPh 23 (2% / 4%):</span>
                <span className="font-bold text-[#93c5fd]">{formatRupiah(pph23)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#CCFBF1]/80">PPh 4(2) Sewa (10%):</span>
                <span className="font-bold text-[#d8b4fe]">{formatRupiah(pph42)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#CCFBF1]/80">Bea Meterai Dokumen:</span>
                <span className="font-bold text-[#fde047]">{formatRupiah(meterai)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[#CCFBF1]">Total Potongan Pajak:</span>
                <span className="font-black text-[#fca5a5] text-base">{formatRupiah(totalPajak)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#0F766E]">
                <span className="font-bold text-[#2DD4BF]">Transfer Bersih ke Vendor:</span>
                <span className="font-black text-[#2DD4BF] text-lg">{formatRupiah(netPaidToVendor)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
