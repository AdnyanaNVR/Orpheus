import React, { useState } from 'react';
import {
  PERIOD_DATA,
  PeriodFilter,
  RevenueRange,
  NavTab,
} from './data/dashboardData';
import { SidebarNav } from './components/SidebarNav';
import { TopSectionBar } from './components/TopSectionBar';
import { KpiCards } from './components/KpiCards';
import { RevenueChartCard } from './components/RevenueChartCard';
import { VisitsByTimeCard } from './components/VisitsByTimeCard';
import { TotalVisitsCard } from './components/TotalVisitsCard';
import { KasirView } from './components/KasirView';
import { ProdukView } from './components/ProdukView';
import { TransaksiView } from './components/TransaksiView';
import { PengaturanView } from './components/PengaturanView';

const PERIOD_FILTERS: PeriodFilter[] = ['Hari Ini', '7 Hari', '30 Hari'];
const STORE_NAME_STORAGE_KEY = 'orpheus_store_name';

function getInitialStoreName(): string {
  try {
    const saved = window.localStorage.getItem(STORE_NAME_STORAGE_KEY);
    return saved && saved.trim() ? saved.trim() : 'Orpheus Shop';
  } catch {
    return 'Orpheus Shop';
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dasbor');
  const [period, setPeriod] = useState<PeriodFilter>('Hari Ini');
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('7 Hari');
  const [storeName, setStoreName] = useState<string>(getInitialStoreName);

  const handleSaveStoreName = (nextName: string) => {
    const trimmed = nextName.trim();
    if (!trimmed) return;
    setStoreName(trimmed);
    try {
      window.localStorage.setItem(STORE_NAME_STORAGE_KEY, trimmed);
    } catch {
      // ignore storage errors
    }
  };

  const handlePeriodChange = (next: PeriodFilter) => {
    setPeriod(next);
    if (next === '7 Hari' || next === '30 Hari') {
      setRevenueRange(next);
    }
  };

  const dataset = PERIOD_DATA[period];

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] overflow-x-clip">
      <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Monochrome Floating Top Pill matching center container width */}
      <TopSectionBar storeName={storeName} onNavigate={setActiveTab} />

      {/* Main Content Shell with equal 28px clearance from left navbar (88px) and right edge */}
      <div className="relative w-full pl-[88px] sm:pl-[116px] pr-[16px] sm:pr-[28px] pt-[102px] pb-[20px]">
        <div key={activeTab}>
          {activeTab === 'Dasbor' ? (
            <main>
              {/* Title Row */}
              <div
                className="flex items-center justify-between animate-tab-up"
                style={{ animationDelay: '0ms' }}
              >
                <h1 className="text-[40px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.05]">
                  Dasbor
                </h1>
              </div>

              {/* Sub-navigation & Action Toolbar */}
              <div
                className="flex items-center justify-between gap-3 mt-[14px] animate-tab-up"
                style={{ animationDelay: '80ms' }}
              >
                {/* Period Filter Segmented Pill: Hari Ini | 7 Hari | 30 Hari */}
                <div className="inline-flex items-center bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[2px] shrink-0">
                  {PERIOD_FILTERS.map((item) => {
                    const isActive = period === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePeriodChange(item)}
                        className={`px-[15px] py-[5.5px] rounded-full text-[12px] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#545452] text-[#f3f3f1] font-medium shadow-sm'
                            : 'text-[#9a9a96] hover:text-[#dcdcd8] font-normal'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 1: 4 Stepped-Tone KPI Cards */}
              <div key={`kpi-${period}`} className="mt-[14px]">
                <KpiCards data={dataset.kpis} onNavigate={setActiveTab} />
              </div>

              {/* Row 2: Full-width Revenue Bar Chart (7 Hari / 30 Hari) */}
              <div
                key={`revenue-${period}`}
                className="mt-[14px] h-[288px] animate-tab-up"
                style={{ animationDelay: '400ms' }}
              >
                <RevenueChartCard
                  range={revenueRange}
                  onRangeChange={setRevenueRange}
                />
              </div>

              {/* Row 3: Transactions by Time Heatmap & Total Transactions Donut */}
              <div
                key={`charts-${period}`}
                className="grid grid-cols-12 gap-[14px] mt-[14px]"
              >
                <div
                  className="col-span-12 lg:col-span-7 h-[228px] animate-tab-up"
                  style={{ animationDelay: '490ms' }}
                >
                  <VisitsByTimeCard data={dataset.heatmap} />
                </div>
                <div
                  className="col-span-12 lg:col-span-5 h-[228px] animate-tab-up"
                  style={{ animationDelay: '580ms' }}
                >
                  <TotalVisitsCard data={dataset.totalTransactions} />
                </div>
              </div>
            </main>
          ) : activeTab === 'Kasir' ? (
            <KasirView />
          ) : activeTab === 'Produk' ? (
            <ProdukView />
          ) : activeTab === 'Transaksi' ? (
            <TransaksiView storeName={storeName} />
          ) : (
            <PengaturanView
              storeName={storeName}
              onSaveStoreName={handleSaveStoreName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
