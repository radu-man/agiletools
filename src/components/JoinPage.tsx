import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { auth, signInAnonymously, updateProfile } from '../firebase';
import { getTeamByToken, joinTeam } from '../services/teamService';
import { Button, Input, Label, Flex, Typography, Card } from './styled';
import type { Team } from '../types';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.background};
  padding: 2rem;
`;

const JoinCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
`;

const IconBox = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
`;

const AlertBox = styled.div<{ $type: 'error' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: ${props => props.$type === 'error' ? '#fee2e2' : '#eff6ff'};
  color: ${props => props.$type === 'error' ? '#dc2626' : '#1d4ed8'};
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

type Phase = 'loading' | 'invalid' | 'already-member' | 'confirm' | 'form' | 'wrong-team';

const JoinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState<Phase>('loading');
  const [team, setTeam] = useState<Team | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setPhase('invalid');
      return;
    }

    const resolve = async () => {
      try {
        const foundTeam = await getTeamByToken(token);
        if (!foundTeam) {
          setPhase('invalid');
          return;
        }
        setTeam(foundTeam);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          sessionStorage.setItem('pendingInviteToken', token);
          setPhase('form');
          return;
        }

        if (foundTeam.members.includes(currentUser.uid)) {
          setPhase('already-member');
          return;
        }

        setPhase('confirm');
      } catch (err: any) {
        console.error("Resolve error:", err);
        setError(err.message || "Failed to resolve team.");
        setPhase('invalid');
      }
    };

    resolve();
  }, [token]);

  const handleAnonymousJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !team) return;
    setIsSubmitting(true);
    setError('');
    try {
      // If already logged in, just use current account
      let userId = auth.currentUser?.uid;
      let name = displayName.trim();

      if (!userId) {
        const credential = await signInAnonymously(auth);
        userId = credential.user.uid;
        await updateProfile(credential.user, { displayName: name });
      }

      await joinTeam(team.id, userId, name);
      localStorage.setItem(`activeTeam_${userId}`, team.id);
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (!team || !auth.currentUser) return;
    setIsSubmitting(true);
    setError('');
    try {
      const name = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Member';
      await joinTeam(team.id, auth.currentUser.uid, name);
      localStorage.setItem(`activeTeam_${auth.currentUser.uid}`, team.id);
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <JoinCard>
        <IconBox>
          <Users size={28} />
        </IconBox>

        {phase === 'loading' && (
          <Typography $color="textSecondary">Validating invite link...</Typography>
        )}

        {phase === 'invalid' && (
          <>
            <Typography as="h2" $variant="h2" style={{ margin: '0 0 0.5rem', display: 'block' }}>
              Invalid Link
            </Typography>
            <AlertBox $type="error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              {error || "This invite link is invalid or has been disabled by the team leader."}
            </AlertBox>
            <Link to="/" style={{ color: 'inherit' }}>
              <Button $variant="secondary" style={{ width: '100%' }}>Go to Login</Button>
            </Link>
          </>
        )}

        {phase === 'already-member' && team && (
          <>
            <Typography as="h2" $variant="h2" style={{ margin: '0 0 0.5rem', display: 'block' }}>
              Already a Member
            </Typography>
            <AlertBox $type="info">
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              You're already a member of <strong>{team.name}</strong>.
            </AlertBox>
            <Button $variant="primary" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {phase === 'confirm' && team && (
          <>
            <Typography as="h2" $variant="h2" style={{ margin: '0 0 0.5rem', display: 'block' }}>
              Join {team.name}
            </Typography>
            <Typography $color="textSecondary" style={{ display: 'block', marginBottom: '1.5rem' }}>
              You've been invited to join this team.
            </Typography>
            {error && (
              <AlertBox $type="error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </AlertBox>
            )}
            <Flex $gap="0.75rem">
              <Button $variant="secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button $variant="primary" style={{ flex: 1 }} onClick={handleConfirmJoin} disabled={isSubmitting}>
                {isSubmitting ? 'Joining...' : 'Join Team'}
              </Button>
            </Flex>
          </>
        )}

        {phase === 'form' && team && (
          <>
            <Typography as="h2" $variant="h2" style={{ margin: '0 0 0.25rem', display: 'block' }}>
              Join {team.name}
            </Typography>
            <Typography $color="textSecondary" style={{ display: 'block', marginBottom: '1.5rem' }}>
              Enter your name to join this team. No account required.
            </Typography>
            {error && (
              <AlertBox $type="error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </AlertBox>
            )}
            <form onSubmit={handleAnonymousJoin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Label>YOUR NAME</Label>
                <Input
                  autoFocus
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex Smith"
                  required
                />
              </div>
              <Button type="submit" $variant="primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Joining...' : `Join ${team.name}`}
              </Button>
            </form>

            <Typography $variant="small" $color="textSecondary" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
              Already have an account? <Link to="/" style={{ color: '#4f46e5', fontWeight: 600 }}>Log in</Link>
            </Typography>
          </>
        )}
      </JoinCard>
    </PageWrapper>
  );
};

export default JoinPage;
