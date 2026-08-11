import React from 'react';
import { Flame, Activity } from 'lucide-react';

export const FoodCard = ({ foodName, calories, macros, healthScore, insights }) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>{foodName}</h3>
        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
          Score: {healthScore}/100
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Calories</div>
          <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Flame size={16} /> {calories} kcal
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Protein</div>
          <div style={{ fontWeight: 700, color: '#06b6d4' }}>{macros?.protein || 0}g</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Carbs</div>
          <div style={{ fontWeight: 700, color: '#8b5cf6' }}>{macros?.carbs || 0}g</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Fat</div>
          <div style={{ fontWeight: 700, color: '#ec4899' }}>{macros?.fat || 0}g</div>
        </div>
      </div>

      {insights && (
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>
          💡 {insights}
        </p>
      )}
    </div>
  );
};
