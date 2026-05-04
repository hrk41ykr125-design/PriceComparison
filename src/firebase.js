import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// History operations
export const saveComparison = async (data) => {
  try {
    await addDoc(collection(db, 'history'), {
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error saving history:", error);
    throw error;
  }
};

export const getHistory = (callback) => {
  const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(history);
  });
};

export const deleteHistoryItem = async (id) => {
  await deleteDoc(doc(db, 'history', id));
};
