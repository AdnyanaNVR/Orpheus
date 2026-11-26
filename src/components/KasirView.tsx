import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ScanBarcode,
  CreditCard,
  Minus,
  X,
  Check,
  QrCode,
  Banknote,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wifi,
} from 'lucide-react';
import { formatRupiah } from '../data/kasirData';
import type {
  PaymentMethod,
  PosProduct,
  TransactionRecord,
} from '../types/pos';
import { checkoutApi } from '../lib/posApi';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedTitle } from './AnimatedTitle';

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

type PaymentModalPhase = 'processing' | 'cash_input' | 'success' | 'error';

type SortField = 'name' | 'price';
type SortDirection = 'asc' | 'desc';

const TAX_RATE = 0.11;

interface KasirViewProps {
  products: PosProduct[];
  onCheckoutSuccess: (result: {
    transaction: TransactionRecord;
    products: PosProduct[];
  }) => void;
}

export const KasirView: React.FC<KasirViewProps> = ({
  products,
  onCheckoutSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [isInitialEntry, setIsInitialEntry] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountInput, setDiscountInput] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);

  // Overlays / interactive panels
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Kartu');
  const [paymentPhase, setPaymentPhase] = useState<PaymentModalPhase>('processing');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [successSnapshot, setSuccessSnapshot] = useState<{
    receiptNo: string;
    total: number;
    method: PaymentMethod;
    paidCash: number;
    change: number;
  } | null>(null);

  const processingTimerRef = useRef<number | null>(null);
  const modalOpenRef = useRef(false);

  const clearProcessingTimer = () => {
    if (processingTimerRef.current !== null) {
      window.clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearProcessingTimer();
  }, []);

  const handleSortClick = (field: 'name' | 'price') => {
    setIsInitialEntry(false);
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : [...products];

    if (sortField === 'name') {
      list.sort((a, b) =>
        sortDir === 'asc'
          ? a.name.localeCompare(b.name, 'id')
          : b.name.localeCompare(a.name, 'id')
      );
    } else if (sortField === 'price') {
      list.sort((a, b) =>
        sortDir === 'asc' ? a.sellPrice - b.sellPrice : b.sellPrice - a.sellPrice
      );
    }

    return list;
  }, [products, searchQuery, sortField, sortDir]);

  const getCartQuantity = (productId: string) =>
    cart.find((item) => item.id === productId)?.quantity ?? 0;

  const addProductToCart = (product: PosProduct) => {
    const currentQty = getCartQuantity(product.id);
    if (currentQty >= product.stock) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unitPrice: product.sellPrice,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const product = products.find((p) => p.id === itemId);
          const maxStock = product ? product.stock : 999;
          const nextQty = Math.min(maxStock, item.quantity + delta);
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountInput('');
    setAppliedDiscountPercent(0);
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(discountInput);
    const clamped = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;
    setAppliedDiscountPercent(clamped);
    setDiscountInput(clamped > 0 ? String(clamped) : '');
  };

  const totalItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const discountRate = appliedDiscountPercent / 100;
  const discountAmount = Math.round(subtotal * discountRate);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + taxAmount;

  const parsedCash = Number(cashReceived.replace(/[^\d]/g, '')) || 0;
  const cashChange = Math.max(0, parsedCash - total);

  const finalizeSale = async (method: PaymentMethod, paidCashAmount = 0) => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setPaymentError('');
    try {
      const result = await checkoutApi({
        items: cart.map((item) => ({ productId: item.id, qty: item.quantity })),
        method,
        discountPercent: appliedDiscountPercent,
        paidCash: method === 'Tunai' ? paidCashAmount : 0,
      });

      onCheckoutSuccess(result);
      setSuccessSnapshot({
        receiptNo: result.transaction.receiptNo,
        total: result.transaction.total,
        method: result.transaction.method,
        paidCash: result.transaction.paidCash,
        change: result.transaction.changeAmount,
      });
      setPaymentPhase('success');
      handleClearCart();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Pembayaran gagal diproses.';
      setPaymentError(message);
      if (method !== 'Tunai') {
        setPaymentPhase('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChargeClick = () => {
    if (cart.length === 0 || isSubmitting) return;
    clearProcessingTimer();
    setSuccessSnapshot(null);
    setPaymentError('');
    modalOpenRef.current = true;
    setShowPaymentModal(true);

    if (paymentMethod === 'Tunai') {
      setCashReceived('');
      setPaymentPhase('cash_input');
      return;
    }

    // Kartu or QRIS -> show animated processing visualization first, then persist via API
    setPaymentPhase('processing');
    const activeMethod = paymentMethod;
    processingTimerRef.current = window.setTimeout(() => {
      processingTimerRef.current = null;
      if (!modalOpenRef.current) return;
      void finalizeSale(activeMethod);
    }, 1500);
  };

  const handleConfirmCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || parsedCash < total || isSubmitting) return;
    await finalizeSale('Tunai', parsedCash);
  };

  const handleClosePaymentModal = () => {
    if (isSubmitting) return;
    clearProcessingTimer();
    modalOpenRef.current = false;
    setShowPaymentModal(false);
    setCashReceived('');
    setPaymentError('');
  };

  const quickCashSuggestions = useMemo(() => {
    if (total <= 0) return [];
    const roundUp50k = Math.ceil(total / 50000) * 50000;
    const roundUp100k = Math.ceil(total / 100000) * 100000;
    const set = new Set<number>([total, roundUp50k, roundUp100k, roundUp100k + 50000]);
    return Array.from(set).sort((a, b) => a - b).slice(0, 3);
  }, [total]);

  return (
    <main className="lg:h-[calc(100vh-122px)] flex flex-col">
      {/* Clean Kasir Header */}
      <div className="flex items-center justify-between shrink-0">
        <AnimatedTitle text="Kasir" />
      </div>

      {/* Two-Column Monochrome POS Workspace: Only Product Grid Scrolls on Desktop */}
      <div className="grid grid-cols-12 gap-[16px] mt-[16px] flex-1 min-h-0 items-stretch">
        {/* Left: Fixed Search/Sort Header + Independently Scrollable Product Grid */}
        <section
          className="col-span-12 lg:col-span-8 bg-[#171716] border border-white/[0.06] rounded-[20px] p-[18px] flex flex-col min-w-0 min-h-0 overflow-hidden animate-tab-up"
          style={{ animationDelay: '100ms' }}
        >
          {/* Search (Left, Compact) & Sort (Right End) */}
          <div
            className="flex flex-wrap items-center justify-between gap-[10px] shrink-0 animate-tab-up"
            style={{ animationDelay: '170ms' }}
          >
            <div className="group relative w-full sm:w-[235px]">
              <Search
                className="w-[14px] h-[14px] text-[#141414] group-focus-within:text-[#848480] absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                strokeWidth={1.9}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setIsInitialEntry(false);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Cari produk..."
                className="w-full h-[40px] rounded-[12px] bg-[#ededeb] hover:bg-white focus:bg-[#1c1c1a] border border-[#2a2a28] focus:border-white/[0.22] pl-[36px] pr-[12px] text-[12px] font-medium text-[#141414] focus:text-[#f2f2f0] placeholder-[#646460] focus:placeholder-[#787874] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-[8px] shrink-0 ml-auto">
              <span className="text-[11.5px] text-[#848480] hidden sm:inline whitespace-nowrap">
                Urutkan
              </span>
              <div className="inline-flex items-center bg-[#1c1c1a] border border-white/[0.08] rounded-[11px] p-[3px] gap-[2px]">
                {(
                  [
                    { id: 'name', label: 'Nama' },
                    { id: 'price', label: 'Harga' },
                  ] as const
                ).map((opt) => {
                  const isActive = sortField === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSortClick(opt.id)}
                      className={`h-[32px] px-[11px] rounded-[8px] inline-flex items-center gap-[5px] text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#ededeb] text-[#141414] font-semibold'
                          : 'text-[#b4b4b0] hover:text-white font-medium'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isActive ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-[12.5px] h-[12.5px] shrink-0" strokeWidth={2.2} />
                        ) : (
                          <ArrowDown className="w-[12.5px] h-[12.5px] shrink-0" strokeWidth={2.2} />
                        )
                      ) : (
                        <ArrowUpDown className="w-[12px] h-[12px] text-[#787874] shrink-0" strokeWidth={1.8} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Independently Scrollable Product Grid Area */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-[14px] pr-[4px]">
            {filteredProducts.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center py-12">
                <div className="w-[46px] h-[46px] rounded-[13px] bg-[#222220] border border-white/[0.07] flex items-center justify-center text-[#848480] mb-3">
                  <Search className="w-[19px] h-[19px]" strokeWidth={1.7} />
                </div>
                <div className="text-[14px] font-medium text-[#f2f2f0]">Produk tidak ditemukan</div>
                <p className="text-[12px] text-[#7c7c78] mt-1">
                  Coba kata kunci pencarian lain.
                </p>
              </div>
            ) : (
              <div
                key={`${searchQuery}-${sortField}-${sortDir}`}
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[12px] pb-1 ${
                  isInitialEntry ? '' : 'animate-filter-fade'
                }`}
              >
                {filteredProducts.map((product, idx) => {
                  const inCart = getCartQuantity(product.id);
                  const remaining = Math.max(0, product.stock - inCart);
                  const outOfStock = remaining <= 0;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addProductToCart(product)}
                      style={
                        isInitialEntry
                          ? { animationDelay: `${210 + Math.min(idx, 15) * 45}ms` }
                          : undefined
                      }
                      className={`group rounded-[16px] border p-[15px] text-left flex flex-col justify-between transition-all min-h-[116px] ${
                        isInitialEntry ? 'animate-tab-up' : ''
                      } ${
                        outOfStock
                          ? 'bg-[#181817] border-white/[0.04] opacity-50 cursor-not-allowed'
                          : inCart > 0
                          ? 'bg-[#222220] border-white/[0.22] hover:bg-[#272724] cursor-pointer'
                          : 'bg-[#1c1c1a] border-white/[0.07] hover:bg-[#222220] hover:border-white/[0.15] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="text-[13px] font-semibold text-[#f3f3f1] leading-[1.35] line-clamp-2">
                          {product.name}
                        </div>
                        {inCart > 0 && (
                          <span className="h-[22px] min-w-[22px] px-[6px] rounded-full bg-[#ededeb] text-[#141414] text-[11px] font-bold flex items-center justify-center tabular-nums shrink-0 animate-confirm-pop">
                            {inCart}
                          </span>
                        )}
                      </div>

                      <div className="w-full mt-[14px]">
                        <div className="text-[13.5px] font-semibold text-[#ededeb] tabular-nums">
                          <AnimatedNumber
                            value={product.sellPrice}
                            duration={480}
                            formatter={formatRupiah}
                          />
                        </div>
                        <div className="mt-[2px] text-[11.5px] text-[#7c7c78] tabular-nums">
                          <AnimatedNumber
                            value={remaining}
                            startFrom="previous"
                            duration={340}
                          />{' '}
                          tersisa
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right: Current Sale Cart & Payment Panel (Fixed within viewport) */}
        <aside
          className="col-span-12 lg:col-span-4 bg-[#171716] border border-white/[0.06] rounded-[20px] flex flex-col justify-between overflow-hidden min-h-0 animate-tab-up"
          style={{ animationDelay: '210ms' }}
        >
          {/* Top Sale Header */}
          <div
            className="p-[18px] pb-0 flex-1 flex flex-col min-h-0 animate-tab-up"
            style={{ animationDelay: '280ms' }}
          >
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-[9px]">
                <h2 className="text-[15.5px] font-semibold text-[#f3f3f1] tracking-[-0.01em] whitespace-nowrap">
                  Transaksi saat ini
                </h2>
                <span className="min-w-[23px] h-[23px] px-[6px] rounded-full bg-[#ededeb] text-[#141414] text-[11px] font-bold flex items-center justify-center leading-none tabular-nums">
                  <AnimatedNumber value={totalItemsCount} startFrom="previous" duration={280} />
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={cart.length === 0}
                title="Kosongkan transaksi"
                className={`w-[32px] h-[32px] rounded-[9px] flex items-center justify-center transition-colors ${
                  cart.length > 0
                    ? 'text-[#9e9e9a] hover:text-white hover:bg-white/[0.06] cursor-pointer'
                    : 'text-[#52524f] cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.8} />
              </button>
            </div>

            {/* Cart Items or Dashed Empty Scan Zone */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center py-[14px] min-h-0">
                <div className="rounded-[16px] border border-dashed border-white/[0.14] h-full min-h-[140px] flex flex-col items-center justify-center text-center px-4 py-6">
                  <ScanBarcode className="w-[22px] h-[22px] text-[#7c7c78] mb-[10px]" strokeWidth={1.7} />
                  <p className="text-[13px] font-medium text-[#8e8e8a]">
                    Ketuk produk untuk mulai transaksi
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto py-[12px] space-y-[8px] pr-[2px]">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[12px] bg-[#1d1d1b] border border-white/[0.06] px-[12px] py-[10px] flex items-center justify-between gap-2.5 animate-slide-right"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium text-[#f2f2f0] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#888884] tabular-nums mt-0.5">
                        {formatRupiah(item.unitPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-[8px] shrink-0">
                      <div className="inline-flex items-center bg-[#262624] border border-white/[0.07] rounded-[8px] p-[2px]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          aria-label="Kurangi jumlah"
                          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[#c8c8c4] hover:bg-white/[0.08] hover:text-white cursor-pointer"
                        >
                          <Minus className="w-[12px] h-[12px]" strokeWidth={2} />
                        </button>
                        <span className="min-w-[24px] text-center text-[12px] font-semibold text-[#f2f2f0] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          aria-label="Tambah jumlah"
                          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-[#c8c8c4] hover:bg-white/[0.08] hover:text-white cursor-pointer"
                        >
                          <Plus className="w-[12px] h-[12px]" strokeWidth={2} />
                        </button>
                      </div>

                      <div className="text-[12.5px] font-semibold text-[#f2f2f0] tabular-nums min-w-[78px] text-right">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Summary, Payment Method Pills & Charge CTA */}
          <div
            className="px-[18px] pb-[18px] shrink-0 animate-tab-up"
            style={{ animationDelay: '370ms' }}
          >
            <div className="border-t border-dashed border-white/[0.14] pt-[15px]">
              {/* Subtotal, Discount Pill, Tax */}
              <div className="space-y-[10px] text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e9e9a]">Subtotal</span>
                  <span className="tabular-nums text-[#f2f2f0] font-semibold">
                    <AnimatedNumber
                      value={subtotal}
                      startFrom="previous"
                      duration={320}
                      formatter={formatRupiah}
                    />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#9e9e9a]">Diskon</span>
                  <form onSubmit={handleApplyDiscount} className="inline-flex items-center gap-[6px]">
                    <div className="w-[74px] h-[32px] rounded-full bg-[#222220] border border-white/[0.08] focus-within:border-white/[0.25] px-[11px] flex items-center gap-[3px] transition-colors">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        placeholder="0"
                        aria-label="Persentase diskon"
                        className="w-full bg-transparent text-right text-[12px] font-semibold text-[#f2f2f0] placeholder-[#686864] tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[11.5px] text-[#8e8e8a] font-medium shrink-0">%</span>
                    </div>
                    <button
                      type="submit"
                      className="h-[32px] px-[13px] rounded-full bg-[#ededeb] hover:bg-white text-[#141414] text-[11.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Konfirmasi
                    </button>
                  </form>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between animate-filter-fade">
                    <span className="text-[#9e9e9a]">Potongan ({appliedDiscountPercent}%)</span>
                    <span className="tabular-nums text-[#d6d6d2] font-medium">
                      -
                      <AnimatedNumber
                        value={discountAmount}
                        startFrom="previous"
                        duration={320}
                        formatter={formatRupiah}
                      />
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#9e9e9a]">Pajak 11%</span>
                  <span className="tabular-nums text-[#f2f2f0] font-semibold">
                    <AnimatedNumber
                      value={taxAmount}
                      startFrom="previous"
                      duration={320}
                      formatter={formatRupiah}
                    />
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-baseline justify-between mt-[13px]">
                <span className="text-[14.5px] font-semibold text-[#f3f3f1]">Total</span>
                <span className="text-[28px] font-bold text-[#f3f3f1] tabular-nums tracking-[-0.03em] leading-none">
                  <AnimatedNumber
                    value={total}
                    startFrom="previous"
                    duration={360}
                    formatter={formatRupiah}
                  />
                </span>
              </div>

              {/* Payment Method Segmented Pill (Tunai at far right) */}
              <div className="mt-[15px] w-full rounded-full bg-[#222220] border border-white/[0.06] p-[4px] grid grid-cols-3 gap-[4px]">
                {(
                  [
                    { id: 'Kartu', icon: CreditCard },
                    { id: 'QRIS', icon: QrCode },
                    { id: 'Tunai', icon: Banknote },
                  ] as const
                ).map(({ id, icon: Icon }) => {
                  const active = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`h-[36px] rounded-full inline-flex items-center justify-center gap-[6px] text-[12px] transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#ededeb] text-[#141414] font-semibold'
                          : 'text-[#c4c4c0] hover:text-white font-medium'
                      }`}
                    >
                      <Icon className="w-[14px] h-[14px] shrink-0" strokeWidth={1.9} />
                      <span>{id}</span>
                    </button>
                  );
                })}
              </div>

              {/* Charge Pill CTA */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleChargeClick}
                className={`mt-[12px] w-full h-[46px] rounded-full inline-flex items-center justify-center text-[13.5px] font-semibold transition-all whitespace-nowrap ${
                  cart.length === 0
                    ? 'bg-[#2b2b29] text-[#7c7c78] cursor-not-allowed'
                    : 'bg-[#ededeb] hover:bg-white text-[#141414] cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                }`}
              >
                Bayar
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: Animated Payment Processing / Cash Input / Confirmation */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-filter-fade">
          <div className="w-full max-w-[400px] rounded-[24px] bg-[#1a1a18] border border-white/[0.1] p-[24px] shadow-2xl animate-modal-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16.5px] font-semibold text-[#f3f3f1]">
                  {paymentPhase === 'success'
                    ? 'Pembayaran Selesai'
                    : paymentPhase === 'error'
                    ? 'Pembayaran Gagal'
                    : paymentPhase === 'cash_input'
                    ? 'Pembayaran Tunai'
                    : `Pembayaran ${paymentMethod}`}
                </h3>
                {paymentPhase !== 'success' && (
                  <p className="text-[12px] text-[#888884] mt-0.5 tabular-nums">
                    {totalItemsCount} item
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClosePaymentModal}
                aria-label="Tutup jendela pembayaran"
                className="w-[30px] h-[30px] rounded-full bg-white/[0.05] text-[#9e9e9a] hover:text-white disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-[16px] h-[16px]" />
              </button>
            </div>

            {/* Phase 1A: Kartu NFC / Reader Animation */}
            {paymentPhase === 'processing' && paymentMethod === 'Kartu' && (
              <div className="py-5 flex flex-col items-center text-center">
                <div className="relative w-[132px] h-[132px] flex items-center justify-center mb-5">
                  <span className="absolute inset-0 rounded-full border border-white/[0.2] animate-card-wave" />
                  <span className="absolute inset-[14px] rounded-full border border-white/[0.25] animate-card-wave-delayed" />
                  <div className="relative w-[84px] h-[84px] rounded-[22px] bg-[#242422] border border-white/[0.14] flex flex-col items-center justify-center gap-1.5 shadow-xl">
                    <Wifi className="w-[18px] h-[18px] text-[#ededeb] rotate-90" strokeWidth={2} />
                    <CreditCard className="w-[26px] h-[26px] text-[#f3f3f1]" strokeWidth={1.7} />
                  </div>
                </div>
                <div className="text-[14px] font-semibold text-[#f3f3f1]">
                  Tempelkan atau gesek kartu
                </div>
                <p className="text-[12px] text-[#888884] mt-1">
                  Memverifikasi transaksi kartu debit/kredit...
                </p>
                <div className="mt-4 rounded-full bg-[#131312] border border-white/[0.07] px-5 py-2 text-[15px] font-bold text-[#ededeb] tabular-nums">
                  {formatRupiah(total)}
                </div>
              </div>
            )}

            {/* Phase 1B: QRIS Scan Beam Animation */}
            {paymentPhase === 'processing' && paymentMethod === 'QRIS' && (
              <div className="py-4 flex flex-col items-center text-center">
                <div className="relative w-[148px] h-[148px] rounded-[20px] bg-[#131312] border border-white/[0.1] flex items-center justify-center overflow-hidden mb-5">
                  {/* Corner scan brackets */}
                  <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#ededeb] rounded-tl-[4px]" />
                  <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#ededeb] rounded-tr-[4px]" />
                  <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#ededeb] rounded-bl-[4px]" />
                  <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#ededeb] rounded-br-[4px]" />

                  <QrCode className="w-[78px] h-[78px] text-[#ededeb]" strokeWidth={1.4} />

                  {/* Animated horizontal scan laser */}
                  <div className="absolute left-4 right-4 top-[14px] h-[2px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] animate-qris-scan" />
                </div>

                <div className="text-[14px] font-semibold text-[#f3f3f1]">
                  Menunggu pemindaian QRIS
                </div>
                <p className="text-[12px] text-[#888884] mt-1">
                  Memeriksa konfirmasi pembayaran instan...
                </p>
                <div className="mt-4 rounded-full bg-[#131312] border border-white/[0.07] px-5 py-2 text-[15px] font-bold text-[#ededeb] tabular-nums">
                  {formatRupiah(total)}
                </div>
              </div>
            )}

            {/* Phase 2: Tunai Input Received Cash Before Confirmation Animation */}
            {paymentPhase === 'cash_input' && (
              <form onSubmit={handleConfirmCashPayment}>
                <div className="rounded-[16px] bg-[#131312] border border-white/[0.07] p-4 flex items-center justify-between mb-4">
                  <span className="text-[12.5px] text-[#9e9e9a]">Total tagihan</span>
                  <span className="text-[22px] font-bold text-[#f3f3f1] tabular-nums">
                    {formatRupiah(total)}
                  </span>
                </div>

                <div className="space-y-2.5 mb-5">
                  <label className="block text-[12px] font-medium text-[#b4b4b0]">
                    Uang diterima (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    autoFocus
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder={String(total)}
                    className="w-full h-[44px] rounded-[12px] bg-[#121211] border border-white/[0.12] px-3.5 text-[15px] font-semibold text-[#f2f2f0] placeholder-[#5e5e5a] tabular-nums focus:outline-none focus:border-white/[0.3]"
                  />

                  <div className="flex items-center gap-2 pt-0.5">
                    {quickCashSuggestions.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashReceived(String(amt))}
                        className="flex-1 h-[32px] rounded-full bg-[#242422] hover:bg-[#30302d] border border-white/[0.07] text-[11px] font-medium text-[#d6d6d2] tabular-nums transition-colors cursor-pointer whitespace-nowrap px-2"
                      >
                        {amt === total ? 'Uang Pas' : formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/[0.1] text-[13px]">
                    <span className="text-[#9e9e9a]">Kembalian</span>
                    <span
                      className={`tabular-nums font-bold ${
                        parsedCash >= total ? 'text-[#f3f3f1]' : 'text-[#6c6c68]'
                      }`}
                    >
                      {parsedCash >= total ? formatRupiah(cashChange) : 'Belum cukup'}
                    </span>
                  </div>
                </div>

                {paymentError && (
                  <div className="mb-3 rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-3 py-2 text-[12px] text-[#f2f2f0]">
                    {paymentError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={parsedCash < total || isSubmitting}
                  className={`w-full h-[46px] rounded-full text-[13.5px] font-semibold transition-colors ${
                    parsedCash < total || isSubmitting
                      ? 'bg-[#2b2b29] text-[#7c7c78] cursor-not-allowed'
                      : 'bg-[#ededeb] hover:bg-white text-[#141414] cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran Tunai'}
                </button>
              </form>
            )}

            {paymentPhase === 'error' && (
              <div className="py-3 space-y-4">
                <div className="rounded-[14px] bg-[#131312] border border-white/[0.1] p-4 text-[13px] text-[#d6d6d2] leading-[1.5]">
                  {paymentError || 'Pembayaran gagal diproses. Silakan coba lagi.'}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleClosePaymentModal}
                    className="flex-1 h-[42px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleChargeClick}
                    className="flex-1 h-[42px] rounded-full bg-[#ededeb] hover:bg-white text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {/* Phase 3: Animated Confirmation Success */}
            {paymentPhase === 'success' && successSnapshot && (
              <div className="py-3 flex flex-col items-center text-center">
                <div className="w-[72px] h-[72px] rounded-full bg-[#ededeb] text-[#141414] flex items-center justify-center mb-4 animate-confirm-pop shadow-[0_10px_30px_rgba(237,237,235,0.2)]">
                  <Check className="w-[34px] h-[34px]" strokeWidth={2.5} />
                </div>

                <div className="text-[17px] font-semibold text-[#f3f3f1]">
                  Pembayaran {successSnapshot.method} Berhasil
                </div>
                <p className="text-[12px] text-[#888884] mt-1 tabular-nums">
                  Struk {successSnapshot.receiptNo}
                </p>

                <div className="w-full rounded-[16px] bg-[#131312] border border-white/[0.07] p-4 mt-5 space-y-2 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8e8e8a]">Total dibayar</span>
                    <span className="font-bold text-[#f3f3f1] tabular-nums">
                      {formatRupiah(successSnapshot.total)}
                    </span>
                  </div>
                  {successSnapshot.method === 'Tunai' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8e8e8a]">Uang diterima</span>
                        <span className="font-medium text-[#d6d6d2] tabular-nums">
                          {formatRupiah(successSnapshot.paidCash)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-white/[0.1]">
                        <span className="text-[#8e8e8a]">Kembalian</span>
                        <span className="font-bold text-[#ededeb] tabular-nums">
                          {formatRupiah(successSnapshot.change)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="mt-5 w-full h-[46px] rounded-full bg-[#ededeb] hover:bg-white text-[#141414] text-[13.5px] font-semibold transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
