import React, { useCallback, useEffect, useState } from 'react';
import {
  PERIOD_DATA,
  PeriodFilter,
  RevenueRange,
  NavTab,
} from './data/dashboardData';
import type {
  AuthResponse,
  AuthUser,
  DashboardDataset,
  NotificationItem,
  PosProduct,
  StoreProfile,
  TransactionRecord,
} from './types/pos';
import {
  fetchBootstrap,
  fetchDashboard,
  logoutApi,
  saveStoreNameApi,
} from './lib/posApi';
import { SidebarNav } from './components/SidebarNav';
import { TopSectionBar } from './components/TopSectionBar';
import { KpiCards } from './components/KpiCards';
import { RevenueChartCard } from './components/RevenueChartCard';
import { VisitsByTimeCard } from './components/VisitsByTimeCard';
import { TotalVisitsCard } from './components/TotalVisitsCard';
import { KasirView } from './components/KasirView';
import { ProdukView } from './components/ProdukView';
import { TransaksiView } from './components/TransaksiView';
import { PengaturanView } from './components/PengaturanView';
import { AnimatedTitle } from './components/AnimatedTitle';
import { AuthView } from './components/AuthView';
import { StoreSetupView } from './components/StoreSetupView';

const PERIOD_FILTERS: PeriodFilter[] = ['Hari Ini', '7 Hari', '30 Hari'];

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeStore, setActiveStore] = useState<StoreProfile | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('Dasbor');
  const [period, setPeriod] = useState<PeriodFilter>('Hari Ini');
  const [revenueRange, setRevenueRange] = useState<RevenueRange>('7 Hari');
  const [storeName, setStoreName] = useState<string>('Orpheus Shop');
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardDataset | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const syncBootstrap = useCallback(async () => {
    if (!authUser || !activeStore) return;
    try {
      const data = await fetchBootstrap();
      setStoreName(data.storeName);
      setProducts(data.products);
      setTransactions(data.transactions);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Gagal memuat data awal POS:', error);
    }
  }, [authUser, activeStore]);

  useEffect(() => {
    if (authUser && activeStore) {
      void syncBootstrap();
    }
  }, [authUser, activeStore, syncBootstrap]);

  useEffect(() => {
    if (!authUser || !activeStore) return;
    let cancelled = false;
    fetchDashboard(period, revenueRange)
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data);
        }
      })
      .catch((error) => {
        console.error('Gagal memuat analitik dasbor:', error);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser, activeStore, period, revenueRange, refreshTick]);

  const handleAuthSuccess = (res: AuthResponse) => {
    if (!res.user || !res.accessToken) return;
    setAuthUser(res.user);
    setActiveStore(res.store);
    if (res.store) {
      setStoreName(res.store.storeName);
    }
    setActiveTab('Dasbor');
  };

  const handleStoreCreated = (store: StoreProfile) => {
    setActiveStore(store);
    setStoreName(store.storeName);
    setActiveTab('Dasbor');
  };

  const handleLogout = async () => {
    await logoutApi();
    setAuthUser(null);
    setActiveStore(null);
    setProducts([]);
    setTransactions([]);
    setNotifications([]);
    setDashboardData(null);
    setActiveTab('Dasbor');
  };

  const refreshLiveAggregates = useCallback(() => {
    setRefreshTick((prev) => prev + 1);
    void syncBootstrap();
  }, [syncBootstrap]);

  const handleSaveStoreName = async (nextName: string) => {
    const trimmed = nextName.trim();
    if (!trimmed) return;
    const res = await saveStoreNameApi(trimmed);
    setStoreName(res.storeName);
    setActiveStore((prev) =>
      prev ? { ...prev, storeName: res.storeName } : prev
    );
  };

  const handleProductCreated = (product: PosProduct) => {
    setProducts((prev) => [...prev, product]);
    refreshLiveAggregates();
  };

  const handleProductUpdated = (updated: PosProduct) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    refreshLiveAggregates();
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== deletedId));
    refreshLiveAggregates();
  };

  const handleCheckoutSuccess = (result: {
    transaction: TransactionRecord;
    products: PosProduct[];
  }) => {
    setProducts(result.products);
    setTransactions((prev) => [result.transaction, ...prev]);
    refreshLiveAggregates();
  };

  const handleTransactionReturned = (result: {
    transaction: TransactionRecord;
    products: PosProduct[];
  }) => {
    setProducts(result.products);
    setTransactions((prev) =>
      prev.map((trx) =>
        trx.id === result.transaction.id ? result.transaction : trx
      )
    );
    refreshLiveAggregates();
  };

  const handlePeriodChange = (next: PeriodFilter) => {
    setPeriod(next);
    if (next === '7 Hari' || next === '30 Hari') {
      setRevenueRange(next);
    }
  };

  if (!authUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  if (!activeStore) {
    return (
      <StoreSetupView
        userEmail={authUser.email}
        onStoreCreated={handleStoreCreated}
        onLogout={handleLogout}
      />
    );
  }

  const fallbackDataset = PERIOD_DATA[period];
  const kpis = dashboardData?.kpis ?? fallbackDataset.kpis;
  const heatmap = dashboardData?.heatmap ?? fallbackDataset.heatmap;
  const totalTransactions =
    dashboardData?.totalTransactions ?? fallbackDataset.totalTransactions;

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] overflow-x-clip">
      <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Monochrome Floating Top Pill matching center container width */}
      <TopSectionBar
        storeName={storeName}
        userEmail={authUser.email}
        notifications={notifications}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Shell with equal 28px clearance from left navbar (88px) and right edge */}
      <div className="relative w-full pl-[88px] sm:pl-[116px] pr-[16px] sm:pr-[28px] pt-[102px] pb-[20px]">
        <div key={activeTab}>
          {activeTab === 'Dasbor' ? (
            <main>
              {/* Title Row */}
              <div className="flex items-center justify-between">
                <AnimatedTitle text="Dasbor" />
              </div>

              {/* Sub-navigation & Action Toolbar */}
              <div
                className="flex items-center justify-between gap-3 mt-[14px] animate-tab-up"
                style={{ animationDelay: '80ms' }}
              >
                {/* Period Filter Segmented Pill: Hari Ini | 7 Hari | 30 Hari */}
                <div className="inline-flex items-center bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[2px] shrink-0">
                  {PERIOD_FILTERS.map((item) => {
                    const isActive = period === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePeriodChange(item)}
                        className={`px-[15px] py-[5.5px] rounded-full text-[12px] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-[#545452] text-[#f3f3f1] font-medium shadow-sm'
                            : 'text-[#9a9a96] hover:text-[#dcdcd8] font-normal'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 1: 4 Stepped-Tone KPI Cards */}
              <div key={`kpi-${period}`} className="mt-[14px]">
                <KpiCards data={kpis} onNavigate={setActiveTab} />
              </div>

              {/* Row 2: Full-width Revenue Bar Chart (7 Hari / 30 Hari) */}
              <div
                key={`revenue-${period}`}
                className="mt-[14px] h-[288px] animate-tab-up"
                style={{ animationDelay: '400ms' }}
              >
                <RevenueChartCard
                  range={revenueRange}
                  onRangeChange={setRevenueRange}
                  series={dashboardData?.revenueSeries}
                />
              </div>

              {/* Row 3: Transactions by Time Heatmap & Total Transactions Donut */}
              <div
                key={`charts-${period}`}
                className="grid grid-cols-12 gap-[14px] mt-[14px]"
              >
                <div
                  className="col-span-12 lg:col-span-7 h-[228px] animate-tab-up"
                  style={{ animationDelay: '490ms' }}
                >
                  <VisitsByTimeCard data={heatmap} />
                </div>
                <div
                  className="col-span-12 lg:col-span-5 h-[228px] animate-tab-up"
                  style={{ animationDelay: '580ms' }}
                >
                  <TotalVisitsCard data={totalTransactions} />
                </div>
              </div>
            </main>
          ) : activeTab === 'Kasir' ? (
            <KasirView
              products={products}
              onCheckoutSuccess={handleCheckoutSuccess}
            />
          ) : activeTab === 'Produk' ? (
            <ProdukView
              products={products}
              onProductCreated={handleProductCreated}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
            />
          ) : activeTab === 'Transaksi' ? (
            <TransaksiView
              storeName={storeName}
              transactions={transactions}
              onTransactionReturned={handleTransactionReturned}
            />
          ) : (
            <PengaturanView
              storeName={storeName}
              onSaveStoreName={handleSaveStoreName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
