import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  X, 
  ShieldAlert, 
  Trash2, 
  Ban, 
  CheckCircle, 
  UserX, 
  Key, 
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
  resolveReportInFirestore, 
  deleteReportFromFirestore, 
  banUserInFirestore, 
  unbanUserInFirestore, 
  deleteTransmissionFromFirestore, 
  deleteReplyFromFirestore 
} from '../../services/frequencyService';

export const CoreRoom: React.FC = () => {
  const navigate = useNavigate();
  const myId = localStorage.getItem('sorside_freq_id') || 'Unknown';

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

  // Active Tab: 'reports' | 'blacklists' | 'settings'
  const [activeTab, setActiveTab] = useState<'reports' | 'blacklists' | 'settings'>('reports');

  // Real-time Firestore Data
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [blacklists, setBlacklists] = useState<BlacklistItem[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

  // Search query inside private room
  const [searchQuery, setSearchQuery] = useState('');

  // Manual ban
  const [manualBanId, setManualBanId] = useState('');
  const [manualBanReason, setManualBanReason] = useState('');

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
    if (!isUnlocked) return;

    const unsubReports = subscribeReports(setReports);
    const unsubBlacklists = subscribeBlacklists(setBlacklists);

    return () => {
      unsubReports();
      unsubBlacklists();
    };
  }, [isUnlocked]);

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

  const handleClose = () => {
    navigate('/frequency');
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
      showToast('Pengguna diblokir, konten dihapus, laporan diselesaikan.');
    } catch (err: any) {
      showToast(err.message || 'Gagal memblokir pengguna.', 'error');
    }
  };

  const handleDismissReport = async (report: ReportItem) => {
    try {
      await resolveReportInFirestore(report.id, 'dismissed');
      showToast('Laporan diabaikan.');
    } catch {
      showToast('Gagal mengabaikan laporan.', 'error');
    }
  };

  const handleDeleteReportPermanently = async (reportId: string) => {
    try {
      await deleteReportFromFirestore(reportId);
      showToast('Laporan dihapus permanen.');
    } catch {
      showToast('Gagal menghapus laporan.', 'error');
    }
  };

  // Actions for blacklists
  const handleManualBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBanId.trim()) return;
    try {
      await banUserInFirestore(manualBanId.trim(), manualBanReason.trim() || 'Manual Ban', myId);
      showToast(`Pengguna ${manualBanId.trim()} berhasil diblokir.`);
      setManualBanId('');
      setManualBanReason('');
    } catch (err: any) {
      showToast(err.message || 'Gagal memblokir pengguna.', 'error');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUserInFirestore(userId);
      showToast(`Blokir untuk ${userId} telah dicabut.`);
    } catch {
      showToast('Gagal mencabut blokir.', 'error');
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  // Filters
  const filteredReports = reports.filter((r) => {
    if (reportFilter !== 'all' && r.status !== reportFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
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
    <div className="min-h-screen bg-background text-text-primary animate-in fade-in duration-200">
      <div className="w-full max-w-5xl mx-auto flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border/80 bg-background/80 shrink-0 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono text-xs flex items-center gap-1.5 font-bold uppercase tracking-widest">
              <Lock size={13} />
              <span>/core-room</span>
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
              onClick={handleClose}
              className="px-2.5 py-1 border border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              <X size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Global Toast Message */}
        {toastMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
            <div className={`px-4 py-2 rounded shadow-lg font-mono text-xs uppercase tracking-wider font-bold border flex items-center gap-2 ${
              toastMsg.type === 'error' 
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            }`}>
              {toastMsg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              <span>{toastMsg.text}</span>
            </div>
          </div>
        )}

        {!isUnlocked ? (
          /* STATE 1: TERKUNCI */
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm border border-border bg-surface p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center rounded-full mb-4">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="font-mono text-base font-bold text-text-primary uppercase tracking-widest">
                  Otorisasi Diperlukan
                </h3>
                <p className="font-sans text-xs text-text-secondary leading-relaxed">
                  Masukkan Master PIN untuk mengakses Sorside Control Room.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="password"
                    autoFocus
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Master PIN..."
                    className="w-full bg-background border border-border focus:border-amber-500/60 pl-4 pr-4 py-3 text-center font-mono text-sm tracking-[0.3em] text-text-primary outline-none transition-colors"
                  />
                  {pinError && (
                    <p className="font-mono text-[10px] text-red-400 text-center pt-1 animate-in slide-in-from-top-1">
                      {pinError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase font-bold tracking-widest transition-colors"
                >
                  Buka Akses
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* STATE 2: TERBUKA (KONTEN) */
          <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6">
            
            {/* Navigasi Internal & Pencarian */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
              <div className="flex items-center flex-wrap gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-2 border transition-colors flex items-center gap-2 ${
                    activeTab === 'reports'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-border text-text-secondary hover:text-text-primary hover:border-border/80'
                  }`}
                >
                  <span>Laporan</span>
                  {pendingReportsCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-black rounded text-[10px] leading-none">
                      {pendingReportsCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('blacklists')}
                  className={`px-4 py-2 border transition-colors ${
                    activeTab === 'blacklists'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-border text-text-secondary hover:text-text-primary hover:border-border/80'
                  }`}
                >
                  Blacklist
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 border transition-colors ${
                    activeTab === 'settings'
                      ? 'border-text-primary bg-surface text-text-primary'
                      : 'border-border text-text-secondary hover:text-text-primary hover:border-border/80'
                  }`}
                >
                  Pengaturan
                </button>
              </div>

              {/* Pencarian (Hanya di Tab Reports & Blacklist) */}
              {(activeTab === 'reports' || activeTab === 'blacklists') && (
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari ID/Alias..."
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border focus:border-amber-500/60 font-mono text-xs outline-none text-text-primary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAB CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* 1. TAB LAPORAN (REPORTS) */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {/* Filter Status Laporan */}
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase border-b border-border/60 pb-3">
                    <span className="text-text-secondary mr-2">Status:</span>
                    {(['pending', 'resolved', 'dismissed', 'all'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setReportFilter(filter)}
                        className={`px-2.5 py-1 border transition-colors rounded-sm ${
                          reportFilter === filter
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-transparent hover:border-border text-text-secondary'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* List Laporan */}
                  <div className="space-y-3">
                    {filteredReports.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border text-text-secondary font-mono text-xs flex flex-col items-center justify-center gap-2">
                        <CheckCircle size={20} className="text-emerald-500/50" />
                        <span>Tidak ada laporan {reportFilter !== 'all' ? reportFilter : ''} ditemukan.</span>
                      </div>
                    ) : (
                      filteredReports.map((report) => (
                        <div key={report.id} className="p-4 border border-border bg-surface/50 space-y-3 hover:border-amber-500/30 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm ${
                                report.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                'bg-surface text-text-secondary border border-border'
                              }`}>
                                {report.status}
                              </span>
                              <span className="font-mono text-[10px] text-text-secondary">
                                {formatDate(report.createdAt)}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 border border-border rounded-sm">
                              ID: {report.id}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1.5">
                              <p><span className="text-text-secondary">Terlapor:</span> <strong className="text-red-400">{report.targetAuthorAlias || report.targetAuthorId}</strong> <span className="text-[10px] text-text-secondary/50">({report.targetAuthorId})</span></p>
                              <p><span className="text-text-secondary">Tipe Konten:</span> <span className="uppercase text-amber-500/80">{report.targetType}</span></p>
                              <p><span className="text-text-secondary">Alasan:</span> <strong className="text-text-primary">{report.reason}</strong></p>
                              {report.note && (
                                <p><span className="text-text-secondary">Catatan:</span> <span className="italic">"{report.note}"</span></p>
                              )}
                              <p><span className="text-text-secondary">Pelapor:</span> {report.reporterId}</p>
                            </div>
                            <div className="p-2 border border-border/60 bg-background font-sans text-text-secondary max-h-32 overflow-y-auto italic">
                              "{report.targetContent}"
                            </div>
                          </div>

                          {/* Tombol Aksi (Hanya jika pending) */}
                          {report.status === 'pending' && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                              <button
                                type="button"
                                onClick={() => handleDeleteReportContent(report)}
                                className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-mono text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Trash2 size={13} />
                                <span>Hapus Konten</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBanAndResolve(report)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-mono text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-md transition-colors"
                              >
                                <Ban size={13} />
                                <span>Ban & Hapus</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissReport(report)}
                                className="px-3 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary font-mono text-[11px] uppercase tracking-wider transition-colors ml-auto"
                              >
                                Abaikan
                              </button>
                            </div>
                          )}

                          {/* Hapus Laporan Permanen (Hanya jika bukan pending) */}
                          {report.status !== 'pending' && (
                            <div className="flex justify-end pt-2 border-t border-border/50">
                              <button
                                type="button"
                                onClick={() => handleDeleteReportPermanently(report.id)}
                                className="px-2 py-1 text-text-secondary hover:text-red-400 font-mono text-[10px] uppercase flex items-center gap-1 transition-colors"
                              >
                                <X size={12} />
                                <span>Hapus Log Permanen</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 2. TAB BLACKLIST */}
              {activeTab === 'blacklists' && (
                <div className="space-y-6">
                  {/* Manual Ban Form */}
                  <div className="p-4 border border-red-500/30 bg-red-500/5 rounded space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <UserX size={14} />
                      <span>Blokir Pengguna (Manual)</span>
                    </h4>
                    <form onSubmit={handleManualBan} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={manualBanId}
                        onChange={(e) => setManualBanId(e.target.value)}
                        placeholder="User ID (misal: freq-100)..."
                        className="flex-1 px-3 py-2 bg-background border border-red-500/40 focus:border-red-500 font-mono text-xs text-text-primary outline-none rounded-sm"
                      />
                      <input
                        type="text"
                        value={manualBanReason}
                        onChange={(e) => setManualBanReason(e.target.value)}
                        placeholder="Alasan blokir..."
                        className="flex-1 px-3 py-2 bg-background border border-red-500/40 focus:border-red-500 font-mono text-xs text-text-primary outline-none rounded-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-mono text-xs uppercase font-bold tracking-wider rounded-sm shrink-0 transition-colors"
                      >
                        Blokir
                      </button>
                    </form>
                  </div>

                  {/* List of Blacklists */}
                  <div className="space-y-3">
                    <h4 className="font-mono text-[11px] text-text-secondary uppercase tracking-wider font-semibold border-b border-border/60 pb-2">
                      Daftar Terblokir ({filteredBlacklists.length})
                    </h4>
                    
                    {filteredBlacklists.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border text-text-secondary font-mono text-xs">
                        Tidak ada pengguna terblokir.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredBlacklists.map((b) => (
                          <div key={b.userId} className="p-3 border border-border bg-surface/50 flex items-center justify-between gap-3 hover:border-red-500/30 transition-colors rounded-sm">
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
                              className="px-3 py-1.5 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[11px] uppercase tracking-wider font-semibold rounded-sm shrink-0 transition-colors"
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

              {/* 3. TAB PENGATURAN MASTER PIN */}
              {activeTab === 'settings' && (
                <div className="space-y-5 max-w-md">
                  <div className="p-5 border border-border bg-surface/50 rounded space-y-4">
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
                          className="w-full px-3 py-2 bg-background border border-border focus:border-amber-500/60 font-mono text-xs text-text-primary outline-none rounded-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-colors"
                      >
                        Simpan PIN Baru
                      </button>
                      {pinSuccessMsg && (
                        <p className="font-mono text-xs text-emerald-400 flex items-center gap-1 pt-1 animate-in fade-in">
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
