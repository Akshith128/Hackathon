import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'Student' | 'Admin' | 'SeatingManager' | 'ClubCoordinator' | null;

interface AppState {
  userRole: UserRole;
  userId: string | null;
  identifier: string | null;
  login: (role: UserRole, userId: string, identifier: string) => void;
  logout: () => void;
  examMode: boolean;
  toggleExamMode: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [examMode, setExamMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedUserId = localStorage.getItem('userId');
    const savedIdentifier = localStorage.getItem('identifier');
    if (savedRole && savedUserId) {
      setUserRole(savedRole);
      setUserId(savedUserId);
      setIdentifier(savedIdentifier);
    }
  }, []);

  // Initialize dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const login = (role: UserRole, userId: string, identifier: string) => {
    setUserRole(role);
    setUserId(userId);
    setIdentifier(identifier);
    localStorage.setItem('userRole', role || '');
    localStorage.setItem('userId', userId);
    localStorage.setItem('identifier', identifier);
  };

  const logout = () => {
    setUserRole(null);
    setUserId(null);
    setIdentifier(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('identifier');
  };

  const toggleExamMode = () => setExamMode(prev => !prev);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <AppContext.Provider value={{ userRole, userId, identifier, login, logout, examMode, toggleExamMode, isDarkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
