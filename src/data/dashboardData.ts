export type NavTab =
  | 'Dashboard'
  | 'Orders'
  | 'Products'
  | 'Customers'
  | 'Messages'
  | 'Analytics'
  | 'Automations';

export type ChannelFilter = 'Overview' | 'Online' | 'In store';

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number; // in dollars
  orders: number;
  vsLastYear: string;
}

export interface ChannelDataset {
  liveNow: string;
  kpis: {
    activeSales: { value: string; delta: string; positive: boolean; bars: [number, number, number] };
    revenue: { value: string; delta: string; positive: boolean; spark: number[] };
    unitsSold: { value: string; delta: string; positive: boolean; percent: number };
    conversionRate: { value: string; delta: string; positive: boolean; bars: number[] };
  };
  performance: {
    score: number;
    delta: string;
    headline: string;
    subtext: string;
  };
  revenueChart: {
    ytd2026: string;
    ytd2025: string;
    avg2026: number;
    avg2025: number;
    data2026: MonthlyRevenuePoint[];
    data2025: MonthlyRevenuePoint[];
  };
  heatmap: {
    levels: number[][]; // 4 rows x 7 cols (0..4)
    counts: number[][]; // exact visit counts for hover
  };
  totalVisits: {
    total: string;
    delta: string;
    highlightPercent: number;
    highlightLabel: string;
    channels: {
      name: string;
      count: number;
      formatted: string;
      percent: number;
      color: string;
    }[];
  };
}

export const CHANNEL_DATA: Record<ChannelFilter, ChannelDataset> = {
  Overview: {
    liveNow: '1,312',
    kpis: {
      activeSales: {
        value: '$48,320',
        delta: '14.2%',
        positive: true,
        bars: [0.58, 0.72, 1.0],
      },
      revenue: {
        value: '$42,300',
        delta: '7.1%',
        positive: true,
        spark: [12, 26, 22, 28, 30, 38],
      },
      unitsSold: {
        value: '3,842',
        delta: '6.4%',
        positive: true,
        percent: 77,
      },
      conversionRate: {
        value: '4.8%',
        delta: '-0.2 pt',
        positive: false,
        bars: [0.42, 0.48, 0.45, 0.42, 0.56, 0.54, 0.48, 0.68],
      },
    },
    performance: {
      score: 86,
      delta: '+3',
      headline: 'Ahead of plan',
      subtext: 'Both channels beat last month. Online did most of the lifting.',
    },
    revenueChart: {
      ytd2026: '$342,300',
      ytd2025: '$294,800',
      avg2026: 31100,
      avg2025: 26800,
      data2026: [
        { month: 'Jan', revenue: 18400, orders: 268, vsLastYear: '+9.4%' },
        { month: 'Feb', revenue: 20600, orders: 294, vsLastYear: '+11.2%' },
        { month: 'Mar', revenue: 25100, orders: 356, vsLastYear: '+14.8%' },
        { month: 'Apr', revenue: 23400, orders: 331, vsLastYear: '+10.1%' },
        { month: 'May', revenue: 28200, orders: 402, vsLastYear: '+15.6%' },
        { month: 'Jun', revenue: 37800, orders: 528, vsLastYear: '+18.4%' },
        { month: 'Jul', revenue: 33200, orders: 465, vsLastYear: '+12.9%' },
        { month: 'Aug', revenue: 30400, orders: 429, vsLastYear: '+11.5%' },
        { month: 'Sep', revenue: 35800, orders: 504, vsLastYear: '+17.2%' },
        { month: 'Oct', revenue: 37900, orders: 534, vsLastYear: '+19.0%' },
        { month: 'Nov', revenue: 42300, orders: 596, vsLastYear: '+21.2%' },
        { month: 'Dec', revenue: 48600, orders: 682, vsLastYear: '+23.4%' },
      ],
      data2025: [
        { month: 'Jan', revenue: 16800, orders: 240, vsLastYear: '+4.1%' },
        { month: 'Feb', revenue: 18500, orders: 265, vsLastYear: '+5.8%' },
        { month: 'Mar', revenue: 21900, orders: 312, vsLastYear: '+7.2%' },
        { month: 'Apr', revenue: 21200, orders: 304, vsLastYear: '+6.0%' },
        { month: 'May', revenue: 24400, orders: 348, vsLastYear: '+8.3%' },
        { month: 'Jun', revenue: 31900, orders: 452, vsLastYear: '+11.4%' },
        { month: 'Jul', revenue: 29400, orders: 416, vsLastYear: '+9.5%' },
        { month: 'Aug', revenue: 27300, orders: 388, vsLastYear: '+8.1%' },
        { month: 'Sep', revenue: 30500, orders: 432, vsLastYear: '+10.6%' },
        { month: 'Oct', revenue: 31800, orders: 450, vsLastYear: '+12.2%' },
        { month: 'Nov', revenue: 34900, orders: 492, vsLastYear: '+14.7%' },
        { month: 'Dec', revenue: 39400, orders: 554, vsLastYear: '+16.5%' },
      ],
    },
    heatmap: {
      // Exact visual levels matching reference screenshot:
      // 0: #2e2e2c, 1: #4c4c4a, 2: #8a8a86, 3: #b8b8b4, 4: #ededeb
      levels: [
        [0, 0, 0, 0, 0, 0, 0],
        [2, 1, 2, 2, 1, 4, 4],
        [2, 2, 2, 2, 2, 4, 4],
        [4, 4, 4, 4, 4, 2, 4],
      ],
      counts: [
        [1420, 1280, 1510, 1490, 1360, 1680, 1740],
        [6840, 4120, 6950, 7180, 4390, 11420, 11890],
        [7210, 7450, 7620, 7380, 7890, 12340, 12610],
        [11940, 12180, 12450, 12820, 13150, 7940, 13480],
      ],
    },
    totalVisits: {
      total: '214,860',
      delta: '8.5%',
      highlightPercent: 76,
      highlightLabel: 'Website',
      channels: [
        { name: 'Website', count: 162400, formatted: '162,400', percent: 75.6, color: '#ededeb' },
        { name: 'In store', count: 41440, formatted: '41,440', percent: 19.3, color: '#7a7a76' },
        { name: 'Click & collect', count: 11020, formatted: '11,020', percent: 5.1, color: '#3e3e3c' },
      ],
    },
  },
  Online: {
    liveNow: '1,048',
    kpis: {
      activeSales: {
        value: '$35,180',
        delta: '17.6%',
        positive: true,
        bars: [0.52, 0.68, 1.0],
      },
      revenue: {
        value: '$31,420',
        delta: '9.4%',
        positive: true,
        spark: [10, 20, 22, 27, 33, 40],
      },
      unitsSold: {
        value: '2,914',
        delta: '8.1%',
        positive: true,
        percent: 82,
      },
      conversionRate: {
        value: '4.4%',
        delta: '+0.3 pt',
        positive: true,
        bars: [0.36, 0.44, 0.48, 0.50, 0.56, 0.60, 0.64, 0.76],
      },
    },
    performance: {
      score: 91,
      delta: '+5',
      headline: 'Strong online momentum',
      subtext: 'Checkout speed and mobile cart recovery drove higher order volume.',
    },
    revenueChart: {
      ytd2026: '$256,800',
      ytd2025: '$212,400',
      avg2026: 23300,
      avg2025: 19300,
      data2026: [
        { month: 'Jan', revenue: 13800, orders: 204, vsLastYear: '+12.1%' },
        { month: 'Feb', revenue: 15400, orders: 224, vsLastYear: '+13.4%' },
        { month: 'Mar', revenue: 18900, orders: 274, vsLastYear: '+16.8%' },
        { month: 'Apr', revenue: 17500, orders: 251, vsLastYear: '+12.5%' },
        { month: 'May', revenue: 21400, orders: 308, vsLastYear: '+18.2%' },
        { month: 'Jun', revenue: 28600, orders: 412, vsLastYear: '+20.6%' },
        { month: 'Jul', revenue: 25100, orders: 362, vsLastYear: '+15.4%' },
        { month: 'Aug', revenue: 22900, orders: 332, vsLastYear: '+14.0%' },
        { month: 'Sep', revenue: 27100, orders: 389, vsLastYear: '+19.8%' },
        { month: 'Oct', revenue: 28800, orders: 414, vsLastYear: '+21.4%' },
        { month: 'Nov', revenue: 31420, orders: 452, vsLastYear: '+24.1%' },
        { month: 'Dec', revenue: 36900, orders: 528, vsLastYear: '+26.2%' },
      ],
      data2025: [
        { month: 'Jan', revenue: 12300, orders: 182, vsLastYear: '+6.1%' },
        { month: 'Feb', revenue: 13500, orders: 196, vsLastYear: '+7.4%' },
        { month: 'Mar', revenue: 16200, orders: 236, vsLastYear: '+8.8%' },
        { month: 'Apr', revenue: 15500, orders: 226, vsLastYear: '+7.5%' },
        { month: 'May', revenue: 18100, orders: 262, vsLastYear: '+10.2%' },
        { month: 'Jun', revenue: 23700, orders: 344, vsLastYear: '+12.6%' },
        { month: 'Jul', revenue: 21700, orders: 314, vsLastYear: '+11.4%' },
        { month: 'Aug', revenue: 20100, orders: 292, vsLastYear: '+10.0%' },
        { month: 'Sep', revenue: 22600, orders: 328, vsLastYear: '+12.8%' },
        { month: 'Oct', revenue: 23700, orders: 342, vsLastYear: '+14.4%' },
        { month: 'Nov', revenue: 25300, orders: 366, vsLastYear: '+16.1%' },
        { month: 'Dec', revenue: 29200, orders: 422, vsLastYear: '+18.2%' },
      ],
    },
    heatmap: {
      levels: [
        [0, 0, 0, 0, 0, 0, 0],
        [2, 1, 2, 2, 1, 4, 4],
        [2, 2, 2, 2, 2, 4, 4],
        [4, 4, 4, 4, 4, 2, 4],
      ],
      counts: [
        [1220, 1100, 1340, 1290, 1180, 1490, 1520],
        [5420, 3290, 5610, 5840, 3510, 9640, 9980],
        [5810, 6020, 6190, 5940, 6340, 10240, 10510],
        [10440, 10820, 11120, 11490, 11820, 6510, 12190],
      ],
    },
    totalVisits: {
      total: '173,420',
      delta: '10.2%',
      highlightPercent: 94,
      highlightLabel: 'Website',
      channels: [
        { name: 'Website', count: 162400, formatted: '162,400', percent: 93.6, color: '#ededeb' },
        { name: 'Click & collect', count: 11020, formatted: '11,020', percent: 6.4, color: '#3e3e3c' },
      ],
    },
  },
  'In store': {
    liveNow: '264',
    kpis: {
      activeSales: {
        value: '$13,140',
        delta: '6.8%',
        positive: true,
        bars: [0.64, 0.78, 0.92],
      },
      revenue: {
        value: '$10,880',
        delta: '2.4%',
        positive: true,
        spark: [18, 22, 20, 24, 25, 29],
      },
      unitsSold: {
        value: '928',
        delta: '3.1%',
        positive: true,
        percent: 68,
      },
      conversionRate: {
        value: '6.2%',
        delta: '-0.4 pt',
        positive: false,
        bars: [0.54, 0.52, 0.48, 0.44, 0.52, 0.50, 0.46, 0.62],
      },
    },
    performance: {
      score: 79,
      delta: '+1',
      headline: 'Steady store traffic',
      subtext: 'Weekend footfall remained high across flagship retail locations.',
    },
    revenueChart: {
      ytd2026: '$85,500',
      ytd2025: '$82,400',
      avg2026: 7800,
      avg2025: 7500,
      data2026: [
        { month: 'Jan', revenue: 4600, orders: 64, vsLastYear: '+3.1%' },
        { month: 'Feb', revenue: 5200, orders: 70, vsLastYear: '+4.2%' },
        { month: 'Mar', revenue: 6200, orders: 82, vsLastYear: '+6.4%' },
        { month: 'Apr', revenue: 5900, orders: 80, vsLastYear: '+4.8%' },
        { month: 'May', revenue: 6800, orders: 94, vsLastYear: '+7.2%' },
        { month: 'Jun', revenue: 9200, orders: 116, vsLastYear: '+9.1%' },
        { month: 'Jul', revenue: 8100, orders: 103, vsLastYear: '+5.8%' },
        { month: 'Aug', revenue: 7500, orders: 97, vsLastYear: '+4.4%' },
        { month: 'Sep', revenue: 8700, orders: 115, vsLastYear: '+8.2%' },
        { month: 'Oct', revenue: 9100, orders: 120, vsLastYear: '+9.5%' },
        { month: 'Nov', revenue: 10880, orders: 144, vsLastYear: '+11.4%' },
        { month: 'Dec', revenue: 11700, orders: 154, vsLastYear: '+12.8%' },
      ],
      data2025: [
        { month: 'Jan', revenue: 4500, orders: 58, vsLastYear: '+1.8%' },
        { month: 'Feb', revenue: 5000, orders: 69, vsLastYear: '+2.4%' },
        { month: 'Mar', revenue: 5700, orders: 76, vsLastYear: '+3.2%' },
        { month: 'Apr', revenue: 5700, orders: 78, vsLastYear: '+2.9%' },
        { month: 'May', revenue: 6300, orders: 86, vsLastYear: '+4.1%' },
        { month: 'Jun', revenue: 8200, orders: 108, vsLastYear: '+6.0%' },
        { month: 'Jul', revenue: 7700, orders: 102, vsLastYear: '+4.5%' },
        { month: 'Aug', revenue: 7200, orders: 96, vsLastYear: '+3.8%' },
        { month: 'Sep', revenue: 7900, orders: 104, vsLastYear: '+5.1%' },
        { month: 'Oct', revenue: 8100, orders: 108, vsLastYear: '+5.9%' },
        { month: 'Nov', revenue: 9600, orders: 126, vsLastYear: '+7.4%' },
        { month: 'Dec', revenue: 10200, orders: 132, vsLastYear: '+8.2%' },
      ],
    },
    heatmap: {
      levels: [
        [0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 2, 1, 4, 4],
        [2, 2, 2, 2, 2, 4, 4],
        [2, 2, 2, 4, 4, 2, 4],
      ],
      counts: [
        [200, 180, 170, 200, 180, 190, 220],
        [1420, 830, 1340, 1340, 880, 1780, 1910],
        [1400, 1430, 1430, 1440, 1550, 2100, 2100],
        [1500, 1360, 1330, 1330, 1330, 1430, 1290],
      ],
    },
    totalVisits: {
      total: '41,440',
      delta: '4.1%',
      highlightPercent: 100,
      highlightLabel: 'In store',
      channels: [
        { name: 'In store', count: 41440, formatted: '41,440', percent: 100, color: '#7a7a76' },
      ],
    },
  },
};

export function exportDashboardCsv(channel: ChannelFilter, year: '2025' | '2026') {
  const dataset = CHANNEL_DATA[channel];
  const rows = year === '2026' ? dataset.revenueChart.data2026 : dataset.revenueChart.data2025;
  const lines = [
    ['Orpheus - Dashboard Export', `Channel: ${channel}`, `Year: ${year}`].join(','),
    ['Metric', 'Value', 'Change'].join(','),
    ['Active sales', dataset.kpis.activeSales.value, dataset.kpis.activeSales.delta].join(','),
    ['Revenue (MTD)', dataset.kpis.revenue.value, dataset.kpis.revenue.delta].join(','),
    ['Units sold', dataset.kpis.unitsSold.value, dataset.kpis.unitsSold.delta].join(','),
    ['Conversion rate', dataset.kpis.conversionRate.value, dataset.kpis.conversionRate.delta].join(','),
    ['Total visits', dataset.totalVisits.total, dataset.totalVisits.delta].join(','),
    '',
    ['Month', 'Revenue ($)', 'Orders', 'vs Last Year'].join(','),
    ...rows.map((r) => [r.month, r.revenue, r.orders, r.vsLastYear].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orpheus-dashboard-${channel.toLowerCase().replace(/\s+/g, '-')}-${year}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
