import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const STORAGE_KEY = 'pricecomparison.history.v1';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;

const readLocalHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.warn('Failed to read local history:', error);
    return [];
  }
};

const writeLocalHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to write local history:', error);
  }
};

const sortHistory = (history) => (
  [...history].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
);

const getHistorySignature = (item) => JSON.stringify({
  title: item.title || '',
  itemA: item.itemA || null,
  itemB: item.itemB || null,
  winner: item.winner || '',
  createdAt: item.createdAt || '',
});

const getHistoryKey = (item) => (
  item.clientId || item.remoteId || (item.id?.startsWith('local-') ? getHistorySignature(item) : item.id)
);

const mergeHistory = (localHistory, remoteHistory) => {
  const itemsByKey = new Map();

  [...remoteHistory, ...localHistory].forEach((item) => {
    const key = getHistoryKey(item);
    if (!itemsByKey.has(key)) {
      itemsByKey.set(key, item);
    }
  });

  return sortHistory([...itemsByKey.values()]);
};

export const saveComparison = async (data) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const localItem = {
    ...data,
    id: `local-${Date.now()}`,
    clientId,
    createdAt: new Date().toISOString(),
  };

  writeLocalHistory(sortHistory([localItem, ...readLocalHistory()]));

  if (!db) {
    return localItem;
  }

  try {
    const docRef = await addDoc(collection(db, 'history'), {
      ...data,
      clientId,
      createdAt: localItem.createdAt,
      timestamp: new Date(),
    });

    const updatedHistory = readLocalHistory().map((item) => (
      item.id === localItem.id ? { ...item, remoteId: docRef.id } : item
    ));
    writeLocalHistory(sortHistory(updatedHistory));

    return { ...localItem, remoteId: docRef.id };
  } catch (error) {
    console.error('Error saving remote history:', error);
    return localItem;
  }
};

export const getHistory = (callback) => {
  callback(readLocalHistory());

  if (!db) {
    return () => {};
  }

  const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const remoteHistory = snapshot.docs.map((historyDoc) => {
        const data = historyDoc.data();
        return {
          ...data,
          id: historyDoc.id,
          remoteId: historyDoc.id,
          clientId: data.clientId,
          createdAt: data.createdAt || data.timestamp?.toDate?.().toISOString?.() || new Date().toISOString(),
        };
      });

      const mergedHistory = mergeHistory(readLocalHistory(), remoteHistory);
      writeLocalHistory(mergedHistory);
      callback(mergedHistory);
    },
    (error) => {
      console.error('Error loading remote history:', error);
      callback(readLocalHistory());
    },
  );
};

export const deleteHistoryItem = async (id) => {
  const item = readLocalHistory().find((historyItem) => historyItem.id === id);
  writeLocalHistory(readLocalHistory().filter((historyItem) => historyItem.id !== id));

  const remoteId = item?.remoteId || (id.startsWith('local-') ? null : id);
  if (db && remoteId) {
    await deleteDoc(doc(db, 'history', remoteId));
  }
};
