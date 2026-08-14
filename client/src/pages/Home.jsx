import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Camera,
  ChevronRight,
  CircleUserRound,
  Home as HomeIcon,
  History,
  LayoutDashboard,
  ScanLine,
  UserRound,
} from 'lucide-react';
import mealImage from '../assets/images/HealthyFood-2.jpg';
import khanaLensLogo from '../assets/images/KhanaLens.jpg';
import { useAuth } from '../hooks/useAuth';
import { useNutrition } from '../hooks/useNutrition';

const demoMeals = [
  { _id: 'demo-1', foodName: 'Chicken Rice Meal', calories: 628, itemCount: 3, createdAt: '12:30 PM' },
  { _id: 'demo-2', foodName: 'Chicken Salad', calories: 486, itemCount: 2, createdAt: '8:15 AM' },
];

const defaultSummary = { calories: 1420, calorieGoal: 2000, protein: 82, proteinGoal: 120, carbs: 165, carbsGoal: 250, fat: 48, fatGoal: 70 };

function Avatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = (user?.name || 'Alex Sharma')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return user?.avatarUrl && !imageFailed ? (
    <img className="dashboard-avatar" src={user.avatarUrl} alt={`${user.name} profile`} onError={() => setImageFailed(true)} />
  ) : (
    <div className="dashboard-avatar dashboard-avatar-fallback" aria-label="Profile avatar">
      <UserRound size={21} strokeWidth={1.8} />
      <span>{initials}</span>
    </div>
  );
}

function SummaryRing({ calories, goal }) {
  const percentage = Math.min(Math.round((calories / goal) * 100), 100);
  return (
    <div className="summary-ring" style={{ '--progress': `${percentage * 3.6}deg` }}>
      <div className="summary-ring-inner">
        <strong>{calories.toLocaleString()}</strong>
        <span>/ {goal.toLocaleString()} kcal</span>
        <b>{percentage}%</b>
      </div>
    </div>
  );
}

function MacroRow({ type, label, value, goal, color }) {
  const percentage = Math.min((value / goal) * 100, 100);
  return (
    <div className="macro-row">
      <div className="macro-label"><span className={`macro-icon ${type}`}>{type === 'protein' ? '♨️' : type === 'carbs' ? '🔥' : '🟠'}</span><span>{label}</span></div>
      <strong>{value} <small>/{goal}g</small></strong>
      <div className="macro-track"><span style={{ width: `${percentage}%`, background: color }} /></div>
    </div>
  );
}

export const Home = () => {
  const { user } = useAuth();
  const { getHistory, loading } = useNutrition();
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('nutrilens_token')) return;
    getHistory().then(setHistory).catch(() => setHistory(null));
  }, [getHistory]);

  const summary = useMemo(() => ({ ...defaultSummary, ...(history?.summary?.totals || {}) }), [history]);
  const meals = history?.data?.length ? history.data.slice(0, 2) : demoMeals;
  const displayName = user?.name?.split(' ')[0] || 'Alex';

  return (
    <div className="dashboard-viewport">
      <main className="dashboard-page">
        <div className="dashboard-brandbar">
          <Link to="/" className="dashboard-brand" aria-label="KhanaLens home">
            <span className="dashboard-brand-mark"><img src={khanaLensLogo} alt="" /></span>
            <span className="dashboard-brand-copy"><strong>Khana<span>Lens</span></strong><small>Scan. Analyze. Eat Smarter.</small></span>
          </Link>
          <div className="dashboard-header-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={20} /></button>
            <Avatar user={user} />
          </div>
        </div>
        <header className="dashboard-header">
          <div>
            <h1>Hello, {displayName}! <span aria-hidden="true">👋</span></h1>
            <p>Track your nutrition today</p>
          </div>
        </header>

        <Link to="/scan" className="scan-hero">
          <div><strong>Scan Your Food</strong><span>Tap to scan or upload your meal</span></div>
          <span className="scan-hero-icon"><Camera size={22} /></span>
        </Link>

        <section className="dashboard-section">
          <div className="section-heading"><h2>Today's Summary</h2><button>Edit Goal</button></div>
          <div className="summary-card">
            <SummaryRing calories={summary.calories} goal={summary.calorieGoal} />
            <div className="macro-list">
              <MacroRow type="protein" label="Protein" value={summary.protein} goal={summary.proteinGoal} color="#55b99c" />
              <MacroRow type="carbs" label="Carbs" value={summary.carbs} goal={summary.carbsGoal} color="#f7a13b" />
              <MacroRow type="fat" label="Fat" value={summary.fat} goal={summary.fatGoal} color="#f5a333" />
            </div>
          </div>
        </section>

        <section className="dashboard-section recent-section">
          <div className="section-heading"><h2>Recent Meals</h2><Link to="/dashboard">See All</Link></div>
          <div className="meal-list">
            {loading && !history ? <div className="loading-row">Loading your meals…</div> : meals.map((meal, index) => (
              <div className="meal-row" key={meal._id || `${meal.foodName}-${index}`}>
                <img src={mealImage} alt="" />
                <div className="meal-copy"><strong>{meal.foodName}</strong><span>{meal.calories} kcal&nbsp; · &nbsp;{meal.itemCount || 3} items</span></div>
                <ChevronRight size={20} />
              </div>
            ))}
          </div>
        </section>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="active" to="/"><HomeIcon size={18} /><span>Home</span></Link>
          <Link to="/dashboard"><LayoutDashboard size={18} /><span>Progress</span></Link>
          <Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link>
          <Link to="/dashboard"><History size={18} /><span>History</span></Link>
          <Link to="/profile"><CircleUserRound size={19} /><span>Profile</span></Link>
        </nav>
      </main>
    </div>
  );
};