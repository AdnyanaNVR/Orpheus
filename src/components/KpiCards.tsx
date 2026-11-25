import React, { useEffect, useState } from 'react';
import { PeriodDataset, NavTab } from '../data/dashboardData';
import { AnimatedNumber } from './AnimatedNumber';

interface KpiCardsProps {
  data: PeriodDataset['kpis'];
  onNavigate: (tab: NavTab) => void;
}

function parseNumericMetric(formatted: string): number {
  return Number(formatted.replace(/[^\d]/g, '')) || 0;
}

function formatRupiahMetric(val: number): string {
  return `Rp${Math.round(val).toLocaleString('id-ID')}`;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, onNavigate }) => {
  const [ringReady, setRingReady] = useState(false);

  useEffect(() => {
    setRingReady(false);
    const raf = window.requestAnimationFrame(() => setRingReady(true));
    return () => window.cancelAnimationFrame(raf);
  }, [data.unitsSold.percent]);

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

  const r = 15;
  const circ = 2 * Math.PI * r;
  const targetDashOffset = circ * (1 - data.unitsSold.percent / 100);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px]">
      {/* Card 1: Penjualan Aktif */}
      <div
        className="bg-[#f0f0ee] rounded-[22px] px-[20px] py-[17px] flex flex-col justify-between min-h-[148px] relative overflow-hidden animate-tab-up"
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex items-center text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
          <span>Penjualan aktif</span>
        </div>

        <div className="flex items-center justify-between my-[10px] gap-2 min-w-0">
          <div className="text-[21px] xl:text-[22px] 2xl:text-[24px] font-semibold text-[#141414] tracking-[-0.03em] leading-none tabular-nums whitespace-nowrap">
            <AnimatedNumber
              value={parseNumericMetric(data.activeSales.value)}
              formatter={formatRupiahMetric}
            />
          </div>

          <svg width="42" height="38" viewBox="0 0 46 40" className="shrink-0">
            {data.activeSales.bars.map((ratio, idx) => {
              const maxH = 36;
              const barH = Math.round(ratio * maxH);
              const x = idx * 15 + 2;
              const y = 38 - barH;
              const fills = ['#8f8f8b', '#7a7a76', '#182028'];
              return (
                <g key={idx}>
                  <rect x={x} y={2} width="10" height={maxH} rx="3.5" fill="rgba(0,0,0,0.06)" />
                  <g
                    className="animate-bar-grow"
                    style={{
                      transformOrigin: `${x + 5}px 38px`,
                      animationDelay: `${680 + idx * 110}ms`,
                    }}
                  >
                    <rect x={x} y={y} width="10" height={barH} rx="3.5" fill={fills[idx]} />
                    {idx === 2 && (
                      <circle cx={x + 5} cy={y + 6} r="1.4" fill="#f0f0ee" />
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="pt-[10px] border-t border-dashed border-black/[0.16]">
          <button
            type="button"
            onClick={() => onNavigate('Transaksi')}
            className="w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer whitespace-nowrap"
          >
            Lihat transaksi
          </button>
        </div>
      </div>

      {/* Card 2: Pendapatan */}
      <div
        className="bg-[#d6d6d2] rounded-[22px] px-[20px] py-[17px] flex flex-col justify-between min-h-[148px] overflow-hidden animate-tab-up"
        style={{ animationDelay: '210ms' }}
      >
        <div className="flex items-center text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
          <span>Pendapatan</span>
        </div>

        <div className="flex items-center justify-between my-[10px] gap-2 min-w-0">
          <div className="text-[21px] xl:text-[22px] 2xl:text-[24px] font-semibold text-[#141414] tracking-[-0.03em] leading-none tabular-nums whitespace-nowrap">
            <AnimatedNumber
              value={parseNumericMetric(data.revenue.value)}
              formatter={formatRupiahMetric}
            />
          </div>

          <svg width="62" height="32" viewBox="0 0 74 34" className="shrink-0 overflow-visible">
            <defs>
              <linearGradient id="kpiSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2228" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#1a2228" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill="url(#kpiSparkGrad)"
              className="animate-filter-fade"
              style={{ animationDuration: '0.85s', animationDelay: '880ms' }}
            />
            <path
              d={linePath}
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100}
              fill="none"
              stroke="#1a2228"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-svg-draw"
              style={{ animationDelay: '720ms' }}
            />
            <circle
              cx={lastPt.x}
              cy={lastPt.y}
              r="2.6"
              fill="#d6d6d2"
              stroke="#1a2228"
              strokeWidth="1.6"
              className="animate-confirm-pop"
              style={{
                transformOrigin: `${lastPt.x}px ${lastPt.y}px`,
                animationDelay: '1350ms',
                opacity: 0,
              }}
            />
          </svg>
        </div>

        <div className="pt-[10px] border-t border-dashed border-black/[0.18]">
          <button
            type="button"
            onClick={() => onNavigate('Transaksi')}
            className="w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer whitespace-nowrap"
          >
            Lihat transaksi
          </button>
        </div>
      </div>

      {/* Card 3: Unit Terjual */}
      <div
        className="bg-[#c2c2bd] rounded-[22px] px-[20px] py-[17px] flex flex-col justify-between min-h-[148px] overflow-hidden animate-tab-up"
        style={{ animationDelay: '270ms' }}
      >
        <div className="flex items-center text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
          <span>Unit terjual</span>
        </div>

        <div className="flex items-center justify-between my-[10px] gap-2 min-w-0">
          <div className="text-[24px] xl:text-[26px] font-semibold text-[#141414] tracking-[-0.03em] leading-none tabular-nums whitespace-nowrap">
            <AnimatedNumber value={parseNumericMetric(data.unitsSold.value)} />
          </div>

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
                strokeDashoffset={ringReady ? targetDashOffset : circ}
                style={{
                  transition: 'stroke-dashoffset 1250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: '760ms',
                }}
              />
            </svg>
          </div>
        </div>

        <div className="pt-[10px] border-t border-dashed border-black/[0.18]">
          <button
            type="button"
            onClick={() => onNavigate('Produk')}
            className="w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#6e6e6a] hover:text-black cursor-pointer whitespace-nowrap"
          >
            Lihat produk
          </button>
        </div>
      </div>

      {/* Card 4: Transaksi Selesai */}
      <div
        className="bg-[#ababa6] rounded-[22px] px-[20px] py-[17px] flex flex-col justify-between min-h-[148px] overflow-hidden animate-tab-up"
        style={{ animationDelay: '330ms' }}
      >
        <div className="flex items-center text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
          <span>Transaksi selesai</span>
        </div>

        <div className="flex items-center justify-between my-[10px] gap-2 min-w-0">
          <div className="text-[24px] xl:text-[26px] font-semibold text-[#141414] tracking-[-0.03em] leading-none tabular-nums whitespace-nowrap">
            <AnimatedNumber value={parseNumericMetric(data.completedTransactions.value)} />
          </div>

          <svg width="56" height="34" viewBox="0 0 60 36" className="shrink-0">
            {data.completedTransactions.bars.map((ratio, idx) => {
              const x = idx * 7.5 + 1;
              const maxH = 32;
              const barH = Math.round(ratio * maxH);
              const y = 34 - barH;
              const isLast = idx === data.completedTransactions.bars.length - 1;
              return (
                <g key={idx}>
                  <rect x={x} y={2} width="4.2" height={maxH} rx="2" fill="rgba(0,0,0,0.08)" />
                  <g
                    className="animate-bar-grow"
                    style={{
                      transformOrigin: `${x + 2.1}px 34px`,
                      animationDelay: `${780 + idx * 70}ms`,
                    }}
                  >
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
                </g>
              );
            })}
          </svg>
        </div>

        <div className="pt-[10px] border-t border-dashed border-black/[0.2]">
          <button
            type="button"
            onClick={() => onNavigate('Transaksi')}
            className="w-fit text-[11.5px] font-medium text-[#222220] underline underline-offset-[4px] decoration-[#5a5a56] hover:text-black cursor-pointer whitespace-nowrap"
          >
            Lihat transaksi
          </button>
        </div>
      </div>
    </section>
  );
};
