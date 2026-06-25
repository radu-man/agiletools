import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  RotateCcw,
  CheckCircle2,
  Users as UsersIcon,
  Trash2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { useTeam } from '../contexts/TeamContext';
import type { PokerSession, PokerItem } from '../types';
import { 
  subscribeToSession, 
  subscribeToItems, 
  addParticipant, 
  addPokerItem, 
  castVote, 
  updateItemStatus,
  deletePokerSession,
  updatePokerSessionTitle
} from '../services/pokerService';
import { Flex, Typography, Button, Input, Card, ModalOverlay, ModalContainer } from './styled';

const RoomContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  height: calc(100vh - 128px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RoomHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.textPrimary};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
    background-color: ${props => props.theme.sidebarActive};
  }
`;

const VotingArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding: 0.5rem;
`;

const VotingTable = styled(Card)`
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const TableInfo = styled.div`
  text-align: center;
`;

const ParticipantsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  min-height: 120px;
`;

const ParticipantVoteCard = styled.div<{ $hasVoted: boolean; $isRevealed: boolean }>`
  width: 64px;
  height: 88px;
  border-radius: 12px;
  border: 2px solid;
  border-color: ${props => props.$hasVoted ? props.theme.primary : props.theme.border};
  background-color: ${props => {
    if (props.$hasVoted) {
      return props.$isRevealed ? props.theme.surface : props.theme.primary;
    }
    return props.theme.background;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.$isRevealed ? props.theme.primary : 'white'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$hasVoted ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' : 'none'};
`;

const ParticipantLabel = styled.div`
  font-size: 0.75rem;
  margin-top: 0.75rem;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1rem 0;
`;

const PokerCard = styled.button<{ $selected?: boolean }>`
  width: 64px;
  height: 96px;
  border-radius: 12px;
  border: 2px solid;
  border-color: ${props => props.$selected ? props.theme.primary : props.theme.border};
  background-color: ${props => props.$selected ? props.theme.sidebarActive : props.theme.surface};
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.$selected ? props.theme.primary : props.theme.textPrimary};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$selected ? '0 10px 15px -3px rgba(59, 130, 246, 0.2)' : 'none'};
  transform: ${props => props.$selected ? 'translateY(-8px)' : 'translateY(0)'};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.primary};
    transform: translateY(-8px);
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.surface};
  border-radius: 24px;
  color: ${props => props.theme.textSecondary};
  border: 2px dashed ${props => props.theme.border};
  gap: 1rem;
`;

const ItemsSidebar = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: hidden;
`;

const SidebarSectionTitle = styled.h3`
  margin: 0;
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  overflow-y: auto;
  padding-right: 4px;
`;

const ItemCard = styled.div<{ $active?: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  background-color: ${props => props.$active ? props.theme.sidebarActive : 'transparent'};
  border: 1px solid;
  border-color: ${props => props.$active ? props.theme.primary : props.theme.border};
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.sidebarActive};
    border-color: ${props => props.theme.primary};
  }
`;

const ItemTitle = styled.span<{ $active?: boolean }>`
  color: ${props => props.$active ? props.theme.primary : props.theme.textPrimary};
  font-weight: ${props => props.$active ? 600 : 500};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 0.5rem;
`;

const POKER_CARDS = [0, 1, 2, 3, 5, 8, 13, 21, '?', '☕'];

const PokerRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { teams, isLoadingTeam, isLeader } = useTeam();
  const [session, setSession] = useState<PokerSession | null>(null);
  const [items, setItems] = useState<PokerItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId || !auth.currentUser || isLoadingTeam) return;

    const unsubSession = subscribeToSession(sessionId, (s) => {
      if (!s) {
        navigate('/dashboard');
        return;
      }

      // Check if user is still in the team that owns this session
      if (s.teamId && !teams.some(t => t.id === s.teamId)) {
        navigate('/dashboard');
        return;
      }

      setSession(s);
      if (!s.participants.includes(auth.currentUser!.uid)) {
        addParticipant(sessionId, auth.currentUser!.uid);
      }
    }, (err) => {
      console.error("Session subscription error:", err);
      navigate('/dashboard');
    });

    const unsubItems = subscribeToItems(sessionId, (newItems) => {
      setItems(newItems);
      if (newItems.length > 0 && !activeItemId) {
        const firstActive = newItems.find(i => i.status !== 'finished');
        if (firstActive) setActiveItemId(firstActive.id);
      }
    }, (err) => {
      console.error("Items subscription error:", err);
    });

    return () => {
      unsubSession();
      unsubItems();
    };
  }, [sessionId, navigate, teams, isLoadingTeam]);

  const activeItem = items.find(i => i.id === activeItemId);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !sessionId) return;
    await addPokerItem(sessionId, newItemTitle);
    setNewItemTitle('');
  };

  const handleVote = (vote: string | number) => {
    if (!sessionId || !activeItemId || !auth.currentUser) return;
    castVote(sessionId, activeItemId, auth.currentUser.uid, vote);
  };

  const handleUpdateStatus = (status: PokerItem['status']) => {
    if (!sessionId || !activeItemId) return;
    updateItemStatus(sessionId, activeItemId, status);
  };

  const handleStartEdit = () => {
    if (!session) return;
    setTempTitle(session.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!sessionId || !tempTitle.trim()) return;
    await updatePokerSessionTitle(sessionId, tempTitle.trim());
    setIsEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!sessionId) return;
    setIsDeleting(true);
    try {
      await deletePokerSession(sessionId);
      navigate('/dashboard');
    } catch (error) {
      alert("Failed to delete session.");
      setIsDeleting(false);
    }
  };

  if (!session) return <Typography style={{ padding: '2rem' }}>Loading session...</Typography>;

  return (
    <RoomContainer>
      {/* Main Area */}
      <MainArea>
        <RoomHeader>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </BackButton>
          
          <Flex $align="center" $gap="1rem" style={{ flex: 1 }}>
            {isEditingTitle ? (
              <Flex $gap="0.5rem" style={{ flex: 1 }}>
                <Input 
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
                />
                <Button $variant="primary" $size="sm" onClick={handleSaveTitle}>
                  <Check size={18} />
                </Button>
                <Button $variant="secondary" $size="sm" onClick={() => setIsEditingTitle(false)}>
                  <X size={18} />
                </Button>
              </Flex>
            ) : (
              <>
                <Typography as="h1" $variant="h2" style={{ margin: 0 }}>{session.title}</Typography>
                {isLeader && (
                  <Flex $gap="0.5rem">
                    <Button $variant="secondary" $size="sm" style={{ padding: '4px', border: 'none' }} onClick={handleStartEdit}>
                      <Edit2 size={16} />
                    </Button>
                    <Button $variant="secondary" $size="sm" style={{ padding: '4px', border: 'none', color: '#ef4444' }} onClick={() => setShowDeleteModal(true)}>
                      <Trash2 size={16} />
                    </Button>
                  </Flex>
                )}
              </>
            )}
          </Flex>
        </RoomHeader>

        <VotingArea>
          {activeItem ? (
            <>
              {/* Voting Table */}
              <VotingTable>
                <TableInfo>
                  <Typography $variant="small" $weight={700} $color="primary" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                    Current Item
                  </Typography>
                  <Typography as="h2" $variant="h2" style={{ margin: '0.5rem 0 0 0', display: 'block' }}>
                    {activeItem.title}
                  </Typography>
                </TableInfo>
                
                <ParticipantsGrid>
                  {session.participants.map(userId => {
                    const hasVoted = activeItem.votes[userId] !== undefined;
                    const voteValue = activeItem.votes[userId];
                    const isRevealed = activeItem.status === 'revealed';

                    return (
                      <div key={userId} style={{ textAlign: 'center' }}>
                        <ParticipantVoteCard $hasVoted={hasVoted} $isRevealed={isRevealed}>
                          {isRevealed ? voteValue : (hasVoted ? '✓' : '')}
                        </ParticipantVoteCard>
                        <ParticipantLabel>
                          {userId === auth.currentUser?.uid ? 'You' : 'Member'}
                        </ParticipantLabel>
                      </div>
                    );
                  })}
                </ParticipantsGrid>

                <Flex $gap="1rem">
                  {activeItem.status === 'pending' && (
                    <Button 
                      $variant="primary"
                      onClick={() => handleUpdateStatus('voting')}
                    >
                      Start Voting
                    </Button>
                  )}
                  {activeItem.status === 'voting' && (
                    <Button 
                      $variant="primary"
                      onClick={() => handleUpdateStatus('revealed')}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <Eye size={18} /> Reveal Votes
                    </Button>
                  )}
                  {activeItem.status === 'revealed' && (
                    <>
                      <Button 
                        $variant="primary"
                        onClick={() => handleUpdateStatus('voting')}
                        style={{ backgroundColor: '#f59e0b' }}
                      >
                        <RotateCcw size={18} /> Revote
                      </Button>
                      <Button 
                        $variant="primary"
                        onClick={() => handleUpdateStatus('finished')}
                      >
                        <CheckCircle2 size={18} /> Finish Item
                      </Button>
                    </>
                  )}
                </Flex>
              </VotingTable>

              {/* Voting Cards */}
              <CardsContainer>
                {POKER_CARDS.map(val => {
                  const isSelected = activeItem.votes[auth.currentUser?.uid || ''] === val;
                  const isDisabled = activeItem.status === 'revealed' || activeItem.status === 'finished';
                  return (
                    <PokerCard
                      key={val}
                      onClick={() => handleVote(val)}
                      disabled={isDisabled}
                      $selected={isSelected}
                    >
                      {val}
                    </PokerCard>
                  );
                })}
              </CardsContainer>
            </>
          ) : (
            <EmptyState>
              <UsersIcon size={48} strokeWidth={1} />
              <div style={{ textAlign: 'center' }}>
                <Typography $weight={600} style={{ display: 'block' }}>No item selected</Typography>
                <Typography $variant="small">Select an item from the sidebar or add a new one.</Typography>
              </div>
            </EmptyState>
          )}
        </VotingArea>
      </MainArea>

      {/* Sidebar: Items List */}
      <ItemsSidebar>
        <Flex $align="center" $gap="0.75rem">
          <UsersIcon size={20} color={session.participants.length > 0 ? '#4f46e5' : undefined} />
          <Typography $weight={700}>Participants ({session.participants.length})</Typography>
        </Flex>

        <Flex $direction="column" $gap="1.25rem" style={{ flex: 1, overflow: 'hidden' }}>
          <SidebarSectionTitle>Items to Estimate</SidebarSectionTitle>
          
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem' }}>
            <Input 
              type="text" 
              placeholder="Add item..." 
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit" $variant="primary" $size="sm" style={{ padding: '0.5rem' }}>
              <Plus size={20} />
            </Button>
          </form>

          <ItemsList>
            {items.map(item => (
              <ItemCard 
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                $active={activeItemId === item.id}
              >
                <ItemTitle $active={activeItemId === item.id}>
                  {item.title}
                </ItemTitle>
                {item.status === 'finished' && <CheckCircle2 size={16} color="#10b981" />}
              </ItemCard>
            ))}
          </ItemsList>
        </Flex>
      </ItemsSidebar>

      <AnimatePresence>
        {showDeleteModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <Typography as="h2" $variant="h2" style={{ marginTop: 0, marginBottom: '1rem', display: 'block' }}>
                Delete Session?
              </Typography>
              <Typography $color="textSecondary" style={{ display: 'block', marginBottom: '2rem' }}>
                Are you sure you want to delete <strong>{session.title}</strong>? This action cannot be undone and all data will be lost.
              </Typography>
              <Flex $gap="1rem" $justify="flex-end">
                <Button 
                  $variant="secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  $variant="primary" 
                  style={{ backgroundColor: '#ef4444', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Session'}
                </Button>
              </Flex>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </RoomContainer>
  );
};

export default PokerRoom;
