import React, { useEffect, useState } from 'react';
import { PeriodDataset } from '../data/dashboardData';
import { AnimatedNumber } from './AnimatedNumber';

interface TotalVisitsCardProps {
  data: PeriodDataset['totalTransactions'];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export const TotalVisitsCard: React.FC<TotalVisitsCardProps> = ({ data }) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [donutReady, setDonutReady] = useState(false);

  useEffect(() => {
    setDonutReady(false);
    const raf = window.requestAnimationFrame(() => setDonutReady(true));
    return () => window.cancelAnimationFrame(raf);
  }, [data]);

  const orderedMethods =
    data.methods.length === 3
      ? [data.methods[0], data.methods[2], data.methods[1]]
      : data.methods;

  const totalCount = orderedMethods.reduce((acc, m) => acc + m.count, 0);
  const gapDeg = orderedMethods.length > 1 ? 5 : 0;
  let currentAngle = -90;

  const segments = orderedMethods.map((m) => {
    const rawSweep = (m.count / totalCount) * 360;
    const start = currentAngle + gapDeg / 2;
    const end = currentAngle + rawSweep - gapDeg / 2;
    currentAngle += rawSweep;
    return {
      ...m,
      start,
      end: Math.max(start + 1, end),
    };
  });

  const activeMethod = hoveredMethod
    ? data.methods.find((m) => m.name === hoveredMethod)
    : null;

  const centerPercent = activeMethod
    ? Math.round(activeMethod.percent)
    : data.highlightPercent;
  const centerLabel = activeMethod ? activeMethod.name : data.highlightLabel;
  const totalNumeric = Number(data.total.replace(/[^\d]/g, '')) || 0;

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[16px] flex items-center justify-between gap-3 h-full overflow-hidden">
      {/* Left Column */}
      <div className="flex flex-col justify-between h-full flex-1 min-w-0 pr-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-medium text-[#f2f2f0] tracking-[-0.01em] whitespace-nowrap">
              Total transaksi
            </h2>
          </div>

          <div className="text-[26px] xl:text-[28px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-none mt-[10px] tabular-nums whitespace-nowrap">
            <AnimatedNumber value={totalNumeric} />
          </div>
        </div>

        {/* Payment Method Breakdown Rows */}
        <div className="space-y-[7px] mt-[10px]">
          {data.methods.map((m) => {
            const isDimmed = hoveredMethod !== null && hoveredMethod !== m.name;
            return (
              <div
                key={m.name}
                onMouseEnter={() => setHoveredMethod(m.name)}
                onMouseLeave={() => setHoveredMethod(null)}
                className={`flex items-center justify-between gap-3 cursor-pointer transition-opacity ${
                  isDimmed ? 'opacity-45' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-[8px] min-w-0">
                  <span
                    className="w-[10px] h-[10px] rounded-[3px] shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-[11px] text-[#c8c8c4] whitespace-nowrap">{m.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#f2f2f0] tabular-nums whitespace-nowrap shrink-0">
                  <AnimatedNumber value={m.count} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Segmented Donut */}
      <div className="relative w-[144px] h-[144px] flex items-center justify-center shrink-0">
        <svg viewBox="0 0 156 156" className="w-full h-full">
          {segments.map((seg, idx) => {
            const isDimmed = hoveredMethod !== null && hoveredMethod !== seg.name;
            if (orderedMethods.length === 1) {
              return (
                <circle
                  key={seg.name}
                  cx="78"
                  cy="78"
                  r="60"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={donutReady ? 0 : 100}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="22"
                  style={{
                    transition: 'stroke-dashoffset 1350ms cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: '920ms',
                  }}
                />
              );
            }
            return (
              <path
                key={seg.name}
                d={describeArc(78, 78, 60, seg.start, seg.end)}
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={donutReady ? 0 : 100}
                fill="none"
                stroke={seg.color}
                strokeWidth="22"
                strokeLinecap="butt"
                onMouseEnter={() => setHoveredMethod(seg.name)}
                onMouseLeave={() => setHoveredMethod(null)}
                className={`cursor-pointer ${
                  isDimmed ? 'opacity-35' : 'opacity-100'
                }`}
                style={{
                  transition:
                    'stroke-dashoffset 1350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease',
                  transitionDelay: `${920 + idx * 150}ms, 0ms`,
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-5">
          <span className="text-[20px] font-semibold text-[#f3f3f1] leading-none tracking-[-0.02em] tabular-nums whitespace-nowrap">
            <AnimatedNumber
              value={centerPercent}
              startFrom="previous"
              duration={420}
              formatter={(v) => `${Math.round(v)}%`}
            />
          </span>
          <span className="text-[9.5px] text-[#888884] mt-[4px] leading-tight transition-opacity duration-150">
            {centerLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
