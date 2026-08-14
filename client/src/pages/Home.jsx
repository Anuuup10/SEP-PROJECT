import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, ShieldCheck } from 'lucide-react';

export const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Snap. Scan. Know Your Nutrition.
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
        Instant AI-powered meal analysis using Google Gemini. Track your calories, macros, and micro-nutrients seamlessly.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
        <Link to="/scan">
          <button className="btn-primary" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={22} /> Start AI Food Scan
          </button>
        </Link>
        <Link to="/login">
          <button className="btn-secondary" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Login
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <Zap size={36} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Instant Recognition</h3>
          <p style={{ color: '#9ca3af' }}>Snap a picture of your dish and get immediate calorie & macro estimations.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <ShieldCheck size={36} color="#06b6d4" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Health Insights</h3>
          <p style={{ color: '#9ca3af' }}>Receive customized health scores and actionable dietary recommendations.</p>
        </div>
      </div>
    </div>
  );
};