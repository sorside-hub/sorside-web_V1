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
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transmission[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorId: data.authorId || 'ss-000',
            authorAlias: data.authorAlias || undefined,
            content: data.content || '',
            tag: data.tag || undefined,
            timestamp: data.timestamp || 'Baru saja',
            replies: Array.isArray(data.replies) ? data.replies : []
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
    replies: arrayUnion(reply)
  });
};

/**
 * Menghapus transmisi dari Firestore.
 */
export const deleteTransmissionFromFirestore = async (txId: string) => {
  const txRef = doc(db, TRANSMISSIONS_COLLECTION, txId);
  await deleteDoc(txRef);
};
