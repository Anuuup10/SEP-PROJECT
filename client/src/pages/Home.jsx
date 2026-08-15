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
import { getTrackedMeals } from '../services/tracker';

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
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    setAnimatedPercentage(0);
    const fillTimer = setTimeout(() => setAnimatedPercentage(100), 150);
    const settleTimer = setTimeout(() => setAnimatedPercentage(percentage), 900);
    return () => {
      clearTimeout(fillTimer);
      clearTimeout(settleTimer);
    };
  }, [percentage]);

  return (
    <div className="summary-ring" style={{ '--progress': `${animatedPercentage * 3.6}deg` }}>
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
    <div className={`macro-row ${type}`}>
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
  const [trackedMeals, setTrackedMeals] = useState(() => getTrackedMeals());
  const [goalOverride, setGoalOverride] = useState({});
  const [goalDraft, setGoalDraft] = useState({ calorieGoal: defaultSummary.calorieGoal, proteinGoal: defaultSummary.proteinGoal, carbsGoal: defaultSummary.carbsGoal, fatGoal: defaultSummary.fatGoal });
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('nutrilens_token')) return;
    getHistory().then(setHistory).catch(() => setHistory(null));
  }, [getHistory]);

  useEffect(() => {
    const syncTrackedMeals = () => setTrackedMeals(getTrackedMeals());
    window.addEventListener('nutrilens-tracker-updated', syncTrackedMeals);
    window.addEventListener('storage', syncTrackedMeals);
    return () => {
      window.removeEventListener('nutrilens-tracker-updated', syncTrackedMeals);
      window.removeEventListener('storage', syncTrackedMeals);
    };
  }, []);

  const trackedTotals = useMemo(() => trackedMeals.reduce((totals, meal) => ({
    calories: totals.calories + Number(meal.calories || 0),
    protein: totals.protein + Number(meal.protein || 0),
    carbs: totals.carbs + Number(meal.carbs || 0),
    fat: totals.fat + Number(meal.fats ?? meal.fat ?? 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [trackedMeals]);

  const summary = useMemo(() => {
    const base = { ...defaultSummary, ...(history?.summary?.totals || {}), ...goalOverride };
    return {
      ...base,
      calories: Number(base.calories || 0) + trackedTotals.calories,
      protein: Number(base.protein || 0) + trackedTotals.protein,
      carbs: Number(base.carbs || 0) + trackedTotals.carbs,
      fat: Number(base.fat || 0) + trackedTotals.fat,
    };
  }, [history, goalOverride, trackedTotals]);

  const trackedMealRows = trackedMeals.map((meal) => ({
    _id: meal.id,
    foodName: meal.mealName,
    calories: meal.calories,
    itemCount: meal.itemCount || meal.items?.length || 1,
    createdAt: meal.createdAt || 'Just now',
  }));
  const meals = [...trackedMealRows, ...(history?.data?.length ? history.data : demoMeals)].slice(0, 2);
  const displayName = user?.name?.split(' ')[0] || 'Alex';

  return (
    <div className="dashboard-viewport">
      <main className="dashboard-page">
        <div className="dashboard-brandbar">
          <Link to="/home" className="dashboard-brand" aria-label="KhanaLens home">
            <span className="dashboard-brand-mark"><img src={khanaLensLogo} alt="" /></span>
            <span className="dashboard-brand-copy"><strong>Khana<span>Lens</span></strong><small>Scan. Analyze. Eat Smarter.</small></span>
          </Link>
          <div className="dashboard-header-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={20} /></button>
            <Link to="/profile" aria-label="Open profile"><Avatar user={user} /></Link>
          </div>
        </div>
        <header className="dashboard-header">
          <div>
            <h1>Hello, {displayName}! <span aria-hidden="true">👋</span></h1>
            <p>Track your nutrition today</p>
          </div>
        </header>

        <Link to="/scan" className="scan-hero">
          <div className="scan-hero-copy"><small>SMART FOOD SCANNER</small><strong>Scan Your Food</strong><span>Tap to scan or upload your meal</span></div>
          <span className="scan-hero-icon"><Camera size={22} /><b aria-hidden="true">✦</b></span>
        </Link>

        <section className="dashboard-section">
          <div className="section-heading"><h2>Today's Summary</h2><button type="button" onClick={() => { setGoalDraft({ calorieGoal: summary.calorieGoal, proteinGoal: summary.proteinGoal, carbsGoal: summary.carbsGoal, fatGoal: summary.fatGoal }); setGoalEditorOpen(true); }}>Edit Goal</button></div>
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
          <div className="section-heading"><h2>Recent Meals</h2><Link to="/history">See All</Link></div>
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
          <Link className="active" to="/home"><HomeIcon size={18} /><span>Home</span></Link>
          <Link to="/progress"><LayoutDashboard size={18} /><span>Progress</span></Link>
          <Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link>
          <Link to="/history"><History size={18} /><span>History</span></Link>
          <Link to="/profile"><CircleUserRound size={19} /><span>Profile</span></Link>
        </nav>
        {goalEditorOpen && <div className="dashboard-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGoalEditorOpen(false); }}><section className="dashboard-goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-editor-title"><div className="dashboard-modal-heading"><div><span>YOUR DAILY TARGETS</span><h2 id="goal-editor-title">Edit nutrition goals</h2></div><button type="button" onClick={() => setGoalEditorOpen(false)} aria-label="Close goal editor">×</button></div><p>Set targets that feel realistic for your routine. These update the summary bars immediately.</p><div className="dashboard-goal-grid"><label className="goal-field-calories" htmlFor="dashboard-calorie-input">Calories<div className="dashboard-goal-input-wrap"><input id="dashboard-calorie-input" type="number" step="50" value={goalDraft.calorieGoal} onChange={(event) => setGoalDraft({ ...goalDraft, calorieGoal: event.target.value })} /><span>kcal</span></div></label><label className="goal-field-protein" htmlFor="dashboard-protein-input">Protein<div className="dashboard-goal-input-wrap"><input id="dashboard-protein-input" type="number" step="1" value={goalDraft.proteinGoal} onChange={(event) => setGoalDraft({ ...goalDraft, proteinGoal: event.target.value })} /><span>g</span></div></label><label className="goal-field-carbs" htmlFor="dashboard-carbs-input">Carbs<div className="dashboard-goal-input-wrap"><input id="dashboard-carbs-input" type="number" step="1" value={goalDraft.carbsGoal} onChange={(event) => setGoalDraft({ ...goalDraft, carbsGoal: event.target.value })} /><span>g</span></div></label><label className="goal-field-fat" htmlFor="dashboard-fat-input">Fat<div className="dashboard-goal-input-wrap"><input id="dashboard-fat-input" type="number" step="1" value={goalDraft.fatGoal} onChange={(event) => setGoalDraft({ ...goalDraft, fatGoal: event.target.value })} /><span>g</span></div></label></div><small>Enter the targets that match your personal plan.</small><button className="dashboard-goal-save" type="button" onClick={() => { setGoalOverride({ calorieGoal: Number(goalDraft.calorieGoal) || defaultSummary.calorieGoal, proteinGoal: Number(goalDraft.proteinGoal) || defaultSummary.proteinGoal, carbsGoal: Number(goalDraft.carbsGoal) || defaultSummary.carbsGoal, fatGoal: Number(goalDraft.fatGoal) || defaultSummary.fatGoal }); setGoalEditorOpen(false); }}>Save nutrition goals</button></section></div>}
      </main>
    </div>
  );
};
