import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  X, 
  ShieldAlert, 
  Trash2, 
  Ban, 
  CheckCircle, 
  UserX, 
  Key, 
  Sparkles, 
  Search, 
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Check
} from 'lucide-react';
import { 
  ReportItem, 
  BlacklistItem, 
  subscribeReports, 
  subscribeBlacklists, 
  subscribeOriginIds,
  resolveReportInFirestore, 
  deleteReportFromFirestore, 
  banUserInFirestore, 
  unbanUserInFirestore, 
  deleteTransmissionFromFirestore, 
  deleteReplyFromFirestore, 
  toggleOriginIdInFirestore 
} from '../../../services/frequencyService';

interface PrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  myId: string;
}

export const PrivateRoomModal: React.FC<PrivateRoomModalProps> = ({
  isOpen,
  onClose,
  myId
}) => {
  // Master PIN Authentication
  const [masterPin, setMasterPin] = useState(() => {
    try {
      return localStorage.getItem('sorside_master_pin') || '1109';
    } catch {
      return '1109';
    }
  });

  const [inputPin, setInputPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');

  // Active Tab: 'reports' | 'blacklists' | 'origin' | 'settings'
  const [activeTab, setActiveTab] = useState<'reports' | 'blacklists' | 'origin' | 'settings'>('reports');

  // Real-time Firestore Data
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [blacklists, setBlacklists] = useState<BlacklistItem[]>([]);
  const [originIds, setOriginIds] = useState<string[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  // Search query inside private room
  const [searchQuery, setSearchQuery] = useState('');

  // Manual ban & manual origin ID state
  const [manualBanId, setManualBanId] = useState('');
  const [manualBanReason, setManualBanReason] = useState('');
  const [manualOriginId, setManualOriginId] = useState('');

  // Master Key change state
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  // Status notification message inside admin
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Subscribe to real-time data when unlocked
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;

    const unsubReports = subscribeReports(setReports);
    const unsubBlacklists = subscribeBlacklists(setBlacklists);
    const unsubOrigin = subscribeOriginIds(setOriginIds);

    return () => {
      unsubReports();
      unsubBlacklists();
      unsubOrigin();
    };
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === masterPin.trim()) {
      setIsUnlocked(true);
      setPinError('');
      setInputPin('');
    } else {
      setPinError('Kunci Master tidak cocok. Akses ditolak.');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      showToast('PIN Master minimal 4 karakter.', 'error');
      return;
    }
    try {
      localStorage.setItem('sorside_master_pin', newPinInput.trim());
      setMasterPin(newPinInput.trim());
      setNewPinInput('');
      setPinSuccessMsg('Master PIN berhasil diperbarui.');
      setTimeout(() => setPinSuccessMsg(''), 3000);
      showToast('Master PIN berhasil diperbarui.');
    } catch {
      showToast('Gagal menyimpan Master PIN baru.', 'error');
    }
  };

  // Actions for reports
  const handleDeleteReportContent = async (report: ReportItem) => {
    try {
      if (report.targetType === 'transmission') {
        await deleteTransmissionFromFirestore(report.transmissionId);
      } else {
        await deleteReplyFromFirestore(report.transmissionId, report.targetId);
      }
      await resolveReportInFirestore(report.id, 'resolved');
      showToast('Konten berhasil dihapus dan laporan diselesaikan.');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus konten.', 'error');
    }
  };

  const handleBanAndResolve = async (report: ReportItem) => {
    try {
      await banUserInFirestore(report.targetAuthorId, `Laporan: ${report.reason}`, myId);
      if (report.targetType === 'transmission') {
        await deleteTransmissionFromFirestore(report.transmissionId);
      } else {
        await deleteReplyFromFirestore(report.transmissionId, report.targetId);
      }
      await resolveReportInFirestore(report.id, 'resolved');
      showToast(`User ${report.targetAuthorId} telah diblokir dan konten dihapus.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memblokir user.', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await resolveReportInFirestore(reportId, status);
      showToast(`Laporan ditandai ${status === 'resolved' ? 'selesai' : 'diabaikan'}.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui status laporan.', 'error');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReportFromFirestore(reportId);
      showToast('Berkas laporan dihapus.');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus laporan.', 'error');
    }
  };

  // Actions for blacklists
  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUserInFirestore(userId);
      showToast(`Blokir untuk ${userId} telah dibuka.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal membuka blokir.', 'error');
    }
  };

  const handleManualBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBanId.trim()) return;
    try {
      await banUserInFirestore(manualBanId.trim(), manualBanReason.trim() || 'Manual Ban by Admin', myId);
      setManualBanId('');
      setManualBanReason('');
      showToast(`User ${manualBanId.trim()} berhasil diblokir.`);
    } catch (err: any) {
      showToast(err.message || 'Gagal memblokir user.', 'error');
    }
  };

  // Actions for Origin Badge
  const isMyOrigin = originIds.includes(myId);

  const handleToggleMyOrigin = async () => {
    try {
      await toggleOriginIdInFirestore(myId, !isMyOrigin);
      showToast(!isMyOrigin ? 'Status ✦ sorside diaktifkan untuk akun Anda!' : 'Status ✦ sorside dinonaktifkan.');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status Origin.', 'error');
    }
  };

  const handleManualOrigin = async (e: React.FormEvent, enable: boolean) => {
    e.preventDefault();
    if (!manualOriginId.trim()) return;
    try {
      await toggleOriginIdInFirestore(manualOriginId.trim(), enable);
      setManualOriginId('');
      showToast(enable ? `Lencana ✦ sorside diberikan ke ${manualOriginId.trim()}` : `Lencana dicabut dari ${manualOriginId.trim()}`);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status Origin.', 'error');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'pending' && r.status !== 'pending') return false;
    if (reportFilter === 'resolved' && r.status === 'pending') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.targetContent.toLowerCase().includes(q) ||
      r.targetAuthorId.toLowerCase().includes(q) ||
      (r.targetAuthorAlias && r.targetAuthorAlias.toLowerCase().includes(q)) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  const filteredBlacklists = blacklists.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.userId.toLowerCase().includes(q) || (b.reason && b.reason.toLowerCase().includes(q));
  });

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl border border-amber-500/30 bg-surface shadow-2xl flex flex-col max-h-[92vh] overflow-hidden rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border/80 bg-background/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono text-xs flex items-center gap-1.5 font-bold uppercase tracking-widest">
              <Lock size={13} />
              <span>/private-room</span>
            </span>
            <span className="text-xs font-mono text-text-secondary hidden sm:inline">
              [SORSIDE Control Room]
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="px-2.5 py-1 border border-border text-text-secondary hover:text-text-primary text-xs font-mono uppercase tracking-wider transition-colors"
                title="Kunci Sesi"
              >
                Kunci
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary border border-border hover:border-text-primary transition-colors rounded"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className={`px-4 py-2 font-mono text-xs text-center border-b ${
            toastMsg.type === 'error' 
              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {toastMsg.text}
          </div>
        )}

        {/* UNLOCKED / LOCKED VIEW SWITCHER */}
        {!isUnlocked ? (
          /* LOCKED PIN ENTER SCREEN */
          <div className="p-6 sm:p-10 text-center space-y-6 my-auto max-w-md mx-auto w-full">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Key size={26} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-xl uppercase tracking-widest text-text-primary font-bold">
                Akses Kunci Master
              </h3>
              <p className="font-sans text-xs text-text-secondary leading-relaxed">
                Masukkan PIN Master Key untuk membuka kontrol moderasi, laporan pelanggaran, dan status Origin.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan Master PIN (default: 1109)..."
                  className="w-full px-4 py-3 bg-background border border-border focus:border-amber-500/70 text-text-primary font-mono text-center text-sm tracking-widest outline-none rounded transition-colors placeholder:text-text-secondary/40 placeholder:tracking-normal placeholder:font-sans"
                  autoFocus
                />
                {pinError && (
                  <p className="font-mono text-xs text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle size={12} />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase tracking-widest font-bold transition-colors rounded shadow-lg"
              >
                Buka /private-room
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED CONTROL ROOM CONTENT */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center border-b border-border bg-background/50 overflow-x-auto shrink-0 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-3 border-b-2 font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors ${
                  activeTab === 'reports'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <ShieldAlert size={14} />
                <span>Laporan</span>
                {pendingReportsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
                    {pendingReportsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('blacklists')}
                className={`px-4 py-3 border-b-2 font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors ${
                  activeTab === 'blacklists'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Ban size={14} />
                <span>Terblokir ({blacklists.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('origin')}
                className={`px-4 py-3 border-b-2 font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors ${
                  activeTab === 'origin'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sparkles size={14} />
                <span>✦ sorside Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 border-b-2 font-semibold uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Key size={14} />
                <span>PIN Master</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* 1. TAB LAPORAN PELANGGARAN */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {/* Top Bar: Search & Status Filter */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background/60 p-3 border border-border/70 rounded">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari isi laporan / ID..."
                        className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border focus:border-amber-500/60 text-xs font-mono text-text-primary outline-none rounded"
                      />
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setReportFilter('pending')}
                        className={`px-3 py-1 rounded transition-colors ${
                          reportFilter === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportFilter('resolved')}
                        className={`px-3 py-1 rounded transition-colors ${
                          reportFilter === 'resolved'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Selesai
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportFilter('all')}
                        className={`px-3 py-1 rounded transition-colors ${
                          reportFilter === 'all'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Semua ({reports.length})
                      </button>
                    </div>
                  </div>

                  {/* Reports List */}
                  {filteredReports.length === 0 ? (
                    <div className="py-12 text-center text-text-secondary font-mono text-xs uppercase tracking-wider space-y-1">
                      <p>Tidak ada laporan ditemukan.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredReports.map((report) => (
                        <div 
                          key={report.id}
                          className={`p-4 border rounded transition-colors space-y-3 ${
                            report.status === 'pending'
                              ? 'border-amber-500/40 bg-surface/90'
                              : 'border-border/60 bg-background/40 opacity-75'
                          }`}
                        >
                          {/* Header Laporan */}
                          <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                  report.targetType === 'transmission' 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                }`}>
                                  {report.targetType === 'transmission' ? 'Sinyal Utama' : 'Balasan'}
                                </span>
                                <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                  {report.reason}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-text-secondary pt-1">
                                Target: <strong className="text-text-primary">{report.targetAuthorAlias || report.targetAuthorId}</strong> (<code className="text-accent">{report.targetAuthorId}</code>)
                              </p>
                            </div>

                            <span className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold shrink-0 ${
                              report.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {report.status}
                            </span>
                          </div>

                          {/* Cuplikan Konten Target */}
                          <div className="p-3 bg-background border border-border/60 rounded font-sans text-xs text-text-primary leading-relaxed">
                            <p className="italic text-text-secondary/90">"{report.targetContent}"</p>
                          </div>

                          {/* Catatan Pelapor */}
                          {report.note && (
                            <p className="font-mono text-[11px] text-text-secondary">
                              <strong>Catatan Pelapor:</strong> {report.note}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 font-mono text-xs flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteReportContent(report)}
                              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 rounded flex items-center gap-1 transition-colors uppercase text-[11px] font-semibold"
                              title="Hapus sinyal/balasan ini dari Firestore"
                            >
                              <Trash2 size={12} />
                              <span>Hapus Konten</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBanAndResolve(report)}
                              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded flex items-center gap-1 transition-colors uppercase text-[11px] font-bold shadow-sm"
                              title="Blokir ID pemancar & hapus konten"
                            >
                              <Ban size={12} />
                              <span>Blokir & Hapus</span>
                            </button>

                            {report.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => handleResolveReport(report.id, 'resolved')}
                                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/40 rounded flex items-center gap-1 transition-colors uppercase text-[11px] font-semibold"
                              >
                                <CheckCircle size={12} />
                                <span>Tandai Selesai</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteReport(report.id)}
                                className="px-2.5 py-1.5 border border-border hover:border-text-primary text-text-secondary hover:text-text-primary rounded text-[11px] uppercase transition-colors"
                              >
                                Hapus Berkas
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. TAB DAFTAR TERBLOKIR (BLACKLISTS) */}
              {activeTab === 'blacklists' && (
                <div className="space-y-5">
                  {/* Manual Ban Form */}
                  <form onSubmit={handleManualBan} className="p-4 border border-border bg-background/80 rounded space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                      <UserX size={14} className="text-red-400" />
                      <span>Blokir Pemancar Manual</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={manualBanId}
                        onChange={(e) => setManualBanId(e.target.value)}
                        placeholder="User ID (misal: freq-582)..."
                        className="px-3 py-2 bg-surface border border-border focus:border-red-500/60 font-mono text-xs text-text-primary outline-none rounded"
                      />
                      <input
                        type="text"
                        value={manualBanReason}
                        onChange={(e) => setManualBanReason(e.target.value)}
                        placeholder="Alasan pemblokiran..."
                        className="px-3 py-2 bg-surface border border-border focus:border-red-500/60 font-mono text-xs text-text-primary outline-none rounded sm:col-span-2"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!manualBanId.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold rounded transition-colors"
                    >
                      Blokir ID Ini
                    </button>
                  </form>

                  {/* List Blacklisted Users */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs text-text-secondary border-b border-border/60 pb-2">
                      <span>Daftar User Terblokir ({filteredBlacklists.length})</span>
                    </div>

                    {filteredBlacklists.length === 0 ? (
                      <div className="py-8 text-center text-text-secondary font-mono text-xs uppercase">
                        Belum ada ID pemancar yang terblokir.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredBlacklists.map((b) => (
                          <div 
                            key={b.userId}
                            className="p-3.5 border border-red-500/30 bg-surface rounded flex items-center justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <p className="font-mono text-xs font-bold text-red-400 truncate">
                                {b.userId}
                              </p>
                              <p className="font-mono text-[11px] text-text-secondary truncate">
                                {b.reason || 'Pelanggaran Protokol'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleUnbanUser(b.userId)}
                              className="px-3 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[11px] uppercase tracking-wider font-semibold rounded shrink-0 transition-colors"
                            >
                              Unban
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. TAB STATUS ORIGIN (✦ sorside BADGE) */}
              {activeTab === 'origin' && (
                <div className="space-y-6">
                  {/* Status Origin untuk Akun Saya */}
                  <div className="p-5 border border-amber-500/40 bg-surface/90 rounded space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wider">
                            Status Origin Akun Anda
                          </h4>
                          {isMyOrigin && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                              <span>✦ sorside</span>
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-text-secondary leading-relaxed">
                          ID Pemancar Anda saat ini: <code className="text-accent font-mono">{myId}</code>.
                          Mengaktifkan opsi ini akan menampilkan lencana <strong className="text-amber-400">✦ sorside</strong> secara resmi di setiap sinyal, thread, dan profil Anda.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleMyOrigin}
                      className={`px-5 py-2.5 font-mono text-xs uppercase tracking-widest font-bold rounded transition-colors flex items-center gap-2 ${
                        isMyOrigin
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                          : 'bg-amber-500 text-black hover:bg-amber-600 shadow-md'
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>{isMyOrigin ? 'Matikan Status ✦ sorside' : 'Aktifkan Lencana ✦ sorside'}</span>
                    </button>
                  </div>

                  {/* Manual Origin Manager */}
                  <div className="p-4 border border-border bg-background/80 rounded space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
                      Kelola ID Origin Lain (Manual)
                    </h4>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualOriginId}
                        onChange={(e) => setManualOriginId(e.target.value)}
                        placeholder="User ID (misal: freq-100)..."
                        className="flex-1 px-3 py-2 bg-surface border border-border focus:border-amber-500/60 font-mono text-xs text-text-primary outline-none rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleManualOrigin(e, true)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs font-bold uppercase rounded transition-colors"
                      >
                        Beri Lencana
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleManualOrigin(e, false)}
                        className="px-3.5 py-2 border border-border text-text-secondary hover:text-text-primary font-mono text-xs uppercase rounded transition-colors"
                      >
                        Cabut
                      </button>
                    </div>

                    {/* List of current Origin IDs */}
                    <div className="pt-2 space-y-2">
                      <p className="font-mono text-[11px] text-text-secondary">
                        Daftar ID Berstatus ✦ sorside ({originIds.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {originIds.length === 0 ? (
                          <span className="font-mono text-xs text-text-secondary italic">Belum ada ID terdaftar.</span>
                        ) : (
                          originIds.map((id) => (
                            <span key={id} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono text-xs flex items-center gap-1.5">
                              <span>✦ sorside</span>
                              <strong className="text-text-primary">{id}</strong>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TAB PENGATURAN MASTER PIN */}
              {activeTab === 'settings' && (
                <div className="space-y-5 max-w-md">
                  <div className="p-5 border border-border bg-background/80 rounded space-y-4">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                      <Key size={14} className="text-amber-400" />
                      <span>Ubah Master PIN</span>
                    </h4>

                    <form onSubmit={handleChangePin} className="space-y-3">
                      <div className="space-y-1">
                        <label className="font-mono text-[11px] text-text-secondary uppercase">
                          Master PIN Baru
                        </label>
                        <input
                          type="password"
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value)}
                          placeholder="Masukkan PIN baru (min 4 digit)..."
                          className="w-full px-3 py-2 bg-surface border border-border focus:border-amber-500/60 font-mono text-xs text-text-primary outline-none rounded"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase tracking-wider font-bold rounded transition-colors"
                      >
                        Simpan PIN Baru
                      </button>

                      {pinSuccessMsg && (
                        <p className="font-mono text-xs text-emerald-400 flex items-center gap-1 pt-1">
                          <Check size={12} />
                          <span>{pinSuccessMsg}</span>
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
