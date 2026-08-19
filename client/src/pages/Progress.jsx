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
import { getProgressApi } from "../services/api";
import mealImage from "../assets/images/HealthyFood-2.jpg";

function Progress() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [progressError, setProgressError] = useState("");
  useEffect(() => {
    getProgressApi("week")
      .then((response) => setProgress(response.data.data))
      .catch(() => setProgressError("Unable to load your nutrition progress."));
  }, []);

  const today = progress?.today || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    meals: [],
  };
  const goals = progress?.goals || {
    calories: 2000,
    protein: 120,
    carbs: 250,
    fat: 70,
    fiber: 30,
  };
  const calorieData = {
    consumed: Math.round(today.calories),
    goal: goals.calories,
  };

  // Actual progress percentage
  const pct =
    calorieData.goal > 0
      ? Math.min(calorieData.consumed / calorieData.goal, 1)
      : 0;

  // Circular progress settings
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // Nutrient data
  const nutrients = [
    {
      label: "Protein",
      value: Math.round(today.protein),
      goal: goals.protein,
      unit: "g",
      color: "#14B8A6",
    },
    {
      label: "Carbohydrates",
      value: Math.round(today.carbs),
      goal: goals.carbs,
      unit: "g",
      color: "#F59E0B",
    },
    {
      label: "Fat",
      value: Math.round(today.fat),
      goal: goals.fat,
      unit: "g",
      color: "#8B5CF6",
    },
    {
      label: "Fiber",
      value: Math.round(today.fiber),
      goal: goals.fiber,
      unit: "g",
      color: "#22C55E",
    },
  ];

  // Today's meals
  const todaysMeals = today.meals.map((meal) => ({
    ...meal,
    kcal: Math.round(meal.calories),
    time: new Date(meal.createdAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

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
    setRingProgress(0);
    const fillTimer = setTimeout(() => {
      setRingProgress(1);
    }, 150);
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
          padding: 24px 0 120px;
          box-sizing: border-box;
        }

        .knl-progress-card {
          background: #FCFFFE;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          height: fit-content;
          padding-bottom: 120px !important;
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
          transform: translateY(-4px) scale(1.01);
          border-color: #4EC19F;
          background: #ECFAF5;
          box-shadow: 0 12px 24px rgba(31, 145, 113, .16);
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
            padding-bottom: 120px !important;
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/home")}
                aria-label="Back to dashboard"
                style={{
                  background: "none",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <ChevronLeft size={22} color="#1F2937" />
              </button>
              <h1
                style={{
                  fontSize: 17,
                  fontWeight: 750,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Today's Nutrition
              </h1>
              <button
                onClick={() => {
                  setCalendarOpen((open) => !open);
                  navigate("/progress/goals");
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 4,
                  cursor: "pointer",
                }}
                aria-label="Goal Progress Details"
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
            {new Date().toLocaleDateString([], {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {calendarOpen && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 20,
                background: "#FFFFFF",
                border: "1px solid #F1F1F1",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  padding: "10px 18px",
                  fontSize: 13,
                  color: "#111827",
                  whiteSpace: "nowrap",
                }}
              >
                This Week
              </div>
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
                  strokeDashoffset={circumference * (1 - ringProgress)}
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
              const nPct =
                n.goal > 0 ? Math.min((n.value / n.goal) * 100, 100) : 0;

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
                      <Flame size={13} color={n.color} fill={n.color} />
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
                      {n.value.toLocaleString()} / {n.goal.toLocaleString()}
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
                onClick={() => navigate("/history")}
                style={{
                  fontSize: 12,
                  color: "#0D9488",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                See All
              </span>
            </div>

            {/* Meals - no internal scrollbar */}
            <div className="knl-meals-list">
              {progressError && (
                <p
                  style={{
                    color: "#b45309",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {progressError}
                </p>
              )}
              {!progressError && todaysMeals.length === 0 && (
                <p
                  style={{
                    color: "#718E86",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "12px 0",
                  }}
                >
                  No meals saved today yet.
                </p>
              )}
              {todaysMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="knl-meal-card"
                  role="button"
                  tabIndex="0"
                  onClick={() =>
                    navigate(`/food/${meal.id || "today-meal"}`, {
                      state: {
                        item: {
                          id: meal.id,
                          name: meal.name,
                          portion: `${meal.items || 1} items`,
                          kcal: meal.kcal,
                          image: meal.image || mealImage,
                        },
                      },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/food/${meal.id || "today-meal"}`, {
                        state: {
                          item: {
                            id: meal.id,
                            name: meal.name,
                            portion: `${meal.items || 1} items`,
                            kcal: meal.kcal,
                            image: meal.image || mealImage,
                          },
                        },
                      });
                    }
                  }}
                >
                  <img
                    src={meal.image || mealImage}
                    alt={meal.name}
                    className="knl-meal-image"
                  />

                  <div style={{ flex: 1 }}>
                    <p
                      className="knl-meal-name"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
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
                    <ChevronRight size={20} color="#111827" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="dashboard-nav" aria-label="Main navigation">
            <Link to="/home">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link className="active" to="/progress">
              <LayoutGrid size={18} />
              <span>Progress</span>
            </Link>
            <Link className="scan-nav" to="/scan">
              <span>
                <ScanLine size={24} />
                <b aria-hidden="true">✦</b>
              </span>
              <small>Scan</small>
            </Link>
            <Link to="/history">
              <History size={18} />
              <span>History</span>
            </Link>
            <Link to="/profile">
              <User size={19} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Progress;
