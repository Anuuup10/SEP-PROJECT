import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, LayoutDashboard, Home, User } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="glass-card" style={{ margin: '1rem 2rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#10b981', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Camera size={28} /> NutriLens
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#f3f4f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Home size={18} /> Home
        </Link>
        <Link to="/scan" style={{ color: '#f3f4f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Camera size={18} /> AI Scanner
        </Link>
        <Link to="/dashboard" style={{ color: '#f3f4f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
      </div>
    </nav>
  );
};
