import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { useTheme } from 'styled-components';
import { 
  Mail, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  twitterProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from '../firebase';
import { Button, Input, Flex, Typography } from './styled';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: ${props => props.theme.background};
  font-family: 'Inter', sans-serif;
`;

const SuggestiveSidebar = styled.div`
  flex: 1.2;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const DecorativeCircle = styled.div<{ $top?: string; $left?: string; $bottom?: string; $right?: string; $size: string }>`
  position: absolute;
  top: ${props => props.$top || 'auto'};
  left: ${props => props.$left || 'auto'};
  bottom: ${props => props.$bottom || 'auto'};
  right: ${props => props.$right || 'auto'};
  width: ${props => props.$size};
  height: ${props => props.$size};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const BrandIconBox = styled.div`
  background-color: white;
  padding: 0.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 600px;
`;

const FeatureItemWrapper = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const FeatureIconBox = styled.div`
  background-color: rgba(255, 255, 255, 0.15);
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FloatingCardContainer = styled(motion.div)`
  position: absolute;
  bottom: 10%;
  right: 10%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 240px;
`;

const PokerCardMini = styled.div`
  width: 32px;
  height: 48px;
  background-color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.8rem;
`;

const LoginFormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${props => props.theme.surface};
`;

const LoginFormWrapper = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

const SocialButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StyledSocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.theme.textSecondary};

  &:hover {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.textPrimary};
  }
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: ${props => props.theme.border};
`;

const SeparatorLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${props => props.theme.border};
`;

const SeparatorText = styled.span`
  padding: 0 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => props.theme.textSecondary};
`;

const StyledInputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: ${props => props.theme.textSecondary};
  display: flex;
  align-items: center;
`;

const StyledInput = styled(Input)`
  padding-left: 3rem;
`;

const ErrorMessage = styled(motion.div)`
  color: #ef4444;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #fee2e2;
  overflow: hidden;
`;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme() as any;

  const handleSocialLogin = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Sign-in provider not enabled. Please enable it in the Firebase Console.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, "demo@agiletools.app", "agile-demo-2026");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is disabled.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, "demo@agiletools.app", "agile-demo-2026");
        } catch (createErr: any) {
          setError("Demo setup failed. Please enable Email/Password auth.");
        }
      } else {
        setError("Demo login error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      {/* Left Side: Suggestive Design */}
      <SuggestiveSidebar>
        <DecorativeCircle $top="-10%" $left="-10%" $size="400px" />
        <DecorativeCircle $bottom="-5%" $right="-5%" $size="300px" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <BrandContainer>
            <BrandIconBox>
              <BarChart3 color="#4f46e5" size={32} />
            </BrandIconBox>
            <Typography $variant="h1" $color="white">AgileTools</Typography>
          </BrandContainer>

          <Typography as="h1" $variant="h1" $color="white" style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', display: 'block' }}>
            Hold your ceremonies <br />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>with confidence.</span>
          </Typography>
          
          <Typography $color="rgba(255,255,255,0.8)" style={{ fontSize: '1.25rem', maxWidth: '500px', lineHeight: 1.6, marginBottom: '3rem', display: 'block' }}>
            The all-in-one real-time collaboration platform for distributed teams. Planning Poker, Sprint Reviews, and Knowledge Mapping in one place.
          </Typography>

          <FeatureGrid>
            <FeatureItem icon={<CheckCircle2 size={20} />} title="Planning Poker" desc="Hidden voting to avoid bias." />
            <FeatureItem icon={<MessageSquare size={20} />} title="Sprint Review" desc="Interactive 3-column boards." />
            <FeatureItem icon={<Users size={20} />} title="Knowledge Matrix" desc="Map team expertise visually." />
            <FeatureItem 
              icon={
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} 
                />
              } 
              title="Real-time Sync" 
              desc="Zero latency updates." 
            />
          </FeatureGrid>
        </motion.div>

        {/* Suggestive Card Floating */}
        <FloatingCardContainer 
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Flex $gap="0.5rem" style={{ marginBottom: '1rem' }}>
            {[1, 2, 3, 5, 8].map(v => (
              <PokerCardMini key={v}>{v}</PokerCardMini>
            ))}
          </Flex>
          <Typography $variant="small" $weight={600} style={{ display: 'block' }}>Estimation Room active</Typography>
          <Typography $variant="small" style={{ opacity: 0.7, fontSize: '0.7rem', display: 'block' }}>4 developers voting...</Typography>
        </FloatingCardContainer>
      </SuggestiveSidebar>

      {/* Right Side: Login Form */}
      <LoginFormSection>
        <LoginFormWrapper 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <Typography as="h2" $variant="h2" style={{ marginBottom: '0.5rem', display: 'block' }}>
              {isLogin ? 'Sign In' : 'Join AgileTools'}
            </Typography>
            <Typography $variant="small" $color={theme.textSecondary}>
              {isLogin ? 'Welcome back! Enter your details to continue.' : 'Create an account to start your first session.'}
            </Typography>
          </div>

          <SocialButtonsGrid>
            <SocialButton onClick={() => handleSocialLogin(googleProvider)} icon={<GoogleIcon />} />
            <SocialButton onClick={() => handleSocialLogin(githubProvider)} icon={<GithubIcon />} />
            <SocialButton onClick={() => handleSocialLogin(twitterProvider)} icon={<TwitterIcon />} />
          </SocialButtonsGrid>

          <Separator>
            <SeparatorLine />
            <SeparatorText>or use email</SeparatorText>
            <SeparatorLine />
          </Separator>

          <form onSubmit={handleEmailAuth}>
            <StyledInputGroup>
              <InputIcon><Mail size={18} /></InputIcon>
              <StyledInput 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </StyledInputGroup>
            <StyledInputGroup style={{ marginBottom: '1.5rem' }}>
              <InputIcon><Lock size={18} /></InputIcon>
              <StyledInput 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </StyledInputGroup>

            <AnimatePresence>
              {error && (
                <ErrorMessage 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </ErrorMessage>
              )}
            </AnimatePresence>

            <Button 
              disabled={loading}
              $variant="primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Button 
              onClick={handleDemoLogin}
              type="button"
              $variant="secondary"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              Try with Demo Account
            </Button>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.textSecondary,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </LoginFormWrapper>
      </LoginFormSection>
    </LoginContainer>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <FeatureItemWrapper>
    <FeatureIconBox>
      {icon}
    </FeatureIconBox>
    <div>
      <Typography $weight={700} style={{ display: 'block' }}>{title}</Typography>
      <Typography $variant="small" style={{ opacity: 0.7, display: 'block' }}>{desc}</Typography>
    </div>
  </FeatureItemWrapper>
);

const SocialButton = ({ onClick, icon }: any) => (
  <StyledSocialButton 
    type="button"
    onClick={onClick}
  >
    {icon}
  </StyledSocialButton>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.64 12.2727C23.64 11.4239 23.568 10.742 23.424 10.0602H12V14.1205H18.672C18.432 15.5409 17.52 17.3943 15.84 18.5909L15.8201 18.7214L19.011 21.1895L19.2327 21.2114C21.264 19.3409 22.44 16.5909 22.44 13.2727C22.44 12.9318 22.404 12.6023 23.64 12.2727Z" fill="#4285F4"/>
    <path d="M12 24C15.24 24 17.952 22.9205 19.92 21.0795L15.84 17.8977C14.736 18.6636 13.488 19.1636 12 19.1636C8.856 19.1636 6.192 17.0227 5.232 14.1205L5.10659 14.1311L1.78311 16.6974L1.73977 16.8182C3.72 20.75 7.788 24 12 24Z" fill="#34A853"/>
    <path d="M5.232 14.1205C4.992 13.4239 4.848 12.6773 4.848 11.8864C4.848 11.0955 4.992 10.3489 5.208 9.65227L5.20235 9.50742L1.87932 6.94164L1.73977 7.00682C1.008 8.47727 0.6 10.125 0.6 11.8864C0.6 13.6477 1.008 15.2955 1.73977 16.7659L5.232 14.1205Z" fill="#FBBC05"/>
    <path d="M12 4.63636C14.244 4.63636 15.756 5.59091 16.62 6.40909L19.668 3.44318C17.76 1.66364 15.132 0.6 12 0.6C7.788 0.6 3.72 3.85 1.73977 7.78182L5.208 10.4227C6.192 7.52045 8.856 4.63636 12 4.63636Z" fill="#EB4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-94 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);

export default Login;
