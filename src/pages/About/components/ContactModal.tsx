import React, { useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { ContactForm } from '../../Contact/components/ContactForm';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // Tutup popup jika tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // cegah scroll background
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg border border-border bg-surface p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-text-secondary"
        onClick={(e) => e.stopPropagation()} // Cegah tutup saat klik isi modal
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent animate-pulse" />
              <p className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
                DIRECT_TRANSMISSION // FORM
              </p>
            </div>
            <h3 className="font-display text-2xl uppercase tracking-widest text-text-primary">
              Kirim Pesan
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors font-mono text-xs flex items-center gap-1"
            title="Tutup (Esc)"
          >
            <X size={16} />
            <span className="hidden sm:inline text-[10px] tracking-widest">ESC</span>
          </button>
        </div>

        {/* Info singkat */}
        <p className="font-sans text-xs text-text-secondary leading-relaxed mb-6">
          Tinggalkan pesan, pertanyaan kerja sama, atau pemikiranmu. Pesan akan diteruskan langsung ke kotak masuk sorside.
        </p>

        {/* Contact Form yang sudah terintegrasi EmailJS */}
        <ContactForm />
      </div>
    </div>
  );
};
