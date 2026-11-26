import React, { useState } from 'react';
import { ArrowRight, Check, LogOut } from 'lucide-react';
import type { StoreProfile } from '../types/pos';
import { createStoreApi } from '../lib/posApi';
import { AnimatedTitle } from './AnimatedTitle';

interface StoreSetupViewProps {
  userEmail: string;
  onStoreCreated: (store: StoreProfile) => void;
  onLogout: () => void;
}

export const StoreSetupView: React.FC<StoreSetupViewProps> = ({
  userEmail,
  onStoreCreated,
  onLogout,
}) => {
  const [storeName, setStoreName] = useState('');
  const [seedSampleData, setSeedSampleData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = storeName.trim();
    if (!trimmed) {
      setError('Nama toko wajib diisi.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const { store } = await createStoreApi({
        storeName: trimmed,
        seedSampleData,
      });
      onStoreCreated(store);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal membuat toko baru.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8">
      <header className="w-full max-w-[960px] mx-auto flex items-center justify-between gap-6 animate-tab-up">
        <div className="flex items-center gap-[13px] shrink-0">
          <div className="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            <img
              src="/logo.svg"
              alt="Logo Orpheus"
              className="w-[27px] h-[27px] object-contain brightness-0"
            />
          </div>
          <span className="text-[16px] font-semibold text-[#f3f3f1] tracking-[-0.015em] whitespace-nowrap shrink-0">
            Orpheus
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="h-[38px] px-4 rounded-full bg-[#1e1e1c] hover:bg-[#282825] border border-white/[0.08] text-[12px] font-medium text-[#d4d4d0] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <LogOut className="w-[13.5px] h-[13.5px]" strokeWidth={1.9} />
          <span>Keluar</span>
        </button>
      </header>

      <main className="w-full max-w-[520px] mx-auto my-auto py-10">
        <div className="mb-6">
          <p className="text-[12px] text-[#888884] mb-2 animate-tab-up">
            Akun aktif · {userEmail}
          </p>
          <AnimatedTitle
            text="Buat Toko"
            className="text-[38px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.06]"
          />
          <p
            className="mt-3 text-[13.5px] text-[#9a9a96] leading-[1.6] animate-tab-up"
            style={{ animationDelay: '140ms' }}
          >
            Tentukan nama toko Anda untuk menyiapkan katalog produk, kasir, dan
            pencatatan transaksi.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#171716] border border-white/[0.08] rounded-[24px] p-6 sm:p-7 space-y-5 animate-tab-up"
          style={{ animationDelay: '180ms' }}
        >
          <div>
            <label
              htmlFor="setup-store-name"
              className="block text-[12.5px] font-medium text-[#c4c4c0] mb-2"
            >
              Nama toko
            </label>
            <input
              id="setup-store-name"
              type="text"
              maxLength={40}
              autoFocus
              disabled={isSubmitting}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Orpheus Shop"
              className="w-full h-[44px] rounded-[12px] bg-[#111110] border border-white/[0.1] px-4 text-[13.5px] text-[#f3f3f1] placeholder-[#646460] focus:outline-none focus:border-white/[0.3] transition-colors disabled:opacity-60"
            />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setSeedSampleData((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 pt-1 text-left cursor-pointer group"
          >
            <span className="text-[12.5px] text-[#9e9e9a] group-hover:text-[#dcdcd8] transition-colors">
              Mulai dengan katalog produk & transaksi contoh
            </span>
            <span
              className={`w-[19px] h-[19px] rounded-[6px] border flex items-center justify-center transition-colors shrink-0 ${
                seedSampleData
                  ? 'bg-[#ededeb] border-[#ededeb] text-[#141414]'
                  : 'bg-[#111110] border-white/[0.18] text-transparent'
              }`}
            >
              <Check className="w-[12.5px] h-[12.5px]" strokeWidth={2.6} />
            </span>
          </button>

          {error && (
            <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-3 py-2 text-[12px] text-[#f2f2f0]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[46px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-45 text-[#141414] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{isSubmitting ? 'Menyiapkan Toko...' : 'Buat Toko & Lanjutkan'}</span>
            {!isSubmitting && <ArrowRight className="w-[15px] h-[15px]" strokeWidth={2.2} />}
          </button>
        </form>
      </main>

      <footer className="w-full max-w-[960px] mx-auto text-[11.5px] text-[#787874]">
        Orpheus Point of Sales
      </footer>
    </div>
  );
};
