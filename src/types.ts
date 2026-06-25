export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
  memberNames: Record<string, string>;
  inviteToken: string;
  inviteEnabled: boolean;
  createdAt: any;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface PokerItem {
  id: string;
  title: string;
  description?: string;
  estimate?: number;
  votes: Record<string, number | string>; // userId -> vote (e.g., 1, 2, 3, 5, 8, '?', 'coffee')
  status: 'pending' | 'voting' | 'revealed' | 'finished';
}

export interface PokerSession {
  id: string;
  sprintId?: string;
  title: string;
  createdAt: string;
  activeItemId?: string;
  participants: string[];
  teamId?: string;
}

export interface ReviewBoard {
  id: string;
  title: string;
  createdAt: any;
  createdBy: string;
  columnNames: string[];
  teamId?: string;
}

export interface ReviewCard {
  id: string;
  boardId: string;
  columnId: number; // 0, 1, or 2
  text: string;
  authorId: string;
  authorName: string;
  votes: string[]; // array of userIds
  acknowledged?: boolean;
  createdAt: any;
}

export interface KnowledgeBoard {
  id: string;
  title: string;
  areas: string[];
  createdAt: any;
  createdBy: string;
  teamId?: string;
}

export interface MemberKnowledge {
  id: string;
  boardId: string;
  userId: string;
  userName: string;
  ratings: Record<string, number>; // areaName -> rating (1-5)
}
