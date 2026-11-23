import React, { useState } from 'react';
import { ChannelDataset } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

interface SalesPerformanceCardProps {
  data: ChannelDataset['performance'];
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
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export const SalesPerformanceCard: React.FC<SalesPerformanceCardProps> = ({ data }) => {
  const [tipsOpen, setTipsOpen] = useState(false);

  const cx = 130;
  const cy = 104;
  const radius = 78;
  const startAngle = -202;
  const endAngle = 22;
  const totalSweep = endAngle - startAngle; // 224 deg
  const scoreAngle = startAngle + (data.score / 100) * totalSweep;

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const activePath = describeArc(cx, cy, radius, startAngle, scoreAngle);
  const thumb = polarToCartesian(cx, cy, radius, scoreAngle);

  // Outer radial tick marks
  const tickCount = 33;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const tAngle = startAngle + (i / (tickCount - 1)) * totalSweep;
    const inner = polarToCartesian(cx, cy, radius + 16, tAngle);
    const outer = polarToCartesian(cx, cy, radius + 22, tAngle);
    const isActive = tAngle <= scoreAngle + 1;
    return { inner, outer, isActive };
  });

  return (
    <div className="bg-[#21211f] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-[14.5px] font-medium text-[#f2f2f0] tracking-[-0.01em]">
          Sales performance
        </h2>
        <InfoIcon tooltip="Composite score combining revenue velocity, conversion efficiency, and AOV vs monthly plan." />
      </div>

      {/* Radial Gauge */}
      <div className="flex items-center justify-center my-auto pt-2">
        <div className="relative w-[260px] h-[162px] flex items-center justify-center">
          <svg width="260" height="162" viewBox="0 0 260 162" className="overflow-visible">
            <defs>
              <linearGradient id="gaugeArcGradient" x1="0%" y1="80%" x2="100%" y2="20%">
                <stop offset="0%" stopColor="#3c3c3a" />
                <stop offset="45%" stopColor="#949490" />
                <stop offset="100%" stopColor="#f5f5f3" />
              </linearGradient>
              <filter id="thumbGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Outer Tick Marks */}
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.inner.x}
                y1={t.inner.y}
                x2={t.outer.x}
                y2={t.outer.y}
                stroke={t.isActive ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.16)'}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}

            {/* Background Unfilled Arc */}
            <path
              d={trackPath}
              fill="none"
              stroke="#333331"
              strokeWidth="15"
              strokeLinecap="round"
            />

            {/* Active Gradient Arc */}
            <path
              d={activePath}
              fill="none"
              stroke="url(#gaugeArcGradient)"
              strokeWidth="15"
              strokeLinecap="round"
            />

            {/* White-ringed Thumb Knob */}
            <circle
              cx={thumb.x}
              cy={thumb.y}
              r="8.5"
              fill="#21211f"
              stroke="#ffffff"
              strokeWidth="3.5"
              filter="url(#thumbGlow)"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute top-[74px] left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
            <div className="flex items-center gap-[7px]">
              <span className="text-[32px] font-semibold text-[#f3f3f1] leading-none tracking-[-0.02em] tabular-nums">
                {data.score}
              </span>
              <span className="inline-flex items-center gap-[2px] rounded-full bg-[#24322a] px-[7px] py-[3px] text-[10.5px] font-semibold text-[#58c08d] leading-none tabular-nums">
                <span>↑</span>
                <span>{data.delta}</span>
              </span>
            </div>
            <span className="text-[11px] text-[#888884] mt-[6px]">of 100 points</span>
          </div>
        </div>
      </div>

      {/* Bottom Summary & Link */}
      <div className="mt-1">
        <div className="text-[13.5px] font-semibold text-[#f2f2f0]">{data.headline}</div>
        <p className="text-[11.5px] text-[#9c9c98] mt-[3px] leading-snug">{data.subtext}</p>
        <button
          type="button"
          onClick={() => setTipsOpen((v) => !v)}
          className="mt-[12px] text-[11.5px] font-medium text-[#e5e5e2] underline underline-offset-[4px] decoration-[#666662] hover:text-white cursor-pointer"
        >
          Improve your score
        </button>
      </div>

      {/* Clean Score Recommendations Drawer/Popover when clicked */}
      {tipsOpen && (
        <div className="absolute inset-x-4 bottom-4 z-30 rounded-[14px] bg-[#171716] border border-white/[0.1] p-3.5 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#f2f2f0]">Score levers (+14 pts potential)</span>
            <button
              type="button"
              onClick={() => setTipsOpen(false)}
              className="text-[11px] text-[#888884] hover:text-white cursor-pointer"
            >
              Done
            </button>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#b8b8b4]">
            <div className="flex justify-between"><span>Recover abandoned mobile carts</span><span className="text-[#58c08d]">+6 pts</span></div>
            <div className="flex justify-between"><span>Promote Click &amp; collect on PDP</span><span className="text-[#58c08d]">+5 pts</span></div>
            <div className="flex justify-between"><span>Restock top 3 fastener bundles</span><span className="text-[#58c08d]">+3 pts</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
