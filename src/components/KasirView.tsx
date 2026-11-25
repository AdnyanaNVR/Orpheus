import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  UserPlus,
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
} from 'lucide-react';
import {
  INITIAL_KASIR_PRODUCTS,
  KASIR_CUSTOMERS,
  KasirCustomer,
  KasirProduct,
  formatRupiah,
} from '../data/kasirData';

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

type DiscountOption = 'none' | '10' | '15';
type PaymentMethod = 'Kartu' | 'Tunai' | 'QRIS';

type SortField = 'name' | 'price';
type SortDirection = 'asc' | 'desc';

const TAX_RATE = 0.11;

export const KasirView: React.FC = () => {
  const [products, setProducts] = useState<KasirProduct[]>(INITIAL_KASIR_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<KasirCustomer | null>(null);
  const [discount, setDiscount] = useState<DiscountOption>('none');

  // Overlays / interactive panels
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Kartu');
  const [cashReceived, setCashReceived] = useState('');
  const [completedReceipt, setCompletedReceipt] = useState<{
    receiptNo: string;
    total: number;
    method: PaymentMethod;
    change: number;
  } | null>(null);

  const handleSortClick = (field: 'name' | 'price') => {
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
      list.sort((a, b) => (sortDir === 'asc' ? a.price - b.price : b.price - a.price));
    }

    return list;
  }, [products, searchQuery, sortField, sortDir]);

  const getCartQuantity = (productId: string) =>
    cart.find((item) => item.id === productId)?.quantity ?? 0;

  const addProductToCart = (product: KasirProduct) => {
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
          unitPrice: product.price,
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
    setSelectedCustomer(null);
    setDiscount('none');
  };

  const totalItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const discountRate = discount === '10' ? 0.1 : discount === '15' ? 0.15 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(discountedSubtotal * TAX_RATE);
  const total = discountedSubtotal + taxAmount;

  const parsedCash = Number(cashReceived.replace(/[^\d]/g, '')) || 0;
  const cashChange = Math.max(0, parsedCash - total);

  const handleCompletePayment = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Tunai' && parsedCash < total) return;

    setProducts((prev) =>
      prev.map((prod) => {
        const sold = cart.find((c) => c.id === prod.id);
        if (!sold) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - sold.quantity) };
      })
    );

    const receiptNo = `#POS-${Math.floor(1000 + Math.random() * 9000)}`;
    setCompletedReceipt({
      receiptNo,
      total,
      method: paymentMethod,
      change: paymentMethod === 'Tunai' ? cashChange : 0,
    });
    setShowPaymentModal(false);
    setCashReceived('');
    handleClearCart();
  };

  return (
    <main>
      {/* Clean Kasir Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[40px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.05]">
          Kasir
        </h1>
      </div>

      {/* Receipt Confirmation Banner */}
      {completedReceipt && (
        <div className="mt-[14px] rounded-[16px] bg-[#1e1e1c] border border-white/[0.12] px-[18px] py-[12px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full bg-[#ededeb] text-[#141414] flex items-center justify-center shrink-0">
              <Check className="w-[15px] h-[15px]" strokeWidth={2.4} />
            </div>
            <div className="text-[12.5px] text-[#f2f2f0]">
              <span className="font-semibold">Transaksi {completedReceipt.receiptNo} selesai</span>
              <span className="text-[#8e8e8a] mx-2">·</span>
              <span className="tabular-nums">{formatRupiah(completedReceipt.total)}</span>
              <span className="text-[#8e8e8a] mx-2">·</span>
              <span className="text-[#c8c8c4]">{completedReceipt.method}</span>
              {completedReceipt.change > 0 && (
                <>
                  <span className="text-[#8e8e8a] mx-2">·</span>
                  <span className="text-[#c8c8c4] tabular-nums">
                    Kembalian {formatRupiah(completedReceipt.change)}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCompletedReceipt(null)}
            aria-label="Tutup notifikasi struk"
            className="text-[#8e8e8a] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-[16px] h-[16px]" />
          </button>
        </div>
      )}

      {/* Two-Column Monochrome POS Workspace */}
      <div className="grid grid-cols-12 gap-[16px] mt-[16px] items-stretch">
        {/* Left: Search & Product Grid */}
        <section className="col-span-12 lg:col-span-8 bg-[#171716] border border-white/[0.06] rounded-[20px] p-[18px] flex flex-col min-w-0">
          {/* Search (Left, Compact) & Sort (Right End) */}
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <div className="group relative w-full sm:w-[235px]">
              <Search
                className="w-[14px] h-[14px] text-[#141414] group-focus-within:text-[#848480] absolute left-[13px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                strokeWidth={1.9}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center text-center py-12">
              <div className="w-[46px] h-[46px] rounded-[13px] bg-[#222220] border border-white/[0.07] flex items-center justify-center text-[#848480] mb-3">
                <Search className="w-[19px] h-[19px]" strokeWidth={1.7} />
              </div>
              <div className="text-[14px] font-medium text-[#f2f2f0]">Produk tidak ditemukan</div>
              <p className="text-[12px] text-[#7c7c78] mt-1">
                Coba kata kunci pencarian lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[12px] mt-[14px]">
              {filteredProducts.map((product) => {
                const inCart = getCartQuantity(product.id);
                const remaining = Math.max(0, product.stock - inCart);
                const outOfStock = remaining <= 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => addProductToCart(product)}
                    className={`group rounded-[16px] border p-[15px] text-left flex flex-col justify-between transition-all min-h-[116px] ${
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
                        <span className="h-[22px] min-w-[22px] px-[6px] rounded-full bg-[#ededeb] text-[#141414] text-[11px] font-bold flex items-center justify-center tabular-nums shrink-0">
                          {inCart}
                        </span>
                      )}
                    </div>

                    <div className="w-full mt-[14px]">
                      <div className="text-[13.5px] font-semibold text-[#ededeb] tabular-nums">
                        {formatRupiah(product.price)}
                      </div>
                      <div className="mt-[2px] text-[11.5px] text-[#7c7c78] tabular-nums">
                        {remaining} tersisa
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Current Sale Cart & Payment Panel */}
        <aside className="col-span-12 lg:col-span-4 bg-[#171716] border border-white/[0.06] rounded-[20px] flex flex-col justify-between overflow-hidden min-h-[540px]">
          {/* Top Sale Header & Customer Attachment */}
          <div className="p-[18px] pb-0 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-[9px]">
                <h2 className="text-[15.5px] font-semibold text-[#f3f3f1] tracking-[-0.01em] whitespace-nowrap">
                  Transaksi saat ini
                </h2>
                <span className="min-w-[23px] h-[23px] px-[6px] rounded-full bg-[#ededeb] text-[#141414] text-[11px] font-bold flex items-center justify-center leading-none tabular-nums">
                  {totalItemsCount}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={cart.length === 0 && !selectedCustomer}
                title="Kosongkan transaksi"
                className={`w-[32px] h-[32px] rounded-[9px] flex items-center justify-center transition-colors ${
                  cart.length > 0 || selectedCustomer
                    ? 'text-[#9e9e9a] hover:text-white hover:bg-white/[0.06] cursor-pointer'
                    : 'text-[#52524f] cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-[15px] h-[15px]" strokeWidth={1.8} />
              </button>
            </div>

            {/* Attach a customer dashed button / picker */}
            <div className="relative mt-[14px]">
              {selectedCustomer ? (
                <div className="h-[42px] rounded-[12px] bg-[#21211f] border border-white/[0.12] px-[13px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserPlus className="w-[14px] h-[14px] text-[#ededeb] shrink-0" strokeWidth={1.8} />
                    <span className="text-[12.5px] font-medium text-[#f2f2f0] truncate">
                      {selectedCustomer.name}
                    </span>
                    <span className="text-[11px] text-[#888884] whitespace-nowrap shrink-0">
                      · {selectedCustomer.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    aria-label="Hapus pelanggan"
                    className="text-[#888884] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-[14px] h-[14px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomerPicker((prev) => !prev)}
                  className="w-full h-[42px] rounded-[12px] border border-dashed border-white/[0.15] hover:border-white/[0.3] hover:bg-white/[0.02] px-[14px] flex items-center justify-center gap-[8px] text-[12.5px] font-medium text-[#d4d4d0] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-[15px] h-[15px] text-[#9e9e9a]" strokeWidth={1.8} />
                  <span>Kaitkan pelanggan</span>
                </button>
              )}

              {showCustomerPicker && !selectedCustomer && (
                <div className="absolute left-0 right-0 top-[48px] z-30 rounded-[14px] bg-[#21211f] border border-white/[0.12] p-2 shadow-2xl space-y-1">
                  {KASIR_CUSTOMERS.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setShowCustomerPicker(false);
                      }}
                      className="w-full rounded-[9px] px-3 py-2 text-left hover:bg-white/[0.06] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-[12px] font-medium text-[#f2f2f0]">{cust.name}</span>
                      <span className="text-[11px] text-[#888884]">{cust.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items or Dashed Empty Scan Zone */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center py-[16px]">
                <div className="rounded-[16px] border border-dashed border-white/[0.14] min-h-[168px] flex flex-col items-center justify-center text-center px-4 py-8">
                  <ScanBarcode className="w-[22px] h-[22px] text-[#7c7c78] mb-[10px]" strokeWidth={1.7} />
                  <p className="text-[13px] font-medium text-[#8e8e8a]">
                    Ketuk produk untuk mulai transaksi
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto py-[14px] space-y-[8px] max-h-[260px] pr-0.5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[12px] bg-[#1d1d1b] border border-white/[0.06] px-[12px] py-[10px] flex items-center justify-between gap-2.5"
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
          <div className="px-[18px] pb-[18px]">
            <div className="border-t border-dashed border-white/[0.14] pt-[16px]">
              {/* Subtotal, Discount Pill, Tax */}
              <div className="space-y-[11px] text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9e9e9a]">Subtotal</span>
                  <span className="tabular-nums text-[#f2f2f0] font-semibold">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#9e9e9a]">Diskon</span>
                  <div className="inline-flex items-center bg-[#232321] border border-white/[0.06] rounded-full p-[3px] gap-[2px]">
                    {(
                      [
                        { id: 'none', label: 'Tanpa' },
                        { id: '10', label: '10%' },
                        { id: '15', label: '15%' },
                      ] as const
                    ).map((opt) => {
                      const active = discount === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDiscount(opt.id)}
                          className={`px-[12px] py-[4px] rounded-full text-[11.5px] transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#ededeb] text-[#141414] font-semibold'
                              : 'text-[#a2a29d] hover:text-white font-medium'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9e9e9a]">Potongan ({Math.round(discountRate * 100)}%)</span>
                    <span className="tabular-nums text-[#d6d6d2] font-medium">
                      -{formatRupiah(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#9e9e9a]">Pajak 11%</span>
                  <span className="tabular-nums text-[#f2f2f0] font-semibold">
                    {formatRupiah(taxAmount)}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-baseline justify-between mt-[14px]">
                <span className="text-[14.5px] font-semibold text-[#f3f3f1]">Total</span>
                <span className="text-[28px] font-bold text-[#f3f3f1] tabular-nums tracking-[-0.03em] leading-none">
                  {formatRupiah(total)}
                </span>
              </div>

              {/* Payment Method Segmented Pill */}
              <div className="mt-[16px] w-full rounded-full bg-[#222220] border border-white/[0.06] p-[4px] grid grid-cols-3 gap-[4px]">
                {(
                  [
                    { id: 'Kartu', icon: CreditCard },
                    { id: 'Tunai', icon: Banknote },
                    { id: 'QRIS', icon: QrCode },
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
                onClick={() => {
                  if (paymentMethod === 'Tunai') {
                    setCashReceived(String(total));
                    setShowPaymentModal(true);
                  } else {
                    handleCompletePayment();
                  }
                }}
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

      {/* Modal: Checkout Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] rounded-[20px] bg-[#1a1a18] border border-white/[0.1] p-[22px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#f3f3f1]">Pembayaran Kasir</h3>
                <p className="text-[12px] text-[#888884] mt-0.5 tabular-nums">
                  {totalItemsCount} item{selectedCustomer ? ` · ${selectedCustomer.name}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-[#888884] hover:text-white cursor-pointer"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="rounded-[14px] bg-[#131312] border border-white/[0.07] p-4 flex items-center justify-between mb-4">
              <span className="text-[12.5px] text-[#9e9e9a]">Total tagihan</span>
              <span className="text-[22px] font-semibold text-[#f3f3f1] tabular-nums">
                {formatRupiah(total)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {(
                [
                  { id: 'QRIS', icon: QrCode },
                  { id: 'Kartu', icon: CreditCard },
                  { id: 'Tunai', icon: Banknote },
                ] as const
              ).map(({ id, icon: Icon }) => {
                const active = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`h-[44px] rounded-[11px] border flex items-center justify-center gap-2 text-[12.5px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#ededeb] border-[#ededeb] text-[#141414] font-semibold'
                        : 'bg-[#21211f] border-white/[0.07] text-[#c8c8c4] hover:border-white/[0.18]'
                    }`}
                  >
                    <Icon className="w-[15px] h-[15px]" strokeWidth={1.9} />
                    <span>{id}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Tunai' && (
              <div className="mb-4 space-y-2">
                <label className="block text-[11.5px] text-[#9e9e9a]">Uang diterima (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full h-[42px] rounded-[10px] bg-[#121211] border border-white/[0.1] px-3 text-[13.5px] font-medium text-[#f2f2f0] tabular-nums focus:outline-none focus:border-white/[0.25]"
                />
                <div className="flex items-center justify-between text-[12px] text-[#9e9e9a] pt-1">
                  <span>Kembalian</span>
                  <span className="tabular-nums font-semibold text-[#ededeb]">
                    {formatRupiah(cashChange)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={paymentMethod === 'Tunai' && parsedCash < total}
              onClick={handleCompletePayment}
              className={`w-full h-[46px] rounded-[12px] text-[13.5px] font-semibold transition-colors ${
                paymentMethod === 'Tunai' && parsedCash < total
                  ? 'bg-[#2a2a28] text-[#848480] cursor-not-allowed'
                  : 'bg-[#ededeb] hover:bg-white text-[#141414] cursor-pointer'
              }`}
            >
              Selesaikan Pembayaran
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
