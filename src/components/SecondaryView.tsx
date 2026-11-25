import React from 'react';
import { NavTab } from '../data/dashboardData';

interface SecondaryViewProps {
  tab: Exclude<NavTab, 'Dasbor' | 'Kasir' | 'Produk' | 'Transaksi'>;
  onBackToDashboard: () => void;
}

const VIEW_CONTENT: Record<
  Exclude<NavTab, 'Dasbor' | 'Kasir' | 'Produk' | 'Transaksi'>,
  { subtitle: string; rows: { col1: string; col2: string; col3: string; badge: string }[] }
> = {
  Analisis: {
    subtitle: 'Rincian lengkap alur transaksi kasir dan performa metode pembayaran November 2026.',
    rows: [
      { col1: 'Pemindaian Barang -> Subtotal Struk', col2: '214.860 struk diproses', col3: '98,4%', badge: '+1,2 poin' },
      { col1: 'Pembayaran QRIS Instan', col2: '162.400 transaksi', col3: '75,6%', badge: '+3,4 poin' },
      { col1: 'Pembayaran Kartu Debit/Kredit', col2: '41.440 transaksi', col3: '19,3%', badge: '+0,6 poin' },
      { col1: 'Pembayaran Tunai di Kasir', col2: '11.020 transaksi', col3: '5,1%', badge: '-0,8 poin' },
    ],
  },
  Pengaturan: {
    subtitle: 'Konfigurasi ruang kerja, mata uang, perangkat kasir, dan preferensi Orpheus.',
    rows: [
      { col1: 'Ruang Kerja Utama', col2: 'Orpheus Point of Sales', col3: 'Aktif', badge: 'Tersinkron' },
      { col1: 'Mata Uang & Format Angka', col2: 'Rupiah (Rp) • Standar pelaporan', col3: 'IDR', badge: 'Default' },
      { col1: 'Terminal Kasir & Struk Termal', col2: '3 perangkat meja kasir terhubung', col3: 'Siap', badge: 'Terhubung' },
      { col1: 'Sinkronisasi Inventaris Otomatis', col2: 'Pembaruan real-time di seluruh terminal kasir', col3: 'Aktif', badge: 'Aktif' },
    ],
  },
};

export const SecondaryView: React.FC<SecondaryViewProps> = ({ tab, onBackToDashboard }) => {
  const content = VIEW_CONTENT[tab];

  return (
    <div className="pt-[4px]">
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <h1 className="text-[40px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.05]">
            {tab}
          </h1>
          <p className="text-[12.5px] text-[#888884] mt-2">{content.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="rounded-full bg-[#ededeb] text-[#141414] px-4 py-2 text-[12px] font-semibold hover:bg-white transition-colors cursor-pointer"
        >
          Kembali ke Dasbor
        </button>
      </div>

      <div className="bg-[#171716] border border-white/[0.06] rounded-[20px] p-5 space-y-2.5">
        {content.rows.map((row) => (
          <div
            key={row.col1}
            className="flex items-center justify-between rounded-[14px] bg-[#21211f] border border-white/[0.04] px-4 py-3.5"
          >
            <div>
              <div className="text-[13.5px] font-medium text-[#f2f2f0]">{row.col1}</div>
              <div className="text-[11.5px] text-[#888884] mt-0.5">{row.col2}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13.5px] font-semibold text-[#f2f2f0] tabular-nums">{row.col3}</span>
              <span className="rounded-full bg-[#2b2b29] px-3 py-1 text-[11px] font-medium text-[#d4d4d0]">
                {row.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
