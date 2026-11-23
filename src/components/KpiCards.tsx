import React from 'react';
import { ChannelDataset, NavTab } from '../data/dashboardData';
import { InfoIcon } from './InfoIcon';

interface KpiCardsProps {
  data: ChannelDataset['kpis'];
  onNavigate: (tab: NavTab) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, onNavigate }) => {
  // Card 2 sparkline coordinates
  const sparkPoints = data.revenue.spark;
  const sparkMin = Math.min(...sparkPoints) - 4;
  const sparkMax = Math.max(...sparkPoints) + 4;
  const w = 74;
  const h = 34;
  const coords = sparkPoints.map((val, idx) => {
    const x = (idx / (sparkPoints.length - 1)) * (w - 6) + 2;
    const y = h - 4 - ((val - sparkMin) / (sparkMax - sparkMin)) * (h - 8);
    return { x, y };
  });
  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${h} L ${coords[0].x.toFixed(1)} ${h} Z`;
  const lastPt = coords[coords.length - 1];

  // Card 3 radial donut
  const r = 15;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - data.unitsSold.percent / 100);

  return (
    <section className="grid grid-cols-4 gap-[14px]">
      {/* Card 1: Active sales */}
      <div className="bg-[#f0f0ee] rounded-[20px] px-[20px] py-[16px] flex flex-col justify-between min-h-[146px] relative">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2c2c2a]">
          <span>Active sales</span>
          <InfoIcon variant="light" tooltip="Gross active order value before returns and adjustments." />
        </div>

        <div className="flex items-center justify-between mt-[4px]">
          <div>
            <div className="text-[26px] font-semibold text-[#141414] tracking-[-0.025em] leading-none tabular-nums">
              {data.activeSales.value}
            </div>
            <div className="flex items-center gap-[7px] mt-[10px]">
              <span className="inline-flex items-center gap-[2px] rounded-full bg-white px-[7px] py-[2px] text-[10.5px] font-semibold text-[#1c6b45] leading-none tabular-nums">
                <span>↑</span>
                <span>{data.activeSales.delta}</span>
              </span>
              <span className="text-[11px] text-[#555551]">vs last month</span>
            </div>
          </div>

          {/* 3-Bar Capsule Mini Chart */}
          <svg width="46" height="38" viewBox="0 0 46 38" className="shrink-0">
            {data.activeSales.bars.map((ratio, idx) => {
              const barH = Math.round(ratio * 34);
              const x = idx * 15 + 2;
              const y = 36 - barH;
              const fills = ['#8f8f8b', '#7a7a76', '#182028'];
              return (
                <g key={idx}>
                  <rect x={x} y={y} width="10" height={barH} rx="3.5" fill={fills[idx]} />
                  {idx === 2 && (
                    <circle cx={x + 5} cy={y + 6} r="1.4" fill="#f0f0ee" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('Orders')}
          className="mt-[12px] w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer"
        >
          See orders
        </button>
      </div>

      {/* Card 2: Revenue */}
      <div className="bg-[#d6d6d2] rounded-[20px] px-[20px] py-[16px] flex flex-col justify-between min-h-[146px]">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2c2c2a]">
          <span>Revenue</span>
          <InfoIcon variant="light" tooltip="Net recognized revenue for November 2026 month-to-date." />
        </div>

        <div className="flex items-center justify-between mt-[4px]">
          <div>
            <div className="text-[26px] font-semibold text-[#141414] tracking-[-0.025em] leading-none tabular-nums">
              {data.revenue.value}
            </div>
            <div className="flex items-center gap-[7px] mt-[10px]">
              <span className="inline-flex items-center gap-[2px] rounded-full bg-[#ecece8] px-[7px] py-[2px] text-[10.5px] font-semibold text-[#1c6b45] leading-none tabular-nums">
                <span>↑</span>
                <span>{data.revenue.delta}</span>
              </span>
              <span className="text-[11px] text-[#555551]">vs last month</span>
            </div>
          </div>

          {/* Mini Sparkline */}
          <svg width="74" height="36" viewBox="0 0 74 34" className="shrink-0 overflow-visible">
            <defs>
              <linearGradient id="kpiSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2228" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#1a2228" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#kpiSparkGrad)" />
            <path d={linePath} fill="none" stroke="#1a2228" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastPt.x} cy={lastPt.y} r="2.6" fill="#d6d6d2" stroke="#1a2228" strokeWidth="1.6" />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('Analytics')}
          className="mt-[12px] w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer"
        >
          See analytics
        </button>
      </div>

      {/* Card 3: Units sold */}
      <div className="bg-[#c2c2bd] rounded-[20px] px-[20px] py-[16px] flex flex-col justify-between min-h-[146px]">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2c2c2a]">
          <span>Units sold</span>
          <InfoIcon variant="light" tooltip="Total individual items shipped or picked up in store." />
        </div>

        <div className="flex items-center justify-between mt-[4px]">
          <div>
            <div className="text-[26px] font-semibold text-[#141414] tracking-[-0.025em] leading-none tabular-nums">
              {data.unitsSold.value}
            </div>
            <div className="flex items-center gap-[7px] mt-[10px]">
              <span className="inline-flex items-center gap-[2px] rounded-full bg-[#deded9] px-[7px] py-[2px] text-[10.5px] font-semibold text-[#1c6b45] leading-none tabular-nums">
                <span>↑</span>
                <span>{data.unitsSold.delta}</span>
              </span>
              <span className="text-[11px] text-[#4e4e4a]">vs last month</span>
            </div>
          </div>

          {/* 77% Circular Ring */}
          <div className="relative w-[40px] h-[40px] flex items-center justify-center shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
              <circle cx="20" cy="20" r={r} fill="none" stroke="#9b9b96" strokeWidth="4" />
              <circle
                cx="20"
                cy="20"
                r={r}
                fill="none"
                stroke="#18222b"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="absolute text-[9px] font-semibold text-[#141414] tabular-nums">
              {data.unitsSold.percent}%
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('Products')}
          className="mt-[12px] w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer"
        >
          See products
        </button>
      </div>

      {/* Card 4: Conversion rate */}
      <div className="bg-[#ababa6] rounded-[20px] px-[20px] py-[16px] flex flex-col justify-between min-h-[146px]">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2c2c2a]">
          <span>Conversion rate</span>
          <InfoIcon variant="light" tooltip="Percentage of storefront and store visits resulting in a completed purchase." />
        </div>

        <div className="flex items-center justify-between mt-[4px]">
          <div>
            <div className="text-[26px] font-semibold text-[#141414] tracking-[-0.025em] leading-none tabular-nums">
              {data.conversionRate.value}
            </div>
            <div className="flex items-center gap-[7px] mt-[10px]">
              <span
                className={`inline-flex items-center gap-[2px] rounded-full bg-[#cecec9] px-[7px] py-[2px] text-[10.5px] font-semibold leading-none tabular-nums ${
                  data.conversionRate.positive ? 'text-[#1c6b45]' : 'text-[#9b493a]'
                }`}
              >
                <span>{data.conversionRate.positive ? '↑' : '↓'}</span>
                <span>{data.conversionRate.delta}</span>
              </span>
              <span className="text-[11px] text-[#454541]">vs last month</span>
            </div>
          </div>

          {/* 8-Column Mini Bar Strip */}
          <svg width="60" height="36" viewBox="0 0 60 36" className="shrink-0">
            {data.conversionRate.bars.map((ratio, idx) => {
              const x = idx * 7.5 + 1;
              const maxH = 32;
              const barH = Math.round(ratio * maxH);
              const y = 34 - barH;
              const isLast = idx === data.conversionRate.bars.length - 1;
              return (
                <g key={idx}>
                  <rect x={x} y={2} width="4.2" height={maxH} rx="2" fill="rgba(0,0,0,0.08)" />
                  <rect
                    x={x}
                    y={y}
                    width="4.2"
                    height={barH}
                    rx="2"
                    fill={isLast ? '#1b252e' : '#73736f'}
                  />
                  {isLast && <circle cx={x + 2.1} cy={y + 3.2} r="1" fill="#d5d5d1" />}
                </g>
              );
            })}
          </svg>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('Analytics')}
          className="mt-[12px] w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#5a5a56] hover:text-black cursor-pointer"
        >
          See funnel
        </button>
      </div>
    </section>
  );
};
