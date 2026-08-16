import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nutrilens_token') || null);

  useEffect(() => {
    if (token) {
      try { setUser(JSON.parse(localStorage.getItem('nutrilens_user') || 'null')); } catch { setUser(null); }
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('nutrilens_token', newToken);
    localStorage.setItem('nutrilens_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nutrilens_token');
    localStorage.removeItem('nutrilens_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
