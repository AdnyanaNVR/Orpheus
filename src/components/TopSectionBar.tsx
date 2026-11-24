import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { NavTab } from '../data/dashboardData';

interface TopSectionBarProps {
  onNavigate: (tab: NavTab) => void;
}

export const TopSectionBar: React.FC<TopSectionBarProps> = ({
  onNavigate,
}) => {
  const [openMenu, setOpenMenu] = useState<'search' | 'notif' | 'profile' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenMenu((prev) => (prev === 'search' ? null : 'search'));
      } else if (e.key === 'Escape') {
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

  const toggleMenu = (menu: 'search' | 'notif' | 'profile') => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <header
      ref={barRef}
      className="relative w-full rounded-full bg-[#171716] border border-white/[0.07] px-[12px] py-[7px] flex items-center justify-between mb-[18px]"
    >
      {/* Left: Monochrome Brand Circle + Orpheus */}
      <button
        type="button"
        onClick={() => {
          onNavigate('Dasbor');
          setOpenMenu(null);
        }}
        className="flex items-center gap-[12px] text-left cursor-pointer group focus:outline-none"
      >
        <div className="w-[40px] h-[40px] rounded-full bg-[#ededeb] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 3H13V6H8.8V8.8H6.2V13H3.5V3Z" fill="#141414" />
          </svg>
        </div>
        <div className="pr-2">
          <div className="text-[15px] font-semibold text-[#f3f3f1] tracking-[-0.015em] group-hover:text-white transition-colors">
            Orpheus
          </div>
        </div>
      </button>

      {/* Right: Monochrome Utility Controls */}
      <div className="flex items-center gap-[8px]">
        {/* Wide Search Pill with Shortcut Badge */}
        <button
          type="button"
          onClick={() => toggleMenu('search')}
          className="h-[38px] w-[280px] rounded-full bg-[#1e1e1c] border border-white/[0.06] pl-[14px] pr-[8px] flex items-center justify-between text-[#9e9e9a] hover:border-white/[0.15] hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-[8px] text-[12px]">
            <Search className="w-[14px] h-[14px]" strokeWidth={1.7} />
            <span>Cari</span>
          </span>
          <span className="rounded-[7px] bg-[#262624] border border-white/[0.08] px-[7px] py-[2.5px] text-[10.5px] font-medium text-[#9e9e9a] leading-none">
            ⌘K
          </span>
        </button>

        {/* Notification Circle with Monochrome Badge 3 */}
        <button
          type="button"
          onClick={() => toggleMenu('notif')}
          aria-label="Notifikasi"
          className="relative w-[38px] h-[38px] rounded-full bg-[#1e1e1c] border border-white/[0.06] flex items-center justify-center text-[#c8c8c4] hover:text-white hover:border-white/[0.15] transition-colors cursor-pointer"
        >
          <Bell className="w-[15px] h-[15px]" strokeWidth={1.7} />
          <span className="absolute -top-[3px] -right-[2px] min-w-[17px] h-[17px] px-[4px] rounded-full bg-[#d6d6d2] border-[2px] border-[#171716] text-[9.5px] font-bold text-[#141414] flex items-center justify-center leading-none tabular-nums">
            3
          </span>
        </button>

        {/* Profile Pill */}
        <button
          type="button"
          onClick={() => toggleMenu('profile')}
          className="h-[40px] rounded-full bg-[#1e1e1c] border border-white/[0.06] pl-[4px] pr-[12px] flex items-center gap-[9px] hover:border-white/[0.15] transition-colors cursor-pointer"
        >
          <span className="w-[32px] h-[32px] rounded-full bg-[#d6d6d2] text-[#141414] text-[11px] font-semibold flex items-center justify-center shrink-0">
            MR
          </span>
          <div className="text-left leading-tight">
            <div className="text-[12px] font-semibold text-[#f2f2f0]">Maya Ross</div>
          </div>
          <ChevronDown className="w-[13.5px] h-[13.5px] text-[#888884] ml-[2px]" strokeWidth={1.8} />
        </button>
      </div>

      {/* Popover: Search */}
      {openMenu === 'search' && (
        <div className="absolute right-[195px] top-[60px] z-50 w-[290px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, SKU, atau kasir..."
            className="w-full rounded-lg bg-[#161615] border border-white/[0.08] px-3 py-2 text-[12px] text-[#f2f2f0] placeholder-[#6e6e6a] focus:outline-none focus:border-white/25"
          />
          <div className="mt-2.5 space-y-1 text-[11px] text-[#8e8e8a]">
            {searchQuery ? (
              <div className="text-[#d4d4d0]">Hasil cepat untuk &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              <>
                <div className="text-[#a0a09c] font-medium mb-1">Pintasan Cepat</div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('Kasir');
                    setOpenMenu(null);
                  }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-white/[0.05] text-[#d4d4d0] cursor-pointer"
                >
                  Buka Terminal Kasir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('Transaksi');
                    setOpenMenu(null);
                  }}
                  className="block w-full text-left px-2 py-1 rounded hover:bg-white/[0.05] text-[#d4d4d0] cursor-pointer"
                >
                  Lihat Riwayat Transaksi
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Popover: Notifications */}
      {openMenu === 'notif' && (
        <div className="absolute right-[95px] top-[60px] z-50 w-[290px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl">
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

      {/* Popover: Profile */}
      {openMenu === 'profile' && (
        <div className="absolute right-0 top-[60px] z-50 w-[215px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl">
          <div className="text-[12.5px] font-semibold text-[#f2f2f0]">Maya Ross</div>
          <div className="text-[11px] text-[#888884] mb-2.5">maya@orpheus.co</div>
          <div className="border-t border-white/[0.07] pt-2 text-[11.5px] text-[#888884] space-y-1">
            <div>Ruang Kerja: Orpheus</div>
            <div>Peran: Manajer Kasir</div>
          </div>
        </div>
      )}
    </header>
  );
};
