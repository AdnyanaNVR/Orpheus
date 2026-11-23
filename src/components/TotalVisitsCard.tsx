import React, { useState } from 'react';
import { ChannelDataset } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

interface TotalVisitsCardProps {
  data: ChannelDataset['totalVisits'];
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
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  // Build segmented donut arcs starting from 12 o'clock (-90 deg), clockwise
  // Order visually matching screenshot: Website (#ededeb) -> Click & collect (#3e3e3c) -> In store (#7a7a76)
  const orderedChannels =
    data.channels.length === 3
      ? [data.channels[0], data.channels[2], data.channels[1]]
      : data.channels;

  const totalCount = orderedChannels.reduce((acc, c) => acc + c.count, 0);
  const gapDeg = orderedChannels.length > 1 ? 5 : 0;
  let currentAngle = -90;

  const segments = orderedChannels.map((ch) => {
    const rawSweep = (ch.count / totalCount) * 360;
    const start = currentAngle + gapDeg / 2;
    const end = currentAngle + rawSweep - gapDeg / 2;
    currentAngle += rawSweep;
    return {
      ...ch,
      start,
      end: Math.max(start + 1, end),
    };
  });

  const activeChannel = hoveredChannel
    ? data.channels.find((c) => c.name === hoveredChannel)
    : null;

  const centerPercent = activeChannel
    ? Math.round(activeChannel.percent)
    : data.highlightPercent;
  const centerLabel = activeChannel ? activeChannel.name : data.highlightLabel;

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[18px] flex items-center justify-between h-full">
      {/* Left Column */}
      <div className="flex flex-col justify-between h-full w-[55%]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14.5px] font-medium text-[#f2f2f0] tracking-[-0.01em]">
              Total visits
            </h2>
            <InfoIcon tooltip="Combined customer sessions across storefront web, retail locations, and pickup orders." />
          </div>

          <div className="text-[28px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none mt-[10px] tabular-nums">
            {data.total}
          </div>

          <div className="flex items-center gap-[8px] mt-[8px]">
            <span className="text-[11px] text-[#888884]">vs last month</span>
            <span className="inline-flex items-center gap-[2px] rounded-full bg-[#222d27] px-[7px] py-[2px] text-[10.5px] font-semibold text-[#58c08d] leading-none tabular-nums">
              <span>↑</span>
              <span>{data.delta}</span>
            </span>
          </div>
        </div>

        {/* Channel Breakdown Rows */}
        <div className="space-y-[7px] mt-[14px]">
          {data.channels.map((ch) => {
            const isDimmed = hoveredChannel !== null && hoveredChannel !== ch.name;
            return (
              <div
                key={ch.name}
                onMouseEnter={() => setHoveredChannel(ch.name)}
                onMouseLeave={() => setHoveredChannel(null)}
                className={`flex items-center justify-between cursor-pointer transition-opacity ${
                  isDimmed ? 'opacity-45' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-[9px]">
                  <span
                    className="w-[10px] h-[10px] rounded-[3px] shrink-0"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="text-[11.5px] text-[#c8c8c4]">{ch.name}</span>
                </div>
                <span className="text-[11.5px] font-semibold text-[#f2f2f0] tabular-nums">
                  {ch.formatted}
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
            const isDimmed = hoveredChannel !== null && hoveredChannel !== seg.name;
            if (orderedChannels.length === 1) {
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
                onMouseEnter={() => setHoveredChannel(seg.name)}
                onMouseLeave={() => setHoveredChannel(null)}
                className={`cursor-pointer transition-opacity duration-150 ${
                  isDimmed ? 'opacity-35' : 'opacity-100'
                }`}
              />
            );
          })}
        </svg>

        {/* Donut Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[22px] font-semibold text-[#f3f3f1] leading-none tracking-[-0.02em] tabular-nums">
            {centerPercent}%
          </span>
          <span className="text-[10.5px] text-[#888884] mt-[4px]">{centerLabel}</span>
        </div>
      </div>
    </div>
  );
};
