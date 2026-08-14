import React, { useState, useEffect } from "react";
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

function Progress() {
  // Calorie data
  const calorieData = {
    consumed: 1650,
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
      value: 95,
      goal: 140,
      unit: "g",
      color: "#14B8A6",
    },
    {
      label: "Carbohydrates",
      value: 180,
      goal: 250,
      unit: "g",
      color: "#F59E0B",
    },
    {
      label: "Fat",
      value: 52,
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

  // Calendar dropdown
  const [calendarOpen, setCalendarOpen] = useState(false);

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
          background: #F3F4F6;
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 24px 0;
          box-sizing: border-box;
        }

        .knl-progress-card {
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          height: fit-content;
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
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ChevronLeft size={22} color="#1F2937" />

            <h1
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              Today's Nutrition
            </h1>

            <button
              onClick={() => setCalendarOpen((open) => !open)}
              style={{
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
              }}
            >
              <Calendar size={18} color="#6B7280" />
            </button>
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

          {/* Calendar dropdown */}
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
          <div>
            {nutrients.map((n) => {
              const nPct = Math.min(
                (n.value / n.goal) * 100,
                100
              );

              return (
                <div
                  key={n.label}
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
                      style={{
                        width: `${nPct}%`,
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
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <h2
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
          <div className="knl-bottom-nav">
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Icon
                    size={20}
                    color={
                      tab.active
                        ? "#0D9488"
                        : "#9CA3AF"
                    }
                  />

                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: tab.active ? 600 : 400,
                      color: tab.active
                        ? "#0D9488"
                        : "#9CA3AF",
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