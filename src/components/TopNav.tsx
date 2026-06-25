import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import { auth, updateProfile } from '../firebase';
import { Settings, Sun, Moon, User, Check, X } from 'lucide-react';
import { updateMemberNameInAllTeams } from '../services/teamService';
import { 
  Flex, 
  Typography, 
  ModalOverlay, 
  ModalContainer, 
  Button, 
  Input, 
  Label 
} from './styled';
import { AnimatePresence } from 'framer-motion';

const TopNavContainer = styled.header`
  height: 64px;
  background-color: ${props => props.theme.topNavBg};
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-sizing: border-box;
  z-index: 10;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.sidebarActive};
    color: ${props => props.theme.textPrimary};
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1.5rem;
  border-left: 1px solid ${props => props.theme.border};
`;

const UserInfo = styled.div`
  text-align: right;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TopNav: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const user = auth.currentUser;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim() || newName === user.displayName) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });
      await updateMemberNameInAllTeams(user.uid, newName.trim());
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update username.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenSettings = () => {
    setNewName(user?.displayName || '');
    setIsSettingsOpen(true);
  };

  return (
    <TopNavContainer>
      <Flex $align="center" $gap="1.5rem">
        <IconButton onClick={toggleTheme}>
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>

        <UserSection>
          <UserInfo>
            <Typography $variant="small" $weight={600} style={{ display: 'block' }}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography $variant="small" style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>
              {user?.isAnonymous ? 'Guest' : 'Developer'}
            </Typography>
          </UserInfo>
          
          <Avatar>
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL} alt="Avatar" />
            ) : (
              <User size={20} />
            )}
          </Avatar>
          
          <IconButton onClick={handleOpenSettings}>
            <Settings size={20} />
          </IconButton>
        </UserSection>
      </Flex>

      <AnimatePresence>
        {isSettingsOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <Flex $justify="space-between" $align="center" style={{ marginBottom: '1.5rem' }}>
                <Typography as="h2" $variant="h2" style={{ margin: 0 }}>
                  User Settings
                </Typography>
                <IconButton onClick={() => setIsSettingsOpen(false)}>
                  <X size={20} />
                </IconButton>
              </Flex>

              <form onSubmit={handleUpdateName}>
                <div style={{ marginBottom: '2rem' }}>
                  <Label>DISPLAY NAME</Label>
                  <Input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                  <Typography $variant="small" $color="textSecondary" style={{ marginTop: '0.5rem', display: 'block' }}>
                    This name will be visible to your teammates on boards and sessions.
                  </Typography>
                </div>

                {success && (
                  <Flex $align="center" $gap="0.5rem" style={{ marginBottom: '1.5rem', color: '#10b981' }}>
                    <Check size={16} />
                    <Typography $variant="small" style={{ color: 'inherit' }}>Username updated successfully!</Typography>
                  </Flex>
                )}

                <Flex $gap="1rem" $justify="flex-end">
                  <Button 
                    type="button" 
                    $variant="secondary" 
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    type="submit" 
                    $variant="primary" 
                    disabled={isUpdating || !newName.trim() || newName === user?.displayName}
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </Button>
                </Flex>
              </form>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </TopNavContainer>
  );
};

export default TopNav;
