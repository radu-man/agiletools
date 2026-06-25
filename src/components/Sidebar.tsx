import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';
import {
  LayoutDashboard,
  LogOut,
  Plus,
  PlayCircle,
  Star,
  Settings
} from 'lucide-react';
import { subscribeToPokerSessions, createPokerSession } from '../services/pokerService';
import { subscribeToReviewBoards, createReviewBoard } from '../services/reviewService';
import { subscribeToKnowledgeBoards, createKnowledgeBoard } from '../services/knowledgeService';
import { useTeam } from '../contexts/TeamContext';
import type { PokerSession, ReviewBoard, KnowledgeBoard } from '../types';
import {
  Button,
  Input,
  Label,
  ModalOverlay,
  ModalContainer,
  Flex,
  Typography
} from './styled';

const SidebarContainer = styled.div`
  width: 240px;
  background-color: ${props => props.theme.sidebarBg};
  border-right: 1px solid ${props => props.theme.border};
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  box-sizing: border-box;
  transition: all 0.3s ease;
`;

const SidebarLogo = styled.div`
  padding: 0 1.5rem 2.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.theme.primary};
  letter-spacing: -0.025em;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StyledNavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: ${props => props.$active ? props.theme.primary : props.theme.sidebarText};
  background-color: ${props => props.$active ? props.theme.sidebarActive : 'transparent'};
  font-weight: ${props => props.$active ? 600 : 500};
  font-size: 0.95rem;
  transition: all 0.2s;
  border-right: 3px solid ${props => props.$active ? props.theme.primary : 'transparent'};

  &:hover {
    background-color: ${props => props.theme.sidebarActive};
    color: ${props => props.theme.primary};
  }
`;

const ScrollableSection = styled.div`
  padding: 1.5rem 0 0.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SectionHeader = styled.div`
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const SubNavLink = styled(StyledNavLink)`
  padding: 0.5rem 1.5rem;
  font-weight: ${props => props.$active ? 600 : 400};
  font-size: 0.9rem;
`;

const TruncatedText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background-color: transparent;
  border: none;
  color: ${props => props.theme.sidebarText};
  cursor: pointer;
  margin-top: auto;
  text-align: left;
  width: 100%;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    background-color: ${props => props.theme.sidebarActive};
  }
`;

const TeamSwitcher = styled.div`
  padding: 0 1rem 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const TeamSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.textPrimary};
  border: 1px solid ${props => props.theme.border};
  font-size: 0.85rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { team, teams, isLeader, setActiveTeamId } = useTeam();

  const [sessions, setSessions] = useState<PokerSession[]>([]);
  const [boards, setBoards] = useState<ReviewBoard[]>([]);
  const [knowledgeBoards, setKnowledgeBoards] = useState<KnowledgeBoard[]>([]);
  const [isPokerModalOpen, setIsPokerModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!team) {
      setSessions([]);
      setBoards([]);
      setKnowledgeBoards([]);
      return;
    }
    const unsubPoker = subscribeToPokerSessions(team.id, setSessions);
    const unsubReview = subscribeToReviewBoards(team.id, setBoards);
    const unsubKnowledge = subscribeToKnowledgeBoards(team.id, setKnowledgeBoards);
    return () => {
      unsubPoker();
      unsubReview();
      unsubKnowledge();
    };
  }, [team?.id]);

  const handleCreatePokerSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !auth.currentUser) return;

    try {
      const sessionId = await createPokerSession(newTitle, auth.currentUser.uid, team?.id);
      setIsPokerModalOpen(false);
      setNewTitle('');
      navigate(`/poker/${sessionId}`);
    } catch (error) {
      alert("Failed to create session.");
    }
  };

  const handleCreateReviewBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !auth.currentUser) return;

    try {
      const boardId = await createReviewBoard(
        newTitle,
        ['Went Well', 'To Improve', 'Action Items'],
        auth.currentUser.uid,
        team?.id
      );
      setIsReviewModalOpen(false);
      setNewTitle('');
      navigate(`/review/${boardId}`);
    } catch (error) {
      alert("Failed to create review board.");
    }
  };

  const handleCreateKnowledgeBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !auth.currentUser) return;

    try {
      const boardId = await createKnowledgeBoard(newTitle, auth.currentUser.uid, team?.id);
      setIsKnowledgeModalOpen(false);
      setNewTitle('');
      navigate(`/knowledge/${boardId}`);
    } catch (error) {
      alert("Failed to create knowledge board.");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  const isModalOpen = isPokerModalOpen || isReviewModalOpen || isKnowledgeModalOpen;

  return (
    <SidebarContainer>
      <SidebarLogo>
        AgileTools
      </SidebarLogo>

      {teams.length > 1 && (
        <TeamSwitcher>
          <Label style={{ fontSize: '0.65rem', marginBottom: '0.25rem', display: 'block' }}>ACTIVE TEAM</Label>
          <TeamSelect 
            value={team?.id || ''} 
            onChange={(e) => setActiveTeamId(e.target.value)}
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </TeamSelect>
        </TeamSwitcher>
      )}

      <NavList>
        {navItems.map((item) => (
          <StyledNavLink
            key={item.path}
            to={item.path}
            $active={location.pathname === item.path}
          >
            <item.icon size={20} />
            {item.name}
          </StyledNavLink>
        ))}
        {isLeader && team && (
          <StyledNavLink
            to="/team/settings"
            $active={location.pathname === '/team/settings'}
          >
            <Settings size={20} />
            Team Settings
          </StyledNavLink>
        )}
      </NavList>

      <ScrollableSection>
        {/* Planning Section */}
        <div>
          <SectionHeader>
            <SectionTitle>Planning</SectionTitle>
            {team && (
              <AddButton onClick={() => { setIsPokerModalOpen(true); setNewTitle(''); }}>
                <Plus size={16} />
              </AddButton>
            )}
          </SectionHeader>
          <NavList>
            {sessions.map(session => (
              <SubNavLink
                key={session.id}
                to={`/poker/${session.id}`}
                $active={location.pathname === `/poker/${session.id}`}
              >
                <PlayCircle size={16} />
                <TruncatedText>{session.title}</TruncatedText>
              </SubNavLink>
            ))}
          </NavList>
        </div>

        {/* Review Section */}
        <div>
          <SectionHeader>
            <SectionTitle>Review</SectionTitle>
            {team && (
              <AddButton onClick={() => { setIsReviewModalOpen(true); setNewTitle(''); }}>
                <Plus size={16} />
              </AddButton>
            )}
          </SectionHeader>
          <NavList>
            {boards.map(board => (
              <SubNavLink
                key={board.id}
                to={`/review/${board.id}`}
                $active={location.pathname === `/review/${board.id}`}
              >
                <LayoutDashboard size={16} />
                <TruncatedText>{board.title}</TruncatedText>
              </SubNavLink>
            ))}
          </NavList>
        </div>

        {/* Knowledge Section */}
        <div>
          <SectionHeader>
            <SectionTitle>Knowledge</SectionTitle>
            {team && (
              <AddButton onClick={() => { setIsKnowledgeModalOpen(true); setNewTitle(''); }}>
                <Plus size={16} />
              </AddButton>
            )}
          </SectionHeader>
          <NavList>
            {knowledgeBoards.map(board => (
              <SubNavLink
                key={board.id}
                to={`/knowledge/${board.id}`}
                $active={location.pathname === `/knowledge/${board.id}`}
              >
                <Star size={16} />
                <TruncatedText>{board.title}</TruncatedText>
              </SubNavLink>
            ))}
          </NavList>
        </div>
      </ScrollableSection>

      <LogoutButton onClick={handleLogout}>
        <LogOut size={20} />
        Logout
      </LogoutButton>

      {isModalOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <form 
              onSubmit={
                isPokerModalOpen ? handleCreatePokerSession : 
                isReviewModalOpen ? handleCreateReviewBoard : 
                handleCreateKnowledgeBoard
              }
            >
              <Typography as="h2" $variant="h2" style={{ marginTop: 0, marginBottom: '1.5rem', display: 'block' }}>
                {isPokerModalOpen ? 'New Planning Session' : isReviewModalOpen ? 'New Review Board' : 'New Knowledge Board'}
              </Typography>
              <div style={{ marginBottom: '2rem' }}>
                <Label>TITLE</Label>
                <Input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    isPokerModalOpen ? "e.g., Sprint 24 Planning" : 
                    isReviewModalOpen ? "e.g., Sprint 24 Retrospective" : 
                    "e.g., Team Expertise Map"
                  }
                  required
                />
              </div>
              <Flex $gap="1rem" $justify="flex-end">
                <Button 
                  type="button"
                  $variant="secondary"
                  onClick={() => { setIsPokerModalOpen(false); setIsReviewModalOpen(false); setIsKnowledgeModalOpen(false); }}
                >
                  Cancel
                </Button>
                <Button type="submit" $variant="primary">
                  Create
                </Button>
              </Flex>
            </form>
          </ModalContainer>
        </ModalOverlay>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
