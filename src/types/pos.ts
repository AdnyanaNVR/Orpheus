export type NavTab =
  | 'Dasbor'
  | 'Kasir'
  | 'Produk'
  | 'Transaksi'
  | 'Pengaturan';

export type PeriodFilter = 'Hari Ini' | '7 Hari' | '30 Hari';
export type RevenueRange = '7 Hari' | '30 Hari';
export type PaymentMethod = 'QRIS' | 'Kartu' | 'Tunai';
export type TransactionStatus = 'Selesai' | 'Dikembalikan';

export interface PosProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
}

export interface TransactionLineItem {
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface TransactionRecord {
  id: string;
  receiptNo: string;
  dateLabel: string;
  timestamp: number;
  method: PaymentMethod;
  status: TransactionStatus;
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidCash: number;
  changeAmount: number;
  items: TransactionLineItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
}

export interface DailyRevenuePoint {
  label: string;
  fullLabel: string;
  revenue: number;
  transactions: number;
}

export interface DashboardDataset {
  kpis: {
    activeSales: { value: string; bars: [number, number, number] };
    revenue: { value: string; spark: number[] };
    unitsSold: { value: string; percent: number };
    completedTransactions: { value: string; bars: number[] };
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
  revenueSeries: {
    range: RevenueRange;
    totalFormatted: string;
    subtitle: string;
    average: number;
    yMax: number;
    yTicks: number[];
    defaultActiveIndex: number;
    points: DailyRevenuePoint[];
  };
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface StoreProfile {
  id: string;
  storeName: string;
}

export interface AuthResponse {
  accessToken: string | null;
  user: AuthUser | null;
  store: StoreProfile | null;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

export interface PosBootstrapPayload {
  storeName: string;
  products: PosProduct[];
  transactions: TransactionRecord[];
  notifications: NotificationItem[];
}

