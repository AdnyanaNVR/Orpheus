import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Bell, ChevronDown, LogOut } from 'lucide-react';
import { NavTab } from '../data/dashboardData';
import type { NotificationItem } from '../types/pos';
import { AnimatedNumber } from './AnimatedNumber';

interface TopSectionBarProps {
  storeName: string;
  userEmail?: string;
  notifications: NotificationItem[];
  onNavigate: (tab: NavTab) => void;
  onLogout?: () => void;
}

function getStoreInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'OS';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export const TopSectionBar: React.FC<TopSectionBarProps> = ({
  storeName,
  userEmail,
  notifications,
  onNavigate,
  onLogout,
}) => {
  const storeInitials = getStoreInitials(storeName);
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
              <AnimatedNumber value={notifications.length} duration={450} />
            </span>
          </button>

          {/* Popover: Notifications */}
          {openMenu === 'notif' && (
            <div className="absolute right-0 top-[54px] z-50 w-[290px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl animate-menu-pop">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12.5px] font-semibold text-[#f2f2f0]">Notifikasi</span>
                <span className="text-[11px] text-[#888884] tabular-nums">
                  {notifications.length} terbaru
                </span>
              </div>
              <div className="space-y-2 text-[11.5px]">
                {notifications.length === 0 ? (
                  <div className="rounded-lg bg-[#282826] p-2.5 text-[#8e8e8a]">
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="rounded-lg bg-[#282826] p-2.5">
                      <div className="font-medium text-[#ededeb]">{notif.title}</div>
                      <div className="text-[#8e8e8a] mt-0.5">{notif.subtitle}</div>
                    </div>
                  ))
                )}
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
              {storeInitials}
            </span>
            <div className="text-left leading-tight whitespace-nowrap">
              <div className="text-[12px] font-semibold text-[#f2f2f0]">{storeName}</div>
            </div>
            <ChevronDown className="w-[14px] h-[14px] text-[#888884] ml-[2px] shrink-0" strokeWidth={1.8} />
          </button>

          {/* Popover: Profile */}
          {openMenu === 'profile' && (
            <div className="absolute right-0 top-[54px] z-50 w-[235px] rounded-[16px] bg-[#20201e] border border-white/[0.09] p-3.5 shadow-2xl animate-menu-pop">
              <div className="text-[12.5px] font-semibold text-[#f2f2f0] truncate">{storeName}</div>
              <div className="text-[11px] text-[#888884] mb-2.5 truncate">
                {userEmail || 'toko@orpheus.co'}
              </div>
              <div className="border-t border-white/[0.07] pt-2 text-[11.5px] text-[#888884] space-y-1">
                <div>Ruang Kerja: Orpheus</div>
                <div>Peran: Pemilik Toko</div>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onLogout();
                  }}
                  className="mt-3 w-full h-[34px] rounded-[10px] bg-[#2a2a28] hover:bg-[#343431] text-[#f2f2f0] text-[12px] font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-[13px] h-[13px]" strokeWidth={1.9} />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
