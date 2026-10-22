import React, { createContext, useContext, useState, useEffect } from 'react';
import demoService from '../services/demoService';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Check if demo mode is enabled (default is true for turnkey browser preview)
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('pp_demo_mode');
    if (saved !== null) return saved === 'true';
    return import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('pp_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('pp_demo_mode', isDemoMode.toString());
  }, [isDemoMode]);

  useEffect(() => {
    const isLoggedOut = localStorage.getItem('pp_logged_out') === 'true';
    if (!currentUser && isDemoMode && !isLoggedOut) {
      try {
        const defaultAdmin = demoService.getUsers().find(u => u.role === 'admin');
        if (defaultAdmin) {
          setCurrentUser(defaultAdmin);
          localStorage.setItem('pp_user', JSON.stringify(defaultAdmin));
        }
      } catch (err) {
        console.error('Failed to auto-select demo user:', err);
      }
    }
    setLoading(false);
  }, [isDemoMode]);

  const login = async (email, password, role) => {
    localStorage.removeItem('pp_logged_out');
    if (isDemoMode) {
      const user = demoService.login(email, role);
      setCurrentUser(user);
      localStorage.setItem('pp_user', JSON.stringify(user));
      return user;
    } else {
      const response = await apiClient.post('/auth/login', { email, password, role });
      const { user, token: authToken } = response.data;
      setCurrentUser(user);
      setToken(authToken);
      localStorage.setItem('pp_user', JSON.stringify(user));
      localStorage.setItem('pp_token', authToken);
      return user;
    }
  };

  const loginAs = (targetRole, specificUserId) => {
    localStorage.removeItem('pp_logged_out');
    if (!isDemoMode) setIsDemoMode(true);
    const users = demoService.getUsers();
    let user;

    if (specificUserId) {
      user = users.find(u => u.id === specificUserId || u._id === specificUserId);
    } else if (targetRole && targetRole.startsWith('user-')) {
      user = users.find(u => u.id === targetRole || u._id === targetRole);
    } else if (targetRole === 'judge' || targetRole === 'judge1') {
      user = users.find(u => u.id === 'user-judge-1') || users.find(u => u.role === 'judge');
    } else if (targetRole === 'judge2') {
      user = users.find(u => u.id === 'user-judge-2') || users.find(u => u.role === 'judge');
    } else if (targetRole === 'judge3') {
      user = users.find(u => u.id === 'user-judge-3') || users.find(u => u.role === 'judge');
    } else if (targetRole === 'judge4') {
      user = users.find(u => u.id === 'user-judge-4') || users.find(u => u.role === 'judge');
    } else if (targetRole === 'hr' || targetRole === 'hr1') {
      user = users.find(u => u.id === 'user-hr-1') || users.find(u => u.role === 'hr');
    } else if (targetRole === 'hr2') {
      user = users.find(u => u.id === 'user-hr-2') || users.find(u => u.role === 'hr');
    } else if (targetRole === 'admin') {
      user = users.find(u => u.role === 'admin');
    }
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('pp_user', JSON.stringify(user));
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('pp_user');
    localStorage.removeItem('pp_token');
    localStorage.setItem('pp_logged_out', 'true');
  };

  const toggleDemoMode = () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    if (nextMode && !currentUser) {
      loginAs('admin');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isDemoMode,
        loading,
        login,
        loginAs,
        logout,
        toggleDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
