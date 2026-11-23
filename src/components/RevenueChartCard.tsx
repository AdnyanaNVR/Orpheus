import React, { useState } from 'react';
import { ChannelDataset, ChannelFilter } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

interface RevenueChartCardProps {
  data: ChannelDataset['revenueChart'];
  channel: ChannelFilter;
  year: '2025' | '2026';
  onYearChange: (year: '2025' | '2026') => void;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  data,
  channel,
  year,
  onYearChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(10); // Nov = index 10
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const points = year === '2026' ? data.data2026 : data.data2025;
  const ytdTotal = year === '2026' ? data.ytd2026 : data.ytd2025;
  const avgValue = year === '2026' ? data.avg2026 : data.avg2025;

  const yMax = channel === 'Overview' ? 60000 : channel === 'Online' ? 45000 : 15000;
  const yTicks =
    channel === 'Overview'
      ? [60000, 45000, 30000, 15000, 0]
      : channel === 'Online'
      ? [45000, 33750, 22500, 11250, 0]
      : [15000, 11250, 7500, 3750, 0];

  const formatTick = (val: number) => {
    if (val === 0) return '$0';
    const k = val / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  };

  const avgPercentFromBottom = Math.min(96, Math.max(4, (avgValue / yMax) * 100));
  const avgLabel = `avg $${(avgValue / 1000).toFixed(1)}k`;
  const activePoint = points[activeIndex] || points[10];

  // Position tooltip neatly left of the active bar (or right if early months)
  const tooltipLeftPercent =
    activeIndex >= 8
      ? ((activeIndex - 2.35) / 12) * 100
      : ((activeIndex + 0.85) / 12) * 100;
  const barTopPercentFromBottom = (activePoint.revenue / yMax) * 100;
  const tooltipBottomPercent = Math.min(44, Math.max(12, barTopPercentFromBottom - 36));

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-medium text-[#f2f2f0] tracking-[-0.01em]">
            Revenue
          </h2>
          <InfoIcon tooltip="Monthly net revenue compared against annual average and prior year." />
          <span className="text-[11.5px] text-[#888884] ml-1 tabular-nums">
            {ytdTotal} so far this year
          </span>
        </div>

        {/* Year Toggle */}
        <div className="flex items-center bg-[#232321] border border-white/[0.05] rounded-full p-[3px]">
          {(['2025', '2026'] as const).map((y) => {
            const isActive = year === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(y)}
                className={`px-[12px] py-[4px] rounded-full text-[11px] transition-colors cursor-pointer tabular-nums ${
                  isActive
                    ? 'bg-[#484846] text-[#f2f2f0] font-medium'
                    : 'text-[#8a8a86] hover:text-[#d4d4d0]'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex mt-[14px] flex-1 min-h-[212px]">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between pr-[14px] pb-[22px] pt-[2px] text-right select-none shrink-0 w-[44px]">
          {yTicks.map((tick) => (
            <span key={tick} className="text-[10.5px] text-[#767672] leading-none tabular-nums">
              {formatTick(tick)}
            </span>
          ))}
        </div>

        {/* Plot Canvas */}
        <div
          className="relative flex-1 flex flex-col"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Plot Box (excludes month labels at bottom) */}
          <div className="relative flex-1">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yTicks.map((tick) => (
                <div key={tick} className="w-full h-[1px] bg-white/[0.06]" />
              ))}
            </div>

            {/* Dashed Average Line + Pill */}
            <div
              className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
              style={{ bottom: `${avgPercentFromBottom}%` }}
            >
              <div className="w-full border-t border-dashed border-white/[0.32]" />
              <span className="absolute right-0 translate-y-[-1px] rounded-full bg-[#2c2c2a] border border-white/[0.09] px-[9px] py-[3px] text-[10px] font-medium text-[#e5e5e2] leading-none whitespace-nowrap shadow-md tabular-nums">
                {avgLabel}
              </span>
            </div>

            {/* 12 Monthly Bars */}
            <div className="relative z-10 grid grid-cols-12 h-full items-end px-[10px]">
              {points.map((pt, idx) => {
                const heightPct = Math.max(4, (pt.revenue / yMax) * 100);
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={pt.month}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onClick={() => setSelectedIndex(idx)}
                    className="h-full flex items-end justify-center cursor-pointer group"
                  >
                    <div
                      className={`w-[24px] rounded-t-[7px] relative overflow-hidden transition-all duration-200 ${
                        isActive ? 'shadow-[0_0_24px_rgba(255,255,255,0.08)]' : ''
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {isActive ? (
                        <div
                          className="w-full h-full rounded-t-[7px]"
                          style={{
                            background:
                              'linear-gradient(180deg, #5c5c58 0%, #8f8f8c 32%, #d8d8d5 68%, #f5f5f3 100%)',
                          }}
                        />
                      ) : (
                        <svg width="100%" height="100%" className="block">
                          <defs>
                            <pattern
                              id={`hatch-${idx}`}
                              width="7"
                              height="7"
                              patternTransform="rotate(45 0 0)"
                              patternUnits="userSpaceOnUse"
                            >
                              <rect width="7" height="7" fill="#1d1d1b" />
                              <line
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="7"
                                stroke="#3b3b38"
                                strokeWidth="2.2"
                              />
                            </pattern>
                          </defs>
                          <rect
                            width="100%"
                            height="100%"
                            fill={`url(#hatch-${idx})`}
                            className="group-hover:opacity-90"
                          />
                          <rect
                            width="100%"
                            height="100%"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1"
                            rx="7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Tooltip Card (Defaults to Nov 2026) */}
            <div
              className="absolute z-30 w-[172px] rounded-[14px] bg-[#ededeb] text-[#141414] px-[14px] py-[11px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] pointer-events-none transition-all duration-150"
              style={{
                left: `${Math.max(2, Math.min(76, tooltipLeftPercent))}%`,
                bottom: `${tooltipBottomPercent}%`,
              }}
            >
              <div className="text-[12px] font-semibold text-[#141414] mb-[8px]">
                {activePoint.month} {year}
              </div>
              <div className="space-y-[4px] text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6a6a66]">Revenue</span>
                  <span className="font-semibold text-[#141414] tabular-nums">
                    ${activePoint.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6a6a66]">Orders</span>
                  <span className="font-semibold text-[#141414] tabular-nums">
                    {activePoint.orders.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6a6a66]">vs last year</span>
                  <span className="font-semibold text-[#1c6b45] tabular-nums">
                    {activePoint.vsLastYear}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* X-Axis Month Labels */}
          <div className="grid grid-cols-12 px-[10px] pt-[8px] h-[22px]">
            {points.map((pt, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={pt.month}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`text-center text-[10.5px] leading-none cursor-pointer transition-colors ${
                    isActive ? 'text-[#f2f2f0] font-semibold' : 'text-[#787874] hover:text-[#b8b8b4]'
                  }`}
                >
                  {pt.month}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
