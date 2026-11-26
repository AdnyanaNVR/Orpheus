import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthResponse,
  AuthUser,
  DailyRevenuePoint,
  DashboardDataset,
  NotificationItem,
  PaymentMethod,
  PeriodFilter,
  PosBootstrapPayload,
  PosProduct,
  RevenueRange,
  StoreProfile,
  TransactionLineItem,
  TransactionRecord,
  TransactionStatus,
} from '../types/pos.ts';

const TAX_RATE = 0.11;
const DAY_LABELS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_LABELS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function formatDateTimeLabel(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = MONTH_LABELS_SHORT[d.getMonth()] ?? '';
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

function formatDayMonthLabel(d: Date): string {
  return `${d.getDate()} ${MONTH_LABELS_SHORT[d.getMonth()] ?? ''}`;
}

function formatFullDayLabel(d: Date): string {
  const dayName = DAY_LABELS_SHORT[d.getDay()] ?? '';
  return `${dayName}, ${d.getDate()} ${MONTH_LABELS_SHORT[d.getMonth()] ?? ''} ${d.getFullYear()}`;
}

function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SEED_PRODUCTS: PosProduct[] = [
  { id: '0001', sku: 'SKU-1042', name: 'Braket Orpheus Kokoh — Hitam Doff', category: 'Perangkat Keras', costPrice: 165000, sellPrice: 255000, stock: 140 },
  { id: '0002', sku: 'SKU-2088', name: 'Pin Rak Kuningan Giling (Isi 20)', category: 'Aksesori', costPrice: 290000, sellPrice: 450000, stock: 95 },
  { id: '0003', sku: 'SKU-3115', name: 'Gusset Baja Tersembunyi 8"', category: 'Komponen', costPrice: 180000, sellPrice: 270000, stock: 112 },
  { id: '0004', sku: 'SKU-4010', name: 'Kit Rel Aluminium Anodized', category: 'Paket Kit', costPrice: 460000, sellPrice: 680000, stock: 4 },
  { id: '0005', sku: 'SKU-1089', name: 'Engsel Pivot Presisi — Grafit', category: 'Perangkat Keras', costPrice: 245000, sellPrice: 385000, stock: 128 },
  { id: '0006', sku: 'SKU-2104', name: 'Klem Kaca Tempered 10mm', category: 'Aksesori', costPrice: 105000, sellPrice: 165000, stock: 165 },
  { id: '0007', sku: 'SKU-4045', name: 'Set Rak Modular Ruang Display', category: 'Paket Kit', costPrice: 780000, sellPrice: 1150000, stock: 3 },
  { id: '0008', sku: 'SKU-3190', name: 'Baut Jangkar Beton M10 (Isi 10)', category: 'Komponen', costPrice: 75000, sellPrice: 120000, stock: 210 },
  { id: '0009', sku: 'SKU-3205', name: 'Sekrup Kayu Kepala Rata — Hitam', category: 'Komponen', costPrice: 28000, sellPrice: 45000, stock: 264 },
  { id: '0010', sku: 'SKU-2130', name: 'Bantalan Karet Anti-Selip 4mm', category: 'Aksesori', costPrice: 22000, sellPrice: 35000, stock: 145 },
  { id: '0011', sku: 'SKU-1120', name: 'Rel Laci Soft-Close 450mm', category: 'Perangkat Keras', costPrice: 138000, sellPrice: 210000, stock: 72 },
  { id: '0012', sku: 'SKU-1145', name: 'Engsel Pivot Mini — Hitam Matte', category: 'Perangkat Keras', costPrice: 145000, sellPrice: 225000, stock: 0 },
];

function createSeedTransactions(): TransactionRecord[] {
  const now = Date.now();
  const hour = 3600 * 1000;
  const day = 24 * hour;

  const raw: Array<{
    id: string;
    offsetMs: number;
    method: PaymentMethod;
    status: TransactionStatus;
    discountPercent: number;
    paidCash?: number;
    items: Array<{ productId: string; name: string; qty: number; unitPrice: number }>;
  }> = [
    {
      id: '0001',
      offsetMs: 1 * hour,
      method: 'QRIS',
      status: 'Selesai',
      discountPercent: 0,
      items: [
        { productId: '0001', name: 'Braket Orpheus Kokoh — Hitam Doff', qty: 4, unitPrice: 255000 },
        { productId: '0009', name: 'Sekrup Kayu Kepala Rata — Hitam', qty: 2, unitPrice: 45000 },
      ],
    },
    {
      id: '0002',
      offsetMs: 2 * hour,
      method: 'Kartu',
      status: 'Selesai',
      discountPercent: 5,
      items: [
        { productId: '0004', name: 'Kit Rel Aluminium Anodized', qty: 2, unitPrice: 680000 },
        { productId: '0005', name: 'Engsel Pivot Presisi — Grafit', qty: 3, unitPrice: 385000 },
      ],
    },
    {
      id: '0003',
      offsetMs: 3 * hour,
      method: 'Tunai',
      status: 'Selesai',
      discountPercent: 0,
      paidCash: 1200000,
      items: [
        { productId: '0002', name: 'Pin Rak Kuningan Giling (Isi 20)', qty: 2, unitPrice: 450000 },
        { productId: '0010', name: 'Bantalan Karet Anti-Selip 4mm', qty: 4, unitPrice: 35000 },
      ],
    },
    {
      id: '0004',
      offsetMs: 4 * hour,
      method: 'QRIS',
      status: 'Dikembalikan',
      discountPercent: 0,
      items: [
        { productId: '0007', name: 'Set Rak Modular Ruang Display', qty: 1, unitPrice: 1150000 },
      ],
    },
    {
      id: '0005',
      offsetMs: 5 * hour,
      method: 'QRIS',
      status: 'Selesai',
      discountPercent: 10,
      items: [
        { productId: '0007', name: 'Set Rak Modular Ruang Display', qty: 2, unitPrice: 1150000 },
        { productId: '0003', name: 'Gusset Baja Tersembunyi 8"', qty: 4, unitPrice: 270000 },
        { productId: '0008', name: 'Baut Jangkar Beton M10 (Isi 10)', qty: 3, unitPrice: 120000 },
      ],
    },
    {
      id: '0006',
      offsetMs: 6 * hour,
      method: 'Kartu',
      status: 'Selesai',
      discountPercent: 0,
      items: [
        { productId: '0006', name: 'Klem Kaca Tempered 10mm', qty: 6, unitPrice: 165000 },
        { productId: '0011', name: 'Rel Laci Soft-Close 450mm', qty: 2, unitPrice: 210000 },
      ],
    },
    {
      id: '0007',
      offsetMs: 1 * day + 2 * hour,
      method: 'Tunai',
      status: 'Selesai',
      discountPercent: 0,
      paidCash: 900000,
      items: [
        { productId: '0008', name: 'Baut Jangkar Beton M10 (Isi 10)', qty: 5, unitPrice: 120000 },
        { productId: '0009', name: 'Sekrup Kayu Kepala Rata — Hitam', qty: 4, unitPrice: 45000 },
      ],
    },
    {
      id: '0008',
      offsetMs: 1 * day + 4 * hour,
      method: 'QRIS',
      status: 'Selesai',
      discountPercent: 0,
      items: [
        { productId: '0005', name: 'Engsel Pivot Presisi — Grafit', qty: 4, unitPrice: 385000 },
      ],
    },
    {
      id: '0009',
      offsetMs: 2 * day + 3 * hour,
      method: 'Kartu',
      status: 'Selesai',
      discountPercent: 5,
      items: [
        { productId: '0001', name: 'Braket Orpheus Kokoh — Hitam Doff', qty: 6, unitPrice: 255000 },
        { productId: '0003', name: 'Gusset Baja Tersembunyi 8"', qty: 2, unitPrice: 270000 },
      ],
    },
    {
      id: '0010',
      offsetMs: 3 * day + 5 * hour,
      method: 'Tunai',
      status: 'Selesai',
      discountPercent: 0,
      paidCash: 900000,
      items: [
        { productId: '0011', name: 'Rel Laci Soft-Close 450mm', qty: 3, unitPrice: 210000 },
        { productId: '0010', name: 'Bantalan Karet Anti-Selip 4mm', qty: 5, unitPrice: 35000 },
      ],
    },
    {
      id: '0011',
      offsetMs: 5 * day + 2 * hour,
      method: 'QRIS',
      status: 'Selesai',
      discountPercent: 0,
      items: [
        { productId: '0004', name: 'Kit Rel Aluminium Anodized', qty: 1, unitPrice: 680000 },
        { productId: '0006', name: 'Klem Kaca Tempered 10mm', qty: 4, unitPrice: 165000 },
      ],
    },
    {
      id: '0012',
      offsetMs: 12 * day + 4 * hour,
      method: 'Kartu',
      status: 'Selesai',
      discountPercent: 0,
      items: [
        { productId: '0002', name: 'Pin Rak Kuningan Giling (Isi 20)', qty: 3, unitPrice: 450000 },
        { productId: '0001', name: 'Braket Orpheus Kokoh — Hitam Doff', qty: 2, unitPrice: 255000 },
      ],
    },
  ];

  return raw.map((entry) => {
    const ts = now - entry.offsetMs;
    const subtotal = entry.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const discountAmount = Math.round(subtotal * (entry.discountPercent / 100));
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(afterDiscount * TAX_RATE);
    const total = afterDiscount + taxAmount;
    const paidCash = entry.method === 'Tunai' ? entry.paidCash ?? total : 0;
    const changeAmount = entry.method === 'Tunai' ? Math.max(0, paidCash - total) : 0;

    return {
      id: entry.id,
      receiptNo: `#POS-${entry.id}`,
      dateLabel: formatDateTimeLabel(ts),
      timestamp: ts,
      method: entry.method,
      status: entry.status,
      discountPercent: entry.discountPercent,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      paidCash,
      changeAmount,
      items: entry.items,
    };
  });
}

export class PosError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface MemoryUserRecord {
  id: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
}

interface MemoryStoreRecord {
  id: string;
  ownerId: string;
  storeName: string;
  products: PosProduct[];
  transactions: TransactionRecord[];
}

interface MemoryDatabase {
  sessionSecret: string;
  usersByEmail: Map<string, MemoryUserRecord>;
  usersById: Map<string, MemoryUserRecord>;
  storesByOwnerId: Map<string, MemoryStoreRecord>;
}

declare global {
  var __orpheusMemoryDb: MemoryDatabase | undefined;
}

function getMemoryDb(): MemoryDatabase {
  if (!global.__orpheusMemoryDb) {
    const envSecret = process.env.AUTH_SESSION_SECRET?.trim();
    global.__orpheusMemoryDb = {
      sessionSecret:
        envSecret && envSecret.length >= 16
          ? envSecret
          : crypto.randomBytes(32).toString('hex'),
      usersByEmail: new Map(),
      usersById: new Map(),
      storesByOwnerId: new Map(),
    };
  }
  return global.__orpheusMemoryDb;
}

function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

function createAnonSupabaseClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function createScopedSupabaseClient(accessToken: string): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function hashPassword(password: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex ?? crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

function verifyPassword(password: string, salt: string, expectedHashHex: string): boolean {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHashHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signInMemoryToken(userId: string): string {
  const db = getMemoryDb();
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      exp: Date.now() + 7 * 24 * 3600 * 1000,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', db.sessionSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyInMemoryToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;

  const db = getMemoryDb();
  const expectedSig = crypto
    .createHmac('sha256', db.sessionSecret)
    .update(payload)
    .digest('base64url');

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };
    if (!parsed.sub || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return null;
    }
    return parsed.sub;
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader) return '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match ? match[1].trim() : '';
}

export interface AuthContext {
  user: AuthUser;
  store: StoreProfile | null;
  supabase: SupabaseClient | null;
  memoryStore: MemoryStoreRecord | null;
}

export interface StoreContext {
  user: AuthUser;
  store: StoreProfile;
  supabase: SupabaseClient | null;
  memoryStore: MemoryStoreRecord | null;
}

async function loadSupabaseStoreForUser(
  supabase: SupabaseClient,
  ownerId: string
): Promise<StoreProfile | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, store_name')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    console.error('Supabase store lookup failed:', error.message);
    throw new PosError(500, 'Gagal memuat data toko dari database.');
  }

  if (!data) return null;
  return {
    id: String(data.id),
    storeName: String(data.store_name),
  };
}

export async function resolveAuthContext(authHeader: string | undefined): Promise<AuthContext> {
  const token = extractBearerToken(authHeader);
  if (!token) {
    throw new PosError(401, 'Silakan masuk terlebih dahulu.');
  }

  const anonClient = createAnonSupabaseClient();
  if (anonClient) {
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) {
      throw new PosError(401, 'Sesi masuk tidak valid atau telah berakhir.');
    }

    const userClient = createScopedSupabaseClient(token);
    if (!userClient) {
      throw new PosError(500, 'Konfigurasi Supabase tidak lengkap.');
    }

    const store = await loadSupabaseStoreForUser(userClient, data.user.id);
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
      },
      store,
      supabase: userClient,
      memoryStore: null,
    };
  }

  const userId = verifyInMemoryToken(token);
  if (!userId) {
    throw new PosError(401, 'Sesi masuk tidak valid atau telah berakhir.');
  }

  const db = getMemoryDb();
  const user = db.usersById.get(userId);
  if (!user) {
    throw new PosError(401, 'Akun tidak ditemukan.');
  }

  const memStore = db.storesByOwnerId.get(user.id) ?? null;
  return {
    user: { id: user.id, email: user.email },
    store: memStore ? { id: memStore.id, storeName: memStore.storeName } : null,
    supabase: null,
    memoryStore: memStore,
  };
}

export async function requireStoreContext(authHeader: string | undefined): Promise<StoreContext> {
  const ctx = await resolveAuthContext(authHeader);
  if (!ctx.store) {
    throw new PosError(403, 'Silakan buat toko terlebih dahulu sebelum mengakses kasir.');
  }
  return {
    user: ctx.user,
    store: ctx.store,
    supabase: ctx.supabase,
    memoryStore: ctx.memoryStore,
  };
}

function validateEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PosError(400, 'Format email tidak valid.');
  }
  return email;
}

function validatePasswordInput(raw: string): string {
  if (!raw || raw.length < 6) {
    throw new PosError(400, 'Kata sandi minimal 6 karakter.');
  }
  if (raw.length > 128) {
    throw new PosError(400, 'Kata sandi maksimal 128 karakter.');
  }
  return raw;
}

function validateStoreNameInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 40) {
    throw new PosError(400, 'Nama toko harus berisi 1 hingga 40 karakter.');
  }
  return trimmed;
}

export async function createStoreForUser(
  ctx: AuthContext,
  input: { storeName: string; seedSampleData?: boolean }
): Promise<StoreProfile> {
  if (ctx.store) {
    throw new PosError(409, 'Akun Anda sudah memiliki toko.');
  }

  const storeName = validateStoreNameInput(input.storeName);
  const seedSample = input.seedSampleData !== false;

  if (!ctx.supabase) {
    const db = getMemoryDb();
    const record: MemoryStoreRecord = {
      id: crypto.randomUUID(),
      ownerId: ctx.user.id,
      storeName,
      products: seedSample ? SEED_PRODUCTS.map((p) => ({ ...p })) : [],
      transactions: seedSample ? createSeedTransactions() : [],
    };
    db.storesByOwnerId.set(ctx.user.id, record);
    return { id: record.id, storeName: record.storeName };
  }

  const { data: createdStore, error: storeErr } = await ctx.supabase
    .from('stores')
    .insert({
      owner_id: ctx.user.id,
      store_name: storeName,
    })
    .select('id, store_name')
    .single();

  if (storeErr || !createdStore) {
    console.error('Supabase create store failed:', storeErr?.message);
    throw new PosError(500, 'Gagal membuat toko baru di database.');
  }

  const storeId = String(createdStore.id);

  if (seedSample) {
    const { error: prodErr } = await ctx.supabase.from('products').insert(
      SEED_PRODUCTS.map((p) => ({
        store_id: storeId,
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        cost_price: p.costPrice,
        sell_price: p.sellPrice,
        stock: p.stock,
      }))
    );

    if (prodErr) {
      console.error('Supabase seed products failed:', prodErr.message);
      await ctx.supabase.from('stores').delete().eq('id', storeId);
      throw new PosError(500, 'Gagal menyiapkan katalog awal toko.');
    }

    const seedTransactions = createSeedTransactions();
    const { error: trxErr } = await ctx.supabase.from('transactions').insert(
      seedTransactions.map((t) => ({
        store_id: storeId,
        id: t.id,
        receipt_no: t.receiptNo,
        created_at: new Date(t.timestamp).toISOString(),
        method: t.method,
        status: t.status,
        discount_percent: t.discountPercent,
        subtotal: t.subtotal,
        discount_amount: t.discountAmount,
        tax_amount: t.taxAmount,
        total: t.total,
        paid_cash: t.paidCash,
        change_amount: t.changeAmount,
      }))
    );

    if (trxErr) {
      console.error('Supabase seed transactions failed:', trxErr.message);
      await ctx.supabase.from('stores').delete().eq('id', storeId);
      throw new PosError(500, 'Gagal menyiapkan riwayat transaksi awal toko.');
    }

    const itemRows = seedTransactions.flatMap((t) =>
      t.items.map((item) => ({
        store_id: storeId,
        transaction_id: t.id,
        product_id: item.productId,
        product_name: item.name,
        qty: item.qty,
        unit_price: item.unitPrice,
      }))
    );

    const { error: itemsErr } = await ctx.supabase.from('transaction_items').insert(itemRows);
    if (itemsErr) {
      console.error('Supabase seed transaction items failed:', itemsErr.message);
      await ctx.supabase.from('stores').delete().eq('id', storeId);
      throw new PosError(500, 'Gagal menyiapkan detail transaksi awal toko.');
    }
  }

  return {
    id: storeId,
    storeName: String(createdStore.store_name),
  };
}

export async function registerAccount(input: {
  email: string;
  password: string;
  storeName?: string;
  seedSampleData?: boolean;
}): Promise<AuthResponse> {
  const email = validateEmail(input.email);
  const password = validatePasswordInput(input.password);
  const cleanStoreName =
    typeof input.storeName === 'string' && input.storeName.trim()
      ? validateStoreNameInput(input.storeName)
      : '';

  const anonClient = createAnonSupabaseClient();
  if (!anonClient) {
    const db = getMemoryDb();
    if (db.usersByEmail.has(email)) {
      throw new PosError(409, 'Email ini sudah terdaftar. Silakan masuk.');
    }

    const { salt, hash } = hashPassword(password);
    const user: MemoryUserRecord = {
      id: crypto.randomUUID(),
      email,
      passwordSalt: salt,
      passwordHash: hash,
    };
    db.usersByEmail.set(email, user);
    db.usersById.set(user.id, user);

    let store: StoreProfile | null = null;
    if (cleanStoreName) {
      store = await createStoreForUser(
        {
          user: { id: user.id, email: user.email },
          store: null,
          supabase: null,
          memoryStore: null,
        },
        { storeName: cleanStoreName, seedSampleData: input.seedSampleData }
      );
    }

    return {
      accessToken: signInMemoryToken(user.id),
      user: { id: user.id, email: user.email },
      store,
    };
  }

  const { data, error } = await anonClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes('already registered') || lower.includes('already exists')) {
      throw new PosError(409, 'Email ini sudah terdaftar. Silakan masuk.');
    }
    if (lower.includes('rate limit')) {
      throw new PosError(429, 'Terlalu banyak percobaan pendaftaran. Coba sebentar lagi.');
    }
    console.error('Supabase register error:', error.message);
    throw new PosError(400, 'Pendaftaran gagal. Pastikan email dan kata sandi valid.');
  }

  if (!data.session?.access_token || !data.user) {
    return {
      accessToken: null,
      user: data.user ? { id: data.user.id, email: data.user.email ?? email } : null,
      store: null,
      requiresEmailConfirmation: true,
      message:
        'Pendaftaran berhasil. Silakan konfirmasi email Anda terlebih dahulu, lalu masuk untuk membuat toko.',
    };
  }

  const accessToken = data.session.access_token;
  const userClient = createScopedSupabaseClient(accessToken);
  if (!userClient) {
    throw new PosError(500, 'Konfigurasi Supabase tidak lengkap.');
  }

  let store = await loadSupabaseStoreForUser(userClient, data.user.id);
  if (!store && cleanStoreName) {
    store = await createStoreForUser(
      {
        user: { id: data.user.id, email: data.user.email ?? email },
        store: null,
        supabase: userClient,
        memoryStore: null,
      },
      { storeName: cleanStoreName, seedSampleData: input.seedSampleData }
    );
  }

  return {
    accessToken,
    user: { id: data.user.id, email: data.user.email ?? email },
    store,
  };
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const email = validateEmail(input.email);
  const password = input.password;
  if (!password) {
    throw new PosError(400, 'Kata sandi wajib diisi.');
  }

  const anonClient = createAnonSupabaseClient();
  if (!anonClient) {
    const db = getMemoryDb();
    const user = db.usersByEmail.get(email);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new PosError(401, 'Email atau kata sandi salah.');
    }

    const memStore = db.storesByOwnerId.get(user.id) ?? null;
    return {
      accessToken: signInMemoryToken(user.id),
      user: { id: user.id, email: user.email },
      store: memStore ? { id: memStore.id, storeName: memStore.storeName } : null,
    };
  }

  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token || !data.user) {
    const lower = (error?.message ?? '').toLowerCase();
    if (lower.includes('email not confirmed')) {
      throw new PosError(403, 'Email Anda belum dikonfirmasi. Silakan cek kotak masuk email Anda.');
    }
    throw new PosError(401, 'Email atau kata sandi salah.');
  }

  const accessToken = data.session.access_token;
  const userClient = createScopedSupabaseClient(accessToken);
  if (!userClient) {
    throw new PosError(500, 'Konfigurasi Supabase tidak lengkap.');
  }

  const store = await loadSupabaseStoreForUser(userClient, data.user.id);
  return {
    accessToken,
    user: { id: data.user.id, email: data.user.email ?? email },
    store,
  };
}

export async function logoutAccount(authHeader: string | undefined): Promise<void> {
  const token = extractBearerToken(authHeader);
  if (!token) return;
  const userClient = createScopedSupabaseClient(token);
  if (userClient) {
    await userClient.auth.signOut().catch(() => undefined);
  }
}

function nextSequentialId(ids: string[]): string {
  const maxId = ids.reduce((max, raw) => {
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);
  return String(maxId + 1).padStart(4, '0');
}

function nextSku(products: PosProduct[]): string {
  const maxSku = products.reduce((max, p) => {
    const match = /(\d+)/.exec(p.sku);
    const num = match ? Number.parseInt(match[1], 10) : 0;
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 5000);
  return `SKU-${maxSku + 1}`;
}

export async function updateStoreName(ctx: StoreContext, nextName: string): Promise<string> {
  const trimmed = validateStoreNameInput(nextName);

  if (!ctx.supabase) {
    ctx.memoryStore!.storeName = trimmed;
    ctx.store.storeName = trimmed;
    return trimmed;
  }

  const { data, error } = await ctx.supabase
    .from('stores')
    .update({
      store_name: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ctx.store.id)
    .select('store_name')
    .single();

  if (error || !data) {
    console.error('Supabase store update failed:', error?.message);
    throw new PosError(500, 'Gagal menyimpan nama toko ke database.');
  }

  return String(data.store_name);
}

export async function listProducts(ctx: StoreContext): Promise<PosProduct[]> {
  if (!ctx.supabase) {
    return [...ctx.memoryStore!.products].sort((a, b) => a.id.localeCompare(b.id, 'id'));
  }

  const { data, error } = await ctx.supabase
    .from('products')
    .select('id, sku, name, category, cost_price, sell_price, stock')
    .eq('store_id', ctx.store.id)
    .order('id', { ascending: true });

  if (error) {
    console.error('Supabase products read failed:', error.message);
    throw new PosError(500, 'Gagal memuat daftar produk dari database.');
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    sku: String(row.sku ?? ''),
    name: String(row.name),
    category: String(row.category ?? 'Perangkat Keras'),
    costPrice: Number(row.cost_price ?? 0),
    sellPrice: Number(row.sell_price ?? 0),
    stock: Number(row.stock ?? 0),
  }));
}

export interface CreateProductInput {
  name: string;
  sellPrice: number;
  costPrice: number;
  stock: number;
  category?: string;
}

export async function createProduct(
  ctx: StoreContext,
  input: CreateProductInput
): Promise<PosProduct> {
  const name = input.name.trim();
  const sellPrice = Math.round(input.sellPrice);
  const costPrice = Math.round(input.costPrice);
  const stock = input.stock;
  const category = (input.category ?? 'Perangkat Keras').trim() || 'Perangkat Keras';

  if (!name || name.length > 140) {
    throw new PosError(400, 'Nama produk wajib diisi (maksimal 140 karakter).');
  }
  if (!Number.isFinite(sellPrice) || sellPrice <= 0) {
    throw new PosError(400, 'Harga jual wajib lebih dari 0.');
  }
  if (!Number.isFinite(costPrice) || costPrice < 0) {
    throw new PosError(400, 'Harga modal minimal 0.');
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new PosError(400, 'Stok awal harus berupa bilangan bulat minimal 0.');
  }

  const existing = await listProducts(ctx);
  const id = nextSequentialId(existing.map((p) => p.id));
  const sku = nextSku(existing);

  const created: PosProduct = {
    id,
    sku,
    name,
    category,
    costPrice,
    sellPrice,
    stock,
  };

  if (!ctx.supabase) {
    ctx.memoryStore!.products.push(created);
    return created;
  }

  const { data, error } = await ctx.supabase
    .from('products')
    .insert({
      store_id: ctx.store.id,
      id: created.id,
      sku: created.sku,
      name: created.name,
      category: created.category,
      cost_price: created.costPrice,
      sell_price: created.sellPrice,
      stock: created.stock,
    })
    .select('id, sku, name, category, cost_price, sell_price, stock')
    .single();

  if (error || !data) {
    console.error('Supabase product insert failed:', error?.message);
    throw new PosError(500, 'Gagal menambahkan produk baru.');
  }

  return {
    id: String(data.id),
    sku: String(data.sku ?? ''),
    name: String(data.name),
    category: String(data.category ?? 'Perangkat Keras'),
    costPrice: Number(data.cost_price),
    sellPrice: Number(data.sell_price),
    stock: Number(data.stock),
  };
}

export interface UpdateProductInput {
  name?: string;
  sellPrice?: number;
  costPrice?: number;
  stock?: number;
  restockDelta?: number;
}

export async function updateProduct(
  ctx: StoreContext,
  id: string,
  input: UpdateProductInput
): Promise<PosProduct> {
  const cleanId = id.trim();
  if (!cleanId) {
    throw new PosError(400, 'ID produk tidak valid.');
  }

  if (!ctx.supabase) {
    const store = ctx.memoryStore!;
    const target = store.products.find((p) => p.id === cleanId);
    if (!target) {
      throw new PosError(404, 'Produk tidak ditemukan.');
    }

    if (typeof input.restockDelta === 'number') {
      if (!Number.isInteger(input.restockDelta) || input.restockDelta <= 0) {
        throw new PosError(400, 'Jumlah tambah stok harus berupa bilangan bulat minimal 1.');
      }
      target.stock += input.restockDelta;
      return { ...target };
    }

    const nextName = input.name !== undefined ? input.name.trim() : target.name;
    const nextSell = input.sellPrice !== undefined ? Math.round(input.sellPrice) : target.sellPrice;
    const nextCost = input.costPrice !== undefined ? Math.round(input.costPrice) : target.costPrice;
    const nextStock = input.stock !== undefined ? input.stock : target.stock;

    if (!nextName || nextName.length > 140) {
      throw new PosError(400, 'Nama produk wajib diisi.');
    }
    if (!Number.isFinite(nextSell) || nextSell <= 0) {
      throw new PosError(400, 'Harga jual wajib lebih dari 0.');
    }
    if (!Number.isFinite(nextCost) || nextCost < 0) {
      throw new PosError(400, 'Harga modal minimal 0.');
    }
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      throw new PosError(400, 'Stok harus berupa bilangan bulat minimal 0.');
    }

    target.name = nextName;
    target.sellPrice = nextSell;
    target.costPrice = nextCost;
    target.stock = nextStock;
    return { ...target };
  }

  const { data: current, error: fetchError } = await ctx.supabase
    .from('products')
    .select('id, sku, name, category, cost_price, sell_price, stock')
    .eq('store_id', ctx.store.id)
    .eq('id', cleanId)
    .maybeSingle();

  if (fetchError) {
    console.error('Supabase product lookup failed:', fetchError.message);
    throw new PosError(500, 'Gagal memeriksa data produk.');
  }
  if (!current) {
    throw new PosError(404, 'Produk tidak ditemukan.');
  }

  let nextName = String(current.name);
  let nextSell = Number(current.sell_price);
  let nextCost = Number(current.cost_price);
  let nextStock = Number(current.stock);

  if (typeof input.restockDelta === 'number') {
    if (!Number.isInteger(input.restockDelta) || input.restockDelta <= 0) {
      throw new PosError(400, 'Jumlah tambah stok harus berupa bilangan bulat minimal 1.');
    }
    nextStock += input.restockDelta;
  } else {
    if (input.name !== undefined) nextName = input.name.trim();
    if (input.sellPrice !== undefined) nextSell = Math.round(input.sellPrice);
    if (input.costPrice !== undefined) nextCost = Math.round(input.costPrice);
    if (input.stock !== undefined) nextStock = input.stock;

    if (!nextName || nextName.length > 140) {
      throw new PosError(400, 'Nama produk wajib diisi.');
    }
    if (!Number.isFinite(nextSell) || nextSell <= 0) {
      throw new PosError(400, 'Harga jual wajib lebih dari 0.');
    }
    if (!Number.isFinite(nextCost) || nextCost < 0) {
      throw new PosError(400, 'Harga modal minimal 0.');
    }
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      throw new PosError(400, 'Stok harus berupa bilangan bulat minimal 0.');
    }
  }

  const { data: updated, error: updateError } = await ctx.supabase
    .from('products')
    .update({
      name: nextName,
      sell_price: nextSell,
      cost_price: nextCost,
      stock: nextStock,
      updated_at: new Date().toISOString(),
    })
    .eq('store_id', ctx.store.id)
    .eq('id', cleanId)
    .select('id, sku, name, category, cost_price, sell_price, stock')
    .single();

  if (updateError || !updated) {
    console.error('Supabase product update failed:', updateError?.message);
    throw new PosError(500, 'Gagal memperbarui produk.');
  }

  return {
    id: String(updated.id),
    sku: String(updated.sku ?? ''),
    name: String(updated.name),
    category: String(updated.category ?? 'Perangkat Keras'),
    costPrice: Number(updated.cost_price),
    sellPrice: Number(updated.sell_price),
    stock: Number(updated.stock),
  };
}

export async function deleteProduct(ctx: StoreContext, id: string): Promise<void> {
  const cleanId = id.trim();
  if (!cleanId) {
    throw new PosError(400, 'ID produk tidak valid.');
  }

  if (!ctx.supabase) {
    const store = ctx.memoryStore!;
    const idx = store.products.findIndex((p) => p.id === cleanId);
    if (idx === -1) {
      throw new PosError(404, 'Produk tidak ditemukan.');
    }
    store.products.splice(idx, 1);
    return;
  }

  const { data, error } = await ctx.supabase
    .from('products')
    .delete()
    .eq('store_id', ctx.store.id)
    .eq('id', cleanId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Supabase product delete failed:', error.message);
    throw new PosError(500, 'Gagal menghapus produk.');
  }
  if (!data) {
    throw new PosError(404, 'Produk tidak ditemukan.');
  }
}

export async function listTransactions(ctx: StoreContext): Promise<TransactionRecord[]> {
  if (!ctx.supabase) {
    return [...ctx.memoryStore!.transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((t) => ({ ...t, items: t.items.map((i) => ({ ...i })) }));
  }

  const { data, error } = await ctx.supabase
    .from('transactions')
    .select(
      'id, receipt_no, created_at, method, status, discount_percent, subtotal, discount_amount, tax_amount, total, paid_cash, change_amount, transaction_items(product_id, product_name, qty, unit_price)'
    )
    .eq('store_id', ctx.store.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase transactions read failed:', error.message);
    throw new PosError(500, 'Gagal memuat riwayat transaksi.');
  }

  return (data ?? []).map((row) => {
    const ts = new Date(String(row.created_at)).getTime() || Date.now();
    const rawItems = Array.isArray(row.transaction_items) ? row.transaction_items : [];
    const items: TransactionLineItem[] = rawItems.map((item) => ({
      productId: item.product_id ? String(item.product_id) : null,
      name: String(item.product_name),
      qty: Number(item.qty),
      unitPrice: Number(item.unit_price),
    }));

    return {
      id: String(row.id),
      receiptNo: String(row.receipt_no),
      dateLabel: formatDateTimeLabel(ts),
      timestamp: ts,
      method: row.method as PaymentMethod,
      status: row.status as TransactionStatus,
      discountPercent: Number(row.discount_percent ?? 0),
      subtotal: Number(row.subtotal ?? 0),
      discountAmount: Number(row.discount_amount ?? 0),
      taxAmount: Number(row.tax_amount ?? 0),
      total: Number(row.total ?? 0),
      paidCash: Number(row.paid_cash ?? 0),
      changeAmount: Number(row.change_amount ?? 0),
      items,
    };
  });
}

export interface CheckoutInput {
  items: Array<{ productId: string; qty: number }>;
  method: PaymentMethod;
  discountPercent?: number;
  paidCash?: number;
}

export async function createCheckoutTransaction(
  ctx: StoreContext,
  input: CheckoutInput
): Promise<{
  transaction: TransactionRecord;
  products: PosProduct[];
}> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new PosError(400, 'Keranjang belanja tidak boleh kosong.');
  }
  if (!['QRIS', 'Kartu', 'Tunai'].includes(input.method)) {
    throw new PosError(400, 'Metode pembayaran tidak valid.');
  }

  const discountPercent =
    typeof input.discountPercent === 'number' && Number.isFinite(input.discountPercent)
      ? Math.max(0, Math.min(100, input.discountPercent))
      : 0;

  const qtyByProduct = new Map<string, number>();
  for (const line of input.items) {
    const pid = typeof line.productId === 'string' ? line.productId.trim() : '';
    const qty = line.qty;
    if (!pid || !Number.isInteger(qty) || qty <= 0) {
      throw new PosError(400, 'Item transaksi dan jumlahnya harus valid.');
    }
    qtyByProduct.set(pid, (qtyByProduct.get(pid) ?? 0) + qty);
  }

  const products = await listProducts(ctx);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const lineItems: TransactionLineItem[] = [];
  for (const [pid, qty] of qtyByProduct.entries()) {
    const prod = productMap.get(pid);
    if (!prod) {
      throw new PosError(404, `Produk dengan ID ${pid} tidak ditemukan.`);
    }
    if (prod.stock < qty) {
      throw new PosError(
        409,
        `Stok untuk "${prod.name}" tidak mencukupi (tersisa ${prod.stock}).`
      );
    }
    lineItems.push({
      productId: prod.id,
      name: prod.name,
      qty,
      unitPrice: prod.sellPrice,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(afterDiscount * TAX_RATE);
  const total = afterDiscount + taxAmount;

  let paidCash = 0;
  let changeAmount = 0;
  if (input.method === 'Tunai') {
    const parsedPaid = Math.round(Number(input.paidCash ?? 0));
    if (!Number.isFinite(parsedPaid) || parsedPaid < total) {
      throw new PosError(400, 'Uang tunai yang diterima belum mencukupi total tagihan.');
    }
    paidCash = parsedPaid;
    changeAmount = Math.max(0, paidCash - total);
  }

  const existingTransactions = await listTransactions(ctx);
  const nextId = nextSequentialId(existingTransactions.map((t) => t.id));
  const receiptNo = `#POS-${nextId}`;
  const nowTs = Date.now();

  const newTransaction: TransactionRecord = {
    id: nextId,
    receiptNo,
    dateLabel: formatDateTimeLabel(nowTs),
    timestamp: nowTs,
    method: input.method,
    status: 'Selesai',
    discountPercent,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    paidCash,
    changeAmount,
    items: lineItems,
  };

  if (!ctx.supabase) {
    const store = ctx.memoryStore!;
    for (const [pid, qty] of qtyByProduct.entries()) {
      const target = store.products.find((p) => p.id === pid);
      if (target) {
        target.stock = Math.max(0, target.stock - qty);
      }
    }
    store.transactions.unshift(newTransaction);
    return {
      transaction: newTransaction,
      products: await listProducts(ctx),
    };
  }

  const { error: trxError } = await ctx.supabase.from('transactions').insert({
    store_id: ctx.store.id,
    id: newTransaction.id,
    receipt_no: newTransaction.receiptNo,
    created_at: new Date(nowTs).toISOString(),
    method: newTransaction.method,
    status: newTransaction.status,
    discount_percent: newTransaction.discountPercent,
    subtotal: newTransaction.subtotal,
    discount_amount: newTransaction.discountAmount,
    tax_amount: newTransaction.taxAmount,
    total: newTransaction.total,
    paid_cash: newTransaction.paidCash,
    change_amount: newTransaction.changeAmount,
  });

  if (trxError) {
    console.error('Supabase transaction insert failed:', trxError.message);
    throw new PosError(500, 'Gagal menyimpan transaksi ke database.');
  }

  const { error: itemsError } = await ctx.supabase.from('transaction_items').insert(
    lineItems.map((item) => ({
      store_id: ctx.store.id,
      transaction_id: newTransaction.id,
      product_id: item.productId,
      product_name: item.name,
      qty: item.qty,
      unit_price: item.unitPrice,
    }))
  );

  if (itemsError) {
    console.error('Supabase transaction_items insert failed:', itemsError.message);
    await ctx.supabase
      .from('transactions')
      .delete()
      .eq('store_id', ctx.store.id)
      .eq('id', newTransaction.id);
    throw new PosError(500, 'Gagal menyimpan detail item transaksi.');
  }

  const decremented: Array<{ id: string; prevStock: number }> = [];
  try {
    for (const [pid, qty] of qtyByProduct.entries()) {
      const prod = productMap.get(pid)!;
      const nextStock = Math.max(0, prod.stock - qty);
      const { error: stockErr } = await ctx.supabase
        .from('products')
        .update({ stock: nextStock, updated_at: new Date().toISOString() })
        .eq('store_id', ctx.store.id)
        .eq('id', pid);
      if (stockErr) {
        throw stockErr;
      }
      decremented.push({ id: pid, prevStock: prod.stock });
    }
  } catch (err) {
    console.error('Supabase stock decrement failed:', err);
    for (const prev of decremented) {
      await ctx.supabase
        .from('products')
        .update({ stock: prev.prevStock })
        .eq('store_id', ctx.store.id)
        .eq('id', prev.id);
    }
    await ctx.supabase
      .from('transactions')
      .delete()
      .eq('store_id', ctx.store.id)
      .eq('id', newTransaction.id);
    throw new PosError(500, 'Gagal memperbarui stok produk saat checkout.');
  }

  return {
    transaction: newTransaction,
    products: await listProducts(ctx),
  };
}

export async function returnTransaction(
  ctx: StoreContext,
  id: string
): Promise<{
  transaction: TransactionRecord;
  products: PosProduct[];
}> {
  const cleanId = id.trim();
  if (!cleanId) {
    throw new PosError(400, 'ID transaksi tidak valid.');
  }

  const allTransactions = await listTransactions(ctx);
  const target = allTransactions.find((t) => t.id === cleanId);
  if (!target) {
    throw new PosError(404, 'Transaksi tidak ditemukan.');
  }
  if (target.status === 'Dikembalikan') {
    throw new PosError(409, 'Transaksi ini sudah dikembalikan sebelumnya.');
  }

  if (!ctx.supabase) {
    const store = ctx.memoryStore!;
    const memTrx = store.transactions.find((t) => t.id === cleanId);
    if (!memTrx) {
      throw new PosError(404, 'Transaksi tidak ditemukan.');
    }
    memTrx.status = 'Dikembalikan';
    for (const item of memTrx.items) {
      if (item.productId) {
        const prod = store.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.qty;
        }
      }
    }
    return {
      transaction: { ...memTrx, items: memTrx.items.map((i) => ({ ...i })) },
      products: await listProducts(ctx),
    };
  }

  const { error: statusErr } = await ctx.supabase
    .from('transactions')
    .update({ status: 'Dikembalikan' })
    .eq('store_id', ctx.store.id)
    .eq('id', cleanId);

  if (statusErr) {
    console.error('Supabase return transaction failed:', statusErr.message);
    throw new PosError(500, 'Gagal memproses pengembalian transaksi.');
  }

  const products = await listProducts(ctx);
  const productMap = new Map(products.map((p) => [p.id, p]));
  for (const item of target.items) {
    if (!item.productId) continue;
    const prod = productMap.get(item.productId);
    if (!prod) continue;
    await ctx.supabase
      .from('products')
      .update({
        stock: prod.stock + item.qty,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', ctx.store.id)
      .eq('id', prod.id);
  }

  const updatedTransactions = await listTransactions(ctx);
  const updated = updatedTransactions.find((t) => t.id === cleanId) ?? {
    ...target,
    status: 'Dikembalikan' as const,
  };

  return {
    transaction: updated,
    products: await listProducts(ctx),
  };
}

function buildNotificationsFromState(
  products: PosProduct[],
  transactions: TransactionRecord[]
): NotificationItem[] {
  const list: NotificationItem[] = [];

  const latestTrx = transactions[0];
  if (latestTrx) {
    list.push({
      id: `trx-${latestTrx.id}`,
      title: `Transaksi ${latestTrx.receiptNo} ${latestTrx.status.toLowerCase()} via ${latestTrx.method}`,
      subtitle: `${formatRupiah(latestTrx.total)} • ${latestTrx.dateLabel}`,
    });
  }

  const outOfStock = products.find((p) => p.stock === 0);
  if (outOfStock) {
    list.push({
      id: `oos-${outOfStock.id}`,
      title: `Stok ${outOfStock.sku || outOfStock.id} habis`,
      subtitle: `${outOfStock.name} • Perlu restok`,
    });
  }

  const lowStock = products.find((p) => p.stock > 0 && p.stock <= 5);
  if (lowStock) {
    list.push({
      id: `low-${lowStock.id}`,
      title: `Stok ${lowStock.sku || lowStock.id} menipis (${lowStock.stock})`,
      subtitle: `${lowStock.name}`,
    });
  }

  return list.slice(0, 3);
}

export async function getBootstrap(ctx: StoreContext): Promise<PosBootstrapPayload> {
  const [products, transactions] = await Promise.all([
    listProducts(ctx),
    listTransactions(ctx),
  ]);
  const notifications = buildNotificationsFromState(products, transactions);
  return {
    storeName: ctx.store.storeName,
    products,
    transactions,
    notifications,
  };
}

function getTimeSlotIndex(date: Date): number {
  const h = date.getHours();
  if (h < 8) return 0;
  if (h < 12) return 1;
  if (h < 16) return 2;
  return 3;
}

function getMonToSunDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildRevenueSeries(
  transactions: TransactionRecord[],
  range: RevenueRange
): DashboardDataset['revenueSeries'] {
  const daysCount = range === '7 Hari' ? 7 : 30;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets = new Map<string, { revenue: number; transactions: number }>();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(startOfToday.getDate() - i);
    buckets.set(toDayKey(d), { revenue: 0, transactions: 0 });
  }

  for (const trx of transactions) {
    if (trx.status !== 'Selesai') continue;
    const key = toDayKey(new Date(trx.timestamp));
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue += trx.total;
      bucket.transactions += 1;
    }
  }

  const points: DailyRevenuePoint[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(startOfToday.getDate() - i);
    const key = toDayKey(d);
    const bucket = buckets.get(key) ?? { revenue: 0, transactions: 0 };
    points.push({
      label: formatDayMonthLabel(d),
      fullLabel: formatFullDayLabel(d),
      revenue: bucket.revenue,
      transactions: bucket.transactions,
    });
  }

  const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0);
  const maxPoint = Math.max(...points.map((p) => p.revenue), 1000000);
  const stepUnit = 1000000;
  const rawMax = Math.ceil((maxPoint * 1.15) / (4 * stepUnit)) * (4 * stepUnit);
  const yMax = Math.max(4000000, rawMax);
  const yTicks = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

  let defaultActiveIndex = points.length - 1;
  let bestVal = -1;
  points.forEach((pt, idx) => {
    if (pt.revenue >= bestVal) {
      bestVal = pt.revenue;
      defaultActiveIndex = idx;
    }
  });

  return {
    range,
    totalFormatted: formatRupiah(totalRevenue),
    subtitle: range === '7 Hari' ? '7 hari terakhir' : '30 hari terakhir',
    average: Math.round(totalRevenue / daysCount),
    yMax,
    yTicks,
    defaultActiveIndex,
    points,
  };
}

export async function getDashboard(
  ctx: StoreContext,
  period: PeriodFilter,
  range: RevenueRange
): Promise<DashboardDataset> {
  const [products, transactions] = await Promise.all([
    listProducts(ctx),
    listTransactions(ctx),
  ]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const cutoff =
    period === 'Hari Ini'
      ? startOfToday
      : period === '7 Hari'
      ? startOfToday - 6 * 24 * 3600 * 1000
      : startOfToday - 29 * 24 * 3600 * 1000;

  const inPeriod = transactions.filter((t) => t.timestamp >= cutoff);
  const completed = inPeriod.filter((t) => t.status === 'Selesai');

  const grossSales = inPeriod.reduce((sum, t) => sum + t.subtotal + t.taxAmount, 0);
  const netRevenue = completed.reduce((sum, t) => sum + t.total, 0);
  const unitsSold = completed.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.qty, 0),
    0
  );
  const totalAvailableStock = products.reduce((sum, p) => sum + p.stock, 0);
  const soldSharePercent =
    unitsSold + totalAvailableStock > 0
      ? Math.max(8, Math.min(98, Math.round((unitsSold / (unitsSold + totalAvailableStock)) * 100)))
      : 0;

  const periodSpan = Math.max(1, Date.now() - cutoff);
  const sparkBuckets = [0, 0, 0, 0, 0, 0];
  for (const trx of completed) {
    const ratio = Math.min(0.999, Math.max(0, (trx.timestamp - cutoff) / periodSpan));
    const idx = Math.floor(ratio * 6);
    sparkBuckets[idx] += trx.total;
  }
  const sparkMax = Math.max(...sparkBuckets, 1);
  const spark = sparkBuckets.map((val) => Math.max(10, Math.round((val / sparkMax) * 40)));

  const txBuckets = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const trx of completed) {
    const ratio = Math.min(0.999, Math.max(0, (trx.timestamp - cutoff) / periodSpan));
    const idx = Math.floor(ratio * 8);
    txBuckets[idx] += 1;
  }
  const txMax = Math.max(...txBuckets, 1);
  const completedBars = txBuckets.map((v) =>
    v === 0 ? 0.22 : Math.max(0.32, Math.min(0.96, v / txMax))
  );

  const thirdSpan = periodSpan / 3;
  const thirdSums = [0, 0, 0];
  for (const trx of inPeriod) {
    const idx = Math.min(2, Math.max(0, Math.floor((trx.timestamp - cutoff) / thirdSpan)));
    thirdSums[idx] += trx.total;
  }
  const thirdMax = Math.max(...thirdSums, 1);
  const activeBars: [number, number, number] = [
    Math.max(0.28, Number((thirdSums[0] / thirdMax).toFixed(2))),
    Math.max(0.28, Number((thirdSums[1] / thirdMax).toFixed(2))),
    Math.max(0.35, Number((thirdSums[2] / thirdMax).toFixed(2))),
  ];

  const counts = Array.from({ length: 4 }, () => Array.from({ length: 7 }, () => 0));
  for (const trx of completed) {
    const d = new Date(trx.timestamp);
    const r = getTimeSlotIndex(d);
    const c = getMonToSunDayIndex(d);
    counts[r][c] += 1;
  }
  const maxHeat = Math.max(...counts.flat(), 1);
  const levels = counts.map((row) =>
    row.map((val) => {
      if (val === 0) return 0;
      const ratio = val / maxHeat;
      if (ratio >= 0.75) return 4;
      if (ratio >= 0.5) return 3;
      if (ratio >= 0.25) return 2;
      return 1;
    })
  );

  const qrisCount = completed.filter((t) => t.method === 'QRIS').length;
  const cardCount = completed.filter((t) => t.method === 'Kartu').length;
  const cashCount = completed.filter((t) => t.method === 'Tunai').length;
  const totalCompleted = completed.length;

  const pct = (count: number) =>
    totalCompleted > 0 ? Number(((count / totalCompleted) * 100).toFixed(1)) : 0;

  const methods = [
    {
      name: 'QRIS',
      count: qrisCount,
      formatted: qrisCount.toLocaleString('id-ID'),
      percent: pct(qrisCount),
      color: '#ededeb',
    },
    {
      name: 'Kartu Debit/Kredit',
      count: cardCount,
      formatted: cardCount.toLocaleString('id-ID'),
      percent: pct(cardCount),
      color: '#7a7a76',
    },
    {
      name: 'Tunai',
      count: cashCount,
      formatted: cashCount.toLocaleString('id-ID'),
      percent: pct(cashCount),
      color: '#3e3e3c',
    },
  ];

  const topMethod = [...methods].sort((a, b) => b.count - a.count)[0];

  return {
    kpis: {
      activeSales: { value: formatRupiah(grossSales), bars: activeBars },
      revenue: { value: formatRupiah(netRevenue), spark },
      unitsSold: { value: unitsSold.toLocaleString('id-ID'), percent: soldSharePercent },
      completedTransactions: {
        value: totalCompleted.toLocaleString('id-ID'),
        bars: completedBars,
      },
    },
    heatmap: { levels, counts },
    totalTransactions: {
      total: totalCompleted.toLocaleString('id-ID'),
      highlightPercent: Math.round(topMethod?.percent ?? 0),
      highlightLabel:
        totalCompleted === 0
          ? 'Belum ada'
          : topMethod?.name === 'Kartu Debit/Kredit'
          ? 'Kartu'
          : topMethod?.name ?? 'QRIS',
      methods,
    },
    revenueSeries: buildRevenueSeries(transactions, range),
  };
}
