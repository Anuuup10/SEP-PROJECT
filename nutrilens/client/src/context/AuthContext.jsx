import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nutrilens_token') || null);

  useEffect(() => {
    if (token) {
      // Decode or restore session
      setUser({ name: 'Demo User', email: 'user@nutrilens.ai' });
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('nutrilens_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nutrilens_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
