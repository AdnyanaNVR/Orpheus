import React, { useState } from 'react';
import { PeriodDataset } from '../data/dashboardData';

interface VisitsByTimeCardProps {
  data: PeriodDataset['heatmap'];
}

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const TIME_SLOTS = ['00.00 – 08.00', '08.00 – 12.00', '12.00 – 16.00', '16.00 – 24.00'];

const LEVEL_COLORS: Record<number, string> = {
  0: '#2d2d2b',
  1: '#4c4c4a',
  2: '#8a8a86',
  3: '#b8b8b4',
  4: '#ededeb',
};

const LEGEND_SWATCHES = ['#2d2d2b', '#434341', '#6b6b67', '#a2a29e', '#ededeb'];

export const VisitsByTimeCard: React.FC<VisitsByTimeCardProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  return (
    <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] px-[22px] py-[16px] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[14px] font-medium text-[#f2f2f0] tracking-[-0.01em] whitespace-nowrap">
            Transaksi per waktu
          </h2>
        </div>

        {/* Scale Legend */}
        <div className="flex items-center gap-[5px] shrink-0">
          <span className="text-[10px] text-[#7a7a76] mr-[2px] tabular-nums whitespace-nowrap">0</span>
          {LEGEND_SWATCHES.map((color, idx) => (
            <span
              key={idx}
              className="w-[10.5px] h-[10.5px] rounded-[3px]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-[#7a7a76] ml-[2px] tabular-nums whitespace-nowrap">11rb+</span>
        </div>
      </div>

      {/* Heatmap Matrix */}
      <div className="mt-[10px] flex flex-col gap-[6px]">
        <div className="grid grid-cols-[108px_repeat(7,minmax(0,1fr))] gap-[7px] items-center">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="text-center text-[10.5px] text-[#888884] font-normal whitespace-nowrap">
              {day}
            </div>
          ))}
        </div>

        {TIME_SLOTS.map((slot, rIdx) => (
          <div
            key={slot}
            className="grid grid-cols-[108px_repeat(7,minmax(0,1fr))] gap-[7px] items-center"
          >
            <div className="text-[10px] text-[#888884] whitespace-nowrap pr-1 tabular-nums">
              {slot}
            </div>
            {DAYS.map((day, cIdx) => {
              const level = data.levels[rIdx][cIdx];
              const count = data.counts[rIdx][cIdx];
              const bg = LEVEL_COLORS[level] || LEVEL_COLORS[0];
              const isHovered = hoveredCell?.r === rIdx && hoveredCell?.c === cIdx;

              return (
                <div
                  key={day}
                  className="animate-cell-pop"
                  style={{ animationDelay: `${(rIdx + cIdx) * 32}ms` }}
                >
                  <div
                    onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className="relative h-[26px] rounded-[7px] transition-transform duration-150 cursor-pointer"
                    style={{
                      backgroundColor: bg,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 whitespace-nowrap rounded-lg bg-[#252523] border border-white/10 px-2.5 py-1 text-[10.5px] text-[#f2f2f0] shadow-xl pointer-events-none tabular-nums">
                        <span className="font-semibold">{day}</span> • {slot}:{' '}
                        <span className="font-semibold">{count.toLocaleString('id-ID')}</span> transaksi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
