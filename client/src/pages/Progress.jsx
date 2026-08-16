import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Home,
  LayoutGrid,
  ScanLine,
  History,
  User,
} from "lucide-react";
import { getTrackedMeals } from "../services/tracker";
import { useAuth } from "../hooks/useAuth";

function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trackedMeals, setTrackedMeals] = useState(() => getTrackedMeals(user?.id));
  useEffect(() => {
    const syncTrackedMeals = () => setTrackedMeals(getTrackedMeals(user?.id));
    window.addEventListener("nutrilens-tracker-updated", syncTrackedMeals);
    window.addEventListener("storage", syncTrackedMeals);
    return () => {
      window.removeEventListener("nutrilens-tracker-updated", syncTrackedMeals);
      window.removeEventListener("storage", syncTrackedMeals);
    };
  }, [user?.id]);
  const trackedTotals = trackedMeals.reduce((totals, meal) => ({
    calories: totals.calories + Number(meal.calories || 0),
    protein: totals.protein + Number(meal.protein || 0),
    carbs: totals.carbs + Number(meal.carbs || 0),
    fat: totals.fat + Number(meal.fats ?? meal.fat ?? 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  // Calorie data
  const calorieData = {
    consumed: trackedTotals.calories,
    goal: 2200,
  };

  // Actual progress percentage
  const pct = calorieData.consumed / calorieData.goal;

  // Circular progress settings
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // Nutrient data
  const nutrients = [
    {
      label: "Protein",
      value: 95 + trackedTotals.protein,
      goal: 140,
      unit: "g",
      color: "#14B8A6",
    },
    {
      label: "Carbohydrates",
      value: 180 + trackedTotals.carbs,
      goal: 250,
      unit: "g",
      color: "#F59E0B",
    },
    {
      label: "Fat",
      value: 52 + trackedTotals.fat,
      goal: 70,
      unit: "g",
      color: "#8B5CF6",
    },
    {
      label: "Fiber",
      value: 21,
      goal: 30,
      unit: "g",
      color: "#22C55E",
    },
  ];

  // Today's meals
  const todaysMeals = [
    {
      id: 1,
      name: "Chicken & Rice",
      kcal: 520,
      items: 3,
      time: "12:30 PM",
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200",
    },
    {
      id: 2,
      name: "Greek Yogurt & Berries",
      kcal: 280,
      items: 2,
      time: "4:00 PM",
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200",
    },
    {
      id: 3,
      name: "Chicken Salad",
      kcal: 430,
      items: 4,
      time: "6:30 PM",
      image:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200",
    },
    {
      id: 4,
      name: "Fruit Bowl",
      kcal: 210,
      items: 4,
      time: "8:00 PM",
      image:
        "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=200",
    },
  ];

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Progress ring animation
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    // Start at 0%
    setRingProgress(0);

    // Fill to 100%
    const fillTimer = setTimeout(() => {
      setRingProgress(1);
    }, 150);

    // Settle back to actual percentage
    const settleTimer = setTimeout(() => {
      setRingProgress(pct);
    }, 900);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(settleTimer);
    };
  }, [pct]);

  return (
    <>
      <style>{`
        html,
        body,
        #root {
          background: #F3F4F6;
          margin: 0;
          padding: 0;
        }

        .knl-page-bg {
          background: linear-gradient(180deg, #EAF7F3 0%, #F5FAF8 46%, #EEF6F3 100%);
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 24px 0;
          box-sizing: border-box;
        }

        .knl-progress-card {
          background: #FCFFFE;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          height: fit-content;
        }

        .knl-sticky-shell {
          position: sticky;
          top: 0;
          z-index: 30;
          margin: -24px -20px 14px;
          padding: 12px 20px 8px;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #E8F1EE;
          box-shadow: 0 3px 16px rgba(44, 106, 87, .04);
          transition: padding .28s ease, box-shadow .28s ease;
        }

        .knl-sticky-shell.scrolled { padding-top: 7px; padding-bottom: 6px; box-shadow: 0 8px 22px rgba(44, 106, 87, .10); }
        .knl-progress-heading { min-height: 42px; padding: 8px 0 2px; background: transparent; transition: padding .28s ease, transform .28s ease; }
        .knl-sticky-shell.scrolled .knl-progress-heading { padding-top: 4px; transform: scale(.96); transform-origin: center top; }

        .knl-nav-item {
          min-width: 52px;
          padding: 5px 7px;
          border-radius: 12px;
          cursor: pointer;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }

        .knl-nav-item:hover { background: #ECF8F4; }
        .knl-nav-item:active { transform: scale(.95); }
        .knl-nav-item-active { background: #E5F7F1; }

        .knl-summary-card, .knl-nutrients-card, .knl-meals-card { border: 1px solid #D9EEE7; border-radius: 20px; background: #FFFFFF; box-shadow: 0 10px 24px rgba(44, 106, 87, .08); animation: knl-rise .5s ease both; }
        .knl-summary-card { padding: 18px 12px 8px; animation-delay: .05s; background: linear-gradient(145deg, #FFFFFF 0%, #F2FBF8 100%); border-top: 3px solid #2AB594; }
        .knl-nutrients-card { margin-top: 14px; padding: 16px 14px 4px; animation-delay: .12s; background: #FBFFFD; border-top: 3px solid #2AB594; }
        .knl-meals-card { margin-top: 14px; padding: 14px 12px 4px; animation-delay: .2s; background: #FFFFFF; border-top: 3px solid #F0A928; }
        .knl-nutrient-row { animation: knl-rise .45s ease both; }
        .knl-progress-fill { animation: knl-fill 1.45s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--row-index) * 70ms); }
        .knl-meals-card .knl-meal-card {
          position: relative;
          margin: 8px 0;
          border: 1px solid #EAF1EF;
          border-radius: 15px;
          background: #FBFEFD;
          cursor: pointer;
          transition: transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s ease, border-color .24s ease, background .24s ease;
        }
        .knl-meals-card .knl-meal-card:hover,
        .knl-meals-card .knl-meal-card:focus-within {
          transform: translateY(-5px) scale(1.015);
          border-color: #4EC19F;
          background: #ECFAF5;
          box-shadow: 0 14px 28px rgba(31, 145, 113, .20);
        }
        .knl-meals-card .knl-meal-card:active { transform: scale(.985); background: #E7F8F1; }
        .knl-meals-card .knl-meal-arrow { display: flex; align-items: center; color: #159979; }
        .knl-meals-card .knl-meal-image { box-shadow: 0 3px 9px rgba(31, 75, 61, .14); transition: transform .24s cubic-bezier(.22,1,.36,1); }
        .knl-meals-card .knl-meal-card:hover .knl-meal-image,
        .knl-meals-card .knl-meal-card:focus-within .knl-meal-image { transform: scale(1.06); }
        .knl-nutrient-label { color: #245149 !important; font-weight: 650 !important; }
        .knl-nutrient-value { color: #173B34 !important; font-weight: 750 !important; }
        .knl-meals-title { color: #173B34 !important; font-size: 16px !important; font-weight: 750 !important; }
        .knl-see-all { color: #0A9A78 !important; font-weight: 750 !important; }
        .knl-meal-name { color: #1B4038 !important; font-weight: 750 !important; }
        .knl-meal-meta { color: #718E86 !important; }
        .knl-meal-time { color: #5D7E75 !important; font-weight: 650 !important; }
        @keyframes knl-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes knl-fill {
          0% { width: 0; }
          52% { width: 100%; }
          68% { width: 100%; }
          100% { width: var(--target-width); }
        }

        /* Meal list - NO scrollbar */
        .knl-meals-list {
          max-height: none;
          overflow: visible;
          padding-right: 0;
        }

        /* Desktop meal cards */
        .knl-meal-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F9FAFB;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .knl-meal-image {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .knl-meal-arrow {
          display: none;
        }

        /* Bottom navigation */
        .knl-bottom-nav {
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-top: 1px solid #F1F1F1;
          margin-top: 20px;
          padding-top: 10px;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .knl-page-bg {
            padding: 0;
            display: block;
            min-height: 100vh;
          }

          .knl-progress-card {
            width: 100%;
            max-width: 380px;
            margin: 0 auto;
            border-radius: 0;
            box-shadow: none;
            min-height: auto;

            /* Space for fixed bottom navigation */
            padding-bottom: 90px !important;
          }

          /* Whole page scrolls */
          .knl-meals-list {
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }

          /* Mobile meal design */
          .knl-meal-card {
            background: #FFFFFF;
            border-radius: 0;
            padding: 12px 4px;
            margin: 0;
            border-bottom: 1px solid #F1F1F1;
            gap: 12px;
          }

          .knl-meal-image {
            width: 52px;
            height: 52px;
            border-radius: 50%;
          }

          .knl-meal-arrow {
            display: block;
            flex-shrink: 0;
          }

          /* Fixed mobile navigation */
          .knl-bottom-nav {
            position: fixed;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            width: 100%;
            max-width: 380px;
            box-sizing: border-box;

            background: rgba(255, 255, 255, 0.97);
            border-top: 1px solid #E5E7EB;

            margin: 0;
            padding: 10px 8px
              calc(10px + env(safe-area-inset-bottom));

            z-index: 100;

            box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.06);
          }
        }
      `}</style>

      <div className="knl-page-bg">
        <div
          className="knl-progress-card"
          style={{
            maxWidth: 380,
            width: "100%",
            fontFamily: "sans-serif",
            padding: "24px 20px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <div className={`knl-sticky-shell ${headerScrolled ? "scrolled" : ""}`}>
            <div
              className="knl-progress-heading"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Back to dashboard"
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}
              >
                <ChevronLeft size={22} color="#1F2937" />
              </button>
              <h1 style={{ fontSize: 17, fontWeight: 750, color: "#111827", margin: 0 }}>
                Today's Nutrition
              </h1>
              <button
                onClick={() => { setCalendarOpen((open) => !open); navigate("/progress/goals"); }}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}
              >
                <Calendar size={18} color="#6B7280" />
              </button>
            </div>
          </div>

          {/* Date */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#9CA3AF",
              margin: "4px 0 20px",
            }}
          >
            14 May 2024
          </p>

          {calendarOpen && (
            <div style={{ position: "absolute", top: 44, right: 20, background: "#FFFFFF", border: "1px solid #F1F1F1", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 10 }}>
              <div style={{ padding: "10px 18px", fontSize: 13, color: "#111827", whiteSpace: "nowrap" }}>This Week</div>
            </div>
          )}

          {/* Calorie Progress Circle */}
          <div
            className="knl-summary-card"
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 140,
                height: 140,
              }}
            >
              <svg
                width={140}
                height={140}
                viewBox="0 0 120 120"
                style={{
                  transform: "rotate(-90deg)",
                }}
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="10"
                />

                {/* Animated progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference * (1 - ringProgress)
                  }
                  style={{
                    transition:
                      "stroke-dashoffset 0.7s cubic-bezier(0.65, 0, 0.35, 1)",
                  }}
                />
              </svg>

              {/* Circle text */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  {calorieData.consumed.toLocaleString()}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  / {calorieData.goal.toLocaleString()} kcal
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0D9488",
                    marginTop: 2,
                  }}
                >
                  {Math.round(pct * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Nutrients */}
          <div className="knl-nutrients-card">
            {nutrients.map((n, index) => {
              const nPct = Math.min(
                (n.value / n.goal) * 100,
                100
              );

              return (
                <div
                  key={n.label}
                  className="knl-nutrient-row"
                  style={{
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      className="knl-nutrient-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      <Flame
                        size={13}
                        color={n.color}
                        fill={n.color}
                      />

                      {n.label}
                    </span>

                    <span
                      className="knl-nutrient-value"
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                      }}
                    >
                      {n.value.toLocaleString()} /{" "}
                      {n.goal.toLocaleString()}
                      {n.unit}
                    </span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      background: "#F3F4F6",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="knl-progress-fill"
                      style={{
                        width: "100%",
                        "--target-width": `${nPct}%`,
                        "--row-index": index,
                        height: "100%",
                        background: n.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today's Meals */}
          <div className="knl-meals-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h2
                className="knl-meals-title"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Today's Meals
              </h2>

              <span
                className="knl-see-all"
                style={{
                  fontSize: 12,
                  color: "#0D9488",
                  fontWeight: 500,
                }}
              >
                See All
              </span>
            </div>

            {/* Meals - no internal scrollbar */}
            <div className="knl-meals-list">
              {todaysMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="knl-meal-card"
                >
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="knl-meal-image"
                  />

                  <div style={{ flex: 1 }}>
                      <p
                        className="knl-meal-name"
                        style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {meal.name}
                    </p>

                    <p
                      className="knl-meal-meta"
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        margin: "2px 0 0",
                      }}
                    >
                      {meal.kcal} kcal · {meal.items} items
                    </p>
                  </div>

                  <span
                    className="knl-meal-time"
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                    }}
                  >
                    {meal.time}
                  </span>

                  {/* Mobile arrow */}
                  <div className="knl-meal-arrow">
                    <ChevronRight
                      size={20}
                      color="#111827"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="dashboard-nav" aria-label="Main navigation">
            <Link to="/home"><Home size={18} /><span>Home</span></Link>
            <Link className="active" to="/progress"><LayoutGrid size={18} /><span>Progress</span></Link>
            <Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link>
            <Link to="/history"><History size={18} /><span>History</span></Link>
            <Link to="/profile"><User size={19} /><span>Profile</span></Link>
          </nav>
          <div className="knl-bottom-nav" style={{ display: "none" }}>
            {[
              {
                key: "home",
                label: "Home",
                icon: Home,
              },
              {
                key: "progress",
                label: "Progress",
                icon: LayoutGrid,
                active: true,
              },
              {
                key: "scan",
                label: "Scan",
                icon: ScanLine,
                isCenter: true,
              },
              {
                key: "history",
                label: "History",
                icon: History,
              },
              {
                key: "profile",
                label: "Profile",
                icon: User,
              },
            ].map((tab) => {
              const Icon = tab.icon;

              if (tab.isCenter) {
                return (
                  <div
                    key={tab.key}
                    onClick={() => navigate(tab.key === "home" ? "/home" : tab.key === "history" ? "/history" : tab.key === "profile" ? "/profile" : tab.key === "scan" ? "/scan" : "/progress")}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #14B8A6, #0D9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: -28,
                      boxShadow:
                        "0 6px 16px rgba(13,148,136,0.35)",
                    }}
                  >
                    <Icon size={22} color="#FFFFFF" />
                  </div>
                );
              }

              return (
                  <div
                    key={tab.key}
                    className={`knl-nav-item ${tab.active ? "knl-nav-item-active" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-label={tab.label}
                    onClick={() => navigate(tab.key === "home" ? "/home" : tab.key === "history" ? "/history" : tab.key === "profile" ? "/profile" : "/progress")}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate(tab.key === "home" ? "/home" : tab.key === "history" ? "/history" : tab.key === "profile" ? "/profile" : "/progress"); }}
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Icon
                    size={20}
                    color={tab.active ? "#079879" : "#7B8B86"}
                  />

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: tab.active ? 600 : 400,
                      color: tab.active ? "#079879" : "#65756F",
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Progress;
