import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Pencil,
  PackagePlus,
  Trash2,
} from 'lucide-react';
import { formatRupiah } from '../data/kasirData';
import type { PosProduct } from '../types/pos';
import {
  createProductApi,
  deleteProductApi,
  updateProductApi,
} from '../lib/posApi';
import { AnimatedNumber } from './AnimatedNumber';
import { AnimatedTitle } from './AnimatedTitle';

type SortKey = 'id' | 'name' | 'sellPrice' | 'margin' | 'stock';
type SortDirection = 'asc' | 'desc';
type ProductActionMode = 'edit' | 'restock' | 'delete';

const LOW_STOCK_THRESHOLD = 5;

function summarizeProductNames(items: PosProduct[], emptyLabel: string): string {
  if (items.length === 0) return emptyLabel;
  if (items.length === 1) return items[0].name;
  return `${items[0].name} dan ${items.length - 1} lainnya`;
}

interface ProdukViewProps {
  products: PosProduct[];
  onProductCreated: (product: PosProduct) => void;
  onProductUpdated: (product: PosProduct) => void;
  onProductDeleted: (id: string) => void;
}

export const ProdukView: React.FC<ProdukViewProps> = ({
  products,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}) => {
  const items = products;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [isInitialEntry, setIsInitialEntry] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSellPrice, setNewSellPrice] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    item: PosProduct;
    x: number;
    y: number;
  } | null>(null);

  const [selectedItem, setSelectedItem] = useState<PosProduct | null>(null);
  const [actionMode, setActionMode] = useState<ProductActionMode>('edit');
  const [editName, setEditName] = useState('');
  const [editSellPrice, setEditSellPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [restockAmount, setRestockAmount] = useState('');
  const [actionError, setActionError] = useState('');
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const syncScrollState = () => {
    const tableScrolled = (tableScrollRef.current?.scrollTop ?? 0) > 40;
    const windowScrolled = window.scrollY > 40;
    setIsScrolled(tableScrolled || windowScrolled);
  };

  useEffect(() => {
    const handleWindowScroll = () => {
      syncScrollState();
      setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    syncScrollState();
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToTop = () => {
    tableScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextProductId = useMemo(() => {
    const maxId = items.reduce((max, item) => {
      const numeric = Number.parseInt(item.id, 10);
      return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
    }, 0);
    return String(maxId + 1).padStart(4, '0');
  }, [items]);

  const openContextMenu = (e: React.MouseEvent<HTMLTableRowElement>, item: PosProduct) => {
    const menuWidth = 200;
    const menuHeight = 134;
    const padding = 10;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - padding);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - padding);
    setContextMenu({
      item,
      x: Math.max(padding, x),
      y: Math.max(padding, y),
    });
  };

  const chooseContextAction = (mode: ProductActionMode) => {
    if (!contextMenu) return;
    const target = contextMenu.item;
    setContextMenu(null);
    setSelectedItem(target);
    setActionMode(mode);
    setEditName(target.name);
    setEditSellPrice(String(target.sellPrice));
    setEditCostPrice(String(target.costPrice));
    setEditStock(String(target.stock));
    setRestockAmount('');
    setActionError('');
  };

  const closeProductActions = () => {
    if (isSubmitting) return;
    setSelectedItem(null);
    setActionError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || isSubmitting) return;

    const trimmedName = editName.trim();
    const parsedSell = Number(editSellPrice);
    const parsedCost = Number(editCostPrice);
    const parsedStock = Number(editStock);

    if (!trimmedName) {
      setActionError('Nama produk wajib diisi.');
      return;
    }
    if (editSellPrice.trim() === '' || !Number.isFinite(parsedSell) || parsedSell <= 0) {
      setActionError('Harga jual wajib diisi dan lebih dari 0.');
      return;
    }
    if (editCostPrice.trim() === '' || !Number.isFinite(parsedCost) || parsedCost < 0) {
      setActionError('Harga modal wajib diisi dan minimal 0.');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setActionError('Stok harus berupa bilangan bulat minimal 0.');
      return;
    }

    setActionError('');
    setIsSubmitting(true);
    try {
      const { product } = await updateProductApi(selectedItem.id, {
        name: trimmedName,
        sellPrice: Math.round(parsedSell),
        costPrice: Math.round(parsedCost),
        stock: parsedStock,
      });
      onProductUpdated(product);
      setSelectedItem(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Gagal memperbarui produk.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || isSubmitting) return;

    const added = Number(restockAmount);
    if (!Number.isInteger(added) || added <= 0) {
      setActionError('Jumlah tambah stok harus berupa bilangan bulat minimal 1.');
      return;
    }

    setActionError('');
    setIsSubmitting(true);
    try {
      const { product } = await updateProductApi(selectedItem.id, {
        restockDelta: added,
      });
      onProductUpdated(product);
      setSelectedItem(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Gagal menambahkan stok.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || isSubmitting) return;
    setActionError('');
    setIsSubmitting(true);
    try {
      await deleteProductApi(selectedItem.id);
      onProductDeleted(selectedItem.id);
      setSelectedItem(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Gagal menghapus produk.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setNewName('');
    setNewSellPrice('');
    setNewCostPrice('');
    setNewStock('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = newName.trim();
    const parsedSell = Number(newSellPrice);
    const parsedStock = Number(newStock);
    const parsedCost = Number(newCostPrice);

    if (!trimmedName) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (newSellPrice.trim() === '' || !Number.isFinite(parsedSell) || parsedSell <= 0) {
      setFormError('Harga jual wajib diisi dan lebih dari 0.');
      return;
    }
    if (newCostPrice.trim() === '' || !Number.isFinite(parsedCost) || parsedCost < 0) {
      setFormError('Harga modal wajib diisi dan minimal 0.');
      return;
    }
    if (newStock.trim() === '' || !Number.isInteger(parsedStock) || parsedStock < 0) {
      setFormError('Stok awal wajib diisi berupa bilangan bulat minimal 0.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const { product } = await createProductApi({
        name: trimmedName,
        sellPrice: Math.round(parsedSell),
        costPrice: Math.round(parsedCost),
        stock: parsedStock,
      });
      onProductCreated(product);
      setIsAddModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Gagal menambahkan produk.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const totalCostValue = items.reduce(
      (sum, item) => sum + item.costPrice * item.stock,
      0
    );
    const totalUnits = items.reduce((sum, item) => sum + item.stock, 0);
    const lowStockItems = items.filter(
      (item) => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD
    );
    const outOfStockItems = items.filter((item) => item.stock === 0);

    return {
      totalCostValue,
      totalUnits,
      lowStockItems,
      outOfStockItems,
    };
  }, [items]);

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
    const list = q
      ? items.filter(
          (item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
        )
      : [...items];

    list.sort((a, b) => {
      if (sortKey === 'id') {
        return sortDir === 'asc'
          ? a.id.localeCompare(b.id, 'id')
          : b.id.localeCompare(a.id, 'id');
      }
      if (sortKey === 'name') {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name, 'id')
          : b.name.localeCompare(a.name, 'id');
      }
      if (sortKey === 'sellPrice') {
        return sortDir === 'asc' ? a.sellPrice - b.sellPrice : b.sellPrice - a.sellPrice;
      }
      if (sortKey === 'margin') {
        const marginA = a.sellPrice - a.costPrice;
        const marginB = b.sellPrice - b.costPrice;
        return sortDir === 'asc' ? marginA - marginB : marginB - marginA;
      }
      return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
    });

    return list;
  }, [items, searchQuery, sortKey, sortDir]);

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
        <AnimatedTitle text="Produk" />
      </div>

      {/* 3-Card Inventory Summary Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-[14px] mt-[16px] shrink-0">
        {/* Card 1: Stock Value (Bright Monochrome Surface) */}
        <div
          className="bg-[#f0f0ee] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="text-[12px] font-medium text-[#2c2c2a] whitespace-nowrap">
            Nilai stok
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#141414] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px] whitespace-nowrap">
            <AnimatedNumber value={summary.totalCostValue} formatter={formatRupiah} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-black/[0.16] text-[12px] text-[#5c5c58] tabular-nums whitespace-nowrap">
            <AnimatedNumber value={summary.totalUnits} /> unit tersedia
          </div>
        </div>

        {/* Card 2: Low Stock */}
        <div
          className="bg-[#171716] border border-white/[0.08] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '170ms' }}
        >
          <div className="text-[12px] font-medium text-[#9e9e9a] whitespace-nowrap">
            Stok menipis
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px]">
            <AnimatedNumber value={summary.lowStockItems.length} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-white/[0.12] text-[12px] text-[#848480] truncate">
            {summarizeProductNames(summary.lowStockItems, 'Semua stok aman')}
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div
          className="bg-[#171716] border border-white/[0.08] rounded-[22px] px-[22px] py-[18px] flex flex-col justify-between min-h-[132px] overflow-hidden animate-tab-up"
          style={{ animationDelay: '240ms' }}
        >
          <div className="text-[12px] font-medium text-[#9e9e9a] whitespace-nowrap">
            Stok habis
          </div>
          <div className="text-[24px] lg:text-[26px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.15] tabular-nums my-[8px]">
            <AnimatedNumber value={summary.outOfStockItems.length} />
          </div>
          <div className="pt-[10px] border-t border-dashed border-white/[0.12] text-[12px] text-[#848480] truncate">
            {summarizeProductNames(summary.outOfStockItems, 'Tidak ada produk habis')}
          </div>
        </div>
      </section>

      {/* Search Bar & Sortable Product Table (Only Table Scrolls on Desktop) */}
      <section
        className="mt-[16px] bg-[#171716] border border-white/[0.08] rounded-[22px] p-[20px] flex-1 min-h-0 flex flex-col overflow-hidden animate-tab-up"
        style={{ animationDelay: '320ms' }}
      >
        {/* Toolbar: White-before-focus Search Input + Tambah produk Button */}
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
              placeholder="Cari produk..."
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

          <button
            type="button"
            onClick={openAddModal}
            className="h-[40px] px-[18px] rounded-full bg-[#ededeb] text-[#141414] hover:bg-white text-[12.5px] font-semibold inline-flex items-center gap-[7px] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-[15px] h-[15px]" strokeWidth={2.2} />
            <span>Tambah produk</span>
          </button>
        </div>

        {/* Product Table */}
        <div
          ref={tableScrollRef}
          onScroll={() => {
            syncScrollState();
            setContextMenu(null);
          }}
          className="flex-1 min-h-0 overflow-auto rounded-[14px] border border-white/[0.06] bg-[#141413] animate-tab-up"
          style={{ animationDelay: '380ms' }}
        >
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1b1b19] border-b border-white/[0.07]">
                <th className="py-[12px] px-[16px] w-[96px]">
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
                    onClick={() => handleSort('name')}
                    className={`inline-flex items-center gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'name'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Nama</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px] text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('sellPrice')}
                    className={`inline-flex items-center justify-end gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'sellPrice'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Harga</span>
                    {renderSortIcon('sellPrice')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px] text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('margin')}
                    className={`inline-flex items-center justify-end gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'margin'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Margin</span>
                    {renderSortIcon('margin')}
                  </button>
                </th>
                <th className="py-[12px] px-[16px] text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('stock')}
                    className={`inline-flex items-center justify-end gap-[6px] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      sortKey === 'stock'
                        ? 'text-[#f3f3f1]'
                        : 'text-[#9e9e9a] hover:text-[#f3f3f1]'
                    }`}
                  >
                    <span>Stok</span>
                    {renderSortIcon('stock')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody
              key={`${searchQuery}-${sortKey}-${sortDir}`}
              className={isInitialEntry ? '' : 'animate-filter-fade'}
            >
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="text-[13.5px] font-medium text-[#f2f2f0]">
                      {items.length === 0
                        ? 'Belum ada produk di toko ini'
                        : 'Produk tidak ditemukan'}
                    </div>
                    <p className="text-[12px] text-[#7c7c78] mt-1">
                      {items.length === 0
                        ? 'Klik "Tambah produk" untuk mulai mengisi katalog.'
                        : 'Coba kata kunci pencarian lain.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item, idx) => {
                  const isOut = item.stock === 0;
                  const isLow = item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD;
                  const marginAmount = item.sellPrice - item.costPrice;
                  const marginPercent =
                    item.sellPrice > 0 ? (marginAmount / item.sellPrice) * 100 : 0;
                  return (
                    <tr
                      key={item.id}
                      onClick={(e) => openContextMenu(e, item)}
                      style={
                        isInitialEntry
                          ? { animationDelay: `${430 + Math.min(idx, 15) * 48}ms` }
                          : undefined
                      }
                      className={`border-t border-white/[0.05] transition-colors cursor-pointer ${
                        isInitialEntry ? 'animate-tab-up' : ''
                      } ${
                        contextMenu?.item.id === item.id
                          ? 'bg-white/[0.07]'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="py-[13px] px-[16px] text-[12.5px] font-medium text-[#9e9e9a] tabular-nums whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="py-[13px] px-[16px] text-[13px] font-medium text-[#f2f2f0]">
                        {item.name}
                      </td>
                      <td className="py-[13px] px-[16px] text-[13px] font-semibold text-[#ededeb] text-right tabular-nums whitespace-nowrap">
                        <AnimatedNumber
                          value={item.sellPrice}
                          duration={480}
                          formatter={formatRupiah}
                        />
                      </td>
                      <td className="py-[13px] px-[16px] text-[13px] text-right tabular-nums whitespace-nowrap">
                        <span
                          className={
                            marginAmount < 0
                              ? 'text-[#9e9e9a] font-medium'
                              : 'text-[#ededeb] font-medium'
                          }
                        >
                          <AnimatedNumber
                            value={marginAmount}
                            duration={480}
                            formatter={formatRupiah}
                          />
                        </span>
                        <span className="text-[11.5px] text-[#848480] ml-1.5">
                          (
                          <AnimatedNumber
                            value={marginPercent}
                            decimals={1}
                            duration={480}
                            formatter={(v) => `${v.toFixed(1).replace('.', ',')}%`}
                          />
                          )
                        </span>
                      </td>
                      <td className="py-[13px] px-[16px] text-[13px] text-right tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isOut
                              ? 'text-[#7c7c78] font-medium'
                              : isLow
                              ? 'text-[#d6d6d2] font-semibold'
                              : 'text-[#e5e5e2] font-medium'
                          }
                        >
                          <AnimatedNumber value={item.stock} duration={480} />
                        </span>
                        {isOut && (
                          <span className="text-[11.5px] text-[#7c7c78] ml-1.5">· Habis</span>
                        )}
                        {isLow && (
                          <span className="text-[11.5px] text-[#9e9e9a] ml-1.5">· Menipis</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

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

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-filter-fade"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-[#181817] border border-white/[0.12] rounded-[22px] p-[22px] shadow-2xl animate-modal-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-[16px]">
              <div>
                <h2 className="text-[18px] font-semibold text-[#f3f3f1] tracking-[-0.02em]">
                  Tambah produk
                </h2>
                <p className="text-[12px] text-[#848480] mt-0.5 tabular-nums">
                  ID produk otomatis: {nextProductId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Tutup modal"
                className="w-[32px] h-[32px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] text-[#b4b4b0] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-[15px] h-[15px]" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-[14px]">
              <div>
                <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                  Nama produk
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Braket Sudut Aluminium 12&quot;"
                  autoFocus
                  className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] focus:outline-none focus:border-white/[0.28]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <div>
                  <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                    Harga jual (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newSellPrice}
                    onChange={(e) => setNewSellPrice(e.target.value)}
                    placeholder="250000"
                    className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] tabular-nums focus:outline-none focus:border-white/[0.28]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                    Stok awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="25"
                    className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] tabular-nums focus:outline-none focus:border-white/[0.28]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                  Harga modal (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                  placeholder="165000"
                  className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] tabular-nums focus:outline-none focus:border-white/[0.28]"
                />
              </div>

              {formError && (
                <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-[12px] py-[8px] text-[12px] text-[#f2f2f0]">
                  {formError}
                </div>
              )}

              <div className="pt-[6px] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-[40px] px-[18px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[40px] px-[20px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-40 text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            role="menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 w-[200px] bg-[#222220] border border-white/[0.14] rounded-[4px] py-[4px] shadow-[0_10px_28px_rgba(0,0,0,0.72)] select-none animate-menu-pop"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => chooseContextAction('edit')}
              className="w-full px-[12px] py-[7px] flex items-center gap-[10px] text-left text-[12.5px] text-[#ededeb] hover:bg-white/[0.11] transition-colors cursor-pointer"
            >
              <Pencil className="w-[14px] h-[14px] text-[#c4c4c0] shrink-0" strokeWidth={1.8} />
              <span>Ubah</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => chooseContextAction('restock')}
              className="w-full px-[12px] py-[7px] flex items-center gap-[10px] text-left text-[12.5px] text-[#ededeb] hover:bg-white/[0.11] transition-colors cursor-pointer"
            >
              <PackagePlus className="w-[14px] h-[14px] text-[#c4c4c0] shrink-0" strokeWidth={1.8} />
              <span>Tambah stok</span>
            </button>
            <div className="my-[4px] border-t border-white/[0.09]" />
            <button
              type="button"
              role="menuitem"
              onClick={() => chooseContextAction('delete')}
              className="w-full px-[12px] py-[7px] flex items-center gap-[10px] text-left text-[12.5px] text-[#ededeb] hover:bg-white/[0.11] transition-colors cursor-pointer"
            >
              <Trash2 className="w-[14px] h-[14px] text-[#c4c4c0] shrink-0" strokeWidth={1.8} />
              <span>Hapus</span>
            </button>
          </div>
        </>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-filter-fade"
          onClick={closeProductActions}
        >
          <div
            className="w-full max-w-[440px] bg-[#181817] border border-white/[0.12] rounded-[22px] p-[22px] shadow-2xl animate-modal-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-[16px]">
              <div className="min-w-0">
                <span className="text-[11.5px] font-medium text-[#848480] tabular-nums">
                  ID {selectedItem.id}
                </span>
                <h2 className="text-[17px] font-semibold text-[#f3f3f1] tracking-[-0.02em] leading-[1.3] mt-0.5 truncate">
                  {selectedItem.name}
                </h2>
                <div className="text-[12px] text-[#8e8e8a] mt-1 tabular-nums">
                  {formatRupiah(selectedItem.sellPrice)} · Stok {selectedItem.stock}
                </div>
              </div>
              <button
                type="button"
                onClick={closeProductActions}
                aria-label="Tutup dialog"
                className="w-[32px] h-[32px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] text-[#b4b4b0] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-[15px] h-[15px]" />
              </button>
            </div>

            {actionMode === 'edit' && (
              <form onSubmit={handleSaveEdit} className="space-y-[14px]">
                <div>
                  <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                    Nama produk
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] focus:outline-none focus:border-white/[0.28]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                      Harga jual (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={editSellPrice}
                      onChange={(e) => setEditSellPrice(e.target.value)}
                      className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] tabular-nums focus:outline-none focus:border-white/[0.28]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                      Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] tabular-nums focus:outline-none focus:border-white/[0.28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                    Harga modal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] tabular-nums focus:outline-none focus:border-white/[0.28]"
                  />
                </div>

                {actionError && (
                  <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-[12px] py-[8px] text-[12px] text-[#f2f2f0]">
                    {actionError}
                  </div>
                )}

                <div className="pt-[6px] flex items-center justify-end gap-[10px]">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeProductActions}
                    className="h-[40px] px-[18px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[40px] px-[20px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-40 text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan perubahan'}
                  </button>
                </div>
              </form>
            )}

            {actionMode === 'restock' && (
              <form onSubmit={handleConfirmRestock} className="space-y-[14px]">
                <div className="rounded-[14px] bg-[#1e1e1c] border border-white/[0.08] px-[14px] py-[12px] flex items-center justify-between">
                  <span className="text-[12px] text-[#9e9e9a]">Stok saat ini</span>
                  <span className="text-[15px] font-semibold text-[#f3f3f1] tabular-nums">
                    {selectedItem.stock}
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#b4b4b0] mb-[6px]">
                    Jumlah tambahan stok
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    placeholder="Masukkan jumlah"
                    autoFocus
                    className="w-full h-[40px] rounded-[12px] bg-[#1e1e1c] border border-white/[0.1] px-[13px] text-[13px] text-[#f2f2f0] placeholder-[#686864] tabular-nums focus:outline-none focus:border-white/[0.28]"
                  />
                  <div className="flex flex-wrap items-center gap-[8px] mt-[10px]">
                    {[5, 10, 25, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setRestockAmount((prev) => String((Number(prev) || 0) + preset))
                        }
                        className="h-[30px] px-[12px] rounded-full bg-[#242422] hover:bg-[#2f2f2c] border border-white/[0.08] text-[12px] font-medium text-[#e5e5e2] tabular-nums transition-colors cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {Number(restockAmount) > 0 && Number.isInteger(Number(restockAmount)) && (
                  <div className="rounded-[12px] border border-dashed border-white/[0.14] px-[14px] py-[10px] flex items-center justify-between text-[12.5px]">
                    <span className="text-[#9e9e9a]">Stok setelah ditambah</span>
                    <span className="font-semibold text-[#f3f3f1] tabular-nums">
                      {selectedItem.stock + Number(restockAmount)}
                    </span>
                  </div>
                )}

                {actionError && (
                  <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-[12px] py-[8px] text-[12px] text-[#f2f2f0]">
                    {actionError}
                  </div>
                )}

                <div className="pt-[6px] flex items-center justify-end gap-[10px]">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeProductActions}
                    className="h-[40px] px-[18px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-[40px] px-[20px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-40 text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Tambah stok'}
                  </button>
                </div>
              </form>
            )}

            {actionMode === 'delete' && (
              <div className="space-y-[16px]">
                <div className="rounded-[14px] bg-[#1e1e1c] border border-white/[0.08] p-[14px] text-[13px] text-[#d4d4d0] leading-[1.5]">
                  Apakah Anda yakin ingin menghapus produk{' '}
                  <span className="font-semibold text-[#f3f3f1]">{selectedItem.name}</span>?
                  Tindakan ini akan menghapus produk dari daftar stok saat ini.
                </div>

                {actionError && (
                  <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-[12px] py-[8px] text-[12px] text-[#f2f2f0]">
                    {actionError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-[10px]">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeProductActions}
                    className="h-[40px] px-[18px] rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#e5e5e2] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmDelete}
                    className="h-[40px] px-[20px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-40 text-[#141414] text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Menghapus...' : 'Hapus produk'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
