import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react';
import { formatRupiah } from '../data/kasirData';
import type {
  PaymentMethod,
  PosProduct,
  TransactionRecord,
} from '../types/pos';
import { returnTransactionApi } from '../lib/posApi';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedTitle } from './AnimatedTitle';

type MethodFilter = 'Semua' | PaymentMethod;
type SortKey = 'id' | 'timestamp' | 'itemsSummary' | 'method' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

function computeTotals(trx: TransactionRecord) {
  const subtotal = trx.subtotal;
  const discountAmount = trx.discountAmount;
  const taxAmount = trx.taxAmount;
  const total = trx.total;
  const totalUnits = trx.items.reduce((sum, item) => sum + item.qty, 0);
  const itemsSummary =
    trx.items.length === 0
      ? '-'
      : trx.items.length === 1
      ? trx.items[0].name
      : `${trx.items[0].name} (+${trx.items.length - 1} lainnya)`;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    totalUnits,
    itemsSummary,
  };
}

function summarizeReturnedProducts(records: TransactionRecord[], emptyLabel: string): string {
  if (records.length === 0) return emptyLabel;
  const productNames = records.flatMap((trx) => trx.items.map((item) => item.name));
  if (productNames.length === 0) return emptyLabel;
  if (productNames.length === 1) return productNames[0];
  return `${productNames[0]} dan ${productNames.length - 1} lainnya`;
}

interface TransaksiViewProps {
  storeName: string;
  transactions: TransactionRecord[];
  onTransactionReturned: (result: {
    transaction: TransactionRecord;
    products: PosProduct[];
  }) => void;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  storeName,
  transactions,
  onTransactionReturned,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('Semua');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [isInitialEntry, setIsInitialEntry] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [detailTrxId, setDetailTrxId] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<TransactionRecord | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState('');
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const detailTrx = useMemo(
    () => (detailTrxId ? transactions.find((t) => t.id === detailTrxId) ?? null : null),
    [transactions, detailTrxId]
  );

  const syncScrollState = () => {
    const tableScrolled = (tableScrollRef.current?.scrollTop ?? 0) > 40;
    const windowScrolled = window.scrollY > 40;
    setIsScrolled(tableScrolled || windowScrolled);
  };

  useEffect(() => {
    const handleWindowScroll = () => {
      syncScrollState();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isReturning) {
        setReturnTarget(null);
        setReturnError('');
      }
    };
    syncScrollState();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReturning]);

  const scrollToTop = () => {
    tableScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmReturn = async () => {
    if (!returnTarget || isReturning) return;
    setReturnError('');
    setIsReturning(true);
    try {
      const result = await returnTransactionApi(returnTarget.id);
      onTransactionReturned(result);
      setReturnTarget(null);
    } catch (error) {
      setReturnError(
        error instanceof Error
          ? error.message
          : 'Gagal mengembalikan transaksi.'
      );
    } finally {
      setIsReturning(false);
    }
  };

  const summary = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'Selesai');
    const returned = transactions.filter((t) => t.status === 'Dikembalikan');

    const totalRevenue = completed.reduce((sum, t) => sum + computeTotals(t).total, 0);
    const totalUnitsSold = completed.reduce((sum, t) => sum + computeTotals(t).totalUnits, 0);
    const avgTransaction =
      completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

    return {
      totalRevenue,
      completedCount: completed.length,
      avgTransaction,
      totalUnitsSold,
      returnedItems: returned,
    };
  }, [transactions]);

  const handleSort = (key: SortKey) => {
    setIsInitialEntry(false);
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = transactions.filter((trx) => {
      if (methodFilter !== 'Semua' && trx.method !== methodFilter) {
        return false;
      }
      if (!q) return true;
      const matchesId = trx.id.toLowerCase().includes(q);
      const matchesDate = trx.dateLabel.toLowerCase().includes(q);
      const matchesMethod = trx.method.toLowerCase().includes(q);
      const matchesStatus = trx.status.toLowerCase().includes(q);
      const matchesItem = trx.items.some((item) => item.name.toLowerCase().includes(q));
      return matchesId || matchesDate || matchesMethod || matchesStatus || matchesItem;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === 'id') {
        return sortDir === 'asc'
          ? a.id.localeCompare(b.id, 'id')
          : b.id.localeCompare(a.id, 'id');
      }
      if (sortKey === 'timestamp') {
        return sortDir === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      }
      if (sortKey === 'itemsSummary') {
        const nameA = computeTotals(a).itemsSummary;
        const nameB = computeTotals(b).itemsSummary;
        return sortDir === 'asc'
          ? nameA.localeCompare(nameB, 'id')
          : nameB.localeCompare(nameA, 'id');
      }
      if (sortKey === 'method') {
        return sortDir === 'asc'
          ? a.method.localeCompare(b.method, 'id')
          : b.method.localeCompare(a.method, 'id');
      }
      if (sortKey === 'total') {
        const totalA = computeTotals(a).total;
        const totalB = computeTotals(b).total;
        return sortDir === 'asc' ? totalA - totalB : totalB - totalA;
      }
      return sortDir === 'asc'
        ? a.status.localeCompare(b.status, 'id')
        : b.status.localeCompare(a.status, 'id');
    });

    return sorted;
  }, [transactions, searchQuery, methodFilter, sortKey, sortDir]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-[13px] h-[13px] text-[#6e6e6a] shrink-0" strokeWidth={1.8} />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-[13px] h-[13px] text-[#f3f3f1] shrink-0" strokeWidth={2.2} />
    ) : (
      <ArrowDown className="w-[13px] h-[13px] text-[#f3f3f1] shrink-0" strokeWidth={2.2} />
    );
  };

  return (
    <main className="lg:h-[calc(100vh-122px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <AnimatedTitle text="Transaksi" />
      </div>

      {/* 3-Card Transaction Summary Strip (Matches ProdukView Layout) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-[14px] mt-[16px] shrink-0">
        {/* Card 1: Total Revenue (Bright Monochrome Surface) */}
        <div
          className="bg-[#f0f0ee] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
            Total pendapatan
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#141414] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px] whitespace-nowrap">
            <AnimatedNumber value={summary.totalRevenue} formatter={formatRupiah} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-black/[0.16] text-[12px] text-[#5c5c58] tabular-nums whitespace-nowrap">
            <AnimatedNumber value={summary.completedCount} /> transaksi selesai
          </div>
        </div>

        {/* Card 2: Average Transaction Value */}
        <div
          className="bg-[#171716] border border-white/[0.08] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '170ms' }}
        >
          <div className="text-[12px] font-medium text-[#9e9e9a] whitespace-nowrap">
            Rata-rata transaksi
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px] whitespace-nowrap">
            <AnimatedNumber value={summary.avgTransaction} formatter={formatRupiah} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-white/[0.12] text-[12px] text-[#848480] tabular-nums truncate">
            <AnimatedNumber value={summary.totalUnitsSold} /> unit terjual
          </div>
        </div>

        {/* Card 3: Returned Transactions */}
        <div
          className="bg-[#171716] border border-white/[0.08] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '240ms' }}
        >
          <div className="text-[12px] font-medium text-[#9e9e9a] whitespace-nowrap">
            Transaksi dikembalikan
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px]">
            <AnimatedNumber value={summary.returnedItems.length} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-white/[0.12] text-[12px] text-[#848480] truncate">
            {summarizeReturnedProducts(summary.returnedItems, 'Tidak ada transaksi dikembalikan')}
          </div>
        </div>
      </section>

      {/* Search Bar & Sortable Transactions Table + Optional Right Rincian Tab */}
      <div className="grid grid-cols-12 gap-[16px] mt-[16px] flex-1 min-h-0 items-stretch">
        <section
          className={`${
            detailTrx ? 'col-span-12 lg:col-span-8' : 'col-span-12'
          } bg-[#171716] border border-white/[0.08] rounded-[22px] p-[20px] min-w-0 min-h-0 flex flex-col overflow-hidden animate-tab-up`}
          style={{ animationDelay: '320ms' }}
        >
          {/* Toolbar: White-before-focus Search Input + Method Segmented Filter */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 mb-[16px] shrink-0 animate-tab-up"
          style={{ animationDelay: '380ms' }}
        >
          <div className="group relative w-full sm:w-[340px]">
            <Search
              className="w-[15px] h-[15px] text-[#141414] group-focus-within:text-[#848480] absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              strokeWidth={1.9}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setIsInitialEntry(false);
                setSearchQuery(e.target.value);
              }}
              placeholder="Cari transaksi..."
              className="w-full h-[40px] rounded-[12px] bg-[#ededeb] hover:bg-white focus:bg-[#1c1c1a] border border-[#2a2a28] focus:border-white/[0.22] pl-[40px] pr-[36px] text-[12.5px] font-medium text-[#141414] focus:text-[#f2f2f0] placeholder-[#646460] focus:placeholder-[#787874] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setIsInitialEntry(false);
                  setSearchQuery('');
                }}
                aria-label="Hapus pencarian"
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#5c5c58] group-focus-within:text-[#848480] hover:text-[#141414] group-focus-within:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-[14px] h-[14px]" />
              </button>
            )}
          </div>

          <div className="inline-flex items-center bg-[#1c1c1a] border border-white/[0.08] rounded-full p-[3px] gap-[2px]">
            {(['Semua', 'QRIS', 'Kartu', 'Tunai'] as const).map((method) => {
              const isActive = methodFilter === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setIsInitialEntry(false);
                    setMethodFilter(method);
                  }}
                  className={`h-[32px] px-[14px] rounded-full text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ededeb] text-[#141414] font-semibold'
                      : 'text-[#9e9e9a] hover:text-white font-medium'
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transactions Table */}
        <div
          ref={tableScrollRef}
          onScroll={syncScrollState}
          className="flex-1 min-h-0 overflow-auto rounded-[14px] border border-white/[0.06] bg-[#141413] animate-tab-up"
          style={{ animationDelay: '380ms' }}
        >
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1b1b19] border-b border-white/[0.07]">
                <th className="py-[12px] px-[16px] w-[92px]">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className={`inline-flex items-center gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'id'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>ID</span>
                    {renderSortIcon('id')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px]">
                  <button
                    type="button"
                    onClick={() => handleSort('timestamp')}
                    className={`inline-flex items-center gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'timestamp'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Waktu</span>
                    {renderSortIcon('timestamp')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px]">
                  <button
                    type="button"
                    onClick={() => handleSort('itemsSummary')}
                    className={`inline-flex items-center gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'itemsSummary'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Produk</span>
                    {renderSortIcon('itemsSummary')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px]">
                  <button
                    type="button"
                    onClick={() => handleSort('method')}
                    className={`inline-flex items-center gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'method'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Metode</span>
                    {renderSortIcon('method')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px] text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('total')}
                    className={`inline-flex items-center justify-end gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'total'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Total</span>
                    {renderSortIcon('total')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px] text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className={`inline-flex items-center justify-end gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'status'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody
              key={`${methodFilter}-${searchQuery}-${sortKey}-${sortDir}`}
              className={isInitialEntry ? '' : 'animate-filter-fade'}
            >
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-[13.5px] font-medium text-[#f2f2f0]">
                      {transactions.length === 0
                        ? 'Belum ada transaksi'
                        : 'Transaksi tidak ditemukan'}
                    </div>
                    <p className="text-[12px] text-[#7c7c78] mt-1">
                      {transactions.length === 0
                        ? 'Transaksi dari halaman Kasir akan muncul di sini.'
                        : 'Coba kata kunci pencarian atau filter metode lain.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((trx, idx) => {
                  const calc = computeTotals(trx);
                  const isReturned = trx.status === 'Dikembalikan';
                  const isSelected = detailTrx?.id === trx.id;
                  return (
                    <tr
                      key={trx.id}
                      onClick={() => setDetailTrxId(trx.id)}
                      style={
                        isInitialEntry
                          ? { animationDelay: `${430 + Math.min(idx, 15) * 48}ms` }
                          : undefined
                      }
                      className={`border-t border-white/[0.05] transition-colors cursor-pointer ${
                        isInitialEntry ? 'animate-tab-up' : ''
                      } ${
                        isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="py-[13px] px-[16px] text-[12.5px] font-medium text-[#9e9e9a] tabular-nums whitespace-nowrap">
                        {trx.id}
                      </td>
                      <td className="py-[13px] px-[16px] text-[12.5px] text-[#b4b4b0] tabular-nums whitespace-nowrap">
                        {trx.dateLabel}
                      </td>
                      <td className="py-[13px] px-[16px] text-[13px] font-medium text-[#f2f2f0]">
                        {calc.itemsSummary}
                      </td>
                      <td className="py-[13px] px-[16px] text-[12.5px] text-[#d6d6d2] whitespace-nowrap">
                        {trx.method}
                      </td>
                      <td
                        className={`py-[13px] px-[16px] text-[13px] font-semibold text-right tabular-nums whitespace-nowrap ${
                          isReturned ? 'text-[#7c7c78] line-through' : 'text-[#ededeb]'
                        }`}
                      >
                        <AnimatedNumber
                          value={calc.total}
                          duration={480}
                          formatter={formatRupiah}
                        />
                      </td>
                      <td className="py-[13px] px-[16px] text-[12.5px] text-right whitespace-nowrap">
                        <span
                          className={
                            isReturned
                              ? 'text-[#7c7c78] font-medium'
                              : 'text-[#e5e5e2] font-medium'
                          }
                        >
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </section>

        {detailTrx && (
          <aside
            key={detailTrx.id}
            className="col-span-12 lg:col-span-4 bg-[#171716] border border-white/[0.08] rounded-[22px] p-[22px] min-w-0 min-h-0 overflow-y-auto animate-slide-right"
          >
            {(() => {
              const calc = computeTotals(detailTrx);
              const isReturned = detailTrx.status === 'Dikembalikan';
              return (
                <>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[15px] font-semibold text-[#f3f3f1] tracking-[-0.01em]">
                      Rincian transaksi
                    </h2>
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[11.5px] text-[#848480]">Pratinjau struk</span>
                      <button
                        type="button"
                        onClick={() => setDetailTrxId(null)}
                        aria-label="Tutup rincian"
                        className="w-[26px] h-[26px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] text-[#b4b4b0] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-[13px] h-[13px]" />
                      </button>
                    </div>
                  </div>

                  {/* Centered Store & Receipt Identity */}
                  <div className="mt-[20px] flex flex-col items-center text-center">
                    <div className="w-[44px] h-[44px] rounded-[12px] bg-[#ededeb] flex items-center justify-center">
                      <img
                        src="/logo.svg"
                        alt="Orpheus"
                        className="w-[24px] h-[24px] brightness-0 object-contain"
                      />
                    </div>
                    <div className="text-[15.5px] font-semibold text-[#f3f3f1] tracking-[-0.01em] mt-[12px]">
                      {storeName}
                    </div>
                    <div className="mt-[4px] space-y-[3px] text-[11.5px] text-[#848480] tabular-nums">
                      <div>Bukti Pembayaran · ID {detailTrx.id}</div>
                      <div>Status · {detailTrx.status}</div>
                      <div>{detailTrx.dateLabel}</div>
                    </div>
                  </div>

                  {/* First Dashed Divider & Line Items */}
                  <div className="mt-[18px] pt-[16px] border-t border-dashed border-white/[0.12] space-y-[10px]">
                    {detailTrx.items.map((line, idx) => (
                      <div
                        key={`${line.productId ?? line.name}-${idx}`}
                        className="flex items-start justify-between gap-3 text-[12.5px]"
                      >
                        <span className="text-[#d6d6d2] leading-[1.4]">
                          {line.name} × {line.qty}
                        </span>
                        <span className="font-semibold text-[#f3f3f1] tabular-nums whitespace-nowrap">
                          <AnimatedNumber
                            value={line.qty * line.unitPrice}
                            duration={500}
                            formatter={formatRupiah}
                          />
                        </span>
                      </div>
                    ))}

                    <div className="pt-[6px] space-y-[5px] text-[11.5px] text-[#848480]">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span className="tabular-nums text-[#b4b4b0]">
                          <AnimatedNumber
                            value={calc.subtotal}
                            duration={520}
                            formatter={formatRupiah}
                          />
                        </span>
                      </div>
                      {detailTrx.discountPercent > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Diskon ({detailTrx.discountPercent}%)</span>
                          <span className="tabular-nums text-[#b4b4b0]">
                            -
                            <AnimatedNumber
                              value={calc.discountAmount}
                              duration={520}
                              formatter={formatRupiah}
                            />
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Pajak 11%</span>
                        <span className="tabular-nums text-[#b4b4b0]">
                          <AnimatedNumber
                            value={calc.taxAmount}
                            duration={520}
                            formatter={formatRupiah}
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Second Dashed Divider & Payment Summary */}
                  <div className="mt-[16px] pt-[16px] border-t border-dashed border-white/[0.12] space-y-[14px]">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-[#8e8e8a]">Metode pembayaran</span>
                      <span className="font-semibold text-[#f3f3f1]">{detailTrx.method}</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-[#d6d6d2]">Total dibayar</span>
                      <span
                        className={`text-[22px] font-semibold tracking-[-0.02em] tabular-nums ${
                          isReturned ? 'text-[#7c7c78] line-through' : 'text-[#f3f3f1]'
                        }`}
                      >
                        <AnimatedNumber
                          value={calc.total}
                          duration={580}
                          formatter={formatRupiah}
                        />
                      </span>
                    </div>
                  </div>

                  {/* Existing Return Action Button */}
                  <div className="mt-[18px]">
                    <button
                      type="button"
                      disabled={isReturned}
                      onClick={() => {
                        setReturnError('');
                        setReturnTarget(detailTrx);
                      }}
                      className={`w-full h-[40px] rounded-full text-[12.5px] font-semibold inline-flex items-center justify-center gap-[8px] border transition-colors ${
                        isReturned
                          ? 'bg-[#1a1a19] text-[#6e6e6a] border-white/[0.06] cursor-not-allowed'
                          : 'bg-[#1e1e1c] hover:bg-[#272725] text-[#f3f3f1] border-white/[0.14] cursor-pointer'
                      }`}
                    >
                      <RotateCcw className="w-[14px] h-[14px]" strokeWidth={1.9} />
                      <span>{isReturned ? 'Sudah dikembalikan' : 'Kembalikan'}</span>
                    </button>
                  </div>

                  <p className="mt-[16px] text-center text-[11.5px] text-[#7c7c78]">
                    Terima kasih sudah berbelanja. Sampai jumpa kembali!
                  </p>
                </>
              );
            })()}
          </aside>
        )}
      </div>

      <div
        className="fixed bottom-6 right-6 z-40 animate-tab-up"
        style={{ animationDelay: '530ms' }}
      >
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
          className={`w-[42px] h-[42px] rounded-full bg-[#ededeb] text-[#141414] hover:bg-white border border-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.45)] flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isScrolled ? 'opacity-100 scale-100' : 'opacity-70 hover:opacity-100 scale-95 hover:scale-100'
          }`}
        >
          <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.1} />
        </button>
      </div>

      {returnTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-filter-fade"
          onClick={() => {
            if (!isReturning) {
              setReturnTarget(null);
              setReturnError('');
            }
          }}
        >
          <div
            className="w-full max-w-[440px] bg-[#181817] border border-white/[0.12] rounded-[22px] p-[22px] shadow-2xl animate-modal-up"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const calc = computeTotals(returnTarget);
              return (
                <>
                  <div className="flex items-start justify-between gap-3 mb-[16px]">
                    <div>
                      <span className="text-[11.5px] font-medium text-[#848480] tabular-nums">
                        ID {returnTarget.id} · {returnTarget.dateLabel}
                      </span>
                      <h2 className="text-[18px] font-semibold text-[#f3f3f1] tracking-[-0.02em] mt-0.5">
                        Kembalikan transaksi
                      </h2>
                    </div>
                    <button
                      type="button"
                      disabled={isReturning}
                      onClick={() => {
                        setReturnTarget(null);
                        setReturnError('');
                      }}
                      aria-label="Tutup dialog"
                      className="w-[32px] h-[32px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#b4b4b0] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-[15px] h-[15px]" />
                    </button>
                  </div>

                  <div className="rounded-[14px] bg-[#1e1e1c] border border-white/[0.08] p-[14px] text-[13px] text-[#d4d4d0] leading-[1.5] mb-[16px]">
                    Apakah Anda yakin ingin menandai transaksi{' '}
                    <span className="font-semibold text-[#f3f3f1] tabular-nums">
                      ID {returnTarget.id}
                    </span>{' '}
                    senilai{' '}
                    <span className="font-semibold text-[#f3f3f1] tabular-nums">
                      {formatRupiah(calc.total)}
                    </span>{' '}
                    sebagai <span className="font-semibold text-[#f3f3f1]">Dikembalikan</span>?
                    Stok produk terkait akan otomatis dikembalikan.
                  </div>

                  {returnError && (
                    <div className="mb-[14px] rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-[12px] py-[8px] text-[12px] text-[#f2f2f0]">
                      {returnError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-[10px]">
                    <button
                      type="button"
                      disabled={isReturning}
                      onClick={() => {
                        setReturnTarget(null);
                        setReturnError('');
                      }}
                      className="h-[40px] px-[18px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isReturning}
                      onClick={handleConfirmReturn}
                      className="h-[40px] px-[20px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-40 text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                    >
                      {isReturning ? 'Memproses...' : 'Kembalikan transaksi'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
};
