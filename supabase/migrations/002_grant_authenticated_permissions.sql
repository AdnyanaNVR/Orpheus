-- Fix permission denied (42501) for authenticated users accessing Orpheus POS tables
-- Jalankan file ini di Supabase SQL Editor apabila tabel sudah dibuat sebelumnya oleh 001_initial_pos_schema.sql.

begin;

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
