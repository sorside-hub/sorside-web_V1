import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { Transmission, Reply } from '../pages/Frequency/components/TransmissionItem';
import { formatRelativeTime } from '../utils/timeAgo';
import { 
  checkFrequencyCooldown, 
  recordFrequencyPostTime, 
  validateFrequencyContent, 
  validateMaxReplies 
} from '../utils/frequencyValidators';

const TRANSMISSIONS_COLLECTION = 'transmissions';
const IDENTITIES_COLLECTION = 'frequency_identities';
const REPORTS_COLLECTION = 'reports';
const BLACKLISTS_COLLECTION = 'blacklists';
const CONFIG_COLLECTION = 'sorside_config';

export interface UserIdentity {
  id: string;
  key: string;
  alias?: string;
}

export interface ReportItem {
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

export interface BlacklistItem {
  userId: string;
  reason?: string;
  bannedAt?: number;
  bannedBy?: string;
}

/**
 * Generate permanent user public ID (contoh: freq-582)
 */
export const generatePermanentId = (): string => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `freq-${randomNum}`;
};

/**
 * Generate secret recovery passkey (contoh: pass-78492)
 */
export const generatePasskey = (): string => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `pass-${randomNum}`;
};

/**
 * Normalisasi format passkey dari input pengguna
 */
export const normalizePasskey = (input: string): string => {
  const clean = input.trim().toLowerCase();
  if (clean.startsWith('pass-')) return clean;
  if (/^\d{4,6}$/.test(clean)) return `pass-${clean}`;
  return clean;
};

/**
 * Sinkronkan atau daftarkan identitas akun anonim ke Firestore
 */
export const syncIdentityToFirestore = async (identity: UserIdentity) => {
  try {
    const keyDocRef = doc(db, IDENTITIES_COLLECTION, identity.key.toLowerCase());
    await setDoc(keyDocRef, {
      id: identity.id,
      key: identity.key.toLowerCase(),
      alias: identity.alias || null,
      updatedAt: serverTimestamp(),
      lastActiveAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn('[Frequency Service] Sync identity warning:', err);
  }
};

/**
 * Memastikan ID khusus Freq-999 (alias sorside) terdaftar di Firestore
 */
export const ensureSpecialAccountInFirestore = async () => {
  try {
    const specialKey = 'pass-281199';
    const keyDocRef = doc(db, IDENTITIES_COLLECTION, specialKey);
    const docSnap = await getDoc(keyDocRef);
    if (!docSnap.exists() || docSnap.data()?.alias !== 'sorside') {
      await setDoc(keyDocRef, {
        id: 'Freq-999',
        key: specialKey,
        alias: 'sorside',
        updatedAt: serverTimestamp(),
        lastActiveAt: Date.now()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[Frequency Service] Ensure special account warning:', err);
  }
};

/**
 * Mendengarkan data identitas dan pemetaan alias secara real-time dari Firestore.
 */
export const subscribeIdentities = (
  callback: (identitiesMap: Record<string, string>) => void
) => {
  try {
    ensureSpecialAccountInFirestore();
    const q = collection(db, IDENTITIES_COLLECTION);
    return onSnapshot(
      q,
      (snapshot) => {
        const map: Record<string, string> = {
          'Freq-999': 'sorside'
        };
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.id && data.alias && typeof data.alias === 'string' && data.alias.trim()) {
            map[data.id] = data.alias.trim();
          }
        });
        callback(map);
      },
      (err) => {
        console.warn('[Frequency Service] Subscribe identities warning:', err);
      }
    );
  } catch (err) {
    console.warn('[Frequency Service] Subscribe identities exception:', err);
    return () => {};
  }
};

/**
 * Pulihkan identitas akun dari Firestore menggunakan Passkey
 */
export const recoverIdentityFromFirestore = async (inputKey: string): Promise<UserIdentity | null> => {
  const normalizedKey = normalizePasskey(inputKey);
  if (!normalizedKey) return null;

  try {
    const keyDocRef = doc(db, IDENTITIES_COLLECTION, normalizedKey);
    const docSnap = await getDoc(keyDocRef);
    if (!docSnap.exists()) {
      if (normalizedKey === 'pass-281199') {
        const specialIdentity: UserIdentity = {
          id: 'Freq-999',
          key: 'pass-281199',
          alias: 'sorside'
        };
        await syncIdentityToFirestore(specialIdentity);
        return specialIdentity;
      }
      return null;
    }
    const data = docSnap.data();
    return {
      id: data.id || (normalizedKey === 'pass-281199' ? 'Freq-999' : `freq-${Math.floor(100 + Math.random() * 900)}`),
      key: data.key || normalizedKey,
      alias: data.alias || (normalizedKey === 'pass-281199' ? 'sorside' : '')
    };
  } catch (err) {
    if (normalizedKey === 'pass-281199') {
      return {
        id: 'Freq-999',
        key: 'pass-281199',
        alias: 'sorside'
      };
    }
    console.error('[Frequency Service] Recovery error:', err);
    throw err;
  }
};

/**
 * Mendengarkan data transmisi secara real-time dari Firestore.
 */
export const subscribeTransmissions = (
  onUpdate: (transmissions: Transmission[]) => void,
  onError?: (err: any) => void
) => {
  try {
    const q = query(
      collection(db, TRANSMISSIONS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const seenIds = new Set<string>();
        const list: Transmission[] = [];

        snapshot.docs.forEach((docSnap) => {
          if (seenIds.has(docSnap.id)) return;
          seenIds.add(docSnap.id);

          const data = docSnap.data();
          
          // Hitung waktu transmisi dinamis dari data.createdAt jika ada
          const calculatedTimestamp = data.createdAt 
            ? formatRelativeTime(data.createdAt, data.timestamp || 'Baru saja')
            : (data.timestamp || 'Baru saja');

          // Hitung waktu balasan dinamis jika punya raw timestamp
          const replySeenIds = new Set<string>();
          const replies: Reply[] = [];
          if (Array.isArray(data.replies)) {
            data.replies.forEach((r: any, idx: number) => {
              const repId = r.id || `rep-${docSnap.id}-${idx}`;
              if (replySeenIds.has(repId)) return;
              replySeenIds.add(repId);

              replies.push({
                id: repId,
                authorId: r.authorId || 'freq-000',
                authorAlias: r.authorAlias || undefined,
                content: r.content || '',
                timestamp: r.createdAt 
                  ? formatRelativeTime(r.createdAt, r.timestamp || 'Baru saja')
                  : formatRelativeTime(r.timestamp, r.timestamp || 'Baru saja'),
                createdAt: r.createdAt || null,
                replyToId: r.replyToId || undefined,
                replyToName: r.replyToName || undefined
              });
            });
          }

          list.push({
            id: docSnap.id,
            authorId: data.authorId || 'freq-000',
            authorAlias: data.authorAlias || undefined,
            content: data.content || '',
            tag: data.tag || undefined,
            timestamp: calculatedTimestamp,
            createdAt: data.createdAt || null,
            replies
          });
        });

        onUpdate(list);
      },
      (error) => {
        console.warn('[Frequency Firestore] onSnapshot error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Frequency Firestore] Subscribe failed:', err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Memeriksa apakah user ID berada di daftar terblokir (Blacklist)
 */
export const checkIfUserIsBlacklisted = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  try {
    const docRef = doc(db, BLACKLISTS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (err) {
    console.warn('[Frequency] Check blacklist warning:', err);
    return false;
  }
};

/**
 * Mengirimkan laporan pelanggaran sinyal / balasan ke koleksi `reports` di Firestore.
 */
export const createReportInFirestore = async (reportData: {
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
}) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportData.id);
  await setDoc(reportRef, {
    ...reportData,
    createdAtServer: serverTimestamp()
  });
};

/**
 * Mengirimkan transmisi cerita baru ke Firestore.
 */
export const createTransmissionToFirestore = async (newTx: Omit<Transmission, 'replies'>) => {
  // 0. Cek Blacklist
  const isBanned = await checkIfUserIsBlacklisted(newTx.authorId);
  if (isBanned) {
    throw new Error('Identitas sinyal Anda telah diblokir karena pelanggaran protokol SORSIDE.');
  }

  // 1. Cek Cooldown / Rate Limit (15 detik)
  const cd = checkFrequencyCooldown(newTx.authorId);
  if (!cd.allowed) {
    throw new Error(`Harap tunggu ${cd.remainingSeconds} detik sebelum memancarkan sinyal berikutnya.`);
  }

  // 2. Validasi Karakter & Filter Spam/Judi/Links
  const val = validateFrequencyContent(newTx.content, newTx.tag);
  if (!val.isValid) {
    throw new Error(val.error || 'Konten tidak memenuhi kriteria sinyal.');
  }

  const txRef = doc(collection(db, TRANSMISSIONS_COLLECTION), newTx.id);
  await setDoc(txRef, {
    authorId: newTx.authorId,
    authorAlias: newTx.authorAlias || null,
    content: val.cleanContent,
    tag: val.cleanTag || null,
    timestamp: newTx.timestamp,
    createdAt: serverTimestamp(),
    replies: []
  });

  // Catat waktu post untuk rate limiting
  recordFrequencyPostTime(newTx.authorId);
};

/**
 * Menambahkan balasan (resonansi) ke suatu transmisi di Firestore.
 */
export const addReplyToFirestore = async (txId: string, reply: Reply) => {
  // 0. Cek Blacklist
  const isBanned = await checkIfUserIsBlacklisted(reply.authorId);
  if (isBanned) {
    throw new Error('Identitas sinyal Anda telah diblokir karena pelanggaran protokol SORSIDE.');
  }

  // 1. Cek Cooldown / Rate Limit (15 detik)
  const cd = checkFrequencyCooldown(reply.authorId);
  if (!cd.allowed) {
    throw new Error(`Harap tunggu ${cd.remainingSeconds} detik sebelum membalas berikutnya.`);
  }

  // 2. Validasi Karakter & Filter Spam/Judi/Links
  const val = validateFrequencyContent(reply.content);
  if (!val.isValid) {
    throw new Error(val.error || 'Balasan tidak memenuhi kriteria sinyal.');
  }

  const txRef = doc(db, TRANSMISSIONS_COLLECTION, txId);

  // 3. Cek Batas Maksimal Resonansi (200 balasan)
  const txDoc = await getDoc(txRef);
  if (txDoc.exists()) {
    const data = txDoc.data();
    const currentReplies = Array.isArray(data.replies) ? data.replies.length : 0;
    const maxVal = validateMaxReplies(currentReplies);
    if (!maxVal.allowed) {
      throw new Error(maxVal.error);
    }
  }

  await updateDoc(txRef, {
    replies: arrayUnion({
      id: reply.id,
      authorId: reply.authorId,
      authorAlias: reply.authorAlias || null,
      content: val.cleanContent,
      timestamp: reply.timestamp,
      createdAt: Date.now(), // Gunakan millisecond timestamp agar aman disimpan dalam array Firestore
      replyToId: reply.replyToId || null,
      replyToName: reply.replyToName || null
    })
  });

  // Catat waktu post untuk rate limiting
  recordFrequencyPostTime(reply.authorId);
};

/**
 * Menghapus transmisi dari Firestore.
 */
export const deleteTransmissionFromFirestore = async (txId: string) => {
  const txRef = doc(db, TRANSMISSIONS_COLLECTION, txId);
  await deleteDoc(txRef);
};

/**
 * Pembersihan Rutin "ID Hantu":
 * Hapus identitas di Firestore yang:
 * 1. Memiliki 0 sinyal/postingan dan 0 balasan di seluruh transmisi.
 * 2. Tidak aktif / tidak diperbarui lebih dari 30 hari (30 hari * 24 jam * 3600s * 1000ms).
 */
export const cleanupGhostIdentities = async (transmissions: Transmission[]) => {
  try {
    // Kumpulkan seluruh authorId & replierId yang memiliki minimal 1 postingan/balasan
    const activeUserIds = new Set<string>();
    transmissions.forEach((tx) => {
      if (tx.authorId) activeUserIds.add(tx.authorId);
      if (Array.isArray(tx.replies)) {
        tx.replies.forEach((r) => {
          if (r.authorId) activeUserIds.add(r.authorId);
        });
      }
    });

    const snapshot = await getDocs(collection(db, IDENTITIES_COLLECTION));
    const now = Date.now();
    const INACTIVE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari

    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = data.id;
      if (!userId) return;

      // Jika user punya minimal 1 postingan/balasan, JANGAN dihapus (aman)
      if (activeUserIds.has(userId)) return;

      // Tentukan waktu aktivitas terakhir
      let lastActiveMs = 0;
      if (data.updatedAt && typeof data.updatedAt.toMillis === 'function') {
        lastActiveMs = data.updatedAt.toMillis();
      } else if (typeof data.updatedAt === 'number') {
        lastActiveMs = data.updatedAt;
      } else if (typeof data.lastActiveAt === 'number') {
        lastActiveMs = data.lastActiveAt;
      }

      // Jika tidak ada data waktu atau waktu tidak aktif > 30 hari
      const isInactive = !lastActiveMs || (now - lastActiveMs > INACTIVE_THRESHOLD_MS);

      if (isInactive) {
        deletePromises.push(deleteDoc(doc(db, IDENTITIES_COLLECTION, docSnap.id)));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (err) {
    console.warn('[Ghost Cleanup] Warning:', err);
  }
};

/**
 * Mendengarkan laporan secara real-time dari Firestore.
 */
export const subscribeReports = (callback: (reports: ReportItem[]) => void) => {
  try {
    const q = collection(db, REPORTS_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const items: ReportItem[] = [];
      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          targetType: d.targetType || 'transmission',
          targetId: d.targetId || '',
          transmissionId: d.transmissionId || d.targetId || '',
          targetAuthorId: d.targetAuthorId || '',
          targetAuthorAlias: d.targetAuthorAlias || undefined,
          targetContent: d.targetContent || '',
          reporterId: d.reporterId || '',
          reason: d.reason || 'Lainnya',
          note: d.note || undefined,
          createdAt: d.createdAt || Date.now(),
          status: d.status || 'pending'
        });
      });
      // Urutkan laporan terbaru di atas
      items.sort((a, b) => b.createdAt - a.createdAt);
      callback(items);
    }, (err) => {
      console.warn('[Frequency] Reports subscription error:', err);
    });
  } catch (err) {
    console.warn('[Frequency] Subscribe reports warning:', err);
    return () => {};
  }
};

/**
 * Mendengarkan daftar user terblokir (blacklists) secara real-time.
 */
export const subscribeBlacklists = (callback: (blacklists: BlacklistItem[]) => void) => {
  try {
    const q = collection(db, BLACKLISTS_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const items: BlacklistItem[] = [];
      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          userId: docSnap.id || d.userId,
          reason: d.reason || 'Pelanggaran Protokol',
          bannedAt: d.bannedAt || Date.now(),
          bannedBy: d.bannedBy || 'sorside-origin'
        });
      });
      callback(items);
    }, (err) => {
      console.warn('[Frequency] Blacklists subscription error:', err);
    });
  } catch (err) {
    console.warn('[Frequency] Subscribe blacklists warning:', err);
    return () => {};
  }
};

/**
 * Mendengarkan daftar ID yang memiliki lencana "✦ sorside" (Origin IDs) secara real-time.
 */
export const subscribeOriginIds = (callback: (originIds: string[]) => void) => {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'origin_ids');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.originIds)) {
          callback(data.originIds);
          return;
        }
      }
      callback([]);
    }, (err) => {
      console.warn('[Frequency] Origin IDs subscription error:', err);
    });
  } catch (err) {
    console.warn('[Frequency] Subscribe origin IDs warning:', err);
    return () => {};
  }
};

/**
 * Menyelesaikan atau mengubah status laporan.
 */
export const resolveReportInFirestore = async (reportId: string, status: 'resolved' | 'dismissed' = 'resolved') => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(reportRef, {
    status,
    updatedAt: Date.now()
  });
};

/**
 * Menghapus dokumen laporan dari Firestore.
 */
export const deleteReportFromFirestore = async (reportId: string) => {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await deleteDoc(reportRef);
};

/**
 * Memblokir User ID (menambahkan ke koleksi blacklists).
 */
export const banUserInFirestore = async (
  userId: string, 
  reason: string = 'Pelanggaran protokol SORSIDE', 
  bannedBy: string = 'sorside-origin'
) => {
  if (!userId) return;
  const banRef = doc(db, BLACKLISTS_COLLECTION, userId);
  await setDoc(banRef, {
    userId,
    reason,
    bannedAt: Date.now(),
    bannedBy
  });
};

/**
 * Membuka blokir User ID (menghapus dari koleksi blacklists).
 */
export const unbanUserInFirestore = async (userId: string) => {
  if (!userId) return;
  const banRef = doc(db, BLACKLISTS_COLLECTION, userId);
  await deleteDoc(banRef);
};

/**
 * Menghapus balasan spesifik dari suatu transmisi di Firestore.
 */
export const deleteReplyFromFirestore = async (txId: string, replyId: string) => {
  const txRef = doc(db, TRANSMISSIONS_COLLECTION, txId);
  const txDoc = await getDoc(txRef);
  if (txDoc.exists()) {
    const data = txDoc.data();
    if (Array.isArray(data.replies)) {
      const updatedReplies = data.replies.filter((r: any) => r.id !== replyId);
      await updateDoc(txRef, { replies: updatedReplies });
    }
  }
};

/**
 * Mengatur atau mengubah status Origin ID ("✦ sorside") untuk suatu User ID di Firestore.
 */
export const toggleOriginIdInFirestore = async (userId: string, enable: boolean) => {
  if (!userId) return;
  const configRef = doc(db, CONFIG_COLLECTION, 'origin_ids');
  const docSnap = await getDoc(configRef);
  let currentOriginIds: string[] = [];
  if (docSnap.exists() && Array.isArray(docSnap.data().originIds)) {
    currentOriginIds = docSnap.data().originIds;
  }

  let updatedList: string[];
  if (enable) {
    if (!currentOriginIds.includes(userId)) {
      updatedList = [...currentOriginIds, userId];
    } else {
      updatedList = currentOriginIds;
    }
  } else {
    updatedList = currentOriginIds.filter((id) => id !== userId);
  }

  await setDoc(configRef, {
    originIds: updatedList,
    updatedAt: Date.now()
  });
};
