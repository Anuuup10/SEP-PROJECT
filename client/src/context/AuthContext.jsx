import React, { createContext, useState, useEffect } from 'react';
import { clearSession, getSession, setSession } from '../services/session';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSession().user);
  const [token, setToken] = useState(() => getSession().token);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setToken(null);
      setUser(null);
    };
    window.addEventListener('nutrilens:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('nutrilens:unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken, userData) => {
    setSession(newToken, userData);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
