import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { subscribeToTeamForUser } from '../services/teamService';
import type { Team } from '../types';

export interface TeamContextType {
  team: Team | null;
  teams: Team[];
  isLoadingTeam: boolean;
  isLeader: boolean;
  setActiveTeamId: (teamId: string) => void;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setTeams([]);
      setTeam(null);
      setIsLoadingTeam(false);
      return;
    }

    setIsLoadingTeam(true);
    const unsubscribe = subscribeToTeamForUser(userId, (allTeams) => {
      setTeams(allTeams);
      
      const preferredId = localStorage.getItem(`activeTeam_${userId}`);
      let selectedTeam = allTeams.find(t => t.id === preferredId);
      
      // If no preferred or preferred not found, prioritize leader teams
      if (!selectedTeam) {
        selectedTeam = allTeams.find(t => t.leaderId === userId) || allTeams[0];
      }
      
      setTeam(selectedTeam || null);
      setIsLoadingTeam(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  const setActiveTeamId = (teamId: string) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      localStorage.setItem(`activeTeam_${userId}`, teamId);
      const selected = teams.find(t => t.id === teamId);
      if (selected) setTeam(selected);
    }
  };

  const isLeader = team?.leaderId === auth.currentUser?.uid;

  return (
    <TeamContext.Provider value={{ team, teams, isLoadingTeam, isLeader, setActiveTeamId }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = (): TeamContextType => {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
};
