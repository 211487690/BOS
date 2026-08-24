import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  BookOpenCheck,
  FileSpreadsheet,
  ShieldAlert,
  Percent,
  Eye,
  Settings,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  warningCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, warningCount }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'rkam', label: 'RKAM', icon: Calculator },
    { id: 'bku', label: 'Pencatatan BKU', icon: BookOpenCheck },
    { id: 'reports', label: 'Laporan Otomatis (K-7a)', icon: FileSpreadsheet },
    { id: 'audit', label: 'Audit Kepatuhan', icon: ShieldAlert, badge: warningCount },
    { id: 'tax_sim', label: 'Kalkulator Pajak', icon: Percent },
    { id: 'public', label: 'Portal Transparansi', icon: Eye },
    { id: 'settings', label: 'Pengaturan Profile', icon: Settings },
  ];

  return (
    <nav className="bg-[#0D4D4D] border-b border-[#0F5B5B] sticky top-[61px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-[#0F5B5B] shadow-sm border-l-4 border-[#2DD4BF] scale-[1.01]'
                    : 'text-[#99F6E4] hover:text-white hover:bg-[#0F5B5B]/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F5B5B]' : 'text-[#2DD4BF]'}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[#EF4444] text-white font-black animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
