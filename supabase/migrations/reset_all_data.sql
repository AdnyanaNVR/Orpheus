-- Orpheus Point of Sales — Reset / Hapus Semua Data Database & User
-- PERINGATAN: Query ini akan menghapus SELURUH data toko, produk, transaksi,
-- detail item transaksi, serta SEMUA akun user terdaftar (auth.users).
-- Jalankan file ini secara manual di Supabase SQL Editor hanya saat ingin mengosongkan database.

begin;

-- 1. Hapus seluruh data POS & reset sequence ID
truncate table
  public.transaction_items,
  public.transactions,
  public.products,
  public.stores
restart identity cascade;

-- 2. Hapus seluruh akun user di Supabase Auth (otomatis menghapus sessions, identities, refresh tokens)
delete from auth.users;

commit;

-- ============================================================================
-- OPSIONAL: Jika ingin menghapus struktur tabel sepenuhnya lalu membuat ulang
-- dari awal (lalu jalankan ulang 001_initial_pos_schema.sql), uncomment blok di bawah:
-- ============================================================================
-- begin;
-- drop table if exists public.transaction_items cascade;
-- drop table if exists public.transactions cascade;
-- drop table if exists public.products cascade;
-- drop table if exists public.stores cascade;
-- delete from auth.users;
-- commit;
