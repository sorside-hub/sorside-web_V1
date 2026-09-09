import React, { useState } from 'react';
import { Radio, Key, UserPlus, Eye, ArrowRight, X, AlertCircle } from 'lucide-react';
import { recoverIdentityFromFirestore, registerNewIdentityInFirestore, UserIdentity, generatePermanentId, generatePasskey } from '../../../services/frequencyService';

interface IdentityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (identity: UserIdentity) => void;
  onContinueAsGuest?: () => void;
  actionReason?: string; // e.g. 'untuk membuat cerita baru' atau 'untuk membalas cerita'
}

export const IdentityGateModal: React.FC<IdentityGateModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  onContinueAsGuest,
  actionReason = 'untuk berinteraksi di gelombang Frequency'
}) => {
  const [view, setView] = useState<'choice' | 'register' | 'recover'>('choice');
  const [aliasInput, setAliasInput] = useState('');
  const [recoverKeyInput, setRecoverKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setView('choice');
    setErrorMsg(null);
    onClose();
  };

  const handleCreateNewIdentity = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const newId = generatePermanentId();
      const newPasskey = generatePasskey();
      const cleanAlias = aliasInput.trim();

      const identity = await registerNewIdentityInFirestore(newId, newPasskey, cleanAlias || undefined);
      
      // Simpan ke localStorage
      localStorage.setItem('sorside_freq_id', identity.id);
      localStorage.setItem('sorside_freq_key', identity.key);
      if (cleanAlias) {
        localStorage.setItem('sorside_freq_alias', cleanAlias);
      }
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      localStorage.setItem('sorside_freq_created', formattedDate);

      onRegistered(identity);
      handleClose();
    } catch (err) {
      setErrorMsg('Gagal membuat frekuensi baru. Coba lagi beberapa saat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = recoverKeyInput.trim();
    if (!cleanKey) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const recovered = await recoverIdentityFromFirestore(cleanKey);
      if (!recovered) {
        setErrorMsg('Kunci pemulihan tidak ditemukan. Pastikan format passkey benar (contoh: pass-12345).');
        setIsLoading(false);
        return;
      }

      // Simpan ke localStorage
      localStorage.setItem('sorside_freq_id', recovered.id);
      localStorage.setItem('sorside_freq_key', recovered.key);
      if (recovered.alias) {
        localStorage.setItem('sorside_freq_alias', recovered.alias);
      } else {
        localStorage.removeItem('sorside_freq_alias');
      }

      if (recovered.createdAt) {
        const d = new Date(recovered.createdAt);
        const formatted = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
        localStorage.setItem('sorside_freq_created', formatted);
      }

      onRegistered(recovered);
      handleClose();
    } catch (err) {
      setErrorMsg('Gagal memulihkan akun. Periksa koneksi internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-surface border border-border flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary">
            <Radio size={15} className="text-accent" />
            <span>Akses Frekuensi</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5 space-y-5">
          {view === 'choice' && (
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="font-display text-base uppercase tracking-wider text-text-primary">
                  Identitas Frekuensi
                </h3>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  Kamu saat ini berada dalam mode tamu. Buat identitas anonim atau pulihkan akun lamamu {actionReason}.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* PILIHAN 1: DAFTAR / BUAT IDENTITAS BARU */}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="w-full p-3.5 border border-border/80 hover:border-accent bg-background hover:bg-surface/80 flex items-center justify-between text-left group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-border bg-surface text-text-secondary group-hover:text-accent group-hover:border-accent transition-colors">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary group-hover:text-accent font-mono uppercase tracking-wider transition-colors">
                        Buat Identitas Baru
                      </div>
                      <div className="text-[11px] text-text-secondary/70 font-sans mt-0.5">
                        Dapatkan ID permanen, passkey, dan mulai tanggal bergabung
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-text-secondary/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* PILIHAN 2: PULIHKAN DENGAN PASSKEY */}
                <button
                  type="button"
                  onClick={() => setView('recover')}
                  className="w-full p-3.5 border border-border/80 hover:border-accent bg-background hover:bg-surface/80 flex items-center justify-between text-left group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-border bg-surface text-text-secondary group-hover:text-accent group-hover:border-accent transition-colors">
                      <Key size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary group-hover:text-accent font-mono uppercase tracking-wider transition-colors">
                        Pulihkan Akun Lama
                      </div>
                      <div className="text-[11px] text-text-secondary/70 font-sans mt-0.5">
                        Masukkan passkey rahasiamu untuk mengembalikan identitas
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-text-secondary/50 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* PILIHAN 3: TETAP SEBAGAI TAMU */}
                <button
                  type="button"
                  onClick={() => {
                    onContinueAsGuest?.();
                    handleClose();
                  }}
                  className="w-full p-3 border border-border/50 hover:border-border text-center text-text-secondary hover:text-text-primary font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Lanjut Membaca Sebagai Tamu
                </button>
              </div>
            </div>
          )}

          {view === 'register' && (
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="font-display text-base uppercase tracking-wider text-text-primary">
                  Inisiasi Identitas
                </h3>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  Sistem akan membuatkan ID permanen acak dan kunci pemulihan unik. Kamu juga dapat menentukan nama alias tampilan sekarang atau nanti.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase text-text-secondary">
                  Nama Alias (Opsional):
                </label>
                <input
                  type="text"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Contoh: Senja, Klandestin, dll."
                  maxLength={24}
                  className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
                />
                <p className="font-mono text-[10px] text-text-secondary/60">
                  Bisa dikosongkan. Jika kosong, nama publikmu akan menggunakan format ID acak.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView('choice')}
                  className="flex-1 py-2.5 border border-border hover:border-text-primary text-text-secondary hover:text-text-primary font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCreateNewIdentity}
                  className="flex-1 py-2.5 bg-text-primary hover:bg-accent text-background font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Memproses...' : 'Aktifkan ID'}
                </button>
              </div>
            </div>
          )}

          {view === 'recover' && (
            <form onSubmit={handleRecoverIdentity} className="space-y-4">
              <div className="space-y-1 text-left">
                <h3 className="font-display text-base uppercase tracking-wider text-text-primary">
                  Pulihkan Identitas
                </h3>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  Masukkan passkey rahasiamu untuk mengembalikan arsip dan reputasi frekuensi lamamu.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-mono text-xs uppercase text-text-secondary">
                  Kunci Pemulihan (Passkey):
                </label>
                <input
                  type="text"
                  value={recoverKeyInput}
                  onChange={(e) => setRecoverKeyInput(e.target.value)}
                  placeholder="pass-xxxxx"
                  required
                  className="w-full bg-background border border-border px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView('choice')}
                  className="flex-1 py-2.5 border border-border hover:border-text-primary text-text-secondary hover:text-text-primary font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !recoverKeyInput.trim()}
                  className="flex-1 py-2.5 bg-text-primary hover:bg-accent text-background font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Memulihkan...' : 'Verifikasi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
