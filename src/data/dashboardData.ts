export type NavTab =
  | 'Dasbor'
  | 'Kasir'
  | 'Produk'
  | 'Transaksi'
  | 'Analisis'
  | 'Pengaturan';

export type PeriodFilter = 'Hari Ini' | '7 Hari' | '30 Hari';
export type RevenueRange = '7 Hari' | '30 Hari';

export interface DailyRevenuePoint {
  label: string;
  fullLabel: string;
  revenue: number;
  transactions: number;
}

export interface PeriodDataset {
  liveNow: string;
  kpis: {
    activeSales: { value: string; bars: [number, number, number] };
    revenue: { value: string; spark: number[] };
    unitsSold: { value: string; percent: number };
    conversionRate: { value: string; bars: number[] };
  };
  heatmap: {
    levels: number[][];
    counts: number[][];
  };
  totalTransactions: {
    total: string;
    highlightPercent: number;
    highlightLabel: string;
    methods: {
      name: string;
      count: number;
      formatted: string;
      percent: number;
      color: string;
    }[];
  };
}

export const REVENUE_BY_RANGE: Record<
  RevenueRange,
  {
    totalFormatted: string;
    subtitle: string;
    average: number;
    yMax: number;
    yTicks: number[];
    defaultActiveIndex: number;
    points: DailyRevenuePoint[];
  }
> = {
  '7 Hari': {
    totalFormatted: '$10.980',
    subtitle: '7 hari terakhir',
    average: 1568,
    yMax: 2400,
    yTicks: [2400, 1800, 1200, 600, 0],
    defaultActiveIndex: 5,
    points: [
      { label: '17 Nov', fullLabel: 'Sel, 17 Nov 2026', revenue: 1240, transactions: 42 },
      { label: '18 Nov', fullLabel: 'Rab, 18 Nov 2026', revenue: 1380, transactions: 48 },
      { label: '19 Nov', fullLabel: 'Kam, 19 Nov 2026', revenue: 1510, transactions: 53 },
      { label: '20 Nov', fullLabel: 'Jum, 20 Nov 2026', revenue: 1690, transactions: 61 },
      { label: '21 Nov', fullLabel: 'Sab, 21 Nov 2026', revenue: 1940, transactions: 74 },
      { label: '22 Nov', fullLabel: 'Min, 22 Nov 2026', revenue: 2040, transactions: 78 },
      { label: '23 Nov', fullLabel: 'Sen, 23 Nov 2026', revenue: 1180, transactions: 39 },
    ],
  },
  '30 Hari': {
    totalFormatted: '$42.300',
    subtitle: '30 hari terakhir',
    average: 1410,
    yMax: 2400,
    yTicks: [2400, 1800, 1200, 600, 0],
    defaultActiveIndex: 25,
    points: [
      { label: '25 Okt', fullLabel: '25 Okt 2026', revenue: 980, transactions: 31 },
      { label: '26 Okt', fullLabel: '26 Okt 2026', revenue: 1120, transactions: 36 },
      { label: '27 Okt', fullLabel: '27 Okt 2026', revenue: 1040, transactions: 33 },
      { label: '28 Okt', fullLabel: '28 Okt 2026', revenue: 1210, transactions: 39 },
      { label: '29 Okt', fullLabel: '29 Okt 2026', revenue: 1160, transactions: 37 },
      { label: '30 Okt', fullLabel: '30 Okt 2026', revenue: 1340, transactions: 44 },
      { label: '31 Okt', fullLabel: '31 Okt 2026', revenue: 1520, transactions: 51 },
      { label: '1 Nov', fullLabel: '1 Nov 2026', revenue: 1480, transactions: 49 },
      { label: '2 Nov', fullLabel: '2 Nov 2026', revenue: 1190, transactions: 38 },
      { label: '3 Nov', fullLabel: '3 Nov 2026', revenue: 1260, transactions: 41 },
      { label: '4 Nov', fullLabel: '4 Nov 2026', revenue: 1310, transactions: 43 },
      { label: '5 Nov', fullLabel: '5 Nov 2026', revenue: 1390, transactions: 46 },
      { label: '6 Nov', fullLabel: '6 Nov 2026', revenue: 1560, transactions: 54 },
      { label: '7 Nov', fullLabel: '7 Nov 2026', revenue: 1740, transactions: 62 },
      { label: '8 Nov', fullLabel: '8 Nov 2026', revenue: 1620, transactions: 57 },
      { label: '9 Nov', fullLabel: '9 Nov 2026', revenue: 1280, transactions: 42 },
      { label: '10 Nov', fullLabel: '10 Nov 2026', revenue: 1350, transactions: 45 },
      { label: '11 Nov', fullLabel: '11 Nov 2026', revenue: 1420, transactions: 48 },
      { label: '12 Nov', fullLabel: '12 Nov 2026', revenue: 1490, transactions: 50 },
      { label: '13 Nov', fullLabel: '13 Nov 2026', revenue: 1640, transactions: 58 },
      { label: '14 Nov', fullLabel: '14 Nov 2026', revenue: 1810, transactions: 66 },
      { label: '15 Nov', fullLabel: '15 Nov 2026', revenue: 1680, transactions: 60 },
      { label: '16 Nov', fullLabel: '16 Nov 2026', revenue: 1330, transactions: 44 },
      { label: '17 Nov', fullLabel: '17 Nov 2026', revenue: 1240, transactions: 42 },
      { label: '18 Nov', fullLabel: '18 Nov 2026', revenue: 1380, transactions: 48 },
      { label: '19 Nov', fullLabel: '19 Nov 2026', revenue: 1980, transactions: 72 },
      { label: '20 Nov', fullLabel: '20 Nov 2026', revenue: 1690, transactions: 61 },
      { label: '21 Nov', fullLabel: '21 Nov 2026', revenue: 1940, transactions: 74 },
      { label: '22 Nov', fullLabel: '22 Nov 2026', revenue: 2040, transactions: 78 },
      { label: '23 Nov', fullLabel: '23 Nov 2026', revenue: 1180, transactions: 39 },
    ],
  },
};

export const PERIOD_DATA: Record<PeriodFilter, PeriodDataset> = {
  '30 Hari': {
    liveNow: '1.312',
    kpis: {
      activeSales: {
        value: '$48.320',
        bars: [0.58, 0.72, 1.0],
      },
      revenue: {
        value: '$42.300',
        spark: [12, 26, 22, 28, 30, 38],
      },
      unitsSold: {
        value: '3.842',
        percent: 77,
      },
      conversionRate: {
        value: '4,8%',
        bars: [0.42, 0.48, 0.45, 0.42, 0.56, 0.54, 0.48, 0.68],
      },
    },
    heatmap: {
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
    totalTransactions: {
      total: '214.860',
      highlightPercent: 76,
      highlightLabel: 'QRIS',
      methods: [
        { name: 'QRIS', count: 162400, formatted: '162.400', percent: 75.6, color: '#ededeb' },
        { name: 'Kartu Debit/Kredit', count: 41440, formatted: '41.440', percent: 19.3, color: '#7a7a76' },
        { name: 'Tunai', count: 11020, formatted: '11.020', percent: 5.1, color: '#3e3e3c' },
      ],
    },
  },
  '7 Hari': {
    liveNow: '1.048',
    kpis: {
      activeSales: {
        value: '$12.450',
        bars: [0.52, 0.68, 1.0],
      },
      revenue: {
        value: '$10.980',
        spark: [10, 20, 22, 27, 33, 40],
      },
      unitsSold: {
        value: '964',
        percent: 82,
      },
      conversionRate: {
        value: '5,1%',
        bars: [0.36, 0.44, 0.48, 0.50, 0.56, 0.60, 0.64, 0.76],
      },
    },
    heatmap: {
      levels: [
        [0, 0, 0, 0, 0, 0, 0],
        [2, 1, 2, 2, 2, 4, 4],
        [2, 2, 3, 2, 2, 4, 4],
        [4, 4, 4, 4, 4, 3, 4],
      ],
      counts: [
        [340, 310, 380, 360, 320, 410, 440],
        [1640, 1020, 1710, 1790, 1580, 2940, 3120],
        [1820, 1910, 2190, 1880, 1940, 3180, 3260],
        [3140, 3220, 3350, 3420, 3580, 2410, 3690],
      ],
    },
    totalTransactions: {
      total: '54.210',
      highlightPercent: 79,
      highlightLabel: 'QRIS',
      methods: [
        { name: 'QRIS', count: 42826, formatted: '42.826', percent: 79.0, color: '#ededeb' },
        { name: 'Kartu Debit/Kredit', count: 8674, formatted: '8.674', percent: 16.0, color: '#7a7a76' },
        { name: 'Tunai', count: 2710, formatted: '2.710', percent: 5.0, color: '#3e3e3c' },
      ],
    },
  },
  'Hari Ini': {
    liveNow: '264',
    kpis: {
      activeSales: {
        value: '$2.140',
        bars: [0.64, 0.78, 0.92],
      },
      revenue: {
        value: '$1.880',
        spark: [18, 22, 20, 24, 25, 29],
      },
      unitsSold: {
        value: '168',
        percent: 68,
      },
      conversionRate: {
        value: '6,2%',
        bars: [0.54, 0.52, 0.48, 0.44, 0.52, 0.50, 0.46, 0.62],
      },
    },
    heatmap: {
      levels: [
        [0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 2, 1, 4, 4],
        [2, 2, 2, 2, 2, 4, 4],
        [2, 2, 2, 4, 4, 2, 4],
      ],
      counts: [
        [45, 38, 42, 49, 44, 52, 58],
        [210, 165, 198, 224, 180, 390, 415],
        [235, 240, 248, 252, 265, 440, 460],
        [280, 275, 290, 410, 435, 310, 480],
      ],
    },
    totalTransactions: {
      total: '8.420',
      highlightPercent: 72,
      highlightLabel: 'QRIS',
      methods: [
        { name: 'QRIS', count: 6062, formatted: '6.062', percent: 72.0, color: '#ededeb' },
        { name: 'Kartu Debit/Kredit', count: 1684, formatted: '1.684', percent: 20.0, color: '#7a7a76' },
        { name: 'Tunai', count: 674, formatted: '674', percent: 8.0, color: '#3e3e3c' },
      ],
    },
  },
};

export function exportDashboardCsv(period: PeriodFilter, revenueRange: RevenueRange) {
  const dataset = PERIOD_DATA[period];
  const rev = REVENUE_BY_RANGE[revenueRange];
  const lines = [
    ['Orpheus Point of Sales - Ekspor Dasbor', `Periode: ${period}`, `Grafik: ${revenueRange}`].join(','),
    ['Metrik', 'Nilai'].join(','),
    ['Penjualan Aktif', dataset.kpis.activeSales.value].join(','),
    ['Pendapatan', dataset.kpis.revenue.value].join(','),
    ['Unit Terjual', dataset.kpis.unitsSold.value].join(','),
    ['Tingkat Konversi', dataset.kpis.conversionRate.value].join(','),
    ['Total Transaksi', dataset.totalTransactions.total].join(','),
    '',
    ['Tanggal', 'Pendapatan ($)', 'Transaksi'].join(','),
    ...rev.points.map((r) => [r.fullLabel, r.revenue, r.transactions].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orpheus-dasbor-${period.toLowerCase().replace(/\s+/g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
