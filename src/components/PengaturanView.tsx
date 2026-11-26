import React, { useEffect, useState } from 'react';
import { AnimatedTitle } from './AnimatedTitle';

interface PengaturanViewProps {
  storeName: string;
  onSaveStoreName: (nextName: string) => Promise<void>;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  storeName,
  onSaveStoreName,
}) => {
  const [draftName, setDraftName] = useState(storeName);
  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftName(storeName);
  }, [storeName]);

  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 2400);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const trimmed = draftName.trim();
  const isDirty = trimmed !== storeName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!trimmed) {
      setError('Nama toko tidak boleh kosong.');
      setSavedNotice(false);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSaveStoreName(trimmed);
      setDraftName(trimmed);
      setSavedNotice(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan nama toko.'
      );
      setSavedNotice(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftName(storeName);
    setError('');
    setSavedNotice(false);
  };

  return (
    <main>
      <div className="flex items-center justify-between">
        <AnimatedTitle text="Pengaturan" />
      </div>

      <section
        className="mt-[22px] max-w-[560px] animate-tab-up"
        style={{ animationDelay: '120ms' }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-[#171716] border border-white/[0.08] rounded-[22px] p-[24px]"
        >
          <div className="animate-tab-up" style={{ animationDelay: '210ms' }}>
            <label
              htmlFor="store-name-input"
              className="block text-[13px] font-semibold text-[#f3f3f1]"
            >
              Nama toko
            </label>
            <input
              id="store-name-input"
              type="text"
              value={draftName}
              maxLength={40}
              disabled={isSaving}
              onChange={(e) => {
                setDraftName(e.target.value);
                if (error) setError('');
                if (savedNotice) setSavedNotice(false);
              }}
              placeholder="Masukkan nama toko"
              className="mt-[10px] w-full rounded-[14px] bg-[#111110] border border-white/[0.1] px-[15px] py-[11px] text-[13.5px] text-[#f3f3f1] placeholder:text-[#666662] focus:border-white/[0.32] focus:outline-none transition-colors disabled:opacity-60"
            />
            {error && (
              <p className="mt-[8px] text-[12px] text-[#e5e5e1]">{error}</p>
            )}
          </div>

          <div
            className="mt-[20px] pt-[18px] border-t border-dashed border-white/[0.12] flex items-center justify-between gap-3 animate-tab-up"
            style={{ animationDelay: '300ms' }}
          >
            <span className="text-[12px] text-[#9a9a96]">
              {savedNotice && (
                <span className="animate-filter-fade inline-block">
                  Nama toko berhasil diperbarui.
                </span>
              )}
            </span>

            <div className="flex items-center gap-[8px] shrink-0">
              {isDirty && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancel}
                  className="rounded-full bg-[#242422] hover:bg-[#2e2e2b] disabled:opacity-40 text-[#d4d4d0] px-[18px] py-[9px] text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={!isDirty || !trimmed || isSaving}
                className="rounded-full bg-[#ededeb] text-[#141414] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed px-[20px] py-[9px] text-[12.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
};
