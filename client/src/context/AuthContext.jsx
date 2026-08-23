import React, { createContext, useState, useEffect } from 'react';
import { clearSession, getSession, setSession } from '../services/session';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSession().user);
  const [token, setToken] = useState(() => getSession().token);

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
