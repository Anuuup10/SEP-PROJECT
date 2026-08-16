import React, { useEffect, useState } from 'react';
import { FoodCard } from '../components/FoodCard';
import { useNutrition } from '../hooks/useNutrition';

export const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const { getHistory, loading } = useNutrition();

  useEffect(() => {
    getHistory()
      .then((res) => setLogs(res.data || []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Nutrition Dashboard & History
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {logs.map((item) => (
          <FoodCard
            key={item._id}
            foodName={item.foodName}
            calories={item.calories}
            macros={item.macros}
            healthScore={item.healthScore}
            insights={item.insights}
          />
        ))}
      </div>
    </div>
  );
};
