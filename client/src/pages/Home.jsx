import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera,
  ChevronRight,
  CircleUserRound,
  Home as HomeIcon,
  History,
  LayoutDashboard,
  ScanLine,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import mealImage from '../assets/images/HealthyFood-2.jpg';
import khanaLensLogo from '../assets/images/KhanaLens.jpg';
import { useAuth } from '../hooks/useAuth';
import { useNutrition } from '../hooks/useNutrition';
import { getTrackedMeals } from '../services/tracker';
import { getProfileApi, getProgressApi, saveProfileApi } from '../services/api';
import { FoodAvatar } from '../components/FoodAvatar';

const defaultSummary = { calories: 0, calorieGoal: 2000, protein: 0, proteinGoal: 120, carbs: 0, carbsGoal: 250, fat: 0, fatGoal: 70 };

function Avatar({ user, profile }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = (user?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (profile?.avatar) return <FoodAvatar avatar={profile.avatar} className="dashboard-food-avatar" alt={`${user?.name || 'User'} food avatar`} />;
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
  const percentage = goal > 0 ? Math.min(Math.round((calories / goal) * 100), 100) : 0;
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
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div className={`macro-row ${type}`}>
      <div className="macro-label"><span className={`macro-icon ${type}`}>{type === 'protein' ? '♨️' : type === 'carbs' ? '🔥' : '🟠'}</span><span>{label}</span></div>
      <strong>{value} <small>/{goal}g</small></strong>
      <div className="macro-track"><span style={{ width: `${percentage}%`, background: color }} /></div>
    </div>
  );
}

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getHistory, loading } = useNutrition();
  const [history, setHistory] = useState({ summary: { totals: {} }, data: [] });
  const [profile, setProfile] = useState(null);
  const progressCacheKey = useMemo(() => `nutrilens_progress:${user?.id || 'guest'}`, [user?.id]);
  const [nutritionProgress, setNutritionProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(`nutrilens_progress:${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedProgressDate, setSelectedProgressDate] = useState(() => {
    try {
      const saved = localStorage.getItem(`nutrilens_progress:${user?.id || 'guest'}`);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.days?.[parsed.days.length - 1]?.date || null;
    } catch {
      return null;
    }
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [trackedMeals, setTrackedMeals] = useState(() => getTrackedMeals(user?.id));
  const [goalOverride, setGoalOverride] = useState({});
  const [goalDraft, setGoalDraft] = useState({ calorieGoal: defaultSummary.calorieGoal, proteinGoal: defaultSummary.proteinGoal, carbsGoal: defaultSummary.carbsGoal, fatGoal: defaultSummary.fatGoal });
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);

  const fetchDashboardData = (retryCount = 0) => {
    if (!user?.id) return;
    let cachedProfile = null;
    try { cachedProfile = JSON.parse(localStorage.getItem(`nutrilens_profile:${user.id}`) || 'null'); } catch { cachedProfile = null; }
    if (cachedProfile) cachedProfile.completed = Boolean(cachedProfile.name && cachedProfile.age && cachedProfile.gender && cachedProfile.height && cachedProfile.currentWeight);
    setProfile(cachedProfile);
    setProfileLoading(true);
    setTrackedMeals(getTrackedMeals(user.id));

    getHistory()
      .then(setHistory)
      .catch(() => {
        if (retryCount < 2) setTimeout(() => fetchDashboardData(retryCount + 1), 1500);
      });

    getProgressApi('week')
      .then((response) => {
        const nextProgress = response.data.data;
        if (nextProgress) {
          setNutritionProgress(nextProgress);
          localStorage.setItem(progressCacheKey, JSON.stringify(nextProgress));
          setSelectedProgressDate((prev) => prev || nextProgress.days?.[nextProgress.days.length - 1]?.date || null);
        }
      })
      .catch(() => {
        if (retryCount < 2) setTimeout(() => fetchDashboardData(retryCount + 1), 1500);
      });

    getProfileApi()
      .then((response) => {
        const nextProfile = response.data.data;
        const resolvedProfile = nextProfile || cachedProfile;
        setProfile(resolvedProfile);
        setGoalOverride({ calorieGoal: Number(resolvedProfile?.calorieGoal || defaultSummary.calorieGoal), proteinGoal: Number(resolvedProfile?.proteinGoal || defaultSummary.proteinGoal), carbsGoal: Number(resolvedProfile?.carbsGoal || defaultSummary.carbsGoal), fatGoal: Number(resolvedProfile?.fatGoal || defaultSummary.fatGoal) });
        setGoalDraft({ calorieGoal: Number(resolvedProfile?.calorieGoal || defaultSummary.calorieGoal), proteinGoal: Number(resolvedProfile?.proteinGoal || defaultSummary.proteinGoal), carbsGoal: Number(resolvedProfile?.carbsGoal || defaultSummary.carbsGoal), fatGoal: Number(resolvedProfile?.fatGoal || defaultSummary.fatGoal) });
      })
      .catch(() => setProfile(cachedProfile))
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [getHistory, user?.id, location.key]);

  useEffect(() => {
    const syncTrackedMeals = () => {
      setTrackedMeals(getTrackedMeals(user?.id));
      getHistory().then(setHistory).catch(() => {});
      getProgressApi('week')
        .then((response) => {
          if (response.data.data) {
            setNutritionProgress(response.data.data);
            localStorage.setItem(progressCacheKey, JSON.stringify(response.data.data));
          }
        })
        .catch(() => {});
    };
    window.addEventListener('nutrilens-tracker-updated', syncTrackedMeals);
    window.addEventListener('storage', syncTrackedMeals);
    return () => {
      window.removeEventListener('nutrilens-tracker-updated', syncTrackedMeals);
      window.removeEventListener('storage', syncTrackedMeals);
    };
  }, [user?.id, getHistory, progressCacheKey]);

  const progressDays = nutritionProgress?.days || [];
  const selectedDay = progressDays.find((day) => day.date === selectedProgressDate) || progressDays[progressDays.length - 1];

  const summary = useMemo(() => {
    const mealTotals = (selectedDay?.meals || []).reduce((totals, meal) => ({
      calories: totals.calories + Number(meal.calories ?? meal.totals?.calories ?? meal.totalKcal ?? 0),
      protein: totals.protein + Number(meal.protein ?? meal.totals?.protein ?? 0),
      carbs: totals.carbs + Number(meal.carbs ?? meal.totals?.carbohydrates ?? meal.totals?.carbs ?? 0),
      fat: totals.fat + Number(meal.fat ?? meal.fats ?? meal.totals?.fat ?? 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const rawCals = Number(selectedDay?.calories);
    const resolvedCals = Number.isFinite(rawCals) && rawCals > 0 ? rawCals : mealTotals.calories;

    const rawPro = Number(selectedDay?.protein);
    const resolvedPro = Number.isFinite(rawPro) && rawPro > 0 ? rawPro : mealTotals.protein;

    const rawCarbs = Number(selectedDay?.carbs);
    const resolvedCarbs = Number.isFinite(rawCarbs) && rawCarbs > 0 ? rawCarbs : mealTotals.carbs;

    const rawFat = Number(selectedDay?.fat);
    const resolvedFat = Number.isFinite(rawFat) && rawFat > 0 ? rawFat : mealTotals.fat;

    const base = {
      ...defaultSummary,
      calories: Math.round(resolvedCals || 0),
      protein: Math.round(resolvedPro || 0),
      carbs: Math.round(resolvedCarbs || 0),
      fat: Math.round(resolvedFat || 0),
      calorieGoal: Number(profile?.calorieGoal || defaultSummary.calorieGoal),
      proteinGoal: Number(profile?.proteinGoal || defaultSummary.proteinGoal),
      carbsGoal: Number(profile?.carbsGoal || defaultSummary.carbsGoal),
      fatGoal: Number(profile?.fatGoal || defaultSummary.fatGoal),
      ...goalOverride
    };
    return base;
  }, [nutritionProgress, selectedDay, goalOverride, profile?.calorieGoal, profile?.proteinGoal, profile?.carbsGoal, profile?.fatGoal]);


  const trackedMealRows = trackedMeals.map((meal) => ({
    _id: meal.id,
    foodName: meal.mealName,
    calories: meal.calories,
    itemCount: meal.itemCount || meal.items?.length || 1,
    createdAt: meal.createdAt || 'Just now',
    image: meal.image || meal.imageUrl,
    items: meal.items,
  }));
  const isSelectedPastDay = Boolean(selectedProgressDate && selectedDay && selectedDay.date !== progressDays[progressDays.length - 1]?.date);
  const selectedDayName = selectedDay ? new Date(`${selectedDay.date}T12:00:00Z`).toLocaleDateString([], { weekday: 'long' }) : 'Today';
  const selectedDayMealRows = (selectedDay?.meals || []).map((meal) => ({
    ...meal,
    _id: meal.id,
    foodName: meal.name || 'Saved meal',
    calories: Number(meal.calories ?? meal.totals?.calories ?? 0),
    protein: Number(meal.protein ?? meal.totals?.protein ?? 0),
    carbs: Number(meal.carbs ?? meal.totals?.carbohydrates ?? 0),
    fats: Number(meal.fats ?? meal.fat ?? meal.totals?.fat ?? 0),
    fiber: Number(meal.fiber ?? meal.totals?.fiber ?? 0),
    sodium: Number(meal.sodium ?? meal.totals?.sodium ?? 0),
    itemCount: meal.items || 1,
    image: meal.image,
  }));

  const selectedDayTrackedMealRows = trackedMealRows.filter((meal) => {
    if (!selectedDay?.date || !meal.createdAt || meal.createdAt === 'Just now') return false;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(meal.createdAt));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}` === selectedDay.date;
  });

  const meals = useMemo(() => {
    if (!selectedDay) return [];
    return [...selectedDayMealRows, ...selectedDayTrackedMealRows]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [selectedDay, selectedDayMealRows, selectedDayTrackedMealRows]);

  const displayName = user?.name?.split(' ')[0] || 'there';
  const saveGoals = async () => {
    if (!profile) return;
    const nextProfile = { ...profile, calorieGoal: Number(goalDraft.calorieGoal) || 0, proteinGoal: Number(goalDraft.proteinGoal) || 0, carbsGoal: Number(goalDraft.carbsGoal) || 0, fatGoal: Number(goalDraft.fatGoal) || 0 };
    setProfile(nextProfile);
    setGoalOverride({ calorieGoal: nextProfile.calorieGoal, proteinGoal: nextProfile.proteinGoal, carbsGoal: nextProfile.carbsGoal, fatGoal: nextProfile.fatGoal });
    setGoalEditorOpen(false);
    await saveProfileApi(nextProfile);
  };
  const openMealDetails = (meal) => {
    navigate(`/food/${meal._id || 'recent-meal'}`, {
      state: {
        item: {
          id: meal._id,
          name: meal.foodName || 'Recent meal',
          portion: `${meal.itemCount || 1} items`,
          kcal: Number(meal.calories || meal.kcal || 0),
          protein: Number(meal.protein ?? meal.totals?.protein ?? 0),
          carbs: Number(meal.carbs ?? meal.totals?.carbohydrates ?? 0),
          fat: Number(meal.fats ?? meal.fat ?? meal.totals?.fat ?? 0),
          fiber: Number(meal.fiber ?? meal.totals?.fiber ?? 0),
          sodium: Number(meal.sodium ?? meal.totals?.sodium ?? 0),
          image: meal.image || mealImage,
          items: meal.items,
        },
      },
    });
  };

  return (
    <div className="dashboard-viewport">
      <main className="dashboard-page">
        <div className="dashboard-brandbar">
          <Link to="/home" className="dashboard-brand" aria-label="KhanaLens home">
            <span className="dashboard-brand-mark"><img src={khanaLensLogo} alt="" /></span>
            <span className="dashboard-brand-copy"><strong>Khana<span>Lens</span></strong><small>Scan. Analyze. Eat Smarter.</small></span>
          </Link>
          <div className="dashboard-header-actions">
            <Link className="icon-button" to="/meal-plan" aria-label="Open 7-Day Meal Planner" title="7-Day Meal Plan">
              <UtensilsCrossed size={19} />
            </Link>
            <Link to="/profile" aria-label="Open profile"><Avatar user={user} profile={profile} /></Link>
          </div>
        </div>
        <header className="dashboard-header">
          <div>
            <h1>Hello, {displayName}! <span aria-hidden="true">👋</span></h1>
            <p>Track your nutrition today</p>
          </div>
        </header>

        {!profileLoading && !profile?.completed && <Link to="/profile" className="dashboard-profile-setup"><strong>Set up your profile</strong><span>Add your body details and nutrition goals to personalize KhanaLens.</span><b>Set your profile&nbsp; →</b></Link>}

        <Link to="/scan" className="scan-hero">
          <div className="scan-hero-copy"><small>SMART FOOD SCANNER</small><strong>Scan Your Food</strong><span>Tap to scan or upload your meal</span></div>
          <span className="scan-hero-icon"><Camera size={22} /><b aria-hidden="true">✦</b></span>
        </Link>

        <section className="dashboard-section">
          <div className="section-heading"><h2>{!isSelectedPastDay ? "Today's Summary" : `${selectedDayName}'s Summary`}</h2><button type="button" onClick={() => { setGoalDraft({ calorieGoal: summary.calorieGoal, proteinGoal: summary.proteinGoal, carbsGoal: summary.carbsGoal, fatGoal: summary.fatGoal }); setGoalEditorOpen(true); }}>Edit Goal</button></div>
          <div className="summary-card">
            <SummaryRing calories={summary.calories} goal={summary.calorieGoal} />
            <div className="macro-list">
              <MacroRow type="protein" label="Protein" value={summary.protein} goal={summary.proteinGoal} color="#55b99c" />
              <MacroRow type="carbs" label="Carbs" value={summary.carbs} goal={summary.carbsGoal} color="#f7a13b" />
              <MacroRow type="fat" label="Fat" value={summary.fat} goal={summary.fatGoal} color="#f5a333" />
            </div>
          </div>
        </section>

        <section className="dashboard-section weekly-scans-section" aria-labelledby="weekly-scans-title">
          <div className="section-heading"><h2 id="weekly-scans-title">Last 7 days</h2><Link to="/progress">View progress</Link></div>
          <div className="weekly-scans-card">
            <div className="weekly-day-strip">
              {progressDays.map((day) => {
                const date = new Date(`${day.date}T00:00:00Z`);
                const isSelected = day.date === (selectedDay?.date || selectedProgressDate);
                return <button type="button" key={day.date} className={`weekly-day ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedProgressDate(day.date)} aria-label={`${date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}: ${day.meals.length} scans`}><span>{date.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span><strong>{date.getUTCDate()}</strong>{day.meals.length > 0 && <i aria-hidden="true" />}</button>;
              })}
              {!progressDays.length && <div className="weekly-scans-empty">Loading scan history…</div>}
            </div>
            {selectedDay && <div className="weekly-day-summary"><strong>{selectedDay.meals.length} {selectedDay.meals.length === 1 ? 'scan' : 'scans'}</strong><span>{Math.round(selectedDay.calories).toLocaleString()} kcal saved for {new Date(`${selectedDay.date}T00:00:00Z`).toLocaleDateString([], { weekday: 'long' })}</span></div>}
          </div>
        </section>

        <section className="dashboard-section recent-section">
          <div className="section-heading"><h2>{isSelectedPastDay ? `Meals for ${selectedDayName}` : 'Recent Meals'}</h2><Link to="/history">See All</Link></div>
          <div className="meal-list">
            {loading && (!history?.data || history.data.length === 0) ? (
              <div className="loading-row">Loading your meals…</div>
            ) : meals.length === 0 ? (
              <div className="dashboard-empty-meals">
                <p>No meals recorded {isSelectedPastDay ? `for ${selectedDayName}` : 'yet'}.</p>
                <Link to="/scan" className="dashboard-empty-scan-link">
                  <Camera size={14} />
                  <span>Scan your meal</span>
                </Link>
              </div>
            ) : (
              meals.map((meal, index) => (
                <div className="meal-row" key={meal._id || `${meal.foodName}-${index}`} role="button" tabIndex="0" onClick={() => openMealDetails(meal)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openMealDetails(meal); }}>
                  <img src={meal.image || meal.imageUrl || mealImage} alt={meal.foodName || 'Recent meal'} />
                  <div className="meal-copy"><strong>{meal.foodName}</strong><span>{Math.round(meal.calories)} kcal&nbsp; · &nbsp;{meal.itemCount || 1} {meal.itemCount === 1 ? 'item' : 'items'}</span></div>
                  <ChevronRight size={20} />
                </div>
              ))
            )}
          </div>
        </section>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="active" to="/home"><HomeIcon size={18} /><span>Home</span></Link>
          <Link to="/progress"><LayoutDashboard size={18} /><span>Progress</span></Link>
          <Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link>
          <Link to="/history"><History size={18} /><span>History</span></Link>
          <Link to="/profile"><CircleUserRound size={19} /><span>Profile</span></Link>
        </nav>
        {goalEditorOpen && <div className="dashboard-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGoalEditorOpen(false); }}><section className="dashboard-goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-editor-title"><div className="dashboard-modal-heading"><div><span>YOUR DAILY TARGETS</span><h2 id="goal-editor-title">Edit nutrition goals</h2></div><button type="button" onClick={() => setGoalEditorOpen(false)} aria-label="Close goal editor">×</button></div><p>Set targets that feel realistic for your routine. These update the summary bars immediately.</p><div className="dashboard-goal-grid"><label className="goal-field-calories" htmlFor="dashboard-calorie-input">Calories<div className="dashboard-goal-input-wrap"><input id="dashboard-calorie-input" type="number" step="50" value={goalDraft.calorieGoal} onChange={(event) => setGoalDraft({ ...goalDraft, calorieGoal: event.target.value })} /><span>kcal</span></div></label><label className="goal-field-protein" htmlFor="dashboard-protein-input">Protein<div className="dashboard-goal-input-wrap"><input id="dashboard-protein-input" type="number" step="1" value={goalDraft.proteinGoal} onChange={(event) => setGoalDraft({ ...goalDraft, proteinGoal: event.target.value })} /><span>g</span></div></label><label className="goal-field-carbs" htmlFor="dashboard-carbs-input">Carbs<div className="dashboard-goal-input-wrap"><input id="dashboard-carbs-input" type="number" step="1" value={goalDraft.carbsGoal} onChange={(event) => setGoalDraft({ ...goalDraft, carbsGoal: event.target.value })} /><span>g</span></div></label><label className="goal-field-fat" htmlFor="dashboard-fat-input">Fat<div className="dashboard-goal-input-wrap"><input id="dashboard-fat-input" type="number" step="1" value={goalDraft.fatGoal} onChange={(event) => setGoalDraft({ ...goalDraft, fatGoal: event.target.value })} /><span>g</span></div></label></div><small>Enter the targets that match your personal plan.</small><button className="dashboard-goal-save" type="button" onClick={saveGoals}>Save nutrition goals</button></section></div>}
      </main>
    </div>
  );
};
