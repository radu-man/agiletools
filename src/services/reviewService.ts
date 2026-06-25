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
  arrayRemove,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ReviewBoard, ReviewCard } from '../types';

const BOARDS_COLLECTION = 'review_boards';
const CARDS_COLLECTION = 'review_cards';

export const createReviewBoard = async (title: string, columnNames: string[], userId: string, teamId?: string) => {
  const boardData: Record<string, any> = {
    title,
    columnNames,
    createdBy: userId,
    createdAt: serverTimestamp(),
  };
  if (teamId) boardData.teamId = teamId;
  const docRef = await addDoc(collection(db, BOARDS_COLLECTION), boardData);
  return docRef.id;
};

export const subscribeToReviewBoards = (teamId: string | null, callback: (boards: ReviewBoard[]) => void) => {
  const q = teamId
    ? query(collection(db, BOARDS_COLLECTION), where('teamId', '==', teamId), orderBy('createdAt', 'desc'))
    : query(collection(db, BOARDS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewBoard)));
  });
};

export const subscribeToBoard = (
  boardId: string, 
  callback: (board: ReviewBoard | null) => void,
  onError?: (err: any) => void
) => {
  return onSnapshot(doc(db, BOARDS_COLLECTION, boardId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as ReviewBoard);
    } else {
      callback(null);
    }
  }, onError);
};

export const addReviewCard = async (boardId: string, columnId: number, text: string, userId: string, userName: string) => {
  const cardData = {
    boardId,
    columnId,
    text,
    authorId: userId,
    authorName: userName,
    votes: [],
    acknowledged: false,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, CARDS_COLLECTION), cardData);
};

export const subscribeToCards = (
  boardId: string, 
  callback: (cards: ReviewCard[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(
    collection(db, CARDS_COLLECTION), 
    where('boardId', '==', boardId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReviewCard)));
  }, (error) => {
    console.error("Error subscribing to cards:", error);
    if (onError) onError(error);
  });
};

export const toggleVote = async (cardId: string, userId: string, hasVoted: boolean) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, {
    votes: hasVoted ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const toggleAcknowledged = async (cardId: string, acknowledged: boolean) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, { acknowledged });
};

export const updateBoardColumns = async (boardId: string, columnNames: string[]) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { columnNames });
};

export const deleteReviewBoard = async (boardId: string) => {
  await deleteDoc(doc(db, BOARDS_COLLECTION, boardId));
};

export const updateReviewBoardTitle = async (boardId: string, title: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { title });
};
