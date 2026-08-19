import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ScanLine,
  Drumstick,
  Salad,
  Egg,
  Fish,
  Milk,
  Beef,
  Sandwich,
  Wheat,
  Home,
  LayoutDashboard,
  History as HistoryIcon,
  User,
  Clock3,
  Utensils,
  Flame,
  X,
  PieChart,
  Sparkles,
} from "lucide-react";
import { getTrackedMeals } from "../services/tracker";
import { getHistoryApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";

/* =========================================================
   FOOD STYLES & CATEGORIES
========================================================= */

const FOOD_STYLES = {
  chicken: {
    icon: Drumstick,
    bg: "#FDF2E9",
    color: "#C2612D",
    accent: "#E05A36",
    nonVeg: true,
  },
  veg: {
    icon: Salad,
    bg: "#EBF7F0",
    color: "#2E8B57",
    accent: "#168765",
    nonVeg: false,
  },
  egg: {
    icon: Egg,
    bg: "#FEF7E6",
    color: "#B78103",
    accent: "#D99B00",
    nonVeg: false,
  },
  fish: {
    icon: Fish,
    bg: "#E8F4FD",
    color: "#2B7BB9",
    accent: "#1E88E5",
    nonVeg: true,
  },
  dairy: {
    icon: Milk,
    bg: "#EEF2FA",
    color: "#5C6F9E",
    accent: "#4A6FA5",
    nonVeg: false,
  },
  beef: {
    icon: Beef,
    bg: "#FDEAE6",
    color: "#B33E2B",
    accent: "#D64527",
    nonVeg: true,
  },
  bread: {
    icon: Sandwich,
    bg: "#F4F6EA",
    color: "#6D8338",
    accent: "#7A9A32",
    nonVeg: false,
  },
  grain: {
    icon: Wheat,
    bg: "#FBF3E4",
    color: "#997322",
    accent: "#B8860B",
    nonVeg: false,
  },
};

const TABS = ["All", "Breakfast", "Lunch", "Dinner"];

/* =========================================================
   HELPERS
========================================================= */

const mealTypeFromDate = (dateVal) => {
  const parsed = new Date(dateVal);
  const hour = Number.isNaN(parsed.getTime()) ? new Date().getHours() : parsed.getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  return "Dinner";
};

const detectFoodStyle = (name = "", items = []) => {
  const text = `${name} ${(items || []).map((i) => i.name || "").join(" ")}`.toLowerCase();
  if (text.includes("chicken") || text.includes("poultry") || text.includes("turkey") || text.includes("wings")) return "chicken";
  if (text.includes("beef") || text.includes("steak") || text.includes("burger") || text.includes("meat") || text.includes("pork") || text.includes("bacon") || text.includes("combo") || text.includes("fast food")) return "beef";
  if (text.includes("fish") || text.includes("salmon") || text.includes("shrimp") || text.includes("tuna") || text.includes("seafood") || text.includes("prawn")) return "fish";
  if (text.includes("egg") || text.includes("omelette") || text.includes("scramble") || text.includes("frittata")) return "egg";
  if (text.includes("milk") || text.includes("cheese") || text.includes("yogurt") || text.includes("dairy") || text.includes("shake")) return "dairy";
  if (text.includes("bread") || text.includes("toast") || text.includes("sandwich") || text.includes("wrap") || text.includes("croissant")) return "bread";
  if (text.includes("rice") || text.includes("pasta") || text.includes("noodle") || text.includes("quinoa") || text.includes("oat") || text.includes("grain") || text.includes("bowl")) return "grain";
  return "veg";
};

const formatDayHeader = (dateVal) => {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "Recently";
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";

  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const formatMealTime = (dateVal) => {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatFullDate = (dateVal) => {
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* =========================================================
   FOOD ICON
========================================================= */

function FoodIcon({ food, image }) {
  const [imgError, setImgError] = useState(false);
  const style = FOOD_STYLES[food] || FOOD_STYLES.veg;
  const Icon = style.icon;

  return (
    <div className="nl-food-avatar" style={{ backgroundColor: style.bg }}>
      {!imgError && image ? (
        <img
          src={image}
          alt={`${food} meal`}
          className="nl-food-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <Icon size={22} strokeWidth={2} color={style.color} />
      )}
    </div>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function SharedDashboardFooter() {
  return (
    <nav className="dashboard-nav" aria-label="Main navigation">
      <Link to="/home">
        <Home size={18} />
        <span>Home</span>
      </Link>
      <Link to="/progress">
        <LayoutDashboard size={18} />
        <span>Progress</span>
      </Link>
      <Link className="scan-nav" to="/scan">
        <span>
          <ScanLine size={24} />
          <b aria-hidden="true">✦</b>
        </span>
        <small>Scan</small>
      </Link>
      <Link className="active" to="/history">
        <HistoryIcon size={18} />
        <span>History</span>
      </Link>
      <Link to="/profile">
        <User size={19} />
        <span>Profile</span>
      </Link>
    </nav>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dietFilter, setDietFilter] = useState("All");
  const [remoteMeals, setRemoteMeals] = useState([]);
  const [trackedMeals, setTrackedMeals] = useState(() => getTrackedMeals(user?.id));
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  // Fetch API meals
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getHistoryApi()
      .then((res) => {
        if (isMounted) {
          const list = res.data?.data || [];
          setRemoteMeals(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRemoteMeals([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Sync local tracked meals
  useEffect(() => {
    const sync = () => setTrackedMeals(getTrackedMeals(user?.id));
    window.addEventListener("nutrilens-tracker-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nutrilens-tracker-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [user?.id]);

  /* ---------------------------------------------------------
     TRANSFORM & GROUP DATA BY DATE
  --------------------------------------------------------- */

  const processedGroups = React.useMemo(() => {
    let sourceMeals = [];

    if (remoteMeals.length > 0) {
      sourceMeals = remoteMeals.map((m, idx) => {
        const rawDate = m.createdAt || m.savedAt || new Date().toISOString();
        const detectedStyle = detectFoodStyle(m.mealName || m.foodName, m.items);
        const foodConfig = FOOD_STYLES[detectedStyle] || FOOD_STYLES.veg;

        return {
          id: m.id || m._id || `remote-${idx}`,
          name: m.mealName || m.foodName || "Saved Meal",
          items: m.items?.length || 1,
          rawDate,
          time: formatMealTime(rawDate),
          fullDate: formatFullDate(rawDate),
          type: mealTypeFromDate(rawDate),
          food: detectedStyle,
          isNonVeg: foodConfig.nonVeg,
          calories: Math.round(m.totals?.calories || m.calories || 0),
          protein: Math.round(m.totals?.protein || m.protein || 0),
          carbs: Math.round(m.totals?.carbohydrates ?? m.totals?.carbs ?? m.carbs ?? 0),
          fat: Math.round(m.totals?.fat ?? m.fat ?? 0),
          image: m.image || m.imageUrl,
          description: m.insight || m.insights || m.description || "Saved from your AI food scan.",
          itemsList: Array.isArray(m.items) ? m.items : [],
        };
      });
    } else if (trackedMeals.length > 0) {
      sourceMeals = trackedMeals.map((m, idx) => {
        const rawDate = m.createdAt || new Date().toISOString();
        const detectedStyle = detectFoodStyle(m.mealName || m.foodName, m.items);
        const foodConfig = FOOD_STYLES[detectedStyle] || FOOD_STYLES.veg;

        return {
          id: m.id || `tracked-${idx}`,
          name: m.mealName || m.foodName || "Tracked Meal",
          items: m.itemCount || m.items?.length || 1,
          rawDate,
          time: formatMealTime(rawDate),
          fullDate: formatFullDate(rawDate),
          type: mealTypeFromDate(rawDate),
          food: detectedStyle,
          isNonVeg: foodConfig.nonVeg,
          calories: Math.round(m.calories || 0),
          protein: Math.round(m.protein || 0),
          carbs: Math.round(m.carbs || 0),
          fat: Math.round(m.fat || 0),
          image: m.image || m.imageUrl,
          description: m.description || "Logged from your food scanner.",
          itemsList: Array.isArray(m.items) ? m.items : [],
        };
      });
    } else {
      return [];
    }

    if (sourceMeals.length === 0) {
      return [];
    }

    // Sort newest first
    sourceMeals.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    // Group by Day Title (Today, Yesterday, Date)
    const groupsMap = new Map();
    for (const meal of sourceMeals) {
      const dayHeader = formatDayHeader(meal.rawDate);
      if (!groupsMap.has(dayHeader)) {
        groupsMap.set(dayHeader, []);
      }
      groupsMap.get(dayHeader).push(meal);
    }

    const grouped = [];
    for (const [day, meals] of groupsMap.entries()) {
      grouped.push({ day, meals });
    }
    return grouped;
  }, [remoteMeals, trackedMeals]);

  /* ---------------------------------------------------------
     FILTER DATA
  --------------------------------------------------------- */

  const filteredGroups = React.useMemo(() => {
    return processedGroups
      .map((group) => {
        let meals = group.meals;

        if (activeTab !== "All") {
          meals = meals.filter((m) => m.type === activeTab);
        }

        if (dietFilter !== "All") {
          meals = meals.filter((m) => {
            const isNonVeg = m.isNonVeg ?? FOOD_STYLES[m.food]?.nonVeg;
            return dietFilter === "Non-Vegetarian" ? isNonVeg : !isNonVeg;
          });
        }

        return {
          ...group,
          meals,
        };
      })
      .filter((group) => group.meals.length > 0);
  }, [processedGroups, activeTab, dietFilter]);

  const toggleMeal = (id) => {
    setSelectedMealId((prev) => (prev === id ? null : id));
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedMealId(null);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="nl-history-page">
      {/* SCROLL AREA */}
      <div className="nl-history-scroll" ref={scrollRef}>
        <div className="nl-history-container">
          {/* HEADER */}
          <header className="nl-history-header">
            <button
              type="button"
              className="nl-header-btn"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={20} strokeWidth={2.2} />
            </button>

            <div className="nl-header-center">
              <span className="nl-header-tag">YOUR JOURNEY</span>
              <h1 className="nl-header-title">History</h1>
            </div>

            <button
              type="button"
              className={`nl-header-btn ${dietFilter !== "All" ? "nl-header-btn-active" : ""}`}
              aria-label="Filter meals"
              onClick={() => setFilterOpen((o) => !o)}
            >
              <Filter size={17} strokeWidth={2} />
            </button>
          </header>

          {/* FILTER MODAL / DROPDOWN */}
          {filterOpen && (
            <div className="nl-filter-card">
              <div className="nl-filter-header">
                <div>
                  <strong>Dietary Filter</strong>
                  <p>Choose what meals to display</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="nl-filter-close"
                  aria-label="Close filter"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="nl-filter-chips">
                {["All", "Vegetarian", "Non-Vegetarian"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`nl-filter-chip ${dietFilter === opt ? "active" : ""}`}
                    onClick={() => {
                      setDietFilter(opt);
                      setFilterOpen(false);
                      setSelectedMealId(null);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY TABS */}
          <div className="nl-tabs-wrapper">
            <div className="nl-tabs-bar">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    className={`nl-tab-btn ${isActive ? "nl-tab-btn-active" : ""}`}
                    onClick={() => changeTab(tab)}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEAL LISTINGS */}
          <div className="nl-meals-content">
            {loading ? (
              <div className="nl-loading-state">
                <div className="nl-loading-spinner" />
                <p>Loading your nutrition history...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="nl-empty-state">
                <div className="nl-empty-icon">
                  <ScanLine size={26} strokeWidth={1.8} />
                </div>
                <h3>No {activeTab.toLowerCase()} meals found</h3>
                <p>Scan your food or add a meal to view your nutrition history here.</p>
                <Link to="/scan" className="nl-empty-action">
                  <Sparkles size={16} />
                  <span>Scan food now</span>
                </Link>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <section className="nl-day-group" key={group.day}>
                  <div className="nl-day-title-row">
                    <h2>{group.day}</h2>
                    <div className="nl-day-line" />
                    <span className="nl-day-badge">
                      {group.meals.length} {group.meals.length === 1 ? "meal" : "meals"}
                    </span>
                  </div>

                  <div className="nl-cards-stack">
                    {group.meals.map((meal) => {
                      const isSelected = selectedMealId === meal.id;
                      const style = FOOD_STYLES[meal.food] || FOOD_STYLES.veg;
                      const isNonVeg = meal.isNonVeg ?? style.nonVeg;

                      return (
                        <article
                          key={meal.id}
                          className={`nl-meal-card ${isSelected ? "nl-meal-card-expanded" : ""}`}
                          style={{
                            "--accent": isNonVeg ? "#E05A36" : "#168765",
                          }}
                          onClick={() => toggleMeal(meal.id)}
                        >
                          {/* COLLAPSED MAIN ROW */}
                          <div className="nl-card-main-row">
                            <FoodIcon food={meal.food} image={meal.image} />

                            <div className="nl-card-info">
                              <h3 className="nl-meal-name">{meal.name}</h3>
                              <div className="nl-meal-meta">
                                <span>
                                  {meal.items} {meal.items === 1 ? "item" : "items"}
                                </span>
                                <span className="nl-dot">·</span>
                                <span className="nl-calories-text">{meal.calories} kcal</span>
                              </div>
                            </div>

                            <div className="nl-card-right">
                              <span className="nl-meal-time">{meal.time}</span>
                              <ChevronRight
                                size={18}
                                className={`nl-expand-chevron ${isSelected ? "nl-chevron-open" : ""}`}
                              />
                            </div>
                          </div>

                          {/* EXPANDED SECTION */}
                          {isSelected && (
                            <div
                              className="nl-card-expanded-body"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="nl-expanded-separator" />

                              {/* DESCRIPTION */}
                              {meal.description && (
                                <p className="nl-expanded-desc">{meal.description}</p>
                              )}

                              {/* NUTRITION METRICS GRID */}
                              <div className="nl-macro-grid">
                                <div className="nl-macro-pill cal">
                                  <Flame size={14} className="nl-macro-icon cal" />
                                  <div className="nl-macro-val-wrap">
                                    <span className="nl-macro-label">Calories</span>
                                    <strong className="nl-macro-val">{meal.calories} kcal</strong>
                                  </div>
                                </div>

                                <div className="nl-macro-pill pro">
                                  <Utensils size={14} className="nl-macro-icon pro" />
                                  <div className="nl-macro-val-wrap">
                                    <span className="nl-macro-label">Protein</span>
                                    <strong className="nl-macro-val">{meal.protein}g</strong>
                                  </div>
                                </div>

                                <div className="nl-macro-pill carb">
                                  <Wheat size={14} className="nl-macro-icon carb" />
                                  <div className="nl-macro-val-wrap">
                                    <span className="nl-macro-label">Carbs</span>
                                    <strong className="nl-macro-val">{meal.carbs}g</strong>
                                  </div>
                                </div>

                                <div className="nl-macro-pill fat">
                                  <PieChart size={14} className="nl-macro-icon fat" />
                                  <div className="nl-macro-val-wrap">
                                    <span className="nl-macro-label">Fat</span>
                                    <strong className="nl-macro-val">{meal.fat}g</strong>
                                  </div>
                                </div>
                              </div>

                              {/* DETECTED ITEMS BREAKDOWN */}
                              {meal.itemsList && meal.itemsList.length > 0 && (
                                <div className="nl-items-breakdown">
                                  <span className="nl-breakdown-heading">Items breakdown</span>
                                  <div className="nl-items-list">
                                    {meal.itemsList.map((item, idx) => (
                                      <div className="nl-item-row" key={idx}>
                                        <div className="nl-item-bullet" />
                                        <span className="nl-item-name">
                                          {item.name || "Detected food"}
                                        </span>
                                        <span className="nl-item-portion">
                                          {item.portion ||
                                            (item.portionQuantity
                                              ? `${item.portionQuantity}${item.portionUnit || "g"}`
                                              : "")}
                                        </span>
                                        {item.calories ? (
                                          <span className="nl-item-cals">
                                            {Math.round(item.calories)} kcal
                                          </span>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* FOOTER ROW */}
                              <div className="nl-card-expanded-footer">
                                <div
                                  className={`nl-diet-badge ${isNonVeg ? "non-veg" : "veg"}`}
                                >
                                  <span className="nl-diet-dot" />
                                  <span>{isNonVeg ? "Non-Vegetarian" : "Vegetarian"}</span>
                                </div>

                                <div className="nl-logged-time">
                                  <Clock3 size={13} />
                                  <span>
                                    {meal.time}
                                    {meal.fullDate ? ` · ${meal.fullDate}` : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DASHBOARD BOTTOM NAV */}
      <SharedDashboardFooter />

      {/* =======================================================
          STYLES
      ======================================================= */}
      <style>{`
        /* --- LAYOUT & WRAPPER --- */
        .nl-history-page {
          position: relative;
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(155deg, #dff7ed 0%, #f4fbf8 42%, #e9f6f1 100%);
          color: #173b32;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: hidden;
        }

        .nl-history-scroll {
          width: 100%;
          max-width: 440px;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          background: linear-gradient(180deg, rgba(251,255,253,.98), rgba(243,250,247,.98));
        }

        .nl-history-scroll::-webkit-scrollbar {
          display: none;
        }

        .nl-history-container {
          width: 100%;
          padding: 16px 14px 130px;
          margin: 0 auto;
        }

        /* --- HEADER --- */
        .nl-history-header {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0 14px;
          background: rgba(251, 255, 253, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #dcefe7;
          margin-bottom: 14px;
        }

        .nl-header-center {
          text-align: center;
          flex: 1;
        }

        .nl-header-tag {
          display: block;
          color: #488f78;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 2px;
          line-height: 1;
        }

        .nl-header-title {
          margin: 4px 0 0;
          color: #123e32;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.6px;
          line-height: 1;
        }

        .nl-header-btn {
          width: 36px;
          height: 36px;
          min-width: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          border: 1px solid #ccebdd;
          background: #eaf8f1;
          color: #227b61;
          box-shadow: 0 4px 10px rgba(38, 130, 94, 0.08);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-header-btn:hover {
          background: #d9f3e7;
          color: #147d60;
        }

        .nl-header-btn-active {
          background: #168765;
          color: #ffffff;
          border-color: #168765;
        }

        /* --- FILTER PANEL --- */
        .nl-filter-card {
          margin-bottom: 14px;
          padding: 13px 15px;
          background: #ffffff;
          border: 1px solid #c6e7d7;
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(38, 117, 87, 0.12);
          animation: nlSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes nlSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nl-filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .nl-filter-header strong {
          color: #1a4d3e;
          font-size: 13px;
        }

        .nl-filter-header p {
          margin: 2px 0 0;
          color: #6b8d80;
          font-size: 11px;
        }

        .nl-filter-close {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          border: 0;
          background: #eaf7f1;
          color: #4a7767;
          cursor: pointer;
        }

        .nl-filter-chips {
          display: flex;
          gap: 7px;
        }

        .nl-filter-chip {
          flex: 1;
          padding: 8px 6px;
          border: 1px solid #d3ebe0;
          border-radius: 10px;
          background: #f4fbf7;
          color: #55796b;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .nl-filter-chip.active {
          border-color: #168765;
          background: #168765;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(22, 135, 101, 0.2);
        }

        /* --- TABS --- */
        .nl-tabs-wrapper {
          position: sticky;
          top: 60px;
          z-index: 25;
          padding: 4px 0 12px;
          background: rgba(244, 251, 248, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nl-tabs-bar {
          display: flex;
          width: 100%;
          gap: 5px;
          padding: 5px;
          border: 1px solid #c4e5d6;
          border-radius: 15px;
          background: linear-gradient(135deg, #dff5e9, #eefaf5);
          box-shadow: 0 4px 12px rgba(38, 130, 94, 0.06);
        }

        .nl-tab-btn {
          flex: 1;
          padding: 8px 6px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: #5b7e70;
          font-size: 11.5px;
          font-weight: 750;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-tab-btn-active {
          background: linear-gradient(135deg, #27b88b, #087b61);
          color: #ffffff;
          border-color: #168765;
          box-shadow: 0 4px 10px rgba(25, 144, 103, 0.22);
        }

        /* --- DAY SECTION --- */
        .nl-day-group {
          margin-bottom: 22px;
        }

        .nl-day-title-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 2px 10px;
        }

        .nl-day-title-row h2 {
          margin: 0;
          color: #1c5242;
          font-size: 13.5px;
          font-weight: 850;
        }

        .nl-day-line {
          flex: 1;
          height: 1px;
          background: #cfe8dc;
        }

        .nl-day-badge {
          color: #5d8979;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: #e2f4ec;
        }

        /* --- MEAL CARD STACK --- */
        .nl-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .nl-meal-card {
          position: relative;
          width: 100%;
          border: 1px solid #cfe8dc;
          border-radius: 16px;
          background: linear-gradient(145deg, #ffffff, #f7fbf9);
          box-shadow: 0 4px 14px rgba(38, 117, 87, 0.06);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.2, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
          overflow: hidden;
        }

        .nl-meal-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(38, 117, 87, 0.12);
        }

        .nl-meal-card-expanded {
          border-color: var(--accent);
          box-shadow: 0 10px 28px rgba(38, 117, 87, 0.14);
        }

        .nl-meal-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .nl-meal-card-expanded::before {
          opacity: 1;
        }

        /* --- CARD MAIN ROW --- */
        .nl-card-main-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          min-height: 64px;
        }

        .nl-food-avatar {
          position: relative;
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 13px;
          overflow: hidden;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 10px rgba(35, 82, 66, 0.12);
        }

        .nl-food-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .nl-card-info {
          flex: 1;
          min-width: 0;
        }

        .nl-meal-name {
          margin: 0;
          color: #173f33;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nl-meal-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 3px;
          color: #6a8c7f;
          font-size: 11px;
          font-weight: 600;
        }

        .nl-dot {
          color: #a4c4b7;
          font-weight: 900;
        }

        .nl-calories-text {
          color: #198664;
          font-weight: 750;
        }

        .nl-card-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .nl-meal-time {
          color: #5a8575;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .nl-expand-chevron {
          color: #8faea2;
          transition: transform 0.25s ease;
        }

        .nl-chevron-open {
          transform: rotate(90deg);
          color: #168765;
        }

        /* --- CARD EXPANDED BODY --- */
        .nl-card-expanded-body {
          padding: 0 14px 14px;
          animation: nlFadeIn 0.25s ease both;
        }

        @keyframes nlFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nl-expanded-separator {
          width: 100%;
          height: 1px;
          background: #dceee5;
          margin-bottom: 11px;
        }

        .nl-expanded-desc {
          margin: 0 0 12px;
          color: #4b6f62;
          font-size: 11.5px;
          line-height: 1.5;
        }

        /* --- MACRO GRID --- */
        .nl-macro-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }

        .nl-macro-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 7px;
          border-radius: 10px;
          border: 1px solid #d8ede3;
          background: #f0faf5;
          min-width: 0;
        }

        .nl-macro-pill.cal {
          border-color: #fbd9c8;
          background: #fef5f0;
        }
        .nl-macro-pill.pro {
          border-color: #d1ecde;
          background: #eefaf4;
        }
        .nl-macro-pill.carb {
          border-color: #faeecf;
          background: #fdfaf0;
        }
        .nl-macro-pill.fat {
          border-color: #e5eaf8;
          background: #f4f6fd;
        }

        .nl-macro-icon.cal {
          color: #e05a36;
        }
        .nl-macro-icon.pro {
          color: #178e6a;
        }
        .nl-macro-icon.carb {
          color: #b78103;
        }
        .nl-macro-icon.fat {
          color: #4a6fa5;
        }

        .nl-macro-val-wrap {
          min-width: 0;
          overflow: hidden;
        }

        .nl-macro-label {
          display: block;
          color: #719386;
          font-size: 8.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          line-height: 1;
        }

        .nl-macro-val {
          display: block;
          margin-top: 2px;
          color: #174033;
          font-size: 11px;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.1;
        }

        /* --- ITEMS BREAKDOWN --- */
        .nl-items-breakdown {
          padding: 9px 11px;
          background: #ffffff;
          border: 1px solid #d7ebe1;
          border-radius: 11px;
          margin-bottom: 12px;
        }

        .nl-breakdown-heading {
          display: block;
          color: #557e70;
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .nl-items-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nl-item-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }

        .nl-item-bullet {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #1cb586;
        }

        .nl-item-name {
          flex: 1;
          color: #274e41;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nl-item-portion {
          color: #75978b;
          font-size: 10.5px;
        }

        .nl-item-cals {
          color: #168765;
          font-size: 10.5px;
          font-weight: 750;
        }

        /* --- EXPANDED FOOTER --- */
        .nl-card-expanded-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .nl-diet-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .nl-diet-badge.veg {
          background: #e3f7ed;
          color: #168765;
          border: 1px solid #bfe8d3;
        }

        .nl-diet-badge.non-veg {
          background: #feeee9;
          color: #d64527;
          border: 1px solid #f9cdbf;
        }

        .nl-diet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .nl-logged-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6a8c7f;
          font-size: 10.5px;
          font-weight: 600;
        }

        /* --- LOADING & EMPTY STATES --- */
        .nl-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          color: #688a7e;
          font-size: 12px;
          gap: 12px;
        }

        .nl-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #d4ece1;
          border-top-color: #168765;
          border-radius: 50%;
          animation: nlSpin 0.8s linear infinite;
        }

        @keyframes nlSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .nl-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 42px 20px;
          border: 1.5px dashed #b9dfcf;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.7);
          margin-top: 10px;
        }

        .nl-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #def5ea;
          color: #179370;
          margin-bottom: 12px;
        }

        .nl-empty-state h3 {
          margin: 0;
          color: #184c3e;
          font-size: 15px;
          font-weight: 850;
        }

        .nl-empty-state p {
          margin: 6px 0 16px;
          color: #688a7e;
          font-size: 12px;
          max-width: 260px;
          line-height: 1.4;
        }

        .nl-empty-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 12px;
          background: linear-gradient(135deg, #27b88b, #0c7c62);
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 5px 14px rgba(23, 140, 102, 0.24);
          transition: transform 0.2s ease;
        }

        .nl-empty-action:hover {
          transform: translateY(-2px);
        }

        /* --- RESPONSIVE DESKTOP FRAME --- */
        @media (min-width: 641px) {
          .nl-history-page {
            justify-content: center;
            padding: 16px 0;
          }

          .nl-history-scroll {
            height: min(860px, calc(100dvh - 32px));
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(20, 45, 34, 0.16);
            border: 1px solid rgba(196, 230, 215, 0.8);
          }
        }

        @media (max-width: 380px) {
          .nl-macro-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
