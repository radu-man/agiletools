import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { KnowledgeBoard, MemberKnowledge } from '../types';

const BOARDS_COLLECTION = 'knowledge_boards';
const MEMBERS_COLLECTION = 'member_knowledge';

export const createKnowledgeBoard = async (title: string, userId: string, teamId?: string) => {
  const boardData: Record<string, any> = {
    title,
    areas: ['Frontend', 'Backend', 'DevOps', 'QA'],
    createdBy: userId,
    createdAt: serverTimestamp(),
  };
  if (teamId) boardData.teamId = teamId;
  const docRef = await addDoc(collection(db, BOARDS_COLLECTION), boardData);
  return docRef.id;
};

export const subscribeToKnowledgeBoards = (teamId: string | null, callback: (boards: KnowledgeBoard[]) => void) => {
  const q = teamId
    ? query(collection(db, BOARDS_COLLECTION), where('teamId', '==', teamId), orderBy('createdAt', 'desc'))
    : query(collection(db, BOARDS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeBoard)));
  });
};

export const subscribeToKnowledgeBoard = (
  boardId: string, 
  callback: (board: KnowledgeBoard | null) => void,
  onError?: (err: any) => void
) => {
  return onSnapshot(doc(db, BOARDS_COLLECTION, boardId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as KnowledgeBoard);
    } else {
      callback(null);
    }
  }, onError);
};

export const addMemberToBoard = async (boardId: string, userName: string) => {
  const memberData = {
    boardId,
    userName,
    ratings: {},
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, MEMBERS_COLLECTION), memberData);
};

export const subscribeToMembers = (
  boardId: string, 
  callback: (members: MemberKnowledge[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(collection(db, MEMBERS_COLLECTION), where('boardId', '==', boardId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MemberKnowledge)));
  }, onError);
};

export const updateMemberRating = async (memberId: string, area: string, rating: number) => {
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  await updateDoc(memberRef, {
    [`ratings.${area}`]: rating
  });
};

export const updateBoardAreas = async (boardId: string, areas: string[]) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { areas });
};

export const deleteMember = async (memberId: string) => {
  await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
};

export const deleteKnowledgeBoard = async (boardId: string) => {
  await deleteDoc(doc(db, BOARDS_COLLECTION, boardId));
};

export const updateKnowledgeBoardTitle = async (boardId: string, title: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { title });
};
