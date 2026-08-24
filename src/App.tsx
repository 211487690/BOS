import React, { useState, useEffect, useMemo } from 'react';
import {
  MadrasahProfile,
  RkamItem,
  Transaction,
  SubCategoryItem,
  JuknisRulesCompliance,
} from './types/bos';
import {
  INITIAL_MADRASAH_PROFILE,
  INITIAL_RKAM_ITEMS,
  INITIAL_TRANSACTIONS,
  INITIAL_SUB_CATEGORIES,
} from './data/initialData';
import { calculateComplianceMetrics } from './services/complianceEngine';
import { HeaderNav } from './components/HeaderNav';
import { Navigation } from './components/Navigation';
import { TabDashboard } from './components/TabDashboard';
import { TabRkam } from './components/TabRkam';
import { TabBkuTransactions } from './components/TabBkuTransactions';
import { TabAutomaticReports } from './components/TabAutomaticReports';
import { TabAuditCompliance } from './components/TabAuditCompliance';
import { TabTaxSimulator } from './components/TaxSimulator';
import { TabPublicTransparency } from './components/TabPublicTransparency';
import { TabSettingsProfile } from './components/TabSettingsProfile';
import { SubCategoryManagerModal } from './components/SubCategoryManagerModal';
import { downloadJsonFile } from './utils/formatters';

const STORAGE_KEY_PROFILE = 'bos_berkibar_profile_2026';
const STORAGE_KEY_RKAM = 'bos_berkibar_rkam_2026';
const STORAGE_KEY_TRANSACTIONS = 'bos_berkibar_tx_2026';
const STORAGE_KEY_SUBCATEGORIES = 'bos_berkibar_subcategories_2026';

export default function App() {
  // Load initial state from LocalStorage or Fallback to pre-populated 2026 sample data
  const [profile, setProfile] = useState<MadrasahProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_MADRASAH_PROFILE;
  });

  const [rkamItems, setRkamItems] = useState<RkamItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RKAM);
    return saved ? JSON.parse(saved) : INITIAL_RKAM_ITEMS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SUBCATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_SUB_CATEGORIES;
  });

  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RKAM, JSON.stringify(rkamItems));
  }, [rkamItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBCATEGORIES, JSON.stringify(subCategories));
  }, [subCategories]);

  // Compute Balances (BKU, Bank, Kas Tunai)
  const { saldoBku, saldoKas, saldoBank } = useMemo(() => {
    let masukTotal = 0;
    let keluarTotal = 0;
    let bankMasuk = 0;
    let bankKeluar = 0;

    transactions.forEach((t) => {
      if (t.jenis === 'MASUK') {
        masukTotal += t.nominal;
        if (t.metodePembayaran === 'TRANSFER' || t.metodePembayaran === 'SIPLAH_E_PURCHASING') {
          bankMasuk += t.nominal;
        }
      } else {
        keluarTotal += t.nominal;
        if (t.metodePembayaran === 'TRANSFER' || t.metodePembayaran === 'SIPLAH_E_PURCHASING') {
          bankKeluar += t.nominal;
        }
      }
    });

    const bku = masukTotal - keluarTotal;
    const bank = bankMasuk - bankKeluar;
    const kas = bku - bank;

    return { saldoBku: bku, saldoKas: kas, saldoBank: bank };
  }, [transactions]);

  // Compute Juknis 2026 Compliance Metrics
  const compliance: JuknisRulesCompliance = useMemo(() => {
    return calculateComplianceMetrics(transactions, profile, rkamItems);
  }, [transactions, profile, rkamItems]);

  // Transaction Handlers
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `TX-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleEditTransaction = (id: string, updatedTxData: Omit<Transaction, 'id'>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...updatedTxData, id } : t))
    );
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi BKU ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // RKAM Handlers
  const handleAddRkamItem = (newItemData: Omit<RkamItem, 'id'>) => {
    const newItem: RkamItem = {
      ...newItemData,
      id: `RKAM-${Date.now()}`,
    };
    setRkamItems((prev) => [...prev, newItem]);
  };

  const handleEditRkamItem = (id: string, updatedItemData: Omit<RkamItem, 'id'>) => {
    setRkamItems((prev) =>
      prev.map((item) => (item.id === id ? { ...updatedItemData, id } : item))
    );
  };

  const handleDeleteRkamItem = (id: string) => {
    if (window.confirm('Hapus program anggaran RKAM ini?')) {
      setRkamItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // SubCategory Handlers
  const handleAddSubCategory = (newItem: Omit<SubCategoryItem, 'id'>) => {
    const item: SubCategoryItem = {
      ...newItem,
      id: `SUBCAT-${Date.now()}`,
    };
    setSubCategories((prev) => [...prev, item]);
  };

  const handleEditSubCategory = (id: string, updatedItem: Omit<SubCategoryItem, 'id'>) => {
    setSubCategories((prev) =>
      prev.map((s) => (s.id === id ? { ...updatedItem, id } : s))
    );
  };

  const handleDeleteSubCategory = (id: string) => {
    const target = subCategories.find((s) => s.id === id);
    if (!target) return;
    if (window.confirm(`Hapus Komponen Sub-Kategori "${target.name}"?`)) {
      setSubCategories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Profile Update
  const handleUpdateProfile = (updatedProfile: MadrasahProfile) => {
    setProfile(updatedProfile);
  };

  // Toggle Override Approval for Honor > 60%
  const handleToggleKemenagApproval = () => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.subCategory === 'Honor Rutin (Pendidik/Tenaga Kependidikan Non-ASN)'
          ? { ...t, statusApprovalKemenag: !t.statusApprovalKemenag }
          : t
      )
    );
  };

  // Export / Import JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      profile,
      rkamItems,
      transactions,
      subCategories,
    };
    downloadJsonFile(
      backupData,
      `BOS-BERKIBAR-BACKUP-${profile.namaMadrasah.replace(/\s+/g, '-')}-2026.json`
    );
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.profile && data.transactions) {
          setProfile(data.profile);
          if (data.rkamItems) setRkamItems(data.rkamItems);
          if (data.subCategories) setSubCategories(data.subCategories);
          setTransactions(data.transactions);
          alert('✅ Database BKU, RKAM, & Sub-Kategori berhasil dipulihkan!');
        } else {
          alert('❌ Format file JSON tidak valid untuk BOS-BERKIBAR.');
        }
      } catch (err) {
        alert('❌ Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin memulihkan seluruh data ke Sample Data BOS 2026 awal?'
      )
    ) {
      setProfile(INITIAL_MADRASAH_PROFILE);
      setRkamItems(INITIAL_RKAM_ITEMS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSubCategories(INITIAL_SUB_CATEGORIES);
      localStorage.clear();
      alert('✅ Database dipulihkan ke Sample Data 2026!');
    }
  };

  const warningCount = compliance.prohibitedCount + (compliance.isHonorRutinExceeded ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#3E3D39] flex flex-col font-sans selection:bg-[#C5D3A2] selection:text-[#2D3E28]">
      {/* Header Bar */}
      <HeaderNav
        profile={profile}
        compliance={compliance}
        saldoBku={saldoBku}
        saldoKas={saldoKas}
        saldoBank={saldoBank}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpdateProfile={handleUpdateProfile}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
      />

      {/* Main Tab Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} warningCount={warningCount} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <TabDashboard
            profile={profile}
            compliance={compliance}
            transactions={transactions}
            saldoBku={saldoBku}
            saldoKas={saldoKas}
            saldoBank={saldoBank}
            onOpenNewTransactionModal={() => setActiveTab('bku')}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'rkam' && (
          <TabRkam
            rkamItems={rkamItems}
            profile={profile}
            transactions={transactions}
            subCategories={subCategories}
            onAddRkamItem={handleAddRkamItem}
            onEditRkamItem={handleEditRkamItem}
            onDeleteRkamItem={handleDeleteRkamItem}
            onOpenSubCategoryManager={() => setIsSubCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'bku' && (
          <TabBkuTransactions
            transactions={transactions}
            rkamItems={rkamItems}
            profile={profile}
            saldoBku={saldoBku}
            subCategories={subCategories}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenSubCategoryManager={() => setIsSubCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <TabAutomaticReports
            profile={profile}
            transactions={transactions}
            compliance={compliance}
            saldoBku={saldoBku}
            saldoKas={saldoKas}
            saldoBank={saldoBank}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'audit' && (
          <TabAuditCompliance
            compliance={compliance}
            profile={profile}
            transactions={transactions}
            onToggleKemenagApproval={handleToggleKemenagApproval}
          />
        )}

        {activeTab === 'tax_sim' && <TabTaxSimulator />}

        {activeTab === 'public' && (
          <TabPublicTransparency
            profile={profile}
            compliance={compliance}
            transactions={transactions}
            saldoBku={saldoBku}
          />
        )}

        {activeTab === 'settings' && (
          <TabSettingsProfile
            profile={profile}
            subCategories={subCategories}
            onUpdateProfile={handleUpdateProfile}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetData={handleResetData}
            onOpenSubCategoryManager={() => setIsSubCategoryModalOpen(true)}
          />
        )}
      </main>

      {/* Global SubCategory Management Modal */}
      <SubCategoryManagerModal
        isOpen={isSubCategoryModalOpen}
        onClose={() => setIsSubCategoryModalOpen(false)}
        subCategories={subCategories}
        onAddSubCategory={handleAddSubCategory}
        onEditSubCategory={handleEditSubCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
      />

      {/* Footer */}
      <footer className="bg-[#083838] text-[#99F6E4] py-6 text-center text-xs border-t border-[#0F766E] print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-white">
            Aplikasi Pengelolaan BOS &copy; 2026
          </p>
          <p className="text-[#CCFBF1]/80">
            Developer By Moh. Umar Jaelani, S.Pd.I.,Gr.
          </p>
        </div>
      </footer>
    </div>
  );
}
