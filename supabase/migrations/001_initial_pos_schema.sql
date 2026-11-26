-- Orpheus Point of Sales — Multi-Tenant Schema with Supabase Auth & Row Level Security
-- Jalankan file migrasi ini di Supabase SQL Editor atau melalui Supabase CLI (`supabase db push`).
-- Aplikasi menggunakan SUPABASE_ANON_KEY + JWT user (Supabase Auth) sehingga setiap toko terisolasi per akun pemilik.

begin;

create extension if not exists pgcrypto;

-- 1. Tabel Toko (1 toko per pemilik / auth.users)
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  store_name text not null check (char_length(trim(store_name)) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel Produk / Inventaris (scoped per store_id)
create table if not exists public.products (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  sku text not null default '',
  name text not null check (char_length(trim(name)) between 1 and 140),
  category text not null default 'Perangkat Keras',
  cost_price integer not null default 0 check (cost_price >= 0),
  sell_price integer not null check (sell_price > 0),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, id)
);

-- 3. Tabel Transaksi Penjualan (scoped per store_id)
create table if not exists public.transactions (
  store_id uuid not null references public.stores(id) on delete cascade,
  id text not null,
  receipt_no text not null,
  created_at timestamptz not null default now(),
  method text not null check (method in ('QRIS', 'Kartu', 'Tunai')),
  status text not null default 'Selesai' check (status in ('Selesai', 'Dikembalikan')),
  discount_percent numeric(5, 2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  subtotal integer not null check (subtotal >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  tax_amount integer not null default 0 check (tax_amount >= 0),
  total integer not null check (total >= 0),
  paid_cash integer not null default 0 check (paid_cash >= 0),
  change_amount integer not null default 0 check (change_amount >= 0),
  primary key (store_id, id),
  unique (store_id, receipt_no)
);

-- 4. Tabel Detail Item Transaksi (scoped per store_id)
create table if not exists public.transaction_items (
  id bigint generated always as identity primary key,
  store_id uuid not null,
  transaction_id text not null,
  product_id text,
  product_name text not null,
  qty integer not null check (qty > 0),
  unit_price integer not null check (unit_price >= 0),
  foreign key (store_id, transaction_id) references public.transactions(store_id, id) on delete cascade,
  foreign key (store_id, product_id) references public.products(store_id, id) on delete set null
);

create index if not exists idx_stores_owner_id on public.stores (owner_id);
create index if not exists idx_products_store_id on public.products (store_id, id);
create index if not exists idx_transactions_store_created on public.transactions (store_id, created_at desc);
create index if not exists idx_transaction_items_store_trx on public.transaction_items (store_id, transaction_id);

-- 5. Aktifkan Row Level Security pada seluruh tabel
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;

-- 6. RLS Policies: Hanya user terautentikasi pemilik toko (auth.uid() = owner_id) yang boleh mengakses datanya
drop policy if exists "stores_owner_select" on public.stores;
create policy "stores_owner_select" on public.stores
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists "stores_owner_insert" on public.stores;
create policy "stores_owner_insert" on public.stores
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "stores_owner_update" on public.stores;
create policy "stores_owner_update" on public.stores
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "stores_owner_delete" on public.stores;
create policy "stores_owner_delete" on public.stores
  for delete to authenticated
  using (owner_id = auth.uid());

drop policy if exists "products_owner_all" on public.products;
create policy "products_owner_all" on public.products
  for all to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "transactions_owner_all" on public.transactions;
create policy "transactions_owner_all" on public.transactions
  for all to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "transaction_items_owner_all" on public.transaction_items;
create policy "transaction_items_owner_all" on public.transaction_items
  for all to authenticated
  using (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.stores s
      where s.id = store_id and s.owner_id = auth.uid()
    )
  );

-- 7. Pastikan hak akses tabel & sequence diberikan ke role authenticated (dan tidak ke anon)
grant usage on schema public to anon, authenticated;

revoke all on table
  public.stores,
  public.products,
  public.transactions,
  public.transaction_items
from anon;

grant select, insert, update, delete on table
  public.stores,
  public.products,
  public.transactions,
  public.transaction_items
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

commit;

