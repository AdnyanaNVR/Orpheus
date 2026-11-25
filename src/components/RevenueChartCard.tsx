import React, { useState, useEffect, useRef } from 'react';
import { REVENUE_BY_RANGE, RevenueRange } from '../data/dashboardData';
import { AnimatedNumber } from './AnimatedNumber';

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
  const [tooltipIndex, setTooltipIndex] = useState<number>(config.defaultActiveIndex);
  const leaveTimerRef = useRef<number | null>(null);
  const isInternalToggleRef = useRef(false);

  useEffect(() => {
    setSelectedIndex(REVENUE_BY_RANGE[range].defaultActiveIndex);
    setTooltipIndex(REVENUE_BY_RANGE[range].defaultActiveIndex);
    setHoveredIndex(null);
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, [range]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const handleBarEnter = (idx: number) => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredIndex(idx);
    setTooltipIndex(idx);
  };

  const handleBarLeave = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setHoveredIndex(null);
      leaveTimerRef.current = null;
    }, 55);
  };

  const handlePlotLeave = () => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredIndex(null);
  };

  const points = config.points;
  const displayIndex = Math.min(points.length - 1, hoveredIndex !== null ? hoveredIndex : tooltipIndex);
  const displayPoint = points[displayIndex];
  const isTooltipVisible = hoveredIndex !== null;

  const formatTick = (val: number) => {
    if (val === 0) return 'Rp0';
    const jt = val / 1000000;
    const formatted = Number.isInteger(jt) ? String(jt) : jt.toFixed(1).replace('.', ',');
    return `Rp${formatted} jt`;
  };

  // Tooltip positioning
  const totalCols = points.length;
  const tooltipLeftPercent =
    displayIndex >= totalCols * 0.65
      ? ((displayIndex - (range === '7 Hari' ? 1.55 : 5.5)) / totalCols) * 100
      : ((displayIndex + (range === '7 Hari' ? 0.7 : 1.2)) / totalCols) * 100;
  const barTopPercentFromBottom = (displayPoint.revenue / config.yMax) * 100;
  const tooltipBottomPercent = Math.min(48, Math.max(14, barTopPercentFromBottom - 30));

  const shouldShowXLabel = (idx: number) => {
    if (range === '7 Hari') return true;
    return idx === 0 || idx === 5 || idx === 10 || idx === 15 || idx === 20 || idx === 25 || idx === 29;
  };

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[14px] font-medium text-[#f2f2f0] tracking-[-0.01em] whitespace-nowrap">
            Pendapatan
          </h2>
          <span className="text-[11px] text-[#888884] ml-1 tabular-nums whitespace-nowrap truncate">
            <AnimatedNumber
              key={range}
              value={Number(config.totalFormatted.replace(/[^\d]/g, '')) || 0}
              formatter={(v) => `Rp${Math.round(v).toLocaleString('id-ID')}`}
            />{' '}
            dalam {config.subtitle}
          </span>
        </div>

        {/* 7 Hari / 30 Hari Toggle */}
        <div className="flex items-center bg-[#232321] border border-white/[0.05] rounded-full p-[3px] shrink-0">
          {(['7 Hari', '30 Hari'] as const).map((r) => {
            const isActive = range === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  isInternalToggleRef.current = true;
                  onRangeChange(r);
                }}
                className={`px-[12px] py-[4px] rounded-full text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
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
      <div className="relative flex mt-[14px] flex-1 min-h-0">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between pr-[12px] pb-[22px] pt-[2px] text-right select-none shrink-0 w-[68px]">
          {config.yTicks.map((tick) => (
            <span key={tick} className="text-[10px] text-[#767672] leading-none tabular-nums whitespace-nowrap">
              {formatTick(tick)}
            </span>
          ))}
        </div>

        {/* Plot Canvas */}
        <div
          className="relative flex-1 flex flex-col min-w-0"
          onMouseLeave={handlePlotLeave}
        >
          <div className="relative flex-1 min-h-0">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {config.yTicks.map((tick) => (
                <div key={tick} className="w-full h-[1px] bg-white/[0.06]" />
              ))}
            </div>

            {/* Daily Bars */}
            <div
              key={range}
              className="relative z-10 grid h-full items-end px-[10px] animate-view-up"
              style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
            >
              {points.map((pt, idx) => {
                const heightPct = Math.max(5, (pt.revenue / config.yMax) * 100);
                const isHighlighted = hoveredIndex === null || hoveredIndex === idx;
                const isHoveredBar = hoveredIndex === idx;
                const barWidthClass = range === '7 Hari' ? 'w-[42px]' : 'w-[22px]';
                const baseChartDelay = isInternalToggleRef.current ? 0 : 720;
                const delayMs =
                  baseChartDelay + Math.min(idx * (range === '7 Hari' ? 68 : 24), 480);

                return (
                  <div
                    key={pt.label}
                    className="h-full flex items-end justify-center pointer-events-none"
                  >
                    <div
                      onMouseEnter={() => handleBarEnter(idx)}
                      onMouseLeave={handleBarLeave}
                      onClick={() => setSelectedIndex(idx)}
                      className={`${barWidthClass} rounded-t-[7px] relative overflow-hidden cursor-pointer pointer-events-auto transition-[box-shadow,transform] duration-300 ease-out origin-bottom ${
                        isHoveredBar ? 'shadow-[0_0_24px_rgba(255,255,255,0.16)] scale-y-[1.015]' : ''
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <div
                        className="w-full h-full relative rounded-t-[7px] animate-bar-grow"
                        style={{ animationDelay: `${delayMs}ms` }}
                      >
                        {/* Base Dark Hatched Layer (always mounted, revealed smoothly when dimmed) */}
                        <div
                          className="absolute inset-0 rounded-t-[7px] border border-white/[0.08]"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(-45deg, #1d1d1b 0px, #1d1d1b 3.5px, #353532 3.5px, #353532 5.2px)',
                          }}
                        />

                        {/* Top Gradient Layer (smoothly crossfades via opacity, zero flicker) */}
                        <div
                          className={`absolute inset-0 rounded-t-[7px] transition-opacity duration-300 ease-out ${
                            isHighlighted ? 'opacity-100' : 'opacity-0'
                          }`}
                          style={{
                            background:
                              'linear-gradient(180deg, #5c5c58 0%, #8f8f8c 32%, #d8d8d5 68%, #f5f5f3 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Smooth Floating Tooltip Card (never unmounts mid-hover, fades & glides smoothly) */}
            <div
              className={`absolute z-30 w-[224px] rounded-[14px] bg-[#ededeb] text-[#141414] px-[14px] py-[11px] shadow-[0_14px_34px_rgba(0,0,0,0.55)] pointer-events-none transition-[opacity,transform,left,bottom] duration-200 ease-out ${
                isTooltipVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-[6px] scale-[0.97]'
              }`}
              style={{
                left: `${Math.max(2, Math.min(76, tooltipLeftPercent))}%`,
                bottom: `${tooltipBottomPercent}%`,
              }}
            >
              <div className="text-[12px] font-semibold text-[#141414] mb-[8px] whitespace-nowrap">
                {displayPoint.fullLabel}
              </div>
              <div className="space-y-[4px] text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#6a6a66] whitespace-nowrap">Pendapatan</span>
                  <span className="font-semibold text-[#141414] tabular-nums whitespace-nowrap">
                    Rp{displayPoint.revenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#6a6a66] whitespace-nowrap">Transaksi</span>
                  <span className="font-semibold text-[#141414] tabular-nums whitespace-nowrap">
                    {displayPoint.transactions.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
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
                  className={`text-center text-[10.5px] leading-none cursor-pointer transition-colors duration-200 whitespace-nowrap ${
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
