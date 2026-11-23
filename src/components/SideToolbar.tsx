import React, { useState } from 'react';
import { Search, Settings, HelpCircle, Sparkles, Sun } from 'lucide-react';

export type SidebarTool = 'search' | 'tasks' | 'settings' | 'help' | 'ai' | 'theme' | null;

interface SideToolbarProps {
  activeTool: SidebarTool;
  onSelectTool: (tool: SidebarTool) => void;
}

export const SideToolbar: React.FC<SideToolbarProps> = ({ activeTool, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (tool: Exclude<SidebarTool, null>) => {
    onSelectTool(activeTool === tool ? null : tool);
  };

  return (
    <aside className="absolute left-[36px] top-[342px] z-40">
      <div className="w-[50px] rounded-full bg-[#20201e] border border-white/[0.06] py-[16px] flex flex-col items-center gap-[18px] shadow-lg">
        {/* Search */}
        <button
          type="button"
          onClick={() => toggle('search')}
          aria-label="Search"
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'search' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          <Search className="w-[15px] h-[15px]" strokeWidth={1.7} />
        </button>

        {/* Tasks / Ledger Icon with 11 badge */}
        <button
          type="button"
          onClick={() => toggle('tasks')}
          aria-label="Open activity queue"
          className={`relative w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'tasks' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          {/* Custom sidebar-list square icon matching screenshot */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.35" />
            <path d="M5.5 2.5V13.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 6H11.5M8 8.5H11.5M8 11H10.2" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          </svg>
          <span className="absolute -top-[5px] -right-[6px] min-w-[17px] h-[17px] px-[4px] rounded-full bg-[#3c3c3a] border border-[#20201e] text-[9.5px] font-semibold text-[#ededeb] flex items-center justify-center leading-none tabular-nums">
            11
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => toggle('settings')}
          aria-label="Settings"
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'settings' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          <Settings className="w-[15px] h-[15px]" strokeWidth={1.7} />
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={() => toggle('help')}
          aria-label="Help"
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'help' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          <HelpCircle className="w-[15px] h-[15px]" strokeWidth={1.7} />
        </button>

        {/* Sparkles */}
        <button
          type="button"
          onClick={() => toggle('ai')}
          aria-label="Smart highlights"
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'ai' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          <Sparkles className="w-[15px] h-[15px]" strokeWidth={1.7} />
        </button>

        {/* Subtle Divider */}
        <div className="w-[22px] h-[1px] bg-[#31312f] -my-[4px]" />

        {/* Sun / Appearance */}
        <button
          type="button"
          onClick={() => toggle('theme')}
          aria-label="Display preferences"
          className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            activeTool === 'theme' ? 'bg-white/10 text-white' : 'text-[#b5b5b0] hover:text-white'
          }`}
        >
          <Sun className="w-[15px] h-[15px]" strokeWidth={1.7} />
        </button>
      </div>

      {/* Contextual Popover when a sidebar icon is clicked */}
      {activeTool && (
        <div className="absolute left-[62px] top-0 w-[260px] rounded-[16px] bg-[#20201e] border border-white/[0.08] p-3.5 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-semibold text-[#f2f2f0] capitalize">
              {activeTool === 'tasks' ? 'Action Queue (11)' : activeTool === 'ai' ? 'Performance Highlights' : activeTool}
            </span>
            <button
              type="button"
              onClick={() => onSelectTool(null)}
              className="text-[11px] text-[#888884] hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
          {activeTool === 'search' && (
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, SKUs, customers..."
                className="w-full rounded-lg bg-[#161615] border border-white/[0.08] px-2.5 py-1.5 text-[12px] text-[#f2f2f0] placeholder-[#6e6e6a] focus:outline-none focus:border-white/25"
              />
              <div className="mt-2 text-[11px] text-[#8e8e8a]">
                {searchQuery ? `Showing quick matches for "${searchQuery}"` : 'Try: "Nov 2026", "Click & collect", "#4892"'}
              </div>
            </div>
          )}
          {activeTool === 'tasks' && (
            <ul className="space-y-1.5 text-[11.5px] text-[#d4d4d0]">
              <li className="rounded-lg bg-[#282826] px-2.5 py-1.5">Approve 6 pending online refunds</li>
              <li className="rounded-lg bg-[#282826] px-2.5 py-1.5">Restock SKU-1042 (Brass Brackets)</li>
              <li className="rounded-lg bg-[#282826] px-2.5 py-1.5">Review 3 unread VIP inquiries</li>
            </ul>
          )}
          {activeTool === 'settings' && (
            <div className="text-[11.5px] text-[#a0a09c] space-y-1.5">
              <div className="flex justify-between"><span>Currency</span><span className="text-[#ededeb]">USD ($)</span></div>
              <div className="flex justify-between"><span>Fiscal Period</span><span className="text-[#ededeb]">Nov 2026 MTD</span></div>
              <div className="flex justify-between"><span>Live Refresh</span><span className="text-[#58c08d]">Active</span></div>
            </div>
          )}
          {activeTool === 'help' && (
            <div className="text-[11.5px] text-[#a0a09c] leading-relaxed">
              Metrics reflect November 2026 month-to-date across Online and In-store POS channels. Hover any info icon for definitions.
            </div>
          )}
          {activeTool === 'ai' && (
            <div className="text-[11.5px] text-[#a0a09c] leading-relaxed">
              Online conversion climbed while peak traffic concentrated in 4 PM – 12 AM weekday and weekend afternoon windows.
            </div>
          )}
          {activeTool === 'theme' && (
            <div className="text-[11.5px] text-[#a0a09c]">
              Charcoal Studio theme is active for Orpheus.
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
