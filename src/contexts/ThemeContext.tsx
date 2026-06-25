import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import type { DefaultTheme } from 'styled-components';

type ThemeMode = 'light' | 'dark';

const lightTheme: DefaultTheme = {
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  primary: '#3b82f6',
  border: '#e2e8f0',
  sidebarBg: '#ffffff',
  sidebarText: '#64748b',
  sidebarActive: '#eff6ff',
  topNavBg: '#ffffff',
};

const darkTheme: DefaultTheme = {
  background: '#0f172a',
  surface: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#3b82f6',
  border: '#334155',
  sidebarBg: '#1e293b',
  sidebarText: '#94a3b8',
  sidebarActive: '#334155',
  topNavBg: '#1e293b',
};

interface ThemeContextType {
  mode: ThemeMode;
  theme: DefaultTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
