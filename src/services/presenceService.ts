import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

const PRESENCE_COLLECTION = 'presence';

export const updatePresence = async (userId: string) => {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
  await setDoc(presenceRef, {
    lastSeen: serverTimestamp(),
  }, { merge: true });
};

export const subscribeToPresence = (userIds: string[], callback: (onlineUsers: Set<string>) => void) => {
  if (userIds.length === 0) {
    callback(new Set());
    return () => {};
  }

  // Firestore has a limit of 30 items for 'in' queries
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30));
  }

  const unsubscribes = chunks.map(chunk => {
    const q = query(collection(db, PRESENCE_COLLECTION), where('__name__', 'in', chunk));
    return onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const online = new Set<string>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.lastSeen) {
          const lastSeen = data.lastSeen.toDate().getTime();
          // Consider online if seen in the last 5 minutes
          if (now - lastSeen < 5 * 60 * 1000) {
            online.add(doc.id);
          }
        }
      });
      
      callback(online);
    });
  });

  return () => unsubscribes.forEach(unsub => unsub());
};
