import React from 'react';
import { NavTab } from '../data/dashboardData';

interface SecondaryViewProps {
  tab: Exclude<NavTab, 'Dasbor'>;
  onBackToDashboard: () => void;
}

const VIEW_CONTENT: Record<
  Exclude<NavTab, 'Dasbor'>,
  { subtitle: string; rows: { col1: string; col2: string; col3: string; badge: string }[] }
> = {
  Kasir: {
    subtitle: 'Terminal Point of Sales Orpheus aktif untuk transaksi langsung di meja kasir.',
    rows: [
      { col1: 'Struk Aktif #POS-108', col2: '3 item • Pelanggan Umum', col3: 'Rp3.720.000', badge: 'Siap bayar' },
      { col1: 'Braket Orpheus Kokoh — Hitam Doff', col2: 'SKU-1042 • 2 unit', col3: 'Rp510.000', badge: 'Dipindai' },
      { col1: 'Pin Rak Kuningan Giling (Isi 20)', col2: 'SKU-2088 • 4 pak', col3: 'Rp1.800.000', badge: 'Dipindai' },
      { col1: 'Transaksi #4893 — Harbor Millwork', col2: 'Kasir 1 • Pembayaran QRIS lunas', col3: 'Rp10.200.000', badge: 'Selesai' },
    ],
  },
  Produk: {
    subtitle: '3.842 unit terjual sepanjang bulan ini pada katalog perangkat keras Orpheus.',
    rows: [
      { col1: 'Braket Orpheus Kokoh — Hitam Doff', col2: 'SKU-1042 • 842 terjual', col3: 'Rp214.710.000', badge: 'Stok tersedia' },
      { col1: 'Pin Rak Kuningan Giling (Isi 20)', col2: 'SKU-2088 • 1.120 terjual', col3: 'Rp142.800.000', badge: 'Stok menipis' },
      { col1: 'Gusset Baja Tersembunyi 8"', col2: 'SKU-3115 • 618 terjual', col3: 'Rp166.860.000', badge: 'Stok tersedia' },
      { col1: 'Kit Rel Aluminium Anodized', col2: 'SKU-4010 • 410 terjual', col3: 'Rp110.130.000', badge: 'Stok tersedia' },
    ],
  },
  Transaksi: {
    subtitle: 'Riwayat transaksi terbaru di seluruh terminal kasir Orpheus.',
    rows: [
      { col1: '#4894 — Apex Fabrication', col2: 'Kasir 1 • QRIS • 18 unit', col3: 'Rp32.100.000', badge: 'Lunas' },
      { col1: '#4893 — Harbor Millwork', col2: 'Kasir 2 • Kartu Debit • 6 unit', col3: 'Rp10.200.000', badge: 'Lunas' },
      { col1: '#4892 — Northline Builders', col2: 'Kasir 1 • QRIS • 24 unit', col3: 'Rp51.300.000', badge: 'Lunas' },
      { col1: '#4891 — Studio Kestrel', col2: 'Kasir 3 • Tunai • 4 unit', col3: 'Rp6.150.000', badge: 'Selesai' },
    ],
  },
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
          <h1 className="text-[30px] font-semibold text-[#f3f3f1] tracking-[-0.025em] leading-none">
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
