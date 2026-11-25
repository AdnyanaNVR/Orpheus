export type KasirCategoryId =
  | 'Semua'
  | 'Perangkat Keras'
  | 'Aksesori'
  | 'Komponen'
  | 'Paket Kit'
  | 'Layanan';

export interface KasirProduct {
  id: string;
  sku: string;
  name: string;
  category: Exclude<KasirCategoryId, 'Semua'>;
  price: number;
  unitLabel?: string;
  stock: number;
}

export interface KasirCustomer {
  id: string;
  name: string;
  type: string;
}

export const KASIR_CATEGORIES: { id: KasirCategoryId; label: string }[] = [
  { id: 'Semua', label: 'Semua' },
  { id: 'Perangkat Keras', label: 'Perangkat Keras' },
  { id: 'Aksesori', label: 'Aksesori' },
  { id: 'Komponen', label: 'Komponen' },
  { id: 'Paket Kit', label: 'Paket Kit' },
  { id: 'Layanan', label: 'Layanan' },
];

export const KASIR_CUSTOMERS: KasirCustomer[] = [
  { id: 'cust-1', name: 'Harbor Millwork', type: 'Mitra Bengkel' },
  { id: 'cust-2', name: 'Apex Fabrication', type: 'Kontraktor' },
  { id: 'cust-3', name: 'Northline Builders', type: 'Proyek Komersial' },
  { id: 'cust-4', name: 'Studio Kestrel', type: 'Studio Desain' },
  { id: 'cust-5', name: 'Pelanggan Umum', type: 'Ritel Langsung' },
];

export const INITIAL_KASIR_PRODUCTS: KasirProduct[] = [
  {
    id: 'prod-1',
    sku: 'SKU-1042',
    name: 'Braket Orpheus Kokoh — Hitam Doff',
    category: 'Perangkat Keras',
    price: 255000,
    stock: 14,
  },
  {
    id: 'prod-2',
    sku: 'SKU-2088',
    name: 'Pin Rak Kuningan Giling (Isi 20)',
    category: 'Aksesori',
    price: 450000,
    stock: 9,
  },
  {
    id: 'prod-3',
    sku: 'SKU-3115',
    name: 'Gusset Baja Tersembunyi 8"',
    category: 'Komponen',
    price: 270000,
    stock: 7,
  },
  {
    id: 'prod-4',
    sku: 'SKU-4010',
    name: 'Kit Rel Aluminium Anodized',
    category: 'Paket Kit',
    price: 680000,
    stock: 4,
  },
  {
    id: 'prod-5',
    sku: 'SKU-1089',
    name: 'Engsel Pivot Presisi — Grafit',
    category: 'Perangkat Keras',
    price: 385000,
    stock: 12,
  },
  {
    id: 'prod-6',
    sku: 'SKU-2104',
    name: 'Klem Kaca Tempered 10mm',
    category: 'Aksesori',
    price: 165000,
    stock: 16,
  },
  {
    id: 'prod-7',
    sku: 'SKU-4045',
    name: 'Set Rak Modular Ruang Display',
    category: 'Paket Kit',
    price: 1150000,
    stock: 3,
  },
  {
    id: 'prod-8',
    sku: 'SKU-3190',
    name: 'Baut Jangkar Beton M10 (Isi 10)',
    category: 'Komponen',
    price: 120000,
    stock: 20,
  },
  {
    id: 'prod-9',
    sku: 'SKU-3205',
    name: 'Sekrup Kayu Kepala Rata — Hitam',
    category: 'Komponen',
    price: 45000,
    unitLabel: 'pak',
    stock: 64,
  },
  {
    id: 'prod-10',
    sku: 'SKU-2130',
    name: 'Bantalan Karet Anti-Selip 4mm',
    category: 'Aksesori',
    price: 35000,
    unitLabel: 'lembar',
    stock: 48,
  },
  {
    id: 'prod-11',
    sku: 'SKU-1120',
    name: 'Rel Laci Soft-Close 450mm',
    category: 'Perangkat Keras',
    price: 210000,
    unitLabel: 'pasang',
    stock: 32,
  },
  {
    id: 'prod-12',
    sku: 'SKU-5012',
    name: 'Jasa Potong & Penyesuaian Profil',
    category: 'Layanan',
    price: 95000,
    unitLabel: 'sesi',
    stock: 99,
  },
];

export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}
