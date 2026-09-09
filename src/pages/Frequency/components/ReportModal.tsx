import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface ReportPayload {
  id: string;
  targetType: 'transmission' | 'reply';
  targetId: string;
  transmissionId: string;
  targetAuthorId: string;
  targetAuthorAlias?: string;
  targetContent: string;
  reporterId: string;
  reason: string;
  note?: string;
  createdAt: number;
  status: 'pending' | 'resolved' | 'dismissed';
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'transmission' | 'reply';
  targetId: string;
  transmissionId: string;
  targetAuthorId: string;
  targetAuthorAlias?: string;
  targetContent: string;
  reporterId: string;
  onSubmitReport: (payload: ReportPayload) => Promise<void>;
}

const PRESET_REASONS = [
  'Spam / Iklan / Judi Online',
  'Penyebaran Data Pribadi (Doxxing)',
  'Ujaran Kebencian / Perundungan (Harassment)',
  'Tautan Berbahaya / Phishing',
  'Konten Ilegal / Kekerasan / Pornografi',
  'Lainnya',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  transmissionId,
  targetAuthorId,
  targetAuthorAlias,
  targetContent,
  reporterId,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    const payload: ReportPayload = {
      id: `rep-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      targetType,
      targetId,
      transmissionId,
      targetAuthorId,
      targetContent: targetContent.slice(0, 300), // Cuplikan konten max 300 karakter
      reporterId,
      reason: selectedReason,
      createdAt: Date.now(),
      status: 'pending',
    };

    // Tambahkan field opsional hanya jika ada isinya, untuk menghindari error "undefined" di Firestore
    if (targetAuthorAlias) {
      payload.targetAuthorAlias = targetAuthorAlias;
    }
    if (note.trim()) {
      payload.note = note.trim().slice(0, 200);
    }

    try {
      await onSubmitReport(payload);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('[ReportModal] Error submitting report:', err);
      setErrorMessage(err.message || 'Gagal mengirimkan laporan. Harap coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md border border-border bg-surface p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 shrink-0">
          <div className="flex items-center gap-2 text-amber-500 font-mono text-sm uppercase font-bold tracking-wider">
            <Flag size={16} />
            <span>Laporkan {targetType === 'transmission' ? 'Cerita' : 'Balasan'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-border text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Tutup Modal"
          >
            <X size={15} />
          </button>
        </div>

        {isSubmitted ? (
          /* Sukses Terkirim State */
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
              Laporan Berhasil Terkirim
            </h4>
            <p className="font-sans text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
              Terima kasih telah membantu menjaga Frequency tetap bersih, berempati, dan bebas dari pelanggaran.
            </p>
          </div>
        ) : (
          /* Form Laporan */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
            {/* Snippet Konten Yang Dilaporkan */}
            <div className="p-3 border border-border/80 bg-background/60 space-y-1 font-mono text-[11px]">
              <div className="text-text-secondary/70 flex items-center justify-between">
                <span>Penulis: <strong className="text-text-primary">{targetAuthorAlias || targetAuthorId}</strong></span>
                <span className="uppercase text-[10px] text-accent">[{targetType}]</span>
              </div>
              <p className="font-sans text-xs text-text-secondary line-clamp-2 italic pt-1 border-t border-border/30">
                "{targetContent}"
              </p>
            </div>

            {/* Error Message jika ada */}
            {errorMessage && (
              <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Opsi Alasan Laporan */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider block">
                Pilih Alasan Utama:
              </label>
              <div className="space-y-1.5 font-sans text-xs">
                {PRESET_REASONS.map((reasonOption) => (
                  <label
                    key={reasonOption}
                    className={`flex items-center gap-3 p-2.5 border cursor-pointer transition-all ${
                      selectedReason === reasonOption
                        ? 'border-accent bg-accent/5 text-text-primary font-semibold'
                        : 'border-border/60 hover:border-border text-text-secondary hover:text-text-primary bg-background/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reasonOption}
                      checked={selectedReason === reasonOption}
                      onChange={() => setSelectedReason(reasonOption)}
                      className="accent-accent text-accent"
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Catatan Tambahan Optional */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-text-secondary/80 block">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Berikan konteks singkat jika diperlukan..."
                rows={2}
                maxLength={200}
                className="w-full p-2.5 bg-background border border-border text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent resize-none font-sans"
              />
            </div>

            {/* Notice Moderasi */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-text-secondary/60 pt-1">
              <ShieldAlert size={12} className="text-amber-500 shrink-0" />
              <span>Laporan Anda dikirimkan secara anonim untuk ditinjau oleh sistem & moderator.</span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary font-mono text-xs uppercase transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-text-primary text-background font-mono text-xs uppercase tracking-wider font-semibold hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Flag size={13} />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
