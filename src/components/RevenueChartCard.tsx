import React, { useState, useEffect } from 'react';
import { REVENUE_BY_RANGE, RevenueRange } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

interface RevenueChartCardProps {
  range: RevenueRange;
  onRangeChange: (range: RevenueRange) => void;
}

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({
  range,
  onRangeChange,
}) => {
  const config = REVENUE_BY_RANGE[range];
  const [selectedIndex, setSelectedIndex] = useState<number>(config.defaultActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(REVENUE_BY_RANGE[range].defaultActiveIndex);
    setHoveredIndex(null);
  }, [range]);

  const points = config.points;
  const activeIndex = Math.min(
    points.length - 1,
    hoveredIndex !== null ? hoveredIndex : selectedIndex
  );
  const activePoint = points[activeIndex];

  const formatTick = (val: number) => {
    if (val === 0) return '$0';
    const k = val / 1000;
    const formatted = Number.isInteger(k) ? String(k) : k.toFixed(1).replace('.', ',');
    return `$${formatted}rb`;
  };


  // Tooltip horizontal positioning
  const totalCols = points.length;
  const tooltipLeftPercent =
    activeIndex >= totalCols * 0.65
      ? ((activeIndex - (range === '7 Hari' ? 1.55 : 5.5)) / totalCols) * 100
      : ((activeIndex + (range === '7 Hari' ? 0.7 : 1.2)) / totalCols) * 100;
  const barTopPercentFromBottom = (activePoint.revenue / config.yMax) * 100;
  const tooltipBottomPercent = Math.min(48, Math.max(14, barTopPercentFromBottom - 30));

  // For 30-day X axis, display crisp evenly spaced date labels so they never crowd
  const shouldShowXLabel = (idx: number) => {
    if (range === '7 Hari') return true;
    return idx === 0 || idx === 5 || idx === 10 || idx === 15 || idx === 20 || idx === 25 || idx === 29;
  };

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-medium text-[#f2f2f0] tracking-[-0.01em]">
            Pendapatan
          </h2>
          <InfoIcon tooltip="Grafik pendapatan harian berdasarkan rentang 7 hari atau 30 hari terakhir." />
          <span className="text-[11.5px] text-[#888884] ml-1 tabular-nums">
            {config.totalFormatted} dalam {config.subtitle}
          </span>
        </div>

        {/* 7 Hari / 30 Hari Toggle */}
        <div className="flex items-center bg-[#232321] border border-white/[0.05] rounded-full p-[3px]">
          {(['7 Hari', '30 Hari'] as const).map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange(r)}
                className={`px-[12px] py-[4px] rounded-full text-[11px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#484846] text-[#f2f2f0] font-medium'
                    : 'text-[#8a8a86] hover:text-[#d4d4d0]'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex mt-[16px] flex-1 min-h-[232px]">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between pr-[14px] pb-[22px] pt-[2px] text-right select-none shrink-0 w-[52px]">
          {config.yTicks.map((tick) => (
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
          <div className="relative flex-1">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {config.yTicks.map((tick) => (
                <div key={tick} className="w-full h-[1px] bg-white/[0.06]" />
              ))}
            </div>


            {/* Daily Bars */}
            <div
              className="relative z-10 grid h-full items-end px-[10px]"
              style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
            >
              {points.map((pt, idx) => {
                const heightPct = Math.max(5, (pt.revenue / config.yMax) * 100);
                const isHighlighted = hoveredIndex === null || hoveredIndex === idx;
                const isHoveredBar = hoveredIndex === idx;
                const barWidthClass = range === '7 Hari' ? 'w-[42px]' : 'w-[22px]';
                return (
                  <div
                    key={pt.label}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onClick={() => setSelectedIndex(idx)}
                    className="h-full flex items-end justify-center cursor-pointer group"
                  >
                    <div
                      className={`${barWidthClass} rounded-t-[7px] relative overflow-hidden transition-all duration-200 ${
                        isHoveredBar ? 'shadow-[0_0_24px_rgba(255,255,255,0.14)]' : ''
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {isHighlighted ? (
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
                              id={`hatch-${range}-${idx}`}
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
                            fill={`url(#hatch-${range}-${idx})`}
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

            {/* Floating Tooltip Card (appears only on hover) */}
            {hoveredIndex !== null && (
              <div
                className="absolute z-30 w-[176px] rounded-[14px] bg-[#ededeb] text-[#141414] px-[14px] py-[11px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] pointer-events-none transition-all duration-150"
                style={{
                  left: `${Math.max(2, Math.min(78, tooltipLeftPercent))}%`,
                  bottom: `${tooltipBottomPercent}%`,
                }}
              >
                <div className="text-[12px] font-semibold text-[#141414] mb-[8px]">
                  {activePoint.fullLabel}
                </div>
                <div className="space-y-[4px] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6a6a66]">Pendapatan</span>
                    <span className="font-semibold text-[#141414] tabular-nums">
                      ${activePoint.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6a6a66]">Transaksi</span>
                    <span className="font-semibold text-[#141414] tabular-nums">
                      {activePoint.transactions.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* X-Axis Labels */}
          <div
            className="grid px-[10px] pt-[8px] h-[22px]"
            style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
          >
            {points.map((pt, idx) => {
              const isHoveredLabel = hoveredIndex === idx;
              const visible = shouldShowXLabel(idx) || isHoveredLabel;
              return (
                <button
                  key={pt.label}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`text-center text-[10.5px] leading-none cursor-pointer transition-colors whitespace-nowrap ${
                    isHoveredLabel
                      ? 'text-[#f2f2f0] font-semibold'
                      : visible
                      ? hoveredIndex !== null
                        ? 'text-[#555552]'
                        : 'text-[#888884] hover:text-[#b8b8b4]'
                      : 'text-transparent'
                  }`}
                >
                  {pt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
