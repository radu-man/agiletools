import {
  collection,
  addDoc,
  query,
  onSnapshot,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Team } from "../types";

const TEAMS_COLLECTION = "teams";

export const createTeam = async (
  name: string,
  leaderId: string,
  leaderName: string,
): Promise<string> => {
  const teamData = {
    name,
    leaderId,
    members: [leaderId],
    memberNames: {
      [leaderId]: leaderName,
    },
    inviteToken: crypto.randomUUID(),
    inviteEnabled: true,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, TEAMS_COLLECTION), teamData);
  return docRef.id;
};

export const subscribeToTeamForUser = (
  userId: string,
  callback: (teams: Team[]) => void,
) => {
  const q = query(
    collection(db, TEAMS_COLLECTION),
    where("members", "array-contains", userId),
  );
  return onSnapshot(q, (snapshot) => {
    const teams = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Team,
    );
    callback(teams);
  });
};

export const getTeamByToken = async (token: string): Promise<Team | null> => {
  try {
    const q = query(
      collection(db, TEAMS_COLLECTION),
      where("inviteToken", "==", token),
      where("inviteEnabled", "==", true),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("No team found for token:", token);
      return null;
    }
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Team;
  } catch (error) {
    console.error("Error in getTeamByToken:", error);
    throw error;
  }
};

export const joinTeam = async (
  teamId: string,
  userId: string,
  displayName: string,
): Promise<void> => {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    members: arrayUnion(userId),
    [`memberNames.${userId}`]: displayName,
  });
};

export const removeMember = async (
  teamId: string,
  userId: string,
): Promise<void> => {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, {
    members: arrayRemove(userId),
    [`memberNames.${userId}`]: deleteField(),
  });
};

export const regenerateInviteToken = async (
  teamId: string,
): Promise<string> => {
  const newToken = crypto.randomUUID();
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, { inviteToken: newToken });
  return newToken;
};

export const setInviteEnabled = async (
  teamId: string,
  enabled: boolean,
): Promise<void> => {
  const teamRef = doc(db, TEAMS_COLLECTION, teamId);
  await updateDoc(teamRef, { inviteEnabled: enabled });
};

export const updateMemberNameInAllTeams = async (
  userId: string,
  newName: string,
): Promise<void> => {
  const queryRef = query(
    collection(db, TEAMS_COLLECTION),
    where("members", "array-contains", userId),
  );
  const snapshot = await getDocs(queryRef);

  const promises = snapshot.docs.map((teamDoc) => {
    const teamRef = doc(db, TEAMS_COLLECTION, teamDoc.id);
    return updateDoc(teamRef, {
      [`memberNames.${userId}`]: newName,
    });
  });

  await Promise.all(promises);
};
