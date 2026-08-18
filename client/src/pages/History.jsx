import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
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
  BarChart3,
  History as HistoryIcon,
  User,
  Clock3,
  Utensils,
  Flame,
  X,
} from "lucide-react";
import foodImageOne from "../assets/images/HealthyFood-1.jpg";
import foodImageTwo from "../assets/images/HealthyFood-2.jpg";
import foodImageThree from "../assets/images/Momo.jpg";
import { getTrackedMeals } from "../services/tracker";
import { getHistoryApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";

/* =========================================================
   HISTORY DATA
========================================================= */

const HISTORY_DATA = [
  {
    day: "Today",
    meals: [
      {
        name: "Chicken Rice Meal",
        items: 3,
        time: "12:30 PM",
        type: "Lunch",
        food: "chicken",
        calories: 520,
        protein: "38g",
        description: "Grilled chicken with steamed rice and fresh vegetables.",
      },
      {
        name: "Chicken Salad",
        items: 2,
        time: "8:15 AM",
        type: "Breakfast",
        food: "chicken",
        calories: 310,
        protein: "29g",
        description: "Fresh chicken salad with vegetables and light dressing.",
      },
    ],
  },
  {
    day: "Yesterday",
    meals: [
      {
        name: "Veg Pasta",
        items: 2,
        time: "7:45 PM",
        type: "Dinner",
        food: "veg",
        calories: 430,
        protein: "15g",
        description: "Vegetable pasta with herbs and a light tomato sauce.",
      },
      {
        name: "Omelette & Toast",
        items: 2,
        time: "9:10 AM",
        type: "Breakfast",
        food: "egg",
        calories: 350,
        protein: "24g",
        description: "Two egg omelette served with toasted bread.",
      },
    ],
  },
  {
    day: "Wednesday",
    meals: [
      {
        name: "Turkey Wrap",
        items: 2,
        time: "1:05 PM",
        type: "Lunch",
        food: "chicken",
        calories: 390,
        protein: "31g",
        description: "Turkey wrap with lettuce, vegetables and light sauce.",
      },
    ],
  },
  {
    day: "Monday",
    meals: [
      {
        name: "Quinoa Buddha Bowl",
        items: 5,
        time: "12:50 PM",
        type: "Lunch",
        food: "grain",
        calories: 460,
        protein: "19g",
        description: "Quinoa bowl with vegetables, chickpeas and seeds.",
      },
    ],
  },
  {
    day: "Saturday",
    meals: [
      {
        name: "Shrimp Tacos",
        items: 3,
        time: "1:30 PM",
        type: "Lunch",
        food: "fish",
        calories: 480,
        protein: "32g",
        description: "Shrimp tacos with vegetables and fresh salsa.",
      },
    ],
  },
];

/* =========================================================
   FOOD STYLES
========================================================= */

const FOOD_STYLES = {
  chicken: {
    icon: Drumstick,
    bg: "#F6E4D2",
    color: "#C28A4A",
    accent: "#D85C45",
    nonVeg: true,
  },

  veg: {
    icon: Salad,
    bg: "#DDEEDD",
    color: "#579463",
    accent: "#22B573",
    nonVeg: false,
  },

  egg: {
    icon: Egg,
    bg: "#F8ECC9",
    color: "#D5A52F",
    accent: "#22B573",
    nonVeg: false,
  },

  fish: {
    icon: Fish,
    bg: "#DDEAF6",
    color: "#4C80A7",
    accent: "#D85C45",
    nonVeg: true,
  },

  dairy: {
    icon: Milk,
    bg: "#E5E8F2",
    color: "#6E7DA8",
    accent: "#22B573",
    nonVeg: false,
  },

  beef: {
    icon: Beef,
    bg: "#F2DCD6",
    color: "#A95C47",
    accent: "#D85C45",
    nonVeg: true,
  },

  bread: {
    icon: Sandwich,
    bg: "#EAEFD8",
    color: "#7C9052",
    accent: "#22B573",
    nonVeg: false,
  },

  grain: {
    icon: Wheat,
    bg: "#F3E7CA",
    color: "#B28C3D",
    accent: "#22B573",
    nonVeg: false,
  },
};

const FOOD_IMAGES = {
  chicken: foodImageOne,
  veg: foodImageTwo,
  egg: foodImageThree,
  fish: foodImageOne,
  dairy: foodImageThree,
  beef: foodImageOne,
  bread: foodImageTwo,
  grain: foodImageTwo,
};

const TABS = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
];

const mealTypeFromDate = (createdAt) => {
  const parsed = new Date(createdAt);
  const hour = Number.isNaN(parsed.getTime()) ? new Date().getHours() : parsed.getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 16) return "Lunch";
  return "Dinner";
};

/* =========================================================
   FOOD ICON
========================================================= */

function FoodIcon({ food, expanded, image }) {
  const style = FOOD_STYLES[food] || FOOD_STYLES.veg;
  const Icon = style.icon;

  return (
    <div className={`food-icon ${expanded ? "food-icon-expanded" : ""}`} style={{ backgroundColor: style.bg }}>
      <img className="food-image" src={image || FOOD_IMAGES[food] || foodImageTwo} alt={`${food} meal`} />
      <Icon className="food-image-fallback" size={expanded ? 18 : 16} strokeWidth={1.8} color={style.color} aria-hidden="true" />
    </div>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNavigation() {
  const navigate = useNavigate();
  const navItems = [
    {
      name: "Home",
      icon: Home,
    },
    {
      name: "Progress",
      icon: BarChart3,
    },
    {
      name: "Scan",
      icon: ScanLine,
      isScan: true,
    },
    {
      name: "History",
      icon: HistoryIcon,
    },
    {
      name: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.name === "History";

        return (
          <button
            key={item.name}
            type="button"
            className={`nav-item ${
              item.isScan ? "nav-scan" : ""
            }`}
            aria-label={item.name}
            onClick={() => navigate(item.name === "Home" ? "/home" : item.name === "Progress" ? "/progress" : item.name === "Scan" ? "/scan" : item.name === "Profile" ? "/profile" : "/history")}
          >
            {item.isScan ? (
              <span className="scan-button">
                <Icon
                  size={18}
                  strokeWidth={2}
                  color="#FFFFFF"
                />
              </span>
            ) : (
              <>
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  className={active ? "nav-icon-active" : ""}
                />

                <span
                  className={`nav-label ${
                    active ? "nav-label-active" : ""
                  }`}
                >
                  {item.name}
                </span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SharedDashboardFooter() {
  return (
    <nav className="dashboard-nav" aria-label="Main navigation">
      <Link to="/home"><Home size={18} /><span>Home</span></Link>
      <Link to="/progress"><BarChart3 size={18} /><span>Progress</span></Link>
      <Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link>
      <Link className="active" to="/history"><HistoryIcon size={18} /><span>History</span></Link>
      <Link to="/profile"><User size={19} /><span>Profile</span></Link>
    </nav>
  );
}

/* =========================================================
   HISTORY
========================================================= */

export default function History() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [filterPressed, setFilterPressed] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dietFilter, setDietFilter] = useState("All");
  const { user } = useAuth();
  const [trackedMeals, setTrackedMeals] = useState(() => getTrackedMeals(user?.id));
  const [remoteMeals, setRemoteMeals] = useState([]);

  const pageRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isHorizontalSwipe = useRef(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const trackedGroup = trackedMeals.length ? [{
    day: "Tracked meals",
    meals: trackedMeals.map((meal) => ({
      name: meal.mealName,
      items: meal.itemCount || meal.items?.length || 1,
      time: meal.createdAt || "Just now",
      type: mealTypeFromDate(meal.createdAt),
      food: meal.food || "veg",
      calories: meal.calories || 0,
      protein: `${meal.protein || 0}g`,
      image: meal.image || meal.imageUrl,
      description: "Added from your food scan.",
    })),
  }] : [];

  useEffect(() => {
    if (!user?.id) return;
    setTrackedMeals(getTrackedMeals(user.id));
    getHistoryApi()
      .then((response) => setRemoteMeals(response.data.data || []))
      .catch(() => setRemoteMeals([]));
  }, [user?.id]);

  const firebaseGroup = remoteMeals?.length ? [{
    day: "Saved meals",
    meals: remoteMeals.map((meal) => ({
      name: meal.mealName || "Saved meal",
      items: meal.items?.length || 1,
      time: meal.createdAt ? new Date(meal.createdAt).toLocaleString() : "Recently",
      type: mealTypeFromDate(meal.createdAt),
      food: "veg",
      calories: meal.totals?.calories || 0,
      protein: `${Math.round(meal.totals?.protein || 0)}g`,
      image: meal.image || meal.imageUrl,
      description: meal.insight || "Saved from your food scan.",
    })),
  }] : [];

  const filteredData = (remoteMeals.length ? firebaseGroup : trackedGroup)
    .map((group) => {
      let meals =
        activeTab === "All"
          ? group.meals
          : group.meals.filter(
              (meal) => meal.type === activeTab
            );

      if (dietFilter !== "All") {
        meals = meals.filter((meal) => {
          const isNonVeg = FOOD_STYLES[meal.food]?.nonVeg;
          return dietFilter === "Non-Vegetarian" ? isNonVeg : !isNonVeg;
        });
      }

      return {
        ...group,
        meals,
      };
    })
    .filter((group) => group.meals.length > 0);

  /* =======================================================
     TAB CHANGE
  ======================================================= */

  const changeTab = (tab) => {
    if (tab === activeTab) return;

    setSelectedMeal(null);
    setActiveTab(tab);

    if (pageRef.current) {
      pageRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     SWIPE
  ======================================================= */

  useEffect(() => {
    const syncTrackedMeals = () => setTrackedMeals(getTrackedMeals());
    window.addEventListener("nutrilens-tracker-updated", syncTrackedMeals);
    window.addEventListener("storage", syncTrackedMeals);
    return () => {
      window.removeEventListener("nutrilens-tracker-updated", syncTrackedMeals);
      window.removeEventListener("storage", syncTrackedMeals);
    };
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;

      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
      isHorizontalSwipe.current = false;
    };

    const handleTouchMove = (event) => {
      if (
        touchStartX.current === null ||
        touchStartY.current === null
      ) {
        return;
      }

      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;

      const deltaX = currentX - touchStartX.current;
      const deltaY = currentY - touchStartY.current;

      if (
        Math.abs(deltaX) > 10 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.2
      ) {
        isHorizontalSwipe.current = true;

        if (event.cancelable) {
          event.preventDefault();
        }
      }
    };

    const handleTouchEnd = (event) => {
      if (
        touchStartX.current === null ||
        touchStartY.current === null
      ) {
        return;
      }

      const endX =
        event.changedTouches[0]?.clientX ??
        touchStartX.current;

      const deltaX = endX - touchStartX.current;

      touchStartX.current = null;
      touchStartY.current = null;

      if (!isHorizontalSwipe.current) return;

      if (Math.abs(deltaX) < 55) return;

      const currentIndex = TABS.indexOf(activeTab);

      if (deltaX < 0 && currentIndex < TABS.length - 1) {
        changeTab(TABS[currentIndex + 1]);
      }

      if (deltaX > 0 && currentIndex > 0) {
        changeTab(TABS[currentIndex - 1]);
      }

      isHorizontalSwipe.current = false;
    };

    page.addEventListener(
      "touchstart",
      handleTouchStart,
      { passive: true }
    );

    page.addEventListener(
      "touchmove",
      handleTouchMove,
      { passive: false }
    );

    page.addEventListener(
      "touchend",
      handleTouchEnd,
      { passive: true }
    );

    return () => {
      page.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      page.removeEventListener(
        "touchmove",
        handleTouchMove
      );

      page.removeEventListener(
        "touchend",
        handleTouchEnd
      );
    };
  }, [activeTab]);

  /* =======================================================
     CLICK MEAL
  ======================================================= */

  const toggleMeal = (mealKey) => {
    setSelectedMeal((current) =>
      current === mealKey ? null : mealKey
    );
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="history-page">

      {/* ===================================================
          MAIN SCROLL AREA
      =================================================== */}

      <div
        className="history-scroll"
        ref={pageRef}
      >

        <main className="history-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="history-header">

            <button
              type="button"
              className="round-button"
              aria-label="Go back"
              onClick={() => window.history.back()}
            >
              <ChevronLeft
                size={18}
                strokeWidth={2}
              />
            </button>

            <div className="history-title"><small>YOUR JOURNEY</small><h1>History</h1></div>

            <button
              type="button"
              className={`round-button ${
                filterPressed
                  ? "filter-active"
                  : ""
              }`}
              aria-label="Filter"
              onClick={() => {
                setFilterPressed(true);
                setFilterOpen((open) => !open);

                setTimeout(() => {
                  setFilterPressed(false);
                }, 280);
              }}
            >
              <Filter
                size={15}
                strokeWidth={1.9}
              />
            </button>

          </header>

          {filterOpen && <div className="history-filter-panel"><div><strong>Filter meals</strong><button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters"><X size={15} /></button></div><p>Choose the type of meals to show.</p><div className="history-filter-options">{["All", "Vegetarian", "Non-Vegetarian"].map((option) => <button type="button" key={option} className={dietFilter === option ? "selected" : ""} onClick={() => { setDietFilter(option); setFilterOpen(false); setSelectedMeal(null); }}>{option}</button>)}</div></div>}

          {/* =================================================
              TABS
          ================================================= */}

          <div className="category-area">

            <div className="category-tabs">

              {TABS.map((tab) => {
                const active =
                  activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    className={`category-tab ${
                      active
                        ? "category-tab-active"
                        : ""
                    }`}
                    onClick={() =>
                      changeTab(tab)
                    }
                  >
                    {tab}
                  </button>
                );
              })}

            </div>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="history-content">

            {filteredData.length === 0 ? (
              <div className="empty-history">

                <div className="empty-icon">
                  <ScanLine
                    size={22}
                    strokeWidth={1.5}
                  />
                </div>

                <span>
                  No {activeTab.toLowerCase()} meals found.
                </span>

              </div>
            ) : (
              filteredData.map(
                (group, groupIndex) => (
                  <section
                    className="day-section"
                    key={group.day}
                  >

                    <h2 className="day-title">
                      {group.day}
                    </h2>

                    <div className="meal-list">

                      {group.meals.map(
                        (meal, mealIndex) => {
                          const mealKey =
                            `${group.day}-${meal.name}`;

                          const selected =
                            selectedMeal === mealKey;

                          const style =
                            FOOD_STYLES[meal.food] ||
                            FOOD_STYLES.veg;

                          return (
                            <article
                              key={mealKey}
                              className={`meal-card ${
                                selected
                                  ? "meal-card-selected"
                                  : ""
                              }`}
                              style={{
                                "--delay": `${
                                  groupIndex * 35 +
                                  mealIndex * 25
                                }ms`,
                                "--accent":
                                  style.accent,
                              }}
                              onClick={() =>
                                toggleMeal(
                                  mealKey
                                )
                              }
                            >

                              {/* =================================
                                  MAIN MEAL ROW
                              ================================= */}

                              <div className="meal-main">

                                <FoodIcon
                                  food={meal.food}
                                  image={meal.image}
                                  expanded={
                                    selected
                                  }
                                />

                                <div className="meal-details">

                                  <div className="meal-name">
                                    {meal.name}
                                  </div>

                                  <div className="meal-items">
                                    {meal.items}{" "}
                                    {meal.items === 1
                                      ? "item"
                                      : "items"}
                                  </div>

                                </div>

                                <div className="meal-time">
                                  {meal.time}
                                </div>

                              </div>

                              {/* =================================
                                  EXPANDED DETAILS
                              ================================= */}

                              {selected && (
                                <div
                                  className="meal-expanded"
                                  onClick={(event) =>
                                    event.stopPropagation()
                                  }
                                >

                                  <div className="expanded-divider" />

                                  <div className="expanded-description">
                                    {meal.description}
                                  </div>

                                  <div className="expanded-stats">

                                    <div className="stat-box">
                                      <Flame
                                        size={14}
                                        strokeWidth={1.8}
                                      />

                                      <div>
                                        <span>
                                          Calories
                                        </span>

                                        <strong>
                                          {meal.calories}
                                        </strong>
                                      </div>
                                    </div>

                                    <div className="stat-box">
                                      <Utensils
                                        size={14}
                                        strokeWidth={1.8}
                                      />

                                      <div>
                                        <span>
                                          Protein
                                        </span>

                                        <strong>
                                          {meal.protein}
                                        </strong>
                                      </div>
                                    </div>

                                    <div className="stat-box">
                                      <Clock3
                                        size={14}
                                        strokeWidth={1.8}
                                      />

                                      <div>
                                        <span>
                                          Time
                                        </span>

                                        <strong>
                                          {meal.time}
                                        </strong>
                                      </div>
                                    </div>

                                  </div>

                                  <div
                                    className="meal-type"
                                    style={{
                                      color:
                                        style.accent,
                                      background:
                                        style.nonVeg
                                          ? "rgba(216,92,69,.08)"
                                          : "rgba(34,181,115,.08)",
                                    }}
                                  >
                                    {style.nonVeg
                                      ? "Non-Vegetarian"
                                      : "Vegetarian"}
                                  </div>

                                </div>
                              )}

                            </article>
                          );
                        }
                      )}

                    </div>

                  </section>
                )
              )
            )}

          </div>

        </main>

      </div>

      {/* ===================================================
          BOTTOM NAV
          INSIDE HISTORY PAGE ONLY
      =================================================== */}

      <SharedDashboardFooter />

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`

        /* =================================================
           RESET
        ================================================= */

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-width: 0;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          overflow-x: hidden;
          background: #ffffff;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Inter,
            Arial,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        button {
          font-family: inherit;
          border: 0;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* =================================================
           HISTORY PAGE
           ALWAYS CENTERED
        ================================================= */

        .history-page {
          position: relative;
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          margin: 0 auto;
          overflow: hidden;
          background: #ffffff;
          color: #202722;
        }

        /* =================================================
           SCROLL AREA
        ================================================= */

        .history-scroll {
          width: 100%;
          max-width: 440px;
          flex: 1 1 auto;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior-y: contain;
          overscroll-behavior-x: none;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          touch-action: pan-y;
          scroll-behavior: smooth;
        }

        .history-scroll::-webkit-scrollbar {
          display: none;
        }

        /* =================================================
           CONTAINER
        ================================================= */

        .history-container {
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
          padding:
            14px
            14px
            24px;
        }

        /* =================================================
           HEADER
        ================================================= */

        .history-header {
          position: sticky;
          top: 0;
          z-index: 20;

          width: 100%;
          min-height: 42px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-bottom: 14px;

          background: rgba(255,255,255,.96);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .header-spacer {
          flex: 1;
        }

        .round-button {
          width: 32px;
          height: 32px;
          min-width: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #f5f7f6;
          color: #313934;

          cursor: pointer;

          transition:
            transform .18s ease,
            background .18s ease;
        }

        .round-button:active {
          transform: scale(.9);
        }

        .round-button:hover {
          background: #eef2ef;
        }

        .filter-active svg {
          animation:
            filterSpin
            .28s
            cubic-bezier(.2,.8,.2,1);
        }

        @keyframes filterSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(90deg);
          }
        }

        /* =================================================
           TABS
        ================================================= */

        .category-area {
          width: 100%;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .category-tabs {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 6px;

          overflow-x: auto;
          overflow-y: hidden;

          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .category-tabs::-webkit-scrollbar {
          display: none;
        }

        .category-tab {
          flex: 0 0 auto;

          padding: 7px 12px;

          border-radius: 999px;

          background: #eef1ef;
          color: #707974;

          font-size: 11px;
          line-height: 1;
          font-weight: 650;

          white-space: nowrap;

          cursor: pointer;

          transition:
            background .22s ease,
            color .22s ease,
            transform .18s ease,
            box-shadow .22s ease;
        }

        .category-tab:active {
          transform: scale(.94);
        }

        .category-tab-active {
          background:
            linear-gradient(
              135deg,
              #22b573,
              #1c9c63
            );

          color: #ffffff;

          box-shadow:
            0 4px 12px
            rgba(34,181,115,.18);
        }

        /* =================================================
           CONTENT
        ================================================= */

        .history-content {
          width: 100%;
          min-width: 0;
        }

        /* =================================================
           DAY
        ================================================= */

        .day-section {
          width: 100%;
          margin: 0 0 14px;
          animation:
            sectionAppear
            .42s
            cubic-bezier(.16,1,.3,1)
            both;
        }

        .day-section:nth-child(1) {
          animation-delay: 0ms;
        }

        .day-section:nth-child(2) {
          animation-delay: 35ms;
        }

        .day-section:nth-child(3) {
          animation-delay: 70ms;
        }

        .day-section:nth-child(4) {
          animation-delay: 105ms;
        }

        @keyframes sectionAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .day-title {
          margin: 0 0 7px 2px;

          color: #303b35;

          font-size: 12px;
          line-height: 16px;
          font-weight: 750;
        }

        /* =================================================
           MEAL LIST
        ================================================= */

        .meal-list {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* =================================================
           MEAL CARD
           IMPORTANT:
           NORMAL FLOW — NO ABSOLUTE EXPANSION
        ================================================= */

        .meal-card {
          position: relative;

          width: 100%;
          min-width: 0;

          border-radius: 11px;

          background: #ffffff;

          border: 1px solid #edf0ee;

          box-shadow:
            0 2px 8px
            rgba(24,40,31,.055);

          overflow: hidden;

          cursor: pointer;

          transform: translateZ(0);

          transition:
            transform .24s
              cubic-bezier(.22,1,.36,1),
            box-shadow .24s
              cubic-bezier(.22,1,.36,1),
            border-color .24s ease;

          animation:
            cardAppear
            .42s
            cubic-bezier(.16,1,.3,1)
            var(--delay)
            both;

          contain: layout paint;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform:
              translateY(8px)
              scale(.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        .meal-card:hover {
          transform:
            translateY(-1px)
            translateZ(0);

          box-shadow:
            0 5px 14px
            rgba(24,40,31,.08);
        }

        .meal-card:active {
          transform:
            scale(.985)
            translateZ(0);
        }

        /* =================================================
           SELECTED CARD
        ================================================= */

        .meal-card-selected {
          border-color:
            color-mix(
              in srgb,
              var(--accent) 40%,
              #edf0ee
            );

          box-shadow:
            0 9px 25px
            rgba(24,40,31,.105);

          transform:
            scale(1.018)
            translateZ(0);

          z-index: 2;
        }

        /* =================================================
           GREEN / RED SIDE LINE
        ================================================= */

        .meal-card::before {
          content: "";

          position: absolute;

          left: 0;
          top: 7px;
          bottom: 7px;

          width: 2.5px;

          border-radius: 999px;

          background: var(--accent);

          opacity: 0;

          transform:
            scaleY(.35);

          transition:
            opacity .25s ease,
            transform .3s
              cubic-bezier(.22,1,.36,1);
        }

        .meal-card-selected::before {
          opacity: 1;
          transform: scaleY(1);
        }

        /* =================================================
           MAIN MEAL ROW
        ================================================= */

        .meal-main {
          width: 100%;
          min-width: 0;

          min-height: 50px;

          display: flex;
          align-items: center;

          gap: 8px;

          padding:
            6px
            9px;
        }

        /* =================================================
           ICON
        ================================================= */

        .food-icon {
          width: 34px;
          height: 34px;
          min-width: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          transition:
            transform .3s
              cubic-bezier(.22,1,.36,1);
        }

        .food-icon-expanded {
          transform: scale(1.08);
        }

        /* =================================================
           DETAILS
        ================================================= */

        .meal-details {
          min-width: 0;
          flex: 1;
        }

        .meal-name {
          width: 100%;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          color: #252b27;

          font-size: 11.5px;
          line-height: 15px;
          font-weight: 700;

          transition: color .2s ease;
        }

        .meal-card-selected .meal-name {
          color: var(--accent);
        }

        .meal-items {
          margin-top: 1px;

          color: #9aa19d;

          font-size: 9.5px;
          line-height: 12px;
        }

        .meal-time {
          flex: 0 0 auto;

          color: #969d99;

          font-size: 9px;
          line-height: 12px;

          white-space: nowrap;
        }

        /* =================================================
           EXPANDED DETAILS
           NORMAL FLOW
        ================================================= */

        .meal-expanded {
          width: 100%;

          padding:
            0
            10px
            10px;

          animation:
            detailsAppear
            .28s
            cubic-bezier(.16,1,.3,1)
            both;
        }

        @keyframes detailsAppear {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .expanded-divider {
          width: 100%;
          height: 1px;
          margin-bottom: 8px;
          background: #f0f2f1;
        }

        .expanded-description {
          color: #747d78;

          font-size: 10px;
          line-height: 15px;

          margin-bottom: 9px;
        }

        /* =================================================
           STATS
        ================================================= */

        .expanded-stats {
          width: 100%;

          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 5px;
        }

        .stat-box {
          min-width: 0;

          display: flex;
          align-items: center;
          gap: 5px;

          padding:
            6px 6px;

          border-radius: 8px;

          background: #f7f9f8;

          color: #7d8781;
        }

        .stat-box > div {
          min-width: 0;
        }

        .stat-box span {
          display: block;

          color: #a0a7a3;

          font-size: 7.5px;
          line-height: 10px;
        }

        .stat-box strong {
          display: block;

          margin-top: 1px;

          color: #38423c;

          font-size: 9px;
          line-height: 12px;
          font-weight: 750;
        }

        /* =================================================
           FOOD TYPE
        ================================================= */

        .meal-type {
          width: fit-content;

          margin-top: 7px;

          padding:
            4px 7px;

          border-radius: 999px;

          font-size: 8px;
          line-height: 10px;
          font-weight: 700;
        }

        /* =================================================
           EMPTY
        ================================================= */

        .empty-history {
          width: 100%;
          min-height: 220px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 8px;

          color: #9aa29d;

          font-size: 10px;
        }

        .empty-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #eef2ef;
          color: #22b573;
        }

        /* =================================================
           BOTTOM NAVIGATION
           ATTACHED TO HISTORY PAGE
        ================================================= */

        .bottom-nav {
          position: relative;

          flex: 0 0 auto;

          width: 100%;
          max-width: 440px;

          height: 68px;

          display: flex;
          align-items: center;
          justify-content: space-around;

          padding:
            4px 5px
            calc(5px + env(safe-area-inset-bottom));

          background:
            rgba(255,255,255,.96);

          border-top:
            1px solid #edf0ee;

          box-shadow:
            0 -5px 18px
            rgba(25,40,32,.055);

          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);

          z-index: 50;

          flex-shrink: 0;
        }

        .nav-item {
          position: relative;

          width: 20%;
          height: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 2px;

          padding: 0;

          background: transparent;

          color: #8b938e;

          cursor: pointer;

          transition:
            transform .18s ease,
            color .18s ease;
        }

        .nav-item:active {
          transform: scale(.9);
        }

        .nav-icon-active {
          color: #22b573;
        }

        .nav-label {
          font-size: 8px;
          line-height: 11px;
          font-weight: 600;
          color: #8b938e;
        }

        .nav-label-active {
          color: #22b573;
          font-weight: 700;
        }

        /* =================================================
           SCAN
        ================================================= */

        .nav-scan {
          justify-content: center;
        }

        .scan-button {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #22b573,
              #1c9c63
            );

          box-shadow:
            0 6px 15px
            rgba(34,181,115,.22);

          transition:
            transform .22s
              cubic-bezier(.22,1,.36,1),
            box-shadow .22s ease;
        }

        .nav-scan:active .scan-button {
          transform: scale(.88);
        }

        /* =================================================
           TABLET / DESKTOP
        ================================================= */

        @media (min-width: 641px) {

          body {
            min-height: 100dvh;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #ffffff;
          }

          .history-page {
            width: 440px;
            max-width: 440px;

            height: min(
              860px,
              calc(100dvh - 32px)
            );

            min-height: 0;

            border-radius: 28px;

            overflow: hidden;

            box-shadow:
              0 18px 55px
              rgba(20,40,30,.14);
          }

          .history-scroll {
            max-width: 440px;
          }

          .history-container {
            max-width: 440px;
            padding:
              16px
              16px
              22px;
          }

          .bottom-nav {
            border-radius:
              0 0 28px 28px;
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 640px) {

          .history-page {
            width: 100%;
            max-width: 100%;
            height: 100dvh;
          }

          .history-scroll {
            width: 100%;
            max-width: 100%;
          }

          .history-container {
            width: 100%;
            max-width: none;

            padding:
              12px
              10px
              20px;
          }

          .bottom-nav {
            width: 100%;
            max-width: none;

            height:
              calc(
                66px +
                env(safe-area-inset-bottom)
              );

            padding:
              3px 4px
              calc(
                4px +
                env(safe-area-inset-bottom)
              );
          }
        }

        /* =================================================
           SMALL PHONES
        ================================================= */

        @media (max-width: 380px) {

          .history-container {
            padding:
              10px
              8px
              18px;
          }

          .history-header {
            margin-bottom: 12px;
          }

          .round-button {
            width: 30px;
            height: 30px;
            min-width: 30px;
          }

          .category-tab {
            padding:
              6px 9px;

            font-size: 10px;
          }

          .meal-main {
            min-height: 47px;
            padding:
              5px 8px;
          }

          .food-icon {
            width: 31px;
            height: 31px;
            min-width: 31px;
          }

          .meal-name {
            font-size: 10.5px;
            line-height: 14px;
          }

          .meal-items {
            font-size: 8.5px;
            line-height: 11px;
          }

          .meal-time {
            font-size: 8.5px;
          }

          .expanded-description {
            font-size: 9px;
            line-height: 14px;
          }

          .stat-box {
            padding: 5px;
          }

          .stat-box span {
            font-size: 7px;
          }

          .stat-box strong {
            font-size: 8.5px;
          }

          .bottom-nav {
            height:
              calc(
                64px +
                env(safe-area-inset-bottom)
              );
          }

          .scan-button {
            width: 37px;
            height: 37px;
          }

          .nav-label {
            font-size: 7.5px;
          }
        }

        /* =================================================
           VERY SMALL DEVICES
        ================================================= */

        @media (max-width: 340px) {

          .history-container {
            padding-left: 7px;
            padding-right: 7px;
          }

          .category-tabs {
            gap: 4px;
          }

          .category-tab {
            padding:
              6px 8px;
          }

          .meal-main {
            gap: 6px;
            padding-left: 7px;
            padding-right: 7px;
          }

          .meal-time {
            font-size: 8px;
          }
        }

        /* =================================================
           SAFE AREA
        ================================================= */

        @supports (padding: max(0px)) {

          .history-container {
            padding-left:
              max(
                10px,
                env(safe-area-inset-left)
              );

            padding-right:
              max(
                10px,
                env(safe-area-inset-right)
              );
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }

    `}</style>
      <style>{`
        .history-page { background: linear-gradient(155deg, #dff7ed 0%, #f4fbf8 42%, #e9f6f1 100%); color: #173b32; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .history-scroll { background: linear-gradient(180deg, rgba(251,255,253,.98), rgba(243,250,247,.98)); }
        .history-container { padding-top: 18px; }
        .history-container { padding-bottom: 124px; }
        .history-header { min-height: 52px; margin-bottom: 16px; background: rgba(251,255,253,.9); border-bottom: 1px solid #dcefe7; }
        .history-title { flex: 1; text-align: center; }
        .history-title small { display: block; color: #5d9b86; font-size: 8px; font-weight: 850; letter-spacing: 1.8px; line-height: 1; }
        .history-title h1 { margin-top: 5px; color: #123e32; font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 23px; line-height: 1; font-weight: 900; letter-spacing: -.85px; }
        .round-button { border: 1px solid #ccebdd; background: #eaf8f1; color: #227b61; box-shadow: 0 5px 12px rgba(38, 130, 94, .08); }
        .round-button:hover, .filter-active { background: #d9f3e7; color: #147d60; }
        .history-filter-panel { position: sticky; top: 52px; z-index: 19; margin: -7px 0 14px; padding: 13px; border: 1px solid #c6e7d7; border-radius: 16px; background: rgba(251,255,253,.98); box-shadow: 0 10px 22px rgba(38, 117, 87, .13); }
        .history-filter-panel > div:first-child { display:flex; align-items:center; justify-content:space-between; }.history-filter-panel strong { color:#245b4a; font-size:12px; }.history-filter-panel > div:first-child button { display:grid; place-items:center; width:27px; height:27px; border:0; border-radius:9px; color:#5f8b7b; background:#eaf7f1; cursor:pointer; }.history-filter-panel p { margin-top:4px; color:#7a988c; font-size:10px; }.history-filter-options { display:flex; gap:6px; margin-top:10px; }.history-filter-options button { flex:1; padding:8px 6px; border:1px solid #d3ebe0; border-radius:10px; color:#6b8e80; background:#f4fbf7; font-size:10px; font-weight:800; cursor:pointer; }.history-filter-options button.selected { border-color:#168765; color:#fff; background:#168765; }
        .category-area { position: sticky; top: 52px; z-index: 18; margin: 0 -2px 21px; padding: 8px 2px 13px; border-bottom: 1px solid #d5ebe1; background: rgba(244, 251, 248, .96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .category-tabs { display: flex; width: 100%; gap: 5px; padding: 5px; border: 1px solid #c4e5d6; border-radius: 16px; background: linear-gradient(135deg, #dff5e9, #eefaf5); box-shadow: 0 6px 14px rgba(38, 130, 94, .07); }
        .category-tab { flex: 1 1 0; min-width: 0; padding: 8px 5px; border: 1px solid #d7ece2; border-radius: 11px; color: #668a7b; background: rgba(255,255,255,.72); font-size: 11px; font-weight: 800; text-align: center; white-space: nowrap; box-shadow: 0 2px 5px rgba(38, 107, 79, .04); }
        .category-tab:hover { color: #237c61; background: #fafffc; border-color: #9dd8bc; }
        .category-tab-active { color: #fff; border-color: #168765; background: linear-gradient(135deg, #27b88b, #087b61); box-shadow: 0 5px 12px rgba(25, 144, 103, .2); }
        .day-section { margin-bottom: 20px; }
        .day-title { display: flex; align-items: center; gap: 8px; margin: 0 0 9px 3px; color: #24614e; font-size: 13px; font-weight: 850; }
        .day-title::after { content: ""; height: 1px; flex: 1; background: #d3ebe0; }
        .meal-list { gap: 8px; }
        .meal-card { border: 1px solid #cfe9dd; border-radius: 16px; background: linear-gradient(145deg, #fff, #f5fbf8); box-shadow: 0 8px 18px rgba(38, 117, 87, .08); }
        .meal-card:hover { box-shadow: 0 11px 24px rgba(38, 117, 87, .14); }
        .meal-main { min-height: 62px; padding: 9px 11px; gap: 10px; }
        .food-icon { position: relative; width: 48px; height: 48px; min-width: 48px; overflow: hidden; border-radius: 14px; box-shadow: 0 5px 11px rgba(35, 82, 66, .14); }
        .food-image { width: 100%; height: 100%; display: block; object-fit: cover; }
        .food-image-fallback { display: none; position: absolute; inset: 0; margin: auto; }
        .meal-name { color: #214c3e; font-size: 12px; font-weight: 850; }
        .meal-items { color: #77968a; font-size: 10px; font-weight: 600; }
        .meal-time { color: #5f8c7b; font-size: 10px; font-weight: 750; }
        .meal-expanded { padding: 0 12px 12px; }
        .expanded-divider { background: #dcefe7; }
        .expanded-description { color: #6d8d80; font-size: 10px; line-height: 1.5; }
        .stat-box { border: 1px solid #d9eee5; background: #effaf5; color: #26836a; }
        .stat-box span { color: #7a9b8e; }.stat-box strong { color: #285d4c; }
        .empty-history { min-height: 250px; border: 1px dashed #bcded0; border-radius: 20px; background: rgba(255,255,255,.65); color: #709387; }
        .empty-icon { background: #dff5e9; color: #1a9975; }
        .bottom-nav { height: 72px; border-top: 1px solid #dceee7; background: rgba(255,255,255,.96); box-shadow: 0 -8px 23px rgba(40,112,85,.1); }
        .nav-item { color: #80958e; }.nav-icon-active, .nav-label-active { color: #168363; }.nav-label { font-size: 9px; font-weight: 700; }.scan-button { width: 52px; height: 52px; background: linear-gradient(145deg, #25ba8d, #087b61); box-shadow: 0 7px 16px rgba(17,137,99,.28); }
      `}</style>
    </div>
  );
}
