import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  ArrowLeft, 
  UserPlus, 
  Settings2,
  X,
  Star,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useTeam } from '../contexts/TeamContext';
import type { KnowledgeBoard, MemberKnowledge } from '../types';
import { 
  subscribeToKnowledgeBoard, 
  subscribeToMembers, 
  addMemberToBoard, 
  updateMemberRating,
  updateBoardAreas,
  deleteMember,
  deleteKnowledgeBoard,
  updateKnowledgeBoardTitle
} from '../services/knowledgeService';
import { 
  Flex, 
  Typography, 
  Button, 
  Input, 
  Card, 
  ModalOverlay, 
  ModalContainer, 
  Label 
} from './styled';

const RoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
`;

const RoomHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
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

const TableContainer = styled(Card)`
  flex: 1;
  overflow: auto;
  padding: 0;
  border-radius: 24px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHeader = styled.th<{ $sticky?: boolean }>`
  padding: 1.5rem;
  text-align: ${props => props.$sticky ? 'left' : 'center'};
  color: ${props => props.theme.textSecondary};
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background-color: ${props => props.theme.surface};
  border-bottom: 2px solid ${props => props.theme.border};
  position: ${props => props.$sticky ? 'sticky' : 'static'};
  left: 0;
  z-index: ${props => props.$sticky ? 2 : 1};
  width: ${props => props.$sticky ? '250px' : 'auto'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.border};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.background};
  }
`;

const TableData = styled.td<{ $sticky?: boolean; $weight?: number }>`
  padding: 1.25rem 1.5rem;
  color: ${props => props.theme.textPrimary};
  font-weight: ${props => props.$weight || 400};
  text-align: ${props => props.$sticky ? 'left' : 'center'};
  position: ${props => props.$sticky ? 'sticky' : 'static'};
  left: 0;
  background-color: ${props => props.$sticky ? props.theme.surface : 'transparent'};
  z-index: ${props => props.$sticky ? 1 : 0};
`;

const StarButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${props => props.$active ? '#f59e0b' : props.theme.border};
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.2);
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;

  &:hover {
    color: #ef4444;
    opacity: 1;
  }
`;

const AreaInputGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const KnowledgeBoardRoom: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { teams, isLoadingTeam, isLeader } = useTeam();
  const [board, setBoard] = useState<KnowledgeBoard | null>(null);
  const [members, setMembers] = useState<MemberKnowledge[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const [tempAreas, setTempAreas] = useState<string[]>([]);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!boardId || isLoadingTeam) return;

    const unsubBoard = subscribeToKnowledgeBoard(boardId, (b) => {
      if (!b) {
        navigate('/dashboard');
        return;
      }

      // Check if user is still in the team that owns this board
      if (b.teamId && !teams.some(t => t.id === b.teamId)) {
        navigate('/dashboard');
        return;
      }

      setBoard(b);
      setTempAreas(b.areas);
    }, (err) => {
      console.error("Knowledge board subscription error:", err);
      navigate('/dashboard');
    });

    const unsubMembers = subscribeToMembers(boardId, (m) => {
      setMembers(m);
    }, (err) => {
      console.error("Knowledge members subscription error:", err);
    });

    return () => {
      unsubBoard();
      unsubMembers();
    };
  }, [boardId, navigate, teams, isLoadingTeam]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !boardId) return;
    await addMemberToBoard(boardId, newMemberName);
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const handleRatingChange = async (memberId: string, area: string, rating: number) => {
    await updateMemberRating(memberId, area, rating);
  };

  const handleSaveAreas = async () => {
    if (!boardId) return;
    await updateBoardAreas(boardId, tempAreas.filter(a => a.trim() !== ''));
    setIsEditingAreas(false);
  };

  const addArea = () => {
    setTempAreas([...tempAreas, '']);
  };

  const updateAreaName = (index: number, value: string) => {
    const next = [...tempAreas];
    next[index] = value;
    setTempAreas(next);
  };

  const removeArea = (index: number) => {
    const next = tempAreas.filter((_, i) => i !== index);
    setTempAreas(next);
  };

  const handleStartEditTitle = () => {
    if (!board) return;
    setTempTitle(board.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!boardId || !tempTitle.trim()) return;
    await updateKnowledgeBoardTitle(boardId, tempTitle.trim());
    setIsEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!boardId) return;
    setIsDeleting(true);
    try {
      await deleteKnowledgeBoard(boardId);
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
        <Flex $align="center" $gap="1rem" style={{ flex: 1 }}>
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
        </Flex>
        
        <Flex $gap="1rem">
          <Button 
            $variant="secondary"
            onClick={() => setIsEditingAreas(true)}
          >
            <Settings2 size={18} />
            Manage Areas
          </Button>
          <Button 
            $variant="primary"
            onClick={() => setIsAddingMember(true)}
          >
            <UserPlus size={18} />
            Add Member
          </Button>
        </Flex>
      </RoomHeader>

      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader $sticky>Team Member</TableHeader>
              {board.areas.map(area => (
                <TableHeader key={area}>{area}</TableHeader>
              ))}
              <TableHeader style={{ width: '60px' }}></TableHeader>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <TableRow key={member.id}>
                <TableData $sticky $weight={600}>
                  {member.userName}
                </TableData>
                {board.areas.map(area => (
                  <TableData key={area}>
                    <Flex $justify="center" $gap="0.25rem">
                      {[1, 2, 3, 4, 5].map(star => {
                        const rating = member.ratings[area] || 0;
                        const isActive = star <= rating;
                        return (
                          <StarButton 
                            key={star}
                            onClick={() => handleRatingChange(member.id, area, star)}
                            $active={isActive}
                          >
                            <Star size={18} fill={isActive ? '#f59e0b' : 'none'} />
                          </StarButton>
                        );
                      })}
                    </Flex>
                  </TableData>
                ))}
                <TableData>
                  <DeleteButton onClick={() => deleteMember(member.id)}>
                    <Trash2 size={16} />
                  </DeleteButton>
                </TableData>
              </TableRow>
            ))}
            {members.length === 0 && (
              <tr>
                <TableData colSpan={board.areas.length + 2} style={{ padding: '4rem' }}>
                  <Typography $color="textSecondary">
                    No members added yet. Add team members to start mapping knowledge.
                  </Typography>
                </TableData>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableContainer>

      {/* Modals */}
      {isAddingMember && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <form onSubmit={handleAddMember}>
              <Typography as="h2" $variant="h2" style={{ marginTop: 0, marginBottom: '1.5rem', display: 'block' }}>Add Team Member</Typography>
              <div style={{ marginBottom: '1.5rem' }}>
                <Label>NAME</Label>
                <Input 
                  autoFocus
                  type="text" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <Flex $gap="1rem" $justify="flex-end">
                <Button type="button" $variant="secondary" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                <Button type="submit" $variant="primary">Add Member</Button>
              </Flex>
            </form>
          </ModalContainer>
        </ModalOverlay>
      )}

      {isEditingAreas && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            style={{ maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Typography as="h2" $variant="h2" style={{ marginTop: 0, marginBottom: '1.5rem', display: 'block' }}>Manage Knowledge Areas</Typography>
            <Flex $direction="column" $gap="0.75rem" style={{ marginBottom: '2rem' }}>
              {tempAreas.map((area, idx) => (
                <AreaInputGroup key={idx}>
                  <Input 
                    type="text" 
                    value={area}
                    onChange={(e) => updateAreaName(idx, e.target.value)}
                    placeholder="Area name (e.g. Authentication)"
                  />
                  <button 
                    onClick={() => removeArea(idx)}
                    style={{ padding: '0.75rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </AreaInputGroup>
              ))}
              <Button 
                onClick={addArea}
                $variant="secondary"
                $size="sm"
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus size={18} />
                Add Area
              </Button>
            </Flex>
            <Flex $gap="1rem" $justify="flex-end">
              <Button $variant="secondary" onClick={() => setIsEditingAreas(false)}>Cancel</Button>
              <Button $variant="primary" onClick={handleSaveAreas}>Save Changes</Button>
            </Flex>
          </ModalContainer>
        </ModalOverlay>
      )}

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
                Are you sure you want to delete <strong>{board.title}</strong>? This action cannot be undone and all ratings will be lost.
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

export default KnowledgeBoardRoom;
