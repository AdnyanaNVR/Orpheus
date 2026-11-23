import React, { useState } from 'react';
import { Clock, BarChart2, Download } from 'lucide-react';
import {
  CHANNEL_DATA,
  ChannelFilter,
  NavTab,
  exportDashboardCsv,
} from './data/dashboardData';
import { TopNav } from './components/TopNav';
import { SideToolbar, SidebarTool } from './components/SideToolbar';
import { KpiCards } from './components/KpiCards';
import { SalesPerformanceCard } from './components/SalesPerformanceCard';
import { RevenueChartCard } from './components/RevenueChartCard';
import { VisitsByTimeCard } from './components/VisitsByTimeCard';
import { TotalVisitsCard } from './components/TotalVisitsCard';
import { SecondaryView } from './components/SecondaryView';

const CHANNEL_FILTERS: ChannelFilter[] = ['Overview', 'Online', 'In store'];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Dashboard');
  const [channel, setChannel] = useState<ChannelFilter>('Overview');
  const [year, setYear] = useState<'2025' | '2026'>('2026');
  const [activeTool, setActiveTool] = useState<SidebarTool>(null);

  const dataset = CHANNEL_DATA[channel];

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] overflow-x-hidden">
      {/* Main Content Shell aligned for 1664x936 desktop */}
      <div className="relative w-full max-w-[1664px] mx-auto pl-[124px] pr-[52px] pb-[20px]">
        {/* Left Floating Vertical Toolbar */}
        <SideToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

        <TopNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {activeTab === 'Dashboard' ? (
          <main>
            {/* Title Row */}
            <div className="flex items-center justify-between mt-[10px]">
              <h1 className="text-[31px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none">
                Dashboard
              </h1>

              {/* Live Now Pill */}
              <div className="inline-flex items-center gap-[8px] rounded-full bg-[#dadad5] px-[13px] py-[6px] text-[12px] text-[#141414]">
                <span className="w-[11px] h-[11px] rounded-full bg-[#b7bcc0] flex items-center justify-center shrink-0">
                  <span className="w-[5.5px] h-[5.5px] rounded-full bg-[#24303a]" />
                </span>
                <span className="font-semibold tabular-nums">{dataset.liveNow}</span>
                <span className="text-[#2f2f2c] font-normal">live now</span>
              </div>
            </div>

            {/* Sub-navigation & Action Toolbar */}
            <div className="flex items-center justify-between mt-[14px]">
              {/* Channel Filter Segmented Pill */}
              <div className="inline-flex items-center bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[2px]">
                {CHANNEL_FILTERS.map((item) => {
                  const isActive = channel === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setChannel(item)}
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

              {/* Date Period Readout */}
              <div className="flex items-center gap-[6px] text-[11.5px] text-[#888884]">
                <Clock className="w-[12.5px] h-[12.5px] text-[#7c7c78]" strokeWidth={1.7} />
                <span>November 2026, month to date</span>
              </div>

              {/* Right Buttons */}
              <div className="flex items-center gap-[9px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('Analytics')}
                  className="inline-flex items-center gap-[7px] rounded-full bg-[#21211f] border border-white/[0.07] px-[15px] py-[7px] text-[12px] font-medium text-[#e5e5e2] hover:border-white/[0.15] hover:text-white transition-colors cursor-pointer"
                >
                  <BarChart2 className="w-[13.5px] h-[13.5px]" strokeWidth={1.8} />
                  <span>Full analytics</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportDashboardCsv(channel, year)}
                  className="inline-flex items-center gap-[6px] rounded-full bg-[#ededeb] px-[15px] py-[7px] text-[12px] font-semibold text-[#141414] hover:bg-white transition-colors cursor-pointer"
                >
                  <Download className="w-[13px] h-[13px]" strokeWidth={2} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Row 1: 4 Stepped-Tone KPI Cards */}
            <div className="mt-[14px]">
              <KpiCards data={dataset.kpis} onNavigate={setActiveTab} />
            </div>

            {/* Row 2: Sales Performance (Left) & Revenue Bar Chart (Right) */}
            <div className="grid grid-cols-12 gap-[14px] mt-[14px]">
              <div className="col-span-4 h-[314px]">
                <SalesPerformanceCard data={dataset.performance} />
              </div>
              <div className="col-span-8 h-[314px]">
                <RevenueChartCard
                  data={dataset.revenueChart}
                  channel={channel}
                  year={year}
                  onYearChange={setYear}
                />
              </div>
            </div>

            {/* Row 3: Visits by Time Heatmap (Left) & Total Visits Donut (Right) */}
            <div className="grid grid-cols-12 gap-[14px] mt-[14px]">
              <div className="col-span-7 h-[234px]">
                <VisitsByTimeCard data={dataset.heatmap} />
              </div>
              <div className="col-span-5 h-[234px]">
                <TotalVisitsCard data={dataset.totalVisits} />
              </div>
            </div>
          </main>
        ) : (
          <SecondaryView
            tab={activeTab}
            onBackToDashboard={() => setActiveTab('Dashboard')}
          />
        )}
      </div>
    </div>
  );
}
