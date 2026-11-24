import React, { useState } from 'react';
import {
  LayoutGrid,
  Calculator,
  Package,
  ReceiptText,
  BarChart2,
  Settings,
} from 'lucide-react';
import { NavTab } from '../data/dashboardData';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const SIDEBAR_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { id: 'Dasbor', label: 'Dasbor', icon: LayoutGrid },
  { id: 'Kasir', label: 'Kasir', icon: Calculator },
  { id: 'Produk', label: 'Produk', icon: Package },
  { id: 'Transaksi', label: 'Transaksi', icon: ReceiptText },
  { id: 'Analisis', label: 'Analisis', icon: BarChart2 },
  { id: 'Pengaturan', label: 'Pengaturan', icon: Settings },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onSelectTab }) => {
  const [hoveredItem, setHoveredItem] = useState<NavTab | null>(null);

  return (
    <aside
      aria-label="Menu Sidebar"
      className="fixed left-[12px] sm:left-[24px] top-1/2 -translate-y-1/2 z-40"
    >
      <div className="w-[64px] rounded-full bg-[#1c1c1a]/95 backdrop-blur-md border border-white/[0.08] py-[16px] flex flex-col items-center gap-[14px] shadow-[0_14px_36px_rgba(0,0,0,0.55)]">
        {SIDEBAR_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showDividerBefore = idx === SIDEBAR_ITEMS.length - 1;

          return (
            <React.Fragment key={item.id}>
              {showDividerBefore && (
                <div className="w-[28px] h-[1px] bg-[#343431] -my-[2px]" />
              )}
              <div
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#ededeb] text-[#141414]'
                      : 'text-[#b5b5b0] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2 : 1.75} />
                </button>

                {hoveredItem === item.id && (
                  <span className="absolute left-[58px] whitespace-nowrap rounded-full bg-[#252523] border border-white/[0.1] px-3 py-1.5 text-[11.5px] font-medium text-[#f2f2f0] shadow-xl pointer-events-none">
                    {item.label}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
};
