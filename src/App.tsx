import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { updatePresence } from './services/presenceService';

import { ThemeProvider } from './contexts/ThemeContext';
import { TeamProvider } from './contexts/TeamContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PokerRoom from './components/PokerRoom';
import ReviewRoom from './components/ReviewRoom';
import KnowledgeBoardRoom from './components/KnowledgeBoardRoom';
import JoinPage from './components/JoinPage';
import TeamSettings from './components/TeamSettings';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initial update
    updatePresence(user.uid);

    // Heartbeat every 2 minutes
    const interval = setInterval(() => {
      updatePresence(user.uid);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public route — no auth required */}
          <Route path="/join" element={<JoinPage />} />

          {/* Unauthenticated root */}
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/dashboard" />}
          />

          {/* Authenticated routes */}
          <Route
            path="/"
            element={user ? <TeamProvider><Layout /></TeamProvider> : <Navigate to="/" />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="poker/:sessionId" element={<PokerRoom />} />
            <Route path="review/:boardId" element={<ReviewRoom />} />
            <Route path="knowledge/:boardId" element={<KnowledgeBoardRoom />} />
            <Route path="team/settings" element={<TeamSettings />} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
