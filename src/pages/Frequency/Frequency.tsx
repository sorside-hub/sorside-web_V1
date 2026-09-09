import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Search, RotateCcw, User } from 'lucide-react';
import { FrequencyHeader } from './components/FrequencyHeader';
import { FrequencyMenuDrawer } from './components/FrequencyMenuDrawer';
import { FrequencySearchDrawer } from './components/FrequencySearchDrawer';
import { TransmissionComposerModal } from './components/TransmissionComposerModal';
import { TransmissionItem, Transmission, Reply } from './components/TransmissionItem';
import { TransmissionDetailModal } from './components/TransmissionDetailModal';
import { UserProfileView, UserProfileTarget } from './components/UserProfileView';
import { IdentityRecoveryModal } from './components/IdentityRecoveryModal';
import { IdentityGateModal } from './components/IdentityGateModal';
import { ReportModal, ReportPayload } from './components/ReportModal';
import { AvatarGenerator } from './components/AvatarGenerator';
import { 
  subscribeTransmissions, 
  subscribeIdentities,
  subscribeOriginIds,
  createTransmissionToFirestore, 
  addReplyToFirestore, 
  deleteTransmissionFromFirestore,
  deleteReplyFromFirestore,
  createReportInFirestore,
  generatePermanentId,
  generatePasskey,
  syncIdentityToFirestore,
  cleanupGhostIdentities,
  UserIdentity
} from '../../services/frequencyService';

export const Frequency: React.FC = () => {
  // User Identity State (Stored in LocalStorage & Synchronized to Firestore)
  // Tamu (Guest) tidak memiliki sorside_freq_id atau sorside_freq_key di localStorage
  const [myId, setMyId] = useState(() => {
    try {
      const id = localStorage.getItem('sorside_freq_id');
      if (!id || id.startsWith('ss-')) {
        return '';
      }
      return id;
    } catch {
      return '';
    }
  });

  const [myPasskey, setMyPasskey] = useState(() => {
    try {
      return localStorage.getItem('sorside_freq_key') || '';
    } catch {
      return '';
    }
  });

  const [myAlias, setMyAlias] = useState(() => {
    try {
      return localStorage.getItem('sorside_freq_alias') || '';
    } catch {
      return '';
    }
  });

  // Apakah user saat ini bertindak sebagai Tamu?
  const isGuest = !myId || !myPasskey;

  // Gate Modal State
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [gateActionReason, setGateActionReason] = useState<string>('untuk berinteraksi di gelombang Frequency');

  // Map of all identities in Firestore (id -> latest alias) & (id -> createdAt)
  const [identitiesMap, setIdentitiesMap] = useState<Record<string, string>>({});
  const [createdDatesMap, setCreatedDatesMap] = useState<Record<string, number>>({});

  // Feed & Loading State (Tanpa template fallback dummy)
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In-app Delete Confirmation State (Menggantikan window.confirm yang diblokir iframe)
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  // Report Target State (Poin 1 & 2)
  const [reportTarget, setReportTarget] = useState<{
    targetType: 'transmission' | 'reply';
    targetId: string;
    transmissionId: string;
    targetAuthorId: string;
    targetAuthorAlias?: string;
    targetContent: string;
  } | null>(null);

  // Origin IDs ("✦ sorside" Badge) State
  const [originIds, setOriginIds] = useState<string[]>([]);

  // Modals state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoActiveTab, setInfoActiveTab] = useState<'about' | 'rules'>('about');
  const [viewProfileTarget, setViewProfileTarget] = useState<UserProfileTarget | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dedicated Post Detail Modal (Poin 3)
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [initialReplyTarget, setInitialReplyTarget] = useState<{ id: string; name: string } | null>(null);

  // Composer modal & auto-draft state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(() => {
    try {
      return localStorage.getItem('sorside_freq_draft') || '';
    } catch {
      return '';
    }
  });
  const [selectedVibe, setSelectedVibe] = useState('');

  // Floating Action Button (+) scroll detector (Poin 5)
  const [showScrollFAB, setShowScrollFAB] = useState(false);

  // Unified Modal History Controllers
  const openSearch = () => {
    window.history.pushState({ sorsideModal: true }, '');
    setIsSearchOpen(true);
  };

  const openMenu = () => {
    window.history.pushState({ sorsideModal: true }, '');
    setIsMenuOpen(true);
  };

  const openInfo = () => {
    window.history.pushState({ sorsideModal: true }, '');
    setShowInfoModal(true);
  };

  const openProfile = (target: UserProfileTarget) => {
    window.history.pushState({ sorsideModal: true }, '');
    setViewProfileTarget(target);
  };

  const triggerAuthGate = (reason: string = 'untuk berinteraksi di gelombang Frequency') => {
    setGateActionReason(reason);
    window.history.pushState({ sorsideModal: true }, '');
    setIsGateModalOpen(true);
  };

  const handleCloseGate = () => {
    handleCloseModal();
  };

  const openComposer = () => {
    if (isGuest) {
      triggerAuthGate('untuk membuat cerita baru');
      return;
    }
    window.history.pushState({ sorsideModal: true }, '');
    setIsComposerOpen(true);
  };

  const openTopicModal = () => {
    window.history.pushState({ sorsideModal: true }, '');
    setIsTopicModalOpen(true);
  };

  const openDetail = (tx: Transmission, targetReplyUser?: { id: string; name: string }) => {
    window.history.pushState({ sorsideModal: true }, '');
    setSelectedTransmission(tx);
    setInitialReplyTarget(targetReplyUser || null);
  };

  const handleCloseModal = () => {
    window.history.back();
  };

  const handleMenuToProfile = () => {
    setIsMenuOpen(false);
    setViewProfileTarget({ id: myId, alias: myAlias, isMe: true });
  };

  const handleMenuToInfo = () => {
    setIsMenuOpen(false);
    setShowInfoModal(true);
  };

  // Top-level popstate handler (closes topmost active layer)
  const isTopicModalOpenRef = useRef(isTopicModalOpen);
  isTopicModalOpenRef.current = isTopicModalOpen;

  const isComposerOpenRef = useRef(isComposerOpen);
  isComposerOpenRef.current = isComposerOpen;

  const isSearchOpenRef = useRef(isSearchOpen);
  isSearchOpenRef.current = isSearchOpen;

  const selectedTxRef = useRef(selectedTransmission);
  selectedTxRef.current = selectedTransmission;

  const showInfoModalRef = useRef(showInfoModal);
  showInfoModalRef.current = showInfoModal;

  const isMenuOpenRef = useRef(isMenuOpen);
  isMenuOpenRef.current = isMenuOpen;

  const viewProfileTargetRef = useRef(viewProfileTarget);
  viewProfileTargetRef.current = viewProfileTarget;

  const isGateModalOpenRef = useRef(isGateModalOpen);
  isGateModalOpenRef.current = isGateModalOpen;

  // Check URL pathname/hash for /private-room on mount (no longer used as it's a separate route, leaving it just in case someone lands here but it does nothing now)
  
  useEffect(() => {
    const handlePopState = () => {
      if (isGateModalOpenRef.current) {
        setIsGateModalOpen(false);
      } else if (isTopicModalOpenRef.current) {
        setIsTopicModalOpen(false);
      } else if (isComposerOpenRef.current) {
        setIsComposerOpen(false);
      } else if (isSearchOpenRef.current) {
        setIsSearchOpen(false);
      } else if (selectedTxRef.current) {
        setSelectedTransmission(null);
        setInitialReplyTarget(null);
      } else if (showInfoModalRef.current) {
        setShowInfoModal(false);
      } else if (isMenuOpenRef.current) {
        setIsMenuOpen(false);
      } else if (viewProfileTargetRef.current) {
        setViewProfileTarget(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Jika scroll lebih dari 120px ke bawah, munculkan tombol (+) melayang
      if (window.scrollY > 120) {
        setShowScrollFAB(true);
      } else {
        setShowScrollFAB(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Edge Swipe & Gesture Navigation Support (Disesuaikan agar tidak bentrok dengan gesture back OS)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let isEdgeTouch = false;
    let touchType: 'none' | 'edge-left' | 'edge-right' = 'none';

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      // Jangan trigger jika sedang ada modal fokus atau popup bertumpuk
      if (
        isComposerOpenRef.current || 
        isTopicModalOpenRef.current || 
        selectedTxRef.current || 
        showInfoModalRef.current
      ) {
        touchType = 'none';
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      const screenWidth = window.innerWidth;
      
      // Zona aman gesture: kita beri jeda 20px dari pinggir fisik agar tidak memicu gesture Back OS hp,
      // dan menangkap gesture di zona 20px - 70px dari pinggir kiri/kanan.
      const minDeadzone = 20; 
      const maxZone = Math.min(80, screenWidth * 0.22);

      // Cek apakah sentuhan dimulai dari area zona aman saat drawer tertutup
      if (!isSearchOpenRef.current && !isMenuOpenRef.current && !viewProfileTargetRef.current) {
        if (touchStartX >= minDeadzone && touchStartX <= maxZone) {
          touchType = 'edge-left';
          isEdgeTouch = true;
        } else if (touchStartX <= (screenWidth - minDeadzone) && touchStartX >= (screenWidth - maxZone)) {
          touchType = 'edge-right';
          isEdgeTouch = true;
        } else {
          touchType = 'none';
          isEdgeTouch = false;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchType === 'none' && !isEdgeTouch) return;
      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Pastikan gerakan dominan horizontal (bukan scrolling vertikal membaca feed)
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 45) {
        if (touchType === 'edge-left' && deltaX > 0) {
          // Usap ke kanan dari zona kiri -> Buka Drawer Search / Eksplorasi
          openSearch();
        } else if (touchType === 'edge-right' && deltaX < 0) {
          // Usap ke kiri dari zona kanan -> Buka Menu Sinyal
          openMenu();
        }
      }

      touchType = 'none';
      isEdgeTouch = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleDraftChange = (text: string) => {
    setDraftContent(text);
    try {
      localStorage.setItem('sorside_freq_draft', text);
    } catch {
      // ignore
    }
  };

  const handlePostTransmission = async (content: string, tag: string) => {
    const cleanTag = tag ? tag.trim().replace(/^#+/, '').replace(/\s+/g, '-').toLowerCase() : '';

    const newTx: Transmission = {
      id: `tx-${Date.now()}`,
      authorId: myId,
      authorAlias: myAlias || undefined,
      content,
      tag: cleanTag || undefined,
      timestamp: 'Baru saja',
      replies: []
    };

    // Push to Firestore first / enforce rules
    try {
      await createTransmissionToFirestore(newTx);

      // Optimistic UI update & clear draft (deduplicate if already in prev)
      setTransmissions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
      setDraftContent('');
      try {
        localStorage.removeItem('sorside_freq_draft');
      } catch {
        // ignore
      }

      // Close composer modal
      handleCloseModal();
    } catch (err: any) {
      console.warn('[Frequency] Validation/Firestore error:', err);
      alert(err.message || 'Gagal mengirim cerita.');
    }
  };

  // Sync dengan Firestore secara Real-Time (Transmissions & Master Identitas/Alias)
  useEffect(() => {
    const unsubscribeTransmissions = subscribeTransmissions(
      (remoteTransmissions) => {
        setTransmissions(remoteTransmissions || []);
        setIsLoading(false);
        // Pembersihan rutin ID hantu (0 postingan & tidak aktif > 30 hari)
        if (remoteTransmissions) {
          cleanupGhostIdentities(remoteTransmissions);
        }
      },
      (error) => {
        console.warn('[Frequency] Gagal memuat data dari Firestore:', error);
        setIsLoading(false);
      }
    );

    const unsubscribeIdentities = subscribeIdentities((map, createdMap) => {
      setIdentitiesMap(map);
      setCreatedDatesMap(createdMap);
    });

    const unsubscribeOrigin = subscribeOriginIds((ids) => {
      setOriginIds(ids || []);
    });

    return () => {
      unsubscribeTransmissions();
      unsubscribeIdentities();
      unsubscribeOrigin();
    };
  }, []);

  // Initialize or load identity from localStorage & sync with Firestore
  // HANYA JIKA user memang sudah memiliki ID tersimpan di browser sebelumnya
  useEffect(() => {
    try {
      const id = localStorage.getItem('sorside_freq_id');
      const key = localStorage.getItem('sorside_freq_key');

      // Jika belum ada ID atau Key, biarkan sebagai Tamu murni tanpa auto-generate
      if (!id || !key || id.startsWith('ss-')) {
        setMyId('');
        setMyPasskey('');
        return;
      }

      setMyId(id);
      setMyPasskey(key);

      const alias = localStorage.getItem('sorside_freq_alias') || '';
      if (alias) {
        setMyAlias(alias);
      }

      // Sync identity ke Firestore jika sudah punya createdAt atau ambil dari createdDatesMap
      const storedCreatedStr = localStorage.getItem('sorside_freq_created');
      let createdAtTimestamp: number | undefined;
      if (storedCreatedStr) {
        // Coba parse DD.MM.YYYY
        const parts = storedCreatedStr.split('.');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (!isNaN(d.getTime())) {
            createdAtTimestamp = d.getTime();
          }
        }
      }

      syncIdentityToFirestore({ 
        id, 
        key, 
        alias: alias || undefined,
        createdAt: createdAtTimestamp 
      });
    } catch {
      // ignore storage issues
    }
  }, []);

  const handleUpdateAlias = (newAlias: string) => {
    const clean = newAlias.trim();
    setMyAlias(clean);
    try {
      if (clean) {
        localStorage.setItem('sorside_freq_alias', clean);
      } else {
        localStorage.removeItem('sorside_freq_alias');
      }
      // Sync update to Firestore
      syncIdentityToFirestore({ id: myId, key: myPasskey, alias: clean || undefined });
    } catch {
      // ignore
    }
    if (viewProfileTarget?.isMe) {
      setViewProfileTarget(prev => prev ? { ...prev, alias: clean || undefined } : null);
    }
  };

  const handleIdentityRecovered = (recovered: UserIdentity) => {
    setMyId(recovered.id);
    setMyPasskey(recovered.key);
    setMyAlias(recovered.alias || '');

    try {
      localStorage.setItem('sorside_freq_id', recovered.id);
      localStorage.setItem('sorside_freq_key', recovered.key);
      if (recovered.alias) {
        localStorage.setItem('sorside_freq_alias', recovered.alias);
      } else {
        localStorage.removeItem('sorside_freq_alias');
      }
    } catch {
      // ignore
    }

    if (viewProfileTarget?.isMe) {
      setViewProfileTarget({
        id: recovered.id,
        alias: recovered.alias || undefined,
        isMe: true
      });
    }
  };

  // Submit reply di dalam detail modal (Poin 3 & 4)
  const handleSubmitReply = async (txId: string, replyContent: string, replyTo?: { id: string; name: string }) => {
    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      authorId: myId,
      authorAlias: myAlias || undefined,
      content: replyContent,
      timestamp: 'Baru saja',
      replyToId: replyTo?.id,
      replyToName: replyTo?.name
    };

    try {
      // Enforce rules in Firestore first
      await addReplyToFirestore(txId, newReply);

      // Optimistic UI update
      setTransmissions(prev =>
        prev.map(tx => {
          if (tx.id === txId) {
            return {
              ...tx,
              replies: [...tx.replies, newReply]
            };
          }
          return tx;
        })
      );

      // Update active modal view
      setSelectedTransmission(prev => {
        if (!prev || prev.id !== txId) return prev;
        return {
          ...prev,
          replies: [...prev.replies, newReply]
        };
      });
    } catch (err: any) {
      console.warn('[Frequency] Reply error:', err);
      alert(err.message || 'Gagal mengirimkan balasan.');
    }
  };

  const handleDeleteMyTx = (id: string) => {
    setTxToDelete(id);
  };

  const handleDeleteReply = async (txId: string, replyId: string) => {
    if (confirm('Yakin ingin menghapus balasan ini?')) {
      try {
        await deleteReplyFromFirestore(txId, replyId);
      } catch (err) {
        console.error('Failed to delete reply:', err);
      }
    }
  };

  const handleOpenReportTransmission = (tx: Transmission) => {
    setReportTarget({
      targetType: 'transmission',
      targetId: tx.id,
      transmissionId: tx.id,
      targetAuthorId: tx.authorId,
      targetAuthorAlias: tx.authorAlias,
      targetContent: tx.content,
    });
  };

  const handleOpenReportReply = (txId: string, reply: Reply) => {
    setReportTarget({
      targetType: 'reply',
      targetId: reply.id,
      transmissionId: txId,
      targetAuthorId: reply.authorId,
      targetAuthorAlias: reply.authorAlias,
      targetContent: reply.content,
    });
  };

  const handleSubmitReport = async (payload: ReportPayload) => {
    await createReportInFirestore(payload);
  };

  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    const id = txToDelete;
    setTxToDelete(null);

    // Optimistic UI update
    setTransmissions(prev => prev.filter(t => t.id !== id));
    if (selectedTransmission?.id === id) {
      setSelectedTransmission(null);
    }

    try {
      await deleteTransmissionFromFirestore(id);
    } catch (err) {
      console.warn('[Frequency] Gagal hapus dari Firestore, tetap terhapus di lokal:', err);
    }
  };

  const getAvatarInitials = (id: string, alias?: string): React.ReactNode => {
    if (!id) {
      return (
        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-text-secondary/70">
          <User size={16} />
        </div>
      );
    }

    if (id.toLowerCase() === 'freq-999') {
      return <span className="text-amber-400 text-lg">✦</span>;
    }

    return (
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        <AvatarGenerator seed={id} />
      </div>
    );
  };

  // Buka detail post mandiri saat kartu atau tombol balas diklik
  const handleOpenDetail = (tx: Transmission, targetReplyUser?: { id: string; name: string }) => {
    setSelectedTransmission(tx);
    setInitialReplyTarget(targetReplyUser || null);
  };

  // Transmisi dengan mapping alias dinamis real-time & garansi ID unik (no duplicate key error)
  const syncedTransmissions = React.useMemo(() => {
    const map = new Map<string, Transmission>();

    for (const tx of transmissions) {
      if (!tx || !tx.id || map.has(tx.id)) continue;

      const currentAuthorAlias = (tx.authorId === myId && myAlias)
        ? myAlias
        : (identitiesMap[tx.authorId] !== undefined ? identitiesMap[tx.authorId] : tx.authorAlias);

      const seenReplyIds = new Set<string>();
      const updatedReplies = (tx.replies || []).filter(r => {
        if (!r || !r.id || seenReplyIds.has(r.id)) return false;
        seenReplyIds.add(r.id);
        return true;
      }).map((r) => {
        const currentReplyAlias = (r.authorId === myId && myAlias)
          ? myAlias
          : (identitiesMap[r.authorId] !== undefined ? identitiesMap[r.authorId] : r.authorAlias);
        return {
          ...r,
          authorAlias: currentReplyAlias || undefined
        };
      });

      map.set(tx.id, {
        ...tx,
        authorAlias: currentAuthorAlias || undefined,
        replies: updatedReplies
      });
    }

    return Array.from(map.values());
  }, [transmissions, identitiesMap, myId, myAlias]);

  // Transmisi aktif terpilih untuk modal detail (tersinkronisasi aliasnya)
  const activeSelectedTransmission = React.useMemo(() => {
    if (!selectedTransmission) return null;
    const latest = syncedTransmissions.find(t => t.id === selectedTransmission.id);
    return latest || selectedTransmission;
  }, [selectedTransmission, syncedTransmissions]);

  // Target profil aktif (tersinkronisasi aliasnya)
  const activeProfileTarget = React.useMemo(() => {
    if (!viewProfileTarget) return null;
    const latestAlias = viewProfileTarget.isMe 
      ? myAlias 
      : (identitiesMap[viewProfileTarget.id] !== undefined ? identitiesMap[viewProfileTarget.id] : viewProfileTarget.alias);
    return {
      ...viewProfileTarget,
      alias: latestAlias || undefined
    };
  }, [viewProfileTarget, myAlias, identitiesMap]);

  // Filter transmissions berdasarkan kata kunci / search
  const filteredTransmissions = searchQuery.trim()
    ? syncedTransmissions.filter(tx => {
        const q = searchQuery.toLowerCase().trim();
        return (
          tx.content.toLowerCase().includes(q) ||
          tx.authorId.toLowerCase().includes(q) ||
          (tx.authorAlias && tx.authorAlias.toLowerCase().includes(q)) ||
          (tx.tag && tx.tag.toLowerCase().includes(q))
        );
      })
    : syncedTransmissions;

  // Dynamic topic list & statistik dihitung murni dari transmisi aktif di database
  const dynamicTopicStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    syncedTransmissions.forEach((tx) => {
      if (tx.tag) {
        const clean = tx.tag.replace(/^#+/, '').trim().toLowerCase();
        if (clean) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [syncedTransmissions]);

  return (
    <div className="pb-24 max-w-xl mx-auto px-0 relative">
      
      {/* 1. COMPACT STICKY HEADER */}
      <FrequencyHeader 
        onToggleSearch={openSearch}
        isSearchOpen={isSearchOpen}
        onOpenMenu={openMenu}
      />

      {/* FILTER INDIKATOR AKTIF (Jika feed sedang terfilter oleh pencarian atau topik) */}
      {searchQuery.trim() && (
        <div className="mb-4 p-3 border border-border/80 bg-surface/50 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary min-w-0 pr-2">
            <span className="text-text-secondary shrink-0">Filter:</span>
            <div className="font-mono font-bold truncate flex items-center gap-0.5">
              {searchQuery.startsWith('#') ? (
                <>
                  <span className="text-accent font-bold">#</span>
                  <span className="text-text-primary font-bold">{searchQuery.slice(1)}</span>
                </>
              ) : (
                <span className="text-text-primary font-bold">&quot;{searchQuery}&quot;</span>
              )}
            </div>
            <span className="text-text-secondary/70 text-[10px] shrink-0">
              ({filteredTransmissions.length} cerita)
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="font-mono text-xs text-text-secondary hover:text-text-primary hover:underline px-2 py-0.5 border border-border hover:border-text-primary shrink-0 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* 2. COMPOSER TRIGGER BAR (Hanya tampil saat feed TIDAK sedang difilter) */}
      {!searchQuery.trim() && (
        <div 
          onClick={openComposer}
          className="py-3.5 mb-4 border-b border-border/70 cursor-pointer transition-colors flex items-center gap-3.5 select-none group hover:border-border"
        >
          <div className="w-10 h-10 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center shrink-0 group-hover:border-text-secondary/70 transition-colors overflow-hidden">
            {getAvatarInitials(myId, myAlias)}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 font-mono text-xs text-text-primary font-semibold">
              {/* Jika punya alias tampilkan nama alias saja, jika guest tampilkan ajakan */}
              <span>{isGuest ? 'Masuk ke Frekuensi' : (myAlias || myId)}</span>
            </div>
            <p className="text-sm font-sans text-text-secondary/60 group-hover:text-text-secondary transition-colors truncate mt-0.5">
              {isGuest 
                ? 'Klik untuk mendaftar ID anonim & mulai bercerita...' 
                : (draftContent ? `Draft: ${draftContent}` : 'Mulai bercerita...')}
            </p>
          </div>
        </div>
      )}

      {/* MODAL FOKUS MENULIS */}
      <TransmissionComposerModal
        isOpen={isComposerOpen}
        onClose={handleCloseModal}
        onSubmit={handlePostTransmission}
        myId={myId}
        myAlias={myAlias}
        draftContent={draftContent}
        onDraftChange={handleDraftChange}
        selectedTag={selectedVibe}
        onTagChange={setSelectedVibe}
        tagOptions={dynamicTopicStats}
        avatarInitials={getAvatarInitials(myId, myAlias)}
        isTopicModalOpen={isTopicModalOpen}
        onOpenTopicModal={openTopicModal}
        onCloseTopicModal={handleCloseModal}
      />

      {/* 3. FEED TRANSMISI (Klik card atau balas langsung buka modal mandiri) */}
      <div className="divide-y divide-border/60">
        {isLoading ? (
          /* Subtle Minimalist Skeleton Loading */
          <div className="divide-y divide-border/50 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface/80 shrink-0 border border-border/60" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-surface/90 rounded" />
                    <div className="h-2.5 w-16 bg-surface/60 rounded" />
                  </div>
                </div>
                <div className="space-y-2 pl-[52px]">
                  <div className="h-3 w-full bg-surface/80 rounded" />
                  <div className="h-3 w-4/5 bg-surface/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransmissions.length === 0 ? (
          <div className="py-16 text-center text-text-secondary font-mono text-xs uppercase tracking-widest space-y-2">
            {searchQuery.trim() ? (
              <>
                <p>Tidak ada cerita yang cocok dengan "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-accent hover:underline lowercase tracking-normal text-[11px]"
                >
                  bersihkan pencarian
                </button>
              </>
            ) : (
              <p>Belum ada cerita. Jadilah yang pertama bercerita.</p>
            )}
          </div>
        ) : (
          filteredTransmissions.map((tx) => (
            <TransmissionItem
              key={tx.id}
              transmission={tx}
              myId={myId}
              myAlias={myAlias}
              getAvatarInitials={getAvatarInitials}
              onOpenDetail={openDetail}
              onQuickReply={(targetTx) => openDetail(targetTx)}
              onDeleteTransmission={handleDeleteMyTx}
              onReportTransmission={handleOpenReportTransmission}
              onTopicClick={(topic) => {
                setSearchQuery(topic);
                setIsSearchOpen(true);
              }}
              onAuthorClick={(authorId, authorAlias) => {
                openProfile({
                  id: authorId,
                  alias: authorAlias,
                  isMe: authorId === myId
                });
              }}
              originIds={originIds}
            />
          ))
        )}
      </div>

      {/* 4. FLOATING ACTION BUTTON (+) CERDAS */}
      {showScrollFAB && (
        <div className="fixed bottom-20 right-5 sm:bottom-10 sm:right-10 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={openComposer}
            className="w-12 h-12 sm:w-13 sm:h-13 bg-text-primary text-background rounded-full shadow-2xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-border/30"
            aria-label="Tulis Cerita Baru"
            title="Tulis Cerita Baru"
          >
            <Plus size={22} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {/* 5. FULL-PAGE PROFIL SINYAL & ARSIP TRANSMISI */}
      {activeProfileTarget && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background">
          <UserProfileView
            targetUser={activeProfileTarget}
            onClose={handleCloseModal}
            myId={myId}
            myAlias={myAlias}
            allTransmissions={syncedTransmissions}
            getAvatarInitials={getAvatarInitials}
            onUpdateAlias={handleUpdateAlias}
            onDeleteTransmission={handleDeleteMyTx}
            onOpenTransmissionDetail={(tx) => {
              openDetail(tx);
            }}
            onOpenComposer={openComposer}
            onAuthorClick={(authorId, authorAlias) => {
              setViewProfileTarget({
                id: authorId,
                alias: authorAlias,
                isMe: authorId === myId
              });
            }}
            originIds={originIds}
            userCreatedDates={createdDatesMap}
          />
        </div>
      )}

      {/* 6. DEDICATED POST VIEW / MODAL POST MANDIRI (Stack di atas Profile jika dibuka dari profil) */}
      {activeSelectedTransmission && (
        <TransmissionDetailModal
          transmission={activeSelectedTransmission}
          onClose={handleCloseModal}
          myId={myId}
          myAlias={myAlias}
          getAvatarInitials={getAvatarInitials}
          onSubmitReply={handleSubmitReply}
          onDeleteTransmission={handleDeleteMyTx}
          onDeleteReply={handleDeleteReply}
          onReportTransmission={handleOpenReportTransmission}
          onReportReply={handleOpenReportReply}
          initialReplyTarget={initialReplyTarget}
          onAuthorClick={(authorId, authorAlias) => {
            setSelectedTransmission(null);
            setViewProfileTarget({
              id: authorId,
              alias: authorAlias,
              isMe: authorId === myId
            });
          }}
          originIds={originIds}
          isGuest={isGuest}
          onRequireAuth={triggerAuthGate}
        />
      )}

      {/* 7. MODAL INFO / ABOUT & ATURAN FREQUENCY */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseModal}
        >
          <div 
            className="w-full max-w-md border border-border bg-surface p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <h3 className="font-display text-xl uppercase tracking-widest text-text-primary">
                  Protocol & Informasi
                </h3>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 border border-border text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Tutup Modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background border border-border text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setInfoActiveTab('about')}
                className={`py-2 text-center uppercase tracking-wider transition-all font-semibold ${
                  infoActiveTab === 'about'
                    ? 'bg-surface text-text-primary border border-border shadow-sm'
                    : 'text-text-secondary/70 hover:text-text-primary'
                }`}
              >
                Tentang Ruang
              </button>
              <button
                type="button"
                onClick={() => setInfoActiveTab('rules')}
                className={`py-2 text-center uppercase tracking-wider transition-all font-semibold flex items-center justify-center gap-1.5 ${
                  infoActiveTab === 'rules'
                    ? 'bg-surface text-accent border border-accent/40 shadow-sm'
                    : 'text-text-secondary/70 hover:text-text-primary'
                }`}
              >
                <span>Aturan & Info</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto space-y-4 font-sans text-xs text-text-secondary leading-relaxed pr-1">
              {infoActiveTab === 'about' ? (
                <div className="space-y-4">
                  <p>
                    <strong className="text-text-primary font-mono block mb-1">// 100% PSEUDONYMOUS & BEBAS</strong>
                    Frequency adalah ruang gema dua arah tempat siapapun bisa menuliskan sisi hidup yang jarang atau bahkan tidak pernah terlihat oleh dunia luar.
                  </p>
                  <p>
                    <strong className="text-text-primary font-mono block mb-1">// TANPA LOGIN & TANPA DATA PRIBADI</strong>
                    Identitas akun Anda (<code className="text-accent font-mono">{myId}</code>) digenerate secara acak dan hanya tinggal di dalam peramban perangkat Anda.
                  </p>
                  <p>
                    <strong className="text-text-primary font-mono block mb-1">// DUA ARAH (SALING MEMBALAS)</strong>
                    Anda bisa membaca, membalas, dan merespons cerita pengunjung lain secara leluasa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="p-3 border border-border/70 bg-background/50 space-y-1">
                    <div className="font-mono font-bold text-text-primary text-[11px] uppercase tracking-wider">
                      1. JAGA ANONIMITAS (PRIVASI)
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Dilarang menyebarkan data pribadi (*doxxing*) seperti nama asli, nomor HP, alamat, atau akun medsos milik sendiri maupun orang lain.
                    </p>
                  </div>

                  <div className="p-3 border border-border/70 bg-background/50 space-y-1">
                    <div className="font-mono font-bold text-text-primary text-[11px] uppercase tracking-wider">
                      2. MELUAPKAN, BUKAN MENYERANG
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Bebas bercerita, namun dilarang keras melontarkan ancaman, perundungan (*cyberbullying*), ujaran kebencian, atau diskriminasi SARA.
                    </p>
                  </div>

                  <div className="p-3 border border-border/70 bg-background/50 space-y-1">
                    <div className="font-mono font-bold text-text-primary text-[11px] uppercase tracking-wider">
                      3. BEBAS DARI IKLAN & SPAM
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Dilarang pesan berulang (*spam*), promosi bisnis komersial, atau link judi online. Jaga feed tetap bersih dan bermakna.
                    </p>
                  </div>

                  <div className="p-3 border border-border/70 bg-background/50 space-y-1">
                    <div className="font-mono font-bold text-text-primary text-[11px] uppercase tracking-wider">
                      4. KEAMANAN (NO MALWARE)
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Dilarang menyebarkan tautan berbahaya (*phishing*), pornografi eksplisit, atau instruksi tindakan melanggar hukum.
                    </p>
                  </div>

                  <div className="p-3 border border-border/70 bg-background/50 space-y-1">
                    <div className="font-mono font-bold text-text-primary text-[11px] uppercase tracking-wider">
                      5. MEMBALAS DENGAN EMPATI
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      Saat membalas cerita orang lain, berikan tanggapan yang santun dan empati tanpa menghakimi.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-border/40 shrink-0">
              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 bg-text-primary text-background font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-colors font-semibold"
              >
                Pahami & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DRAWER SIDEBAR MENU (Garis Tiga) */}
      <FrequencyMenuDrawer
        isOpen={isMenuOpen}
        onClose={handleCloseModal}
        myId={myId}
        myAlias={myAlias}
        myPasskey={myPasskey}
        avatarInitials={getAvatarInitials(myId, myAlias)}
        onOpenProfile={handleMenuToProfile}
        onOpenInfo={handleMenuToInfo}
        onOpenRecoveryModal={() => {
          setIsMenuOpen(false);
          setIsRecoveryModalOpen(true);
        }}
        isGuest={isGuest}
        onOpenAuthGate={() => {
          setIsMenuOpen(false);
          triggerAuthGate('untuk mengakses akun dan profil Anda');
        }}
      />

      {/* MODAL GATE IDENTITAS (Tamu vs Daftar vs Pulihkan) */}
      <IdentityGateModal
        isOpen={isGateModalOpen}
        onClose={handleCloseGate}
        actionReason={gateActionReason}
        onRegistered={(identity) => {
          handleIdentityRecovered(identity);
        }}
        onContinueAsGuest={() => {
          handleCloseGate();
        }}
      />

      {/* 9. MODAL KUNCI & PEMULIHAN AKUN */}
      <IdentityRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        myId={myId}
        myPasskey={myPasskey}
        myAlias={myAlias}
        onIdentityRecovered={handleIdentityRecovered}
        isGuest={isGuest}
      />

      {/* 9. DRAWER SEARCH & EKSPLORASI TOPIK (Threads Style) */}
      <FrequencySearchDrawer
        isOpen={isSearchOpen}
        onClose={handleCloseModal}
        transmissions={syncedTransmissions}
        identitiesMap={identitiesMap}
        currentSearchQuery={searchQuery}
        onSelectTopic={(topic) => setSearchQuery(topic)}
        onSelectAuthor={(authorId, authorAlias) => {
          openProfile({
            id: authorId,
            alias: authorAlias,
            isMe: authorId === myId,
          });
        }}
        onSelectTransmission={(tx) => {
          openDetail(tx);
        }}
        onApplySearchQuery={(query) => setSearchQuery(query)}
      />

      {/* 10. MODAL KONFIRMASI HAPUS IN-APP (Aman dari pembatasan iframe / browser) */}
      {txToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setTxToDelete(null)}
        >
          <div 
            className="w-full max-w-sm border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h4 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
                Hapus Cerita?
              </h4>
              <p className="font-sans text-xs text-text-secondary leading-relaxed">
                Cerita ini akan dihapus secara permanen dari gelombang Frequency dan database. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-3.5 py-1.5 border border-border hover:border-text-primary text-text-secondary hover:text-text-primary font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL LAPORKAN SINYAL / BALASAN (Poin 1 & 2) */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.targetType}
          targetId={reportTarget.targetId}
          transmissionId={reportTarget.transmissionId}
          targetAuthorId={reportTarget.targetAuthorId}
          targetAuthorAlias={reportTarget.targetAuthorAlias}
          targetContent={reportTarget.targetContent}
          reporterId={myId}
          onSubmitReport={handleSubmitReport}
        />
      )}

    </div>
  );
};
