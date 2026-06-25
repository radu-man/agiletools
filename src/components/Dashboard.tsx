import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';
import { LayoutDashboard, Copy, Check, Users } from 'lucide-react';
import { Flex, Typography, Card, Button, Input, Label } from './styled';
import { useTeam } from '../contexts/TeamContext';
import { createTeam } from '../services/teamService';

const DashboardHeader = styled(Flex)`
  margin-bottom: 2rem;
`;

const IconBox = styled.div`
  background-color: ${props => props.theme.primary};
  padding: 1rem;
  border-radius: 16px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
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

const Dashboard: React.FC = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { team, isLoadingTeam, isLeader } = useTeam();
  const [teamName, setTeamName] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check for pending invite after login
    const pendingToken = sessionStorage.getItem('pendingInviteToken');
    if (pendingToken) {
      sessionStorage.removeItem('pendingInviteToken');
      navigate(`/join?token=${pendingToken}`);
    }
  }, [navigate]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !user) return;
    setIsCreating(true);
    try {
      const name = user.displayName || user.email?.split('@')[0] || 'Leader';
      await createTeam(teamName.trim(), user.uid, name);
      setTeamName('');
    } catch {
      alert('Failed to create team.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinToken.trim()) return;

    let token = joinToken.trim();
    // If they pasted a full URL, extract the token
    if (token.includes('token=')) {
      try {
        const url = new URL(token);
        token = url.searchParams.get('token') || token;
      } catch (e) {
        // Not a valid URL, just use as is
      }
    }

    navigate(`/join?token=${token}`);
  };

  const handleCopyLink = () => {
    if (!team) return;
    const link = `${window.location.origin}/join?token=${team.inviteToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isAnonymous = user?.isAnonymous;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Developer';

  return (
    <div>
      <DashboardHeader $align="center" $gap="1rem">
        <IconBox>
          <LayoutDashboard size={28} />
        </IconBox>
        <div>
          <Typography as="h1" $variant="h1" style={{ margin: 0, display: 'block' }}>
            Welcome back, {displayName}!
          </Typography>
          <Typography $color="textSecondary" style={{ marginTop: '0.25rem', fontSize: '1.05rem', display: 'block' }}>
            {team
              ? `You're working in ${team.name}.`
              : 'Create or join a team to get started.'}
          </Typography>
        </div>
      </DashboardHeader>

      <DashboardGrid>
        {/* Main Status / Activity Card */}
        <Card $padding="2rem">
          <Typography as="h3" $variant="h3" style={{ margin: 0, display: 'block' }}>Recent Activity</Typography>
          <Typography $variant="small" $color="textSecondary" style={{ display: 'block' }}>Activity tracking will be available soon.</Typography>
        </Card>

        {/* Active Team Card */}
        {!isLoadingTeam && team && (
          isLeader ? (
            <Card $padding="2rem">
              <Flex $align="center" $gap="0.5rem" style={{ marginBottom: '0.75rem' }}>
                <Users size={20} style={{ color: 'inherit' }} />
                <Typography as="h3" $variant="h3" style={{ margin: 0, display: 'block' }}>
                  Invite Link
                </Typography>
              </Flex>
              <Typography $variant="small" $color="textSecondary" style={{ display: 'block', marginBottom: '0.25rem' }}>
                Share this link with your team members:
              </Typography>
              <InviteUrl>{`${window.location.origin}/join?token=${team.inviteToken}`}</InviteUrl>
              <Button $variant={copied ? 'secondary' : 'primary'} $size="sm" onClick={handleCopyLink}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
              </Button>
            </Card>
          ) : (
            <Card $padding="2rem">
              <Flex $align="center" $gap="0.5rem" style={{ marginBottom: '0.5rem' }}>
                <Users size={20} />
                <Typography as="h3" $variant="h3" style={{ margin: 0, display: 'block' }}>
                  {team.name}
                </Typography>
              </Flex>
              <Typography $variant="small" $color="textSecondary" style={{ display: 'block' }}>
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </Typography>
            </Card>
          )
        )}
      </DashboardGrid>

      {/* Action Section (Always Visible for Non-Anonymous) */}
      {!isAnonymous && (
        <div style={{ marginTop: '3rem' }}>
          <Typography as="h2" $variant="h2" style={{ marginBottom: '1.5rem', display: 'block' }}>Manage Teams</Typography>
          <DashboardGrid style={{ marginTop: 0 }}>
            <Card $padding="2rem">
              <Typography as="h3" $variant="h3" style={{ margin: '0 0 1rem', display: 'block' }}>Create a New Team</Typography>
              <form onSubmit={handleCreateTeam}>
                <div style={{ marginBottom: '1rem' }}>
                  <Label>TEAM NAME</Label>
                  <Input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g., Frontend Squad"
                    required
                  />
                </div>
                <Button type="submit" $variant="primary" $size="sm" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Team'}
                </Button>
              </form>
            </Card>

            <Card $padding="2rem">
              <Typography as="h3" $variant="h3" style={{ margin: '0 0 1rem', display: 'block' }}>Join Another Team</Typography>
              <form onSubmit={handleJoinByToken}>
                <div style={{ marginBottom: '1rem' }}>
                  <Label>INVITE LINK OR TOKEN</Label>
                  <Input
                    type="text"
                    value={joinToken}
                    onChange={e => setJoinToken(e.target.value)}
                    placeholder="Paste link or token here"
                    required
                  />
                </div>
                <Button type="submit" $variant="secondary" $size="sm">
                  Join Team
                </Button>
              </form>
            </Card>
          </DashboardGrid>
        </div>
      )}

      {/* Anonymous Join Fallback */}
      {isAnonymous && !team && (
        <div style={{ marginTop: '3rem' }}>
          <Card $padding="2rem" style={{ maxWidth: '400px' }}>
            <Typography as="h3" $variant="h3" style={{ margin: 0, display: 'block' }}>No Team Found</Typography>
            <Typography $variant="small" $color="textSecondary" style={{ display: 'block', marginBottom: '1.5rem' }}>
              Contact your team leader for an invite link.
            </Typography>
            <form onSubmit={handleJoinByToken}>
              <Label style={{ fontSize: '0.7rem' }}>JOIN WITH INVITE LINK</Label>
              <Flex $gap="0.5rem">
                <Input 
                  type="text" 
                  value={joinToken}
                  onChange={e => setJoinToken(e.target.value)}
                  placeholder="Paste link or token here"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                />
                <Button type="submit" $variant="primary" $size="sm">Join</Button>
              </Flex>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
