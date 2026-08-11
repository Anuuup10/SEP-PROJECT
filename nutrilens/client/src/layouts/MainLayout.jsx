import React from 'react';
import { Navbar } from '../components/Navbar';

export const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
        NutriLens © 2026 — AI Powered Nutrition & Macro Scanner
      </footer>
    </div>
  );
};
