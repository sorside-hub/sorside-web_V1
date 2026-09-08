import { 
  collection, 
  doc, 
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
                authorId: r.authorId || 'ss-000',
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
            authorId: data.authorId || 'ss-000',
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
