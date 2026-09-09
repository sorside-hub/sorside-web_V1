import React, { useState, useEffect } from 'react';
import { X, Key, Copy, Check, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { recoverIdentityFromFirestore, UserIdentity } from '../../../services/frequencyService';

interface IdentityRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  myId: string;
  myPasskey: string;
  myAlias?: string;
  onIdentityRecovered: (recovered: UserIdentity) => void;
  isGuest?: boolean;
}

export const IdentityRecoveryModal: React.FC<IdentityRecoveryModalProps> = ({
  isOpen,
  onClose,
  myId,
  myPasskey,
  myAlias,
  onIdentityRecovered,
  isGuest = false,
}) => {
  const [activeTab, setActiveTab] = useState<'myKey' | 'recover'>(() => (isGuest ? 'recover' : 'myKey'));
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) {
      setActiveTab('recover');
    }
  }, [isGuest, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!myPasskey) return;
    navigator.clipboard.writeText(myPasskey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await recoverIdentityFromFirestore(cleanKey);
      if (!result) {
        setErrorMsg('Kunci pemulihan tidak ditemukan. Pastikan format sudah benar (contoh: pass-12345).');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Identitas ${result.id} berhasil dipulihkan!`);
      onIdentityRecovered(result);
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg('Gagal memulihkan identitas. Periksa koneksi internet Anda.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-background border border-border flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary">
            <Key size={15} className="text-accent" />
            <span>{isGuest ? 'Pulihkan Akun' : 'Kunci & Pemulihan Akun'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* TAB TOGGLE (Hanya tampil untuk non-guest) */}
        {!isGuest && (
          <div className="grid grid-cols-2 border-b border-border font-mono text-xs text-center bg-surface/20">
            <button
              type="button"
              onClick={() => {
                setActiveTab('myKey');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] uppercase tracking-wider ${
                activeTab === 'myKey'
                  ? 'border-accent text-accent font-bold bg-surface/40'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Kunci Saya
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('recover');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 transition-colors border-b-2 -mb-[1px] uppercase tracking-wider ${
                activeTab === 'recover'
                  ? 'border-accent text-accent font-bold bg-surface/40'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Pulihkan Akun
            </button>
          </div>
        )}

        {/* CONTENT */}
        <div className="p-5 space-y-4">
          {activeTab === 'myKey' ? (
            /* TAB 1: KUNCI SAYA */
            <div className="space-y-4">
              <div className="p-4 border border-border bg-surface/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>ID PUBLIK:</span>
                  <span className="font-bold text-text-primary">{myId}</span>
                </div>

                {myAlias && (
                  <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                    <span>NAMA ALIAS:</span>
                    <span className="font-semibold text-text-primary">{myAlias}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary mb-1.5">
                    <span>KUNCI RAHASIA (PASSKEY):</span>
                    <span className="text-[10px] text-accent uppercase font-bold">// JANGAN SEBARKAN</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 bg-background border border-border font-mono text-sm tracking-wider font-bold text-text-primary select-all text-center">
                      {myPasskey || 'pass-00000'}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`px-3 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-text-primary text-background hover:bg-accent'
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-border/60 bg-surface/20 space-y-1.5 text-text-secondary font-sans text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-primary font-semibold">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Cara Kerja Pemulihan</span>
                </div>
                <p>
                  Frequency bersifat 100% anonim tanpa email. Kunci ini adalah satu-satunya cara untuk memulihkan ID dan semua cerita Anda jika Anda berganti perangkat, membuka browser lain, atau menghapus data riwayat browser.
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: FORM PULIHKAN AKUN */
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block font-mono text-xs text-text-secondary uppercase tracking-wider">
                  Masukkan Kunci Rahasia (Passkey):
                </label>
                <input
                  type="text"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Contoh: pass-84920 atau 84920"
                  className="w-full bg-surface border border-border p-3 font-mono text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
                />
              </div>

              {errorMsg && (
                <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <Check size={14} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !inputKey.trim()}
                className="w-full py-2.5 bg-text-primary text-background hover:bg-accent font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Memverifikasi Identitas...</span>
                  </>
                ) : (
                  <>
                    <span>Pulihkan Identitas</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              <p className="font-mono text-[11px] text-text-secondary/70 text-center leading-relaxed">
                ID dan arsip cerita yang terhubung dengan kunci tersebut akan langsung aktif di browser ini.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
