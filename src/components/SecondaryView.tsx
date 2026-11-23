import React from 'react';
import { NavTab } from '../data/dashboardData';

interface SecondaryViewProps {
  tab: Exclude<NavTab, 'Dashboard'>;
  onBackToDashboard: () => void;
}

const VIEW_CONTENT: Record<
  Exclude<NavTab, 'Dashboard'>,
  { subtitle: string; rows: { col1: string; col2: string; col3: string; badge: string }[] }
> = {
  Orders: {
    subtitle: '14 orders currently awaiting fulfillment across Online and Click & collect.',
    rows: [
      { col1: '#4894 — Apex Fabrication', col2: 'Online • 18 units', col3: '$2,140', badge: 'Ready to ship' },
      { col1: '#4893 — Harbor Millwork', col2: 'Click & collect • 6 units', col3: '$680', badge: 'Awaiting pickup' },
      { col1: '#4892 — Northline Builders', col2: 'Online • 24 units', col3: '$3,420', badge: 'Packing' },
      { col1: '#4891 — Studio Kestrel', col2: 'In store • 4 units', col3: '$410', badge: 'Completed' },
    ],
  },
  Products: {
    subtitle: '3,842 units sold month-to-date across architectural hardware and fasteners.',
    rows: [
      { col1: 'Heavy Orpheus Bracket — Matte Black', col2: 'SKU-1042 • 842 sold', col3: '$14,314', badge: 'In stock' },
      { col1: 'Milled Brass Shelf Pin (20-pack)', col2: 'SKU-2088 • 1,120 sold', col3: '$9,520', badge: 'Low stock' },
      { col1: 'Concealed Steel Gusset 8"', col2: 'SKU-3115 • 618 sold', col3: '$11,124', badge: 'In stock' },
      { col1: 'Anodized Aluminum Rail Kit', col2: 'SKU-4010 • 410 sold', col3: '$7,342', badge: 'In stock' },
    ],
  },
  Customers: {
    subtitle: 'Active trade and retail accounts contributing to November 2026 volume.',
    rows: [
      { col1: 'Northline Builders Co.', col2: '42 orders YTD', col3: '$38,940', badge: 'Trade Pro' },
      { col1: 'Harbor Millwork Studio', col2: '29 orders YTD', col3: '$24,180', badge: 'Trade Pro' },
      { col1: 'Apex Fabrication LLC', col2: '19 orders YTD', col3: '$18,620', badge: 'Repeat' },
      { col1: 'Kestrel Interior Group', col2: '14 orders YTD', col3: '$12,410', badge: 'Repeat' },
    ],
  },
  Messages: {
    subtitle: '3 open customer inquiries assigned to the Orpheus support queue.',
    rows: [
      { col1: 'Northline Builders — Bulk lead time check', col2: 'Order #4892 • 12m ago', col3: 'MR', badge: 'Unread' },
      { col1: 'Elena Vance — Pickup window change', col2: 'Order #4889 • 48m ago', col3: 'JO', badge: 'Unread' },
      { col1: 'Studio Kestrel — Custom finish quote', col2: 'RFQ-119 • 2h ago', col3: 'AP', badge: 'Unread' },
    ],
  },
  Analytics: {
    subtitle: 'Full funnel and channel attribution breakdown for November 2026.',
    rows: [
      { col1: 'Storefront Sessions -> Product View', col2: '162,400 -> 94,190', col3: '58.0%', badge: '+2.4 pt' },
      { col1: 'Product View -> Add to Cart', col2: '94,190 -> 18,838', col3: '20.0%', badge: '+0.8 pt' },
      { col1: 'Checkout -> Completed Order', col2: '12,410 -> 7,795', col3: '62.8%', badge: '-0.2 pt' },
      { col1: 'Click & Collect Fulfillment Rate', col2: '11,020 visits', col3: '96.4%', badge: '+1.1 pt' },
    ],
  },
  Automations: {
    subtitle: 'Active store workflows running for inventory alerts and cart recovery.',
    rows: [
      { col1: 'Abandoned Cart Recovery (2h delay)', col2: '184 recovered this month', col3: '$11,420', badge: 'Active' },
      { col1: 'Low-Stock Trade Reorder Alert', col2: 'Threshold: < 40 units', col3: '12 triggers', badge: 'Active' },
      { col1: 'Click & Collect Ready SMS', col2: '99.2% delivery rate', col3: '412 sent', badge: 'Active' },
    ],
  },
};

export const SecondaryView: React.FC<SecondaryViewProps> = ({ tab, onBackToDashboard }) => {
  const content = VIEW_CONTENT[tab];

  return (
    <div className="mt-[14px]">
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h1 className="text-[31px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none">
            {tab}
          </h1>
          <p className="text-[12.5px] text-[#888884] mt-2">{content.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="rounded-full bg-[#ededeb] text-[#141414] px-4 py-2 text-[12px] font-semibold hover:bg-white transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] p-5 space-y-2.5">
        {content.rows.map((row) => (
          <div
            key={row.col1}
            className="flex items-center justify-between rounded-[14px] bg-[#21211f] border border-white/[0.04] px-4 py-3.5"
          >
            <div>
              <div className="text-[13.5px] font-medium text-[#f2f2f0]">{row.col1}</div>
              <div className="text-[11.5px] text-[#888884] mt-0.5">{row.col2}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13.5px] font-semibold text-[#f2f2f0] tabular-nums">{row.col3}</span>
              <span className="rounded-full bg-[#2b2b29] px-3 py-1 text-[11px] font-medium text-[#d4d4d0]">
                {row.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
