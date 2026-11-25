import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Bell, ChevronDown } from 'lucide-react';
import { NavTab } from '../data/dashboardData';

interface TopSectionBarProps {
  onNavigate: (tab: NavTab) => void;
}

export const TopSectionBar: React.FC<TopSectionBarProps> = ({
  onNavigate,
}) => {
  const [openMenu, setOpenMenu] = useState<'notif' | 'profile' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleMenu = (menu: 'notif' | 'profile') => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <header
      ref={barRef}
      className="fixed top-[16px] left-[88px] sm:left-[116px] right-[16px] sm:right-[28px] z-[100] rounded-full bg-[#171716]/95 backdrop-blur-md border border-white/[0.08] px-[16px] py-[11px] flex items-center justify-between gap-[16px] shadow-[0_14px_40px_rgba(0,0,0,0.65)]"
    >
      {/* Left: Monochrome Brand Circle + Orpheus */}
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={() => {
            onNavigate('Dasbor');
            setOpenMenu(null);
          }}
          className="flex items-center gap-[13px] text-left cursor-pointer group focus:outline-none shrink-0"
        >
          <div className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            <img
              src="/logo.svg"
              alt="Logo Orpheus"
              className="w-[29px] h-[29px] object-contain brightness-0"
            />
          </div>
          <div className="pr-1">
            <div className="text-[15.5px] font-semibold text-[#f3f3f1] tracking-[-0.015em] group-hover:text-white transition-colors whitespace-nowrap">
              Orpheus
            </div>
          </div>
        </button>
      </div>

      {/* Right: Date Pill + Notification + Profile */}
      <div className="flex items-center gap-[10px] shrink-0">
        {/* Monochrome Date Pill beside Notification */}
        <div className="h-[42px] rounded-full bg-[#1e1e1c] border border-white/[0.06] px-[14px] hidden md:flex items-center gap-[8px] text-[12px] font-medium text-[#d4d4d0] tabular-nums whitespace-nowrap">
          <Calendar className="w-[14px] h-[14px] text-[#9e9e9a] shrink-0" strokeWidth={1.7} />
          <span>{formattedDate}</span>
        </div>

        {/* Notification Circle with Monochrome Badge 3 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('notif')}
            aria-label="Notifikasi"
            className="relative w-[42px] h-[42px] rounded-full bg-[#1e1e1c] border border-white/[0.06] flex items-center justify-center text-[#c8c8c4] hover:text-white hover:border-white/[0.15] transition-colors cursor-pointer"
          >
            <Bell className="w-[16px] h-[16px]" strokeWidth={1.7} />
            <span className="absolute -top-[2px] -right-[2px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-[#d6d6d2] border-[2px] border-[#171716] text-[9.5px] font-bold text-[#141414] flex items-center justify-center leading-none tabular-nums">
              3
            </span>
          </button>

          {/* Popover: Notifications */}
          {openMenu === 'notif' && (
            <div className="absolute right-0 top-[54px] z-50 w-[290px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12.5px] font-semibold text-[#f2f2f0]">Notifikasi</span>
                <span className="text-[11px] text-[#888884]">3 belum dibaca</span>
              </div>
              <div className="space-y-2 text-[11.5px]">
                <div className="rounded-lg bg-[#282826] p-2.5">
                  <div className="font-medium text-[#ededeb]">Transaksi #4894 lunas via QRIS</div>
                  <div className="text-[#8e8e8a] mt-0.5">Kasir 1 • 4 menit lalu</div>
                </div>
                <div className="rounded-lg bg-[#282826] p-2.5">
                  <div className="font-medium text-[#ededeb]">Stok SKU-2088 menipis</div>
                  <div className="text-[#8e8e8a] mt-0.5">Pin Rak Kuningan • 25 menit lalu</div>
                </div>
                <div className="rounded-lg bg-[#282826] p-2.5">
                  <div className="font-medium text-[#ededeb]">Shift Kasir 2 dimulai</div>
                  <div className="text-[#8e8e8a] mt-0.5">Jordan Okafor • 1 jam lalu</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('profile')}
            className="h-[44px] rounded-full bg-[#1e1e1c] border border-white/[0.06] pl-[5px] pr-[14px] flex items-center gap-[10px] hover:border-white/[0.15] transition-colors cursor-pointer"
          >
            <span className="w-[34px] h-[34px] rounded-full bg-[#d6d6d2] text-[#141414] text-[11.5px] font-semibold flex items-center justify-center shrink-0">
              OS
            </span>
            <div className="text-left leading-tight whitespace-nowrap">
              <div className="text-[12px] font-semibold text-[#f2f2f0]">Orpheus Shop</div>
            </div>
            <ChevronDown className="w-[14px] h-[14px] text-[#888884] ml-[2px] shrink-0" strokeWidth={1.8} />
          </button>

          {/* Popover: Profile */}
          {openMenu === 'profile' && (
            <div className="absolute right-0 top-[54px] z-50 w-[215px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl">
              <div className="text-[12.5px] font-semibold text-[#f2f2f0]">Orpheus Shop</div>
              <div className="text-[11px] text-[#888884] mb-2.5">toko@orpheus.co</div>
              <div className="border-t border-white/[0.07] pt-2 text-[11.5px] text-[#888884] space-y-1">
                <div>Ruang Kerja: Orpheus</div>
                <div>Peran: Akun Toko</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
