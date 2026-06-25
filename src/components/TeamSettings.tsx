import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { Copy, Check, RefreshCw, Users, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { useTeam } from '../contexts/TeamContext';
import { regenerateInviteToken, setInviteEnabled, removeMember } from '../services/teamService';
import { subscribeToPresence } from '../services/presenceService';
import { Card, Button, Flex, Typography, ModalOverlay, ModalContainer } from './styled';

const PageContainer = styled.div`
  max-width: 600px;
`;

const Section = styled(Card)`
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
`;

const MemberRow = styled(Flex)`
  padding: 0.8rem 0;
  border-bottom: 1px solid ${props => props.theme.border};
  &:last-child { border-bottom: none; }
`;

const StatusDot = styled.div<{ $online: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$online ? '#10b981' : '#d1d5db'};
  margin-right: 0.75rem;
`;

const InviteUrl = styled.code`
  display: block;
  background-color: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  word-break: break-all;
  color: ${props => props.theme.textSecondary};
  margin: 0.75rem 0;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${props => props.theme.textPrimary};

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: ${props => props.theme.primary};
  }
`;

const TeamSettings: React.FC = () => {
  const { team, isLeader } = useTeam();
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTogglingInvite, setIsTogglingInvite] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    if (!team) return;
    const unsub = subscribeToPresence(team.members, setOnlineUsers);
    return () => unsub();
  }, [team?.members]);

  if (!isLeader) return <Navigate to="/dashboard" />;
  if (!team) return <Navigate to="/dashboard" />;

  const inviteLink = `${window.location.origin}/join?token=${team.inviteToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate invite link? The old link will stop working immediately.')) return;
    setIsRegenerating(true);
    try {
      await regenerateInviteToken(team.id);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleInvite = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTogglingInvite(true);
    try {
      await setInviteEnabled(team.id, e.target.checked);
    } finally {
      setIsTogglingInvite(false);
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    setMemberToDelete({ id: userId, name: userName });
  };

  const confirmDelete = async () => {
    if (!memberToDelete || !team) return;
    setIsRemoving(memberToDelete.id);
    try {
      await removeMember(team.id, memberToDelete.id);
      setMemberToDelete(null);
    } catch (error) {
      alert("Failed to remove member.");
    } finally {
      setIsRemoving(null);
    }
  };

  const memberNames = team.memberNames || {};

  return (
    <PageContainer>
      <Typography as="h1" $variant="h1" style={{ margin: '0 0 1.5rem', display: 'block' }}>
        Team Settings
      </Typography>

      <Section>
        <Typography as="h3" $variant="h3" style={{ margin: '0 0 0.25rem', display: 'block' }}>
          {team.name}
        </Typography>
        <Typography $variant="small" $color="textSecondary" style={{ display: 'block' }}>
          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
        </Typography>
      </Section>

      <Section>
        <Typography as="h3" $variant="h3" style={{ margin: '0 0 0.75rem', display: 'block' }}>
          Invite Link
        </Typography>

        <Toggle>
          <input
            type="checkbox"
            checked={team.inviteEnabled}
            onChange={handleToggleInvite}
            disabled={isTogglingInvite}
          />
          Invite link enabled
        </Toggle>

        {team.inviteEnabled && (
          <>
            <InviteUrl>{inviteLink}</InviteUrl>
            <Flex $gap="0.75rem">
              <Button $variant={copied ? 'secondary' : 'primary'} $size="sm" onClick={handleCopy}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </Button>
              <Button $variant="secondary" $size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
                <RefreshCw size={14} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </Flex>
          </>
        )}
      </Section>

      <Section>
        <Flex $align="center" $gap="0.5rem" style={{ marginBottom: '1rem' }}>
          <Users size={18} />
          <Typography as="h3" $variant="h3" style={{ margin: 0, display: 'block' }}>
            Members
          </Typography>
        </Flex>
        {team.members.map((uid) => {
          const isMe = uid === auth.currentUser?.uid;
          const name = memberNames[uid] || (isMe ? auth.currentUser?.displayName : null) || 'Member';
          const isOnline = onlineUsers.has(uid);
          
          return (
            <MemberRow key={uid} $align="center" $justify="space-between">
              <Flex $align="center">
                <StatusDot $online={isOnline} title={isOnline ? 'Online' : 'Offline'} />
                <Typography style={{ display: 'block' }}>
                  {name} {isMe && '(You)'}
                </Typography>
              </Flex>
              <Flex $align="center" $gap="1rem">
                {uid === team.leaderId && (
                  <Typography $variant="small" $color="textSecondary" style={{ display: 'block' }}>
                    Team Leader
                  </Typography>
                )}
                {!isMe && (
                  <Button 
                    $variant="secondary" 
                    $size="sm" 
                    style={{ padding: '4px', border: 'none', color: '#ef4444' }}
                    onClick={() => handleRemoveMember(uid, name)}
                    disabled={isRemoving === uid}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </Flex>
            </MemberRow>
          );
        })}
      </Section>

      <AnimatePresence>
        {memberToDelete && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMemberToDelete(null)}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <Typography as="h2" $variant="h2" style={{ marginTop: 0, marginBottom: '1rem', display: 'block' }}>
                Remove Member?
              </Typography>
              <Typography $color="textSecondary" style={{ display: 'block', marginBottom: '2rem' }}>
                Are you sure you want to remove <strong>{memberToDelete.name}</strong> from the team? They will lose access to all boards immediately.
              </Typography>
              <Flex $gap="1rem" $justify="flex-end">
                <Button 
                  $variant="secondary" 
                  onClick={() => setMemberToDelete(null)}
                  disabled={!!isRemoving}
                >
                  Cancel
                </Button>
                <Button 
                  $variant="primary" 
                  style={{ backgroundColor: '#ef4444', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}
                  onClick={confirmDelete}
                  disabled={!!isRemoving}
                >
                  {isRemoving ? 'Removing...' : 'Remove Member'}
                </Button>
              </Flex>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default TeamSettings;
