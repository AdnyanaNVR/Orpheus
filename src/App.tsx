import React, { useState } from 'react';
import { BarChart2, Download } from 'lucide-react';
import {
  PERIOD_DATA,
  PeriodFilter,
  RevenueRange,
  NavTab,
  exportDashboardCsv,
} from './data/dashboardData';
import { SidebarNav } from './components/SidebarNav';
import { TopSectionBar } from './components/TopSectionBar';
import { KpiCards } from './components/KpiCards';
import { RevenueChartCard } from './components/RevenueChartCard';
import { VisitsByTimeCard } from './components/VisitsByTimeCard';
import { TotalVisitsCard } from './components/TotalVisitsCard';
import { SecondaryView } from './components/SecondaryView';

const PERIOD_FILTERS: PeriodFilter[] = ['Hari Ini', '7 Hari', '30 Hari'];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dasbor');
  const [period, setPeriod] = useState<PeriodFilter>('Hari Ini');
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('7 Hari');

  const handlePeriodChange = (next: PeriodFilter) => {
    setPeriod(next);
    if (next === '7 Hari' || next === '30 Hari') {
      setRevenueRange(next);
    }
  };

  const dataset = PERIOD_DATA[period];

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] overflow-x-hidden">
      <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Monochrome Floating Top Pill matching center container width */}
      <TopSectionBar onNavigate={setActiveTab} />

      {/* Main Content Shell with equal 28px clearance from left navbar (88px) and right edge */}
      <div className="relative w-full pl-[88px] sm:pl-[116px] pr-[16px] sm:pr-[28px] pt-[102px] pb-[20px]">
        {activeTab === 'Dasbor' ? (
          <main>
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <h1 className="text-[40px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.05]">
                Dasbor
              </h1>
            </div>

            {/* Sub-navigation & Action Toolbar */}
            <div className="flex items-center justify-between gap-3 mt-[14px]">
              {/* Period Filter Segmented Pill: Hari Ini | 7 Hari | 30 Hari */}
              <div className="inline-flex items-center bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[2px] shrink-0">
                {PERIOD_FILTERS.map((item) => {
                  const isActive = period === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePeriodChange(item)}
                      className={`px-[15px] py-[5.5px] rounded-full text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
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
              <div className="flex items-center gap-[9px] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('Analisis')}
                  className="inline-flex items-center gap-[7px] rounded-full bg-[#21211f] border border-white/[0.07] px-[15px] py-[7px] text-[12px] font-medium text-[#e5e5e2] hover:border-white/[0.15] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BarChart2 className="w-[13.5px] h-[13.5px] shrink-0" strokeWidth={1.8} />
                  <span>Analisis lengkap</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportDashboardCsv(period, revenueRange)}
                  className="inline-flex items-center gap-[6px] rounded-full bg-[#ededeb] px-[15px] py-[7px] text-[12px] font-semibold text-[#141414] hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-[13px] h-[13px] shrink-0" strokeWidth={2} />
                  <span>Ekspor</span>
                </button>
              </div>
            </div>

            {/* Row 1: 4 Stepped-Tone KPI Cards */}
            <div className="mt-[14px]">
              <KpiCards data={dataset.kpis} onNavigate={setActiveTab} />
            </div>

            {/* Row 2: Full-width Revenue Bar Chart (7 Hari / 30 Hari) */}
            <div className="mt-[14px] h-[288px]">
              <RevenueChartCard
                range={revenueRange}
                onRangeChange={setRevenueRange}
              />
            </div>

            {/* Row 3: Transactions by Time Heatmap & Total Transactions Donut */}
            <div className="grid grid-cols-12 gap-[14px] mt-[14px]">
              <div className="col-span-12 lg:col-span-7 h-[228px]">
                <VisitsByTimeCard data={dataset.heatmap} />
              </div>
              <div className="col-span-12 lg:col-span-5 h-[228px]">
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
