import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Flame,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateMealPlanApi, getMealPlanApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

// Rich SVG Meal Plate Icons tailored to Breakfast, Lunch, Snack, Dinner
const MealPlate = ({ type = '' }) => {
  const norm = type.toLowerCase().trim();
  if (norm.includes('breakfast')) {
    return (
      <div className="meal-plate breakfast">
        <svg viewBox="0 0 48 48" className="plate-svg">
          <circle cx="24" cy="24" r="21" fill="#fff" stroke="#fde68a" strokeWidth="2" />
          <circle cx="24" cy="24" r="16" fill="#fef3c7" />
          {/* Egg White & Yolk */}
          <ellipse cx="20" cy="24" rx="7" ry="6" fill="#ffffff" />
          <circle cx="20" cy="24" r="3.5" fill="#f59e0b" />
          {/* Bacon/Sausage strips */}
          <rect x="26" y="16" width="3" height="15" rx="1.5" fill="#ef4444" transform="rotate(15 26 16)" />
          <rect x="30" y="18" width="2.5" height="13" rx="1.2" fill="#dc2626" transform="rotate(15 30 18)" />
          {/* Herbs */}
          <line x1="15" y1="33" x2="27" y2="35" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (norm.includes('lunch')) {
    return (
      <div className="meal-plate lunch">
        <svg viewBox="0 0 48 48" className="plate-svg">
          <circle cx="24" cy="24" r="21" fill="#fff" stroke="#a7f3d0" strokeWidth="2" />
          <circle cx="24" cy="24" r="16" fill="#d1fae5" />
          {/* Salad Bowl & Veggies */}
          <circle cx="24" cy="24" r="10" fill="#10b981" />
          <circle cx="21" cy="21" r="3" fill="#ef4444" />
          <circle cx="27" cy="23" r="2.5" fill="#f59e0b" />
          <circle cx="24" cy="28" r="2.5" fill="#3b82f6" />
          <ellipse cx="24" cy="24" rx="2" ry="4" fill="#6ee7b7" transform="rotate(45 24 24)" />
        </svg>
      </div>
    );
  }
  if (norm.includes('snack') || norm.includes('tea') || norm.includes('coffee')) {
    return (
      <div className="meal-plate snack">
        <svg viewBox="0 0 48 48" className="plate-svg">
          <circle cx="24" cy="24" r="21" fill="#fff" stroke="#fbcfe8" strokeWidth="2" />
          <circle cx="24" cy="24" r="16" fill="#fce7f3" />
          {/* Fruit / Smoothie & Berries */}
          <circle cx="20" cy="24" r="5" fill="#ec4899" />
          <circle cx="28" cy="22" r="4" fill="#8b5cf6" />
          <circle cx="25" cy="29" r="3.5" fill="#f97316" />
          <circle cx="22" cy="18" r="1.5" fill="#10b981" />
        </svg>
      </div>
    );
  }
  // Dinner
  return (
    <div className="meal-plate dinner">
      <svg viewBox="0 0 48 48" className="plate-svg">
        <circle cx="24" cy="24" r="21" fill="#fff" stroke="#fed7aa" strokeWidth="2" />
        <circle cx="24" cy="24" r="16" fill="#ffedd5" />
        {/* Main Dish */}
        <ellipse cx="21" cy="23" rx="7" ry="5" fill="#b45309" />
        <circle cx="29" cy="26" r="4.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <ellipse cx="25" cy="18" rx="2.5" ry="4" fill="#10b981" transform="rotate(30 25 18)" />
      </svg>
    </div>
  );
};

export default function MealPlanner() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic 7 days starting from TODAY (index 0)
  const rollingDaysList = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      list.push({
        name: d.toLocaleDateString('en-US', { weekday: 'long' }),
        short: d.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday: i === 0,
        subLabel: i === 0 ? 'today' : `d${i + 1}`,
        dateNum: d.getDate()
      });
    }
    return list;
  }, []);

  const cacheKey = useMemo(() => `nutrilens_saved_plan_7d:${user?.id || 'guest'}`, [user?.id]);

  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem(cacheKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // 0 is ALWAYS Today
  const [expandedMeals, setExpandedMeals] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [cooldownState, setCooldownState] = useState({
    canRegenerate: true,
    remainingMs: 0,
    hoursLeft: 0,
    daysLeft: 0,
    nextAvailableAt: null
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Fetch saved plan and cooldown info from server on mount
  useEffect(() => {
    let isMounted = true;
    const fetchExistingPlan = async () => {
      try {
        const response = await getMealPlanApi();
        if (!isMounted) return;
        if (response.data.data) {
          setPlan(response.data.data);
          if (response.data.cooldown) {
            setCooldownState(response.data.cooldown);
          }
        }
      } catch (err) {
        // Fallback to cached plan if available
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    fetchExistingPlan();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (plan) localStorage.setItem(cacheKey, JSON.stringify(plan));
  }, [plan, cacheKey]);

  const generate = async () => {
    // Check 3-day cooldown client-side
    if (cooldownState && !cooldownState.canRegenerate) {
      const timeRemainingStr =
        cooldownState.hoursLeft > 24
          ? `${cooldownState.daysLeft} day(s)`
          : `${cooldownState.hoursLeft} hour(s)`;
      showToast(`Regeneration locked. Available in ${timeRemainingStr} (3-day cooldown).`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await generateMealPlanApi();
      const newPlan = response.data.data;
      setPlan(newPlan);
      setSelectedDayIdx(0); // Reset to today
      if (response.data.cooldown) {
        setCooldownState(response.data.cooldown);
      } else {
        setCooldownState({
          canRegenerate: false,
          remainingMs: 3 * 24 * 60 * 60 * 1000,
          hoursLeft: 72,
          daysLeft: 3
        });
      }
      setExpandedMeals({});
      showToast('7-Day meal plan generated starting from today!');
    } catch (requestError) {
      const resp = requestError.response?.data;
      if (resp?.cooldown) {
        setCooldownState(resp.cooldown);
      }
      setError(
        resp?.message ||
          'Could not generate 7-day meal plan. Please check your internet or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Safe active day plan matching the selected rolling day
  const activeDayPlan = useMemo(() => {
    if (!plan?.days || !Array.isArray(plan.days) || plan.days.length === 0) return null;
    const currentTargetDay = rollingDaysList[selectedDayIdx];
    // Match by exact day name first
    const matched = plan.days.find(
      (d) => d?.day?.toLowerCase() === currentTargetDay?.name?.toLowerCase()
    );
    if (matched) return matched;
    // Otherwise fallback by index or first item
    return plan.days[selectedDayIdx] || plan.days[0];
  }, [plan, selectedDayIdx, rollingDaysList]);

  const goals = useMemo(
    () => plan?.goals || { calories: 2000, protein: 120, carbs: 250, fat: 70 },
    [plan]
  );
  const activeTotals = useMemo(
    () => activeDayPlan?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    [activeDayPlan]
  );

  // Calorie calculations matching reference
  const plannedCalories = Math.round(activeTotals.calories);
  const goalCalories = Number(goals.calories || 2000);
  const caloriesLeft = Math.max(0, goalCalories - plannedCalories);
  const calPercent =
    goalCalories > 0
      ? Math.min(Math.round((plannedCalories / goalCalories) * 100), 100)
      : 0;

  const proPercent =
    goals.protein > 0
      ? Math.min(Math.round((activeTotals.protein / goals.protein) * 100), 100)
      : 0;
  const carbPercent =
    goals.carbs > 0
      ? Math.min(Math.round((activeTotals.carbs / goals.carbs) * 100), 100)
      : 0;
  const fatPercent =
    goals.fat > 0
      ? Math.min(Math.round((activeTotals.fat / goals.fat) * 100), 100)
      : 0;

  const toggleAccordion = (mealKey) => {
    setExpandedMeals((prev) => ({ ...prev, [mealKey]: !prev[mealKey] }));
  };

  const handleCopyPlan = () => {
    if (!plan?.days) return;
    const text =
      `7-Day Personalized Meal Plan (Starting Today):\n\n` +
      plan.days
        .map(
          (d) =>
            `=== ${d.day.toUpperCase()} (${Math.round(d.totals.calories)} kcal) ===\n` +
            d.meals
              .map(
                (m) =>
                  `• ${m.type} (${m.time}): ${m.title} [${Math.round(m.calories)} kcal]\n  Items: ${m.foods.join(', ')}`
              )
              .join('\n')
        )
        .join('\n\n') +
      `\n\nDaily Goals: ${goals.calories} kcal | ${goals.protein}g Protein | ${goals.carbs}g Carbs | ${goals.fat}g Fat`;

    navigator.clipboard?.writeText(text).then(() =>
      showToast('Full 7-day plan copied to clipboard')
    );
  };

  return (
    <div className="planner-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="planner-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="planner-shell">
        {/* Navigation & Header */}
        <header className="planner-header">
          <button
            type="button"
            className="planner-back"
            onClick={() => navigate('/home')}
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="planner-header-title">
            <h1>7-Day Meal Plan</h1>
          </div>
          <div className="planner-header-actions">
            {plan && (
              <>
                <button
                  type="button"
                  className="planner-action-btn"
                  onClick={handleCopyPlan}
                  title="Copy 7-day plan"
                  aria-label="Copy 7-day plan"
                >
                  <Share2 size={17} />
                </button>
                <button
                  type="button"
                  className={`planner-action-btn ${!cooldownState.canRegenerate ? 'disabled' : ''}`}
                  onClick={generate}
                  title={
                    cooldownState.canRegenerate
                      ? 'Regenerate 7-day plan'
                      : `Regenerate available in ${cooldownState.hoursLeft > 24 ? `${cooldownState.daysLeft} days` : `${cooldownState.hoursLeft} hours`} (3-day cooldown)`
                  }
                  aria-label="Regenerate plan"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw size={16} className="planner-spin" />
                  ) : cooldownState.canRegenerate ? (
                    <RefreshCw size={16} />
                  ) : (
                    <Lock size={15} className="cooldown-lock-icon" />
                  )}
                </button>
              </>
            )}
          </div>
        </header>

        {/* 3-Day Rule Notification Pill if in Cooldown */}
        {plan && !cooldownState.canRegenerate && (
          <div className="planner-cooldown-badge">
            <Lock size={12} />
            <span>
              Regenerate unlocked in{' '}
              <strong>
                {cooldownState.hoursLeft > 24
                  ? `${cooldownState.daysLeft} days`
                  : `${cooldownState.hoursLeft}h`}
              </strong>{' '}
              (1 plan every 3 days)
            </span>
          </div>
        )}

        {/* Day Name Selector Strip (Starts with Today) */}
        <div className="planner-date-section">
          <div className="date-header-row">
            <span className="month-label">
              {activeDayPlan
                ? `${activeDayPlan.day}${selectedDayIdx === 0 ? ' (Today)' : ''}`
                : 'Weekly Schedule'}
            </span>
            <span className="days-badge">7 Days Starting Today</span>
          </div>

          {/* Horizontal 7-Day Name Strip Starting with Today */}
          <div className="week-days-strip">
            {rollingDaysList.map((dayItem, idx) => {
              const isSelected = selectedDayIdx === idx;
              const isToday = idx === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`week-day-pill day-name-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDayIdx(idx)}
                >
                  <span className="day-name-bold">{dayItem.short}</span>
                  {isToday && !isSelected && <span className="today-dot" />}
                  <span className="day-sub-label">{dayItem.subLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading || initialLoading ? (
          <div className="planner-loading-card">
            <Loader2 size={32} className="planner-spin planner-loading-spinner" />
            <h2>{loading ? 'Generating 7-day meal plan…' : 'Loading your plan…'}</h2>
            <p>
              {loading
                ? 'Gemini is creating a full 7-day menu with personalized targets'
                : 'Fetching your personalized weekly nutrition guide'}
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="planner-error-card">
            <h3>Could not create 7-day meal plan</h3>
            <p>{error}</p>
            <div className="planner-error-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={generate}
                disabled={!cooldownState.canRegenerate}
              >
                {cooldownState.canRegenerate ? 'Try again' : 'Locked (3-Day Limit)'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/scan')}>
                Scan a meal
              </button>
            </div>
          </div>
        ) : !plan || !activeDayPlan ? (
          /* Clean Empty State */
          <div className="planner-empty-state">
            <div className="planner-empty-icon">
              <Sparkles size={28} />
            </div>
            <h2>Generate Your 7-Day Plan</h2>
            <p>
              With one click, AI will design a full 7-day structured meal plan (Monday to Sunday)
              customized to your daily calorie targets, macros, and preferences.
            </p>
            <div className="cooldown-info-note">
              <Info size={13} />
              <span>You can generate a new 7-day plan once every 3 days.</span>
            </div>
            <button type="button" className="planner-create-btn" onClick={generate}>
              <Sparkles size={16} />
              <span>Generate 7-Day Meal Plan</span>
            </button>
          </div>
        ) : (
          /* Active Meal Plan View */
          <div className="planner-content">
            {/* Summary Card for Currently Selected Day */}
            <section className="planner-summary-card">
              <div className="summary-top-row">
                <div className="summary-title">
                  <strong>{activeDayPlan.day} Summary</strong>
                  <span className="flame-icon">🔥</span>
                </div>
                <button
                  type="button"
                  className="details-link-btn"
                  onClick={() => navigate('/progress')}
                >
                  Details
                </button>
              </div>

              {/* Split Row: Left Metrics & Right Circular Gauge */}
              <div className="summary-middle-row">
                <div className="summary-metrics-list">
                  <div className="metric-row">
                    <span className="metric-label">Consumed</span>
                    <strong className="metric-val">{plannedCalories}</strong>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Left</span>
                    <span className="metric-val muted">{caloriesLeft}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Daily Goal</span>
                    <strong className="metric-val">{goalCalories}</strong>
                  </div>
                </div>

                {/* Circular Progress Gauge */}
                <div className="summary-gauge-wrap">
                  <svg viewBox="0 0 100 100" className="summary-gauge-svg">
                    <circle cx="50" cy="50" r="38" className="gauge-bg-track" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="gauge-progress-stroke"
                      style={{
                        strokeDashoffset: `${238.76 - (238.76 * Math.min(calPercent, 100)) / 100}`
                      }}
                    />
                  </svg>
                  <div className="summary-gauge-inner">
                    <strong>{calPercent}%</strong>
                    <span>kcal</span>
                  </div>
                </div>
              </div>

              {/* 3 Macro Progress Columns (Protein, Fats, Carbs) */}
              <div className="summary-macro-columns">
                <div className="macro-col">
                  <span className="macro-title">Protein</span>
                  <div className="macro-progress-track">
                    <div
                      className="macro-progress-fill protein"
                      style={{ width: `${proPercent}%` }}
                    />
                  </div>
                  <div className="macro-ratio">
                    <strong>{Math.round(activeTotals.protein)}</strong>
                    <span>/{Math.round(goals.protein || 120)}g</span>
                  </div>
                </div>

                <div className="macro-col">
                  <span className="macro-title">Fats</span>
                  <div className="macro-progress-track">
                    <div
                      className="macro-progress-fill fat"
                      style={{ width: `${fatPercent}%` }}
                    />
                  </div>
                  <div className="macro-ratio">
                    <strong>{Math.round(activeTotals.fat)}</strong>
                    <span>/{Math.round(goals.fat || 70)}g</span>
                  </div>
                </div>

                <div className="macro-col">
                  <span className="macro-title">Carbs</span>
                  <div className="macro-progress-track">
                    <div
                      className="macro-progress-fill carbs"
                      style={{ width: `${carbPercent}%` }}
                    />
                  </div>
                  <div className="macro-ratio">
                    <strong>{Math.round(activeTotals.carbs)}</strong>
                    <span>/{Math.round(goals.carbs || 250)}g</span>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Recommendation Box */}
            {plan.recommendation && (
              <div className="planner-ai-box">
                <Sparkles size={16} className="ai-box-icon" />
                <div className="ai-box-text">
                  <strong>Weekly Guidance</strong>
                  <p>{plan.recommendation}</p>
                </div>
              </div>
            )}

            {/* Meal Cards for Selected Day */}
            <div className="planner-meals-section">
              {activeDayPlan.meals.map((meal) => {
                const mealKey = `${activeDayPlan.day}-${meal.type}-${meal.time}`;
                const isExpanded = !!expandedMeals[mealKey];

                return (
                  <div
                    key={mealKey}
                    className={`meal-card-item ${isExpanded ? 'expanded' : ''}`}
                  >
                    {/* Meal Row Top / Clickable Main Bar */}
                    <div
                      className="meal-card-main"
                      onClick={() => toggleAccordion(mealKey)}
                    >
                      {/* Stylized Food Plate Icon */}
                      <MealPlate type={meal.type} />

                      {/* Meal Info */}
                      <div className="meal-card-content">
                        <h3 className="meal-type-title">{meal.type}</h3>
                        <div className="meal-cal-line">
                          <span className="meal-cal-num">{Math.round(meal.calories)}</span>
                          <span className="meal-cal-unit">kcal</span>
                          <span className="meal-bullet">•</span>
                          <span className="meal-time-tag">{meal.time}</span>
                        </div>
                        <p className="meal-dish-name">{meal.title}</p>
                      </div>

                      {/* Right Side Chevron */}
                      <div className="meal-card-actions">
                        <span className="meal-chevron">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronRight size={18} />}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="meal-card-drawer">
                        {/* Ingredients List */}
                        <div className="drawer-foods-list">
                          <span className="drawer-label">Menu Items:</span>
                          <div className="drawer-chips">
                            {(meal.foods || []).map((food, idx) => (
                              <span key={idx} className="drawer-food-chip">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Macro Breakdown */}
                        <div className="drawer-macro-stats">
                          <div className="drawer-macro-item">
                            <span>Protein</span>
                            <strong>{Math.round(meal.protein)}g</strong>
                          </div>
                          <div className="drawer-macro-item">
                            <span>Carbs</span>
                            <strong>{Math.round(meal.carbs)}g</strong>
                          </div>
                          <div className="drawer-macro-item">
                            <span>Fats</span>
                            <strong>{Math.round(meal.fat)}g</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="planner-disclaimer">
              {plan.disclaimer || 'Nutritional estimates are AI-generated based on standard portions.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}




