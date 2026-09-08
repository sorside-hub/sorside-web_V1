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

const TRANSMISSIONS_COLLECTION = 'transmissions';
const IDENTITIES_COLLECTION = 'frequency_identities';

export interface UserIdentity {
  id: string;
  key: string;
  alias?: string;
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
 * Mendengarkan data identitas dan pemetaan alias secara real-time dari Firestore.
 */
export const subscribeIdentities = (
  callback: (identitiesMap: Record<string, string>) => void
) => {
  try {
    const q = collection(db, IDENTITIES_COLLECTION);
    return onSnapshot(
      q,
      (snapshot) => {
        const map: Record<string, string> = {};
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
      return null;
    }
    const data = docSnap.data();
    return {
      id: data.id || `freq-${Math.floor(100 + Math.random() * 900)}`,
      key: data.key || normalizedKey,
      alias: data.alias || ''
    };
  } catch (err) {
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
        const list: Transmission[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          
          // Hitung waktu transmisi dinamis dari data.createdAt jika ada
          const calculatedTimestamp = data.createdAt 
            ? formatRelativeTime(data.createdAt, data.timestamp || 'Baru saja')
            : (data.timestamp || 'Baru saja');

          // Hitung waktu balasan dinamis jika punya raw timestamp
          const replies: Reply[] = Array.isArray(data.replies) 
            ? data.replies.map((r: any) => ({
                id: r.id || `rep-${Math.random()}`,
                authorId: r.authorId || 'freq-000',
                authorAlias: r.authorAlias || undefined,
                content: r.content || '',
                timestamp: r.createdAt 
                  ? formatRelativeTime(r.createdAt, r.timestamp || 'Baru saja')
                  : formatRelativeTime(r.timestamp, r.timestamp || 'Baru saja'),
                createdAt: r.createdAt || null,
                replyToId: r.replyToId || undefined,
                replyToName: r.replyToName || undefined
              }))
            : [];

          return {
            id: docSnap.id,
            authorId: data.authorId || 'freq-000',
            authorAlias: data.authorAlias || undefined,
            content: data.content || '',
            tag: data.tag || undefined,
            timestamp: calculatedTimestamp,
            createdAt: data.createdAt || null,
            replies
          };
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
 * Mengirimkan transmisi cerita baru ke Firestore.
 */
export const createTransmissionToFirestore = async (newTx: Omit<Transmission, 'replies'>) => {
  const txRef = doc(collection(db, TRANSMISSIONS_COLLECTION), newTx.id);
  await setDoc(txRef, {
    authorId: newTx.authorId,
    authorAlias: newTx.authorAlias || null,
    content: newTx.content,
    tag: newTx.tag || null,
    timestamp: newTx.timestamp,
    createdAt: serverTimestamp(),
    replies: []
  });
};

/**
 * Menambahkan balasan (resonansi) ke suatu transmisi di Firestore.
 */
export const addReplyToFirestore = async (txId: string, reply: Reply) => {
  const txRef = doc(db, TRANSMISSIONS_COLLECTION, txId);
  await updateDoc(txRef, {
    replies: arrayUnion({
      id: reply.id,
      authorId: reply.authorId,
      authorAlias: reply.authorAlias || null,
      content: reply.content,
      timestamp: reply.timestamp,
      createdAt: Date.now(), // Gunakan millisecond timestamp agar aman disimpan dalam array Firestore
      replyToId: reply.replyToId || null,
      replyToName: reply.replyToName || null
    })
  });
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
