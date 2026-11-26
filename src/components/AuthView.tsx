import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import type { AuthResponse } from '../types/pos';
import { loginApi, registerApi } from '../lib/posApi';
import { AnimatedTitle } from './AnimatedTitle';

type AuthMode = 'login' | 'register';

interface AuthViewProps {
  onAuthSuccess: (response: AuthResponse) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [seedSampleData, setSeedSampleData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (nextMode: AuthMode) => {
    if (isSubmitting) return;
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Email wajib diisi.');
      return;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Kata sandi minimal 6 karakter.');
        return;
      }
      if (!storeName.trim()) {
        setError('Nama toko wajib diisi untuk mendaftarkan toko baru.');
        return;
      }
    }

    setError('');
    setNotice('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await registerApi({
          email: cleanEmail,
          password,
          storeName: storeName.trim(),
          seedSampleData,
        });

        if (res.requiresEmailConfirmation || !res.accessToken) {
          setNotice(
            res.message ||
              'Pendaftaran berhasil. Silakan konfirmasi email Anda terlebih dahulu lalu masuk.'
          );
          setMode('login');
          setPassword('');
          return;
        }

        onAuthSuccess(res);
      } else {
        const res = await loginApi({
          email: cleanEmail,
          password,
        });
        onAuthSuccess(res);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Autentikasi gagal. Silakan periksa data Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#111110] text-[#f2f2f0] flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8">
      {/* Top Brand Header */}
      <header className="w-full max-w-[1160px] mx-auto flex items-center justify-between gap-8 animate-tab-up">
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

        <div className="text-[12px] text-[#888884] whitespace-nowrap shrink-0">
          Sistem Point of Sales
        </div>
      </header>

      {/* Main Split Workspace */}
      <main className="w-full max-w-[1160px] mx-auto my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left: Editorial Brand Overview */}
        <section className="lg:col-span-6 space-y-8">
          <div>
            <p className="text-[12.5px] text-[#8e8e8a] mb-3 animate-tab-up">
              Orpheus POS · Manajemen Toko Terpadu
            </p>
            <AnimatedTitle
              text={mode === 'login' ? 'Masuk ke Toko' : 'Mulai Toko Baru'}
              className="text-[36px] sm:text-[44px] font-semibold text-[#f3f3f1] tracking-[-0.03em] leading-[1.08]"
            />
            <p
              className="mt-4 text-[14.5px] text-[#9e9e9a] leading-[1.65] max-w-[460px] animate-tab-up"
              style={{ animationDelay: '160ms' }}
            >
              Kelola kasir, inventaris produk, riwayat transaksi, dan ringkasan
              pendapatan dalam satu ruang kerja monokrom yang cepat dan aman.
            </p>
          </div>

          <div
            className="border-t border-dashed border-white/[0.12] pt-6 space-y-5 max-w-[460px] animate-tab-up"
            style={{ animationDelay: '240ms' }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-[#e5e5e2]">
                Kasir & Pembayaran
              </span>
              <span className="text-[12px] text-[#848480] text-right">
                QRIS · Kartu · Tunai
              </span>
            </div>
            <div className="border-t border-white/[0.06] pt-4 flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-[#e5e5e2]">
                Kontrol Inventaris
              </span>
              <span className="text-[12px] text-[#848480] text-right">
                Stok Real-Time · Margin · Restok
              </span>
            </div>
            <div className="border-t border-white/[0.06] pt-4 flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-[#e5e5e2]">
                Isolasi Data Toko
              </span>
              <span className="text-[12px] text-[#848480] text-right">
                Terhubung Akun Pemilik
              </span>
            </div>
          </div>
        </section>

        {/* Right: Auth Card */}
        <section
          className="lg:col-span-6 w-full max-w-[460px] lg:ml-auto animate-tab-up"
          style={{ animationDelay: '140ms' }}
        >
          <div className="bg-[#171716] border border-white/[0.08] rounded-[24px] p-6 sm:p-7">
            {/* Segmented Mode Switch: Masuk | Daftar */}
            <div className="grid grid-cols-2 bg-[#21211f] border border-white/[0.05] rounded-full p-[3px] gap-[3px] mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`h-[36px] rounded-full text-[12.5px] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === 'login'
                    ? 'bg-[#ededeb] text-[#141414] font-semibold shadow-sm'
                    : 'text-[#9a9a96] hover:text-[#e5e5e2] font-medium'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`h-[36px] rounded-full text-[12.5px] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === 'register'
                    ? 'bg-[#ededeb] text-[#141414] font-semibold shadow-sm'
                    : 'text-[#9a9a96] hover:text-[#e5e5e2] font-medium'
                }`}
              >
                Daftar & Buat Toko
              </button>
            </div>

            {notice && (
              <div className="mb-4 rounded-[12px] bg-[#222220] border border-white/[0.14] px-3.5 py-2.5 text-[12.5px] text-[#ededeb] leading-[1.5]">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-store-name"
                    className="block text-[12px] font-medium text-[#b4b4b0] mb-1.5"
                  >
                    Nama toko
                  </label>
                  <input
                    id="auth-store-name"
                    type="text"
                    maxLength={40}
                    disabled={isSubmitting}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Orpheus Shop"
                    className="w-full h-[42px] rounded-[12px] bg-[#111110] border border-white/[0.1] px-3.5 text-[13px] text-[#f3f3f1] placeholder-[#646460] focus:outline-none focus:border-white/[0.3] transition-colors disabled:opacity-60"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-[12px] font-medium text-[#b4b4b0] mb-1.5"
                >
                  Email pemilik
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@toko.com"
                  className="w-full h-[42px] rounded-[12px] bg-[#111110] border border-white/[0.1] px-3.5 text-[13px] text-[#f3f3f1] placeholder-[#646460] focus:outline-none focus:border-white/[0.3] transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-[12px] font-medium text-[#b4b4b0] mb-1.5"
                >
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'}
                    className="w-full h-[42px] rounded-[12px] bg-[#111110] border border-white/[0.1] pl-3.5 pr-11 text-[13px] text-[#f3f3f1] placeholder-[#646460] focus:outline-none focus:border-white/[0.3] transition-colors disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[#848480] hover:text-[#f2f2f0] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[15px] h-[15px]" />
                    ) : (
                      <Eye className="w-[15px] h-[15px]" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSeedSampleData((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-3 pt-1 text-left cursor-pointer group"
                >
                  <span className="text-[12px] text-[#9e9e9a] group-hover:text-[#dcdcd8] transition-colors">
                    Sertakan katalog & transaksi contoh
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
              )}

              {error && (
                <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.12] px-3 py-2 text-[12px] text-[#f2f2f0]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full h-[46px] rounded-full bg-[#ededeb] hover:bg-white disabled:opacity-45 text-[#141414] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {isSubmitting
                    ? 'Memproses...'
                    : mode === 'login'
                    ? 'Masuk ke Kasir'
                    : 'Daftar & Buat Toko'}
                </span>
                {!isSubmitting && <ArrowRight className="w-[15px] h-[15px]" strokeWidth={2.2} />}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-[1160px] mx-auto flex items-center justify-between text-[11.5px] text-[#787874] animate-tab-up">
        <span>Orpheus Point of Sales</span>
        <span>Akses Toko Terproteksi</span>
      </footer>
    </div>
  );
};
