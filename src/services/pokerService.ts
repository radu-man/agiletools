import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  where,
  deleteDoc
} from 'firebase/firestore';
import type { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { PokerSession, PokerItem } from '../types';

const POKER_SESSIONS_COLLECTION = 'poker_sessions';

export const createPokerSession = async (title: string, userId: string, teamId?: string) => {
  try {
    const sessionData: Record<string, any> = {
      title,
      createdAt: serverTimestamp(),
      participants: [userId],
      activeItemId: null,
    };
    if (teamId) sessionData.teamId = teamId;
    const docRef = await addDoc(collection(db, POKER_SESSIONS_COLLECTION), sessionData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating poker session:", error);
    throw error;
  }
};

export const subscribeToPokerSessions = (teamId: string | null, callback: (sessions: PokerSession[]) => void) => {
  const q = teamId
    ? query(collection(db, POKER_SESSIONS_COLLECTION), where('teamId', '==', teamId), orderBy('createdAt', 'desc'))
    : query(collection(db, POKER_SESSIONS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PokerSession));
    callback(sessions);
  });
};

export const subscribeToSession = (
  sessionId: string, 
  callback: (session: PokerSession | null) => void,
  onError?: (err: any) => void
) => {
  return onSnapshot(doc(db, POKER_SESSIONS_COLLECTION, sessionId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as PokerSession);
    } else {
      callback(null);
    }
  }, onError);
};

export const addParticipant = async (sessionId: string, userId: string) => {
  const sessionRef = doc(db, POKER_SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, {
    participants: arrayUnion(userId)
  });
};

export const addPokerItem = async (sessionId: string, title: string) => {
  const itemsRef = collection(db, POKER_SESSIONS_COLLECTION, sessionId, 'items');
  await addDoc(itemsRef, {
    title,
    status: 'pending',
    votes: {},
    createdAt: serverTimestamp()
  });
};

export const subscribeToItems = (
  sessionId: string, 
  callback: (items: PokerItem[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(
    collection(db, POKER_SESSIONS_COLLECTION, sessionId, 'items'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PokerItem));
    callback(items);
  }, onError);
};

export const castVote = async (sessionId: string, itemId: string, userId: string, vote: string | number) => {
  const itemRef = doc(db, POKER_SESSIONS_COLLECTION, sessionId, 'items', itemId);
  await updateDoc(itemRef, {
    [`votes.${userId}`]: vote
  });
};

export const updateItemStatus = async (sessionId: string, itemId: string, status: PokerItem['status']) => {
  const itemRef = doc(db, POKER_SESSIONS_COLLECTION, sessionId, 'items', itemId);
  await updateDoc(itemRef, { status });
};

export const deletePokerSession = async (sessionId: string) => {
  await deleteDoc(doc(db, POKER_SESSIONS_COLLECTION, sessionId));
};

export const updatePokerSessionTitle = async (sessionId: string, title: string) => {
  const sessionRef = doc(db, POKER_SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, { title });
};
