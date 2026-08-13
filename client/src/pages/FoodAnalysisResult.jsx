import React, { useState } from "react";

/**
 * FoodAnalysisResult — Page 7: shows the result of a completed food scan.
 *
 * PURELY PRESENTATIONAL — no scanning/AI logic lives here. That belongs to
 * your teammate's Food Scanner / AI Analysis pages. This page just receives
 * the finished result as a prop and displays it.
 *
 * Expected shape of `result`:
 * {
 *   id, mealName, itemCount, image,
 *   totalKcal, protein, carbs, fats, isFavorite,
 *   detectedItems: [{ id, name, portion, kcal, image }]
 * }
 *
 * Props:
 *  - result: object described above (required)
 *  - onBack: () => void
 *  - onToggleFavorite: (id) => void
 *  - onViewDetails: (result) => void
 *  - onSelectItem: (item) => void
 */
export default function FoodAnalysisResult({
  result,
  onBack,
  onToggleFavorite,
  onViewDetails,
  onSelectItem,
}) {
  const [localFavorite, setLocalFavorite] = useState(!!result?.isFavorite);

  if (!result) {
    return (
      <div className="result-page">
        <div className="result-card result-card--empty">
          <p className="empty-text">No scan result to show yet.</p>
        </div>
      </div>
    );
  }

  const {
    mealName,
    itemCount,
    image,
    totalKcal,
    protein,
    carbs,
    fats,
    detectedItems = [],
  } = result;

  const handleFavoriteClick = () => {
    setLocalFavorite((prev) => !prev);
    onToggleFavorite?.(result.id);
  };

  return (
    <div className="result-page">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <button onClick={onBack} aria-label="Go back" className="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#17332E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={handleFavoriteClick}
            aria-label={localFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={localFavorite}
            className="icon-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={localFavorite ? "#2F9E8F" : "none"}>
              <path
                d="M12 21s-6.7-4.3-9.3-8.2C.8 9.9 1.7 6.4 4.6 5.1c2.2-1 4.6-.2 5.9 1.6.4.5.8 1 1.5 1 .7 0 1.1-.5 1.5-1 1.3-1.8 3.7-2.6 5.9-1.6 2.9 1.3 3.8 4.8 1.9 7.7C18.7 16.7 12 21 12 21z"
                stroke="#2F9E8F"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="result-titles">
          <h1 className="result-title">{mealName}</h1>
          <p className="result-subtitle">{itemCount} food items detected</p>
        </div>

        {/* Meal photo */}
        <div className="result-photo-wrapper">
          <img src={image} alt={mealName} className="result-photo" />
        </div>

        {/* Macro summary row */}
        <div className="macro-row">
          <div className="macro-total">
            <div className="macro-total-value">{totalKcal}</div>
            <div className="macro-total-label">Total kcal</div>
          </div>
          <MacroStat label="Protein" value={`${protein}g`} colorClass="macro-stat-value--protein" />
          <MacroStat label="Carbs" value={`${carbs}g`} colorClass="macro-stat-value--carbs" />
          <MacroStat label="Fats" value={`${fats}g`} colorClass="macro-stat-value--fats" />
        </div>

        {/* Detected items */}
        <div className="detected-items-section">
          <h2 className="detected-items-heading">Detected Items</h2>

          <div
            className={`detected-items-list ${
              detectedItems.length > 3 ? "detected-items-list--scrollable" : ""
            }`}
          >
            {detectedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem?.(item)}
                className="detected-item-row"
              >
                <div className="detected-item-thumb">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="detected-item-info">
                  <div className="detected-item-name">{item.name}</div>
                  <div className="detected-item-meta">
                    {item.portion} &middot; {item.kcal} kcal
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="detected-item-chevron">
                  <path d="M9 6l6 6-6 6" stroke="#B7C4C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* View Details CTA */}
        <div className="view-details-wrapper">
          <button onClick={() => onViewDetails?.(result)} className="view-details-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroStat({ label, value, colorClass }) {
  return (
    <div className="macro-stat">
      <div className={`macro-stat-value ${colorClass}`}>{value}</div>
      <div className="macro-stat-label">{label}</div>
    </div>
  );
}
