import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  ThumbsUp, 
  ArrowLeft, 
  Edit2,
  Check,
  CheckSquare,
  Square,
  Trash2,
  X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { useTeam } from '../contexts/TeamContext';
import type { ReviewBoard, ReviewCard } from '../types';
import { 
  subscribeToBoard, 
  subscribeToCards, 
  addReviewCard, 
  toggleVote,
  updateBoardColumns,
  toggleAcknowledged,
  deleteReviewBoard,
  updateReviewBoardTitle
} from '../services/reviewService';
import { Flex, Typography, Button, Input, ModalOverlay, ModalContainer } from './styled';

const RoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
`;

const RoomHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.textPrimary};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
    background-color: ${props => props.theme.sidebarActive};
  }
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

const ColumnContainer = styled.div`
  background-color: ${props => props.theme.background};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.border};
  overflow: hidden;
`;

const ColumnHeaderStyled = styled.div`
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.textPrimary};
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    color: ${props => props.theme.primary};
  }
`;

const AcknowledgeButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$active ? props.theme.primary : props.theme.textSecondary};
  opacity: ${props => props.$active ? 1 : 0.5};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    color: ${props => props.theme.primary};
  }
`;

const ColumnTitleInput = styled.input`
  flex: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.primary};
  background-color: transparent;
  color: ${props => props.theme.textPrimary};
  outline: none;
`;

const SaveButton = styled.button`
  color: ${props => props.theme.primary};
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const CardsList = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReviewCardBox = styled.div<{ $acknowledged?: boolean }>`
  background-color: ${props => props.$acknowledged ? props.theme.background : props.theme.surface};
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.$acknowledged ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'};
  position: relative;
  opacity: ${props => props.$acknowledged ? 0.6 : 1};
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.theme.primary};
  }
`;

const CardText = styled.p<{ $acknowledged?: boolean }>`
  color: ${props => props.theme.textPrimary};
  font-size: 0.95rem;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
  text-decoration: ${props => props.$acknowledged ? 'line-through' : 'none'};
`;

const VoteButton = styled.button<{ $hasVoted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  border: none;
  background-color: ${props => props.$hasVoted ? props.theme.primary : props.theme.background};
  color: ${props => props.$hasVoted ? 'white' : props.theme.textSecondary};
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$hasVoted ? props.theme.primary : props.theme.sidebarActive};
  }
`;

const AddCardFooter = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme.surface};
  border-top: 1px solid ${props => props.theme.border};
`;

const StyledTextArea = styled.textarea`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.textPrimary};
  font-size: 0.9rem;
  resize: none;
  height: 40px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${props => props.theme.primary};
    background-color: ${props => props.theme.surface};
  }
`;

const ReviewRoom: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { teams, isLoadingTeam, isLeader } = useTeam();
  const [board, setBoard] = useState<ReviewBoard | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [newCardTexts, setNewCardTexts] = useState<Record<number, string>>({ 0: '', 1: '', 2: '' });
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [tempColName, setTempColName] = useState('');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!boardId || isLoadingTeam) return;

    const unsubBoard = subscribeToBoard(boardId, (reviewBoard) => {
      if (!reviewBoard) {
        navigate('/dashboard');
        return;
      }

      // Check if user is still in the team that owns this board
      if (reviewBoard.teamId && !teams.some(t => t.id === reviewBoard.teamId)) {
        navigate('/dashboard');
        return;
      }

      setBoard(reviewBoard);
    }, (err) => {
      console.error("Board subscription error:", err);
      navigate('/dashboard');
    });

    const unsubCards = subscribeToCards(boardId, (c) => {
      setCards(c);
    }, (err) => {
      console.error("Cards subscription error:", err);
    });

    return () => {
      unsubBoard();
      unsubCards();
    };
  }, [boardId, navigate, teams, isLoadingTeam]);

  const handleAddCard = async (columnId: number) => {
    const text = newCardTexts[columnId];
    if (!text?.trim() || !boardId || !auth.currentUser) return;

    await addReviewCard(
      boardId, 
      columnId, 
      text, 
      auth.currentUser.uid, 
      auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'User'
    );
    
    setNewCardTexts(prev => ({ ...prev, [columnId]: '' }));
  };

  const handleVote = async (card: ReviewCard) => {
    if (!auth.currentUser) return;
    const hasVoted = card.votes.includes(auth.currentUser.uid);
    await toggleVote(card.id, auth.currentUser.uid, hasVoted);
  };

  const handleToggleAcknowledged = async (card: ReviewCard) => {
    await toggleAcknowledged(card.id, !card.acknowledged);
  };

  const startEditingColumn = (index: number) => {
    if (!board) return;
    setEditingColumn(index);
    setTempColName(board.columnNames[index]);
  };

  const saveColumnName = async () => {
    if (!board || !boardId || editingColumn === null) return;
    const newNames = [...board.columnNames];
    newNames[editingColumn] = tempColName || `Column ${editingColumn + 1}`;
    await updateBoardColumns(boardId, newNames);
    setEditingColumn(null);
  };

  const handleStartEditTitle = () => {
    if (!board) return;
    setTempTitle(board.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!boardId || !tempTitle.trim()) return;
    await updateReviewBoardTitle(boardId, tempTitle.trim());
    setIsEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!boardId) return;
    setIsDeleting(true);
    try {
      await deleteReviewBoard(boardId);
      navigate('/dashboard');
    } catch (error) {
      alert("Failed to delete board.");
      setIsDeleting(false);
    }
  };

  if (!board) return <Typography style={{ padding: '2rem' }}>Loading board...</Typography>;

  return (
    <RoomContainer>
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
              <Typography as="h1" $variant="h2" style={{ margin: 0 }}>{board.title}</Typography>
              {isLeader && (
                <Flex $gap="0.5rem">
                  <Button $variant="secondary" $size="sm" style={{ padding: '4px', border: 'none' }} onClick={handleStartEditTitle}>
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

      <BoardGrid>
        {board.columnNames.map((name, idx) => (
          <ColumnContainer key={idx}>
            {/* Column Header */}
            <ColumnHeaderStyled>
              {editingColumn === idx ? (
                <Flex $gap="0.5rem" style={{ width: '100%' }}>
                  <ColumnTitleInput 
                    autoFocus
                    value={tempColName}
                    onChange={(e) => setTempColName(e.target.value)}
                    onBlur={saveColumnName}
                    onKeyDown={(e) => e.key === 'Enter' && saveColumnName()}
                  />
                  <SaveButton onClick={saveColumnName}>
                    <Check size={18} />
                  </SaveButton>
                </Flex>
              ) : (
                <>
                  <Typography as="h3" $weight={700}>{name}</Typography>
                  <EditButton onClick={() => startEditingColumn(idx)}>
                    <Edit2 size={14} />
                  </EditButton>
                </>
              )}
            </ColumnHeaderStyled>

            {/* Cards List */}
            <CardsList>
              {cards.filter(c => c.columnId === idx).map(card => {
                const hasVoted = card.votes.includes(auth.currentUser?.uid || '');
                const isAcknowledged = card.acknowledged;

                return (
                  <ReviewCardBox key={card.id} $acknowledged={isAcknowledged}>
                    <Flex $direction="column" $gap="0.25rem" style={{ marginBottom: '1rem' }}>
                      <Typography $variant="small" $weight={700} $color="primary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {card.authorName}
                      </Typography>
                      <CardText $acknowledged={isAcknowledged}>
                        {card.text}
                      </CardText>
                    </Flex>
                    <Flex $justify="space-between" $align="center">
                      <AcknowledgeButton 
                        onClick={() => handleToggleAcknowledged(card)}
                        $active={isAcknowledged}
                      >
                        {isAcknowledged ? <CheckSquare size={18} /> : <Square size={18} />}
                      </AcknowledgeButton>
                      <VoteButton 
                        onClick={() => handleVote(card)}
                        $hasVoted={hasVoted}
                      >
                        <ThumbsUp size={14} fill={hasVoted ? 'white' : 'none'} />
                        {card.votes.length || 0}
                      </VoteButton>
                    </Flex>
                  </ReviewCardBox>
                );
              })}
            </CardsList>

            {/* Add Card Input */}
            <AddCardFooter>
              <Flex $gap="0.5rem">
                <StyledTextArea 
                  placeholder="Add a note..."
                  value={newCardTexts[idx]}
                  onChange={(e) => setNewCardTexts(prev => ({ ...prev, [idx]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(idx);
                    }
                  }}
                />
                <Button 
                  onClick={() => handleAddCard(idx)}
                  $variant="primary"
                  $size="sm"
                  style={{ padding: '0.5rem' }}
                >
                  <Plus size={20} />
                </Button>
              </Flex>
            </AddCardFooter>
          </ColumnContainer>
        ))}
      </BoardGrid>

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
                Delete Board?
              </Typography>
              <Typography $color="textSecondary" style={{ display: 'block', marginBottom: '2rem' }}>
                Are you sure you want to delete <strong>{board.title}</strong>? This action cannot be undone and all cards will be lost.
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
                  {isDeleting ? 'Deleting...' : 'Delete Board'}
                </Button>
              </Flex>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </RoomContainer>
  );
};

export default ReviewRoom;
