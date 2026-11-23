import React, { useState, useRef, useEffect } from 'react';
import { BarChart2, Download, User } from 'lucide-react';
import {
  PERIOD_DATA,
  PeriodFilter,
  RevenueRange,
  NavTab,
  exportDashboardCsv,
} from './data/dashboardData';
import { SidebarNav } from './components/SidebarNav';
import { KpiCards } from './components/KpiCards';
import { RevenueChartCard } from './components/RevenueChartCard';
import { VisitsByTimeCard } from './components/VisitsByTimeCard';
import { TotalVisitsCard } from './components/TotalVisitsCard';
import { SecondaryView } from './components/SecondaryView';

const PERIOD_FILTERS: PeriodFilter[] = ['Hari Ini', '7 Hari', '30 Hari'];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dasbor');
  const [period, setPeriod] = useState<PeriodFilter>('30 Hari');
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('30 Hari');
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePeriodChange = (next: PeriodFilter) => {
    setPeriod(next);
    if (next === '7 Hari' || next === '30 Hari') {
      setRevenueRange(next);
    }
  };

  const dataset = PERIOD_DATA[period];

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] overflow-x-hidden">
      {/* Main Content Shell aligned for 1664x936 desktop with left centered icon-only pill sidebar */}
      <div className="relative w-full max-w-[1664px] mx-auto pl-[124px] pr-[52px] pt-[24px] pb-[22px]">
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {activeTab === 'Dasbor' ? (
          <main>
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <h1 className="text-[31px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none">
                Dasbor
              </h1>

              {/* Account Icon Button */}
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-label="Akun pengguna"
                  className="w-[38px] h-[38px] rounded-full bg-[#21211f] border border-white/[0.08] flex items-center justify-center text-[#ededeb] hover:border-white/[0.18] hover:text-white transition-colors cursor-pointer"
                >
                  <User className="w-[16px] h-[16px]" strokeWidth={1.8} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[46px] z-50 w-[215px] rounded-[16px] bg-[#20201e] border border-white/[0.08] p-3.5 shadow-2xl">
                    <div className="text-[12.5px] font-semibold text-[#f2f2f0]">Maya Ross</div>
                    <div className="text-[11px] text-[#888884] mb-2.5">maya@orpheus.co</div>
                    <div className="border-t border-white/[0.07] pt-2 text-[11.5px] text-[#888884]">
                      Ruang Kerja: Orpheus
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sub-navigation & Action Toolbar */}
            <div className="flex items-center justify-between mt-[16px]">
              {/* Period Filter Segmented Pill: Hari Ini | 7 Hari | 30 Hari */}
              <div className="inline-flex items-center bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[2px]">
                {PERIOD_FILTERS.map((item) => {
                  const isActive = period === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePeriodChange(item)}
                      className={`px-[15px] py-[5.5px] rounded-full text-[12px] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#545452] text-[#f3f3f1] font-medium'
                          : 'text-[#9a9a96] hover:text-[#dcdcd8] font-normal'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-[9px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('Analisis')}
                  className="inline-flex items-center gap-[7px] rounded-full bg-[#21211f] border border-white/[0.07] px-[15px] py-[7px] text-[12px] font-medium text-[#e5e5e2] hover:border-white/[0.15] hover:text-white transition-colors cursor-pointer"
                >
                  <BarChart2 className="w-[13.5px] h-[13.5px]" strokeWidth={1.8} />
                  <span>Analisis lengkap</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportDashboardCsv(period, revenueRange)}
                  className="inline-flex items-center gap-[6px] rounded-full bg-[#ededeb] px-[15px] py-[7px] text-[12px] font-semibold text-[#141414] hover:bg-white transition-colors cursor-pointer"
                >
                  <Download className="w-[13px] h-[13px]" strokeWidth={2} />
                  <span>Ekspor</span>
                </button>
              </div>
            </div>

            {/* Row 1: 4 Stepped-Tone KPI Cards */}
            <div className="mt-[16px]">
              <KpiCards data={dataset.kpis} onNavigate={setActiveTab} />
            </div>

            {/* Row 2: Full-width Revenue Bar Chart (7 Hari / 30 Hari) */}
            <div className="mt-[16px] h-[356px]">
              <RevenueChartCard
                range={revenueRange}
                onRangeChange={setRevenueRange}
              />
            </div>

            {/* Row 3: Transactions by Time Heatmap & Total Transactions Donut */}
            <div className="grid grid-cols-12 gap-[14px] mt-[16px]">
              <div className="col-span-7 h-[252px]">
                <VisitsByTimeCard data={dataset.heatmap} />
              </div>
              <div className="col-span-5 h-[252px]">
                <TotalVisitsCard data={dataset.totalTransactions} />
              </div>
            </div>
          </main>
        ) : (
          <SecondaryView
            tab={activeTab}
            onBackToDashboard={() => setActiveTab('Dasbor')}
          />
        )}
      </div>
    </div>
  );
}
