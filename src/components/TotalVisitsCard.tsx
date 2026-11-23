import React, { useState } from 'react';
import { PeriodDataset } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

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

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex items-center justify-between h-full">
      {/* Left Column */}
      <div className="flex flex-col justify-between h-full w-[55%]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14.5px] font-medium text-[#f2f2f0] tracking-[-0.01em]">
              Total transaksi
            </h2>
            <InfoIcon tooltip="Distribusi total transaksi selesai berdasarkan metode pembayaran di kasir." />
          </div>

          <div className="text-[28px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none mt-[12px] tabular-nums">
            {data.total}
          </div>
        </div>

        {/* Payment Method Breakdown Rows */}
        <div className="space-y-[8px] mt-[14px]">
          {data.methods.map((m) => {
            const isDimmed = hoveredMethod !== null && hoveredMethod !== m.name;
            return (
              <div
                key={m.name}
                onMouseEnter={() => setHoveredMethod(m.name)}
                onMouseLeave={() => setHoveredMethod(null)}
                className={`flex items-center justify-between cursor-pointer transition-opacity ${
                  isDimmed ? 'opacity-45' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-[9px]">
                  <span
                    className="w-[10px] h-[10px] rounded-[3px] shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-[11.5px] text-[#c8c8c4]">{m.name}</span>
                </div>
                <span className="text-[11.5px] font-semibold text-[#f2f2f0] tabular-nums">
                  {m.formatted}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Segmented Donut */}
      <div className="relative w-[156px] h-[156px] flex items-center justify-center shrink-0 mr-[4px]">
        <svg width="156" height="156" viewBox="0 0 156 156">
          {segments.map((seg) => {
            const isDimmed = hoveredMethod !== null && hoveredMethod !== seg.name;
            if (orderedMethods.length === 1) {
              return (
                <circle
                  key={seg.name}
                  cx="78"
                  cy="78"
                  r="60"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="22"
                />
              );
            }
            return (
              <path
                key={seg.name}
                d={describeArc(78, 78, 60, seg.start, seg.end)}
                fill="none"
                stroke={seg.color}
                strokeWidth="22"
                strokeLinecap="butt"
                onMouseEnter={() => setHoveredMethod(seg.name)}
                onMouseLeave={() => setHoveredMethod(null)}
                className={`cursor-pointer transition-opacity duration-150 ${
                  isDimmed ? 'opacity-35' : 'opacity-100'
                }`}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[22px] font-semibold text-[#f3f3f1] leading-none tracking-[-0.02em] tabular-nums">
            {centerPercent}%
          </span>
          <span className="text-[10.5px] text-[#888884] mt-[4px] leading-tight">{centerLabel}</span>
        </div>
      </div>
    </div>
  );
};
