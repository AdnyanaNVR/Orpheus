import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NavTab } from '../data/dashboardData';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: { label: NavTab; badge?: number }[] = [
  { label: 'Dashboard' },
  { label: 'Orders', badge: 14 },
  { label: 'Products' },
  { label: 'Customers' },
  { label: 'Messages', badge: 3 },
  { label: 'Analytics' },
  { label: 'Automations' },
];

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onSelectTab }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setTeamOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      ref={containerRef}
      className="w-full flex items-center justify-between pt-[18px] pb-[10px]"
    >
      {/* Left Brand */}
      <button
        type="button"
        onClick={() => onSelectTab('Dashboard')}
        className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none"
      >
        <div className="w-[38px] h-[38px] rounded-full bg-[#ededeb] flex items-center justify-center shrink-0">
          {/* Custom Orpheus architectural stepped mark */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 3H13V6H8.8V8.8H6.2V13H3.5V3Z"
              fill="#141414"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[14.5px] font-semibold text-[#f3f3f1] tracking-[-0.01em] group-hover:text-white transition-colors">
            Orpheus
          </div>
          <div className="text-[11px] text-[#888884] mt-[1px]">
            Pro trial, 9 days left
          </div>
        </div>
      </button>

      {/* Center Pill Navigation */}
      <nav
        aria-label="Primary Navigation"
        className="flex items-center bg-[#21211f] border border-white/[0.06] rounded-full p-[4px] gap-[2px]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectTab(item.label)}
              className={`px-[15px] py-[7px] rounded-full text-[12.5px] flex items-center gap-[7px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#ededeb] text-[#141414] font-semibold'
                  : 'text-[#d4d4d0] hover:text-white font-medium'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10.5px] font-semibold leading-none px-[6px] py-[3px] rounded-full tabular-nums ${
                    isActive
                      ? 'bg-[#141414]/10 text-[#141414]'
                      : 'bg-[#363634] text-[#d4d4d0]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Utility Cluster */}
      <div className="flex items-center gap-[10px] relative">
        {/* Bell Button */}
        <button
          type="button"
          onClick={() => {
            setNotifOpen((v) => !v);
            setTeamOpen(false);
            setProfileOpen(false);
          }}
          aria-label="Notifications"
          className="relative w-[38px] h-[38px] rounded-full bg-[#21211f] border border-white/[0.06] flex items-center justify-center text-[#d4d4d0] hover:text-white hover:border-white/[0.14] transition-colors cursor-pointer"
        >
          <Bell className="w-[15px] h-[15px]" strokeWidth={1.8} />
          <span className="absolute top-[9px] right-[10px] w-[5.5px] h-[5.5px] rounded-full bg-[#df6549]" />
        </button>

        {/* Team Avatars Group */}
        <button
          type="button"
          onClick={() => {
            setTeamOpen((v) => !v);
            setNotifOpen(false);
            setProfileOpen(false);
          }}
          aria-label="Team members"
          className="h-[38px] rounded-full bg-[#21211f] border border-white/[0.06] px-[5px] flex items-center hover:border-white/[0.14] transition-colors cursor-pointer"
        >
          <div className="flex items-center">
            <span className="w-[26px] h-[26px] rounded-full bg-[#383836] border-[1.5px] border-[#21211f] flex items-center justify-center text-[10px] font-medium text-[#e5e5e2] z-30">
              MR
            </span>
            <span className="-ml-[6px] w-[26px] h-[26px] rounded-full bg-[#383836] border-[1.5px] border-[#21211f] flex items-center justify-center text-[10px] font-medium text-[#e5e5e2] z-20">
              JO
            </span>
            <span className="-ml-[6px] w-[26px] h-[26px] rounded-full bg-[#383836] border-[1.5px] border-[#21211f] flex items-center justify-center text-[10px] font-medium text-[#e5e5e2] z-10">
              AP
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#b8b8b4] pl-[6px] pr-[6px]">
            +2
          </span>
        </button>

        {/* User Avatar */}
        <button
          type="button"
          onClick={() => {
            setProfileOpen((v) => !v);
            setNotifOpen(false);
            setTeamOpen(false);
          }}
          aria-label="User profile"
          className="w-[38px] h-[38px] rounded-full bg-[#363634] border border-white/[0.08] flex items-center justify-center text-[11.5px] font-medium text-[#ededeb] hover:border-white/[0.18] transition-colors cursor-pointer"
        >
          MR
        </button>

        {/* Notifications Popover */}
        {notifOpen && (
          <div className="absolute right-0 top-[46px] z-50 w-[300px] rounded-[16px] bg-[#20201e] border border-white/[0.08] p-3.5 shadow-2xl">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12.5px] font-semibold text-[#f2f2f0]">Notifications</span>
              <span className="text-[11px] text-[#888884]">3 unread</span>
            </div>
            <div className="space-y-2 text-[11.5px]">
              <div className="rounded-lg bg-[#282826] p-2.5">
                <div className="font-medium text-[#ededeb]">Order #4892 fulfilled</div>
                <div className="text-[#8e8e8a] mt-0.5">Online channel • 4 mins ago</div>
              </div>
              <div className="rounded-lg bg-[#282826] p-2.5">
                <div className="font-medium text-[#ededeb]">Nov target surpassed</div>
                <div className="text-[#8e8e8a] mt-0.5">Sales score reached 86 pts • 1h ago</div>
              </div>
              <div className="rounded-lg bg-[#282826] p-2.5">
                <div className="font-medium text-[#ededeb]">3 new customer messages</div>
                <div className="text-[#8e8e8a] mt-0.5">Assigned to support queue • 2h ago</div>
              </div>
            </div>
          </div>
        )}

        {/* Team Popover */}
        {teamOpen && (
          <div className="absolute right-[44px] top-[46px] z-50 w-[230px] rounded-[16px] bg-[#20201e] border border-white/[0.08] p-3.5 shadow-2xl">
            <div className="text-[12.5px] font-semibold text-[#f2f2f0] mb-2">Active Team (5)</div>
            <div className="space-y-2 text-[11.5px] text-[#d4d4d0]">
              <div className="flex items-center justify-between"><span>Maya Ross (MR)</span><span className="text-[#58c08d]">Online</span></div>
              <div className="flex items-center justify-between"><span>Jordan Okafor (JO)</span><span className="text-[#58c08d]">Online</span></div>
              <div className="flex items-center justify-between"><span>Avery Patel (AP)</span><span className="text-[#58c08d]">Online</span></div>
              <div className="flex items-center justify-between"><span>Liam Chen (LC)</span><span className="text-[#888884]">Away</span></div>
              <div className="flex items-center justify-between"><span>Sofia Silva (SS)</span><span className="text-[#888884]">Away</span></div>
            </div>
          </div>
        )}

        {/* Profile Popover */}
        {profileOpen && (
          <div className="absolute right-0 top-[46px] z-50 w-[210px] rounded-[16px] bg-[#20201e] border border-white/[0.08] p-3.5 shadow-2xl">
            <div className="text-[12.5px] font-semibold text-[#f2f2f0]">Maya Ross</div>
            <div className="text-[11px] text-[#888884] mb-2.5">maya@orpheus.co</div>
            <div className="border-t border-white/[0.07] pt-2 text-[11.5px] text-[#d4d4d0] space-y-1.5">
              <div className="text-[#888884]">Workspace: Orpheus</div>
              <div className="text-[#888884]">Plan: Pro trial (9 days left)</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
